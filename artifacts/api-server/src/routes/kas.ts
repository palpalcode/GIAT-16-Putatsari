import { Router } from "express";
import { db } from "@workspace/db";
import { kasTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

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

router.get("/kas", async (req, res) => {
  try {
    const rows = await db.select().from(kasTable).orderBy(desc(kasTable.date), desc(kasTable.createdAt));
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/kas", requireAdmin, async (req, res) => {
  try {
    const { type, amount, description, category, date, notes } = req.body;
    const [row] = await db.insert(kasTable).values({ type, amount, description, category, date, notes }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/kas/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { type, amount, description, category, date, notes } = req.body;
    const updates: any = {};
    if (type !== undefined) updates.type = type;
    if (amount !== undefined) updates.amount = amount;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (date !== undefined) updates.date = date;
    if (notes !== undefined) updates.notes = notes;
    const [row] = await db.update(kasTable).set(updates).where(eq(kasTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/kas/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(kasTable).where(eq(kasTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
