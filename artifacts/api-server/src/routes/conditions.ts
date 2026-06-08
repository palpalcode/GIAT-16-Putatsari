import { Router } from "express";
import { db, memberConditionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getMemberName, getRole, requireLogin } from "../lib/auth";
import { CreateConditionBody, UpdateConditionBody } from "@workspace/api-zod";

const router = Router();

function canManageCondition(req: any, ownerName: string): boolean {
  const role = getRole(req);
  const memberName = getMemberName(req);
  return memberName === ownerName || role === "ketua" || role === "sekretaris";
}

// GET /conditions — public list of all member conditions
router.get("/conditions", requireLogin, async (req, res) => {
  try {
    const rows = await db.select().from(memberConditionsTable).orderBy(memberConditionsTable.memberName, memberConditionsTable.type);
    res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /conditions — add a condition entry (self or ketua/sekretaris)
router.post("/conditions", requireLogin, async (req, res) => {
  const parsed = CreateConditionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
    return;
  }
  const { memberName, type, description } = parsed.data;
  if (!canManageCondition(req, memberName)) {
    res.status(403).json({ error: "Hanya diri sendiri, ketua, atau sekretaris yang dapat menambah kondisi" });
    return;
  }
  try {
    const [row] = await db.insert(memberConditionsTable).values({ memberName, type, description }).returning();
    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /conditions/:id — update a condition entry
router.patch("/conditions/:id", requireLogin, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID tidak valid" }); return; }

  const existing = await db.select().from(memberConditionsTable).where(eq(memberConditionsTable.id, id));
  if (!existing.length) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
  if (!canManageCondition(req, existing[0].memberName)) {
    res.status(403).json({ error: "Akses ditolak" }); return;
  }

  const parsedPatch = UpdateConditionBody.safeParse(req.body);
  if (!parsedPatch.success) {
    res.status(400).json({ error: "Data tidak valid", details: parsedPatch.error.flatten() });
    return;
  }
  const { type, description } = parsedPatch.data;

  try {
    const update: Record<string, string> = {};
    if (type) update.type = type;
    if (description) update.description = description;
    const [row] = await db.update(memberConditionsTable).set(update).where(eq(memberConditionsTable.id, id)).returning();
    res.json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /conditions/:id — delete a condition entry
router.delete("/conditions/:id", requireLogin, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID tidak valid" }); return; }

  const existing = await db.select().from(memberConditionsTable).where(eq(memberConditionsTable.id, id));
  if (!existing.length) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
  if (!canManageCondition(req, existing[0].memberName)) {
    res.status(403).json({ error: "Akses ditolak" }); return;
  }

  try {
    await db.delete(memberConditionsTable).where(eq(memberConditionsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
