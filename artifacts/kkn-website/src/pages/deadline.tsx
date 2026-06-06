import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetDeadlines,
  useGetAuthMe,
  useCreateDeadline,
  useUpdateDeadline,
  useDeleteDeadline,
  getGetDeadlinesQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil, Trash2, CalendarClock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MEMBERS = [
  "Muhamad Naufal",
  "Fadhilah Apta Nur Safitri",
  "Lutfia Tri Rahmacahyani",
  "Navida Fitria",
  "Miftakhul Jannah",
  "Vrizcka Aullia Asmara",
  "Quro'atul A'ini",
  "Dewi Anita Sari",
  "Tiara Nuril Safitri",
];

function today() { return new Date().toISOString().split("T")[0]; }

function daysLeft(dueDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / 86400000);
}

function DaysLeftBadge({ dueDate, status }: { dueDate: string; status: string }) {
  if (status === "done") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-xs">Selesai</Badge>;
  const d = daysLeft(dueDate);
  if (d < 0) return <Badge className="bg-rose-200 text-rose-800 border-rose-300 border text-xs">Terlambat {Math.abs(d)} hari</Badge>;
  if (d === 0) return <Badge className="bg-rose-100 text-rose-700 border-rose-200 border text-xs">Hari Ini</Badge>;
  if (d <= 3) return <Badge className="bg-amber-100 text-amber-700 border-amber-200 border text-xs">{d} hari lagi</Badge>;
  return <Badge className="bg-sky-100 text-sky-700 border-sky-200 border text-xs">{d} hari lagi</Badge>;
}

function MemberCheckbox({ members, selected, onChange }: { members: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(m: string) {
    onChange(selected.includes(m) ? selected.filter(x => x !== m) : [...selected, m]);
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {members.map(m => (
        <label key={m} className={cn(
          "flex items-center gap-2 text-sm rounded-xl p-2 cursor-pointer border transition-colors",
          selected.includes(m) ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-white/40 border-white/40 text-gray-700 hover:bg-white/60"
        )}>
          <input type="checkbox" checked={selected.includes(m)} onChange={() => toggle(m)} className="hidden" />
          <span className={cn("w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center", selected.includes(m) ? "bg-rose-400 border-rose-400" : "border-gray-300")}>
            {selected.includes(m) && <span className="text-white text-[10px] font-bold">v</span>}
          </span>
          {m}
        </label>
      ))}
    </div>
  );
}

export default function DeadlinePage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: auth } = useGetAuthMe();
  const { data: deadlines, isLoading } = useGetDeadlines();
  const create = useCreateDeadline();
  const update = useUpdateDeadline();
  const del = useDeleteDeadline();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", type: "tugas", dueDate: today(), status: "pending", assignedTo: [] as string[], notes: "" });

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const isAdmin = auth?.isAdmin;

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetDeadlinesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setForm({ title: "", type: "tugas", dueDate: today(), status: "pending", assignedTo: [], notes: "" }); setOpen(true); }
  function openEdit(d: any) { setEditId(d.id); setForm({ title: d.title, type: d.type, dueDate: d.dueDate, status: d.status, assignedTo: d.assignedTo as string[], notes: d.notes ?? "" }); setOpen(true); }

  function handleSave() {
    if (!form.title) return;
    const payload = { title: form.title, type: form.type, dueDate: form.dueDate, status: form.status, assignedTo: form.assignedTo, notes: form.notes || undefined };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Deadline diperbarui" }); } });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Deadline ditambahkan" }); } });
    }
  }

  let filtered = deadlines ?? [];
  if (filterType !== "all") filtered = filtered.filter(d => d.type === filterType);
  if (filterStatus !== "all") filtered = filtered.filter(d => d.status === filterStatus);

  // Sort: pending first (closest due date first), then done
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const pendingCount = (deadlines ?? []).filter(d => d.status === "pending").length;
  const doneCount = (deadlines ?? []).filter(d => d.status === "done").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
            Deadline
          </h1>
          <p className="text-gray-500 text-sm mt-1">Tugas dan kegiatan yang perlu diselesaikan</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd} className="bg-gradient-to-r from-rose-400 to-sky-400 hover:from-rose-500 hover:to-sky-500 text-white border-0 rounded-full gap-2">
            <Plus className="w-4 h-4" />Tambah
          </Button>
        )}
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">{pendingCount} belum selesai</span>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-gray-700">{doneCount} selesai</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-gray-500">Filter:</span>
        {["all", "tugas", "kegiatan"].map(v => (
          <button key={v} onClick={() => setFilterType(v)} className={cn("px-3 py-1 rounded-full text-sm border transition-all", filterType === v ? "bg-gradient-to-r from-rose-400 to-sky-400 text-white border-transparent" : "bg-white/50 text-gray-600 border-white/50 hover:bg-white/80")}>
            {v === "all" ? "Semua Tipe" : v === "tugas" ? "Tugas" : "Kegiatan"}
          </button>
        ))}
        <span className="text-gray-300">|</span>
        {["all", "pending", "done"].map(v => (
          <button key={v} onClick={() => setFilterStatus(v)} className={cn("px-3 py-1 rounded-full text-sm border transition-all", filterStatus === v ? "bg-gradient-to-r from-rose-400 to-sky-400 text-white border-transparent" : "bg-white/50 text-gray-600 border-white/50 hover:bg-white/80")}>
            {v === "all" ? "Semua Status" : v === "pending" ? "Belum Selesai" : "Selesai"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-24 p-4" />)}</div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-sky-100 flex items-center justify-center">
            <CalendarClock className="w-8 h-8 text-rose-400" />
          </div>
          <p className="text-gray-500">Tidak ada deadline ditemukan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(d => {
            const days = daysLeft(d.dueDate);
            const isOverdue = d.status === "pending" && days < 0;
            return (
              <div key={d.id} className={cn("glass-card p-4 group transition-all hover:-translate-y-0.5", d.status === "done" ? "opacity-60" : "", isOverdue && "ring-2 ring-rose-300/50")}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <DaysLeftBadge dueDate={d.dueDate} status={d.status} />
                      <Badge className={cn("text-xs border", d.type === "tugas" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-teal-100 text-teal-700 border-teal-200")}>
                        {d.type === "tugas" ? "Tugas" : "Kegiatan"}
                      </Badge>
                    </div>
                    <h3 className={cn("font-semibold text-gray-900", d.status === "done" && "line-through")}>{d.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Batas: {new Date(d.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    {(d.assignedTo as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(d.assignedTo as string[]).map(m => <span key={m} className="text-xs bg-rose-100/80 text-rose-700 px-2 py-0.5 rounded-full">{m}</span>)}
                      </div>
                    )}
                    {d.notes && <p className="text-xs text-gray-400 mt-1">{d.notes}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {isAdmin && d.status === "pending" && (
                      <Button
                        variant="ghost" size="sm"
                        className="text-emerald-600 hover:bg-emerald-50 rounded-full text-xs h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => update.mutate({ id: d.id, data: { status: "done" } }, { onSuccess: () => { invalidate(); toast({ title: "Deadline ditandai selesai" }); } })}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Selesai
                      </Button>
                    )}
                    {isAdmin && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(d)}><Pencil className="w-3.5 h-3.5 text-sky-500" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => del.mutate({ id: d.id }, { onSuccess: () => { invalidate(); toast({ title: "Deadline dihapus" }); } })}><Trash2 className="w-3.5 h-3.5 text-rose-500" /></Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-panel border-white/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Deadline" : "Tambah Deadline"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Judul deadline" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-white/50" />
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger className="bg-white/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tugas">Tugas</SelectItem>
                <SelectItem value="kegiatan">Kegiatan</SelectItem>
              </SelectContent>
            </Select>
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Batas Waktu</label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="bg-white/50" />
            </div>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="bg-white/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Belum Selesai</SelectItem>
                <SelectItem value="done">Selesai</SelectItem>
              </SelectContent>
            </Select>
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Ditugaskan Kepada</label>
              <MemberCheckbox members={MEMBERS} selected={form.assignedTo} onChange={m => setForm(f => ({ ...f, assignedTo: m }))} />
            </div>
            <Input placeholder="Catatan (opsional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/50" />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0" disabled={create.isPending || update.isPending}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
