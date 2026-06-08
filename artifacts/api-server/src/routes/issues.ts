import { Router } from "express";
import { db } from "@workspace/db";
import { issuesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireEdit } from "../lib/auth";
import { CreateIssueBody, UpdateIssueBody } from "@workspace/api-zod";

const router = Router();

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

router.post("/issues", requireEdit("masalah"), async (req, res) => {
  try {
    const parsed = CreateIssueBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { title, description, category, priority, status } = parsed.data;
    const [row] = await db.insert(issuesTable).values({ title, description, category, priority, status }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/issues/:id", requireEdit("masalah"), async (req, res) => {
  try {
    const id = Number(req.params.id as string);
    const parsed = UpdateIssueBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { title, description, category, priority, status } = parsed.data;
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

router.delete("/issues/:id", requireEdit("masalah"), async (req, res) => {
  try {
    await db.delete(issuesTable).where(eq(issuesTable.id, Number(req.params.id as string)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
