import { Router } from "express";
import { db } from "@workspace/db";
import { issuesTable } from "@workspace/db";
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

router.get("/issues", async (req, res) => {
  try {
    const rows = await db.select().from(issuesTable).orderBy(desc(issuesTable.createdAt));
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/issues", requireAdmin, async (req, res) => {
  try {
    const { title, description, category, priority, status } = req.body;
    const [row] = await db.insert(issuesTable).values({ title, description, category, priority, status }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/issues/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, category, priority, status } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;
    const [row] = await db.update(issuesTable).set(updates).where(eq(issuesTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/issues/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(issuesTable).where(eq(issuesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
