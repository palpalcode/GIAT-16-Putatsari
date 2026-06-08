import { Router } from "express";
import { db } from "@workspace/db";
import { templatesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireEdit } from "../lib/auth";
import { CreateTemplateBody, UpdateTemplateBody } from "@workspace/api-zod";

const router = Router();

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

router.post("/templates", requireEdit("our-work"), async (req, res) => {
  try {
    const parsed = CreateTemplateBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { title, category, content } = parsed.data;
    const [row] = await db.insert(templatesTable).values({ title, category, content }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/templates/:id", requireEdit("our-work"), async (req, res) => {
  try {
    const id = Number(req.params.id as string);
    const parsed = UpdateTemplateBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { title, category, content } = parsed.data;
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

router.delete("/templates/:id", requireEdit("our-work"), async (req, res) => {
  try {
    await db.delete(templatesTable).where(eq(templatesTable.id, Number(req.params.id as string)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
