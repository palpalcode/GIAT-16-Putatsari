import { Router } from "express";
import { db } from "@workspace/db";
import { inventoryTable, itemCatalogTable } from "@workspace/db";
import { and, eq, ilike } from "drizzle-orm";
import { getMemberName, getDivisionRole } from "../lib/auth";

const router = Router();

function mapRow(row: any) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

function isKetSek(divisionRole: string | null) {
  return divisionRole === "Kormades" || divisionRole === "Sekretaris";
}

const VALID_CATALOG_CATEGORIES = ["alat_kebersihan", "alat_masak", "alat_makan", "alat_tulis", "alat_elektronik", "pakaian", "stock_makanan", "device"] as const;
type CatalogCategory = typeof VALID_CATALOG_CATEGORIES[number];

function isValidCatalogCategory(cat: unknown): cat is CatalogCategory {
  return VALID_CATALOG_CATEGORIES.includes(cat as CatalogCategory);
}

// ─── CATALOG ROUTES (must come before /:id routes) ───────────────────────────

router.get("/inventory/catalog", async (req, res) => {
  try {
    const { category } = req.query as { category?: string };
    const conditions: ReturnType<typeof eq>[] = [];
    if (category) {
      conditions.push(eq(itemCatalogTable.category, category));
    }
    const rows = await db
      .select()
      .from(itemCatalogTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(itemCatalogTable.category, itemCatalogTable.name);
    res.json(rows.map(mapRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/inventory/catalog", async (req, res) => {
  try {
    const divisionRole = getDivisionRole(req);
    if (!isKetSek(divisionRole)) {
      res.status(403).json({ error: "Hanya ketua/sekretaris yang dapat mengelola katalog" });
      return;
    }
    const { name, category, unit } = req.body;
    if (!name?.trim() || !category || !unit?.trim()) {
      res.status(400).json({ error: "name, category, dan unit wajib diisi" });
      return;
    }
    if (!isValidCatalogCategory(category)) {
      res.status(400).json({ error: `category tidak valid. Pilihan: ${VALID_CATALOG_CATEGORIES.join(", ")}` });
      return;
    }
    try {
      const [row] = await db.insert(itemCatalogTable).values({ name: name.trim(), category, unit: unit.trim() }).returning();
      res.status(201).json(mapRow(row));
    } catch (e: any) {
      if (e?.code === "23505") {
        res.status(409).json({ error: "Nama barang sudah ada di katalog" });
        return;
      }
      throw e;
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/inventory/catalog/:id", async (req, res) => {
  try {
    const divisionRole = getDivisionRole(req);
    if (!isKetSek(divisionRole)) {
      res.status(403).json({ error: "Hanya ketua/sekretaris yang dapat mengelola katalog" });
      return;
    }
    const id = Number(req.params.id as string);
    const { name, category, unit } = req.body;
    if (!name?.trim() || !category || !unit?.trim()) {
      res.status(400).json({ error: "name, category, dan unit wajib diisi" });
      return;
    }
    if (!isValidCatalogCategory(category)) {
      res.status(400).json({ error: `category tidak valid. Pilihan: ${VALID_CATALOG_CATEGORIES.join(", ")}` });
      return;
    }
    try {
      const [row] = await db
        .update(itemCatalogTable)
        .set({ name: name.trim(), category, unit: unit.trim() })
        .where(eq(itemCatalogTable.id, id))
        .returning();
      if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
      res.json(mapRow(row));
    } catch (e: any) {
      if (e?.code === "23505") {
        res.status(409).json({ error: "Nama barang sudah ada di katalog" });
        return;
      }
      throw e;
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/inventory/catalog/:id", async (req, res) => {
  try {
    const divisionRole = getDivisionRole(req);
    if (!isKetSek(divisionRole)) {
      res.status(403).json({ error: "Hanya ketua/sekretaris yang dapat mengelola katalog" });
      return;
    }
    const id = Number(req.params.id as string);
    const [row] = await db.select().from(itemCatalogTable).where(eq(itemCatalogTable.id, id));
    if (!row) { res.status(404).json({ error: "Tidak ditemukan" }); return; }
    await db.delete(itemCatalogTable).where(eq(itemCatalogTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── INVENTORY ROUTES ─────────────────────────────────────────────────────────

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

async function resolveCatalogName(name: string | undefined): Promise<{ name: string; unit: string } | null> {
  const [entry] = await db
    .select()
    .from(itemCatalogTable)
    .where(ilike(itemCatalogTable.name, (name ?? "").trim()))
    .limit(1);
  return entry ? { name: entry.name, unit: entry.unit } : null;
}

router.post("/inventory", async (req, res) => {
  try {
    const { name, category, quantity, unit, notes, itemType, ownerName } = req.body;
    const type: string = itemType ?? "kelompok";
    const divisionRole = getDivisionRole(req);
    const sessionName = getMemberName(req);

    const catalogEntry = await resolveCatalogName(name);
    if (!catalogEntry) {
      res.status(400).json({ error: "Nama barang harus dipilih dari katalog yang tersedia" });
      return;
    }

    const resolvedUnit = (isKetSek(divisionRole) && unit?.trim()) ? unit.trim() : catalogEntry.unit;

    if (type === "pribadi" || type === "pinjaman") {
      if (!sessionName) { res.status(401).json({ error: "Login terlebih dahulu" }); return; }
      const owner: string = ownerName ?? sessionName;
      if (owner !== sessionName && !isKetSek(divisionRole)) {
        res.status(403).json({ error: "Tidak bisa menambah barang untuk anggota lain" }); return;
      }
      const [row] = await db.insert(inventoryTable).values({
        name: catalogEntry.name, category, quantity, unit: resolvedUnit, notes,
        itemType: type as "pribadi" | "pinjaman", ownerName: owner, ownerLabel: null,
      }).returning();
      res.status(201).json(mapRow(row));
    } else {
      if (!isKetSek(divisionRole)) {
        res.status(403).json({ error: "Hanya ketua/sekretaris yang dapat mengelola barang kelompok" }); return;
      }
      const [row] = await db.insert(inventoryTable).values({
        name: catalogEntry.name, category, quantity, unit: resolvedUnit, notes,
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
    if (category !== undefined) updates.category = category;
    if (quantity !== undefined) updates.quantity = quantity;
    if (notes !== undefined) updates.notes = notes;
    if (ownerName !== undefined && (item.itemType === "pribadi" || item.itemType === "pinjaman")) {
      if (ownerName === sessionName || isKetSek(divisionRole)) updates.ownerName = ownerName;
    }

    if (name !== undefined) {
      const lookupName: string = (name ?? item.name ?? "").trim();
      if (lookupName) {
        const catalogEntry = await resolveCatalogName(lookupName);
        if (!catalogEntry) {
          res.status(400).json({ error: "Nama barang harus dipilih dari katalog yang tersedia" });
          return;
        }
        updates.name = catalogEntry.name;
        updates.unit = (isKetSek(divisionRole) && unit?.trim()) ? unit.trim() : catalogEntry.unit;
      }
    } else if (unit !== undefined && isKetSek(divisionRole) && unit.trim()) {
      updates.unit = unit.trim();
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
