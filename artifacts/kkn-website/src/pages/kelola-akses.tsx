import { useLocation } from "wouter";
import {
  useGetPermissions,
  useSetPermission,
  getGetPermissionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, RESOURCES, RESOURCE_LABELS, ROLE_LABELS } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";

const MANAGED_ROLES = ["Kormades", "Sekretaris", "Bendahara", "Acara", "Humas", "PDD"];

export default function KelolaAksesPage() {
  const [, setLocation] = useLocation();
  const { canManage, isLoading } = useAuth();
  const { data: permissions, isLoading: permLoading } = useGetPermissions();
  const setPermission = useSetPermission();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!isLoading && !canManage) {
    setLocation("/");
    return null;
  }

  function isGranted(role: string, resource: string) {
    return permissions?.some((p) => p.role === role && p.resource === resource && p.canEdit) ?? false;
  }

  function toggle(role: string, resource: string, canEdit: boolean) {
    setPermission.mutate(
      { data: { role, resource, canEdit } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPermissionsQueryKey() });
          toast({
            title: canEdit
              ? `Akses ${RESOURCE_LABELS[resource]} diberikan ke ${ROLE_LABELS[role]}`
              : `Akses ${RESOURCE_LABELS[resource]} dicabut dari ${ROLE_LABELS[role]}`,
          });
        },
        onError: () => toast({ title: "Gagal memperbarui akses", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-400 to-sky-400 flex items-center justify-center text-white shadow-md">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
            Kelola Akses
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Atur siapa yang boleh mengedit tiap bagian. Hanya Ketua yang dapat mengubah ini.
          </p>
        </div>
      </div>

      <Card className="glass-card border-white/50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Akses Penuh</CardTitle>
          <CardDescription>Jabatan berikut selalu memiliki akses ke semua bagian tanpa perlu diatur.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            {ROLE_LABELS["Kormades"]}
          </span>
        </CardContent>
      </Card>

      {permLoading ? (
        <div className="flex justify-center py-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        MANAGED_ROLES.map((role) => (
          <Card key={role} className="glass-card border-white/50">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">{ROLE_LABELS[role]}</CardTitle>
              <CardDescription>
                Pilih bagian yang boleh diedit oleh {ROLE_LABELS[role]}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RESOURCES.map((resource) => {
                const granted = isGranted(role, resource);
                return (
                  <label
                    key={resource}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-violet-200/50 bg-white px-4 py-3 cursor-pointer hover:bg-white/90 transition-colors"
                  >
                    <span className="font-medium text-gray-700">{RESOURCE_LABELS[resource]}</span>
                    <Switch
                      checked={granted}
                      onCheckedChange={(v) => toggle(role, resource, v)}
                      disabled={setPermission.isPending}
                    />
                  </label>
                );
              })}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
