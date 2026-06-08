import { Router } from "express";
import { getRole, getMemberId, getMemberName, getDivisionRole, permissionsForDivisionRole, ensureSeeded, ensureMembersSeeded, verifyMemberLogin, requireLogin, requireManage } from "../lib/auth";
import { db, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router = Router();

router.post("/auth/login", async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    res.status(400).json({ error: "Nama dan password wajib diisi" });
    return;
  }

  await ensureMembersSeeded();
  await ensureSeeded();

  const member = await verifyMemberLogin(name, password);
  if (!member) {
    res.status(401).json({ error: "Nama atau password salah" });
    return;
  }

  (req.session as any).memberId = member.id;
  (req.session as any).memberName = member.name;
  (req.session as any).role = member.systemRole;
  (req.session as any).divisionRole = member.divisionRole;

  const permissions = await permissionsForDivisionRole(member.divisionRole);
  res.json({
    authenticated: true,
    memberId: member.id,
    memberName: member.name,
    divisionRole: member.divisionRole,
    role: member.systemRole,
    avatarUrl: member.avatarUrl ?? null,
    canManage: member.systemRole === "ketua",
    permissions,
    message: "Login berhasil",
  });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logout berhasil" });
  });
});

router.post("/auth/change-password", requireLogin, async (req, res) => {
  const memberId = getMemberId(req);
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Password lama dan password baru wajib diisi" });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "Password baru minimal 6 karakter" });
    return;
  }

  const rows = await db.select().from(membersTable).where(eq(membersTable.id, memberId!));
  if (!rows.length) {
    res.status(404).json({ error: "Anggota tidak ditemukan" });
    return;
  }

  const valid = bcrypt.compareSync(currentPassword, rows[0].passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Password lama tidak sesuai" });
    return;
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  await db.update(membersTable).set({ passwordHash: newHash }).where(eq(membersTable.id, memberId!));
  res.json({ message: "Password berhasil diubah" });
});

router.post("/auth/change-password/:id", requireLogin, requireManage, async (req, res) => {
  const targetId = parseInt(req.params.id as string, 10);
  const { newPassword } = req.body;

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "Password baru minimal 6 karakter" });
    return;
  }

  const rows = await db.select().from(membersTable).where(eq(membersTable.id, targetId));
  if (!rows.length) {
    res.status(404).json({ error: "Anggota tidak ditemukan" });
    return;
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  await db.update(membersTable).set({ passwordHash: newHash }).where(eq(membersTable.id, targetId));
  res.json({ message: `Password ${rows[0].name} berhasil diubah` });
});

router.get("/auth/me", async (req, res) => {
  const role = getRole(req);
  const memberId = getMemberId(req);
  const memberName = getMemberName(req);
  const divisionRole = getDivisionRole(req);

  if (!role || !memberId || !divisionRole) {
    res.json({ authenticated: false, role: null, memberId: null, memberName: null, divisionRole: null, avatarUrl: null, canManage: false, permissions: [] });
    return;
  }

  await ensureSeeded();

  const rows = await db.select().from(membersTable).where(eq(membersTable.id, memberId));
  const member = rows[0];
  const permissions = await permissionsForDivisionRole(divisionRole);

  res.json({
    authenticated: true,
    memberId,
    memberName: memberName ?? member?.name ?? null,
    divisionRole: member?.divisionRole ?? null,
    role,
    avatarUrl: member?.avatarUrl ?? null,
    canManage: role === "ketua",
    permissions,
  });
});

export default router;
