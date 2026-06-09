import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCookingSchedules,
  useGetCleaningSchedules,
  useGetInventory,
  useCreateCookingSchedule,
  useUpdateCookingSchedule,
  useDeleteCookingSchedule,
  useCreateCleaningSchedule,
  useUpdateCleaningSchedule,
  useDeleteCleaningSchedule,
  useCreateInventoryItem,
  type InventoryItemInputCategory,
  InventoryItemInputItemType,
  type InventoryItemInputItemType as InvItemType,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  getGetCookingSchedulesQueryKey,
  getGetCleaningSchedulesQueryKey,
  getGetInventoryQueryKey,
  getGetDashboardSummaryQueryKey,
  useGetConditions,
  useCreateCondition,
  useUpdateCondition,
  useDeleteCondition,
  MemberConditionInputType,
  type MemberConditionInputType as ConditionType,
  getGetConditionsQueryKey,
  useGetItemCatalog,
  useCreateCatalogItem,
  useUpdateCatalogItem,
  useDeleteCatalogItem,
  getGetItemCatalogQueryKey,
  type CatalogItem,
  type CatalogItemInputCategory,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ChefHat, SprayCan, Package, User, Heart, X, BookOpen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ItemCatalogCombobox } from "@/components/ItemCatalogCombobox";
import { useToast } from "@/hooks/use-toast";
import { cn, TEAM_MEMBERS, getMemberColor } from "@/lib/utils";
import { getApiErrorDesc, extractApiFieldErrors } from "@/lib/api-error";
const MEMBERS = TEAM_MEMBERS;

const tabs = [
  { id: "masak", label: "Jadwal Masak", icon: ChefHat },
  { id: "bersih", label: "Bersih-Bersih", icon: SprayCan },
  { id: "inventaris", label: "Inventaris", icon: Package },
  { id: "kondisi", label: "Kondisi Anggota", icon: Heart },
];

function today() { return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }); }
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
            : "bg-white/90 text-gray-600 border-white/40 hover:bg-white/90"
        )}>
          <div className={cn("w-4 h-4 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[8px] font-bold shrink-0",
            selected.includes(m) ? "bg-white/90" : getMemberColor(m))}>
            <User className="w-2.5 h-2.5" />
          </div>
          {m}
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetCookingSchedulesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setForm({ date: today(), persons: [], menu: "", notes: "" }); setFieldErrors({}); setOpen(true); }
  function openEdit(s: any) { setEditId(s.id); setForm({ date: s.date, persons: s.persons as string[], menu: s.menu ?? "", notes: s.notes ?? "" }); setFieldErrors({}); setOpen(true); }

  function handleSave() {
    const payload = { date: form.date, persons: form.persons, menu: form.menu || undefined, notes: form.notes || undefined };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Jadwal diperbarui" }); },
        onError: (err) => { setFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
    } else {
      create.mutate({ data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Jadwal ditambahkan" }); },
        onError: (err) => { setFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
    }
  }

  const todayStr = today();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Jadwal Masak</h2>
        {isAdmin && (
          <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-violet-400 to-rose-400 text-white border-0 rounded-full gap-1">
            <Plus className="w-4 h-4" />Tambah
          </Button>
        )}
      </div>
      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-20" />)}</div>
      ) : !schedules?.length ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-rose-100 flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-violet-400" />
          </div>
          <p className="text-center text-gray-400 text-sm">Belum ada jadwal masak.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => (
            <div key={s.id} className={cn("glass-card p-4 group transition-all hover:-translate-y-0.5", s.date === todayStr && "ring-2 ring-violet-300/60")}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {s.date === todayStr && <Badge className="bg-violet-100 text-violet-700 border-violet-200 border text-xs">🍳 Hari Ini</Badge>}
                    <span className="text-sm font-semibold text-gray-800">{formatDate(s.date)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {(s.persons as string[]).map(p => (
                      <span key={p} className={cn("flex items-center gap-1 text-xs text-white px-2 py-0.5 rounded-full bg-gradient-to-r", getMemberColor(p))}>
                        <User className="w-3 h-3" />
                        {p}
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
        <DialogContent className="form-dialog border-white/50 max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-violet-400/20 to-rose-400/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><ChefHat className="w-5 h-5 text-slate-500" />{editId ? "Edit Jadwal Masak" : "Tambah Jadwal Masak"}</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-5">
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Tanggal</label>
              <Input type="date" value={form.date} onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setFieldErrors(fe => ({ ...fe, date: "" })); }} className="bg-white/90" />
              {fieldErrors.date && <p className="text-xs text-rose-500 mt-1">{fieldErrors.date}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-2 block">Petugas Masak</label>
              <MemberPicker selected={form.persons} onChange={p => setForm(f => ({ ...f, persons: p }))} />
              {form.persons.length > 0 && <p className="text-xs text-gray-400 mt-1.5">{form.persons.length} orang dipilih</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Menu (opsional)</label>
              <Input placeholder="Menu hari ini..." value={form.menu} onChange={e => setForm(f => ({ ...f, menu: e.target.value }))} className="bg-white/90" />
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
              <Input placeholder="Catatan tambahan..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/90" />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-violet-400 to-rose-400 text-white border-0 rounded-full" disabled={create.isPending || update.isPending}>Simpan</Button>
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetCleaningSchedulesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setForm({ date: today(), persons: [], area: "", notes: "" }); setFieldErrors({}); setOpen(true); }
  function openEdit(s: any) { setEditId(s.id); setForm({ date: s.date, persons: s.persons as string[], area: s.area ?? "", notes: s.notes ?? "" }); setFieldErrors({}); setOpen(true); }

  function handleSave() {
    const payload = { date: form.date, persons: form.persons, area: form.area || undefined, notes: form.notes || undefined };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Jadwal diperbarui" }); },
        onError: (err) => { setFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
    } else {
      create.mutate({ data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Jadwal ditambahkan" }); },
        onError: (err) => { setFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
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
                        <User className="w-3 h-3" />
                        {p}
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
        <DialogContent className="form-dialog border-white/50 max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-sky-400/20 to-blue-400/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><SprayCan className="w-5 h-5 text-sky-500" />{editId ? "Edit Jadwal Bersih" : "Tambah Jadwal Bersih"}</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-5">
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Tanggal</label>
              <Input type="date" value={form.date} onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setFieldErrors(fe => ({ ...fe, date: "" })); }} className="bg-white/90" />
              {fieldErrors.date && <p className="text-xs text-rose-500 mt-1">{fieldErrors.date}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-2 block">Petugas</label>
              <MemberPicker selected={form.persons} onChange={p => setForm(f => ({ ...f, persons: p }))} />
              {form.persons.length > 0 && <p className="text-xs text-gray-400 mt-1.5">{form.persons.length} orang dipilih</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-2 block">Area Bersih (opsional)</label>
              <div className="grid grid-cols-3 gap-2">
                {AREA_OPTIONS.map(a => (
                  <button key={a.id} type="button" onClick={() => setForm(f => ({ ...f, area: f.area === a.label ? "" : a.label }))} className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs transition-all",
                    form.area === a.label ? "border-sky-400 bg-sky-50 shadow-sm text-sky-700" : "border-white/40 bg-white/90 hover:bg-white/90 text-gray-600"
                  )}>
                    <span className="text-xl">{a.emoji}</span>
                    <span className="font-medium text-center leading-tight">{a.label}</span>
                  </button>
                ))}
              </div>
              <Input placeholder="Atau ketik area lain..." value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} className="bg-white/90 mt-2" />
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
              <Input placeholder="Catatan tambahan..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/90" />
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
  { id: "alat_kebersihan", label: "Alat Kebersihan", emoji: "🧹", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: "alat_masak", label: "Alat Masak", emoji: "🍳", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { id: "alat_makan", label: "Alat Makan", emoji: "🍽️", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { id: "alat_tulis", label: "Alat Tulis", emoji: "✏️", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: "alat_elektronik", label: "Alat Elektronik", emoji: "🔌", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { id: "pakaian", label: "Pakaian", emoji: "👕", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { id: "stock_makanan", label: "Stock Makanan", emoji: "🍚", color: "bg-lime-100 text-lime-700 border-lime-200" },
  { id: "device", label: "Device", emoji: "📱", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { id: "darurat", label: "Darurat", emoji: "🚨", color: "bg-red-100 text-red-700 border-red-200" },
  { id: "tempat_tidur", label: "Tempat Tidur", emoji: "🛏️", color: "bg-amber-100 text-amber-700 border-amber-200" },
];

function getCatColor(cat: string) { return invCategories.find(c => c.id === cat)?.color ?? "bg-gray-100 text-gray-700 border-gray-200"; }
function getCatLabel(cat: string) { return invCategories.find(c => c.id === cat)?.label ?? cat; }
function getCatEmoji(cat: string) { return invCategories.find(c => c.id === cat)?.emoji ?? "📦"; }

// Shared category filter
function InvCategoryFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={() => onChange("all")} className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-all", value === "all" ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-transparent" : "bg-white/90 text-gray-600 border-white/50 hover:bg-white/80")}>Semua</button>
      {invCategories.map(c => (
        <button key={c.id} onClick={() => onChange(c.id)} className={cn("flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all", value === c.id ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-transparent" : "bg-white/90 text-gray-600 border-white/50 hover:bg-white/80")}>
          <span>{c.emoji}</span>{c.label}
        </button>
      ))}
    </div>
  );
}

// ─── 3-tipe kepemilikan ───────────────────────────────────────────────────────
const INV_TYPE_CONFIG = {
  pribadi:  { label: "Barang Pribadi",          emoji: "👤", color: "border-violet-400 bg-violet-50 text-violet-700" },
  pinjaman: { label: "Dipinjamkan ke Kelompok", emoji: "🤝", color: "border-sky-400 bg-sky-50 text-sky-700" },
  kelompok: { label: "Milik Kelompok",          emoji: "🏠", color: "border-emerald-400 bg-emerald-50 text-emerald-700" },
} as const;

type DraftItem = {
  id: string;
  name: string;
  category: InventoryItemInputCategory;
  quantity: number;
  unit: string;
  notes: string;
  itemType: InvItemType;
  ownerName?: string;
};

type InvForm = {
  name: string;
  category: InventoryItemInputCategory;
  quantity: number;
  unit: string;
  notes: string;
  itemType: InvItemType;
  ownerName: string;
};

function defaultInvForm(defaultType: InvItemType = InventoryItemInputItemType.kelompok, selfName: string | null = null): InvForm {
  return { name: "", category: "alat_kebersihan", quantity: 1, unit: "", notes: "", itemType: defaultType, ownerName: selfName ?? "" };
}

// ─── SingleItemFields: form fields tanpa tombol submit ────────────────────────
function SingleItemFields({
  form, setForm, allowedTypes, isPrivileged, isKetSek, selfName, isLoggedIn,
}: {
  form: InvForm;
  setForm: React.Dispatch<React.SetStateAction<InvForm>>;
  allowedTypes: InvItemType[];
  isPrivileged: boolean;
  isKetSek: boolean;
  selfName: string | null;
  isLoggedIn: boolean;
}) {
  const { data: catalog = [] } = useGetItemCatalog();
  const catalogEntry = catalog.find(c => c.name.toLowerCase() === form.name.toLowerCase());
  const unitLocked = !!catalogEntry && !isKetSek;
  const categoryLocked = !!catalogEntry && !isKetSek;

  const showOwner = (form.itemType === "pribadi" || form.itemType === "pinjaman") && isPrivileged;
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Nama Barang</label>
        <ItemCatalogCombobox
          name={form.name}
          unit={form.unit}
          onChangeName={name => setForm(f => ({ ...f, name }))}
          onChangeUnit={unit => setForm(f => ({ ...f, unit }))}
          onChangeCategory={cat => setForm(f => ({ ...f, category: cat as InventoryItemInputCategory }))}
          isPrivileged={isKetSek}
          isLoggedIn={isLoggedIn}
          category={form.category}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-2 block">
          Kategori {categoryLocked ? <span className="text-xs font-normal text-gray-400 ml-1">(terkunci dari katalog)</span> : ""}
        </label>
        <div className={cn("grid grid-cols-2 gap-2", categoryLocked && "opacity-60 pointer-events-none")}>
          {invCategories.map(cat => (
            <button key={cat.id} type="button" onClick={() => setForm(f => ({ ...f, category: cat.id as InventoryItemInputCategory }))} className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm transition-all",
              form.category === cat.id ? cat.color + " border-current shadow-sm" : "bg-white text-violet-700 border-violet-200/50 hover:bg-white/90"
            )}>
              <span className="text-lg">{cat.emoji}</span>
              <span className="font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
        {categoryLocked && (
          <p className="text-xs text-gray-500 mt-1">
            Kategori otomatis terkunci ke <span className="font-semibold text-gray-700">{getCatLabel(catalogEntry.category)}</span> dari katalog. Ketua/sekretaris bisa mengubahnya.
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <div className="w-28">
          <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Jumlah</label>
          <Input type="number" min={0} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} className="bg-white/90" />
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Satuan</label>
          {unitLocked ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
              <span className="font-medium">{form.unit}</span>
              <span className="text-xs text-gray-400 ml-auto">dari katalog</span>
            </div>
          ) : (
            <Input placeholder="pcs, tablet, botol..." value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="bg-white/90" />
          )}
        </div>
      </div>
      {allowedTypes.length > 1 && (
        <div>
          <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-2 block">Tipe Kepemilikan</label>
          <div className="flex flex-col gap-2">
            {allowedTypes.map(t => {
              const cfg = INV_TYPE_CONFIG[t];
              return (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, itemType: t }))} className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm transition-all text-left",
                  form.itemType === t ? cfg.color : "border-white/40 bg-white/90 text-gray-500 hover:bg-white/90"
                )}>
                  <span>{cfg.emoji}</span>
                  <span className="font-medium">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {showOwner && (
        <div>
          <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Untuk Anggota</label>
          <select value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
            className="w-full text-sm px-3 py-2 rounded-xl border border-white/50 bg-white/90 focus:outline-none focus:border-emerald-300">
            {MEMBERS.map(m => <option key={m} value={m}>{m}{m === selfName ? " (saya)" : ""}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
        <Input placeholder="Catatan..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/90" />
      </div>
    </div>
  );
}

// ─── MultiItemDialog: form dengan keranjang (untuk tambah baru) ───────────────
function MultiItemDialog({
  open, onOpenChange, allowedTypes, defaultItemType, isPrivileged, isKetSek, selfName, isLoggedIn, onSubmitAll, title, headerGradient,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  allowedTypes: InvItemType[];
  defaultItemType: InvItemType;
  isPrivileged: boolean;
  isKetSek: boolean;
  selfName: string | null;
  isLoggedIn: boolean;
  onSubmitAll: (items: DraftItem[]) => Promise<void>;
  title: string;
  headerGradient: string;
}) {
  const [form, setForm] = useState<InvForm>(() => defaultInvForm(defaultItemType, selfName));
  const [cart, setCart] = useState<DraftItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(defaultInvForm(defaultItemType, selfName));
      setCart([]);
      setIsSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function addToCart() {
    if (!form.name.trim() || !form.unit.trim()) return;
    const ownerName = (form.itemType === "pribadi" || form.itemType === "pinjaman")
      ? (form.ownerName || selfName || undefined)
      : undefined;
    if ((form.itemType === "pribadi" || form.itemType === "pinjaman") && !ownerName) return;
    const item: DraftItem = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      category: form.category,
      quantity: form.quantity,
      unit: form.unit.trim(),
      notes: form.notes,
      itemType: form.itemType,
      ownerName,
    };
    setCart(c => [...c, item]);
    setForm(f => ({ ...f, name: "", quantity: 1, unit: "", notes: "" }));
  }

  function removeFromCart(id: string) {
    setCart(c => c.filter(i => i.id !== id));
  }

  async function handleSubmitAll() {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmitAll(cart);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const saveLabel = isSubmitting ? "Menyimpan..." : cart.length <= 1 ? "Simpan" : `Simpan Semua (${cart.length} barang)`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="form-dialog border-white/50 max-w-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className={cn("px-6 pt-6 pb-4", headerGradient)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Package className="w-5 h-5" />{title}</DialogTitle>
          </DialogHeader>
        </div>
        <div className="flex flex-col sm:flex-row">
          {/* Kiri: form isian */}
          <div className="flex-1 px-5 py-4 border-b sm:border-b-0 sm:border-r border-white/30">
            <SingleItemFields form={form} setForm={setForm} allowedTypes={allowedTypes} isPrivileged={isPrivileged} isKetSek={isKetSek} selfName={selfName} isLoggedIn={isLoggedIn} />
            <Button
              type="button"
              onClick={addToCart}
              disabled={!form.name.trim() || !form.unit.trim()}
              className="w-full mt-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-0 rounded-full gap-2"
            >
              <Plus className="w-4 h-4" /> Tambahkan ke Daftar
            </Button>
          </div>
          {/* Kanan: preview keranjang */}
          <div className="sm:w-56 px-4 py-4 flex flex-col gap-2 bg-white/10">
            <p className="text-xs font-semibold text-violet-800 uppercase tracking-wide">Daftar</p>
            {cart.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6 italic">Belum ada barang dalam daftar</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item, i) => {
                  const cfg = INV_TYPE_CONFIG[item.itemType];
                  return (
                    <div key={item.id} className="flex items-start gap-2 glass-card p-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{i + 1}. {item.name}</p>
                        <p className="text-[11px] text-gray-500">{item.quantity} {item.unit}</p>
                        <span className={cn("inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border", cfg.color)}>
                          {cfg.emoji} {cfg.label}
                        </span>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.id)} className="shrink-0 mt-0.5 text-gray-400 hover:text-rose-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 flex justify-between items-center border-t border-white/30 bg-white/10">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Batal</Button>
          <Button
            onClick={handleSubmitAll}
            disabled={cart.length === 0 || isSubmitting}
            className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-0 rounded-full"
          >
            {saveLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dialog: Pinjam dari Barang Anggota ───────────────────────────────────────
function PinjamBrgAnggotaDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess: () => void }) {
  const { toast } = useToast();
  const { data: pribadiItems = [], isLoading } = useGetInventory({ type: "pribadi" });
  const update = useUpdateInventoryItem();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  function toggle(id: number) {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  async function handleSubmit() {
    if (selected.size === 0) return;
    setSubmitting(true);
    try {
      await Promise.all([...selected].map(id =>
        update.mutateAsync({ id, data: { itemType: InventoryItemInputItemType.pinjaman } })
      ));
      onSuccess();
      onOpenChange(false);
      setSelected(new Set());
      toast({ title: `${selected.size} barang dipinjamkan ke kelompok` });
    } catch (err) {
      toast({ title: "Gagal meminjamkan", description: getApiErrorDesc(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) setSelected(new Set()); onOpenChange(v); }}>
      <DialogContent className="form-dialog border-white/50 max-w-md p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-sky-400/20 to-teal-400/20 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><span>🤝</span> Pinjam dari Barang Anggota</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-gray-500 mt-1.5">Pilih Barang Pribadi anggota yang akan dipinjamkan ke kelompok.</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1.5">
          {isLoading ? (
            <div className="animate-pulse space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}</div>
          ) : pribadiItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Belum ada Barang Pribadi anggota.</div>
          ) : (
            pribadiItems.map(item => {
              const checked = selected.has(item.id);
              return (
                <label key={item.id} className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all", checked ? "bg-sky-50 border-sky-200" : "bg-white/80 border-white/50 hover:bg-white/90")}>
                  <Checkbox checked={checked} onCheckedChange={() => toggle(item.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500"><span className="font-bold text-gray-700">{item.quantity}</span> {item.unit}</p>
                  </div>
                  {item.ownerName && (
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full text-white font-medium bg-gradient-to-r shrink-0", getMemberColor(item.ownerName))}>
                      {item.ownerName}
                    </span>
                  )}
                </label>
              );
            })
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500">{selected.size} dipilih</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setSelected(new Set()); onOpenChange(false); }} className="rounded-full text-sm">Batal</Button>
            <Button onClick={handleSubmit} disabled={selected.size === 0 || submitting} className="bg-gradient-to-r from-sky-400 to-teal-400 text-white border-0 rounded-full text-sm">
              {submitting ? "Meminjamkan..." : `Pinjamkan${selected.size > 0 ? ` (${selected.size})` : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dialog: Quick-add dari Katalog ───────────────────────────────────────────
type CatalogDraft = { qty: number; itemType: "pribadi" | "pinjaman" };

function CatalogQuickAddDialog({ open, onOpenChange, selfName, isPrivileged, onSubmitAll }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selfName: string | null;
  isPrivileged: boolean;
  onSubmitAll: (items: DraftItem[]) => Promise<void>;
}) {
  const { toast } = useToast();
  const { data: catalog = [], isLoading } = useGetItemCatalog();
  const [drafts, setDrafts] = useState<Record<number, CatalogDraft>>({});
  const [ownerName, setOwnerName] = useState(selfName ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (open) { setDrafts({}); setOwnerName(selfName ?? ""); } }, [open, selfName]);

  function setQty(id: number, qty: number) {
    setDrafts(prev => ({ ...prev, [id]: { qty: Math.max(0, qty), itemType: prev[id]?.itemType ?? "pribadi" } }));
  }
  function toggleType(id: number) {
    setDrafts(prev => ({ ...prev, [id]: { qty: prev[id]?.qty ?? 1, itemType: prev[id]?.itemType === "pinjaman" ? "pribadi" : "pinjaman" } }));
  }

  const toSubmit = catalog.filter(c => (drafts[c.id]?.qty ?? 0) > 0);

  async function handleSubmit() {
    if (toSubmit.length === 0) return;
    if (!ownerName) { toast({ title: "Pilih nama pemilik", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const items: DraftItem[] = toSubmit.map(c => ({
        id: `catalog-${c.id}`,
        name: c.name,
        category: c.category as InventoryItemInputCategory,
        quantity: drafts[c.id]!.qty,
        unit: c.unit,
        notes: "",
        itemType: drafts[c.id]!.itemType as InvItemType,
        ownerName,
      }));
      await onSubmitAll(items);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  const grouped = invCategories.reduce((acc, cat) => {
    const items = catalog.filter(c => c.category === cat.id);
    if (items.length > 0) acc[cat.id] = items;
    return acc;
  }, {} as Record<string, typeof catalog>);

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) setDrafts({}); onOpenChange(v); }}>
      <DialogContent className="form-dialog border-white/50 max-w-lg p-0 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-violet-400/20 to-sky-400/20 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-violet-500" />Tambah dari Katalog</DialogTitle>
          </DialogHeader>
          {isPrivileged ? (
            <div className="flex items-center gap-2 mt-3">
              <label className="text-xs font-semibold text-gray-500">Pemilik:</label>
              <select value={ownerName} onChange={e => setOwnerName(e.target.value)} className="text-sm px-2 py-1 rounded-lg border border-white/50 bg-white/90 focus:outline-none focus:border-violet-300">
                <option value="">-- Pilih --</option>
                {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          ) : selfName ? (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs font-semibold text-gray-500">Pemilik:</span>
              <span className={cn("text-xs text-white px-2.5 py-0.5 rounded-full bg-gradient-to-r", getMemberColor(selfName))}>{selfName}</span>
            </div>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-4">
          {isLoading ? (
            <div className="animate-pulse space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}</div>
          ) : (
            Object.entries(grouped).map(([catId, items]) => (
              <div key={catId}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn("text-xs px-2 py-0.5 border", getCatColor(catId))}>
                    {getCatEmoji(catId)} {getCatLabel(catId)}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {items.map(item => {
                    const draft = drafts[item.id];
                    const qty = draft?.qty ?? 0;
                    const isPinjaman = draft?.itemType === "pinjaman";
                    const isActive = qty > 0;
                    return (
                      <div key={item.id} className={cn("flex items-center gap-2 p-2.5 rounded-xl border transition-all", isActive ? "bg-violet-50/80 border-violet-200" : "bg-white/70 border-white/50")}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.unit}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" onClick={() => setQty(item.id, qty - 1)} className="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-bold flex items-center justify-center text-lg leading-none">−</button>
                          <input type="number" min={0} value={qty === 0 ? "" : qty} onChange={e => setQty(item.id, Number(e.target.value) || 0)} placeholder="0" className="w-12 text-center text-sm font-semibold border border-gray-200 rounded-lg bg-white h-7 focus:outline-none focus:border-violet-400" />
                          <button type="button" onClick={() => setQty(item.id, qty + 1)} className="w-7 h-7 rounded-full border border-violet-300 bg-violet-500 hover:bg-violet-600 text-white font-bold flex items-center justify-center text-lg leading-none">+</button>
                        </div>
                        {isActive && (
                          <button type="button" onClick={() => toggleType(item.id)}
                            className={cn("shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium transition-all", isPinjaman ? INV_TYPE_CONFIG.pinjaman.color : INV_TYPE_CONFIG.pribadi.color)}>
                            {isPinjaman ? "🤝 Pinjamkan" : "👤 Pribadi"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500">{toSubmit.length} item · {toSubmit.reduce((s, c) => s + (drafts[c.id]?.qty ?? 0), 0)} total</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setDrafts({}); onOpenChange(false); }} className="rounded-full text-sm">Batal</Button>
            <Button onClick={handleSubmit} disabled={toSubmit.length === 0 || submitting || !ownerName} className="bg-gradient-to-r from-violet-400 to-sky-400 text-white border-0 rounded-full text-sm">
              {submitting ? "Menyimpan..." : `Simpan${toSubmit.length > 0 ? ` (${toSubmit.length})` : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Barang Kelompok sub-tab ──────────────────────────────────────────────────
function BrgKelompokTab({ isAdmin, isKetSek }: { isAdmin?: boolean; isKetSek?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: kelompokItems, isLoading: loadingKelompok } = useGetInventory({ type: "kelompok" });
  const { data: pinjamanItems, isLoading: loadingPinjaman } = useGetInventory({ type: "pinjaman" });
  const create = useCreateInventoryItem();
  const update = useUpdateInventoryItem();
  const del = useDeleteInventoryItem();

  const isLoading = loadingKelompok || loadingPinjaman;
  const inventory = [...(kelompokItems ?? []), ...(pinjamanItems ?? [])];

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<InvForm>(defaultInvForm);
  const [filterCat, setFilterCat] = useState("all");
  const [pinjamOpen, setPinjamOpen] = useState(false);

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetInventoryQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function openEdit(item: any) {
    setEditId(item.id);
    setEditForm({ name: item.name, category: item.category as InventoryItemInputCategory, quantity: item.quantity, unit: item.unit, notes: item.notes ?? "", itemType: InventoryItemInputItemType.kelompok, ownerName: "" });
    setEditOpen(true);
  }

  function handleEditSave() {
    if (editId === null) return;
    update.mutate(
      { id: editId, data: { name: editForm.name, category: editForm.category, quantity: editForm.quantity, unit: editForm.unit, notes: editForm.notes || undefined } },
      {
        onSuccess: () => { invalidate(); setEditOpen(false); toast({ title: "Barang diperbarui" }); },
        onError: (err) => toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }),
      }
    );
  }

  async function handleSubmitAll(items: DraftItem[]) {
    await Promise.all(items.map(item =>
      create.mutateAsync({ data: { name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, notes: item.notes || undefined, itemType: InventoryItemInputItemType.kelompok } })
    ));
    invalidate();
    toast({ title: items.length > 1 ? `${items.length} barang berhasil disimpan` : "Barang ditambahkan" });
  }

  const filtered = filterCat === "all" ? inventory : inventory.filter(i => i.category === filterCat);
  const grouped = invCategories.reduce((acc, cat) => {
    const items = filtered.filter(i => i.category === cat.id);
    if (items.length > 0) acc[cat.id] = items;
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">Barang milik bersama dan barang anggota yang dipinjamkan ke kelompok</p>
        {isAdmin && (
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => setPinjamOpen(true)} variant="outline" className="rounded-full gap-1 text-sky-600 border-sky-300 hover:bg-sky-50">
              🤝 Pinjam dari Barang Anggota
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)} className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-0 rounded-full gap-1">
              <Plus className="w-4 h-4" />Tambah Barang
            </Button>
          </div>
        )}
      </div>

      <InvCategoryFilter value={filterCat} onChange={setFilterCat} />

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="glass-card h-24" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Belum ada barang kelompok.</div>
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
                {items.map(item => {
                  const isPinjaman = item.itemType === "pinjaman";
                  return (
                    <div key={item.id} className={cn("glass-card p-3 group transition-all hover:-translate-y-0.5", isPinjaman && "ring-1 ring-sky-200")}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500"><span className="text-xl font-bold text-gray-800">{item.quantity}</span> {item.unit}</p>
                          {isPinjaman && (
                            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                              🤝 Pinjamkan dari {item.ownerName}
                            </span>
                          )}
                          {item.notes && <p className="text-xs text-gray-400 mt-1 truncate">{item.notes}</p>}
                        </div>
                        {isAdmin && !isPinjaman && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => openEdit(item)}><Pencil className="w-3 h-3 text-sky-500" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" disabled={del.isPending} onClick={() => del.mutate({ id: item.id }, { onSuccess: () => { invalidate(); toast({ title: "Barang dihapus" }); } })}><Trash2 className="w-3 h-3 text-rose-500" /></Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog pinjam dari barang pribadi anggota */}
      <PinjamBrgAnggotaDialog open={pinjamOpen} onOpenChange={setPinjamOpen} onSuccess={invalidate} />

      {/* Dialog tambah multi-barang */}
      <MultiItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        allowedTypes={[InventoryItemInputItemType.kelompok]}
        defaultItemType={InventoryItemInputItemType.kelompok}
        isPrivileged={false}
        isKetSek={isKetSek ?? false}
        selfName={null}
        isLoggedIn={true}
        onSubmitAll={handleSubmitAll}
        title="Tambah Barang Kelompok"
        headerGradient="bg-gradient-to-r from-emerald-400/20 to-teal-400/20"
      />

      {/* Dialog edit (satu barang) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="form-dialog border-white/50 max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-emerald-400/20 to-teal-400/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-emerald-500" />Edit Barang Kelompok</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4">
            <SingleItemFields form={editForm} setForm={setEditForm} allowedTypes={[InventoryItemInputItemType.kelompok]} isPrivileged={false} isKetSek={isKetSek ?? false} selfName={null} isLoggedIn={true} />
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-full">Batal</Button>
              <Button onClick={handleEditSave} disabled={!editForm.name || !editForm.unit || update.isPending} className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-0 rounded-full">Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Barang Pribadi sub-tab (pribadi + pinjaman) ──────────────────────────────
function BrgPribadiTab({ selfName, isPrivileged, isKetSek, isLoggedIn }: { selfName: string | null; isPrivileged: boolean; isKetSek: boolean; isLoggedIn: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedOwner, setSelectedOwner] = useState<string>(selfName ?? "");
  const { data: rawInventory, isLoading } = useGetInventory({ owner: selectedOwner || undefined });
  const create = useCreateInventoryItem();
  const update = useUpdateInventoryItem();
  const del = useDeleteInventoryItem();

  const inventory = (rawInventory ?? []).filter(i => i.itemType === "pribadi" || i.itemType === "pinjaman");

  const [addOpen, setAddOpen] = useState(false);
  const [catalogQuickOpen, setCatalogQuickOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<InvForm>(defaultInvForm);
  const [editAllowedTypes, setEditAllowedTypes] = useState<InvItemType[]>([InventoryItemInputItemType.pribadi]);
  const [filterCat, setFilterCat] = useState("all");

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetInventoryQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function canEditItem(ownerName: string | null | undefined) {
    return isLoggedIn && (selfName === ownerName || isPrivileged);
  }

  function openEdit(item: any) {
    setEditId(item.id);
    const t = (item.itemType === "pinjaman" ? "pinjaman" : "pribadi") as InvItemType;
    setEditAllowedTypes([t]);
    setEditForm({ name: item.name, category: item.category as InventoryItemInputCategory, quantity: item.quantity, unit: item.unit, notes: item.notes ?? "", itemType: t, ownerName: item.ownerName ?? selfName ?? "" });
    setEditOpen(true);
  }

  function handleEditSave() {
    if (editId === null) return;
    update.mutate(
      { id: editId, data: { name: editForm.name, category: editForm.category, quantity: editForm.quantity, unit: editForm.unit, notes: editForm.notes || undefined, ownerName: editForm.ownerName || undefined } },
      {
        onSuccess: () => { invalidate(); setEditOpen(false); toast({ title: "Barang diperbarui" }); },
        onError: (err) => toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }),
      }
    );
  }

  async function handleSubmitAll(items: DraftItem[]) {
    await Promise.all(items.map(item =>
      create.mutateAsync({ data: { name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, notes: item.notes || undefined, itemType: item.itemType, ownerName: item.ownerName } })
    ));
    invalidate();
    toast({ title: items.length > 1 ? `${items.length} barang berhasil disimpan` : "Barang ditambahkan" });
  }

  const filtered = filterCat === "all" ? inventory : inventory.filter(i => i.category === filterCat);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-semibold text-gray-500">Lihat milik:</label>
          {isPrivileged ? (
            <select value={selectedOwner} onChange={e => setSelectedOwner(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-xl border border-white/50 bg-white/90 focus:outline-none focus:border-emerald-300">
              <option value="">-- Semua --</option>
              {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          ) : selfName ? (
            <span className={cn("flex items-center gap-1 text-xs text-white px-3 py-1 rounded-full bg-gradient-to-r", getMemberColor(selfName))}>
              {selfName}
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">Login untuk lihat barang sendiri</span>
          )}
        </div>
        {isLoggedIn && (
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => setCatalogQuickOpen(true)} variant="outline" className="rounded-full gap-1 text-violet-600 border-violet-300 hover:bg-violet-50">
              <BookOpen className="w-3.5 h-3.5" />Dari Katalog
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)} className="bg-gradient-to-r from-violet-400 to-sky-400 text-white border-0 rounded-full gap-1">
              <Plus className="w-4 h-4" />Tambah Barangku
            </Button>
          </div>
        )}
      </div>

      <InvCategoryFilter value={filterCat} onChange={setFilterCat} />

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="glass-card h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          {selectedOwner ? `${selectedOwner} belum mencatat Barang Pribadi.` : "Belum ada Barang Pribadi."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const editable = canEditItem(item.ownerName);
            const typeCfg = INV_TYPE_CONFIG[item.itemType as keyof typeof INV_TYPE_CONFIG] ?? INV_TYPE_CONFIG.pribadi;
            return (
              <div key={item.id} className={cn("glass-card p-3 group transition-all hover:-translate-y-0.5 flex items-start gap-3",
                selfName === item.ownerName && "ring-1 ring-violet-200")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 bg-gradient-to-br", getMemberColor(item.ownerName ?? ""))}>
                  {(item.ownerName ?? "?").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                    <Badge className={cn("text-[10px] px-2 py-0.5 border", getCatColor(item.category))}>
                      {getCatEmoji(item.category)} {getCatLabel(item.category)}
                    </Badge>
                    {item.itemType === "pinjaman" && (
                      <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border", INV_TYPE_CONFIG.pinjaman.color)}>
                        🤝 Dipinjamkan ke Kelompok
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="text-lg font-bold text-gray-800">{item.quantity}</span> {item.unit}
                    {item.ownerName && !selectedOwner && <span className="text-gray-400"> · {item.ownerName}</span>}
                  </p>
                  {item.notes && <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>}
                </div>
                {editable && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => openEdit(item)}><Pencil className="w-3 h-3 text-sky-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" disabled={del.isPending} onClick={() => del.mutate({ id: item.id }, { onSuccess: () => { invalidate(); toast({ title: "Barang dihapus" }); } })}><Trash2 className="w-3 h-3 text-rose-500" /></Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog quick-add dari katalog */}
      <CatalogQuickAddDialog
        open={catalogQuickOpen}
        onOpenChange={setCatalogQuickOpen}
        selfName={selfName}
        isPrivileged={isPrivileged}
        onSubmitAll={handleSubmitAll}
      />

      {/* Dialog tambah multi-barang */}
      <MultiItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        allowedTypes={[InventoryItemInputItemType.pribadi, InventoryItemInputItemType.pinjaman]}
        defaultItemType={InventoryItemInputItemType.pribadi}
        isPrivileged={isPrivileged}
        isKetSek={isKetSek}
        selfName={selfName}
        isLoggedIn={isLoggedIn}
        onSubmitAll={handleSubmitAll}
        title="Tambah Barang Pribadi"
        headerGradient="bg-gradient-to-r from-violet-400/20 to-sky-400/20"
      />

      {/* Dialog edit (satu barang) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="form-dialog border-white/50 max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-violet-400/20 to-sky-400/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><User className="w-5 h-5 text-violet-500" />Edit Barang Pribadi</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4">
            <SingleItemFields form={editForm} setForm={setEditForm} allowedTypes={editAllowedTypes} isPrivileged={isPrivileged} isKetSek={isKetSek} selfName={selfName} isLoggedIn={true} />
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-full">Batal</Button>
              <Button onClick={handleEditSave} disabled={!editForm.name || !editForm.unit || update.isPending} className="bg-gradient-to-r from-violet-400 to-sky-400 text-white border-0 rounded-full">Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Katalog Tab (admin only) ─────────────────────────────────────────────────
function CatalogTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: catalog = [], isLoading } = useGetItemCatalog();
  const createItem = useCreateCatalogItem();
  const updateItem = useUpdateCatalogItem();
  const deleteItem = useDeleteCatalogItem();

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", category: "alat_kebersihan" as CatalogItemInputCategory, unit: "" });

  const [inlineEditId, setInlineEditId] = useState<number | null>(null);
  const [inlineForm, setInlineForm] = useState({ name: "", category: "alat_kebersihan" as CatalogItemInputCategory, unit: "" });

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [filterCat, setFilterCat] = useState("all");

  function invalidate() { qc.invalidateQueries({ queryKey: getGetItemCatalogQueryKey() }); }

  function startInlineEdit(item: CatalogItem) {
    setInlineEditId(item.id);
    setInlineForm({ name: item.name, category: item.category as CatalogItemInputCategory, unit: item.unit });
  }

  function cancelInlineEdit() {
    setInlineEditId(null);
  }

  function saveInlineEdit() {
    if (!inlineForm.name.trim() || !inlineForm.unit.trim() || inlineEditId === null) return;
    updateItem.mutate(
      { id: inlineEditId, data: { name: inlineForm.name.trim(), category: inlineForm.category, unit: inlineForm.unit.trim() } },
      {
        onSuccess: () => { invalidate(); setInlineEditId(null); toast({ title: "Entri katalog diperbarui" }); },
        onError: (err: any) => {
          const msg = err?.response?.data?.error ?? "Gagal menyimpan";
          toast({ title: msg, variant: "destructive" });
        },
      }
    );
  }

  function handleAdd() {
    if (!addForm.name.trim() || !addForm.unit.trim()) return;
    createItem.mutate(
      { data: { name: addForm.name.trim(), category: addForm.category, unit: addForm.unit.trim() } },
      {
        onSuccess: () => { invalidate(); setAddOpen(false); setAddForm({ name: "", category: "alat_kebersihan", unit: "" }); toast({ title: "Barang ditambahkan ke katalog" }); },
        onError: (err: any) => {
          const msg = err?.response?.data?.error ?? "Nama sudah ada di katalog atau terjadi error";
          toast({ title: msg, variant: "destructive" });
        },
      }
    );
  }

  function confirmDelete() {
    if (confirmDeleteId === null) return;
    deleteItem.mutate(
      { id: confirmDeleteId },
      {
        onSuccess: () => { invalidate(); toast({ title: "Entri dihapus dari katalog" }); },
        onError: () => toast({ title: "Gagal menghapus", variant: "destructive" }),
        onSettled: () => setConfirmDeleteId(null),
      }
    );
  }

  const filtered = filterCat === "all" ? catalog : catalog.filter(c => c.category === filterCat);
  const confirmDeleteItem = catalog.find(c => c.id === confirmDeleteId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">Nama resmi + satuan baku untuk setiap jenis barang</p>
        <Button size="sm" onClick={() => setAddOpen(true)} className="bg-gradient-to-r from-violet-400 to-emerald-400 text-white border-0 rounded-full gap-1">
          <Plus className="w-4 h-4" />Tambah Entri
        </Button>
      </div>

      <InvCategoryFilter value={filterCat} onChange={setFilterCat} />

      {isLoading ? (
        <div className="animate-pulse space-y-2">{[1,2,3].map(i => <div key={i} className="glass-card h-12" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-emerald-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-violet-400" />
          </div>
          <p className="text-center text-gray-400 text-sm">Belum ada entri katalog{filterCat !== "all" ? " untuk kategori ini" : ""}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            inlineEditId === item.id ? (
              <div key={item.id} className="glass-card px-4 py-3 space-y-3 border-2 border-violet-300/50">
                <div className="flex gap-2">
                  <Input
                    value={inlineForm.name}
                    onChange={e => setInlineForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nama resmi..."
                    className="bg-white/90 text-sm h-8 flex-1"
                  />
                  <Input
                    value={inlineForm.unit}
                    onChange={e => setInlineForm(f => ({ ...f, unit: e.target.value }))}
                    placeholder="Satuan..."
                    className="bg-white/90 text-sm h-8 w-24"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {invCategories.map(cat => (
                    <button key={cat.id} type="button"
                      onClick={() => setInlineForm(f => ({ ...f, category: cat.id as CatalogItemInputCategory }))}
                      className={cn("flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium transition-all",
                        inlineForm.category === cat.id ? cat.color + " border-current" : "bg-white text-violet-600 border-violet-200/50 hover:bg-white/90"
                      )}>
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" className="rounded-full h-7 text-xs" onClick={cancelInlineEdit}>Batal</Button>
                  <Button size="sm"
                    disabled={!inlineForm.name.trim() || !inlineForm.unit.trim() || updateItem.isPending}
                    onClick={saveInlineEdit}
                    className="bg-gradient-to-r from-violet-400 to-emerald-400 text-white border-0 rounded-full h-7 text-xs">
                    {updateItem.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </div>
            ) : (
              <div key={item.id} className="glass-card px-4 py-3 flex items-center gap-3 group hover:-translate-y-0.5 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={cn("text-[10px] px-2 py-0.5 border", getCatColor(item.category))}>
                      {getCatEmoji(item.category)} {getCatLabel(item.category)}
                    </Badge>
                    <span className="text-xs text-gray-500">Satuan: <span className="font-semibold">{item.unit}</span></span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => startInlineEdit(item)}>
                    <Pencil className="w-3.5 h-3.5 text-sky-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setConfirmDeleteId(item.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </Button>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) setAddForm({ name: "", category: "alat_kebersihan", unit: "" }); }}>
        <DialogContent className="form-dialog border-white/50 max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-violet-400/20 to-emerald-400/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-500" />
                Tambah ke Katalog
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Nama Resmi</label>
              <Input placeholder="Nama barang resmi..." value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} className="bg-white/90" />
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-2 block">Kategori</label>
              <div className="grid grid-cols-2 gap-2">
                {invCategories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setAddForm(f => ({ ...f, category: cat.id as CatalogItemInputCategory }))} className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs transition-all",
                    addForm.category === cat.id ? cat.color + " border-current shadow-sm" : "bg-white text-violet-700 border-violet-200/50 hover:bg-white/90"
                  )}>
                    <span>{cat.emoji}</span>
                    <span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Satuan Baku</label>
              <Input placeholder="pcs, botol, kg, buah..." value={addForm.unit} onChange={e => setAddForm(f => ({ ...f, unit: e.target.value }))} className="bg-white/90" />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-full">Batal</Button>
              <Button
                onClick={handleAdd}
                disabled={!addForm.name.trim() || !addForm.unit.trim() || createItem.isPending}
                className="bg-gradient-to-r from-violet-400 to-emerald-400 text-white border-0 rounded-full"
              >
                {createItem.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={o => { if (!o) setConfirmDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus dari katalog?</AlertDialogTitle>
            <AlertDialogDescription>
              Entri <span className="font-semibold">"{confirmDeleteItem?.name}"</span> akan dihapus dari katalog barang.
              Barang inventaris yang sudah menggunakan nama ini tidak akan berubah.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {deleteItem.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Parent inventaris tab ────────────────────────────────────────────────────
function InventarisTab({ isAdmin, isKetSek, selfName, isPrivileged, isLoggedIn }: { isAdmin?: boolean; isKetSek: boolean; selfName: string | null; isPrivileged: boolean; isLoggedIn: boolean }) {
  const [invTab, setInvTab] = useState<"kelompok" | "pribadi" | "katalog">("kelompok");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-700">Inventaris</h2>
        <div className="flex gap-1 p-1 bg-white/90 rounded-xl border border-white/40 flex-wrap">
          <button onClick={() => setInvTab("kelompok")} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
            invTab === "kelompok" ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-sm" : "text-violet-700 hover:text-violet-900")}>
            🏠 Barang Kelompok
          </button>
          <button onClick={() => setInvTab("pribadi")} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
            invTab === "pribadi" ? "bg-gradient-to-r from-violet-400 to-sky-400 text-white shadow-sm" : "text-violet-700 hover:text-violet-900")}>
            👤 Barang Pribadi
          </button>
          {isKetSek && (
            <button onClick={() => setInvTab("katalog")} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
              invTab === "katalog" ? "bg-gradient-to-r from-violet-400 to-emerald-400 text-white shadow-sm" : "text-violet-700 hover:text-violet-900")}>
              📚 Katalog Barang
            </button>
          )}
        </div>
      </div>
      {invTab === "kelompok" && <BrgKelompokTab isAdmin={isAdmin} isKetSek={isKetSek} />}
      {invTab === "pribadi" && <BrgPribadiTab selfName={selfName} isPrivileged={isPrivileged} isKetSek={isKetSek} isLoggedIn={isLoggedIn} />}
      {invTab === "katalog" && isKetSek && <CatalogTab />}
    </div>
  );
}

// ─── KONDISI ANGGOTA TAB ──────────────────────────────────────────────────────
const CONDITION_CONFIG: Record<ConditionType, { label: string; color: string; emoji: string; placeholder: string }> = {
  alergi: { label: "Alergi", color: "bg-rose-100 text-rose-700 border-rose-200", emoji: "🚫", placeholder: "udang" },
  "sakit bawaan": { label: "Sakit Bawaan", color: "bg-red-100 text-red-700 border-red-200", emoji: "❤️", placeholder: "gerd" },
  fobia: { label: "Fobia", color: "bg-violet-100 text-violet-700 border-violet-200", emoji: "😨", placeholder: "cabai" },
  lainnya: { label: "Lainnya", color: "bg-emerald-100 text-emerald-700 border-emerald-200", emoji: "📝", placeholder: "" },
};

function KondisiTab({ memberName: selfName, isKetSek }: { memberName: string | null; isKetSek: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: conditions, isLoading } = useGetConditions();
  const createCond = useCreateCondition();
  const updateCond = useUpdateCondition();
  const deleteCond = useDeleteCondition();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<{ memberName: string; type: ConditionType; description: string }>({
    memberName: "", type: MemberConditionInputType.alergi, description: ""
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function invalidate() { qc.invalidateQueries({ queryKey: getGetConditionsQueryKey() }); }

  function canManage(owner: string) { return selfName === owner || isKetSek; }

  function openAdd(forMember: string) {
    setEditId(null);
    setForm({ memberName: forMember, type: MemberConditionInputType.alergi, description: "" });
    setFieldErrors({});
    setOpen(true);
  }
  function openEdit(c: any) {
    setEditId(c.id);
    setForm({ memberName: c.memberName, type: c.type as ConditionType, description: c.description });
    setFieldErrors({});
    setOpen(true);
  }

  function handleSave() {
    if (!form.description.trim()) return;
    if (editId !== null) {
      updateCond.mutate({ id: editId, data: { type: form.type, description: form.description } }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Kondisi diperbarui" }); },
        onError: (err) => { setFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
    } else {
      createCond.mutate({ data: form }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Kondisi ditambahkan" }); },
        onError: (err) => { setFieldErrors(extractApiFieldErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
    }
  }

  const byMember = MEMBERS.reduce((acc, m) => {
    acc[m] = (conditions ?? []).filter(c => c.memberName === m);
    return acc;
  }, {} as Record<string, typeof conditions extends (infer T)[] | undefined ? T[] : never[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Kondisi Anggota</h2>
        <p className="text-xs text-gray-400">Klik kartu untuk menambah kondisi</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse glass-card h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEMBERS.map(member => {
            const memberConds = byMember[member] ?? [];
            const canEdit = canManage(member);
            return (
              <div key={member} className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br", getMemberColor(member))}>
                      {member.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{member}</p>
                  </div>
                  {canEdit && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-rose-50" onClick={() => openAdd(member)}>
                      <Plus className="w-3.5 h-3.5 text-rose-500" />
                    </Button>
                  )}
                </div>

                {memberConds.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada catatan kondisi.</p>
                ) : (
                  <div className="space-y-2">
                    {memberConds.map(c => {
                      const cfg = CONDITION_CONFIG[c.type as ConditionType] ?? CONDITION_CONFIG.lainnya;
                      return (
                        <div key={c.id} className="group flex items-start gap-2">
                          <Badge className={cn("text-xs px-2 py-0.5 border flex items-center gap-1 shrink-0", cfg.color)}>
                            <span>{cfg.emoji}</span>{cfg.label}
                          </Badge>
                          <span className="text-xs text-gray-600 flex-1 leading-relaxed">{c.description}</span>
                          {canEdit && (
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full" onClick={() => openEdit(c)}>
                                <Pencil className="w-2.5 h-2.5 text-sky-500" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full" disabled={deleteCond.isPending} onClick={() =>
                                deleteCond.mutate({ id: c.id }, { onSuccess: () => { invalidate(); toast({ title: "Kondisi dihapus" }); } })}>
                                <Trash2 className="w-2.5 h-2.5 text-rose-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="form-dialog border-white/50 max-w-md p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-rose-400/20 to-sky-400/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                {editId ? "Edit Kondisi" : `Tambah Kondisi — ${form.memberName}`}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-2 block">Tipe Kondisi</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(CONDITION_CONFIG) as [ConditionType, typeof CONDITION_CONFIG[ConditionType]][]).map(([type, cfg]) => (
                  <button key={type} type="button" onClick={() => setForm(f => ({ ...f, type: type as ConditionType }))}
                    className={cn("flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-medium transition-all text-left",
                      form.type === type ? "border-rose-400 bg-rose-50 text-rose-700" : "border-white/40 bg-white/90 hover:bg-white/90 text-gray-600")}>
                    <span className="text-lg">{cfg.emoji}</span>{cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-1.5 block">Keterangan</label>
              <Input placeholder={`Contoh: ${CONDITION_CONFIG[form.type].label} ${CONDITION_CONFIG[form.type].placeholder}...`} value={form.description}
                onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setFieldErrors(fe => ({ ...fe, description: "" })); }} className="bg-white/90" />
              {fieldErrors.description && <p className="text-xs text-rose-500 mt-1">{fieldErrors.description}</p>}
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full"
                disabled={!form.description.trim() || createCond.isPending || updateCond.isPending}>
                Simpan
              </Button>
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
  const { can, memberName, role, isLoggedIn } = useAuth();
  const isAdmin = can("our-life");
  const isKetSek = role === "ketua" || role === "sekretaris";
  const isPrivileged = role === "ketua" || role === "sekretaris" || role === "bendahara";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">Our Life</h1>
        <p className="text-gray-500 text-sm mt-1">Kehidupan sehari-hari, jadwal piket, inventaris, dan kondisi anggota</p>
      </div>

      <div className="flex gap-2 p-1 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/40 w-fit flex-wrap">
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
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/90"
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
        {activeTab === "inventaris" && <InventarisTab isAdmin={isAdmin} isKetSek={isKetSek} selfName={memberName} isPrivileged={isPrivileged} isLoggedIn={isLoggedIn} />}
        {activeTab === "kondisi" && <KondisiTab memberName={memberName} isKetSek={isKetSek} />}
      </div>
    </div>
  );
}
