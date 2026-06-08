import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetProgramSchedules,
  useCreateProgramSchedule,
  useUpdateProgramSchedule,
  useDeleteProgramSchedule,
  getGetProgramSchedulesQueryKey,
  getGetDashboardSummaryQueryKey,
  type ProgramScheduleInputStatus,
  type DeadlineInputType,
  type DeadlineInputStatus,
  useGetDeadlines,
  useCreateDeadline,
  useUpdateDeadline,
  useDeleteDeadline,
  getGetDeadlinesQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { AttendanceWidget } from "@/components/AttendanceWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, CalendarDays, CheckCircle2, Clock, Loader2, User, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MEMBERS = [
  "Muhamad Naufal", "Fadhilah Apta Nur Safitri", "Lutfia Tri Rahmacahyani",
  "Navida Fitria", "Miftakhul Jannah", "Vrizcka Aullia Asmara",
  "Quro'atul A'ini", "Dewi Anita Sari", "Tiara Nuril Safitri",
];

const MEMBER_COLORS = [
  "from-rose-400 to-pink-400", "from-sky-400 to-blue-400", "from-violet-400 to-purple-400",
  "from-amber-400 to-orange-400", "from-emerald-400 to-teal-400", "from-fuchsia-400 to-pink-400",
  "from-cyan-400 to-sky-400", "from-lime-400 to-green-400", "from-indigo-400 to-violet-400",
];

function getMemberColor(name: string) {
  const idx = MEMBERS.indexOf(name);
  return MEMBER_COLORS[idx >= 0 ? idx : 0];
}

function today() { return new Date().toISOString().split("T")[0]; }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
}

const STATUS_OPTIONS = [
  { id: "planned", label: "Direncanakan", icon: Clock, color: "bg-violet-100 text-violet-700 border-violet-200", activeGrad: "from-violet-400 to-purple-500" },
  { id: "ongoing", label: "Berjalan", icon: Loader2, color: "bg-amber-100 text-amber-700 border-amber-200", activeGrad: "from-amber-400 to-orange-500" },
  { id: "done", label: "Selesai", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700 border-emerald-200", activeGrad: "from-emerald-400 to-teal-500" },
];

function getStatus(id: string) {
  return STATUS_OPTIONS.find(s => s.id === id) ?? STATUS_OPTIONS[0];
}

type ProgramForm = { programName: string; date: string; leader: string; members: string[]; status: ProgramScheduleInputStatus; notes: string };

function ProgramDialog({ open, onClose, editId, initial, onSave, isPending }: {
  open: boolean; onClose: () => void; editId: number | null; initial: ProgramForm;
  onSave: (f: ProgramForm) => void; isPending: boolean;
}) {
  const [form, setForm] = useState<ProgramForm>(initial);
  const setF = (k: keyof ProgramForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  function toggleMember(m: string) {
    setF("members", form.members.includes(m) ? form.members.filter(x => x !== m) : [...form.members, m]);
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="glass-panel border-white/50 max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-rose-400/15 to-sky-400/15">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{editId ? "Edit Program" : "Tambah Program Kerja"}</DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Nama Program</label>
            <Input placeholder="Nama program kerja..." value={form.programName} onChange={e => setF("programName", e.target.value)} className="bg-white/60" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tanggal Pelaksanaan</label>
            <Input type="date" value={form.date} onChange={e => setF("date", e.target.value)} className="bg-white/60" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(s => {
                const Icon = s.icon;
                return (
                  <button key={s.id} onClick={() => setF("status", s.id)} className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                    form.status === s.id
                      ? `bg-gradient-to-r ${s.activeGrad} text-white border-transparent shadow`
                      : "bg-white/40 text-gray-500 border-white/40 hover:bg-white/70"
                  )}>
                    <Icon className="w-3.5 h-3.5" />{s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Penanggung Jawab</label>
            <div className="grid grid-cols-3 gap-2">
              {MEMBERS.map(m => (
                <button key={m} onClick={() => setF("leader", m)} className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs transition-all",
                  form.leader === m ? "border-rose-400 bg-rose-50 shadow-sm" : "border-white/40 bg-white/30 hover:bg-white/60"
                )}>
                  <div className={cn("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold", getMemberColor(m))}>
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-center leading-tight line-clamp-2 text-gray-700">{m}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Anggota Tim</label>
            <div className="flex flex-wrap gap-2">
              {MEMBERS.map(m => (
                <button key={m} onClick={() => toggleMember(m)} className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all",
                  form.members.includes(m) ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white/40 text-gray-600 border-white/40 hover:bg-white/60"
                )}>
                  <div className={cn("w-4 h-4 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[8px] font-bold shrink-0", getMemberColor(m))}>
                    <User className="w-2.5 h-2.5" />
                  </div>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
            <Input placeholder="Catatan..." value={form.notes} onChange={e => setF("notes", e.target.value)} className="bg-white/60" />
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <Button variant="outline" onClick={onClose} className="rounded-full">Batal</Button>
            <Button onClick={() => onSave(form)} disabled={isPending || !form.programName || !form.leader}
              className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full">
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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

export default function OurWorkPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { can, memberName, role, isLoggedIn } = useAuth();
  const isKetSek = role === "ketua" || role === "sekretaris";

  // ── Program Kerja ──
  const { data: schedules, isLoading: schedLoading } = useGetProgramSchedules();
  const create = useCreateProgramSchedule();
  const update = useUpdateProgramSchedule();
  const del = useDeleteProgramSchedule();
  const isAdmin = can("our-work");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const defaultForm: ProgramForm = { programName: "", date: today(), leader: "", members: [], status: "planned", notes: "" };
  const [initForm, setInitForm] = useState<ProgramForm>(defaultForm);

  function invalidateSched() {
    qc.invalidateQueries({ queryKey: getGetProgramSchedulesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setInitForm(defaultForm); setOpen(true); }
  function openEdit(s: any) {
    setEditId(s.id);
    setInitForm({ programName: s.programName, date: s.date, leader: s.leader, members: s.members as string[], status: s.status, notes: s.notes ?? "" });
    setOpen(true);
  }

  function handleSave(form: ProgramForm) {
    const payload = { programName: form.programName, date: form.date, leader: form.leader, members: form.members, status: form.status, notes: form.notes || undefined };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, { onSuccess: () => { invalidateSched(); setOpen(false); toast({ title: "Program diperbarui" }); } });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => { invalidateSched(); setOpen(false); toast({ title: "Program ditambahkan" }); } });
    }
  }

  function handleStatusChange(id: number, status: ProgramScheduleInputStatus) {
    update.mutate({ id, data: { status } }, { onSuccess: () => { invalidateSched(); toast({ title: `Status diperbarui: ${getStatus(status).label}` }); } });
  }

  const all = schedules ?? [];
  const filtered = filterStatus ? all.filter(s => s.status === filterStatus) : all;
  const ordered = [...filtered.filter(s => s.status === "ongoing"), ...filtered.filter(s => s.status === "planned"), ...filtered.filter(s => s.status === "done")];

  const counts = {
    ongoing: all.filter(s => s.status === "ongoing").length,
    planned: all.filter(s => s.status === "planned").length,
    done: all.filter(s => s.status === "done").length,
  };

  // ── Deadline ──
  const { data: deadlines, isLoading: dlLoading } = useGetDeadlines();
  const dlCreate = useCreateDeadline();
  const dlUpdate = useUpdateDeadline();
  const dlDel = useDeleteDeadline();
  const isDeadlineAdmin = can("deadline");

  const [dlOpen, setDlOpen] = useState(false);
  const [dlEditId, setDlEditId] = useState<number | null>(null);
  const [dlForm, setDlForm] = useState<{ title: string; type: DeadlineInputType; dueDate: string; status: DeadlineInputStatus; assignedTo: string[]; notes: string }>({
    title: "", type: "tugas", dueDate: today(), status: "pending", assignedTo: [], notes: "",
  });

  function invalidateDl() {
    qc.invalidateQueries({ queryKey: getGetDeadlinesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function dlOpenAdd() { setDlEditId(null); setDlForm({ title: "", type: "tugas", dueDate: today(), status: "pending", assignedTo: [], notes: "" }); setDlOpen(true); }
  function dlOpenEdit(d: any) { setDlEditId(d.id); setDlForm({ title: d.title, type: d.type, dueDate: d.dueDate, status: d.status, assignedTo: d.assignedTo as string[], notes: d.notes ?? "" }); setDlOpen(true); }

  function handleDlSave() {
    if (!dlForm.title) return;
    const payload = { title: dlForm.title, type: dlForm.type, dueDate: dlForm.dueDate, status: dlForm.status, assignedTo: dlForm.assignedTo, notes: dlForm.notes || undefined };
    if (dlEditId !== null) {
      dlUpdate.mutate({ id: dlEditId, data: payload }, { onSuccess: () => { invalidateDl(); setDlOpen(false); toast({ title: "Deadline diperbarui" }); } });
    } else {
      dlCreate.mutate({ data: payload }, { onSuccess: () => { invalidateDl(); setDlOpen(false); toast({ title: "Deadline ditambahkan" }); } });
    }
  }

  const dlSorted = [...(deadlines ?? [])].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">Our Work</h1>
        <p className="text-gray-500 text-sm mt-1">Jadwal program kerja dan absensi anggota</p>
      </div>

      {/* ── 2-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── LEFT: Program Kerja ── */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-rose-500" />
              </div>
              <h2 className="font-bold text-gray-800">Program Kerja</h2>
            </div>
            {isAdmin && (
              <Button onClick={openAdd} size="sm" className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-1.5 text-xs h-8 px-3">
                <Plus className="w-3.5 h-3.5" />Tambah
              </Button>
            )}
          </div>

          {/* Status filter chips */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "ongoing", label: "Berjalan", dot: "bg-amber-400", active: "bg-amber-50 border-amber-300 text-amber-700", count: counts.ongoing },
              { id: "planned", label: "Direncanakan", dot: "bg-violet-400", active: "bg-violet-50 border-violet-300 text-violet-700", count: counts.planned },
              { id: "done", label: "Selesai", dot: "bg-emerald-400", active: "bg-emerald-50 border-emerald-300 text-emerald-700", count: counts.done },
            ].map(f => (
              <button key={f.id} onClick={() => setFilterStatus(filterStatus === f.id ? null : f.id)}
                className={cn(
                  "px-3 py-1.5 flex items-center gap-1.5 rounded-2xl border transition-all text-xs font-medium",
                  filterStatus === f.id ? f.active + " shadow-sm" : "bg-white/50 hover:bg-white/80 text-gray-600 border-white/50"
                )}>
                <div className={cn("w-2 h-2 rounded-full shrink-0", f.dot)} />
                <span>{f.count} {f.label}</span>
              </button>
            ))}
            {filterStatus && (
              <button onClick={() => setFilterStatus(null)} className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                × Hapus
              </button>
            )}
          </div>

          {/* Program list */}
          <div className="overflow-y-auto max-h-[520px] space-y-3 pr-0.5">
            {schedLoading ? (
              <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white/40 rounded-xl h-20" />)}</div>
            ) : ordered.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-sky-100 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-gray-400 text-sm">Belum ada program kerja.</p>
              </div>
            ) : (
              ordered.map(s => {
                const st = getStatus(s.status);
                const Icon = st.icon;
                return (
                  <div key={s.id} className={cn("bg-white/40 rounded-xl p-4 group transition-all hover:-translate-y-0.5 border border-white/60", s.status === "done" && "opacity-60")}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge className={cn("text-xs border flex items-center gap-1", st.color)}>
                            <Icon className="w-3 h-3" />{st.label}
                          </Badge>
                          <span className="text-xs text-gray-400">{formatDate(s.date)}</span>
                          {isKetSek && (
                            <div className="flex gap-1 ml-0.5">
                              {STATUS_OPTIONS.map(opt => {
                                const OptIcon = opt.icon;
                                const isActive = s.status === opt.id;
                                return (
                                  <button key={opt.id}
                                    onClick={() => handleStatusChange(s.id, opt.id as ProgramScheduleInputStatus)}
                                    disabled={update.isPending}
                                    title={opt.label}
                                    className={cn(
                                      "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all",
                                      isActive ? `bg-gradient-to-r ${opt.activeGrad} text-white border-transparent shadow` : "bg-white/50 text-gray-400 border-gray-200 hover:bg-white/80"
                                    )}
                                  >
                                    <OptIcon className="w-2.5 h-2.5" />{opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <h3 className={cn("font-bold text-gray-900 text-sm", s.status === "done" && "line-through")}>{s.programName}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={cn("w-4 h-4 rounded-full bg-gradient-to-br flex items-center justify-center text-white shrink-0", getMemberColor(s.leader))}>
                            <User className="w-2.5 h-2.5" />
                          </div>
                          <p className="text-xs text-gray-600">PJ: <span className="font-medium">{s.leader}</span></p>
                        </div>
                        {(s.members as string[]).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {(s.members as string[]).map(m => (
                              <span key={m} className="flex items-center gap-1 text-[11px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-full border border-sky-100">
                                <span className={cn("w-2.5 h-2.5 rounded-full bg-gradient-to-br inline-block shrink-0", getMemberColor(m))} />
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                        {s.notes && <p className="text-xs text-gray-400 mt-1.5">{s.notes}</p>}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(s)}><Pencil className="w-3 h-3 text-sky-500" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                            onClick={() => del.mutate({ id: s.id }, { onSuccess: () => { invalidateSched(); toast({ title: "Program dihapus" }); } })}>
                            <Trash2 className="w-3 h-3 text-rose-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Deadline ── */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center">
                <CalendarClock className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="font-bold text-gray-800">Deadline</h2>
            </div>
            {isDeadlineAdmin && (
              <Button onClick={dlOpenAdd} size="sm" className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-1.5 text-xs h-8 px-3">
                <Plus className="w-3.5 h-3.5" />Tambah
              </Button>
            )}
          </div>

          {/* Deadline list */}
          <div className="overflow-y-auto max-h-[552px] space-y-3 pr-0.5">
            {dlLoading ? (
              <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white/40 rounded-xl h-20" />)}</div>
            ) : dlSorted.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-gray-400 text-sm">Belum ada deadline.</p>
              </div>
            ) : (
              dlSorted.map(d => {
                const days = daysLeft(d.dueDate);
                const isOverdue = d.status === "pending" && days < 0;
                return (
                  <div key={d.id} className={cn("bg-white/40 rounded-xl p-4 group transition-all hover:-translate-y-0.5 border border-white/60", d.status === "done" ? "opacity-60" : "", isOverdue && "ring-2 ring-rose-300/50")}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <DaysLeftBadge dueDate={d.dueDate} status={d.status} />
                          <Badge className={cn("text-xs border", d.type === "tugas" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-teal-100 text-teal-700 border-teal-200")}>
                            {d.type === "tugas" ? "Tugas" : "Kegiatan"}
                          </Badge>
                        </div>
                        <h3 className={cn("font-semibold text-gray-900 text-sm", d.status === "done" && "line-through")}>{d.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Batas: {new Date(d.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        {(d.assignedTo as string[]).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {(d.assignedTo as string[]).map(m => <span key={m} className="text-xs bg-rose-100/80 text-rose-700 px-1.5 py-0.5 rounded-full">{m}</span>)}
                          </div>
                        )}
                        {d.notes && <p className="text-xs text-gray-400 mt-1">{d.notes}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {isDeadlineAdmin && d.status === "pending" && (
                          <Button
                            variant="ghost" size="sm"
                            className="text-emerald-600 hover:bg-emerald-50 rounded-full text-xs h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => dlUpdate.mutate({ id: d.id, data: { status: "done" } }, { onSuccess: () => { invalidateDl(); toast({ title: "Deadline ditandai selesai" }); } })}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Selesai
                          </Button>
                        )}
                        {isDeadlineAdmin && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => dlOpenEdit(d)}><Pencil className="w-3 h-3 text-sky-500" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => dlDel.mutate({ id: d.id }, { onSuccess: () => { invalidateDl(); toast({ title: "Deadline dihapus" }); } })}><Trash2 className="w-3 h-3 text-rose-500" /></Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <ProgramDialog open={open} onClose={() => setOpen(false)} editId={editId} initial={initForm} onSave={handleSave} isPending={create.isPending || update.isPending} />

      <Dialog open={dlOpen} onOpenChange={setDlOpen}>
        <DialogContent className="glass-panel border-white/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dlEditId ? "Edit Deadline" : "Tambah Deadline"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Judul deadline" value={dlForm.title} onChange={e => setDlForm(f => ({ ...f, title: e.target.value }))} className="bg-white/50" />
            <Select value={dlForm.type} onValueChange={v => setDlForm(f => ({ ...f, type: v as DeadlineInputType }))}>
              <SelectTrigger className="bg-white/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tugas">Tugas</SelectItem>
                <SelectItem value="kegiatan">Kegiatan</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Batas Waktu</label>
              <Input type="date" value={dlForm.dueDate} onChange={e => setDlForm(f => ({ ...f, dueDate: e.target.value }))} className="bg-white/50" />
            </div>
            <Select value={dlForm.status} onValueChange={v => setDlForm(f => ({ ...f, status: v as DeadlineInputStatus }))}>
              <SelectTrigger className="bg-white/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Belum Selesai</SelectItem>
                <SelectItem value="done">Selesai</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ditugaskan Kepada</label>
              <MemberCheckbox members={MEMBERS} selected={dlForm.assignedTo} onChange={m => setDlForm(f => ({ ...f, assignedTo: m }))} />
            </div>
            <Input placeholder="Catatan (opsional)" value={dlForm.notes} onChange={e => setDlForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/50" />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDlOpen(false)}>Batal</Button>
              <Button onClick={handleDlSave} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0" disabled={dlCreate.isPending || dlUpdate.isPending}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Absensi (full width below) ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
            <span className="text-sm">📋</span>
          </div>
          <h2 className="font-bold text-gray-800">Absensi</h2>
        </div>
        <div className="glass-card p-6">
          <AttendanceWidget memberName={memberName} isKetSek={isKetSek} isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </div>
  );
}
