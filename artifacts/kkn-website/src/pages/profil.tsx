import { useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetMembers, useUpdateMemberAvatar, useRequestUploadUrl } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, UserCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMemberColor } from "@/components/ui/member-picker";
import { Link } from "wouter";

export default function ProfilPage() {
  const { memberId, memberName, divisionRole, role, avatarUrl, isLoggedIn, refetch } = useAuth();
  const { data: members } = useGetMembers();
  const updateAvatar = useUpdateMemberAvatar();
  const requestUploadUrl = useRequestUploadUrl();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <UserCircle className="w-16 h-16 text-gray-300" />
        <p className="text-gray-500">Login terlebih dahulu untuk melihat profil</p>
        <Link href="/admin">
          <Button className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0">Login</Button>
        </Link>
      </div>
    );
  }

  const currentMember = members?.find((m) => m.id === memberId);
  const currentAvatar = currentMember?.avatarUrl ?? avatarUrl;
  const firstLetter = memberName?.charAt(0) ?? "?";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !memberId) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "File harus berupa gambar (JPG, PNG, WebP)", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Ukuran file maksimal 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const urlResp = await requestUploadUrl.mutateAsync({
        data: { name: file.name, size: file.size, contentType: file.type },
      });

      await fetch(urlResp.uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const objectPath = urlResp.objectPath;
      await updateAvatar.mutateAsync({ id: memberId, data: { avatarUrl: `/api/storage${objectPath}` } });
      await refetch();
      toast({ title: "Foto profil berhasil diperbarui 🎉" });
    } catch {
      toast({ title: "Gagal upload foto, coba lagi", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-700">Informasi Anggota</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={memberName ?? ""}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl bg-gradient-to-br border-4 border-white shadow-md",
                    getMemberColor(memberName ?? "")
                  )}
                >
                  {firstLetter}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200 hover:bg-rose-50 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : (
                  <Camera className="w-4 h-4 text-gray-500" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-xs text-gray-400">Klik ikon kamera untuk ganti foto profil (maks. 5MB)</p>
          </div>

          {/* Member Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Nama</span>
              <span className="text-sm font-semibold text-gray-800">{memberName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Divisi</span>
              <span className="text-sm font-semibold text-sky-600">{divisionRole}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Peran Sistem</span>
              <span className="text-sm font-semibold text-gray-700 capitalize">{role}</span>
            </div>
          </div>

          {/* Kelola Akses shortcut for ketua */}
          {role === "ketua" && (
            <Link href="/kelola-akses">
              <Button variant="outline" className="w-full rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Kelola Akses Tim
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Semua anggota tim */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-700">Tim Putatsari Wellness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(members ?? []).map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all",
                  m.id === memberId ? "bg-rose-50 ring-1 ring-rose-200" : "hover:bg-gray-50"
                )}
              >
                {m.avatarUrl ? (
                  <img src={m.avatarUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-white shadow-sm" />
                ) : (
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br", getMemberColor(m.name))}>
                    {m.name.charAt(0)}
                  </div>
                )}
                <p className="text-xs font-medium text-gray-700 text-center leading-tight line-clamp-2">{m.name}</p>
                <p className="text-xs text-gray-400">{m.divisionRole}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
