import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  type KasInputType,
  KasInputFund,
  type KasInputFund as KasFundType,
  useGetKas,
  useCreateKas,
  useUpdateKas,
  useDeleteKas,
  useDeleteKasTransfer,
  useUpdateKasConfig,
  useGetKasSummary,
  useTransferSisaMakan,
  useTransferKas,
  useGetProkerFunds,
  useCreateProkerFund,
  useUpdateProkerFund,
  useDeleteProkerFund,
  useGetMembers,
  useGetIuranPayments,
  useCreateIuranPayment,
  useDeleteIuranPayment,
  useGetIuranPaymentsSummary,
  getGetKasQueryKey,
  getGetKasConfigQueryKey,
  getGetKasSummaryQueryKey,
  getGetProkerFundsQueryKey,
  getGetIuranPaymentsQueryKey,
  getGetIuranPaymentsSummaryQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Pencil, Trash2, TrendingUp, TrendingDown, Wallet,
  ArrowUpCircle, ArrowDownCircle, ShieldCheck, Utensils,
  Folder, ChevronLeft, ChevronRight, ChevronDown, Settings, ArrowRightLeft, ArrowRight, Check, X, Undo2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getApiErrorDesc, extractApiFieldErrors, extractBalanceError } from "@/lib/api-error";

function today() { return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }); }
function formatRp(n: number) { return "Rp " + Math.abs(n).toLocaleString("id-ID"); }

function buildFormErrors(err: unknown): Record<string, string> {
  const fieldErrors = extractApiFieldErrors(err);
  const balance = extractBalanceError(err);
  if (balance) {
    fieldErrors.amount = `Saldo tidak cukup — tersedia ${formatRp(balance.available)}, diminta ${formatRp(balance.requested)}`;
  }
  return fieldErrors;
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}
function toWeekLabel(date: Date): string {
  const { year, week } = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}
function weekLabelToRange(label: string): string {
  const [yearStr, wStr] = label.split("-W");
  const year = Number(yearStr);
  const week = Number(wStr);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const startOfWeek = new Date(jan4.getTime() + (week - getISOWeek(jan4).week) * 7 * 86400000);
  const monday = new Date(startOfWeek.getTime() - ((startOfWeek.getUTCDay() || 7) - 1) * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  const fmt = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}
function shiftWeek(label: string, delta: number): string {
  const [yearStr, wStr] = label.split("-W");
  const year = Number(yearStr);
  const week = Number(wStr);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const startOfWeek = new Date(jan4.getTime() + (week - getISOWeek(jan4).week) * 7 * 86400000);
  const monday = new Date(startOfWeek.getTime() - ((startOfWeek.getUTCDay() || 7) - 1) * 86400000);
  const shifted = new Date(monday.getTime() + delta * 7 * 86400000);
  return toWeekLabel(shifted);
}

// KKN starts Monday 15 June 2026 → that is week 1
const KKN_START = new Date("2026-06-15T00:00:00Z");
const KKN_START_WEEK = toWeekLabel(KKN_START); // 2026-W25

function weekLabelToMonday(label: string): Date {
  const [yearStr, wStr] = label.split("-W");
  const year = Number(yearStr);
  const week = Number(wStr);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const startOfWeek = new Date(jan4.getTime() + (week - getISOWeek(jan4).week) * 7 * 86400000);
  const monday = new Date(startOfWeek.getTime() - ((startOfWeek.getUTCDay() || 7) - 1) * 86400000);
  return monday;
}

function toRelativeWeekNumber(label: string): number {
  const start = weekLabelToMonday(KKN_START_WEEK);
  const current = weekLabelToMonday(label);
  const diffMs = current.getTime() - start.getTime();
  return Math.round(diffMs / (7 * 86400000)) + 1;
}

type ItemRow = { name: string; amount: string };
type KasForm = {
  type: KasInputType;
  amount: string;
  description: string;
  date: string;
  notes: string;
  fund: KasFundType;
  prokerId: string;
  items: ItemRow[];
};

function defaultForm(fund: KasFundType = KasInputFund.umum): KasForm {
  return { type: "pemasukan", amount: "", description: "", date: today(), notes: "", fund, prokerId: "", items: [] };
}

function itemsTotal(items: ItemRow[]): number {
  return items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
}

// ─── ITEMS EDITOR ─────────────────────────────────────────────────────────────
function ItemsEditor({ items, onChange }: {
  items: ItemRow[];
  onChange: (items: ItemRow[]) => void;
}) {
  const total = itemsTotal(items);

  function addRow() { onChange([...items, { name: "", amount: "" }]); }
  function removeRow(i: number) { onChange(items.filter((_, idx) => idx !== i)); }
  function updateRow(i: number, field: keyof ItemRow, val: string) {
    onChange(items.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Rincian Belanja (opsional)</label>
        <button type="button" onClick={addRow} className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium">
          <Plus className="w-3 h-3" />Tambah Item
        </button>
      </div>
      {items.length > 0 && (
        <div className="space-y-1.5 rounded-xl border border-dashed border-gray-200 p-2.5 bg-white/90">
          {items.map((row, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <Input
                placeholder="Nama item (mis. Ayam)"
                value={row.name}
                onChange={e => updateRow(i, "name", e.target.value)}
                className="bg-white/90 text-xs h-8 flex-1"
              />
              <div className="relative flex-none w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">Rp</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={row.amount}
                  onChange={e => updateRow(i, "amount", e.target.value)}
                  className="bg-white/90 text-xs h-8 pl-7"
                />
              </div>
              <button type="button" onClick={() => removeRow(i)} className="text-rose-400 hover:text-rose-600 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {total > 0 && (
            <div className="text-xs text-right text-gray-500 pt-1 border-t border-dashed border-gray-200 mt-1">
              Total rincian: <span className="font-bold text-gray-700">{formatRp(total)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TRANSACTION LIST ─────────────────────────────────────────────────────────
function TxList({ items, isAdmin, onEdit, onDelete, onCancelTransfer }: {
  items: any[];
  isAdmin?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
  onCancelTransfer?: (transferId: number) => void;
}) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const toggle = (id: number) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

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
                const hasItems = Array.isArray(item.items) && item.items.length > 0;
                const isOpen = expanded[item.id];
                return (
                  <div key={item.id} className="glass-card p-3.5 group hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0", item.type === "pemasukan" ? "bg-emerald-100" : "bg-rose-100")}>
                        {item.type === "pemasukan" ? "💰" : "💸"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="font-semibold text-sm text-gray-900 truncate">{item.description}</p>
                          {hasItems && (
                            <Badge className="text-[10px] border shrink-0 px-1.5 py-0 bg-gray-50 text-gray-500 border-gray-200">
                              {item.items.length} item
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={cn("font-bold text-sm", item.type === "pemasukan" ? "text-emerald-600" : "text-rose-600")}>
                          {item.type === "pemasukan" ? "+" : "-"}{formatRp(item.amount)}
                        </span>
                        {hasItems && (
                          <button onClick={() => toggle(item.id)} className="text-gray-400 hover:text-gray-600 transition-colors ml-0.5">
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
                          </button>
                        )}
                        {(() => {
                          const isTransfer = item.transferId != null ||
                            /^(Transfer ke |Transfer dari |Sisa makan |Transfer sisa makan )/.test(item.description ?? "");
                          if (isAdmin && isTransfer && item.transferId && onCancelTransfer) {
                            return (
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5">
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" title="Batalkan transfer" onClick={() => { if (window.confirm("Batalkan transfer ini? Kedua catatan kas terkait akan dihapus.")) onCancelTransfer(item.transferId); }}><Undo2 className="w-3 h-3 text-rose-500" /></Button>
                              </div>
                            );
                          }
                          if (isAdmin && !isTransfer && (onEdit || onDelete)) {
                            return (
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5">
                                {onEdit && <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => onEdit(item)}><Pencil className="w-3 h-3 text-sky-500" /></Button>}
                                {onDelete && <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => onDelete(item.id)}><Trash2 className="w-3 h-3 text-rose-500" /></Button>}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    {item.notes && <p className="text-xs text-gray-400 mt-1.5 ml-12">{item.notes}</p>}
                    {hasItems && isOpen && (
                      <div className="mt-2 ml-12 space-y-0.5 border-l-2 border-gray-100 pl-2.5">
                        {item.items.map((it: any) => (
                          <div key={it.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">• {it.name}</span>
                            <span className="text-gray-500 font-medium">{formatRp(it.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
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

// ─── ADD/EDIT DIALOG ──────────────────────────────────────────────────────────
function AddEditDialog({
  open, onClose, editId, initial, onSave, isPending, serverFieldErrors = {},
}: {
  open: boolean; onClose: () => void; editId: number | null; initial: KasForm;
  onSave: (f: KasForm) => void; isPending: boolean; serverFieldErrors?: Record<string, string>;
}) {
  const [form, setForm] = useState<KasForm>(initial);
  const set = <K extends keyof KasForm>(k: K, v: KasForm[K]) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { setForm(initial); }, [open, editId, initial]);

  // When items change and have a valid total, auto-fill amount
  function handleItemsChange(items: ItemRow[]) {
    const total = itemsTotal(items);
    setForm(f => ({ ...f, items, ...(total > 0 ? { amount: String(total) } : {}) }));
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="form-dialog border-white/50 max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className={cn("px-6 pt-6 pb-4", form.type === "pemasukan" ? "bg-gradient-to-r from-emerald-400/20 to-teal-400/20" : "bg-gradient-to-r from-rose-400/20 to-pink-400/20")}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">{editId ? "Edit Transaksi" : "Catat Transaksi Baru"}</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            {["pemasukan", "pengeluaran"].map(t => (
              <button key={t} onClick={() => set("type", t as KasInputType)} className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
                form.type === t ? (t === "pemasukan" ? "bg-emerald-500 text-white border-emerald-500 shadow-md" : "bg-rose-500 text-white border-rose-500 shadow-md") : "bg-white text-amber-700 border-amber-200/50 hover:bg-white/80"
              )}>
                {t === "pemasukan" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {t === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 pb-6 pt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">Keterangan</label>
            <Input placeholder="Deskripsi transaksi..." value={form.description} onChange={e => set("description", e.target.value)} className="bg-white/90" />
            {serverFieldErrors.description && <p className="text-xs text-rose-500 mt-1">{serverFieldErrors.description}</p>}
          </div>
          {/* Items Editor */}
          <ItemsEditor items={form.items} onChange={handleItemsChange} />

          <div>
            <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">
              Jumlah Total (Rp)
              {form.items.length > 0 && itemsTotal(form.items) > 0 && (
                <span className="ml-1 normal-case font-normal text-gray-400">— auto dari rincian</span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-amber-600">Rp</span>
              <Input type="number" min={0} placeholder="0" value={form.amount} onChange={e => set("amount", e.target.value)} className="bg-white/90 pl-10 text-lg font-bold" />
            </div>
            {serverFieldErrors.amount && <p className="text-xs text-rose-500 mt-1">{serverFieldErrors.amount}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">Tanggal</label>
            <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="bg-white/90" />
          </div>
          <div>
            <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
            <Input placeholder="Catatan tambahan..." value={form.notes} onChange={e => set("notes", e.target.value)} className="bg-white/90" />
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

// Helper to build items payload from ItemRow[]
function toItemsPayload(items: ItemRow[]) {
  return items.filter(it => it.name && it.amount).map(it => ({ name: it.name, amount: Number(it.amount) }));
}

// ─── KAS UMUM TAB ─────────────────────────────────────────────────────────────
function UmumTab({ isAdmin, summary }: { isAdmin?: boolean; summary: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: kas, isLoading } = useGetKas({ fund: "umum" });
  const create = useCreateKas();
  const update = useUpdateKas();
  const del = useDeleteKas();
  const cancelTransfer = useDeleteKasTransfer();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [initForm, setInitForm] = useState<KasForm>(defaultForm(KasInputFund.umum));
  const [filterType, setFilterType] = useState("all");
  const [kasFieldErrors, setKasFieldErrors] = useState<Record<string, string>>({});
  const [openTransferDana, setOpenTransferDana] = useState(false);
  const [transferDanaInit, setTransferDanaInit] = useState<TransferDanaForm>({ fromFund: "umum", toFund: "darurat", toFundProkerId: null, amount: "", description: "", date: today(), notes: "" });
  const transferKas = useTransferKas();
  const { data: prokerList } = useGetProkerFunds();

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "umum" }) });
    qc.invalidateQueries({ queryKey: getGetKasSummaryQueryKey() });
  }

  function openAdd() { setEditId(null); setInitForm(defaultForm(KasInputFund.umum)); setKasFieldErrors({}); setOpen(true); }
  function openEdit(item: any) {
    setEditId(item.id);
    setInitForm({
      type: item.type, amount: String(item.amount), description: item.description,
      date: item.date, notes: item.notes ?? "",
      fund: KasInputFund.umum, prokerId: "",
      items: (item.items ?? []).map((it: any) => ({ name: it.name, amount: String(it.amount) })),
    });
    setKasFieldErrors({});
    setOpen(true);
  }
  function handleSave(form: KasForm) {
    const payload = {
      type: form.type, amount: Number(form.amount), description: form.description,
      date: form.date, notes: form.notes || undefined,
      fund: KasInputFund.umum,
      items: toItemsPayload(form.items),
    };
    if (editId !== null) {
      update.mutate({ id: editId, data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Transaksi diperbarui" }); },
        onError: (err) => { setKasFieldErrors(buildFormErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
    } else {
      create.mutate({ data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); setInitForm(defaultForm(KasInputFund.umum)); toast({ title: "Transaksi dicatat" }); },
        onError: (err) => { setKasFieldErrors(buildFormErrors(err)); toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }); },
      });
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
            <p className={cn("text-lg font-bold", saldo >= 0 ? "text-sky-700" : "text-amber-600")}>{formatRp(saldo)}{saldo < 0 && " (defisit)"}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 rounded-full gap-1">
              <Plus className="w-4 h-4" />Catat Transaksi
            </Button>
            <Button size="sm" onClick={() => setOpenTransferDana(true)} variant="outline" className="rounded-full gap-1 text-sky-700 border-sky-200 hover:bg-sky-50">
              <ArrowRightLeft className="w-4 h-4" />Transfer Dana
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {[{ id: "all", label: "Semua" }, { id: "pemasukan", label: "Pemasukan" }, { id: "pengeluaran", label: "Pengeluaran" }].map(f => (
          <button key={f.id} onClick={() => setFilterType(f.id)} className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
            filterType === f.id ? (f.id === "pemasukan" ? "bg-emerald-500 text-white border-transparent" : f.id === "pengeluaran" ? "bg-rose-500 text-white border-transparent" : "bg-gradient-to-r from-emerald-400 to-sky-400 text-white border-transparent") : "bg-white/90 text-gray-600 border-white/50 hover:bg-white/80"
          )}>{f.label}</button>
        ))}
      </div>

      {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-16" />)}</div> : (
        <TxList items={filtered} isAdmin={isAdmin} onEdit={openEdit}
          onDelete={id => del.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Transaksi dihapus" }); } })}
          onCancelTransfer={id => cancelTransfer.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Transfer dibatalkan" }); } })} />
      )}

      <AddEditDialog open={open} onClose={() => { setOpen(false); setKasFieldErrors({}); }} editId={editId} initial={initForm} onSave={handleSave} isPending={create.isPending || update.isPending} serverFieldErrors={kasFieldErrors} />

      <TransferDanaDialog open={openTransferDana} onClose={() => setOpenTransferDana(false)} isPending={transferKas.isPending}
        initial={transferDanaInit} prokers={prokerList ?? []}
        onSave={(form) => {
          transferKas.mutate({ data: { fromFund: form.fromFund, toFund: form.toFund, toFundProkerId: form.toFundProkerId ?? undefined, amount: Number(form.amount), description: form.description, date: form.date, notes: form.notes || undefined } }, {
            onSuccess: () => {
              qc.invalidateQueries({ queryKey: getGetProkerFundsQueryKey() });
              qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "proker" }) });
              invalidate(); setOpenTransferDana(false);
              toast({ title: `Transfer ${formatRp(Number(form.amount))} berhasil` });
            },
            onError: (err) => toast({ title: "Transfer gagal", description: getApiErrorDesc(err), variant: "destructive" }),
          });
        }} />
    </div>
  );
}

// ─── SIMPLE TX DIALOG (used in Makan, Darurat, Proker tabs) ──────────────────
type SimpleTxState = {
  amount: string; description: string; type: KasInputType;
  date: string; notes: string; items: ItemRow[];
};
function defaultSimpleTx(overrides?: Partial<SimpleTxState>): SimpleTxState {
  return { amount: "", description: "", type: "pengeluaran", date: today(), notes: "", items: [], ...overrides };
}

function SimpleTxDialog({ open, onClose, title, headerColor, isPending, onSave, state, setState, jatahHarian }: {
  open: boolean; onClose: () => void; title: string; headerColor: string;
  isPending: boolean; onSave: () => void;
  state: SimpleTxState; setState: (s: SimpleTxState) => void;
  jatahHarian?: number;
}) {
  const set = (patch: Partial<SimpleTxState>) => setState({ ...state, ...patch });

  function handleItemsChange(items: ItemRow[]) {
    const total = itemsTotal(items);
    setState({ ...state, items, ...(total > 0 ? { amount: String(total) } : {}) });
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="form-dialog border-white/50 max-w-sm p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className={cn("px-6 pt-6 pb-4", headerColor)}>
          <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
          <div className="flex gap-2 mt-3">
            {(["pengeluaran", "pemasukan"] as KasInputType[]).map(t => (
              <button key={t} onClick={() => set({ type: t })} className={cn(
                "flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all",
                state.type === t ? (t === "pengeluaran" ? "bg-rose-500 text-white border-rose-500" : "bg-emerald-500 text-white border-emerald-500") : "bg-white text-amber-700 border-amber-200/50"
              )}>{t === "pengeluaran" ? "Pengeluaran" : "Pemasukan"}</button>
            ))}
          </div>
        </div>
        <div className="px-6 pb-6 pt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">Keterangan</label>
            <Input value={state.description} onChange={e => set({ description: e.target.value })} className="bg-white/90" />
          </div>

          <ItemsEditor items={state.items} onChange={handleItemsChange} />

          <div>
            <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">
              Jumlah (Rp){state.items.length > 0 && itemsTotal(state.items) > 0 && <span className="ml-1 normal-case font-normal text-gray-400">— auto dari rincian</span>}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-amber-600">Rp</span>
              <Input type="number" min={0} value={state.amount} onChange={e => set({ amount: e.target.value })} className="bg-white/90 pl-10 font-bold" />
            </div>
            {state.type === "pengeluaran" && jatahHarian && jatahHarian > 0 && (
              <p className="text-xs text-amber-600 mt-1">Jatah hari ini: {formatRp(jatahHarian)}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">Tanggal</label>
            <Input type="date" value={state.date} onChange={e => set({ date: e.target.value })} className="bg-white/90" />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="outline" onClick={onClose} className="rounded-full">Batal</Button>
            <Button onClick={onSave} disabled={isPending || !state.amount || !state.description}
              className={cn("rounded-full text-white border-0", state.type === "pengeluaran" ? "bg-gradient-to-r from-rose-400 to-pink-500" : "bg-gradient-to-r from-emerald-400 to-teal-500")}>
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── TRANSFER DANA DIALOG ─────────────────────────────────────────────────────
type TransferDanaForm = {
  fromFund: KasFundType; toFund: KasFundType; toFundProkerId: number | null;
  amount: string; description: string; date: string; notes: string;
};
function TransferDanaDialog({ open, onClose, onSave, isPending, initial, prokers }: {
  open: boolean; onClose: () => void; onSave: (form: TransferDanaForm) => void; isPending: boolean;
  initial: TransferDanaForm; prokers?: { id: number; name: string }[];
}) {
  const [form, setForm] = useState<TransferDanaForm>(initial);
  useEffect(() => { setForm(initial); }, [initial, open]);
  const set = (patch: Partial<TransferDanaForm>) => setForm(f => ({ ...f, ...patch }));
  const fundOptions: { id: KasFundType; label: string }[] = [
    { id: "umum", label: "Kas Umum" },
    { id: "darurat", label: "Dana Darurat" },
    { id: "iuran_makan", label: "Iuran Makan" },
    { id: "proker", label: "Dana Proker" },
  ];
  const validTargets = fundOptions.filter(o => o.id !== form.fromFund);
  const isValid = !isPending && !!form.amount && !!form.description && !!form.fromFund && !!form.toFund && form.fromFund !== form.toFund
    && (form.toFund !== "proker" || !!form.toFundProkerId);
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="form-dialog border-white/50 max-w-sm p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-sky-400/20 to-blue-400/20">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowRightLeft className="w-5 h-5 text-sky-500" />Transfer Dana</DialogTitle></DialogHeader>
        </div>
        <div className="px-6 pb-6 pt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Dari</label>
            <Select value={form.fromFund} onValueChange={v => set({ fromFund: v as KasFundType })}>
              <SelectTrigger className="bg-white/90"><SelectValue /></SelectTrigger>
              <SelectContent>
                {fundOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Ke</label>
            <Select value={form.toFund} onValueChange={v => set({ toFund: v as KasFundType, toFundProkerId: null })}>
              <SelectTrigger className="bg-white/90"><SelectValue /></SelectTrigger>
              <SelectContent>
                {validTargets.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {form.toFund === "proker" && (
            <div>
              <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Proker Tujuan</label>
              <Select
                value={form.toFundProkerId !== null ? String(form.toFundProkerId) : ""}
                onValueChange={v => set({ toFundProkerId: Number(v) })}
              >
                <SelectTrigger className="bg-white/90"><SelectValue placeholder="Pilih proker..." /></SelectTrigger>
                <SelectContent>
                  {(prokers ?? []).map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {(prokers ?? []).length === 0 && (
                <p className="text-xs text-amber-600 mt-1">Belum ada proker. Tambahkan proker terlebih dahulu.</p>
              )}
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Nominal (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-sky-600">Rp</span>
              <Input type="number" min={0} value={form.amount} onChange={e => set({ amount: e.target.value })} className="bg-white/90 pl-10 font-bold" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Keterangan</label>
            <Input value={form.description} onChange={e => set({ description: e.target.value })} className="bg-white/90" placeholder="Contoh: Alokasi untuk proker" />
          </div>
          <div>
            <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Tanggal</label>
            <Input type="date" value={form.date} onChange={e => set({ date: e.target.value })} className="bg-white/90" />
          </div>
          <div>
            <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
            <Input value={form.notes} onChange={e => set({ notes: e.target.value })} className="bg-white/90" placeholder="Opsional" />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="outline" onClick={onClose} className="rounded-full">Batal</Button>
            <Button onClick={() => onSave(form)} disabled={!isValid}
              className="rounded-full text-white border-0 bg-gradient-to-r from-sky-400 to-blue-500">Transfer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── IURAN MAKAN TAB ──────────────────────────────────────────────────────────
function IuranMakanTab({ isAdmin, summary }: { isAdmin?: boolean; summary: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: kas, isLoading } = useGetKas({ fund: "iuran_makan" });
  const create = useCreateKas();
  const del = useDeleteKas();
  const cancelTransfer = useDeleteKasTransfer();
  const updateConfig = useUpdateKasConfig();
  const transferSisa = useTransferSisaMakan();

  const { data: prokers } = useGetProkerFunds();
  const { data: members } = useGetMembers();
  const [selectedWeek, setSelectedWeek] = useState(() => KKN_START_WEEK);
  const { data: weekPayments, isLoading: loadingWeekPayments } = useGetIuranPayments({ week: selectedWeek });
  const { data: memberSummary } = useGetIuranPaymentsSummary();
  const createPayment = useCreateIuranPayment();
  const deletePayment = useDeleteIuranPayment();

  const [openTx, setOpenTx] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [openTransferDana, setOpenTransferDana] = useState(false);
  const [transferDanaInit, setTransferDanaInit] = useState<TransferDanaForm>({ fromFund: "iuran_makan" as KasFundType, toFund: "darurat" as KasFundType, toFundProkerId: null, amount: "", description: "", date: today(), notes: "" });
  const [activeSubTab, setActiveSubTab] = useState<"rekap" | "transaksi">("rekap");
  const [txState, setTxState] = useState<SimpleTxState>(defaultSimpleTx({ description: "Belanja makan" }));
  const [configForm, setConfigForm] = useState({ weeklyAmount: String(summary?.weeklyFoodAmount ?? 0) });
  const [transferForm, setTransferForm] = useState({ date: today(), terpakai: "", target: "darurat" as "darurat" | "umum" });
  const transferKas = useTransferKas();

  const jatahHarian = summary?.dailyFoodAllowance ?? 0;
  const saldoMakan = summary?.saldoIuranMakan ?? 0;
  const weeklyFood = summary?.weeklyFoodAmount ?? 0;

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "iuran_makan" }) });
    qc.invalidateQueries({ queryKey: getGetKasSummaryQueryKey() });
    qc.invalidateQueries({ queryKey: getGetKasConfigQueryKey() });
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "darurat" }) });
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "umum" }) });
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "proker" }) });
  }
  function invalidatePayments() {
    qc.invalidateQueries({ queryKey: getGetIuranPaymentsQueryKey({ week: selectedWeek }) });
    qc.invalidateQueries({ queryKey: getGetIuranPaymentsSummaryQueryKey() });
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "iuran_makan" }) });
    qc.invalidateQueries({ queryKey: getGetKasSummaryQueryKey() });
  }

  function saveTx() {
    if (!txState.amount || !txState.description) return;
    create.mutate({
      data: { type: txState.type, amount: Number(txState.amount), description: txState.description, date: txState.date, notes: txState.notes || undefined, fund: KasInputFund.iuran_makan, items: toItemsPayload(txState.items) }
    }, {
      onSuccess: () => {
        invalidate(); setOpenTx(false);
        setTxState(defaultSimpleTx({ description: "Belanja makan" }));
        toast({ title: "Transaksi dicatat" });
      },
      onError: (err) => toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }),
    });
  }

  function saveConfig() {
    updateConfig.mutate({ data: { weeklyFoodAmount: Number(configForm.weeklyAmount) } }, {
      onSuccess: () => { invalidate(); setOpenConfig(false); setConfigForm({ weeklyAmount: "" }); toast({ title: "Iuran makan diperbarui" }); },
      onError: (err) => toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }),
    });
  }

  function doTransfer() {
    if (!transferForm.terpakai) return;
    transferSisa.mutate({ data: { date: transferForm.date, terpakai: Number(transferForm.terpakai), target: transferForm.target } }, {
      onSuccess: (res) => {
        invalidate(); setOpenTransfer(false);
        setTransferForm({ date: today(), terpakai: "", target: "darurat" });
        const targetLabel = transferForm.target === "darurat" ? "dana darurat" : "kas umum";
        toast({ title: `Sisa ${formatRp(res.sisa)} berhasil ditransfer ke ${targetLabel}` });
      },
      onError: (err) => { toast({ title: "Tidak ada sisa untuk ditransfer", description: getApiErrorDesc(err), variant: "destructive" }); },
    });
  }

  function togglePayment(memberName: string) {
    const existing = (weekPayments ?? []).find(p => p.memberName === memberName);
    if (existing) {
      deletePayment.mutate({ id: existing.id }, { onSuccess: () => { invalidatePayments(); toast({ title: `${memberName} ditandai belum bayar` }); } });
    } else {
      createPayment.mutate(
        { data: { memberName, weekLabel: selectedWeek, amount: weeklyFood } },
        { onSuccess: () => { invalidatePayments(); toast({ title: `${memberName} ditandai sudah bayar` }); },
          onError: (err) => { toast({ title: "Gagal mencatat pembayaran", description: getApiErrorDesc(err), variant: "destructive" }); } }
      );
    }
  }

  const memberNames = (members ?? []).map(m => m.name);
  const paidSet = new Set((weekPayments ?? []).map(p => p.memberName));
  const paidCount = paidSet.size;
  const totalCount = memberNames.length;
  const all = kas ?? [];
  const relativeWeekNum = toRelativeWeekNumber(selectedWeek);
  const isCurrentWeek = selectedWeek === toWeekLabel(new Date());
  const isBeforeWeek1 = relativeWeekNum < 1;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4 bg-gradient-to-br from-sky-50 to-sky-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Iuran Makan/Orang/Minggu</p>
              <p className="text-xl font-bold text-sky-700">{formatRp(weeklyFood)}</p>
            </div>
            {isAdmin && <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => { setConfigForm({ weeklyAmount: String(weeklyFood) }); setOpenConfig(true); }}><Settings className="w-3.5 h-3.5 text-gray-400" /></Button>}
          </div>
        </div>
        <div className="glass-card p-4 bg-gradient-to-br from-sky-50 to-sky-50">
          <p className="text-xs text-gray-500 mb-0.5">Jatah Makan Harian</p>
          <p className="text-xl font-bold text-sky-700">{formatRp(jatahHarian)}</p>
          <p className="text-[10px] text-gray-400">({formatRp(weeklyFood)} × 9 ÷ 7)</p>
        </div>
        <div className={cn("glass-card p-4", saldoMakan >= 0 ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-gradient-to-br from-rose-50 to-pink-50")}>
          <p className="text-xs text-gray-500 mb-0.5">Saldo Dana Makan</p>
          <p className={cn("text-xl font-bold", saldoMakan >= 0 ? "text-emerald-700" : "text-rose-700")}>{formatRp(saldoMakan)}</p>
          {saldoMakan < 0 && <p className="text-[10px] text-rose-500">Defisit</p>}
        </div>
      </div>

      {/* Sub-tab selector */}
      <div className="flex gap-1 p-1 bg-white/90 rounded-xl border border-white/40">
        {([
          { id: "rekap" as const, label: "Rekap Iuran Per Anggota" },
          { id: "transaksi" as const, label: "Riwayat Transaksi" },
        ]).map(t => (
          <button key={t.id} onClick={() => setActiveSubTab(t.id)} className={cn(
            "flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeSubTab === t.id ? "bg-gradient-to-r from-sky-400 to-blue-400 text-white shadow-sm" : "text-sky-700 hover:text-sky-900 hover:bg-white/90"
          )}>{t.label}</button>
        ))}
      </div>

      {activeSubTab === "rekap" && (
        <div className="space-y-4">
          {/* Week navigation */}
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setSelectedWeek(w => shiftWeek(w, -1))} disabled={isBeforeWeek1} className={cn("p-1.5 rounded-lg transition-colors", isBeforeWeek1 ? "text-gray-300" : "hover:bg-white/90 text-gray-500")}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center flex-1">
              <p className="text-sm font-bold text-gray-800">Minggu {Math.max(1, relativeWeekNum)}</p>
              <p className="text-xs text-gray-400">{weekLabelToRange(isBeforeWeek1 ? KKN_START_WEEK : selectedWeek)}</p>
              {isCurrentWeek && !isBeforeWeek1 && <Badge className="text-[10px] bg-sky-100 text-sky-700 border-sky-200 mt-0.5">Minggu Ini</Badge>}
              {isBeforeWeek1 && <Badge className="text-[10px] bg-sky-100 text-sky-700 border-sky-200 mt-0.5">Sebelum KKN dimulai</Badge>}
            </div>
            <button onClick={() => setSelectedWeek(w => shiftWeek(w, 1))} disabled={isCurrentWeek} className={cn("p-1.5 rounded-lg transition-colors", isCurrentWeek ? "text-gray-300" : "hover:bg-white/90 text-gray-500")}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="glass-card p-4 bg-gradient-to-br from-sky-50 to-sky-50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Status Pembayaran</p>
                <span className={cn("text-sm font-bold", paidCount === totalCount ? "text-emerald-600" : "text-sky-600")}>
                  {paidCount}/{totalCount} sudah bayar
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", paidCount === totalCount ? "bg-emerald-400" : "bg-sky-400")}
                  style={{ width: `${totalCount > 0 ? (paidCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              {weeklyFood > 0 && <p className="text-xs text-gray-400 mt-1.5">Total terkumpul: {formatRp(paidCount * weeklyFood)}</p>}
            </div>
          )}

          {/* Member payment table */}
          {loadingWeekPayments ? (
            <div className="animate-pulse space-y-2">{[1,2,3,4].map(i => <div key={i} className="glass-card h-12" />)}</div>
          ) : (
            <div className="space-y-2">
              {memberNames.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-6">Belum ada data anggota.</p>
              )}
              {memberNames.map(name => {
                const payment = (weekPayments ?? []).find(p => p.memberName === name);
                const paid = !!payment;
                return (
                  <div key={name} className={cn(
                    "glass-card px-4 py-3 flex items-center justify-between gap-3 transition-all",
                    paid ? "bg-emerald-50/70" : "bg-white/90"
                  )}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        paid ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                      )}>
                        {paid ? <Check className="w-4 h-4" /> : name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{name}</p>
                        {paid && payment && (
                          <p className="text-xs text-emerald-600">{formatRp(payment.amount)} {String.fromCharCode(0x00B7)} {new Date(payment.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn(
                        "text-[10px] border px-2 py-0.5 shrink-0",
                        paid ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"
                      )}>
                        {paid ? "Sudah Bayar" : "Belum Bayar"}
                      </Badge>
                      {isAdmin && (
                        <button
                          onClick={() => togglePayment(name)}
                          disabled={createPayment.isPending || deletePayment.isPending}
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center transition-all border",
                            paid
                              ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                              : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                          )}
                          title={paid ? "Batalkan pembayaran" : "Tandai sudah bayar"}
                        >
                          {paid ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {activeSubTab === "transaksi" && (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <>
                <Button size="sm" onClick={() => { setTxState(defaultSimpleTx({ type: "pengeluaran", description: "Belanja makan" })); setOpenTx(true); }}
                  className="bg-gradient-to-r from-sky-400 to-blue-400 text-white border-0 rounded-full gap-1">
                  <Plus className="w-4 h-4" />Catat Pengeluaran Makan
                </Button>
                <Button size="sm" onClick={() => { setTxState(defaultSimpleTx({ type: "pemasukan", description: "Iuran makan mingguan" })); setOpenTx(true); }}
                  variant="outline" className="rounded-full gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                  <ArrowUpCircle className="w-4 h-4" />Catat Pemasukan
                </Button>
                    <Button size="sm" onClick={() => { setTransferForm({ date: today(), terpakai: "", target: "darurat" }); setOpenTransfer(true); }}
                  variant="outline" className="rounded-full gap-1 text-sky-700 border-sky-200 hover:bg-sky-50">
                  <ArrowRightLeft className="w-4 h-4" />Transfer Sisa
                </Button>
                <Button size="sm" onClick={() => setOpenTransferDana(true)}
                  variant="outline" className="rounded-full gap-1 text-sky-700 border-sky-200 hover:bg-sky-50">
                  <ArrowRightLeft className="w-4 h-4" />Transfer Dana
                </Button>
              </>
            )}
          </div>

          {isLoading ? <div className="animate-pulse space-y-2">{[1,2].map(i => <div key={i} className="glass-card h-14" />)}</div> : (
            <TxList items={all} isAdmin={isAdmin}
              onDelete={id => del.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Transaksi dihapus" }); } })}
              onCancelTransfer={id => cancelTransfer.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Transfer dibatalkan" }); } })} />
          )}
        </div>
      )}

      <SimpleTxDialog open={openTx} onClose={() => setOpenTx(false)} title="Catat Transaksi Makan"
        headerColor="bg-gradient-to-r from-sky-400/20 to-blue-400/20"
        isPending={create.isPending} onSave={saveTx} state={txState} setState={setTxState} jatahHarian={jatahHarian} />

      <Dialog open={openConfig} onOpenChange={v => !v && setOpenConfig(false)}>
        <DialogContent className="form-dialog border-white/50 max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-sky-400/20 to-blue-400/20">
            <DialogHeader><DialogTitle>Atur Iuran Makan</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Iuran Mingguan Per Orang (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-sky-600">Rp</span>
                <Input type="number" min={0} value={configForm.weeklyAmount} onChange={e => setConfigForm({ weeklyAmount: e.target.value })} className="bg-white/90 pl-10 font-bold text-lg" />
              </div>
              {Number(configForm.weeklyAmount) > 0 && (
                <p className="text-xs text-sky-600 mt-1">Jatah harian: {formatRp(Math.floor(Number(configForm.weeklyAmount) * 9 / 7))} (× 9 anggota ÷ 7 hari)</p>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpenConfig(false)} className="rounded-full">Batal</Button>
              <Button onClick={saveConfig} disabled={updateConfig.isPending} className="rounded-full text-white border-0 bg-gradient-to-r from-sky-400 to-blue-400">Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openTransfer} onOpenChange={v => !v && setOpenTransfer(false)}>
        <DialogContent className="form-dialog border-white/50 max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-sky-400/20 to-blue-400/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowRightLeft className="w-5 h-5 text-sky-500" />Transfer Sisa ke Dana Darurat</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-3">
            <div className="glass-card p-3 bg-sky-50/60 rounded-xl">
              <p className="text-xs text-gray-500">Jatah harian: <span className="font-bold text-sky-700">{formatRp(jatahHarian)}</span></p>
              <p className="text-xs text-gray-400 mt-0.5">Sisa = Jatah - Terpakai akan dipindah ke dana darurat</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Tanggal</label>
              <Input type="date" value={transferForm.date} onChange={e => setTransferForm(f => ({ ...f, date: e.target.value }))} className="bg-white/90" />
            </div>
            <div>
              <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Pengeluaran Makan Hari Ini (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-sky-600">Rp</span>
                <Input type="number" min={0} value={transferForm.terpakai} onChange={e => setTransferForm(f => ({ ...f, terpakai: e.target.value }))} className="bg-white/90 pl-10 font-bold" />
              </div>
              {transferForm.terpakai && jatahHarian > 0 && (
                <p className={cn("text-xs mt-1", jatahHarian - Number(transferForm.terpakai) > 0 ? "text-emerald-600" : "text-rose-500")}>
                  Sisa: {formatRp(Math.max(0, jatahHarian - Number(transferForm.terpakai)))}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Transfer ke</label>
              <Select value={transferForm.target} onValueChange={v => setTransferForm(f => ({ ...f, target: v as "darurat" | "umum" }))}>
                <SelectTrigger className="bg-white/90"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="darurat">Dana Darurat</SelectItem>
                  <SelectItem value="umum">Kas Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpenTransfer(false)} className="rounded-full">Batal</Button>
              <Button onClick={doTransfer} disabled={transferSisa.isPending || !transferForm.terpakai || (jatahHarian > 0 && Number(transferForm.terpakai) >= jatahHarian)}
                className="rounded-full text-white border-0 bg-gradient-to-r from-sky-400 to-blue-500">Transfer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TransferDanaDialog open={openTransferDana} onClose={() => setOpenTransferDana(false)} isPending={transferKas.isPending}
        initial={transferDanaInit} prokers={prokers ?? []}
        onSave={(form) => {
          transferKas.mutate({ data: { fromFund: form.fromFund, toFund: form.toFund, toFundProkerId: form.toFundProkerId ?? undefined, amount: Number(form.amount), description: form.description, date: form.date, notes: form.notes || undefined } }, {
            onSuccess: () => {
              qc.invalidateQueries({ queryKey: getGetProkerFundsQueryKey() });
              qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "proker" }) });
              invalidate(); setOpenTransferDana(false);
              toast({ title: `Transfer ${formatRp(Number(form.amount))} berhasil` });
            },
            onError: (err) => toast({ title: "Transfer gagal", description: getApiErrorDesc(err), variant: "destructive" }),
          });
        }} />
    </div>
  );
}

// ─── DANA DARURAT TAB ─────────────────────────────────────────────────────────
function DanadaruratTab({ isAdmin, summary }: { isAdmin?: boolean; summary: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: kas, isLoading } = useGetKas({ fund: "darurat" });
  const create = useCreateKas();
  const del = useDeleteKas();
  const cancelTransfer = useDeleteKasTransfer();
  const updateConfig = useUpdateKasConfig();
  const transferKas = useTransferKas();

  const [openTx, setOpenTx] = useState(false);
  const [openTarget, setOpenTarget] = useState(false);
  const [openTransferDana, setOpenTransferDana] = useState(false);
  const [txState, setTxState] = useState<SimpleTxState>(defaultSimpleTx({ type: "pemasukan" }));
  const [targetForm, setTargetForm] = useState({ target: "" });

  const saldo = summary?.saldoDarurat ?? 0;
  const target = summary?.emergencyFundTarget ?? 0;
  const status = summary?.emergencyFundStatus ?? "kurang";
  const pct = target > 0 ? Math.min(100, Math.round((saldo / target) * 100)) : (saldo > 0 ? 100 : 0);

  const statusMap: Record<string, { label: string; color: string; bgColor: string; barColor: string }> = {
    kurang: { label: "Perlu Penambahan", color: "text-rose-600", bgColor: "bg-rose-100 border-rose-200", barColor: "bg-rose-400" },
    cukup: { label: "Cukup", color: "text-sky-600", bgColor: "bg-sky-100 border-sky-200", barColor: "bg-sky-400" },
    sangat_cukup: { label: "Sangat Cukup ✓", color: "text-emerald-600", bgColor: "bg-emerald-100 border-emerald-200", barColor: "bg-emerald-400" },
  };
  const statusInfo = statusMap[status] ?? statusMap.kurang;

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "darurat" }) });
    qc.invalidateQueries({ queryKey: getGetKasSummaryQueryKey() });
    qc.invalidateQueries({ queryKey: getGetKasConfigQueryKey() });
  }

  function saveTx() {
    if (!txState.amount || !txState.description) return;
    create.mutate({
      data: { type: txState.type, amount: Number(txState.amount), description: txState.description, date: txState.date, notes: txState.notes || undefined, fund: KasInputFund.darurat, items: toItemsPayload(txState.items) }
    }, {
      onSuccess: () => {
        invalidate(); setOpenTx(false);
        setTxState(defaultSimpleTx({ type: "pemasukan" }));
        toast({ title: "Transaksi dicatat" });
      },
      onError: (err) => toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }),
    });
  }

  function saveTarget() {
    updateConfig.mutate({ data: { emergencyFundTarget: Number(targetForm.target) } }, {
      onSuccess: () => { invalidate(); setOpenTarget(false); setTargetForm({ target: "" }); toast({ title: "Target dana darurat diperbarui" }); },
      onError: (err) => toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-5">
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
              <span>{pct}% tercapai</span><span>{formatRp(target)}</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-700", statusInfo.barColor)} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => { setTxState(defaultSimpleTx({ type: "pemasukan" })); setOpenTx(true); }}
            className="bg-gradient-to-r from-rose-400 to-pink-500 text-white border-0 rounded-full gap-1">
            <Plus className="w-4 h-4" />Tambah Dana Darurat
          </Button>
          <Button size="sm" onClick={() => { setTxState(defaultSimpleTx({ type: "pengeluaran" })); setOpenTx(true); }}
            variant="outline" className="rounded-full gap-1 text-rose-700 border-rose-200 hover:bg-rose-50">
            <ArrowDownCircle className="w-4 h-4" />Catat Pengeluaran Darurat
          </Button>
          {saldo > 0 && (
            <Button size="sm" variant="outline" onClick={() => setOpenTransferDana(true)}
              className="rounded-full gap-1 text-sky-700 border-sky-200 hover:bg-sky-50">
              <ArrowRight className="w-4 h-4" />Transfer ke Umum
            </Button>
          )}
        </div>
      )}

      {isLoading ? <div className="animate-pulse space-y-2">{[1,2].map(i => <div key={i} className="glass-card h-14" />)}</div> : (
        <TxList items={kas ?? []} isAdmin={isAdmin}
          onDelete={id => del.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Transaksi dihapus" }); } })}
          onCancelTransfer={id => cancelTransfer.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Transfer dibatalkan" }); } })} />
      )}

      <SimpleTxDialog open={openTx} onClose={() => setOpenTx(false)} title="Transaksi Dana Darurat"
        headerColor={cn(txState.type === "pemasukan" ? "bg-gradient-to-r from-rose-400/20 to-pink-400/20" : "bg-gradient-to-r from-rose-600/20 to-pink-600/20")}
        isPending={create.isPending} onSave={saveTx} state={txState} setState={setTxState} />

      <Dialog open={openTarget} onOpenChange={v => !v && setOpenTarget(false)}>
        <DialogContent className="form-dialog border-white/50 max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-rose-400/20 to-pink-400/20">
            <DialogHeader><DialogTitle>Set Target Dana Darurat</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5 block">Target Dana Darurat (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-amber-600">Rp</span>
                <Input type="number" min={0} value={targetForm.target} onChange={e => setTargetForm({ target: e.target.value })} className="bg-white/90 pl-10 font-bold text-lg" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpenTarget(false)} className="rounded-full">Batal</Button>
              <Button onClick={saveTarget} disabled={updateConfig.isPending} className="rounded-full text-white border-0 bg-gradient-to-r from-rose-400 to-pink-500">Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TransferDanaDialog open={openTransferDana} onClose={() => setOpenTransferDana(false)} isPending={transferKas.isPending}
        initial={{ fromFund: "darurat", toFund: "umum", toFundProkerId: null, amount: "", description: "Transfer Dana Darurat → Umum", date: today(), notes: "" }}
        onSave={(form) => {
          transferKas.mutate({ data: { fromFund: form.fromFund, toFund: form.toFund, toFundProkerId: form.toFundProkerId ?? undefined, amount: Number(form.amount), description: form.description, date: form.date, notes: form.notes || undefined } }, {
            onSuccess: () => {
              qc.invalidateQueries({ queryKey: getGetProkerFundsQueryKey() });
              qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "proker" }) });
              invalidate(); setOpenTransferDana(false);
              toast({ title: `Transfer ${formatRp(Number(form.amount))} berhasil` });
            },
            onError: (err) => toast({ title: "Transfer gagal", description: getApiErrorDesc(err), variant: "destructive" }),
          });
        }} />
    </div>
  );
}

// ─── DANA PROKER TAB ──────────────────────────────────────────────────────────
function DanaProkerTab({ isAdmin }: { isAdmin?: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: prokers, isLoading: loadingProkers } = useGetProkerFunds();
  const createProker = useCreateProkerFund();
  const updateProker = useUpdateProkerFund();
  const delProker = useDeleteProkerFund();
  const create = useCreateKas();
  const del = useDeleteKas();
  const cancelTransfer = useDeleteKasTransfer();
  const transferKas = useTransferKas();

  const [selectedProker, setSelectedProker] = useState<number | null>(null);
  const { data: prokerKas, isLoading: loadingKas } = useGetKas(
    selectedProker !== null ? { fund: "proker" } : undefined
  );

  const [openAddProker, setOpenAddProker] = useState(false);
  const [openEditProker, setOpenEditProker] = useState(false);
  const [openAddTx, setOpenAddTx] = useState(false);
  const [openTransferDana, setOpenTransferDana] = useState(false);
  const [editProkerForm, setEditProkerForm] = useState({ name: "", budget: "", notes: "" });
  const [editProkerId, setEditProkerId] = useState<number | null>(null);
  const [txState, setTxState] = useState<SimpleTxState>(defaultSimpleTx({ type: "pengeluaran" }));

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: getGetProkerFundsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetKasQueryKey({ fund: "proker" }) });
    qc.invalidateQueries({ queryKey: getGetKasSummaryQueryKey() });
  }

  const selectedProkerData = prokers?.find(p => p.id === selectedProker);
  const prokerTxs = prokerKas?.filter((k: any) => k.prokerId === selectedProker) ?? [];
  const transferMasukTxs = prokerTxs.filter((k: any) => k.type === "pemasukan" && k.transferId != null);
  const regularProkerTxs = prokerTxs.filter((k: any) => !(k.type === "pemasukan" && k.transferId != null));

  function saveProker(isEdit: boolean) {
    const data = { name: editProkerForm.name, budget: Number(editProkerForm.budget), notes: editProkerForm.notes || undefined };
    if (isEdit && editProkerId !== null) {
      updateProker.mutate({ id: editProkerId, data }, {
        onSuccess: () => { invalidateAll(); setOpenEditProker(false); setEditProkerForm({ name: "", budget: "", notes: "" }); toast({ title: "Proker diperbarui" }); },
        onError: (err) => toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }),
      });
    } else {
      createProker.mutate({ data }, {
        onSuccess: () => { invalidateAll(); setOpenAddProker(false); setEditProkerForm({ name: "", budget: "", notes: "" }); toast({ title: "Proker ditambahkan" }); },
        onError: (err) => toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }),
      });
    }
  }

  function saveTx() {
    if (!txState.amount || !txState.description || selectedProker === null) return;
    create.mutate({
      data: { type: txState.type, amount: Number(txState.amount), description: txState.description, date: txState.date, notes: txState.notes || undefined, fund: KasInputFund.proker, prokerId: selectedProker, items: toItemsPayload(txState.items) }
    }, {
      onSuccess: () => {
        invalidateAll(); setOpenAddTx(false);
        setTxState(defaultSimpleTx({ type: "pengeluaran" }));
        toast({ title: "Transaksi dicatat" });
      },
      onError: (err) => toast({ title: "Gagal menyimpan", description: getApiErrorDesc(err), variant: "destructive" }),
    });
  }

  if (selectedProker !== null && selectedProkerData) {
    const pct = selectedProkerData.budget > 0 ? Math.min(100, Math.round((selectedProkerData.pengeluaran / selectedProkerData.budget) * 100)) : 0;
    const barColor = pct >= 100 ? "bg-rose-400" : pct >= 75 ? "bg-sky-400" : "bg-emerald-400";
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedProker(null)} className="flex items-center gap-1 text-sm text-sky-700 hover:text-sky-900">
          ← Kembali ke Daftar Proker
        </button>
        <div className="glass-card p-5 bg-gradient-to-br from-sky-50 to-teal-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{selectedProkerData.name}</h3>
              {selectedProkerData.notes && <p className="text-sm text-gray-500">{selectedProkerData.notes}</p>}
            </div>
            {isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => {
                setEditProkerId(selectedProker);
                setEditProkerForm({ name: selectedProkerData.name, budget: String(selectedProkerData.budget), notes: selectedProkerData.notes ?? "" });
                setOpenEditProker(true);
              }}>
                <Pencil className="w-4 h-4 text-sky-500" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: "Anggaran", value: selectedProkerData.budget, color: "text-sky-700" },
              { label: "Terpakai", value: selectedProkerData.pengeluaran, color: "text-rose-600" },
              { label: "Sisa Anggaran", value: selectedProkerData.budget - selectedProkerData.pengeluaran, color: (selectedProkerData.budget - selectedProkerData.pengeluaran) >= 0 ? "text-emerald-700" : "text-rose-700" },
            ].map(c => (
              <div key={c.label} className="text-center">
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className={cn("font-bold text-sm", c.color)}>{formatRp(c.value)}</p>
              </div>
            ))}
          </div>
          <div className={cn("flex items-center justify-between rounded-xl px-4 py-2.5 mb-3", selectedProkerData.sisa >= 0 ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200")}>
            <div className="flex items-center gap-2">
              <Wallet className={cn("w-4 h-4", selectedProkerData.sisa >= 0 ? "text-emerald-600" : "text-rose-600")} />
              <span className="text-xs font-semibold text-gray-600">Saldo Tersedia</span>
            </div>
            <span className={cn("text-base font-bold", selectedProkerData.sisa >= 0 ? "text-emerald-700" : "text-rose-700")}>
              {formatRp(selectedProkerData.sisa)}{selectedProkerData.sisa < 0 ? " (defisit)" : ""}
            </span>
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
            <Button size="sm" onClick={() => { setTxState(defaultSimpleTx({ type: "pengeluaran" })); setOpenAddTx(true); }}
              className="bg-gradient-to-r from-sky-400 to-teal-400 text-white border-0 rounded-full gap-1">
              <Plus className="w-4 h-4" />Catat Pengeluaran
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setTxState(defaultSimpleTx({ type: "pemasukan" })); setOpenAddTx(true); }}
              className="rounded-full gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
              <ArrowUpCircle className="w-4 h-4" />Tambah Dana
            </Button>
            {selectedProkerData.sisa > 0 && (
              <Button size="sm" variant="outline" onClick={() => setOpenTransferDana(true)}
                className="rounded-full gap-1 text-sky-700 border-sky-200 hover:bg-sky-50">
                <ArrowRight className="w-4 h-4" />Kembalikan ke Umum
              </Button>
            )}
          </div>
        )}

        {loadingKas ? <div className="animate-pulse space-y-2">{[1,2].map(i => <div key={i} className="glass-card h-14" />)}</div> : (
          <div className="space-y-5">
            {transferMasukTxs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-gray-700 text-sm">Dana Masuk</h4>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                    {formatRp(transferMasukTxs.reduce((s: number, k: any) => s + k.amount, 0))}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {[...transferMasukTxs].sort((a: any, b: any) => b.date.localeCompare(a.date)).map((item: any) => (
                    <div key={item.id} className="glass-card p-3.5 group hover:-translate-y-0.5 transition-all border-l-4 border-emerald-300">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 bg-emerald-100">
                          <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{item.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-bold text-sm text-emerald-600">+{formatRp(item.amount)}</span>
                          {isAdmin && (
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5">
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" title="Batalkan transfer"
                                onClick={() => { if (window.confirm("Batalkan transfer ini? Kedua catatan kas terkait akan dihapus.")) cancelTransfer.mutate({ id: item.transferId }, { onSuccess: () => { invalidateAll(); toast({ title: "Transfer dibatalkan" }); } }); }}>
                                <Undo2 className="w-3 h-3 text-rose-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {regularProkerTxs.length > 0 && (
              <div>
                {transferMasukTxs.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-700 text-sm">Transaksi</h4>
                  </div>
                )}
                <TxList items={regularProkerTxs} isAdmin={isAdmin}
                  onDelete={id => del.mutate({ id }, { onSuccess: () => { invalidateAll(); toast({ title: "Transaksi dihapus" }); } })}
                  onCancelTransfer={id => cancelTransfer.mutate({ id }, { onSuccess: () => { invalidateAll(); toast({ title: "Transfer dibatalkan" }); } })} />
              </div>
            )}
            {transferMasukTxs.length === 0 && regularProkerTxs.length === 0 && (
              <div className="flex flex-col items-center py-10 gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-2xl">💰</div>
                <p className="text-gray-400 text-sm">Belum ada transaksi.</p>
              </div>
            )}
          </div>
        )}

        <SimpleTxDialog open={openAddTx} onClose={() => setOpenAddTx(false)}
          title={`Transaksi: ${selectedProkerData.name}`}
          headerColor="bg-gradient-to-r from-sky-400/20 to-teal-400/20"
          isPending={create.isPending} onSave={saveTx} state={txState} setState={setTxState} />

        <Dialog open={openEditProker} onOpenChange={v => !v && setOpenEditProker(false)}>
          <DialogContent className="form-dialog border-white/50 max-w-sm p-0 overflow-hidden">
            <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-sky-400/20 to-teal-400/20">
              <DialogHeader><DialogTitle>Edit Proker</DialogTitle></DialogHeader>
            </div>
            <div className="px-6 pb-6 pt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Nama Proker</label>
                <Input value={editProkerForm.name} onChange={e => setEditProkerForm(f => ({ ...f, name: e.target.value }))} className="bg-white/90" />
              </div>
              <div>
                <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Anggaran (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-sky-600">Rp</span>
                  <Input type="number" min={0} value={editProkerForm.budget} onChange={e => setEditProkerForm(f => ({ ...f, budget: e.target.value }))} className="bg-white/90 pl-10 font-bold" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
                <Input value={editProkerForm.notes} onChange={e => setEditProkerForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/90" />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <Button variant="outline" onClick={() => setOpenEditProker(false)} className="rounded-full">Batal</Button>
                <Button onClick={() => saveProker(true)} disabled={updateProker.isPending || !editProkerForm.name}
                  className="rounded-full text-white border-0 bg-gradient-to-r from-sky-400 to-teal-400">Simpan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <TransferDanaDialog open={openTransferDana} onClose={() => setOpenTransferDana(false)} isPending={transferKas.isPending}
          initial={{ fromFund: "proker", toFund: "umum", toFundProkerId: null, amount: "", description: `Kembalikan Sisa Proker: ${selectedProkerData.name}`, date: today(), notes: "" }}
          onSave={(form) => {
            transferKas.mutate({ data: { fromFund: form.fromFund, toFund: form.toFund, toFundProkerId: form.toFundProkerId ?? undefined, amount: Number(form.amount), description: form.description, date: form.date, notes: form.notes || undefined } }, {
              onSuccess: () => {
                invalidateAll(); setOpenTransferDana(false);
                toast({ title: `Transfer ${formatRp(Number(form.amount))} berhasil` });
              },
              onError: (err) => toast({ title: "Transfer gagal", description: getApiErrorDesc(err), variant: "destructive" }),
            });
          }} />
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
            className="bg-gradient-to-r from-sky-400 to-teal-400 text-white border-0 rounded-full gap-1">
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
            const barColor = pct >= 100 ? "bg-rose-400" : pct >= 75 ? "bg-sky-400" : "bg-emerald-400";
            return (
              <div key={p.id} className="glass-card p-4 group hover:-translate-y-0.5 transition-all cursor-pointer" onClick={() => setSelectedProker(p.id)}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="text-rose-600">-{formatRp(p.pengeluaran)}</span>
                          <span>dari</span>
                          <span className="text-sky-600">{formatRp(p.budget)}</span>
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
                      <p className={cn("text-sm font-bold", p.sisa >= 0 ? "text-emerald-700" : "text-rose-700")}>{formatRp(p.sisa)}</p>
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

      <Dialog open={openAddProker} onOpenChange={v => !v && setOpenAddProker(false)}>
        <DialogContent className="form-dialog border-white/50 max-w-sm p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-sky-400/20 to-teal-400/20">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Folder className="w-5 h-5 text-sky-500" />Tambah Proker Baru</DialogTitle></DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Nama Proker</label>
              <Input placeholder="Nama program kerja..." value={editProkerForm.name} onChange={e => setEditProkerForm(f => ({ ...f, name: e.target.value }))} className="bg-white/90" />
            </div>
            <div>
              <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Anggaran (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-sky-600">Rp</span>
                <Input type="number" min={0} placeholder="0" value={editProkerForm.budget} onChange={e => setEditProkerForm(f => ({ ...f, budget: e.target.value }))} className="bg-white/90 pl-10 font-bold" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1.5 block">Catatan (opsional)</label>
              <Input placeholder="Catatan..." value={editProkerForm.notes} onChange={e => setEditProkerForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/90" />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setOpenAddProker(false)} className="rounded-full">Batal</Button>
              <Button onClick={() => saveProker(false)} disabled={createProker.isPending || !editProkerForm.name}
                className="rounded-full text-white border-0 bg-gradient-to-r from-sky-400 to-teal-400">Tambah</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function KasPage() {
  const { can } = useAuth();
  const isAdmin = can("kas");
  const { data: summary } = useGetKasSummary();
  const [tab, setTab] = useState<"umum" | "iuran_makan" | "darurat" | "proker">("iuran_makan");

  const tabs = [
    { id: "umum", label: "Kas Umum", emoji: "💰", color: "from-emerald-400 to-teal-400", inactiveColor: "text-emerald-700 hover:text-emerald-900 hover:bg-white/90" },
    { id: "iuran_makan", label: "Iuran Makan", emoji: "🍽️", color: "from-sky-400 to-blue-400", inactiveColor: "text-sky-700 hover:text-sky-900 hover:bg-white/90" },
    { id: "darurat", label: "Dana Darurat", emoji: "🛡️", color: "from-rose-400 to-pink-500", inactiveColor: "text-rose-700 hover:text-rose-900 hover:bg-white/90" },
    { id: "proker", label: "Dana Proker", emoji: "📂", color: "from-emerald-400 to-teal-500", inactiveColor: "text-emerald-700 hover:text-emerald-900 hover:bg-white/90" },
  ] as const;

  const summaryCards = [
    { label: "Saldo Umum", value: summary?.saldoUmum ?? 0, icon: <Wallet className="w-4 h-4 text-sky-500" />, color: "text-sky-700" },
    { label: "Dana Darurat", value: summary?.saldoDarurat ?? 0, icon: <ShieldCheck className="w-4 h-4 text-rose-500" />, color: "text-rose-700" },
    { label: "Jatah Makan/Hari", value: summary?.dailyFoodAllowance ?? 0, icon: <Utensils className="w-4 h-4 text-sky-500" />, color: "text-sky-700" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">Kas Tim</h1>
        <p className="text-gray-500 text-sm mt-1">Pencatatan keuangan tim Putatsari Wellness</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {summaryCards.map(card => (
          <div key={card.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center shrink-0">{card.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className={cn("font-bold text-base", card.color)}>{formatRp(card.value)}{card.value < 0 ? " ⚠️" : ""}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 p-1 bg-white/90 rounded-xl border border-white/40 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex-1 justify-center",
            tab === t.id ? `bg-gradient-to-r ${t.color} text-white shadow-sm` : t.inactiveColor
          )}>
            <span>{t.emoji}</span><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="glass-card p-5">
        {tab === "umum" && <UmumTab isAdmin={isAdmin} summary={summary} />}
        {tab === "iuran_makan" && <IuranMakanTab isAdmin={isAdmin} summary={summary} />}
        {tab === "darurat" && <DanadaruratTab isAdmin={isAdmin} summary={summary} />}
        {tab === "proker" && <DanaProkerTab isAdmin={isAdmin} />}
      </div>
    </div>
  );
}
