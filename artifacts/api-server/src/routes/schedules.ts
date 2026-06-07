import { Router } from "express";
import { db } from "@workspace/db";
import { cookingSchedulesTable, cleaningSchedulesTable, programSchedulesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireEdit } from "../lib/auth";

const router = Router();

function mapRow(row: any) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

// Cooking schedules
router.get("/schedules/cooking", async (req, res) => {
  try {
    const rows = await db.select().from(cookingSchedulesTable).orderBy(cookingSchedulesTable.date);
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/schedules/cooking", requireEdit("our-life"), async (req, res) => {
  try {
    const { date, persons, menu, notes } = req.body;
    const [row] = await db.insert(cookingSchedulesTable).values({ date, persons, menu, notes }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/schedules/cooking/:id", requireEdit("our-life"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { date, persons, menu, notes } = req.body;
    const updates: any = {};
    if (date !== undefined) updates.date = date;
    if (persons !== undefined) updates.persons = persons;
    if (menu !== undefined) updates.menu = menu;
    if (notes !== undefined) updates.notes = notes;
    const [row] = await db.update(cookingSchedulesTable).set(updates).where(eq(cookingSchedulesTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/schedules/cooking/:id", requireEdit("our-life"), async (req, res) => {
  try {
    await db.delete(cookingSchedulesTable).where(eq(cookingSchedulesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Cleaning schedules
router.get("/schedules/cleaning", async (req, res) => {
  try {
    const rows = await db.select().from(cleaningSchedulesTable).orderBy(cleaningSchedulesTable.date);
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/schedules/cleaning", requireEdit("our-life"), async (req, res) => {
  try {
    const { date, persons, area, notes } = req.body;
    const [row] = await db.insert(cleaningSchedulesTable).values({ date, persons, area, notes }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/schedules/cleaning/:id", requireEdit("our-life"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { date, persons, area, notes } = req.body;
    const updates: any = {};
    if (date !== undefined) updates.date = date;
    if (persons !== undefined) updates.persons = persons;
    if (area !== undefined) updates.area = area;
    if (notes !== undefined) updates.notes = notes;
    const [row] = await db.update(cleaningSchedulesTable).set(updates).where(eq(cleaningSchedulesTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/schedules/cleaning/:id", requireEdit("our-life"), async (req, res) => {
  try {
    await db.delete(cleaningSchedulesTable).where(eq(cleaningSchedulesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Program schedules
router.get("/schedules/programs", async (req, res) => {
  try {
    const rows = await db.select().from(programSchedulesTable).orderBy(programSchedulesTable.date);
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/schedules/programs", requireEdit("our-work"), async (req, res) => {
  try {
    const { programName, date, leader, members, status, notes } = req.body;
    const [row] = await db.insert(programSchedulesTable).values({ programName, date, leader, members, status, notes }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/schedules/programs/:id", requireEdit("our-work"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { programName, date, leader, members, status, notes } = req.body;
    const updates: any = {};
    if (programName !== undefined) updates.programName = programName;
    if (date !== undefined) updates.date = date;
    if (leader !== undefined) updates.leader = leader;
    if (members !== undefined) updates.members = members;
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    const [row] = await db.update(programSchedulesTable).set(updates).where(eq(programSchedulesTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/schedules/programs/:id", requireEdit("our-work"), async (req, res) => {
  try {
    await db.delete(programSchedulesTable).where(eq(programSchedulesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
