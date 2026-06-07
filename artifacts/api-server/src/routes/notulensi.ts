import { Router } from "express";
import { db } from "@workspace/db";
import { notulensiTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireEdit } from "../lib/auth";

const router = Router();

function mapRow(row: typeof notulensiTable.$inferSelect) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

router.get("/notulensi", async (req, res) => {
  try {
    const rows = await db.select().from(notulensiTable).orderBy(desc(notulensiTable.meetingDate), desc(notulensiTable.createdAt));
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/notulensi/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(notulensiTable).where(eq(notulensiTable.id, id));
    if (!row) { res.status(404).json({ error: "Notulensi tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/notulensi", requireEdit("notulensi"), async (req, res) => {
  try {
    const { title, meetingDate, attendees, agenda, content, author } = req.body;
    const [row] = await db.insert(notulensiTable).values({ title, meetingDate, attendees, agenda, content, author }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/notulensi/:id", requireEdit("notulensi"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, meetingDate, attendees, agenda, content, author } = req.body;
    const updates: Partial<typeof notulensiTable.$inferInsert> = {};
    if (title !== undefined) updates.title = title;
    if (meetingDate !== undefined) updates.meetingDate = meetingDate;
    if (attendees !== undefined) updates.attendees = attendees;
    if (agenda !== undefined) updates.agenda = agenda;
    if (content !== undefined) updates.content = content;
    if (author !== undefined) updates.author = author;
    const [row] = await db.update(notulensiTable).set(updates).where(eq(notulensiTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Notulensi tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/notulensi/:id", requireEdit("notulensi"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(notulensiTable).where(eq(notulensiTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
