import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  type KasInputType,
  type KasInputCategory,
  KasInputFund,
  type KasInputFund as KasFundType,
  useGetKas,
  useCreateKas,
  useUpdateKas,
  useDeleteKas,
  useGetKasConfig,
  useUpdateKasConfig,
  useGetKasSummary,
  useTransferSisaMakan,
  useGetProkerFunds,
  useCreateProkerFund,
  useUpdateProkerFund,
  useDeleteProkerFund,
  getGetKasQueryKey,
  getGetKasConfigQueryKey,
  getGetKasSummaryQueryKey,
  getGetProkerFundsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Pencil, Trash2, TrendingUp, TrendingDown, Wallet,
  ArrowUpCircle, ArrowDownCircle, ShieldCheck, Utensils,
  Folder, ChevronRight, Settings, ArrowRightLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function today() { return new Date().toISOString().split("T")[0]; }
function formatRp(n: number) { return "Rp " + n.toLocaleString("id-ID"); }
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
function getCatInfo(cat: string) { return KAS_CATEGORIES.find(c => c.id === cat) ?? KAS_CATEGORIES[4]; }

type KasForm = {
  type: KasInputType;
  amount: string;
  description: string;
  category: KasInputCategory;
  date: string;
  notes: string;
  fund: KasFundType;
  prokerId: string;
};
function defaultForm(fund: KasFundType = KasInputFund.umum): KasForm {
  return { type: "pemasukan", amount: "", description: "", category: "lainnya", date: today(), notes: "", fund, prokerId: "" };
}

// ─── TRANSACTION LIST ────────────────────────────────────────────────────────
function TxList({ items, isAdmin, onEdit, onDelete }: {
  items: any[];
  isAdmin?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
}) {
  const grouped = useMemo(() => {
    const map: Record<string, typeof items> = {};
    for (const item of items) {
      const month = item.date.slice(0, 7);
      if (!map[month]) map[month] = [];
      map[month].push(item);
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [items]);

  function monthLabel(ym: string) {
    const [y, m] = ym.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 gap-2">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-2xl">💰</div>
        <p className="text-gray-400 text-sm">Belum ada transaksi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {grouped.map(([month, monthItems]) => {
        const in_ = monthItems.filter((i: any) => i.type === "pemasukan").reduce((s: number, i: any) => s + i.amount, 0);
        const out_ = monthItems.filter((i: any) => i.type === "pengeluaran").reduce((s: number, i: any) => s + i.amount, 0);
        return (
          <div key={month}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-600 text-xs uppercase tracking-wide">{monthLabel(month)}</h4>
              <div className="flex gap-3 text-xs">
                {in_ > 0 && <span className="text-emerald-600 font-medium">+{formatRp(in_)}</span>}
                {out_ > 0 && <span className="text-rose-600 font-medium">-{formatRp(out_)}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {monthItems.map((item: any) => {
                const cat = getCatInfo(item.category);
                return (
                  <div key={item.id} className="glass-card p-3.5 group hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0", item.type === "pemasukan" ? "bg-emerald-100" : "bg-rose-100")}>
                        {cat.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="font-semibold text-sm text-gray-900 truncate">{item.description}</p>
                          <Badge className={cn("text-[10px] border shrink-0 px-1.5 py-0", cat.color)}>{cat.label}</Badge>
                        </div>
                        <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn("font-bold text-sm", item.type === "pemasukan" ? "text-emerald-600" : "text-rose-600")}>
                          {item.type === "pemasukan" ? "+" : "-"}{formatRp(item.amount)}
                        </span>
                        {isAdmin && (onEdit || onDelete) && (
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEdit && <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => onEdit(item)}><Pencil className="w-3 h-3 text-sky-500" /></Button>}
                            {onDelete && <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => onDelete(item.id)}><Trash2 className="w-3 h-3 text-rose-500" /></Button>}
                          </div>
                        )}
                      </div>
                    </div>
                    {item.notes && <p className="text-xs text-gray-400 mt-1.5 ml-12">{item.notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ADD/EDIT DIALOG ─────────────────────────────────────────────────────────
function AddEditDialog({
  open, onClose, editId, initial, onSave, isPending, fixedFund,
}: {
  open: boolean; onClose: () => void; editId: number | null; initial: KasForm;
  onSave: (f: KasForm) => void; isPending: boolean; fixedFund?: KasFundType;
}) {
  const [form, setForm] = useState<KasForm>(initial);
  const set = <K extends keyof KasForm>(k: K, v: KasForm[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="glass-panel border-white/50 max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className={cn("px-6 pt-6 pb-4", form.type === "pemasukan" ? "bg-gradient-to-r from-emerald-400/20 to-teal-400/20" : "bg-gradient-to-r from-rose-400/20 to-pink-400/20")}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">{editId ? "Edit Transaksi" : "Catat Transaksi Baru"}</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            {["pemasukan", "pengeluaran"].map(t => (
              <button key={t} onClick={() => set("type", t as KasInputType)} className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
                form.type === t ? (t === "pemasukan" ? "bg-emerald-500 text-white border-emerald-500 shadow-md" : "bg-rose-500 text-white border-rose-500 shadow-md") : "bg-white/60 text-gray-500 border-white/50 hover:bg-white/80"
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
              <Input type="number" min={0} placeholder="0" value={form.amount} onChange={e => set("amount", e.target.value)} className="bg-white/60 pl-10 text-lg font-bold" />
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
                <button key={cat.id} onClick={() => set("category", cat.id as KasInputCategory)} className={cn(
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
            <Button onClick={() => onSave(form)} disabled={isPending || !form.amount || !form.description}
              className={cn("rounded-full text-white border-0", form.type === "pemasukan" ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-rose-400 to-pink-500")}>
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── KAS UMUM TAB ────────────────────────────────────────────────────────────
function UmumTab({ isAdmin, summary }: { isAdmin?: boolean; summary: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: kas, isLoading } = useGetKas({ fund: "umum" });
  const create = useCreateKas();
  const update = useUpdateKas();
  const del = useDeleteKas();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [initForm, setInitForm] = useState<KasForm>(defaultForm(KasInputFund.umum));
  const [filterType, setFilterType] = useState("all");

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "umum" }) });
    qc.invalidateQueries({ queryKey: getGetKasSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setInitForm(defaultForm(KasInputFund.umum)); setOpen(true); }
  function openEdit(item: any) {
    setEditId(item.id);
    setInitForm({ type: item.type, amount: String(item.amount), description: item.description, category: item.category, date: item.date, notes: item.notes ?? "", fund: KasInputFund.umum, prokerId: "" });
    setOpen(true);
  }
  function handleSave(form: KasForm) {
    const payload = { type: form.type, amount: Number(form.amount), description: form.description, category: form.category, date: form.date, notes: form.notes || undefined, fund: KasInputFund.umum };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Transaksi diperbarui" }); } });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Transaksi dicatat" }); } });
    }
  }

  const all = kas ?? [];
  const filtered = filterType === "all" ? all : all.filter((k: any) => k.type === filterType);
  const saldo = summary?.saldoUmum ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="glass-card px-4 py-2.5 flex items-center gap-3">
          <Wallet className="w-5 h-5 text-sky-500" />
          <div>
            <p className="text-xs text-gray-500">Saldo Kas Umum</p>
            <p className={cn("text-lg font-bold", saldo >= 0 ? "text-sky-700" : "text-amber-600")}>{formatRp(Math.abs(saldo))}{saldo < 0 && " (defisit)"}</p>
          </div>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 rounded-full gap-1">
            <Plus className="w-4 h-4" />Catat Transaksi
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {[{ id: "all", label: "Semua" }, { id: "pemasukan", label: "Pemasukan" }, { id: "pengeluaran", label: "Pengeluaran" }].map(f => (
          <button key={f.id} onClick={() => setFilterType(f.id)} className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
            filterType === f.id ? (f.id === "pemasukan" ? "bg-emerald-500 text-white border-transparent" : f.id === "pengeluaran" ? "bg-rose-500 text-white border-transparent" : "bg-gradient-to-r from-emerald-400 to-sky-400 text-white border-transparent") : "bg-white/50 text-gray-600 border-white/50 hover:bg-white/80"
          )}>{f.label}</button>
        ))}
      </div>

      {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-16" />)}</div> : (
        <TxList items={filtered} isAdmin={isAdmin} onEdit={openEdit}
          onDelete={id => del.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Transaksi dihapus" }); } })} />
      )}

      <AddEditDialog open={open} onClose={() => setOpen(false)} editId={editId} initial={initForm} onSave={handleSave} isPending={create.isPending || update.isPending} fixedFund={KasInputFund.umum} />
    </div>
  );
}

// ─── IURAN MAKAN TAB ─────────────────────────────────────────────────────────
function IuranMakanTab({ isAdmin, summary }: { isAdmin?: boolean; summary: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: kas, isLoading } = useGetKas({ fund: "iuran_makan" });
  const create = useCreateKas();
  const del = useDeleteKas();
  const updateConfig = useUpdateKasConfig();
  const transferSisa = useTransferSisaMakan();

  const [openTx, setOpenTx] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [txForm, setTxForm] = useState<{ amount: string; description: string; type: KasInputType; category: KasInputCategory; date: string; notes: string }>({
    amount: "", description: "Belanja makan", type: "pengeluaran", category: "makan", date: today(), notes: ""
  });
  const [configForm, setConfigForm] = useState({ weeklyAmount: String(summary?.weeklyFoodAmount ?? 0) });
  const [transferForm, setTransferForm] = useState({ date: today(), terpakai: "" });

  const jatahHarian = summary?.dailyFoodAllowance ?? 0;
  const saldoMakan = summary?.saldoIuranMakan ?? 0;
  const weeklyFood = summary?.weeklyFoodAmount ?? 0;

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "iuran_makan" }) });
    qc.invalidateQueries({ queryKey: getGetKasSummaryQueryKey() });
    qc.invalidateQueries({ queryKey: getGetKasConfigQueryKey() });
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "darurat" }) });
  }

  function saveTx() {
    if (!txForm.amount || !txForm.description) return;
    create.mutate({
      data: { type: txForm.type, amount: Number(txForm.amount), description: txForm.description, category: txForm.category, date: txForm.date, notes: txForm.notes || undefined, fund: KasInputFund.iuran_makan }
    }, { onSuccess: () => { invalidate(); setOpenTx(false); toast({ title: "Transaksi dicatat" }); } });
  }

  function saveConfig() {
    updateConfig.mutate({ data: { weeklyFoodAmount: Number(configForm.weeklyAmount) } }, {
      onSuccess: () => { invalidate(); setOpenConfig(false); toast({ title: "Iuran makan diperbarui" }); }
    });
  }

  function doTransfer() {
    if (!transferForm.terpakai) return;
    transferSisa.mutate({ data: { date: transferForm.date, terpakai: Number(transferForm.terpakai) } }, {
      onSuccess: (res) => { invalidate(); setOpenTransfer(false); toast({ title: `Sisa ${formatRp(res.sisa)} berhasil ditransfer ke dana darurat` }); },
      onError: () => { toast({ title: "Tidak ada sisa untuk ditransfer", variant: "destructive" }); },
    });
  }

  const all = kas ?? [];

  return (
    <div className="space-y-5">
      {/* Config Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4 bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Iuran Makan/Orang/Minggu</p>
              <p className="text-xl font-bold text-orange-700">{formatRp(weeklyFood)}</p>
            </div>
            {isAdmin && <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => { setConfigForm({ weeklyAmount: String(weeklyFood) }); setOpenConfig(true); }}><Settings className="w-3.5 h-3.5 text-gray-400" /></Button>}
          </div>
        </div>
        <div className="glass-card p-4 bg-gradient-to-br from-amber-50 to-yellow-50">
          <p className="text-xs text-gray-500 mb-0.5">Jatah Makan Harian</p>
          <p className="text-xl font-bold text-amber-700">{formatRp(jatahHarian)}</p>
          <p className="text-[10px] text-gray-400">({formatRp(weeklyFood)} × 9 ÷ 7)</p>
        </div>
        <div className={cn("glass-card p-4", saldoMakan >= 0 ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-gradient-to-br from-rose-50 to-pink-50")}>
          <p className="text-xs text-gray-500 mb-0.5">Saldo Dana Makan</p>
          <p className={cn("text-xl font-bold", saldoMakan >= 0 ? "text-emerald-700" : "text-rose-700")}>{formatRp(Math.abs(saldoMakan))}</p>
          {saldoMakan < 0 && <p className="text-[10px] text-rose-500">Defisit</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {isAdmin && (
          <>
            <Button size="sm" onClick={() => { setTxForm({ amount: "", description: "Belanja makan", type: "pengeluaran", category: "makan", date: today(), notes: "" }); setOpenTx(true); }}
              className="bg-gradient-to-r from-orange-400 to-amber-400 text-white border-0 rounded-full gap-1">
              <Plus className="w-4 h-4" />Catat Pengeluaran Makan
            </Button>
            <Button size="sm" onClick={() => { setTxForm({ amount: "", description: "Iuran makan mingguan", type: "pemasukan", category: "makan", date: today(), notes: "" }); setOpenTx(true); }}
              variant="outline" className="rounded-full gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
              <ArrowUpCircle className="w-4 h-4" />Catat Pemasukan
            </Button>
            <Button size="sm" onClick={() => { setTransferForm({ date: today(), terpakai: "" }); setOpenTransfer(true); }}
              variant="outline" className="rounded-full gap-1 text-sky-700 border-sky-200 hover:bg-sky-50">
              <ArrowRightLeft className="w-4 h-4" />Transfer Sisa ke Dana Darurat
            </Button>
          </>
        )}
      </div>

      {/* List */}
      {isLoading ? <div className="animate-pulse space-y-2">{[1,2].map(i => <div key={i} className="glass-card h-14" />)}</div> : (
        <TxList items={all} isAdmin={isAdmin}
          onDelete={id => del.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Transaksi dihapus" }); } })} />
      )}

      {/* Add Transaction Dialog */}
      <Dialog open={openTx} onOpenChange={v => !v && setOpenTx(false)}>
        <DialogContent className="glass-panel border-white/50 max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-orange-400/20 to-amber-400/20">
            <DialogHeader><DialogTitle>Catat Transaksi Makan</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Jenis</label>
              <div className="flex gap-2">
                {["pengeluaran", "pemasukan"].map(t => (
                  <button key={t} onClick={() => setTxForm(f => ({ ...f, type: t as KasInputType }))} className={cn(
                    "flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all",
                    txForm.type === t ? (t === "pengeluaran" ? "bg-rose-500 text-white border-rose-500" : "bg-emerald-500 text-white border-emerald-500") : "bg-white/60 text-gray-500 border-white/50"
                  )}>{t === "pengeluaran" ? "Pengeluaran" : "Pemasukan"}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Jumlah (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">Rp</span>
                <Input type="number" min={0} value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} className="bg-white/60 pl-10 font-bold" />
              </div>
              {txForm.type === "pengeluaran" && jatahHarian > 0 && (
                <p className="text-xs text-amber-600 mt-1">Jatah hari ini: {formatRp(jatahHarian)}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Keterangan</label>
              <Input value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))} className="bg-white/60" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tanggal</label>
              <Input type="date" value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))} className="bg-white/60" />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpenTx(false)} className="rounded-full">Batal</Button>
              <Button onClick={saveTx} disabled={create.isPending || !txForm.amount || !txForm.description}
                className="rounded-full text-white border-0 bg-gradient-to-r from-orange-400 to-amber-500">Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={openConfig} onOpenChange={v => !v && setOpenConfig(false)}>
        <DialogContent className="glass-panel border-white/50 max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-amber-400/20 to-yellow-400/20">
            <DialogHeader><DialogTitle>Atur Iuran Makan</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Iuran Mingguan Per Orang (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">Rp</span>
                <Input type="number" min={0} value={configForm.weeklyAmount} onChange={e => setConfigForm(f => ({ ...f, weeklyAmount: e.target.value }))} className="bg-white/60 pl-10 font-bold text-lg" />
              </div>
              {Number(configForm.weeklyAmount) > 0 && (
                <p className="text-xs text-amber-600 mt-1">Jatah harian: {formatRp(Math.floor(Number(configForm.weeklyAmount) * 9 / 7))} (× 9 anggota ÷ 7 hari)</p>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpenConfig(false)} className="rounded-full">Batal</Button>
              <Button onClick={saveConfig} disabled={updateConfig.isPending} className="rounded-full text-white border-0 bg-gradient-to-r from-amber-400 to-orange-400">Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={openTransfer} onOpenChange={v => !v && setOpenTransfer(false)}>
        <DialogContent className="glass-panel border-white/50 max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-sky-400/20 to-blue-400/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowRightLeft className="w-5 h-5 text-sky-500" />Transfer Sisa ke Dana Darurat</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-3">
            <div className="glass-card p-3 bg-sky-50/60 rounded-xl">
              <p className="text-xs text-gray-500">Jatah harian: <span className="font-bold text-amber-700">{formatRp(jatahHarian)}</span></p>
              <p className="text-xs text-gray-400 mt-0.5">Sisa = Jatah - Terpakai akan dipindah ke dana darurat</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tanggal</label>
              <Input type="date" value={transferForm.date} onChange={e => setTransferForm(f => ({ ...f, date: e.target.value }))} className="bg-white/60" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Pengeluaran Makan Hari Ini (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">Rp</span>
                <Input type="number" min={0} value={transferForm.terpakai} onChange={e => setTransferForm(f => ({ ...f, terpakai: e.target.value }))} className="bg-white/60 pl-10 font-bold" />
              </div>
              {transferForm.terpakai && jatahHarian > 0 && (
                <p className={cn("text-xs mt-1", jatahHarian - Number(transferForm.terpakai) > 0 ? "text-emerald-600" : "text-rose-500")}>
                  Sisa: {formatRp(Math.max(0, jatahHarian - Number(transferForm.terpakai)))}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpenTransfer(false)} className="rounded-full">Batal</Button>
              <Button onClick={doTransfer} disabled={transferSisa.isPending || !transferForm.terpakai || Number(transferForm.terpakai) >= jatahHarian}
                className="rounded-full text-white border-0 bg-gradient-to-r from-sky-400 to-blue-500">Transfer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── DANA DARURAT TAB ────────────────────────────────────────────────────────
function DanadaruratTab({ isAdmin, summary }: { isAdmin?: boolean; summary: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: kas, isLoading } = useGetKas({ fund: "darurat" });
  const create = useCreateKas();
  const del = useDeleteKas();
  const updateConfig = useUpdateKasConfig();

  const [openTx, setOpenTx] = useState(false);
  const [openTarget, setOpenTarget] = useState(false);
  const [txForm, setTxForm] = useState<{ amount: string; description: string; type: KasInputType; date: string; notes: string }>({
    amount: "", description: "", type: "pemasukan", date: today(), notes: ""
  });
  const [targetForm, setTargetForm] = useState({ target: "" });

  const saldo = summary?.saldoDarurat ?? 0;
  const target = summary?.emergencyFundTarget ?? 0;
  const status = summary?.emergencyFundStatus ?? "kurang";
  const pct = target > 0 ? Math.min(100, Math.round((saldo / target) * 100)) : (saldo > 0 ? 100 : 0);

  const statusMap: Record<string, { label: string; color: string; bgColor: string; barColor: string }> = {
    kurang: { label: "Perlu Penambahan", color: "text-rose-600", bgColor: "bg-rose-100 border-rose-200", barColor: "bg-rose-400" },
    cukup: { label: "Cukup", color: "text-amber-600", bgColor: "bg-amber-100 border-amber-200", barColor: "bg-amber-400" },
    sangat_cukup: { label: "Sangat Cukup ✓", color: "text-emerald-600", bgColor: "bg-emerald-100 border-emerald-200", barColor: "bg-emerald-400" },
  };
  const statusInfo = statusMap[status] ?? { label: "Kurang", color: "text-rose-600", bgColor: "bg-rose-100 border-rose-200", barColor: "bg-rose-400" };

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "darurat" }) });
    qc.invalidateQueries({ queryKey: getGetKasSummaryQueryKey() });
    qc.invalidateQueries({ queryKey: getGetKasConfigQueryKey() });
  }

  function saveTx() {
    if (!txForm.amount || !txForm.description) return;
    create.mutate({
      data: { type: txForm.type, amount: Number(txForm.amount), description: txForm.description, category: "lainnya", date: txForm.date, notes: txForm.notes || undefined, fund: KasInputFund.darurat }
    }, { onSuccess: () => { invalidate(); setOpenTx(false); toast({ title: "Transaksi dicatat" }); } });
  }

  function saveTarget() {
    updateConfig.mutate({ data: { emergencyFundTarget: Number(targetForm.target) } }, {
      onSuccess: () => { invalidate(); setOpenTarget(false); toast({ title: "Target dana darurat diperbarui" }); }
    });
  }

  const all = kas ?? [];

  return (
    <div className="space-y-5">
      {/* Status Card */}
      <div className="glass-card p-5 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-500" />
            <div>
              <p className="text-xs text-gray-500">Saldo Dana Darurat</p>
              <p className="text-2xl font-bold text-rose-700">{formatRp(saldo)}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={cn("text-xs border px-2.5 py-1", statusInfo.bgColor, statusInfo.color)}>{statusInfo.label}</Badge>
            {isAdmin && (
              <button onClick={() => { setTargetForm({ target: String(target) }); setOpenTarget(true); }} className="block mt-1 text-xs text-gray-400 hover:text-gray-600 ml-auto">
                Target: {target > 0 ? formatRp(target) : "Belum diset"} ✏️
              </button>
            )}
            {!isAdmin && target > 0 && <p className="text-xs text-gray-400 mt-1">Target: {formatRp(target)}</p>}
          </div>
        </div>
        {target > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{pct}% tercapai</span>
              <span>{formatRp(target)}</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-700", statusInfo.barColor)} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => { setTxForm({ amount: "", description: "", type: "pemasukan", date: today(), notes: "" }); setOpenTx(true); }}
            className="bg-gradient-to-r from-rose-400 to-pink-500 text-white border-0 rounded-full gap-1">
            <Plus className="w-4 h-4" />Tambah Dana Darurat
          </Button>
          <Button size="sm" onClick={() => { setTxForm({ amount: "", description: "", type: "pengeluaran", date: today(), notes: "" }); setOpenTx(true); }}
            variant="outline" className="rounded-full gap-1 text-rose-700 border-rose-200 hover:bg-rose-50">
            <ArrowDownCircle className="w-4 h-4" />Catat Pengeluaran Darurat
          </Button>
        </div>
      )}

      {isLoading ? <div className="animate-pulse space-y-2">{[1,2].map(i => <div key={i} className="glass-card h-14" />)}</div> : (
        <TxList items={all} isAdmin={isAdmin}
          onDelete={id => del.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Transaksi dihapus" }); } })} />
      )}

      {/* Add Transaction Dialog */}
      <Dialog open={openTx} onOpenChange={v => !v && setOpenTx(false)}>
        <DialogContent className="glass-panel border-white/50 max-w-sm p-0 overflow-hidden">
          <div className={cn("px-6 pt-6 pb-4", txForm.type === "pemasukan" ? "bg-gradient-to-r from-rose-400/20 to-pink-400/20" : "bg-gradient-to-r from-rose-600/20 to-pink-600/20")}>
            <DialogHeader><DialogTitle>Transaksi Dana Darurat</DialogTitle></DialogHeader>
            <div className="flex gap-2 mt-3">
              {["pemasukan", "pengeluaran"].map(t => (
                <button key={t} onClick={() => setTxForm(f => ({ ...f, type: t as KasInputType }))} className={cn(
                  "flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all",
                  txForm.type === t ? (t === "pemasukan" ? "bg-emerald-500 text-white border-emerald-500" : "bg-rose-500 text-white border-rose-500") : "bg-white/60 text-gray-500 border-white/50"
                )}>{t === "pemasukan" ? "Pemasukan" : "Pengeluaran"}</button>
              ))}
            </div>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Jumlah (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">Rp</span>
                <Input type="number" min={0} value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} className="bg-white/60 pl-10 font-bold" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Keterangan</label>
              <Input value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))} className="bg-white/60" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tanggal</label>
              <Input type="date" value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))} className="bg-white/60" />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpenTx(false)} className="rounded-full">Batal</Button>
              <Button onClick={saveTx} disabled={create.isPending || !txForm.amount || !txForm.description}
                className={cn("rounded-full text-white border-0", txForm.type === "pemasukan" ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-rose-400 to-pink-500")}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Target Dialog */}
      <Dialog open={openTarget} onOpenChange={v => !v && setOpenTarget(false)}>
        <DialogContent className="glass-panel border-white/50 max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-rose-400/20 to-pink-400/20">
            <DialogHeader><DialogTitle>Set Target Dana Darurat</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Target Dana Darurat (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">Rp</span>
                <Input type="number" min={0} value={targetForm.target} onChange={e => setTargetForm({ target: e.target.value })} className="bg-white/60 pl-10 font-bold text-lg" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpenTarget(false)} className="rounded-full">Batal</Button>
              <Button onClick={saveTarget} disabled={updateConfig.isPending} className="rounded-full text-white border-0 bg-gradient-to-r from-rose-400 to-pink-500">Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── DANA PROKER TAB ─────────────────────────────────────────────────────────
function DanaProkerTab({ isAdmin }: { isAdmin?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: prokers, isLoading: loadingProkers } = useGetProkerFunds();
  const createProker = useCreateProkerFund();
  const updateProker = useUpdateProkerFund();
  const delProker = useDeleteProkerFund();
  const create = useCreateKas();
  const del = useDeleteKas();

  const [selectedProker, setSelectedProker] = useState<number | null>(null);
  const { data: prokerKas, isLoading: loadingKas } = useGetKas(
    selectedProker !== null ? { fund: "proker" } : undefined
  );

  const [openAddProker, setOpenAddProker] = useState(false);
  const [openEditProker, setOpenEditProker] = useState(false);
  const [openAddTx, setOpenAddTx] = useState(false);
  const [editProkerForm, setEditProkerForm] = useState({ name: "", budget: "", notes: "" });
  const [editProkerId, setEditProkerId] = useState<number | null>(null);
  const [txForm, setTxForm] = useState<{ amount: string; description: string; type: KasInputType; date: string; notes: string }>({
    amount: "", description: "", type: "pengeluaran", date: today(), notes: ""
  });

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: getGetProkerFundsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "proker" }) });
    qc.invalidateQueries({ queryKey: getGetKasSummaryQueryKey() });
  }

  const selectedProkerData = prokers?.find(p => p.id === selectedProker);
  const prokerTxs = prokerKas?.filter((k: any) => k.prokerId === selectedProker) ?? [];

  function saveProker(isEdit: boolean) {
    const data = { name: editProkerForm.name, budget: Number(editProkerForm.budget), notes: editProkerForm.notes || undefined };
    if (isEdit && editProkerId !== null) {
      updateProker.mutate({ id: editProkerId, data }, { onSuccess: () => { invalidateAll(); setOpenEditProker(false); toast({ title: "Proker diperbarui" }); } });
    } else {
      createProker.mutate({ data }, { onSuccess: () => { invalidateAll(); setOpenAddProker(false); toast({ title: "Proker ditambahkan" }); } });
    }
  }

  function saveTx() {
    if (!txForm.amount || !txForm.description || selectedProker === null) return;
    create.mutate({
      data: { type: txForm.type, amount: Number(txForm.amount), description: txForm.description, category: "lainnya", date: txForm.date, notes: txForm.notes || undefined, fund: KasInputFund.proker, prokerId: selectedProker }
    }, { onSuccess: () => { invalidateAll(); setOpenAddTx(false); toast({ title: "Transaksi dicatat" }); } });
  }

  if (selectedProker !== null && selectedProkerData) {
    const pct = selectedProkerData.budget > 0 ? Math.min(100, Math.round((selectedProkerData.pengeluaran / selectedProkerData.budget) * 100)) : 0;
    const barColor = pct >= 100 ? "bg-rose-400" : pct >= 75 ? "bg-amber-400" : "bg-emerald-400";
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedProker(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          ← Kembali ke Daftar Proker
        </button>

        {/* Proker Header */}
        <div className="glass-card p-5 bg-gradient-to-br from-violet-50 to-sky-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{selectedProkerData.name}</h3>
              {selectedProkerData.notes && <p className="text-sm text-gray-500">{selectedProkerData.notes}</p>}
            </div>
            {isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => { setEditProkerId(selectedProker); setEditProkerForm({ name: selectedProkerData.name, budget: String(selectedProkerData.budget), notes: selectedProkerData.notes ?? "" }); setOpenEditProker(true); }}>
                <Pencil className="w-4 h-4 text-sky-500" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <p className="text-xs text-gray-500">Anggaran</p>
              <p className="font-bold text-violet-700 text-sm">{formatRp(selectedProkerData.budget)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Terpakai</p>
              <p className="font-bold text-rose-600 text-sm">{formatRp(selectedProkerData.pengeluaran)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Sisa</p>
              <p className={cn("font-bold text-sm", selectedProkerData.sisa >= 0 ? "text-emerald-700" : "text-rose-700")}>{formatRp(Math.abs(selectedProkerData.sisa))}</p>
            </div>
          </div>
          {selectedProkerData.budget > 0 && (
            <div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-700", barColor)} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{pct}% dari anggaran terpakai</p>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setTxForm({ amount: "", description: "", type: "pengeluaran", date: today(), notes: "" }); setOpenAddTx(true); }}
              className="bg-gradient-to-r from-violet-400 to-sky-400 text-white border-0 rounded-full gap-1">
              <Plus className="w-4 h-4" />Catat Pengeluaran
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setTxForm({ amount: "", description: "", type: "pemasukan", date: today(), notes: "" }); setOpenAddTx(true); }}
              className="rounded-full gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
              <ArrowUpCircle className="w-4 h-4" />Tambah Dana
            </Button>
          </div>
        )}

        {loadingKas ? <div className="animate-pulse space-y-2">{[1,2].map(i => <div key={i} className="glass-card h-14" />)}</div> : (
          <TxList items={prokerTxs} isAdmin={isAdmin}
            onDelete={id => del.mutate({ id }, { onSuccess: () => { invalidateAll(); toast({ title: "Transaksi dihapus" }); } })} />
        )}

        {/* Tx dialog */}
        <Dialog open={openAddTx} onOpenChange={v => !v && setOpenAddTx(false)}>
          <DialogContent className="glass-panel border-white/50 max-w-sm p-0 overflow-hidden">
            <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-violet-400/20 to-sky-400/20">
              <DialogHeader><DialogTitle>Transaksi Proker: {selectedProkerData.name}</DialogTitle></DialogHeader>
              <div className="flex gap-2 mt-3">
                {["pengeluaran", "pemasukan"].map(t => (
                  <button key={t} onClick={() => setTxForm(f => ({ ...f, type: t as KasInputType }))} className={cn(
                    "flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all",
                    txForm.type === t ? (t === "pengeluaran" ? "bg-rose-500 text-white border-rose-500" : "bg-emerald-500 text-white border-emerald-500") : "bg-white/60 text-gray-500 border-white/50"
                  )}>{t === "pengeluaran" ? "Pengeluaran" : "Tambah Dana"}</button>
                ))}
              </div>
            </div>
            <div className="px-6 pb-6 pt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Jumlah (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">Rp</span>
                  <Input type="number" min={0} value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} className="bg-white/60 pl-10 font-bold" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Keterangan</label>
                <Input value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))} className="bg-white/60" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tanggal</label>
                <Input type="date" value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))} className="bg-white/60" />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <Button variant="outline" onClick={() => setOpenAddTx(false)} className="rounded-full">Batal</Button>
                <Button onClick={saveTx} disabled={create.isPending || !txForm.amount || !txForm.description}
                  className={cn("rounded-full text-white border-0", txForm.type === "pengeluaran" ? "bg-gradient-to-r from-rose-400 to-pink-500" : "bg-gradient-to-r from-emerald-400 to-teal-500")}>Simpan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Proker dialog */}
        <Dialog open={openEditProker} onOpenChange={v => !v && setOpenEditProker(false)}>
          <DialogContent className="glass-panel border-white/50 max-w-sm p-0 overflow-hidden">
            <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-violet-400/20 to-sky-400/20">
              <DialogHeader><DialogTitle>Edit Proker</DialogTitle></DialogHeader>
            </div>
            <div className="px-6 pb-6 pt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Nama Proker</label>
                <Input value={editProkerForm.name} onChange={e => setEditProkerForm(f => ({ ...f, name: e.target.value }))} className="bg-white/60" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Anggaran (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">Rp</span>
                  <Input type="number" min={0} value={editProkerForm.budget} onChange={e => setEditProkerForm(f => ({ ...f, budget: e.target.value }))} className="bg-white/60 pl-10 font-bold" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
                <Input value={editProkerForm.notes} onChange={e => setEditProkerForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/60" />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <Button variant="outline" onClick={() => setOpenEditProker(false)} className="rounded-full">Batal</Button>
                <Button onClick={() => saveProker(true)} disabled={updateProker.isPending || !editProkerForm.name}
                  className="rounded-full text-white border-0 bg-gradient-to-r from-violet-400 to-sky-400">Simpan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Proker list view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">Anggaran per program kerja</p>
        {isAdmin && (
          <Button size="sm" onClick={() => { setEditProkerForm({ name: "", budget: "", notes: "" }); setOpenAddProker(true); }}
            className="bg-gradient-to-r from-violet-400 to-sky-400 text-white border-0 rounded-full gap-1">
            <Plus className="w-4 h-4" />Tambah Proker
          </Button>
        )}
      </div>

      {loadingProkers ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-20" />)}</div>
      ) : (prokers ?? []).length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          <Folder className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>Belum ada proker. Tambahkan proker pertama!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(prokers ?? []).map(p => {
            const pct = p.budget > 0 ? Math.min(100, Math.round((p.pengeluaran / p.budget) * 100)) : 0;
            const barColor = pct >= 100 ? "bg-rose-400" : pct >= 75 ? "bg-amber-400" : "bg-emerald-400";
            return (
              <div key={p.id} className="glass-card p-4 group hover:-translate-y-0.5 transition-all cursor-pointer" onClick={() => setSelectedProker(p.id)}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="text-rose-600">-{formatRp(p.pengeluaran)}</span>
                          <span>dari</span>
                          <span className="text-violet-600">{formatRp(p.budget)}</span>
                        </div>
                      </div>
                    </div>
                    {p.budget > 0 && (
                      <div className="ml-10 mt-2">
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-500", barColor)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Sisa</p>
                      <p className={cn("text-sm font-bold", p.sisa >= 0 ? "text-emerald-700" : "text-rose-700")}>{formatRp(Math.abs(p.sisa))}</p>
                    </div>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        onClick={e => { e.stopPropagation(); delProker.mutate({ id: p.id }, { onSuccess: () => { invalidateAll(); toast({ title: "Proker dihapus" }); } }); }}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </Button>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Proker dialog */}
      <Dialog open={openAddProker} onOpenChange={v => !v && setOpenAddProker(false)}>
        <DialogContent className="glass-panel border-white/50 max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-violet-400/20 to-sky-400/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Folder className="w-5 h-5 text-violet-500" />Tambah Proker Baru</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Nama Proker</label>
              <Input placeholder="Nama program kerja..." value={editProkerForm.name} onChange={e => setEditProkerForm(f => ({ ...f, name: e.target.value }))} className="bg-white/60" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Anggaran (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">Rp</span>
                <Input type="number" min={0} placeholder="0" value={editProkerForm.budget} onChange={e => setEditProkerForm(f => ({ ...f, budget: e.target.value }))} className="bg-white/60 pl-10 font-bold" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
              <Input placeholder="Catatan..." value={editProkerForm.notes} onChange={e => setEditProkerForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/60" />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpenAddProker(false)} className="rounded-full">Batal</Button>
              <Button onClick={() => saveProker(false)} disabled={createProker.isPending || !editProkerForm.name}
                className="rounded-full text-white border-0 bg-gradient-to-r from-violet-400 to-sky-400">Tambah</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function KasPage() {
  const { can } = useAuth();
  const isAdmin = can("kas");
  const { data: summary } = useGetKasSummary();

  const [tab, setTab] = useState<"umum" | "iuran_makan" | "darurat" | "proker">("umum");

  const tabs = [
    { id: "umum", label: "Kas Umum", emoji: "💰", color: "from-emerald-400 to-teal-400" },
    { id: "iuran_makan", label: "Iuran Makan", emoji: "🍽️", color: "from-orange-400 to-amber-400" },
    { id: "darurat", label: "Dana Darurat", emoji: "🛡️", color: "from-rose-400 to-pink-500" },
    { id: "proker", label: "Dana Proker", emoji: "📂", color: "from-violet-400 to-sky-400" },
  ] as const;

  const summaryCards = [
    { label: "Saldo Umum", value: summary?.saldoUmum ?? 0, icon: <Wallet className="w-4 h-4 text-sky-500" />, color: "text-sky-700" },
    { label: "Dana Darurat", value: summary?.saldoDarurat ?? 0, icon: <ShieldCheck className="w-4 h-4 text-rose-500" />, color: "text-rose-700" },
    { label: "Jatah Makan/Hari", value: summary?.dailyFoodAllowance ?? 0, icon: <Utensils className="w-4 h-4 text-amber-500" />, color: "text-amber-700" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">Kas Tim</h1>
        <p className="text-gray-500 text-sm mt-1">Pencatatan keuangan tim Putatsari Wellness</p>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {summaryCards.map(card => (
          <div key={card.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center shrink-0">{card.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className={cn("font-bold text-base", card.color)}>{formatRp(Math.abs(card.value))}{card.value < 0 ? " ⚠️" : ""}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab selector */}
      <div className="flex gap-1.5 p-1 bg-white/40 rounded-xl border border-white/40 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex-1 justify-center",
            tab === t.id ? `bg-gradient-to-r ${t.color} text-white shadow-sm` : "text-gray-500 hover:text-gray-700 hover:bg-white/40"
          )}>
            <span>{t.emoji}</span><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="glass-card p-5">
        {tab === "umum" && <UmumTab isAdmin={isAdmin} summary={summary} />}
        {tab === "iuran_makan" && <IuranMakanTab isAdmin={isAdmin} summary={summary} />}
        {tab === "darurat" && <DanadaruratTab isAdmin={isAdmin} summary={summary} />}
        {tab === "proker" && <DanaProkerTab isAdmin={isAdmin} />}
      </div>
    </div>
  );
}
