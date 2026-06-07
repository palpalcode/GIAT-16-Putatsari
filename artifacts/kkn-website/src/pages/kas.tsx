import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetKas,
  useGetAuthMe,
  useCreateKas,
  useUpdateKas,
  useDeleteKas,
  getGetKasQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function today() { return new Date().toISOString().split("T")[0]; }

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const KAS_CATEGORIES = [
  { id: "makan", label: "Makan", emoji: "🍽️", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: "transport", label: "Transport", emoji: "🚗", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { id: "perlengkapan", label: "Perlengkapan", emoji: "🛒", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { id: "administrasi", label: "Administrasi", emoji: "📄", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "lainnya", label: "Lainnya", emoji: "📦", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

function getCatInfo(cat: string) {
  return KAS_CATEGORIES.find(c => c.id === cat) ?? KAS_CATEGORIES[4];
}

type KasForm = { type: string; amount: string; description: string; category: string; date: string; notes: string };

function AddEditDialog({
  open, onClose, editId, initial, onSave, isPending
}: {
  open: boolean; onClose: () => void; editId: number | null; initial: KasForm;
  onSave: (f: KasForm) => void; isPending: boolean;
}) {
  const [form, setForm] = useState<KasForm>(initial);
  const set = (k: keyof KasForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="glass-panel border-white/50 max-w-md p-0 overflow-hidden">
        <div className={cn("px-6 pt-6 pb-4", form.type === "pemasukan" ? "bg-gradient-to-r from-emerald-400/20 to-teal-400/20" : "bg-gradient-to-r from-rose-400/20 to-pink-400/20")}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {editId ? "Edit Transaksi" : "Catat Transaksi Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mt-4">
            {["pemasukan", "pengeluaran"].map(t => (
              <button key={t} onClick={() => set("type", t)} className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
                form.type === t
                  ? t === "pemasukan" ? "bg-emerald-500 text-white border-emerald-500 shadow-md" : "bg-rose-500 text-white border-rose-500 shadow-md"
                  : "bg-white/60 text-gray-500 border-white/50 hover:bg-white/80"
              )}>
                {t === "pemasukan" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {t === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Jumlah (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">Rp</span>
              <Input
                type="number" min={0} placeholder="0"
                value={form.amount}
                onChange={e => set("amount", e.target.value)}
                className="bg-white/60 pl-10 text-lg font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Keterangan</label>
            <Input placeholder="Deskripsi transaksi..." value={form.description} onChange={e => set("description", e.target.value)} className="bg-white/60" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {KAS_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => set("category", cat.id)} className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all",
                  form.category === cat.id ? cat.color + " border-current shadow-sm scale-105" : "bg-white/40 text-gray-500 border-white/40 hover:bg-white/60"
                )}>
                  <span>{cat.emoji}</span>{cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tanggal</label>
            <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="bg-white/60" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
            <Input placeholder="Catatan tambahan..." value={form.notes} onChange={e => set("notes", e.target.value)} className="bg-white/60" />
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <Button variant="outline" onClick={onClose} className="rounded-full">Batal</Button>
            <Button
              onClick={() => onSave(form)}
              disabled={isPending || !form.amount || !form.description}
              className={cn("rounded-full text-white border-0", form.type === "pemasukan" ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-rose-400 to-pink-500")}
            >
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function KasPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: auth } = useGetAuthMe();
  const { data: kas, isLoading } = useGetKas();
  const create = useCreateKas();
  const update = useUpdateKas();
  const del = useDeleteKas();

  const isAdmin = auth?.isAdmin;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState("all");
  const defaultForm: KasForm = { type: "pemasukan", amount: "", description: "", category: "lainnya", date: today(), notes: "" };
  const [initForm, setInitForm] = useState<KasForm>(defaultForm);

  function invalidate() { qc.invalidateQueries({ queryKey: getGetKasQueryKey() }); }

  function openAdd() { setEditId(null); setInitForm(defaultForm); setOpen(true); }
  function openEdit(item: any) {
    setEditId(item.id);
    setInitForm({ type: item.type, amount: String(item.amount), description: item.description, category: item.category, date: item.date, notes: item.notes ?? "" });
    setOpen(true);
  }

  function handleSave(form: KasForm) {
    const payload = { type: form.type, amount: Number(form.amount), description: form.description, category: form.category, date: form.date, notes: form.notes || undefined };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Transaksi diperbarui" }); } });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Transaksi dicatat" }); } });
    }
  }

  const all = kas ?? [];
  const filtered = filterType === "all" ? all : all.filter(k => k.type === filterType);
  const totalPemasukan = all.filter(k => k.type === "pemasukan").reduce((s, k) => s + k.amount, 0);
  const totalPengeluaran = all.filter(k => k.type === "pengeluaran").reduce((s, k) => s + k.amount, 0);
  const saldo = totalPemasukan - totalPengeluaran;

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const item of filtered) {
      const month = item.date.slice(0, 7);
      if (!map[month]) map[month] = [];
      map[month].push(item);
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  function monthLabel(ym: string) {
    const [y, m] = ym.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">Kas Tim</h1>
          <p className="text-gray-500 text-sm mt-1">Pencatatan pemasukan dan pengeluaran kas tim KKN</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd} className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 rounded-full gap-2">
            <Plus className="w-4 h-4" />Catat Transaksi
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Pemasukan</span>
          </div>
          <p className="text-xl font-bold text-emerald-700 mt-1">{formatRp(totalPemasukan)}</p>
        </div>

        <div className="glass-card p-5 bg-gradient-to-br from-rose-50 to-pink-50">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Pengeluaran</span>
          </div>
          <p className="text-xl font-bold text-rose-700 mt-1">{formatRp(totalPengeluaran)}</p>
        </div>

        <div className={cn("glass-card p-5", saldo >= 0 ? "bg-gradient-to-br from-sky-50 to-blue-50" : "bg-gradient-to-br from-amber-50 to-orange-50")}>
          <div className="flex items-center gap-3 mb-1">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", saldo >= 0 ? "bg-sky-100" : "bg-amber-100")}>
              <Wallet className={cn("w-5 h-5", saldo >= 0 ? "text-sky-600" : "text-amber-600")} />
            </div>
            <span className="text-sm font-medium text-gray-500">Saldo</span>
          </div>
          <p className={cn("text-xl font-bold mt-1", saldo >= 0 ? "text-sky-700" : "text-amber-700")}>{formatRp(Math.abs(saldo))}</p>
          {saldo < 0 && <p className="text-xs text-amber-600 mt-0.5">Defisit</p>}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { id: "all", label: "Semua" },
          { id: "pemasukan", label: "Pemasukan" },
          { id: "pengeluaran", label: "Pengeluaran" },
        ].map(f => (
          <button key={f.id} onClick={() => setFilterType(f.id)} className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
            filterType === f.id
              ? f.id === "pemasukan" ? "bg-emerald-500 text-white border-transparent"
                : f.id === "pengeluaran" ? "bg-rose-500 text-white border-transparent"
                : "bg-gradient-to-r from-emerald-400 to-sky-400 text-white border-transparent"
              : "bg-white/50 text-gray-600 border-white/50 hover:bg-white/80"
          )}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-3xl">💰</div>
          <p className="text-gray-400 text-sm">Belum ada transaksi tercatat.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([month, items]) => {
            const in_ = items.filter(i => i.type === "pemasukan").reduce((s, i) => s + i.amount, 0);
            const out_ = items.filter(i => i.type === "pengeluaran").reduce((s, i) => s + i.amount, 0);
            return (
              <div key={month}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{monthLabel(month)}</h3>
                  <div className="flex items-center gap-3 text-xs">
                    {in_ > 0 && <span className="text-emerald-600 font-medium">+{formatRp(in_)}</span>}
                    {out_ > 0 && <span className="text-rose-600 font-medium">-{formatRp(out_)}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {items.map(item => {
                    const cat = getCatInfo(item.category);
                    return (
                      <div key={item.id} className="glass-card p-4 group hover:-translate-y-0.5 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0", item.type === "pemasukan" ? "bg-emerald-100" : "bg-rose-100")}>
                            {cat.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-semibold text-sm text-gray-900 truncate">{item.description}</p>
                              <Badge className={cn("text-xs border shrink-0", cat.color)}>{cat.label}</Badge>
                            </div>
                            <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn("font-bold text-sm", item.type === "pemasukan" ? "text-emerald-600" : "text-rose-600")}>
                              {item.type === "pemasukan" ? "+" : "-"}{formatRp(item.amount)}
                            </span>
                            {isAdmin && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5 text-sky-500" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => del.mutate({ id: item.id }, { onSuccess: () => { invalidate(); toast({ title: "Transaksi dihapus" }); } })}><Trash2 className="w-3.5 h-3.5 text-rose-500" /></Button>
                              </div>
                            )}
                          </div>
                        </div>
                        {item.notes && <p className="text-xs text-gray-400 mt-2 ml-13 pl-1">{item.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddEditDialog
        open={open}
        onClose={() => setOpen(false)}
        editId={editId}
        initial={initForm}
        onSave={handleSave}
        isPending={create.isPending || update.isPending}
      />
    </div>
  );
}
