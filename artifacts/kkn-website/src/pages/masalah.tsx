import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetComplaints,
  useGetIssues,
  useCreateComplaint,
  type ComplaintInputStatus,
  type IssueInputCategory,
  type IssueInputPriority,
  type IssueInputStatus,
  useUpdateComplaint,
  useDeleteComplaint,
  useCreateIssue,
  useUpdateIssue,
  useDeleteIssue,
  getGetComplaintsQueryKey,
  getGetIssuesQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Home, Briefcase, CheckCircle2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getApiErrorDesc, extractApiFieldErrors } from "@/lib/api-error";

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

const tabs = [
  { id: "life", label: "Our Life", icon: Home, desc: "Keluhan kehidupan sehari-hari di posko" },
  { id: "work", label: "Our Work", icon: Briefcase, desc: "Masalah dalam program kerja Putatsari Wellness" },
];

// ─── COMPLAINTS (Our Life) ────────────────────────────────────────────────────
function LifeTab({ isAdmin }: { isAdmin?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: complaints, isLoading } = useGetComplaints();
  const create = useCreateComplaint();
  const update = useUpdateComplaint();
  const del = useDeleteComplaint();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<{ title: string; description: string; reportedBy: string; status: ComplaintInputStatus }>({ title: "", description: "", reportedBy: "", status: "open" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetComplaintsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setForm({ title: "", description: "", reportedBy: "", status: "open" }); setFieldErrors({}); setOpen(true); }
  function openEdit(c: any) { setEditId(c.id); setForm({ title: c.title, description: c.description, reportedBy: c.reportedBy, status: c.status }); setFieldErrors({}); setOpen(true); }

  function handleSave() {
    if (!form.title || !form.description || !form.reportedBy) return;
    const payload = { title: form.title, description: form.description, reportedBy: form.reportedBy, status: form.status };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Keluhan diperbarui" }); },
        onError: (err) => { setFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
    } else {
      create.mutate({ data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Keluhan dicatat" }); },
        onError: (err) => { setFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
    }
  }

  function markResolved(id: number) {
    update.mutate({ id, data: { status: "resolved" } }, { onSuccess: () => { invalidate(); toast({ title: "Keluhan ditandai selesai ✓" }); } });
  }

  const open_count = complaints?.filter(c => c.status === "open").length ?? 0;
  const resolved_count = complaints?.filter(c => c.status === "resolved").length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-700">Keluhan Our Life</h2>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">{open_count} terbuka</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">{resolved_count} selesai</span>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-1">
            <Plus className="w-4 h-4" />Tambah
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="glass-card h-20 p-4" />)}</div>
      ) : !complaints?.length ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-sky-100 flex items-center justify-center">
            <Home className="w-6 h-6 text-rose-400" />
          </div>
          <p className="text-gray-400 text-sm text-center">Tidak ada keluhan Our Life yang tercatat.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c.id} className={cn("glass-card p-4 group transition-all hover:-translate-y-0.5", c.status === "resolved" && "opacity-60")}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={cn("text-xs border", c.status === "open" ? "bg-violet-100 text-violet-700 border-violet-200" : "bg-emerald-100 text-emerald-700 border-emerald-200")}>
                      {c.status === "open" ? "Terbuka" : "Selesai"}
                    </Badge>
                    <div className={cn("w-4 h-4 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[8px] font-bold shrink-0", getMemberColor(c.reportedBy))}>
                      <User className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-xs text-gray-400">{c.reportedBy}</span>
                  </div>
                  <h3 className={cn("font-semibold text-gray-900", c.status === "resolved" && "line-through")}>{c.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {isAdmin && c.status === "open" && (
                    <Button size="sm" onClick={() => markResolved(c.id)} disabled={update.isPending}
                      className="rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 gap-1 px-2 h-7">
                      <CheckCircle2 className="w-3.5 h-3.5" />Selesai
                    </Button>
                  )}
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(c)}>
                        <Pencil className="w-3.5 h-3.5 text-sky-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                        onClick={() => del.mutate({ id: c.id }, { onSuccess: () => { invalidate(); toast({ title: "Keluhan dihapus" }); } })}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="form-dialog border-white/50 max-w-md p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-rose-400/15 to-violet-400/15">
            <DialogHeader><DialogTitle>{editId ? "Edit Keluhan" : "Catat Keluhan Our Life"}</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Judul Keluhan</label>
              <Input placeholder="Judul keluhan..." value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setFieldErrors(fe => ({ ...fe, title: "" })); }} className="bg-white/90" />
              {fieldErrors.title && <p className="text-xs text-rose-500 mt-1">{fieldErrors.title}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Deskripsi</label>
              <Textarea placeholder="Ceritakan keluhannya..." value={form.description} onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setFieldErrors(fe => ({ ...fe, description: "" })); }} rows={3} className="bg-white/90" />
              {fieldErrors.description && <p className="text-xs text-rose-500 mt-1">{fieldErrors.description}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-2 block">Dilaporkan Oleh</label>
              <div className="grid grid-cols-3 gap-2">
                {MEMBERS.map(m => (
                  <button key={m} onClick={() => setForm(f => ({ ...f, reportedBy: m }))} className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs transition-all",
                    form.reportedBy === m ? "border-rose-400 bg-rose-50 shadow-sm" : "border-violet-200/40 bg-white/60 hover:bg-white shadow-sm"
                  )}>
                    <div className={cn("w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[9px] font-bold", getMemberColor(m))}>
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-center leading-tight text-gray-700 line-clamp-2 text-[10px]">{m}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Status</label>
              <div className="flex gap-2">
                {[{ id: "open", label: "Terbuka" }, { id: "resolved", label: "Selesai" }].map(s => (
                  <button key={s.id} onClick={() => setForm(f => ({ ...f, status: s.id as ComplaintInputStatus }))} className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all",
                    form.status === s.id
                      ? s.id === "open" ? "bg-violet-400 text-white border-violet-400 shadow" : "bg-emerald-500 text-white border-emerald-500 shadow"
                      : "bg-white/90 text-violet-600 border-violet-200/40 hover:bg-white shadow-sm"
                  )}>{s.label}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full" disabled={create.isPending || update.isPending}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ISSUES (Our Work) ────────────────────────────────────────────────────────
const ISSUE_CATEGORIES = [
  { id: "proker", label: "Proker", emoji: "📋", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { id: "administrasi", label: "Administrasi", emoji: "📄", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { id: "logistik", label: "Logistik", emoji: "📦", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { id: "lainnya", label: "Lainnya", emoji: "🔧", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

function getCatInfo(cat: string) { return ISSUE_CATEGORIES.find(c => c.id === cat) ?? ISSUE_CATEGORIES[3]; }

const priorityClass: Record<string, string> = {
  high: "bg-rose-100 text-rose-700 border-rose-200",
  medium: "bg-violet-100 text-violet-700 border-violet-200",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};
const priorityLabel: Record<string, string> = { high: "Tinggi", medium: "Sedang", low: "Rendah" };
const statusClass: Record<string, string> = {
  open: "bg-rose-100 text-rose-700 border-rose-200",
  in_progress: "bg-violet-100 text-violet-700 border-violet-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
};
const statusLabel: Record<string, string> = { open: "Terbuka", in_progress: "Diproses", resolved: "Selesai" };

function WorkTab({ isAdmin }: { isAdmin?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: issues, isLoading } = useGetIssues();
  const create = useCreateIssue();
  const update = useUpdateIssue();
  const del = useDeleteIssue();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<{ title: string; description: string; category: IssueInputCategory; priority: IssueInputPriority; status: IssueInputStatus }>({ title: "", description: "", category: "proker", priority: "medium", status: "open" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetIssuesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setForm({ title: "", description: "", category: "proker", priority: "medium", status: "open" }); setFieldErrors({}); setOpen(true); }
  function openEdit(i: any) { setEditId(i.id); setForm({ title: i.title, description: i.description, category: i.category, priority: i.priority, status: i.status }); setFieldErrors({}); setOpen(true); }

  function handleSave() {
    if (!form.title || !form.description) return;
    if (editId !== null) {
      update.mutate({ id: editId, data: form }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Masalah diperbarui" }); },
        onError: (err) => { setFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
    } else {
      create.mutate({ data: form }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Masalah dicatat" }); },
        onError: (err) => { setFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
    }
  }

  function markResolved(id: number) {
    update.mutate({ id, data: { status: "resolved" } }, { onSuccess: () => { invalidate(); toast({ title: "Masalah ditandai selesai ✓" }); } });
  }

  const open_count = issues?.filter(i => i.status !== "resolved").length ?? 0;
  const resolved_count = issues?.filter(i => i.status === "resolved").length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-700">Masalah Our Work</h2>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">{open_count} terbuka</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">{resolved_count} selesai</span>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-1">
            <Plus className="w-4 h-4" />Tambah
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-20 p-4" />)}</div>
      ) : !issues?.length ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-sky-100 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-sky-400" />
          </div>
          <p className="text-gray-400 text-sm text-center">Tidak ada masalah Our Work yang tercatat.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map(issue => {
            const cat = getCatInfo(issue.category);
            return (
              <div key={issue.id} className={cn("glass-card p-4 group transition-all hover:-translate-y-0.5", issue.status === "resolved" && "opacity-60")}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge className={cn("text-xs border", priorityClass[issue.priority] ?? priorityClass.medium)}>
                        {priorityLabel[issue.priority] ?? issue.priority}
                      </Badge>
                      <Badge className={cn("text-xs border", statusClass[issue.status] ?? statusClass.open)}>
                        {statusLabel[issue.status] ?? issue.status}
                      </Badge>
                      <Badge className={cn("text-xs border flex items-center gap-1", cat.color)}>
                        <span>{cat.emoji}</span>{cat.label}
                      </Badge>
                    </div>
                    <h3 className={cn("font-semibold text-gray-900", issue.status === "resolved" && "line-through")}>{issue.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {isAdmin && issue.status !== "resolved" && (
                      <Button size="sm" onClick={() => markResolved(issue.id)} disabled={update.isPending}
                        className="rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 gap-1 px-2 h-7">
                        <CheckCircle2 className="w-3.5 h-3.5" />Selesai
                      </Button>
                    )}
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(issue)}>
                          <Pencil className="w-3.5 h-3.5 text-sky-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                          onClick={() => del.mutate({ id: issue.id }, { onSuccess: () => { invalidate(); toast({ title: "Masalah dihapus" }); } })}>
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="form-dialog border-white/50 max-w-md p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-sky-400/15 to-violet-400/15">
            <DialogHeader><DialogTitle>{editId ? "Edit Masalah" : "Catat Masalah Our Work"}</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Judul Masalah</label>
              <Input placeholder="Judul masalah..." value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setFieldErrors(fe => ({ ...fe, title: "" })); }} className="bg-white/90" />
              {fieldErrors.title && <p className="text-xs text-rose-500 mt-1">{fieldErrors.title}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Deskripsi</label>
              <Textarea placeholder="Ceritakan masalahnya..." value={form.description} onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setFieldErrors(fe => ({ ...fe, description: "" })); }} rows={3} className="bg-white/90" />
              {fieldErrors.description && <p className="text-xs text-rose-500 mt-1">{fieldErrors.description}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Kategori</label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setForm(f => ({ ...f, category: cat.id as IssueInputCategory }))} className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm transition-all",
                    form.category === cat.id ? cat.color + " border-current shadow-sm" : "bg-white/90 text-violet-600 border-violet-200/40 hover:bg-white shadow-sm"
                  )}>
                    <span>{cat.emoji}</span><span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Prioritas</label>
              <div className="flex gap-2">
                {[{ id: "high", label: "🔴 Tinggi" }, { id: "medium", label: "🟡 Sedang" }, { id: "low", label: "🟢 Rendah" }].map(p => (
                  <button key={p.id} onClick={() => setForm(f => ({ ...f, priority: p.id as IssueInputPriority }))} className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                    form.priority === p.id
                      ? p.id === "high" ? "bg-rose-500 text-white border-rose-500 shadow"
                        : p.id === "medium" ? "bg-violet-400 text-white border-violet-400 shadow"
                        : "bg-emerald-500 text-white border-emerald-500 shadow"
                      : "bg-white/90 text-violet-600 border-violet-200/40 hover:bg-white shadow-sm"
                  )}>{p.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Status</label>
              <div className="flex gap-2">
                {[{ id: "open", label: "Terbuka" }, { id: "in_progress", label: "Diproses" }, { id: "resolved", label: "Selesai" }].map(s => (
                  <button key={s.id} onClick={() => setForm(f => ({ ...f, status: s.id as IssueInputStatus }))} className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                    form.status === s.id
                      ? s.id === "open" ? "bg-rose-500 text-white border-rose-500 shadow"
                        : s.id === "in_progress" ? "bg-violet-400 text-white border-violet-400 shadow"
                        : "bg-emerald-500 text-white border-emerald-500 shadow"
                      : "bg-white/90 text-violet-600 border-violet-200/40 hover:bg-white shadow-sm"
                  )}>{s.label}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full" disabled={create.isPending || update.isPending}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function MasalahPage() {
  const [activeTab, setActiveTab] = useState("life");
  const { can } = useAuth();
  const isAdmin = can("masalah");
  const { data: complaints } = useGetComplaints();
  const { data: issues } = useGetIssues();

  const lifeCount = complaints?.filter(c => c.status === "open").length ?? 0;
  const workCount = issues?.filter(i => i.status !== "resolved").length ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">Masalah</h1>
        <p className="text-gray-500 text-sm mt-1">Kendala dan keluhan dari kehidupan maupun program kerja</p>
      </div>

      <div className="flex gap-2 p-1 bg-white/60 backdrop-blur-sm border-violet-200/50 rounded-2xl border border-white/40">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const count = tab.id === "life" ? lifeCount : workCount;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-rose-400 to-sky-400 text-white shadow-sm"
                  : "text-gray-600 hover:text-violet-800 hover:bg-white/90 border-violet-200/50"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0",
                  activeTab === tab.id ? "bg-white/30 text-white" : "bg-rose-100 text-rose-600"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="glass-card p-6">
        <p className="text-xs text-gray-400 mb-4">
          {activeTab === "life" ? tabs[0].desc : tabs[1].desc}
        </p>
        {activeTab === "life" && <LifeTab isAdmin={isAdmin} />}
        {activeTab === "work" && <WorkTab isAdmin={isAdmin} />}
      </div>
    </div>
  );
}
