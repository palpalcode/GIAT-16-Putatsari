import { Router } from "express";
import { db } from "@workspace/db";
import { inventoryTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getMemberName, getRole, canEdit } from "../lib/auth";

const router = Router();

function mapRow(row: any) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

function isPrivileged(role: string | null) {
  return role === "ketua" || role === "sekretaris" || role === "bendahara";
}

router.get("/inventory", async (req, res) => {
  try {
    const { type, owner } = req.query as { type?: string; owner?: string };
    const conditions: ReturnType<typeof eq>[] = [];
    if (type === "kelompok" || type === "pribadi") {
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
    const { name, category, quantity, unit, notes, itemType, ownerName, ownerLabel } = req.body;
    const type: string = itemType ?? "kelompok";
    const role = getRole(req);
    const sessionName = getMemberName(req);

    if (type === "pribadi") {
      if (!sessionName) { res.status(401).json({ error: "Login terlebih dahulu" }); return; }
      const owner: string = ownerName ?? sessionName;
      if (owner !== sessionName && !isPrivileged(role)) {
        res.status(403).json({ error: "Tidak bisa menambah barang untuk anggota lain" }); return;
      }
      const [row] = await db.insert(inventoryTable).values({
        name, category, quantity, unit, notes,
        itemType: "pribadi", ownerName: owner, ownerLabel: null,
      }).returning();
      res.status(201).json(mapRow(row));
    } else {
      if (!(await canEdit(role, "our-life"))) {
        res.status(403).json({ error: "Akses ditolak" }); return;
      }
      const [row] = await db.insert(inventoryTable).values({
        name, category, quantity, unit, notes,
        itemType: "kelompok", ownerName: ownerName ?? null, ownerLabel: ownerLabel ?? null,
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
    const id = Number(req.params.id);
    const role = getRole(req);
    const sessionName = getMemberName(req);
    const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, id));
    if (!item) { res.status(404).json({ error: "Tidak ditemukan" }); return; }

    if (item.itemType === "pribadi") {
      if (!sessionName) { res.status(401).json({ error: "Login terlebih dahulu" }); return; }
      if (sessionName !== item.ownerName && !isPrivileged(role)) {
        res.status(403).json({ error: "Hanya pemilik atau pengurus yang dapat mengubah barang pribadi" }); return;
      }
    } else {
      if (!(await canEdit(role, "our-life"))) {
        res.status(403).json({ error: "Akses ditolak" }); return;
      }
    }

    const { name, category, quantity, unit, notes, ownerName, ownerLabel } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (quantity !== undefined) updates.quantity = quantity;
    if (unit !== undefined) updates.unit = unit;
    if (notes !== undefined) updates.notes = notes;
    if (ownerName !== undefined) updates.ownerName = ownerName;
    if (ownerLabel !== undefined) updates.ownerLabel = ownerLabel;

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
    const id = Number(req.params.id);
    const role = getRole(req);
    const sessionName = getMemberName(req);
    const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, id));
    if (!item) { res.status(404).json({ error: "Tidak ditemukan" }); return; }

    if (item.itemType === "pribadi") {
      if (!sessionName) { res.status(401).json({ error: "Login terlebih dahulu" }); return; }
      if (sessionName !== item.ownerName && !isPrivileged(role)) {
        res.status(403).json({ error: "Hanya pemilik atau pengurus yang dapat menghapus barang pribadi" }); return;
      }
    } else {
      if (!(await canEdit(role, "our-life"))) {
        res.status(403).json({ error: "Akses ditolak" }); return;
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
