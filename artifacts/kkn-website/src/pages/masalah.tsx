import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetComplaints,
  useGetIssues,
  useGetAuthMe,
  useCreateComplaint,
  useUpdateComplaint,
  useDeleteComplaint,
  useCreateIssue,
  useUpdateIssue,
  useDeleteIssue,
  getGetComplaintsQueryKey,
  getGetIssuesQueryKey,
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
import { Plus, Pencil, Trash2, Home, Briefcase, AlertTriangle } from "lucide-react";
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
  { id: "life", label: "Our Life", icon: Home, desc: "Keluhan kehidupan sehari-hari di posko" },
  { id: "work", label: "Our Work", icon: Briefcase, desc: "Masalah dalam program kerja KKN" },
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
  const [form, setForm] = useState({ title: "", description: "", reportedBy: "", status: "open" });

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetComplaintsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setForm({ title: "", description: "", reportedBy: "", status: "open" }); setOpen(true); }
  function openEdit(c: any) { setEditId(c.id); setForm({ title: c.title, description: c.description, reportedBy: c.reportedBy, status: c.status }); setOpen(true); }

  function handleSave() {
    if (!form.title || !form.description || !form.reportedBy) return;
    const payload = { title: form.title, description: form.description, reportedBy: form.reportedBy, status: form.status };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Keluhan diperbarui" }); } });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Keluhan dicatat" }); } });
    }
  }

  const open_count = complaints?.filter(c => c.status === "open").length ?? 0;
  const resolved_count = complaints?.filter(c => c.status === "resolved").length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-700">Keluhan Our Life</h2>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{open_count} terbuka</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{resolved_count} selesai</span>
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
            <div key={c.id} className="glass-card p-4 group transition-all hover:-translate-y-0.5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={cn("text-xs border", c.status === "open" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200")}>
                      {c.status === "open" ? "Terbuka" : "Selesai"}
                    </Badge>
                    <span className="text-xs text-gray-400">dilaporkan oleh {c.reportedBy}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                </div>
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
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-panel border-white/50">
          <DialogHeader><DialogTitle>{editId ? "Edit Keluhan" : "Catat Keluhan Our Life"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Judul keluhan" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-white/50" />
            <Textarea placeholder="Deskripsi keluhan..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="bg-white/50" />
            <Select value={form.reportedBy} onValueChange={v => setForm(f => ({ ...f, reportedBy: v }))}>
              <SelectTrigger className="bg-white/50"><SelectValue placeholder="Dilaporkan oleh..." /></SelectTrigger>
              <SelectContent>{MEMBERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="bg-white/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Terbuka</SelectItem>
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

// ─── ISSUES (Our Work) ────────────────────────────────────────────────────────
function WorkTab({ isAdmin }: { isAdmin?: boolean }) {
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
      create.mutate({ data: form }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Masalah dicatat" }); } });
    }
  }

  const priorityClass: Record<string, string> = {
    high: "bg-rose-100 text-rose-700 border-rose-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  const priorityLabel: Record<string, string> = { high: "Tinggi", medium: "Sedang", low: "Rendah" };
  const statusClass: Record<string, string> = {
    open: "bg-rose-100 text-rose-700 border-rose-200",
    in_progress: "bg-amber-100 text-amber-700 border-amber-200",
    resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  const statusLabel: Record<string, string> = { open: "Terbuka", in_progress: "Diproses", resolved: "Selesai" };
  const catLabel: Record<string, string> = { proker: "Proker", administrasi: "Administrasi", logistik: "Logistik", lainnya: "Lainnya" };

  const open_count = issues?.filter(i => i.status !== "resolved").length ?? 0;
  const resolved_count = issues?.filter(i => i.status === "resolved").length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-700">Masalah Our Work</h2>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{open_count} terbuka</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{resolved_count} selesai</span>
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
          {issues.map(issue => (
            <div key={issue.id} className="glass-card p-4 group transition-all hover:-translate-y-0.5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge className={cn("text-xs border", priorityClass[issue.priority] ?? priorityClass.medium)}>
                      {priorityLabel[issue.priority] ?? issue.priority}
                    </Badge>
                    <Badge className={cn("text-xs border", statusClass[issue.status] ?? statusClass.open)}>
                      {statusLabel[issue.status] ?? issue.status}
                    </Badge>
                    <span className="text-xs text-gray-400">{catLabel[issue.category] ?? issue.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                </div>
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
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-panel border-white/50">
          <DialogHeader><DialogTitle>{editId ? "Edit Masalah" : "Catat Masalah Our Work"}</DialogTitle></DialogHeader>
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function MasalahPage() {
  const [activeTab, setActiveTab] = useState("life");
  const { data: auth } = useGetAuthMe();
  const isAdmin = auth?.isAdmin;
  const { data: complaints } = useGetComplaints();
  const { data: issues } = useGetIssues();

  const lifeCount = complaints?.filter(c => c.status === "open").length ?? 0;
  const workCount = issues?.filter(i => i.status !== "resolved").length ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
          Masalah
        </h1>
        <p className="text-gray-500 text-sm mt-1">Kendala dan keluhan dari kehidupan maupun program kerja</p>
      </div>

      <div className="flex gap-2 p-1 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const count = tab.id === "life" ? lifeCount : workCount;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-rose-400 to-sky-400 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold",
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
