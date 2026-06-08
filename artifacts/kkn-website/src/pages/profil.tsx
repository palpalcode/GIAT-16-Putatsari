import { useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useGetMembers,
  useUpdateMemberAvatar,
  useRequestUploadUrl,
  useChangeOwnPassword,
  useChangeUserPassword,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, UserCircle, ShieldCheck, KeyRound, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMemberColor } from "@/components/ui/member-picker";
import { Link } from "wouter";

function PasswordInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-9 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-rose-300 focus:border-rose-300"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function ProfilPage() {
  const { memberId, memberName, divisionRole, role, avatarUrl, isLoggedIn, refetch } = useAuth();
  const { data: members } = useGetMembers();
  const updateAvatar = useUpdateMemberAvatar();
  const requestUploadUrl = useRequestUploadUrl();
  const changeOwnPassword = useChangeOwnPassword();
  const changeUserPassword = useChangeUserPassword();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Self change-password form state
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");

  // Ketua: change other user's password
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [adminNewPw, setAdminNewPw] = useState("");
  const [adminConfirm, setAdminConfirm] = useState("");

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

  const handleChangeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpNew !== cpConfirm) {
      toast({ title: "Konfirmasi password tidak cocok", variant: "destructive" });
      return;
    }
    if (cpNew.length < 6) {
      toast({ title: "Password baru minimal 6 karakter", variant: "destructive" });
      return;
    }
    try {
      await changeOwnPassword.mutateAsync({ data: { currentPassword: cpCurrent, newPassword: cpNew } });
      toast({ title: "Password berhasil diubah ✅" });
      setCpCurrent("");
      setCpNew("");
      setCpConfirm("");
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Gagal mengubah password";
      toast({ title: msg, variant: "destructive" });
    }
  };

  const handleChangeUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast({ title: "Pilih anggota terlebih dahulu", variant: "destructive" });
      return;
    }
    if (adminNewPw !== adminConfirm) {
      toast({ title: "Konfirmasi password tidak cocok", variant: "destructive" });
      return;
    }
    if (adminNewPw.length < 6) {
      toast({ title: "Password baru minimal 6 karakter", variant: "destructive" });
      return;
    }
    try {
      const res = await changeUserPassword.mutateAsync({ id: selectedMemberId, data: { newPassword: adminNewPw } });
      toast({ title: res.message ?? "Password berhasil diubah ✅" });
      setAdminNewPw("");
      setAdminConfirm("");
      setSelectedMemberId(null);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Gagal mengubah password";
      toast({ title: msg, variant: "destructive" });
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

      {/* Change own password */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-rose-400" />
            Ubah Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangeOwnPassword} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Password Lama</label>
              <PasswordInput
                id="cp-current"
                value={cpCurrent}
                onChange={setCpCurrent}
                placeholder="Masukkan password saat ini"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Password Baru</label>
              <PasswordInput
                id="cp-new"
                value={cpNew}
                onChange={setCpNew}
                placeholder="Min. 6 karakter"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Konfirmasi Password Baru</label>
              <PasswordInput
                id="cp-confirm"
                value={cpConfirm}
                onChange={setCpConfirm}
                placeholder="Ulangi password baru"
              />
            </div>
            <Button
              type="submit"
              disabled={changeOwnPassword.isPending || !cpCurrent || !cpNew || !cpConfirm}
              className="w-full rounded-xl bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0"
            >
              {changeOwnPassword.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</>
              ) : (
                "Simpan Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Ketua: change other user's password */}
      {role === "ketua" && (
        <Card className="glass-card border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Ubah Password Anggota Lain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangeUserPassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Pilih Anggota</label>
                <select
                  value={selectedMemberId ?? ""}
                  onChange={(e) => setSelectedMemberId(e.target.value ? parseInt(e.target.value, 10) : null)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:border-amber-300 bg-white"
                >
                  <option value="">-- Pilih anggota --</option>
                  {(members ?? [])
                    .filter((m) => m.id !== memberId)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.divisionRole})
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Password Baru</label>
                <PasswordInput
                  id="admin-new-pw"
                  value={adminNewPw}
                  onChange={setAdminNewPw}
                  placeholder="Min. 6 karakter"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Konfirmasi Password Baru</label>
                <PasswordInput
                  id="admin-confirm"
                  value={adminConfirm}
                  onChange={setAdminConfirm}
                  placeholder="Ulangi password baru"
                />
              </div>
              <Button
                type="submit"
                disabled={changeUserPassword.isPending || !selectedMemberId || !adminNewPw || !adminConfirm}
                className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0"
              >
                {changeUserPassword.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</>
                ) : (
                  "Ubah Password Anggota"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

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
