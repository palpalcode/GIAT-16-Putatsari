import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  useGetAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useGetNotulensiList,
  getGetAnnouncementsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetNotulensiListQueryKey,
} from "@workspace/api-client-react";
import type { Notulensi } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Megaphone, FileText, Calendar, User, Users, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn, TEAM_ROLES } from "@/lib/utils";
import { MemberPicker } from "@/components/ui/member-picker";
import { getApiErrorDesc, extractApiFieldErrors } from "@/lib/api-error";
import {
  useCreateNotulensi,
  useUpdateNotulensi,
  useDeleteNotulensi,
} from "@workspace/api-client-react";

const SEKRETARIS_NAME = Object.keys(TEAM_ROLES).find((m) => TEAM_ROLES[m] === "Sekretaris") ?? "";

type Priority = "low" | "medium" | "high";

const priorityLabel: Record<Priority, string> = {
  high: "Mendesak",
  medium: "Penting",
  low: "Normal",
};

const priorityClass: Record<Priority, string> = {
  high: "bg-rose-100/80 text-rose-700 border-rose-200",
  medium: "bg-amber-100/80 text-amber-700 border-amber-200",
  low: "bg-emerald-100/80 text-emerald-700 border-emerald-200",
};

function EmptyPengumuman() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-sky-100 flex items-center justify-center">
        <Megaphone className="w-8 h-8 text-rose-400" />
      </div>
      <p className="text-gray-500 text-center">Belum ada pengumuman.</p>
    </div>
  );
}

function EmptyNotulensi() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-sky-100 flex items-center justify-center">
        <FileText className="w-8 h-8 text-rose-400" />
      </div>
      <p className="text-gray-500 text-center">Belum ada notulensi rapat.</p>
    </div>
  );
}

interface FormState {
  title: string;
  content: string;
  priority: Priority;
}

const defaultForm: FormState = { title: "", content: "", priority: "medium" };

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function PengumumanPage() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { can } = useAuth();
  const canEditPengumuman = can("pengumuman");
  const canEditNotulensi = can("notulensi");

  const [tab, setTab] = useState<"pengumuman" | "notulensi">("pengumuman");

  // Pengumuman
  const { data: announcements, isLoading: loadingA } = useGetAnnouncements();
  const createA = useCreateAnnouncement();
  const updateA = useUpdateAnnouncement();
  const deleteA = useDeleteAnnouncement();
  const [openA, setOpenA] = useState(false);
  const [editingAId, setEditingAId] = useState<number | null>(null);
  const [formA, setFormA] = useState<FormState>(defaultForm);
  const [aFieldErrors, setAFieldErrors] = useState<Record<string, string>>({});

  // Notulensi
  const { data: notulensiList, isLoading: loadingN } = useGetNotulensiList();
  const [openN, setOpenN] = useState(false);
  const [editingNId, setEditingNId] = useState<number | null>(null);
  const [formN, setFormN] = useState({
    title: "",
    meetingDate: "",
    attendeesSelected: [] as string[],
    agenda: "",
    content: "",
    author: SEKRETARIS_NAME,
  });
  const [nFieldErrors, setNFieldErrors] = useState<Record<string, string>>({});

  const createN = useCreateNotulensi();
  const updateN = useUpdateNotulensi();
  const deleteN = useDeleteNotulensi();

  function invalidateA() {
    queryClient.invalidateQueries({ queryKey: getGetAnnouncementsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }
  function invalidateN() {
    queryClient.invalidateQueries({ queryKey: getGetNotulensiListQueryKey() });
  }

  // Pengumuman handlers
  function openAddA() {
    setEditingAId(null);
    setFormA(defaultForm);
    setAFieldErrors({});
    setOpenA(true);
  }
  function openEditA(a: any) {
    setEditingAId(a.id);
    setFormA({ title: a.title, content: a.content, priority: a.priority as Priority });
    setAFieldErrors({});
    setOpenA(true);
  }
  function handleSaveA() {
    if (!formA.title || !formA.content) return;
    if (editingAId !== null) {
      updateA.mutate(
        { id: editingAId, data: formA },
        {
          onSuccess: () => { invalidateA(); setOpenA(false); toast({ title: "Pengumuman diperbarui" }); },
          onError: (err) => { setAFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
        }
      );
    } else {
      createA.mutate(
        { data: formA },
        {
          onSuccess: () => { invalidateA(); setOpenA(false); toast({ title: "Pengumuman ditambahkan" }); },
          onError: (err) => { setAFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
        }
      );
    }
  }
  function handleDeleteA(id: number) {
    deleteA.mutate(
      { id },
      {
        onSuccess: () => { invalidateA(); toast({ title: "Pengumuman dihapus" }); },
        onError: (err) => toast({ title: "Gagal menghapus", description: getApiErrorDesc(err), variant: "destructive" }),
      }
    );
  }

  // Notulensi handlers
  const fN = <K extends keyof typeof formN>(k: K, v: typeof formN[K]) =>
    setFormN((prev) => ({ ...prev, [k]: v }));

  function openAddN() {
    setEditingNId(null);
    setFormN({ title: "", meetingDate: "", attendeesSelected: [], agenda: "", content: "", author: SEKRETARIS_NAME });
    setNFieldErrors({});
    setOpenN(true);
  }
  function openEditN(n: Notulensi, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingNId(n.id);
    setFormN({
      title: n.title,
      meetingDate: n.meetingDate,
      attendeesSelected: n.attendees,
      agenda: n.agenda ?? "",
      content: n.content,
      author: n.author,
    });
    setNFieldErrors({});
    setOpenN(true);
  }
  function handleSaveN() {
    if (!formN.title || !formN.meetingDate || !formN.content || !formN.author) return;
    const payload = {
      title: formN.title,
      meetingDate: formN.meetingDate,
      attendees: formN.attendeesSelected,
      agenda: formN.agenda || undefined,
      content: formN.content,
      author: formN.author,
    };
    if (editingNId !== null) {
      updateN.mutate(
        { id: editingNId, data: payload },
        {
          onSuccess: () => { invalidateN(); setOpenN(false); toast({ title: "Notulensi diperbarui" }); },
          onError: (err) => { setNFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
        }
      );
    } else {
      createN.mutate(
        { data: payload },
        {
          onSuccess: () => { invalidateN(); setOpenN(false); toast({ title: "Notulensi ditambahkan" }); },
          onError: (err) => { setNFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
        }
      );
    }
  }
  function handleDeleteN(id: number) {
    deleteN.mutate(
      { id },
      {
        onSuccess: () => { invalidateN(); toast({ title: "Notulensi dihapus" }); },
        onError: (err) => toast({ title: "Gagal menghapus", description: getApiErrorDesc(err), variant: "destructive" }),
      }
    );
  }

  const sortedA = [...(announcements || [])].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">Pengumuman</h1>
          <p className="text-gray-500 text-sm mt-1">Informasi dan catatan rapat Tim Putatsari Wellness</p>
        </div>
        {tab === "pengumuman" && canEditPengumuman && (
          <Button
            onClick={openAddA}
            className="bg-gradient-to-r from-rose-400 to-sky-400 hover:from-rose-500 hover:to-sky-500 text-white border-0 rounded-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengumuman
          </Button>
        )}
        {tab === "notulensi" && canEditNotulensi && (
          <Button
            onClick={openAddN}
            className="bg-gradient-to-r from-rose-400 to-sky-400 hover:from-rose-500 hover:to-sky-500 text-white border-0 rounded-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Notulensi
          </Button>
        )}
      </div>
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/90 rounded-full p-1 w-fit border border-white/60">
        <button
          onClick={() => setTab("pengumuman")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            tab === "pengumuman"
              ? "bg-white text-rose-600 shadow-sm"
              : "text-amber-700 hover:text-amber-900"
          )}
        >
          <Megaphone className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
          Pengumuman
        </button>
        <button
          onClick={() => setTab("notulensi")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            tab === "notulensi"
              ? "bg-white text-rose-600 shadow-sm"
              : "text-amber-700 hover:text-amber-900"
          )}
        >
          <FileText className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
          Notulensi
        </button>
      </div>
      {/* Pengumuman tab */}
      {tab === "pengumuman" && (
        <div className="animate-in fade-in duration-300">
          {loadingA ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : sortedA.length === 0 ? (
            <EmptyPengumuman />
          ) : (
            <div className="grid gap-4">
              {sortedA.map((a) => (
                <div key={a.id} className="glass-card p-6 group transition-all hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <Badge
                          className={cn(
                            "text-xs font-medium border",
                            priorityClass[a.priority as Priority] ?? priorityClass.medium
                          )}
                        >
                          {priorityLabel[a.priority as Priority] ?? a.priority}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(a.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{a.title}</h3>
                      <p className="mt-2 text-gray-600 whitespace-pre-wrap">{a.content}</p>
                    </div>
                    {canEditPengumuman && (
                      <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => openEditA(a)}>
                          <Pencil className="w-4 h-4 text-sky-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => handleDeleteA(a.id)}>
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Notulensi tab */}
      {tab === "notulensi" && (
        <div className="animate-in fade-in duration-300">
          {loadingN ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : !notulensiList || notulensiList.length === 0 ? (
            <EmptyNotulensi />
          ) : (
            <div className="grid gap-4">
              {notulensiList.map((n) => (
                <div
                  key={n.id}
                  onClick={() => navigate(`/notulensi/${n.id}`)}
                  className="glass-card p-6 group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                          <Calendar className="w-3 h-3" />
                          {formatDate(n.meetingDate)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          {n.author}
                        </span>
                        {n.attendees.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            {n.attendees.length} peserta
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 leading-snug">{n.title}</h3>
                      <p className="mt-1.5 text-gray-500 text-sm line-clamp-2">
                        {n.content.slice(0, 180)}{n.content.length > 180 ? "…" : ""}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-rose-500 group-hover:text-rose-600">
                        Baca selengkapnya <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                    {canEditNotulensi && (
                      <div
                        className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8"
                          onClick={(e) => openEditN(n, e)}
                        >
                          <Pencil className="w-4 h-4 text-sky-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); handleDeleteN(n.id); }}
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Pengumuman Dialog */}
      <Dialog open={openA} onOpenChange={setOpenA}>
        <DialogContent className="form-dialog border-white/50">
          <DialogHeader>
            <DialogTitle>{editingAId ? "Edit Pengumuman" : "Tambah Pengumuman"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Input
                placeholder="Judul pengumuman"
                value={formA.title}
                onChange={(e) => { setFormA(f => ({ ...f, title: e.target.value })); setAFieldErrors(fe => ({ ...fe, title: "" })); }}
                className="bg-white/90"
              />
              {aFieldErrors.title && <p className="text-xs text-rose-500 mt-1">{aFieldErrors.title}</p>}
            </div>
            <div>
              <Textarea
                placeholder="Isi pengumuman..."
                value={formA.content}
                onChange={(e) => { setFormA(f => ({ ...f, content: e.target.value })); setAFieldErrors(fe => ({ ...fe, content: "" })); }}
                rows={4}
                className="bg-white/90"
              />
              {aFieldErrors.content && <p className="text-xs text-rose-500 mt-1">{aFieldErrors.content}</p>}
            </div>
            <Select value={formA.priority} onValueChange={(v) => setFormA(f => ({ ...f, priority: v as Priority }))}>
              <SelectTrigger className="bg-white/90">
                <SelectValue placeholder="Prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Mendesak</SelectItem>
                <SelectItem value="medium">Penting</SelectItem>
                <SelectItem value="low">Normal</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setOpenA(false)}>Batal</Button>
              <Button
                onClick={handleSaveA}
                className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0"
                disabled={createA.isPending || updateA.isPending}
              >
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Notulensi Dialog */}
      <Dialog open={openN} onOpenChange={setOpenN}>
        <DialogContent className="form-dialog border-white/50 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNId ? "Edit Notulensi" : "Tambah Notulensi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Input
                placeholder="Judul notulensi / nama rapat"
                value={formN.title}
                onChange={(e) => { fN("title", e.target.value); setNFieldErrors(fe => ({ ...fe, title: "" })); }}
                className="bg-white/90"
              />
              {nFieldErrors.title && <p className="text-xs text-rose-500 mt-1">{nFieldErrors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">
                  Tanggal Rapat
                </label>
                <Input
                  type="date"
                  value={formN.meetingDate}
                  onChange={(e) => { fN("meetingDate", e.target.value); setNFieldErrors(fe => ({ ...fe, meetingDate: "" })); }}
                  className="bg-white/90"
                />
                {nFieldErrors.meetingDate && <p className="text-xs text-rose-500 mt-1">{nFieldErrors.meetingDate}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">
                  Penulis / Notulis
                </label>
                <Input
                  placeholder="Nama notulis"
                  value={formN.author}
                  onChange={(e) => { fN("author", e.target.value); setNFieldErrors(fe => ({ ...fe, author: "" })); }}
                  className="bg-white/90"
                />
                {nFieldErrors.author && <p className="text-xs text-rose-500 mt-1">{nFieldErrors.author}</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">
                Peserta
              </label>
              <div className="bg-white/90 rounded-xl border border-white/60 p-3">
                <MemberPicker
                  selected={formN.attendeesSelected}
                  onChange={(v) => fN("attendeesSelected", v)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">
                Agenda (opsional)
              </label>
              <Textarea
                placeholder="Daftar agenda rapat..."
                value={formN.agenda}
                onChange={(e) => fN("agenda", e.target.value)}
                rows={3}
                className="bg-white/90"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">
                Isi Notulensi
              </label>
              <Textarea
                placeholder="Tulis isi notulensi di sini..."
                value={formN.content}
                onChange={(e) => { fN("content", e.target.value); setNFieldErrors(fe => ({ ...fe, content: "" })); }}
                rows={10}
                className="bg-white/90"
              />
              {nFieldErrors.content && <p className="text-xs text-rose-500 mt-1">{nFieldErrors.content}</p>}
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpenN(false)}>Batal</Button>
              <Button
                onClick={handleSaveN}
                disabled={createN.isPending || updateN.isPending || !formN.title || !formN.meetingDate || !formN.content || !formN.author}
                className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0"
              >
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
