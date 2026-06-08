import { Router } from "express";
import { db, attendanceTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getMemberName, getRole, requireLogin } from "../lib/auth";

const router = Router();

const VALID_STATUSES = ["hadir", "izin", "sakit", "alfa"] as const;

function isKetSek(req: any) {
  const role = getRole(req);
  return role === "ketua" || role === "sekretaris";
}

// GET /attendance?date=YYYY-MM-DD — list attendance, optionally filter by date
router.get("/attendance", async (req, res) => {
  try {
    const rows = await db.select().from(attendanceTable).orderBy(attendanceTable.date, attendanceTable.memberName);
    const dateFilter = typeof req.query.date === "string" ? req.query.date : null;
    const filtered = dateFilter ? rows.filter(r => r.date === dateFilter) : rows;
    res.json(filtered.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /attendance — create or upsert attendance record
router.post("/attendance", requireLogin, async (req, res) => {
  const { memberName, date, status, notes } = req.body;
  if (!memberName || !date || !status) {
    res.status(400).json({ error: "memberName, date, dan status wajib diisi" }); return;
  }
  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `status harus salah satu dari: ${VALID_STATUSES.join(", ")}` }); return;
  }
  const self = getMemberName(req);
  if (self !== memberName && !isKetSek(req)) {
    res.status(403).json({ error: "Hanya bisa mengisi absensi diri sendiri" }); return;
  }

  try {
    // upsert — if exists, update; otherwise insert
    const existing = await db.select().from(attendanceTable)
      .where(and(eq(attendanceTable.memberName, memberName), eq(attendanceTable.date, date)));
    let row;
    if (existing.length) {
      [row] = await db.update(attendanceTable).set({ status, notes: notes ?? null })
        .where(eq(attendanceTable.id, existing[0].id)).returning();
    } else {
      [row] = await db.insert(attendanceTable).values({ memberName, date, status, notes: notes ?? null }).returning();
    }
    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /attendance/:id — update attendance record (self or ketua/sekretaris)
router.patch("/attendance/:id", requireLogin, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID tidak valid" }); return; }

  const existing = await db.select().from(attendanceTable).where(eq(attendanceTable.id, id));
  if (!existing.length) { res.status(404).json({ error: "Tidak ditemukan" }); return; }

  const self = getMemberName(req);
  if (self !== existing[0].memberName && !isKetSek(req)) {
    res.status(403).json({ error: "Akses ditolak" }); return;
  }

  const { status, notes } = req.body;
  if (status && !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `status harus salah satu dari: ${VALID_STATUSES.join(", ")}` }); return;
  }

  try {
    const upd: Record<string, any> = {};
    if (status) upd.status = status;
    if (notes !== undefined) upd.notes = notes ?? null;
    const [row] = await db.update(attendanceTable).set(upd).where(eq(attendanceTable.id, id)).returning();
    res.json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /attendance/:id — ketua/sekretaris only
router.delete("/attendance/:id", requireLogin, async (req, res) => {
  if (!isKetSek(req)) {
    res.status(403).json({ error: "Hanya ketua/sekretaris yang dapat menghapus absensi" }); return;
  }
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID tidak valid" }); return; }

  try {
    await db.delete(attendanceTable).where(eq(attendanceTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
