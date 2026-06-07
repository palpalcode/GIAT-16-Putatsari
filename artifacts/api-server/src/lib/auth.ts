import type { Request, Response, NextFunction } from "express";
import { db, permissionsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";

export type Role = "ketua" | "sekretaris" | "bendahara";

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
};

// Roles whose edit access is controlled by the ketua.
export const MANAGED_ROLES: Role[] = ["bendahara"];

const ROLE_PASSWORDS: Record<Role, string> = {
  ketua: process.env.KETUA_PASSWORD || "pastword",
  sekretaris: process.env.SEKRETARIS_PASSWORD || "secre_secret",
  bendahara: process.env.BENDAHARA_PASSWORD || "purbaya_effect",
};

export function roleForPassword(password: string): Role | null {
  for (const role of Object.keys(ROLE_PASSWORDS) as Role[]) {
    if (password === ROLE_PASSWORDS[role]) return role;
  }
  return null;
}

export function getRole(req: Request): Role | null {
  return ((req.session as any).role as Role) || null;
}

export function isResource(value: string): value is Resource {
  return (RESOURCES as readonly string[]).includes(value);
}

export function isManagedRole(value: string): value is Role {
  return MANAGED_ROLES.includes(value as Role);
}

// Ketua & sekretaris always have full access; bendahara is per-DB.
export async function canEdit(role: Role | null, resource: Resource): Promise<boolean> {
  if (!role) return false;
  if (role === "ketua" || role === "sekretaris") return true;
  const rows = await db
    .select()
    .from(permissionsTable)
    .where(and(eq(permissionsTable.role, role), eq(permissionsTable.resource, resource)));
  return rows.length > 0 ? rows[0].canEdit : false;
}

export async function permissionsForRole(role: Role): Promise<Resource[]> {
  if (role === "ketua" || role === "sekretaris") return [...RESOURCES];
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
        // Managed roles start with no access; the ketua grants per-resource edit rights.
        await db.insert(permissionsTable).values({ role, resource, canEdit: false });
      }
    }
  }
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
