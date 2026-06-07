import { Router } from "express";
import { db } from "@workspace/db";
import { announcementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireEdit } from "../lib/auth";

const router = Router();

router.get("/announcements", async (req, res) => {
  try {
    const rows = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
    res.json(rows.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/announcements", requireEdit("pengumuman"), async (req, res) => {
  try {
    const { title, content, priority } = req.body;
    const [row] = await db.insert(announcementsTable).values({ title, content, priority }).returning();
    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/announcements/:id", requireEdit("pengumuman"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content, priority } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (priority !== undefined) updates.priority = priority;
    const [row] = await db.update(announcementsTable).set(updates).where(eq(announcementsTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/announcements/:id", requireEdit("pengumuman"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
