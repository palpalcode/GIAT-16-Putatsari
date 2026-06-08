import { Router } from "express";
import { getRole, getMemberId, getMemberName, permissionsForRole, ensureSeeded, ensureMembersSeeded, verifyMemberLogin } from "../lib/auth";
import { db, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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

  const permissions = await permissionsForRole(member.systemRole as any);
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

router.get("/auth/me", async (req, res) => {
  const role = getRole(req);
  const memberId = getMemberId(req);
  const memberName = getMemberName(req);

  if (!role || !memberId) {
    res.json({ authenticated: false, role: null, memberId: null, memberName: null, avatarUrl: null, canManage: false, permissions: [] });
    return;
  }

  await ensureSeeded();

  const rows = await db.select().from(membersTable).where(eq(membersTable.id, memberId));
  const member = rows[0];
  const permissions = await permissionsForRole(role as any);

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
