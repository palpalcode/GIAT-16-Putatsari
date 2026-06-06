import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAnnouncements,
  useGetAuthMe,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  getGetAnnouncementsQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
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
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Priority = "low" | "medium" | "high";

const priorityLabel: Record<Priority, string> = {
  high: "Penting",
  medium: "Sedang",
  low: "Biasa",
};

const priorityClass: Record<Priority, string> = {
  high: "bg-rose-100/80 text-rose-700 border-rose-200",
  medium: "bg-amber-100/80 text-amber-700 border-amber-200",
  low: "bg-emerald-100/80 text-emerald-700 border-emerald-200",
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-sky-100 flex items-center justify-center">
        <Megaphone className="w-8 h-8 text-rose-400" />
      </div>
      <p className="text-gray-500 text-center">Belum ada pengumuman.</p>
    </div>
  );
}

interface FormState {
  title: string;
  content: string;
  priority: Priority;
}

const defaultForm: FormState = { title: "", content: "", priority: "medium" };

export default function PengumumanPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: auth } = useGetAuthMe();
  const { data: announcements, isLoading } = useGetAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);

  const isAdmin = auth?.isAdmin;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getGetAnnouncementsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() {
    setEditingId(null);
    setForm(defaultForm);
    setOpen(true);
  }

  function openEdit(a: any) {
    setEditingId(a.id);
    setForm({ title: a.title, content: a.content, priority: a.priority as Priority });
    setOpen(true);
  }

  function handleSave() {
    if (!form.title || !form.content) return;
    if (editingId !== null) {
      updateMutation.mutate(
        { id: editingId, data: form },
        {
          onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Pengumuman diperbarui" }); },
          onError: () => toast({ title: "Gagal memperbarui", variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        { data: form },
        {
          onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Pengumuman ditambahkan" }); },
          onError: () => toast({ title: "Gagal menambahkan", variant: "destructive" }),
        }
      );
    }
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => { invalidate(); toast({ title: "Pengumuman dihapus" }); },
        onError: () => toast({ title: "Gagal menghapus", variant: "destructive" }),
      }
    );
  }

  const sorted = [...(announcements || [])].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
            Pengumuman
          </h1>
          <p className="text-gray-500 text-sm mt-1">Informasi penting untuk Tim KKN</p>
        </div>
        {isAdmin && (
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
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {sorted.map((a) => (
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
                {isAdmin && (
                  <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => openEdit(a)}>
                      <Pencil className="w-4 h-4 text-sky-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => handleDelete(a.id)}>
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
        <DialogContent className="glass-panel border-white/50">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pengumuman" : "Tambah Pengumuman"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              placeholder="Judul pengumuman"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="bg-white/50"
            />
            <Textarea
              placeholder="Isi pengumuman..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={4}
              className="bg-white/50"
            />
            <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Priority }))}>
              <SelectTrigger className="bg-white/50">
                <SelectValue placeholder="Prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Penting</SelectItem>
                <SelectItem value="medium">Sedang</SelectItem>
                <SelectItem value="low">Biasa</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0"
                disabled={createMutation.isPending || updateMutation.isPending}
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
