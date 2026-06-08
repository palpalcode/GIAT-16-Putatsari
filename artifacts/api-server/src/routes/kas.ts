import { Router } from "express";
import { db } from "@workspace/db";
import { kasTable, kasConfigTable } from "@workspace/db";
import { and, eq, desc, sql } from "drizzle-orm";
import { requireEdit } from "../lib/auth";

const router = Router();

function mapRow(row: any) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

// ─── KAS TRANSACTIONS ───────────────────────────────────────────────────────

router.get("/kas", async (req, res) => {
  try {
    const { fund } = req.query as { fund?: string };
    let query = db.select().from(kasTable).$dynamic();
    if (fund && ["umum", "darurat", "iuran_makan", "proker"].includes(fund)) {
      query = query.where(eq(kasTable.fund, fund));
    }
    const rows = await query.orderBy(desc(kasTable.date), desc(kasTable.createdAt));
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/kas", requireEdit("kas"), async (req, res) => {
  try {
    const { type, amount, description, category, date, notes, fund, prokerId } = req.body;
    const [row] = await db.insert(kasTable).values({
      type, amount, description, category, date, notes,
      fund: fund ?? "umum",
      prokerId: prokerId ?? null,
    }).returning();
    res.status(201).json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/kas/:id", requireEdit("kas"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { type, amount, description, category, date, notes, fund, prokerId } = req.body;
    const updates: any = {};
    if (type !== undefined) updates.type = type;
    if (amount !== undefined) updates.amount = amount;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (date !== undefined) updates.date = date;
    if (notes !== undefined) updates.notes = notes;
    if (fund !== undefined) updates.fund = fund;
    if (prokerId !== undefined) updates.prokerId = prokerId;
    const [row] = await db.update(kasTable).set(updates).where(eq(kasTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/kas/:id", requireEdit("kas"), async (req, res) => {
  try {
    await db.delete(kasTable).where(eq(kasTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── KAS CONFIG ─────────────────────────────────────────────────────────────

async function getConfigValue(key: string, def = 0): Promise<number> {
  const [row] = await db.select().from(kasConfigTable).where(eq(kasConfigTable.key, key));
  return row ? Number(row.value) : def;
}

router.get("/kas/config", async (req, res) => {
  try {
    const [weeklyFood, emergencyTarget] = await Promise.all([
      getConfigValue("weekly_food_amount", 0),
      getConfigValue("emergency_fund_target", 0),
    ]);
    res.json({ weeklyFoodAmount: weeklyFood, emergencyFundTarget: emergencyTarget });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/kas/config", requireEdit("kas"), async (req, res) => {
  try {
    const { weeklyFoodAmount, emergencyFundTarget } = req.body;
    if (weeklyFoodAmount !== undefined) {
      await db.insert(kasConfigTable).values({ key: "weekly_food_amount", value: String(weeklyFoodAmount) })
        .onConflictDoUpdate({ target: kasConfigTable.key, set: { value: String(weeklyFoodAmount) } });
    }
    if (emergencyFundTarget !== undefined) {
      await db.insert(kasConfigTable).values({ key: "emergency_fund_target", value: String(emergencyFundTarget) })
        .onConflictDoUpdate({ target: kasConfigTable.key, set: { value: String(emergencyFundTarget) } });
    }
    const [weeklyFood, emergencyTarget] = await Promise.all([
      getConfigValue("weekly_food_amount", 0),
      getConfigValue("emergency_fund_target", 0),
    ]);
    res.json({ weeklyFoodAmount: weeklyFood, emergencyFundTarget: emergencyTarget });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── KAS SUMMARY ────────────────────────────────────────────────────────────

router.get("/kas/summary", async (req, res) => {
  try {
    const [allTx, weeklyFood, emergencyTarget] = await Promise.all([
      db.select().from(kasTable),
      getConfigValue("weekly_food_amount", 0),
      getConfigValue("emergency_fund_target", 0),
    ]);

    function saldoFund(fund: string) {
      const txs = allTx.filter(t => t.fund === fund);
      const masuk = txs.filter(t => t.type === "pemasukan").reduce((s, t) => s + t.amount, 0);
      const keluar = txs.filter(t => t.type === "pengeluaran").reduce((s, t) => s + t.amount, 0);
      return masuk - keluar;
    }

    const saldoUmum = saldoFund("umum");
    const saldoDarurat = saldoFund("darurat");
    const saldoIuranMakan = saldoFund("iuran_makan");

    const dailyFoodAllowance = weeklyFood > 0 ? Math.floor((weeklyFood * 9) / 7) : 0;

    let emergencyFundStatus: "kurang" | "cukup" | "sangat_cukup" = "kurang";
    if (emergencyTarget > 0) {
      const pct = saldoDarurat / emergencyTarget;
      if (pct >= 1) emergencyFundStatus = "sangat_cukup";
      else if (pct >= 0.5) emergencyFundStatus = "cukup";
    } else if (saldoDarurat > 0) {
      emergencyFundStatus = "sangat_cukup";
    }

    const totalPemasukan = allTx.filter(t => t.type === "pemasukan").reduce((s, t) => s + t.amount, 0);
    const totalPengeluaran = allTx.filter(t => t.type === "pengeluaran").reduce((s, t) => s + t.amount, 0);

    res.json({
      saldoUmum,
      saldoDarurat,
      saldoIuranMakan,
      weeklyFoodAmount: weeklyFood,
      emergencyFundTarget: emergencyTarget,
      dailyFoodAllowance,
      emergencyFundStatus,
      totalPemasukan,
      totalPengeluaran,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── TRANSFER SISA MAKAN ────────────────────────────────────────────────────

router.post("/kas/transfer-sisa-makan", requireEdit("kas"), async (req, res) => {
  try {
    const { date, terpakai } = req.body;
    if (!date || terpakai === undefined) {
      res.status(400).json({ error: "date dan terpakai wajib diisi" }); return;
    }

    const weeklyFood = await getConfigValue("weekly_food_amount", 0);
    const jatah = Math.floor((weeklyFood * 9) / 7);
    const sisa = jatah - Number(terpakai);

    if (sisa <= 0) {
      res.status(400).json({ error: "Tidak ada sisa untuk ditransfer (pengeluaran melebihi jatah)" }); return;
    }

    // Atomic: create pengeluaran dari iuran_makan + pemasukan ke darurat
    const [txOut, txIn] = await db.transaction(async (tx) => {
      const [out] = await tx.insert(kasTable).values({
        type: "pengeluaran", amount: sisa,
        description: `Transfer sisa makan ${date} ke dana darurat`,
        category: "lainnya", date, fund: "iuran_makan",
      }).returning();
      const [inp] = await tx.insert(kasTable).values({
        type: "pemasukan", amount: sisa,
        description: `Sisa makan ${date} dari iuran makan`,
        category: "lainnya", date, fund: "darurat",
      }).returning();
      return [out, inp];
    });

    res.status(201).json({ sisa, txOut: mapRow(txOut), txIn: mapRow(txIn) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
