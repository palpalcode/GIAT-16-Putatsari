import { Router } from "express";
import { db, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getRole, getMemberId, requireLogin } from "../lib/auth";

const router = Router();

// GET /members — list all members (public, no auth needed for viewing)
router.get("/members", async (req, res) => {
  const members = await db
    .select({
      id: membersTable.id,
      name: membersTable.name,
      systemRole: membersTable.systemRole,
      divisionRole: membersTable.divisionRole,
      avatarUrl: membersTable.avatarUrl,
    })
    .from(membersTable)
    .orderBy(membersTable.id);
  res.json(members);
});

// GET /members/:id — get single member profile
router.get("/members/:id", async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID tidak valid" });
    return;
  }
  const rows = await db.select({
    id: membersTable.id,
    name: membersTable.name,
    systemRole: membersTable.systemRole,
    divisionRole: membersTable.divisionRole,
    avatarUrl: membersTable.avatarUrl,
  }).from(membersTable).where(eq(membersTable.id, id));

  if (!rows.length) {
    res.status(404).json({ error: "Anggota tidak ditemukan" });
    return;
  }
  res.json(rows[0]);
});

// PATCH /members/:id/avatar — update avatar URL (self or ketua)
router.patch("/members/:id/avatar", requireLogin, async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID tidak valid" });
    return;
  }

  const requesterId = getMemberId(req);
  const role = getRole(req);
  if (requesterId !== id && role !== "ketua") {
    res.status(403).json({ error: "Hanya bisa mengubah avatar sendiri atau dilakukan ketua" });
    return;
  }

  const { avatarUrl } = req.body;
  if (typeof avatarUrl !== "string") {
    res.status(400).json({ error: "avatarUrl wajib diisi" });
    return;
  }

  const rows = await db
    .update(membersTable)
    .set({ avatarUrl })
    .where(eq(membersTable.id, id))
    .returning({
      id: membersTable.id,
      name: membersTable.name,
      systemRole: membersTable.systemRole,
      divisionRole: membersTable.divisionRole,
      avatarUrl: membersTable.avatarUrl,
    });

  if (!rows.length) {
    res.status(404).json({ error: "Anggota tidak ditemukan" });
    return;
  }
  res.json(rows[0]);
});

export default router;
