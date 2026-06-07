import { Router } from "express";
import { roleForPassword, getRole, permissionsForRole, ensureSeeded } from "../lib/auth";

const router = Router();

router.post("/auth/login", async (req, res) => {
  const { password } = req.body;
  const role = roleForPassword(password || "");
  if (!role) {
    res.status(401).json({ error: "Password salah" });
    return;
  }
  await ensureSeeded();
  (req.session as any).role = role;
  const permissions = await permissionsForRole(role);
  res.json({
    authenticated: true,
    role,
    canManage: role === "ketua",
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
  if (!role) {
    res.json({ authenticated: false, role: null, canManage: false, permissions: [] });
    return;
  }
  await ensureSeeded();
  const permissions = await permissionsForRole(role);
  res.json({ authenticated: true, role, canManage: role === "ketua", permissions });
});

export default router;
