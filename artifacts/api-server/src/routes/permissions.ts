import { Router } from "express";
import { db, permissionsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { requireManage, ensureSeeded, isResource, isManagedRole } from "../lib/auth";

const router = Router();

router.get("/permissions", requireManage, async (req, res) => {
  try {
    await ensureSeeded();
    const rows = await db.select().from(permissionsTable);
    res.json(rows.map((r) => ({ role: r.role, resource: r.resource, canEdit: r.canEdit })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/permissions", requireManage, async (req, res) => {
  try {
    const { role, resource, canEdit } = req.body;
    if (typeof role !== "string" || typeof resource !== "string" || typeof canEdit !== "boolean") {
      res.status(400).json({ error: "Data tidak valid" });
      return;
    }
    if (!isManagedRole(role) || !isResource(resource)) {
      res.status(400).json({ error: "Role atau resource tidak valid" });
      return;
    }
    const existing = await db
      .select()
      .from(permissionsTable)
      .where(and(eq(permissionsTable.role, role), eq(permissionsTable.resource, resource)));
    if (existing.length > 0) {
      await db
        .update(permissionsTable)
        .set({ canEdit })
        .where(and(eq(permissionsTable.role, role), eq(permissionsTable.resource, resource)));
    } else {
      await db.insert(permissionsTable).values({ role, resource, canEdit });
    }
    res.json({ role, resource, canEdit });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
