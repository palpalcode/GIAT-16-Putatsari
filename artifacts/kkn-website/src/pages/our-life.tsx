import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCookingSchedules,
  useGetCleaningSchedules,
  useGetInventory,
  useGetAuthMe,
  useCreateCookingSchedule,
  useUpdateCookingSchedule,
  useDeleteCookingSchedule,
  useCreateCleaningSchedule,
  useUpdateCleaningSchedule,
  useDeleteCleaningSchedule,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  getGetCookingSchedulesQueryKey,
  getGetCleaningSchedulesQueryKey,
  getGetInventoryQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ChefHat, SprayCan, Package } from "lucide-react";
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

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const tabs = [
  { id: "masak", label: "Jadwal Masak", icon: ChefHat },
  { id: "bersih", label: "Bersih-Bersih", icon: SprayCan },
  { id: "inventaris", label: "Inventaris", icon: Package },
];

function today() { return new Date().toISOString().split("T")[0]; }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
}

// Modern member picker — replaces checkbox grid
function MemberPicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(m: string) {
    onChange(selected.includes(m) ? selected.filter(x => x !== m) : [...selected, m]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {MEMBERS.map(m => (
        <button key={m} onClick={() => toggle(m)} type="button" className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border-2 transition-all",
          selected.includes(m)
            ? "bg-gradient-to-r " + getMemberColor(m) + " text-white border-transparent shadow-sm"
            : "bg-white/40 text-gray-600 border-white/40 hover:bg-white/60"
        )}>
          <div className={cn("w-4 h-4 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[8px] font-bold shrink-0",
            selected.includes(m) ? "bg-white/30" : getMemberColor(m))}>
            {getInitials(m)[0]}
          </div>
          {m.split(" ")[0]}
        </button>
      ))}
    </div>
  );
}

// ─── COOKING TAB ──────────────────────────────────────────────────────────────
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
        {isAdmin && (
          <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-orange-400 to-rose-400 text-white border-0 rounded-full gap-1">
            <Plus className="w-4 h-4" />Tambah
          </Button>
        )}
      </div>
      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-20" />)}</div>
      ) : !schedules?.length ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-orange-400" />
          </div>
          <p className="text-center text-gray-400 text-sm">Belum ada jadwal masak.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => (
            <div key={s.id} className={cn("glass-card p-4 group transition-all hover:-translate-y-0.5", s.date === todayStr && "ring-2 ring-orange-300/60")}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {s.date === todayStr && <Badge className="bg-orange-100 text-orange-700 border-orange-200 border text-xs">🍳 Hari Ini</Badge>}
                    <span className="text-sm font-semibold text-gray-800">{formatDate(s.date)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {(s.persons as string[]).map(p => (
                      <span key={p} className={cn("flex items-center gap-1 text-xs text-white px-2 py-0.5 rounded-full bg-gradient-to-r", getMemberColor(p))}>
                        <span className="font-bold text-[9px]">{getInitials(p)}</span>
                        {p.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                  {s.menu && <p className="text-sm text-gray-600 mt-1">🍽️ <span className="font-medium">{s.menu}</span></p>}
                  {s.notes && <p className="text-xs text-gray-400 mt-1">{s.notes}</p>}
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5 text-sky-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                      onClick={() => del.mutate({ id: s.id }, { onSuccess: () => { invalidate(); toast({ title: "Jadwal dihapus" }); } })}>
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
        <DialogContent className="glass-panel border-white/50 max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-orange-400/20 to-rose-400/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><ChefHat className="w-5 h-5 text-orange-500" />{editId ? "Edit Jadwal Masak" : "Tambah Jadwal Masak"}</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tanggal</label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-white/60" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Petugas Masak</label>
              <MemberPicker selected={form.persons} onChange={p => setForm(f => ({ ...f, persons: p }))} />
              {form.persons.length > 0 && <p className="text-xs text-gray-400 mt-1.5">{form.persons.length} orang dipilih</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Menu (opsional)</label>
              <Input placeholder="Menu hari ini..." value={form.menu} onChange={e => setForm(f => ({ ...f, menu: e.target.value }))} className="bg-white/60" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
              <Input placeholder="Catatan tambahan..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/60" />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-orange-400 to-rose-400 text-white border-0 rounded-full" disabled={create.isPending || update.isPending}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── CLEANING TAB ─────────────────────────────────────────────────────────────
const AREA_OPTIONS = [
  { id: "kamar", label: "Kamar", emoji: "🛏️" },
  { id: "dapur", label: "Dapur", emoji: "🍳" },
  { id: "kamar_mandi", label: "Kamar Mandi", emoji: "🚿" },
  { id: "ruang_tamu", label: "Ruang Tamu", emoji: "🛋️" },
  { id: "halaman", label: "Halaman", emoji: "🌿" },
  { id: "semua", label: "Semua Area", emoji: "🏠" },
];

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
        {isAdmin && (
          <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-sky-400 to-blue-400 text-white border-0 rounded-full gap-1">
            <Plus className="w-4 h-4" />Tambah
          </Button>
        )}
      </div>
      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-20" />)}</div>
      ) : !schedules?.length ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
            <SprayCan className="w-6 h-6 text-sky-400" />
          </div>
          <p className="text-center text-gray-400 text-sm">Belum ada jadwal bersih-bersih.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => (
            <div key={s.id} className={cn("glass-card p-4 group transition-all hover:-translate-y-0.5", s.date === todayStr && "ring-2 ring-sky-300/60")}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {s.date === todayStr && <Badge className="bg-sky-100 text-sky-700 border-sky-200 border text-xs">🧹 Hari Ini</Badge>}
                    <span className="text-sm font-semibold text-gray-800">{formatDate(s.date)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {(s.persons as string[]).map(p => (
                      <span key={p} className={cn("flex items-center gap-1 text-xs text-white px-2 py-0.5 rounded-full bg-gradient-to-r", getMemberColor(p))}>
                        <span className="font-bold text-[9px]">{getInitials(p)}</span>
                        {p.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                  {s.area && <p className="text-sm text-gray-600 mt-1">🧹 Area: <span className="font-medium">{s.area}</span></p>}
                  {s.notes && <p className="text-xs text-gray-400 mt-1">{s.notes}</p>}
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5 text-sky-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                      onClick={() => del.mutate({ id: s.id }, { onSuccess: () => { invalidate(); toast({ title: "Jadwal dihapus" }); } })}>
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
        <DialogContent className="glass-panel border-white/50 max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-sky-400/20 to-blue-400/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><SprayCan className="w-5 h-5 text-sky-500" />{editId ? "Edit Jadwal Bersih" : "Tambah Jadwal Bersih"}</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tanggal</label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-white/60" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Petugas</label>
              <MemberPicker selected={form.persons} onChange={p => setForm(f => ({ ...f, persons: p }))} />
              {form.persons.length > 0 && <p className="text-xs text-gray-400 mt-1.5">{form.persons.length} orang dipilih</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Area Bersih (opsional)</label>
              <div className="grid grid-cols-3 gap-2">
                {AREA_OPTIONS.map(a => (
                  <button key={a.id} type="button" onClick={() => setForm(f => ({ ...f, area: f.area === a.label ? "" : a.label }))} className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs transition-all",
                    form.area === a.label ? "border-sky-400 bg-sky-50 shadow-sm text-sky-700" : "border-white/40 bg-white/30 hover:bg-white/60 text-gray-600"
                  )}>
                    <span className="text-xl">{a.emoji}</span>
                    <span className="font-medium text-center leading-tight">{a.label}</span>
                  </button>
                ))}
              </div>
              <Input placeholder="Atau ketik area lain..." value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} className="bg-white/60 mt-2" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
              <Input placeholder="Catatan tambahan..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/60" />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-sky-400 to-blue-400 text-white border-0 rounded-full" disabled={create.isPending || update.isPending}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── INVENTARIS TAB ───────────────────────────────────────────────────────────
const invCategories = [
  { id: "p3k", label: "P3K", emoji: "🩹", color: "bg-rose-100 text-rose-700 border-rose-200" },
  { id: "obat", label: "Obat", emoji: "💊", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "alkes", label: "Alkes", emoji: "🩺", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { id: "umum", label: "Umum", emoji: "📦", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

function getCatColor(cat: string) { return invCategories.find(c => c.id === cat)?.color ?? "bg-gray-100 text-gray-700 border-gray-200"; }
function getCatLabel(cat: string) { return invCategories.find(c => c.id === cat)?.label ?? cat; }
function getCatEmoji(cat: string) { return invCategories.find(c => c.id === cat)?.emoji ?? "📦"; }

function InventarisTab({ isAdmin }: { isAdmin?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: inventory, isLoading } = useGetInventory();
  const create = useCreateInventoryItem();
  const update = useUpdateInventoryItem();
  const del = useDeleteInventoryItem();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", category: "umum", quantity: 1, unit: "", notes: "" });
  const [filterCat, setFilterCat] = useState("all");

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetInventoryQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setForm({ name: "", category: "umum", quantity: 1, unit: "", notes: "" }); setOpen(true); }
  function openEdit(item: any) { setEditId(item.id); setForm({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, notes: item.notes ?? "" }); setOpen(true); }

  function handleSave() {
    if (!form.name || !form.unit) return;
    const payload = { name: form.name, category: form.category, quantity: form.quantity, unit: form.unit, notes: form.notes || undefined };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Item diperbarui" }); } });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Item ditambahkan" }); } });
    }
  }

  const filtered = filterCat === "all" ? (inventory ?? []) : (inventory ?? []).filter(i => i.category === filterCat);
  const grouped = invCategories.reduce((acc, cat) => {
    const items = filtered.filter(i => i.category === cat.id);
    if (items.length > 0) acc[cat.id] = items;
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-700">Inventaris Posko</h2>
        {isAdmin && (
          <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-0 rounded-full gap-1">
            <Plus className="w-4 h-4" />Tambah Barang
          </Button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat("all")} className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-all", filterCat === "all" ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-transparent" : "bg-white/50 text-gray-600 border-white/50 hover:bg-white/80")}>Semua</button>
        {invCategories.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} className={cn("flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all", filterCat === c.id ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-transparent" : "bg-white/50 text-gray-600 border-white/50 hover:bg-white/80")}>
            <span>{c.emoji}</span>{c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="glass-card h-24" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Belum ada barang inventaris.</div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([catId, items]) => (
            <div key={catId}>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn("text-xs px-2.5 py-0.5 border flex items-center gap-1", getCatColor(catId))}>
                  <span>{getCatEmoji(catId)}</span>{getCatLabel(catId)}
                </Badge>
                <span className="text-xs text-gray-400">{items.length} item</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(item => (
                  <div key={item.id} className="glass-card p-3 group transition-all hover:-translate-y-0.5">
                    <div className="flex justify-between items-center gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500"><span className="text-xl font-bold text-gray-800">{item.quantity}</span> {item.unit}</p>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => openEdit(item)}><Pencil className="w-3 h-3 text-sky-500" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => del.mutate({ id: item.id }, { onSuccess: () => { invalidate(); toast({ title: "Item dihapus" }); } })}><Trash2 className="w-3 h-3 text-rose-500" /></Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-panel border-white/50 max-w-md p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-emerald-400/20 to-teal-400/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-emerald-500" />{editId ? "Edit Barang" : "Tambah Barang"}</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Nama Barang</label>
              <Input placeholder="Nama barang..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-white/60" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Kategori</label>
              <div className="grid grid-cols-2 gap-2">
                {invCategories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setForm(f => ({ ...f, category: cat.id }))} className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm transition-all",
                    form.category === cat.id ? cat.color + " border-current shadow-sm" : "bg-white/40 text-gray-500 border-white/40 hover:bg-white/70"
                  )}>
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-28">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Jumlah</label>
                <Input type="number" min={0} placeholder="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} className="bg-white/60" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Satuan</label>
                <Input placeholder="pcs, tablet, botol..." value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="bg-white/60" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
              <Input placeholder="Catatan..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/60" />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-0 rounded-full" disabled={create.isPending || update.isPending}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function OurLifePage() {
  const [activeTab, setActiveTab] = useState("masak");
  const { data: auth } = useGetAuthMe();
  const isAdmin = auth?.isAdmin;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">Our Life</h1>
        <p className="text-gray-500 text-sm mt-1">Kehidupan sehari-hari, jadwal piket, dan inventaris posko</p>
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
        {activeTab === "inventaris" && <InventarisTab isAdmin={isAdmin} />}
      </div>
    </div>
  );
}
