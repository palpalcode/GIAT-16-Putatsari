import { Router } from "express";
import { db } from "@workspace/db";
import { prokerFundsTable, kasTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireEdit } from "../lib/auth";
import { CreateProkerFundBody, UpdateProkerFundBody } from "@workspace/api-zod";

const router = Router();

function mapRow(row: any) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

router.get("/proker-funds", async (req, res) => {
  try {
    const [prokers, allKas] = await Promise.all([
      db.select().from(prokerFundsTable).orderBy(prokerFundsTable.createdAt),
      db.select().from(kasTable).where(eq(kasTable.fund, "proker")),
    ]);

    const result = prokers.map(p => {
      const txs = allKas.filter(k => k.prokerId === p.id);
      const pengeluaran = txs.filter(t => t.type === "pengeluaran").reduce((s, t) => s + t.amount, 0);
      const pemasukan = txs.filter(t => t.type === "pemasukan").reduce((s, t) => s + t.amount, 0);
      return { ...mapRow(p), pengeluaran, pemasukan, sisa: p.budget - pengeluaran + pemasukan };
    });

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/proker-funds", requireEdit("kas"), async (req, res) => {
  try {
    const parsed = CreateProkerFundBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { name, budget, notes } = parsed.data;
    const [row] = await db.insert(prokerFundsTable).values({ name, budget: budget ?? 0, notes }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/proker-funds/:id", requireEdit("kas"), async (req, res) => {
  try {
    const id = Number(req.params.id as string);
    const parsed = UpdateProkerFundBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { name, budget, notes } = parsed.data;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (budget !== undefined) updates.budget = budget;
    if (notes !== undefined) updates.notes = notes;
    const [row] = await db.update(prokerFundsTable).set(updates).where(eq(prokerFundsTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/proker-funds/:id", requireEdit("kas"), async (req, res) => {
  try {
    const id = Number(req.params.id as string);
    await db.delete(kasTable).where(eq(kasTable.prokerId, id));
    await db.delete(prokerFundsTable).where(eq(prokerFundsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
