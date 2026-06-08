import { Router } from "express";
import { db } from "@workspace/db";
import { kasTable, kasItemsTable, kasConfigTable, iuranMakanPaymentsTable } from "@workspace/db";
import { and, eq, desc, inArray, sql, sum } from "drizzle-orm";
import { requireEdit } from "../lib/auth";
import {
  CreateKasBody, UpdateKasBody, UpdateKasConfigBody,
  CreateIuranPaymentBody, TransferSisaMakanBody,
} from "@workspace/api-zod";

const router = Router();

function mapRow(row: any, items: any[] = []) {
  return { ...row, createdAt: row.createdAt.toISOString(), items };
}

function todayWIB() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
}

async function getFundBalance(fund: string): Promise<number> {
  const rows = await db.select().from(kasTable).where(eq(kasTable.fund, fund));
  const pemasukan = rows.filter(t => t.type === "pemasukan").reduce((s, t) => s + t.amount, 0);
  const pengeluaran = rows.filter(t => t.type === "pengeluaran").reduce((s, t) => s + t.amount, 0);
  return pemasukan - pengeluaran;
}

async function fetchItemsForIds(ids: number[]): Promise<Record<number, any[]>> {
  if (ids.length === 0) return {};
  const rows = await db.select().from(kasItemsTable).where(inArray(kasItemsTable.kasId, ids));
  const map: Record<number, any[]> = {};
  for (const r of rows) {
    if (!map[r.kasId]) map[r.kasId] = [];
    map[r.kasId].push(r);
  }
  return map;
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
    const itemsMap = await fetchItemsForIds(rows.map(r => r.id));
    res.json(rows.map(r => mapRow(r, itemsMap[r.id] ?? [])));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/kas", requireEdit("kas"), async (req, res) => {
  try {
    const parsed = CreateKasBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { type, amount, description, category, date, notes, fund, prokerId, items } = parsed.data;
    const targetFund = fund ?? "umum";
    if (type === "pengeluaran") {
      const balance = await getFundBalance(targetFund);
      if (amount > balance) {
        res.status(400).json({ error: "Saldo tidak mencukupi", available: balance, requested: amount });
        return;
      }
    }
    const { row, insertedItems } = await db.transaction(async (tx) => {
      const [row] = await tx.insert(kasTable).values({
        type, amount, description, category, date, notes,
        fund: targetFund,
        prokerId: prokerId ?? null,
      }).returning();
      let insertedItems: any[] = [];
      if (Array.isArray(items) && items.length > 0) {
        insertedItems = await tx.insert(kasItemsTable)
          .values(items.map((it: any) => ({ kasId: row.id, name: it.name, amount: it.amount })))
          .returning();
      }
      return { row, insertedItems };
    });
    res.status(201).json(mapRow(row, insertedItems));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/kas/:id", requireEdit("kas"), async (req, res) => {
  try {
    const id = Number(req.params.id as string);
    const parsed = UpdateKasBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { type, amount, description, category, date, notes, fund, prokerId, items } = parsed.data;
    const updates: any = {};
    if (type !== undefined) updates.type = type;
    if (amount !== undefined) updates.amount = amount;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (date !== undefined) updates.date = date;
    if (notes !== undefined) updates.notes = notes;
    if (fund !== undefined) updates.fund = fund;
    if (prokerId !== undefined) updates.prokerId = prokerId;

    const { row, finalItems } = await db.transaction(async (tx) => {
      const [row] = await tx.update(kasTable).set(updates).where(eq(kasTable.id, id)).returning();
      if (!row) return { row: null, finalItems: [] };
      let finalItems: any[] = [];
      if (Array.isArray(items)) {
        await tx.delete(kasItemsTable).where(eq(kasItemsTable.kasId, id));
        if (items.length > 0) {
          finalItems = await tx.insert(kasItemsTable)
            .values(items.map((it: any) => ({ kasId: id, name: it.name, amount: it.amount })))
            .returning();
        }
      } else {
        finalItems = await tx.select().from(kasItemsTable).where(eq(kasItemsTable.kasId, id));
      }
      return { row, finalItems };
    });
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row, finalItems));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/kas/:id", requireEdit("kas"), async (req, res) => {
  try {
    // cascade handles kasItemsTable rows via FK
    await db.delete(kasTable).where(eq(kasTable.id, Number(req.params.id as string)));
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
    const parsed = UpdateKasConfigBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { weeklyFoodAmount, emergencyFundTarget } = parsed.data;
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
      saldoUmum, saldoDarurat, saldoIuranMakan,
      weeklyFoodAmount: weeklyFood, emergencyFundTarget: emergencyTarget,
      dailyFoodAllowance, emergencyFundStatus, totalPemasukan, totalPengeluaran,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── IURAN MAKAN PAYMENTS ───────────────────────────────────────────────────

router.get("/kas/iuran-payments/summary", async (req, res) => {
  try {
    const rows = await db
      .select({
        memberName: iuranMakanPaymentsTable.memberName,
        totalPaid: sum(iuranMakanPaymentsTable.amount),
        weekCount: sql<number>`count(*)::int`,
      })
      .from(iuranMakanPaymentsTable)
      .groupBy(iuranMakanPaymentsTable.memberName)
      .orderBy(iuranMakanPaymentsTable.memberName);
    res.json(rows.map(r => ({ ...r, totalPaid: Number(r.totalPaid ?? 0) })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/kas/iuran-payments", async (req, res) => {
  try {
    const { week } = req.query as { week?: string };
    if (!week) { res.status(400).json({ error: "week wajib diisi" }); return; }
    const rows = await db
      .select()
      .from(iuranMakanPaymentsTable)
      .where(eq(iuranMakanPaymentsTable.weekLabel, week))
      .orderBy(iuranMakanPaymentsTable.memberName);
    res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/kas/iuran-payments", requireEdit("kas"), async (req, res) => {
  try {
    const parsed = CreateIuranPaymentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { memberName, weekLabel, amount, notes } = parsed.data;
    const [row] = await db
      .insert(iuranMakanPaymentsTable)
      .values({ memberName, weekLabel, amount: Number(amount), notes: notes ?? null })
      .onConflictDoNothing()
      .returning();
    if (!row) { res.status(409).json({ error: "Sudah tercatat sebagai sudah bayar" }); return; }
    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/kas/iuran-payments/:id", requireEdit("kas"), async (req, res) => {
  try {
    await db
      .delete(iuranMakanPaymentsTable)
      .where(eq(iuranMakanPaymentsTable.id, Number(req.params.id as string)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── TRANSFER SISA MAKAN ────────────────────────────────────────────────────

router.post("/kas/transfer-sisa-makan", requireEdit("kas"), async (req, res) => {
  try {
    const parsed = TransferSisaMakanBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Data tidak valid", details: parsed.error.flatten() });
      return;
    }
    const { date, terpakai } = parsed.data;

    const weeklyFood = await getConfigValue("weekly_food_amount", 0);
    const jatah = Math.floor((weeklyFood * 9) / 7);
    const sisa = jatah - Number(terpakai);

    if (sisa <= 0) {
      res.status(400).json({ error: "Tidak ada sisa untuk ditransfer" }); return;
    }

    const iuranBalance = await getFundBalance("iuran_makan");
    if (sisa > iuranBalance) {
      res.status(400).json({ error: "Saldo iuran makan tidak mencukupi", available: iuranBalance, requested: sisa });
      return;
    }

    const existing = await db.select().from(kasTable).where(
      and(eq(kasTable.fund, "iuran_makan"), eq(kasTable.type, "pengeluaran"), eq(kasTable.description, `Transfer sisa makan ${date} ke dana darurat`))
    );
    if (existing.length > 0) {
      res.status(409).json({ error: "Transfer sisa untuk tanggal ini sudah dilakukan" }); return;
    }

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
