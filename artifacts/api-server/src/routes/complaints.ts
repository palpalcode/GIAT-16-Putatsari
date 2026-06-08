import { Router } from "express";
import { db } from "@workspace/db";
import { complaintsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireEdit } from "../lib/auth";

const router = Router();

function mapRow(row: any) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

router.get("/complaints", async (req, res) => {
  try {
    const rows = await db.select().from(complaintsTable).orderBy(desc(complaintsTable.createdAt));
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/complaints", requireEdit("masalah"), async (req, res) => {
  try {
    const { title, description, reportedBy, status } = req.body;
    const [row] = await db.insert(complaintsTable).values({ title, description, reportedBy, status }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/complaints/:id", requireEdit("masalah"), async (req, res) => {
  try {
    const id = Number(req.params.id as string);
    const { title, description, reportedBy, status } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (reportedBy !== undefined) updates.reportedBy = reportedBy;
    if (status !== undefined) updates.status = status;
    const [row] = await db.update(complaintsTable).set(updates).where(eq(complaintsTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/complaints/:id", requireEdit("masalah"), async (req, res) => {
  try {
    await db.delete(complaintsTable).where(eq(complaintsTable.id, Number(req.params.id as string)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
