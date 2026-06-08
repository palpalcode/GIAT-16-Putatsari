import { useGetAuthMe } from "@workspace/api-client-react";

export const RESOURCE_LABELS: Record<string, string> = {
  pengumuman: "Pengumuman",
  deadline: "Deadline",
  "our-life": "Our Life",
  "our-work": "Our Work",
  masalah: "Masalah",
  kas: "Kas",
  notulensi: "Notulensi",
};

export const RESOURCES = ["pengumuman", "deadline", "our-life", "our-work", "masalah", "kas", "notulensi"];

export const ROLE_LABELS: Record<string, string> = {
  ketua: "Ketua",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  anggota: "Anggota",
};

export function useAuth() {
  const { data, refetch, isLoading } = useGetAuthMe();
  const permissions = data?.permissions ?? [];
  return {
    role: data?.role ?? null,
    memberId: data?.memberId ?? null,
    memberName: data?.memberName ?? null,
    divisionRole: data?.divisionRole ?? null,
    avatarUrl: data?.avatarUrl ?? null,
    isLoggedIn: !!data?.authenticated,
    canManage: !!data?.canManage,
    can: (resource: string) => permissions.includes(resource),
    permissions,
    refetch,
    isLoading,
  };
}
