import { Router } from "express";
import { db, attendanceTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getMemberName, getRole, requireLogin } from "../lib/auth";
import * as XLSX from "xlsx";

const router = Router();

const VALID_STATUSES = ["hadir", "izin", "sakit", "alfa"] as const;

const MEMBERS = [
  "Muhamad Naufal", "Fadhilah Apta Nur Safitri", "Lutfia Tri Rahmacahyani",
  "Navida Fitria", "Miftakhul Jannah", "Vrizcka Aullia Asmara",
  "Quro'atul A'ini", "Dewi Anita Sari", "Tiara Nuril Safitri",
];

function isKetSek(req: any) {
  const role = getRole(req);
  return role === "ketua" || role === "sekretaris";
}

const STATUS_LABELS: Record<string, string> = {
  hadir: "H",
  izin: "I",
  sakit: "S",
  alfa: "A",
};

function getWeekDates(start: string, weekIndex: number): string[] {
  const startDate = new Date(start);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + weekIndex * 7 + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function getWeekLabel(dates: string[]): string {
  const s = new Date(dates[0]).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const e = new Date(dates[6]).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return `Week ${s} – ${e}`;
}

function buildWeekSheet(rows: { memberName: string; date: string; status: string }[], dates: string[]) {
  const rowsByMember: Record<string, Record<string, string>> = {};
  for (const m of MEMBERS) {
    rowsByMember[m] = {};
    for (const d of dates) rowsByMember[m][d] = "";
  }
  for (const r of rows) {
    if (rowsByMember[r.memberName] && dates.includes(r.date)) {
      rowsByMember[r.memberName][r.date] = STATUS_LABELS[r.status] ?? r.status;
    }
  }

  const data: (string | number)[][] = [];
  data.push(["No", "Nama", ...dates.map(d => {
    const day = new Date(d).toLocaleDateString("id-ID", { weekday: "short" });
    const num = new Date(d).getDate();
    return `${day} ${num}`;
  }), "Hadir", "Izin", "Sakit", "Alfa", "Total" ]);

  for (let i = 0; i < MEMBERS.length; i++) {
    const m = MEMBERS[i];
    const cells = dates.map(d => rowsByMember[m][d] ?? "");
    const hadir = cells.filter(c => c === "H").length;
    const izin = cells.filter(c => c === "I").length;
    const sakit = cells.filter(c => c === "S").length;
    const alfa = cells.filter(c => c === "A").length;
    const total = hadir + izin + sakit + alfa;
    data.push([i + 1, m, ...cells, hadir, izin, sakit, alfa, total]);
  }

  // Totals row
  const totals: (string | number)[] = ["", "TOTAL"];
  for (const d of dates) {
    let dayHadir = 0;
    for (const m of MEMBERS) {
      if (rowsByMember[m][d] === "H") dayHadir++;
    }
    totals.push(dayHadir);
  }
  let totalHadir = 0, totalIzin = 0, totalSakit = 0, totalAlfa = 0, totalAll = 0;
  for (let i = 0; i < MEMBERS.length; i++) {
    const row = data[i + 1];
    totalHadir += Number(row[row.length - 5]);
    totalIzin += Number(row[row.length - 4]);
    totalSakit += Number(row[row.length - 3]);
    totalAlfa += Number(row[row.length - 2]);
    totalAll += Number(row[row.length - 1]);
  }
  totals.push(totalHadir, totalIzin, totalSakit, totalAlfa, totalAll);
  data.push(totals);

  return data;
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

// GET /attendance/export — export all attendance records as multi-week Excel workbook
router.get("/attendance/export", async (req, res) => {
  try {
    const rows = await db.select().from(attendanceTable).orderBy(attendanceTable.date, attendanceTable.memberName);
    const startDate = typeof req.query.start === "string" ? req.query.start : "2026-06-15";
    const weekCount = typeof req.query.weeks === "string" ? parseInt(req.query.weeks, 10) : 7;
    const validWeeks = Number.isNaN(weekCount) || weekCount < 1 ? 7 : Math.min(weekCount, 52);

    const wb = XLSX.utils.book_new();
    const flatRows = rows.map(r => ({ memberName: r.memberName, date: r.date, status: r.status }));

    for (let w = 0; w < validWeeks; w++) {
      const dates = getWeekDates(startDate, w);
      const sheetData = buildWeekSheet(flatRows, dates);
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, getWeekLabel(dates));
    }

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", `attachment; filename="absensi-kkn-${startDate}.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buf);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
