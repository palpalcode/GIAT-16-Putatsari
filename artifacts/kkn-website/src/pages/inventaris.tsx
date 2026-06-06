import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetInventory,
  useGetAuthMe,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  getGetInventoryQueryKey,
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
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const categories = [
  { id: "p3k", label: "P3K", color: "bg-rose-100 text-rose-700 border-rose-200" },
  { id: "obat", label: "Obat", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "alkes", label: "Alkes", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { id: "umum", label: "Umum", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

function getCatColor(cat: string) {
  return categories.find(c => c.id === cat)?.color ?? "bg-gray-100 text-gray-700 border-gray-200";
}

function getCatLabel(cat: string) {
  return categories.find(c => c.id === cat)?.label ?? cat;
}

export default function InventarisPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: auth } = useGetAuthMe();
  const { data: inventory, isLoading } = useGetInventory();
  const create = useCreateInventoryItem();
  const update = useUpdateInventoryItem();
  const del = useDeleteInventoryItem();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", category: "umum", quantity: 1, unit: "", notes: "" });
  const [filterCat, setFilterCat] = useState("all");

  const isAdmin = auth?.isAdmin;

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

  const grouped = categories.reduce((acc, cat) => {
    const items = filtered.filter(i => i.category === cat.id);
    if (items.length > 0) acc[cat.id] = items;
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
            Inventaris
          </h1>
          <p className="text-gray-500 text-sm mt-1">Daftar barang, obat, dan perlengkapan posko</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd} className="bg-gradient-to-r from-rose-400 to-sky-400 hover:from-rose-500 hover:to-sky-500 text-white border-0 rounded-full gap-2">
            <Plus className="w-4 h-4" />Tambah Barang
          </Button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCat("all")}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
            filterCat === "all" ? "bg-gradient-to-r from-rose-400 to-sky-400 text-white border-transparent" : "bg-white/50 text-gray-600 border-white/50 hover:bg-white/80"
          )}
        >
          Semua
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setFilterCat(c.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
              filterCat === c.id ? "bg-gradient-to-r from-rose-400 to-sky-400 text-white border-transparent" : "bg-white/50 text-gray-600 border-white/50 hover:bg-white/80"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="glass-card h-32 p-4" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-sky-100 flex items-center justify-center">
            <Package className="w-8 h-8 text-rose-400" />
          </div>
          <p className="text-gray-500">Belum ada barang inventaris.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([catId, items]) => (
            <div key={catId} className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className={cn("text-sm px-3 py-1 border", getCatColor(catId))}>{getCatLabel(catId)}</Badge>
                <span className="text-xs text-gray-400">{items.length} item</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(item => (
                  <div key={item.id} className="glass-card p-4 group transition-all hover:-translate-y-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-2xl font-bold text-gray-800">{item.quantity}</span>
                          <span className="text-sm text-gray-500">{item.unit}</span>
                        </div>
                        {item.notes && <p className="text-xs text-gray-400 mt-1 truncate">{item.notes}</p>}
                      </div>
                      {isAdmin && (
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5 text-sky-500" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => del.mutate({ id: item.id }, { onSuccess: () => { invalidate(); toast({ title: "Item dihapus" }); } })}><Trash2 className="w-3.5 h-3.5 text-rose-500" /></Button>
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
        <DialogContent className="glass-panel border-white/50">
          <DialogHeader><DialogTitle>{editId ? "Edit Barang" : "Tambah Barang"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Nama barang" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-white/50" />
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="bg-white/50"><SelectValue placeholder="Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="p3k">P3K</SelectItem>
                <SelectItem value="obat">Obat</SelectItem>
                <SelectItem value="alkes">Alkes</SelectItem>
                <SelectItem value="umum">Umum</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Jumlah"
                value={form.quantity}
                min={0}
                onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                className="bg-white/50 w-24"
              />
              <Input placeholder="Satuan (pcs, tablet, botol...)" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="bg-white/50 flex-1" />
            </div>
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
