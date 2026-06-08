import { Router } from "express";
import { db } from "@workspace/db";
import { inventoryTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getMemberName, getDivisionRole } from "../lib/auth";

const router = Router();

function mapRow(row: any) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

function isKetSek(divisionRole: string | null) {
  return divisionRole === "Kormades" || divisionRole === "Sekretaris";
}

router.get("/inventory", async (req, res) => {
  try {
    const { type, owner } = req.query as { type?: string; owner?: string };
    const conditions: ReturnType<typeof eq>[] = [];
    if (type === "kelompok" || type === "pribadi" || type === "pinjaman") {
      conditions.push(eq(inventoryTable.itemType, type));
    }
    if (owner) {
      conditions.push(eq(inventoryTable.ownerName, owner));
    }
    const rows = await db
      .select()
      .from(inventoryTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(inventoryTable.category, inventoryTable.name);
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/inventory", async (req, res) => {
  try {
    const { name, category, quantity, unit, notes, itemType, ownerName } = req.body;
    const type: string = itemType ?? "kelompok";
    const divisionRole = getDivisionRole(req);
    const sessionName = getMemberName(req);

    if (type === "pribadi" || type === "pinjaman") {
      if (!sessionName) { res.status(401).json({ error: "Login terlebih dahulu" }); return; }
      const owner: string = ownerName ?? sessionName;
      if (owner !== sessionName && !isKetSek(divisionRole)) {
        res.status(403).json({ error: "Tidak bisa menambah barang untuk anggota lain" }); return;
      }
      const [row] = await db.insert(inventoryTable).values({
        name, category, quantity, unit, notes,
        itemType: type as "pribadi" | "pinjaman", ownerName: owner, ownerLabel: null,
      }).returning();
      res.status(201).json(mapRow(row));
    } else {
      if (!isKetSek(divisionRole)) {
        res.status(403).json({ error: "Hanya ketua/sekretaris yang dapat mengelola barang kelompok" }); return;
      }
      const [row] = await db.insert(inventoryTable).values({
        name, category, quantity, unit, notes,
        itemType: "kelompok", ownerName: null, ownerLabel: null,
      }).returning();
      res.status(201).json(mapRow(row));
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/inventory/:id", async (req, res) => {
  try {
    const id = Number(req.params.id as string);
    const divisionRole = getDivisionRole(req);
    const sessionName = getMemberName(req);
    const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, id));
    if (!item) { res.status(404).json({ error: "Tidak ditemukan" }); return; }

    if (item.itemType === "pribadi" || item.itemType === "pinjaman") {
      if (!sessionName) { res.status(401).json({ error: "Login terlebih dahulu" }); return; }
      if (sessionName !== item.ownerName && !isKetSek(divisionRole)) {
        res.status(403).json({ error: "Hanya pemilik atau ketua/sekretaris yang dapat mengubah barang ini" }); return;
      }
    } else {
      if (!isKetSek(divisionRole)) {
        res.status(403).json({ error: "Hanya ketua/sekretaris yang dapat mengelola barang kelompok" }); return;
      }
    }

    const { name, category, quantity, unit, notes, ownerName } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (quantity !== undefined) updates.quantity = quantity;
    if (unit !== undefined) updates.unit = unit;
    if (notes !== undefined) updates.notes = notes;
    if (ownerName !== undefined && (item.itemType === "pribadi" || item.itemType === "pinjaman")) {
      if (ownerName === sessionName || isKetSek(divisionRole)) updates.ownerName = ownerName;
    }

    const [row] = await db.update(inventoryTable).set(updates).where(eq(inventoryTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    res.json(mapRow(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/inventory/:id", async (req, res) => {
  try {
    const id = Number(req.params.id as string);
    const divisionRole = getDivisionRole(req);
    const sessionName = getMemberName(req);
    const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, id));
    if (!item) { res.status(404).json({ error: "Tidak ditemukan" }); return; }

    if (item.itemType === "pribadi" || item.itemType === "pinjaman") {
      if (!sessionName) { res.status(401).json({ error: "Login terlebih dahulu" }); return; }
      if (sessionName !== item.ownerName && !isKetSek(divisionRole)) {
        res.status(403).json({ error: "Hanya pemilik atau ketua/sekretaris yang dapat menghapus barang ini" }); return;
      }
    } else {
      if (!isKetSek(divisionRole)) {
        res.status(403).json({ error: "Hanya ketua/sekretaris yang dapat mengelola barang kelompok" }); return;
      }
    }

    await db.delete(inventoryTable).where(eq(inventoryTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
