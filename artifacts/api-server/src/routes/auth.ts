import { Router } from "express";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "kkn2025";

router.post("/auth/login", (req, res) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Password salah" });
    return;
  }
  (req.session as any).isAdmin = true;
  res.json({ isAdmin: true, message: "Login berhasil" });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logout berhasil" });
  });
});

router.get("/auth/me", (req, res) => {
  const isAdmin = !!(req.session as any).isAdmin;
  res.json({ isAdmin });
});

export default router;
