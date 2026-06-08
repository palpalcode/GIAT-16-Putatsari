import type { Request, Response, NextFunction } from "express";
import { db, permissionsTable, membersTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export type Role = "ketua" | "sekretaris" | "bendahara" | "anggota";

export const RESOURCES = [
  "pengumuman",
  "deadline",
  "our-life",
  "our-work",
  "masalah",
  "kas",
  "notulensi",
] as const;
export type Resource = (typeof RESOURCES)[number];

export const RESOURCE_LABELS: Record<Resource, string> = {
  pengumuman: "Pengumuman",
  deadline: "Deadline",
  "our-life": "Our Life",
  "our-work": "Our Work",
  masalah: "Masalah",
  kas: "Kas",
  notulensi: "Notulensi",
};

export const ROLE_LABELS: Record<Role, string> = {
  ketua: "Ketua",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  anggota: "Anggota",
};

// Roles whose edit access is controlled by the ketua.
export const MANAGED_ROLES: Array<"sekretaris" | "bendahara"> = ["bendahara", "sekretaris"];

export function getRole(req: Request): Role | null {
  return ((req.session as any).role as Role) || null;
}

export function getMemberId(req: Request): number | null {
  return ((req.session as any).memberId as number) || null;
}

export function getMemberName(req: Request): string | null {
  return ((req.session as any).memberName as string) || null;
}

export function isResource(value: string): value is Resource {
  return (RESOURCES as readonly string[]).includes(value);
}

export function isManagedRole(value: string): boolean {
  return MANAGED_ROLES.includes(value as "sekretaris" | "bendahara");
}

// Ketua always has full access; sekretaris & bendahara are per-DB; anggota has no edit access.
export async function canEdit(role: Role | null, resource: Resource): Promise<boolean> {
  if (!role) return false;
  if (role === "ketua") return true;
  if (role === "anggota") return false;
  const rows = await db
    .select()
    .from(permissionsTable)
    .where(and(eq(permissionsTable.role, role), eq(permissionsTable.resource, resource)));
  return rows.length > 0 ? rows[0].canEdit : false;
}

export async function permissionsForRole(role: Role): Promise<Resource[]> {
  if (role === "ketua") return [...RESOURCES];
  if (role === "anggota") return [];
  const rows = await db.select().from(permissionsTable).where(eq(permissionsTable.role, role));
  const granted = new Map(rows.map((r) => [r.resource, r.canEdit]));
  return RESOURCES.filter((r) => granted.get(r) === true);
}

// Make sure every managed role has a row per resource so the management grid is complete.
export async function ensureSeeded(): Promise<void> {
  for (const role of MANAGED_ROLES) {
    const existing = await db.select().from(permissionsTable).where(eq(permissionsTable.role, role));
    const have = new Set(existing.map((r) => r.resource));
    for (const resource of RESOURCES) {
      if (!have.has(resource)) {
        await db.insert(permissionsTable).values({ role, resource, canEdit: false });
      }
    }
  }
}

// Seed all 9 members if they don't exist yet.
export async function ensureMembersSeeded(): Promise<void> {
  const existing = await db.select().from(membersTable);
  if (existing.length > 0) return;

  const members: Array<{ name: string; systemRole: Role; divisionRole: string; password: string }> = [
    { name: "Muhamad Naufal", systemRole: "ketua", divisionRole: "Kormades", password: "pastword" },
    { name: "Fadhilah Apta Nur Safitri", systemRole: "sekretaris", divisionRole: "Sekretaris", password: "secre_secret" },
    { name: "Lutfia Tri Rahmacahyani", systemRole: "bendahara", divisionRole: "Bendahara", password: "purbaya_effect" },
    { name: "Navida Fitria", systemRole: "anggota", divisionRole: "Acara", password: "navida123" },
    { name: "Miftakhul Jannah", systemRole: "anggota", divisionRole: "Acara", password: "miftakhul123" },
    { name: "Vrizcka Aullia Asmara", systemRole: "anggota", divisionRole: "Humas", password: "vrizcka123" },
    { name: "Quro'atul A'ini", systemRole: "anggota", divisionRole: "Humas", password: "quroa123" },
    { name: "Dewi Anita Sari", systemRole: "anggota", divisionRole: "PDD", password: "dewi123" },
    { name: "Tiara Nuril Safitri", systemRole: "anggota", divisionRole: "PDD", password: "tiara123" },
  ];

  for (const m of members) {
    const passwordHash = bcrypt.hashSync(m.password, 10);
    await db.insert(membersTable).values({
      name: m.name,
      systemRole: m.systemRole,
      divisionRole: m.divisionRole,
      passwordHash,
    });
  }
}

export async function verifyMemberLogin(name: string, password: string): Promise<typeof membersTable.$inferSelect | null> {
  const rows = await db.select().from(membersTable).where(eq(membersTable.name, name));
  if (!rows.length) return null;
  const member = rows[0];
  const valid = bcrypt.compareSync(password, member.passwordHash);
  return valid ? member : null;
}

export function requireEdit(resource: Resource) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const role = getRole(req);
    if (!(await canEdit(role, resource))) {
      res.status(403).json({ error: "Akses ditolak" });
      return;
    }
    next();
  };
}

export function requireManage(req: Request, res: Response, next: NextFunction) {
  if (getRole(req) !== "ketua") {
    res.status(403).json({ error: "Hanya ketua yang dapat mengelola akses" });
    return;
  }
  next();
}

export function requireLogin(req: Request, res: Response, next: NextFunction) {
  if (!getMemberId(req)) {
    res.status(401).json({ error: "Login terlebih dahulu" });
    return;
  }
  next();
}
