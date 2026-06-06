import { Router } from "express";
import { db } from "@workspace/db";
import { deadlinesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (!(req.session as any).isAdmin) {
    res.status(403).json({ error: "Akses ditolak" });
    return;
  }
  next();
}

function mapRow(row: any) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

router.get("/deadlines", async (req, res) => {
  try {
    const rows = await db.select().from(deadlinesTable).orderBy(deadlinesTable.dueDate);
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/deadlines", requireAdmin, async (req, res) => {
  try {
    const { title, type, dueDate, status, assignedTo, notes } = req.body;
    const [row] = await db.insert(deadlinesTable).values({ title, type, dueDate, status, assignedTo, notes }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/deadlines/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, type, dueDate, status, assignedTo, notes } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (type !== undefined) updates.type = type;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (status !== undefined) updates.status = status;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (notes !== undefined) updates.notes = notes;
    const [row] = await db.update(deadlinesTable).set(updates).where(eq(deadlinesTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/deadlines/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(deadlinesTable).where(eq(deadlinesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
