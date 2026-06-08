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
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { AttendanceWidget } from "@/components/AttendanceWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, CalendarDays, CheckCircle2, Clock, Loader2, User } from "lucide-react";
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

export default function OurWorkPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { can, memberName, role, isLoggedIn } = useAuth();
  const isKetSek = role === "ketua" || role === "sekretaris";
  const { data: schedules, isLoading } = useGetProgramSchedules();
  const create = useCreateProgramSchedule();
  const update = useUpdateProgramSchedule();
  const del = useDeleteProgramSchedule();
  const isAdmin = can("our-work");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const defaultForm: ProgramForm = { programName: "", date: today(), leader: "", members: [], status: "planned", notes: "" };
  const [initForm, setInitForm] = useState<ProgramForm>(defaultForm);

  function invalidate() {
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
      update.mutate({ id: editId, data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Program diperbarui" }); } });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Program ditambahkan" }); } });
    }
  }

  function handleStatusChange(id: number, status: ProgramScheduleInputStatus) {
    update.mutate({ id, data: { status } }, { onSuccess: () => { invalidate(); toast({ title: `Status diperbarui: ${getStatus(status).label}` }); } });
  }

  const all = schedules ?? [];
  const filtered = filterStatus ? all.filter(s => s.status === filterStatus) : all;
  const ordered = [...filtered.filter(s => s.status === "ongoing"), ...filtered.filter(s => s.status === "planned"), ...filtered.filter(s => s.status === "done")];

  const counts = {
    ongoing: all.filter(s => s.status === "ongoing").length,
    planned: all.filter(s => s.status === "planned").length,
    done: all.filter(s => s.status === "done").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">Our Work</h1>
          <p className="text-gray-500 text-sm mt-1">Jadwal program kerja dan absensi anggota</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-2">
            <Plus className="w-4 h-4" />Tambah Program
          </Button>
        )}
      </div>

      {/* Status summary — clickable filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { id: "ongoing", label: "Berjalan", dot: "bg-amber-400", active: "bg-amber-50 border-amber-300 text-amber-700", count: counts.ongoing },
          { id: "planned", label: "Direncanakan", dot: "bg-violet-400", active: "bg-violet-50 border-violet-300 text-violet-700", count: counts.planned },
          { id: "done", label: "Selesai", dot: "bg-emerald-400", active: "bg-emerald-50 border-emerald-300 text-emerald-700", count: counts.done },
        ].map(f => (
          <button key={f.id} onClick={() => setFilterStatus(filterStatus === f.id ? null : f.id)}
            className={cn(
              "px-4 py-2 flex items-center gap-2 rounded-2xl border transition-all text-sm font-medium",
              filterStatus === f.id ? f.active + " shadow-sm" : "glass-card hover:shadow-sm text-gray-600"
            )}>
            <div className={cn("w-2 h-2 rounded-full shrink-0", f.dot)} />
            <span>{f.count} {f.label}</span>
          </button>
        ))}
        {filterStatus && (
          <button onClick={() => setFilterStatus(null)} className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            × Hapus filter
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-24" />)}</div>
      ) : ordered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-sky-100 flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-rose-400" />
          </div>
          <p className="text-gray-400 text-sm">Belum ada program kerja terjadwal.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ordered.map(s => {
            const st = getStatus(s.status);
            const Icon = st.icon;
            return (
              <div key={s.id} className={cn("glass-card p-5 group transition-all hover:-translate-y-0.5", s.status === "done" && "opacity-60")}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className={cn("text-xs border flex items-center gap-1", st.color)}>
                        <Icon className="w-3 h-3" />{st.label}
                      </Badge>
                      <span className="text-xs text-gray-400">{formatDate(s.date)}</span>
                      {isKetSek && (
                        <div className="flex gap-1 ml-1">
                          {STATUS_OPTIONS.map(opt => {
                            const OptIcon = opt.icon;
                            const isActive = s.status === opt.id;
                            return (
                              <button key={opt.id}
                                onClick={() => handleStatusChange(s.id, opt.id as ProgramScheduleInputStatus)}
                                disabled={update.isPending}
                                title={opt.label}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all",
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
                    <h3 className={cn("font-bold text-gray-900 text-base", s.status === "done" && "line-through")}>{s.programName}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className={cn("w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[8px] font-bold shrink-0", getMemberColor(s.leader))}>
                        <User className="w-3 h-3" />
                      </div>
                      <p className="text-sm text-gray-600">PJ: <span className="font-medium">{s.leader}</span></p>
                    </div>
                    {(s.members as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(s.members as string[]).map(m => (
                          <span key={m} className="flex items-center gap-1 text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-100">
                            <span className={cn("w-3 h-3 rounded-full bg-gradient-to-br inline-block shrink-0", getMemberColor(m))} />
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                    {s.notes && <p className="text-xs text-gray-400 mt-2">{s.notes}</p>}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5 text-sky-500" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                        onClick={() => del.mutate({ id: s.id }, { onSuccess: () => { invalidate(); toast({ title: "Program dihapus" }); } })}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProgramDialog open={open} onClose={() => setOpen(false)} editId={editId} initial={initForm} onSave={handleSave} isPending={create.isPending || update.isPending} />

      {/* ── Absensi ── */}
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
