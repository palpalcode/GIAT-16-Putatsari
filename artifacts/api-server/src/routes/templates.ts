import { Router } from "express";
import { db } from "@workspace/db";
import { templatesTable } from "@workspace/db";
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

router.get("/templates", async (req, res) => {
  try {
    const rows = await db.select().from(templatesTable).orderBy(templatesTable.category, templatesTable.title);
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/templates", requireAdmin, async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const [row] = await db.insert(templatesTable).values({ title, category, content }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/templates/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, category, content } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (content !== undefined) updates.content = content;
    const [row] = await db.update(templatesTable).set(updates).where(eq(templatesTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/templates/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(templatesTable).where(eq(templatesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
