import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetProgramSchedules,
  useGetIssues,
  useGetTemplates,
  useGetAuthMe,
  useCreateProgramSchedule,
  useUpdateProgramSchedule,
  useDeleteProgramSchedule,
  useCreateIssue,
  useUpdateIssue,
  useDeleteIssue,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  getGetProgramSchedulesQueryKey,
  getGetIssuesQueryKey,
  getGetTemplatesQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, CalendarDays, AlertTriangle, FileText, Copy } from "lucide-react";
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

const tabs = [
  { id: "jadwal", label: "Jadwal Program", icon: CalendarDays },
  { id: "masalah", label: "Masalah Proker", icon: AlertTriangle },
  { id: "template", label: "Template", icon: FileText },
];

function today() { return new Date().toISOString().split("T")[0]; }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
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
          selected.includes(m) ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-white/40 border-white/40 text-gray-700 hover:bg-white/60"
        )}>
          <input type="checkbox" checked={selected.includes(m)} onChange={() => toggle(m)} className="hidden" />
          <span className={cn("w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center", selected.includes(m) ? "bg-sky-400 border-sky-400" : "border-gray-300")}>
            {selected.includes(m) && <span className="text-white text-[10px] font-bold">v</span>}
          </span>
          {m}
        </label>
      ))}
    </div>
  );
}

const statusLabel: Record<string, string> = { planned: "Direncanakan", ongoing: "Berjalan", done: "Selesai" };
const statusClass: Record<string, string> = {
  planned: "bg-sky-100 text-sky-700 border-sky-200",
  ongoing: "bg-amber-100 text-amber-700 border-amber-200",
  done: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const priorityLabel: Record<string, string> = { low: "Rendah", medium: "Sedang", high: "Tinggi" };
const priorityClass: Record<string, string> = {
  high: "bg-rose-100 text-rose-700 border-rose-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const issueStatusLabel: Record<string, string> = { open: "Terbuka", in_progress: "Diproses", resolved: "Selesai" };
const issueStatusClass: Record<string, string> = {
  open: "bg-rose-100 text-rose-700 border-rose-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

// ─── JADWAL PROGRAM TAB ────────────────────────────────────────────────────────
function JadwalTab({ isAdmin }: { isAdmin?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: schedules, isLoading } = useGetProgramSchedules();
  const create = useCreateProgramSchedule();
  const update = useUpdateProgramSchedule();
  const del = useDeleteProgramSchedule();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ programName: "", date: today(), leader: "", members: [] as string[], status: "planned", notes: "" });

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetProgramSchedulesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setForm({ programName: "", date: today(), leader: "", members: [], status: "planned", notes: "" }); setOpen(true); }
  function openEdit(s: any) { setEditId(s.id); setForm({ programName: s.programName, date: s.date, leader: s.leader, members: s.members as string[], status: s.status, notes: s.notes ?? "" }); setOpen(true); }

  function handleSave() {
    if (!form.programName || !form.leader) return;
    const payload = { programName: form.programName, date: form.date, leader: form.leader, members: form.members, status: form.status, notes: form.notes || undefined };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Jadwal diperbarui" }); } });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Jadwal ditambahkan" }); } });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Jadwal Program Kejar</h2>
        {isAdmin && <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-1"><Plus className="w-4 h-4" />Tambah</Button>}
      </div>
      {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-24 p-4" />)}</div> :
        !schedules?.length ? <div className="text-center py-12 text-gray-400">Belum ada program kerja terjadwal.</div> :
        <div className="space-y-3">
          {schedules.map(s => (
            <div key={s.id} className="glass-card p-4 group transition-all hover:-translate-y-0.5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={cn("text-xs border", statusClass[s.status] ?? statusClass.planned)}>{statusLabel[s.status] ?? s.status}</Badge>
                    <span className="text-xs text-gray-400">{formatDate(s.date)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{s.programName}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">PJ: {s.leader}</p>
                  {(s.members as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(s.members as string[]).map(m => <span key={m} className="text-xs bg-sky-100/80 text-sky-700 px-2 py-0.5 rounded-full">{m}</span>)}
                    </div>
                  )}
                  {s.notes && <p className="text-xs text-gray-400 mt-1">{s.notes}</p>}
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5 text-sky-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => del.mutate({ id: s.id }, { onSuccess: () => { invalidate(); toast({ title: "Jadwal dihapus" }); } })}><Trash2 className="w-3.5 h-3.5 text-rose-500" /></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      }
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-panel border-white/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Program" : "Tambah Program"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Nama program" value={form.programName} onChange={e => setForm(f => ({ ...f, programName: e.target.value }))} className="bg-white/50" />
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal</label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-white/50" />
            </div>
            <Select value={form.leader} onValueChange={v => setForm(f => ({ ...f, leader: v }))}>
              <SelectTrigger className="bg-white/50"><SelectValue placeholder="Penanggung Jawab" /></SelectTrigger>
              <SelectContent>{MEMBERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Anggota Tim</label>
              <MemberCheckbox members={MEMBERS} selected={form.members} onChange={m => setForm(f => ({ ...f, members: m }))} />
            </div>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="bg-white/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Direncanakan</SelectItem>
                <SelectItem value="ongoing">Berjalan</SelectItem>
                <SelectItem value="done">Selesai</SelectItem>
              </SelectContent>
            </Select>
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

// ─── ISSUES TAB ────────────────────────────────────────────────────────────────
function IssuesTab({ isAdmin }: { isAdmin?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: issues, isLoading } = useGetIssues();
  const create = useCreateIssue();
  const update = useUpdateIssue();
  const del = useDeleteIssue();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "proker", priority: "medium", status: "open" });

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetIssuesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setForm({ title: "", description: "", category: "proker", priority: "medium", status: "open" }); setOpen(true); }
  function openEdit(i: any) { setEditId(i.id); setForm({ title: i.title, description: i.description, category: i.category, priority: i.priority, status: i.status }); setOpen(true); }

  function handleSave() {
    if (!form.title || !form.description) return;
    if (editId !== null) {
      update.mutate({ id: editId, data: form }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Masalah diperbarui" }); } });
    } else {
      create.mutate({ data: form }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Masalah ditambahkan" }); } });
    }
  }

  const categoryLabel: Record<string, string> = { proker: "Proker", administrasi: "Administrasi", logistik: "Logistik", lainnya: "Lainnya" };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Masalah Proker</h2>
        {isAdmin && <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-1"><Plus className="w-4 h-4" />Tambah</Button>}
      </div>
      {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-20 p-4" />)}</div> :
        !issues?.length ? <div className="text-center py-12 text-gray-400">Tidak ada masalah yang dicatat.</div> :
        <div className="space-y-3">
          {issues.map(issue => (
            <div key={issue.id} className="glass-card p-4 group transition-all hover:-translate-y-0.5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge className={cn("text-xs border", priorityClass[issue.priority] ?? priorityClass.medium)}>{priorityLabel[issue.priority] ?? issue.priority}</Badge>
                    <Badge className={cn("text-xs border", issueStatusClass[issue.status] ?? issueStatusClass.open)}>{issueStatusLabel[issue.status] ?? issue.status}</Badge>
                    <span className="text-xs text-gray-400">{categoryLabel[issue.category] ?? issue.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(issue)}><Pencil className="w-3.5 h-3.5 text-sky-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => del.mutate({ id: issue.id }, { onSuccess: () => { invalidate(); toast({ title: "Masalah dihapus" }); } })}><Trash2 className="w-3.5 h-3.5 text-rose-500" /></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      }
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-panel border-white/50">
          <DialogHeader><DialogTitle>{editId ? "Edit Masalah" : "Tambah Masalah"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Judul masalah" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-white/50" />
            <Textarea placeholder="Deskripsi masalah..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="bg-white/50" />
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="bg-white/50"><SelectValue placeholder="Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="proker">Proker</SelectItem>
                <SelectItem value="administrasi">Administrasi</SelectItem>
                <SelectItem value="logistik">Logistik</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
              <SelectTrigger className="bg-white/50"><SelectValue placeholder="Prioritas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Tinggi</SelectItem>
                <SelectItem value="medium">Sedang</SelectItem>
                <SelectItem value="low">Rendah</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="bg-white/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Terbuka</SelectItem>
                <SelectItem value="in_progress">Diproses</SelectItem>
                <SelectItem value="resolved">Selesai</SelectItem>
              </SelectContent>
            </Select>
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

// ─── TEMPLATES TAB ────────────────────────────────────────────────────────────────
function TemplatesTab({ isAdmin }: { isAdmin?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: templates, isLoading } = useGetTemplates();
  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const del = useDeleteTemplate();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", category: "laporan", content: "" });
  const [viewing, setViewing] = useState<any | null>(null);

  function invalidate() { qc.invalidateQueries({ queryKey: getGetTemplatesQueryKey() }); }

  function openAdd() { setEditId(null); setForm({ title: "", category: "laporan", content: "" }); setOpen(true); }
  function openEdit(t: any) { setEditId(t.id); setForm({ title: t.title, category: t.category, content: t.content }); setOpen(true); }

  function handleSave() {
    if (!form.title || !form.content) return;
    if (editId !== null) {
      update.mutate({ id: editId, data: form }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Template diperbarui" }); } });
    } else {
      create.mutate({ data: form }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Template ditambahkan" }); } });
    }
  }

  const catLabel: Record<string, string> = { laporan: "Laporan", administrasi: "Administrasi", surat: "Surat", lainnya: "Lainnya" };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Template Pekerjaan</h2>
        {isAdmin && <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-1"><Plus className="w-4 h-4" />Tambah</Button>}
      </div>
      {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-16 p-4" />)}</div> :
        !templates?.length ? <div className="text-center py-12 text-gray-400">Belum ada template.</div> :
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map(t => (
            <div key={t.id} className="glass-card p-4 group transition-all hover:-translate-y-0.5 cursor-pointer" onClick={() => setViewing(t)}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="text-xs bg-sky-100 text-sky-700 border-sky-200 border">{catLabel[t.category] ?? t.category}</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{t.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.content}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5 text-sky-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => del.mutate({ id: t.id }, { onSuccess: () => { invalidate(); toast({ title: "Template dihapus" }); } })}><Trash2 className="w-3.5 h-3.5 text-rose-500" /></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      }
      {/* View template dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="glass-panel border-white/50 max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-4">
              <span>{viewing?.title}</span>
              <Button size="sm" variant="outline" className="rounded-full gap-1" onClick={() => { navigator.clipboard.writeText(viewing?.content ?? ""); toast({ title: "Disalin ke clipboard" }); }}>
                <Copy className="w-3.5 h-3.5" /> Salin
              </Button>
            </DialogTitle>
          </DialogHeader>
          <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap overflow-y-auto max-h-[50vh] bg-white/40 rounded-xl p-4 font-sans">
            {viewing?.content}
          </pre>
        </DialogContent>
      </Dialog>
      {/* Edit/Add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-panel border-white/50 max-w-2xl">
          <DialogHeader><DialogTitle>{editId ? "Edit Template" : "Tambah Template"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Judul template" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-white/50" />
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="bg-white/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="laporan">Laporan</SelectItem>
                <SelectItem value="administrasi">Administrasi</SelectItem>
                <SelectItem value="surat">Surat</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Isi template..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="bg-white/50 font-mono text-sm" />
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProkerPage() {
  const [activeTab, setActiveTab] = useState("jadwal");
  const { data: auth } = useGetAuthMe();
  const isAdmin = auth?.isAdmin;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
          Program Kerja
        </h1>
        <p className="text-gray-500 text-sm mt-1">Jadwal, masalah, dan template proker Putatsari Wellness</p>
      </div>

      <div className="flex gap-2 p-1 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 w-fit flex-wrap">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-rose-400 to-sky-400 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="glass-card p-6">
        {activeTab === "jadwal" && <JadwalTab isAdmin={isAdmin} />}
        {activeTab === "masalah" && <IssuesTab isAdmin={isAdmin} />}
        {activeTab === "template" && <TemplatesTab isAdmin={isAdmin} />}
      </div>
    </div>
  );
}
