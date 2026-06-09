import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  useGetNotulensiList,
  useCreateNotulensi,
  useUpdateNotulensi,
  useDeleteNotulensi,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, FileText, ChevronRight, Calendar, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotulensiForm {
  title: string;
  meetingDate: string;
  attendeesRaw: string;
  agenda: string;
  content: string;
  author: string;
}

const defaultForm: NotulensiForm = {
  title: "",
  meetingDate: "",
  attendeesRaw: "",
  agenda: "",
  content: "",
  author: "",
};

function parseAttendees(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-sky-100 flex items-center justify-center">
        <FileText className="w-8 h-8 text-rose-400" />
      </div>
      <p className="text-gray-500 text-center">Belum ada notulensi.</p>
    </div>
  );
}

export default function NotulensiPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { can } = useAuth();
  const canEdit = can("notulensi");

  const { data: list, isLoading } = useGetNotulensiList();
  const createMutation = useCreateNotulensi();
  const updateMutation = useUpdateNotulensi();
  const deleteMutation = useDeleteNotulensi();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<NotulensiForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const f = <K extends keyof NotulensiForm>(k: K, v: NotulensiForm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getGetNotulensiListQueryKey() });
  }

  function openAdd() {
    setEditingId(null);
    setForm(defaultForm);
    setOpen(true);
  }

  function openEdit(n: Notulensi, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(n.id);
    setForm({
      title: n.title,
      meetingDate: n.meetingDate,
      attendeesRaw: n.attendees.join("\n"),
      agenda: n.agenda ?? "",
      content: n.content,
      author: n.author,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.title || !form.meetingDate || !form.content || !form.author) return;
    const payload = {
      title: form.title,
      meetingDate: form.meetingDate,
      attendees: parseAttendees(form.attendeesRaw),
      agenda: form.agenda || undefined,
      content: form.content,
      author: form.author,
    };
    if (editingId !== null) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Notulensi diperbarui" }); },
          onError: () => toast({ title: "Gagal memperbarui", variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Notulensi ditambahkan" }); },
          onError: () => toast({ title: "Gagal menambahkan", variant: "destructive" }),
        }
      );
    }
  }

  function handleDelete() {
    if (deleteId === null) return;
    deleteMutation.mutate(
      { id: deleteId },
      {
        onSuccess: () => { invalidate(); setDeleteId(null); toast({ title: "Notulensi dihapus" }); },
        onError: () => toast({ title: "Gagal menghapus", variant: "destructive" }),
      }
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
            Notulensi
          </h1>
          <p className="text-gray-500 text-sm mt-1">Catatan resmi rapat Tim Putatsari Wellness</p>
        </div>
        {canEdit && (
          <Button
            onClick={openAdd}
            className="bg-gradient-to-r from-rose-400 to-sky-400 hover:from-rose-500 hover:to-sky-500 text-white border-0 rounded-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !list || list.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {list.map((n) => (
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
                {canEdit && (
                  <div
                    className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8"
                      onClick={(e) => openEdit(n, e)}
                    >
                      <Pencil className="w-4 h-4 text-sky-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); setDeleteId(n.id); }}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="form-dialog border-white/50 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Notulensi" : "Tambah Notulensi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              placeholder="Judul notulensi / nama rapat"
              value={form.title}
              onChange={(e) => f("title", e.target.value)}
              className="bg-white border-violet-200/50"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">
                  Tanggal Rapat
                </label>
                <Input
                  type="date"
                  value={form.meetingDate}
                  onChange={(e) => f("meetingDate", e.target.value)}
                  className="bg-white border-violet-200/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">
                  Penulis / Notulis
                </label>
                <Input
                  placeholder="Nama notulis"
                  value={form.author}
                  onChange={(e) => f("author", e.target.value)}
                  className="bg-white border-violet-200/50"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">
                Peserta (satu nama per baris)
              </label>
              <Textarea
                placeholder={"Nama peserta 1\nNama peserta 2\n..."}
                value={form.attendeesRaw}
                onChange={(e) => f("attendeesRaw", e.target.value)}
                rows={4}
                className="bg-white border-violet-200/50 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">
                Agenda (opsional)
              </label>
              <Textarea
                placeholder="Daftar agenda rapat..."
                value={form.agenda}
                onChange={(e) => f("agenda", e.target.value)}
                rows={3}
                className="bg-white border-violet-200/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">
                Isi Notulensi
              </label>
              <Textarea
                placeholder="Tulis isi notulensi di sini..."
                value={form.content}
                onChange={(e) => f("content", e.target.value)}
                rows={10}
                className="bg-white border-violet-200/50"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={isPending || !form.title || !form.meetingDate || !form.content || !form.author}
                className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0"
              >
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="form-dialog border-white/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Notulensi?</AlertDialogTitle>
            <AlertDialogDescription>
              Notulensi ini akan dihapus permanen dan tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
