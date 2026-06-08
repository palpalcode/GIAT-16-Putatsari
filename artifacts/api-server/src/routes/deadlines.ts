import { Router } from "express";
import { db } from "@workspace/db";
import { deadlinesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireEdit } from "../lib/auth";
import { CreateDeadlineBody, UpdateDeadlineBody } from "@workspace/api-zod";

const router = Router();

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

router.post("/deadlines", requireEdit("deadline"), async (req, res) => {
  try {
    const parsed = CreateDeadlineBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { title, type, dueDate, status, assignedTo, notes } = parsed.data;
    const [row] = await db.insert(deadlinesTable).values({ title, type, dueDate, status, assignedTo, notes }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/deadlines/:id", requireEdit("deadline"), async (req, res) => {
  try {
    const id = Number(req.params.id as string);
    const parsed = UpdateDeadlineBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { title, type, dueDate, status, assignedTo, notes } = parsed.data;
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

router.delete("/deadlines/:id", requireEdit("deadline"), async (req, res) => {
  try {
    await db.delete(deadlinesTable).where(eq(deadlinesTable.id, Number(req.params.id as string)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
