import { Router } from "express";
import { db } from "@workspace/db";
import { inventoryTable } from "@workspace/db";
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

router.get("/inventory", async (req, res) => {
  try {
    const rows = await db.select().from(inventoryTable).orderBy(inventoryTable.category, inventoryTable.name);
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/inventory", requireAdmin, async (req, res) => {
  try {
    const { name, category, quantity, unit, notes } = req.body;
    const [row] = await db.insert(inventoryTable).values({ name, category, quantity, unit, notes }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/inventory/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, category, quantity, unit, notes } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (quantity !== undefined) updates.quantity = quantity;
    if (unit !== undefined) updates.unit = unit;
    if (notes !== undefined) updates.notes = notes;
    const [row] = await db.update(inventoryTable).set(updates).where(eq(inventoryTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/inventory/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(inventoryTable).where(eq(inventoryTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
