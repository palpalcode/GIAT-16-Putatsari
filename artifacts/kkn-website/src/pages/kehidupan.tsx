import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCookingSchedules,
  useGetCleaningSchedules,
  useGetComplaints,
  useGetAuthMe,
  useCreateCookingSchedule,
  useUpdateCookingSchedule,
  useDeleteCookingSchedule,
  useCreateCleaningSchedule,
  useUpdateCleaningSchedule,
  useDeleteCleaningSchedule,
  useCreateComplaint,
  useUpdateComplaint,
  useDeleteComplaint,
  getGetCookingSchedulesQueryKey,
  getGetCleaningSchedulesQueryKey,
  getGetComplaintsQueryKey,
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
import { Plus, Pencil, Trash2, ChefHat, SprayCan, MessageCircleWarning } from "lucide-react";
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
  { id: "masak", label: "Jadwal Masak", icon: ChefHat },
  { id: "bersih", label: "Bersih-Bersih", icon: SprayCan },
  { id: "keluhan", label: "Keluhan Harian", icon: MessageCircleWarning },
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
          selected.includes(m) ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-white/40 border-white/40 text-gray-700 hover:bg-white/60"
        )}>
          <input type="checkbox" checked={selected.includes(m)} onChange={() => toggle(m)} className="hidden" />
          <span className={cn("w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors", selected.includes(m) ? "bg-rose-400 border-rose-400" : "border-gray-300")}>
            {selected.includes(m) && <span className="text-white text-[10px] font-bold">v</span>}
          </span>
          {m}
        </label>
      ))}
    </div>
  );
}

// ─── COOKING TAB ────────────────────────────────────────────────────────────────
function CookingTab({ isAdmin }: { isAdmin?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: schedules, isLoading } = useGetCookingSchedules();
  const create = useCreateCookingSchedule();
  const update = useUpdateCookingSchedule();
  const del = useDeleteCookingSchedule();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ date: today(), persons: [] as string[], menu: "", notes: "" });

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetCookingSchedulesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setForm({ date: today(), persons: [], menu: "", notes: "" }); setOpen(true); }
  function openEdit(s: any) { setEditId(s.id); setForm({ date: s.date, persons: s.persons as string[], menu: s.menu ?? "", notes: s.notes ?? "" }); setOpen(true); }

  function handleSave() {
    const payload = { date: form.date, persons: form.persons, menu: form.menu || undefined, notes: form.notes || undefined };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Jadwal diperbarui" }); } });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Jadwal ditambahkan" }); } });
    }
  }

  const todayStr = today();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Jadwal Masak</h2>
        {isAdmin && <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-1"><Plus className="w-4 h-4" />Tambah</Button>}
      </div>
      {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-20 p-4" />)}</div> :
        !schedules?.length ? <div className="text-center py-12 text-gray-400">Belum ada jadwal masak.</div> :
        <div className="space-y-3">
          {schedules.map(s => (
            <div key={s.id} className={cn("glass-card p-4 group transition-all", s.date === todayStr && "ring-2 ring-rose-300/50")}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {s.date === todayStr && <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-xs">Hari Ini</Badge>}
                    <span className="text-sm font-semibold text-gray-800">{formatDate(s.date)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(s.persons as string[]).map(p => (
                      <span key={p} className="text-xs bg-sky-100/80 text-sky-700 px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                  {s.menu && <p className="text-sm text-gray-600"><span className="font-medium">Menu:</span> {s.menu}</p>}
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
        <DialogContent className="glass-panel border-white/50">
          <DialogHeader><DialogTitle>{editId ? "Edit Jadwal Masak" : "Tambah Jadwal Masak"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal</label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-white/50" />
            </div>
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Petugas</label>
              <MemberCheckbox members={MEMBERS} selected={form.persons} onChange={p => setForm(f => ({ ...f, persons: p }))} />
            </div>
            <Input placeholder="Menu (opsional)" value={form.menu} onChange={e => setForm(f => ({ ...f, menu: e.target.value }))} className="bg-white/50" />
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

// ─── CLEANING TAB ────────────────────────────────────────────────────────────────
function CleaningTab({ isAdmin }: { isAdmin?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: schedules, isLoading } = useGetCleaningSchedules();
  const create = useCreateCleaningSchedule();
  const update = useUpdateCleaningSchedule();
  const del = useDeleteCleaningSchedule();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ date: today(), persons: [] as string[], area: "", notes: "" });

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetCleaningSchedulesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setForm({ date: today(), persons: [], area: "", notes: "" }); setOpen(true); }
  function openEdit(s: any) { setEditId(s.id); setForm({ date: s.date, persons: s.persons as string[], area: s.area ?? "", notes: s.notes ?? "" }); setOpen(true); }

  function handleSave() {
    const payload = { date: form.date, persons: form.persons, area: form.area || undefined, notes: form.notes || undefined };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Jadwal diperbarui" }); } });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Jadwal ditambahkan" }); } });
    }
  }

  const todayStr = today();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Jadwal Bersih-Bersih</h2>
        {isAdmin && <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-1"><Plus className="w-4 h-4" />Tambah</Button>}
      </div>
      {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-20 p-4" />)}</div> :
        !schedules?.length ? <div className="text-center py-12 text-gray-400">Belum ada jadwal bersih-bersih.</div> :
        <div className="space-y-3">
          {schedules.map(s => (
            <div key={s.id} className={cn("glass-card p-4 group transition-all", s.date === todayStr && "ring-2 ring-sky-300/50")}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {s.date === todayStr && <Badge className="bg-sky-100 text-sky-700 border-sky-200 text-xs">Hari Ini</Badge>}
                    <span className="text-sm font-semibold text-gray-800">{formatDate(s.date)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(s.persons as string[]).map(p => (
                      <span key={p} className="text-xs bg-rose-100/80 text-rose-700 px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                  {s.area && <p className="text-sm text-gray-600"><span className="font-medium">Area:</span> {s.area}</p>}
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
        <DialogContent className="glass-panel border-white/50">
          <DialogHeader><DialogTitle>{editId ? "Edit Jadwal Bersih" : "Tambah Jadwal Bersih"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal</label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-white/50" />
            </div>
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Petugas</label>
              <MemberCheckbox members={MEMBERS} selected={form.persons} onChange={p => setForm(f => ({ ...f, persons: p }))} />
            </div>
            <Input placeholder="Area (contoh: kamar mandi, dapur)" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} className="bg-white/50" />
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

// ─── COMPLAINTS TAB ────────────────────────────────────────────────────────────────
function ComplaintsTab({ isAdmin }: { isAdmin?: boolean }) {
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
      create.mutate({ data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Keluhan ditambahkan" }); } });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Keluhan Harian</h2>
        {isAdmin && <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-1"><Plus className="w-4 h-4" />Tambah</Button>}
      </div>
      {isLoading ? <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="glass-card h-20 p-4" />)}</div> :
        !complaints?.length ? <div className="text-center py-12 text-gray-400">Belum ada keluhan yang dicatat.</div> :
        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c.id} className="glass-card p-4 group transition-all hover:-translate-y-0.5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={cn("text-xs border", c.status === "open" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200")}>
                      {c.status === "open" ? "Terbuka" : "Selesai"}
                    </Badge>
                    <span className="text-xs text-gray-400">oleh {c.reportedBy}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5 text-sky-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => del.mutate({ id: c.id }, { onSuccess: () => { invalidate(); toast({ title: "Keluhan dihapus" }); } })}><Trash2 className="w-3.5 h-3.5 text-rose-500" /></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      }
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-panel border-white/50">
          <DialogHeader><DialogTitle>{editId ? "Edit Keluhan" : "Tambah Keluhan"}</DialogTitle></DialogHeader>
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function KehidupanPage() {
  const [activeTab, setActiveTab] = useState("masak");
  const { data: auth } = useGetAuthMe();
  const isAdmin = auth?.isAdmin;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
          Kehidupan Harian
        </h1>
        <p className="text-gray-500 text-sm mt-1">Jadwal dan catatan kehidupan di posko</p>
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
        {activeTab === "masak" && <CookingTab isAdmin={isAdmin} />}
        {activeTab === "bersih" && <CleaningTab isAdmin={isAdmin} />}
        {activeTab === "keluhan" && <ComplaintsTab isAdmin={isAdmin} />}
      </div>
    </div>
  );
}
