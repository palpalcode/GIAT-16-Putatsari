import { useState, useRef, useEffect } from "react";
import {
  useGetItemCatalog,
  useCreateCatalogItem,
  getGetItemCatalogQueryKey,
  type CatalogItem,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Plus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Props = {
  name: string;
  unit: string;
  onChangeName: (name: string) => void;
  onChangeUnit: (unit: string) => void;
  onChangeCategory?: (category: string) => void;
  isPrivileged: boolean;
  isLoggedIn: boolean;
  category: string;
  className?: string;
};

export function ItemCatalogCombobox({ name, unit, onChangeName, onChangeUnit, onChangeCategory, isPrivileged, isLoggedIn, category, className }: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: catalog = [] } = useGetItemCatalog();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(name);
  const [selectedFromCatalog, setSelectedFromCatalog] = useState(false);

  const [addMode, setAddMode] = useState(false);
  const [newUnit, setNewUnit] = useState("");
  const [newCategory, setNewCategory] = useState("alat_kebersihan");
  const createCatalog = useCreateCatalogItem();
  const containerRef = useRef<HTMLDivElement>(null);

  const CATALOG_CATEGORIES = [
    { id: "alat_kebersihan", label: "Kebersihan", emoji: "🧹" },
    { id: "alat_masak", label: "Masak", emoji: "🍳" },
    { id: "alat_makan", label: "Makan", emoji: "🍽️" },
    { id: "alat_tulis", label: "Tulis", emoji: "✏️" },
    { id: "alat_elektronik", label: "Elektronik", emoji: "🔌" },
    { id: "pakaian", label: "Pakaian", emoji: "👕" },
    { id: "stock_makanan", label: "Stock", emoji: "🍚" },
    { id: "device", label: "Device", emoji: "📱" },
    { id: "darurat", label: "Darurat", emoji: "🚨" },
    { id: "tempat_tidur", label: "Tidur", emoji: "🛏️" },
  ] as const;

  useEffect(() => {
    setQuery(name);
  }, [name]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAddMode(false);
        setNewUnit("");
        if (!selectedFromCatalog && query !== name) {
          setQuery(name);
        }
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selectedFromCatalog, query, name]);

  const filtered = catalog.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const exactMatch = catalog.find(c => c.name.toLowerCase() === query.toLowerCase());

  function selectItem(item: CatalogItem) {
    setQuery(item.name);
    setSelectedFromCatalog(true);
    onChangeName(item.name);
    onChangeUnit(item.unit);
    onChangeCategory?.(item.category);
    setOpen(false);
    setAddMode(false);
  }

  function handleQueryChange(val: string) {
    setQuery(val);
    setSelectedFromCatalog(false);
    setOpen(true);
    setAddMode(false);
    setNewCategory(category || "alat_kebersihan");
    onChangeCategory?.(category || "alat_kebersihan");
  }

  function handleFocus() {
    setOpen(true);
  }

  function handleAddToCatalog() {
    if (!query.trim() || !newUnit.trim()) return;
    createCatalog.mutate(
      { data: { name: query.trim(), category: newCategory as any, unit: newUnit.trim() } },
      {
        onSuccess: (item) => {
          qc.invalidateQueries({ queryKey: getGetItemCatalogQueryKey() });
          selectItem(item);
          setAddMode(false);
          setNewUnit("");
          setNewCategory("alat_kebersihan");
          toast({ title: `"${item.name}" ditambahkan ke katalog` });
        },
        onError: () => {
          toast({ title: "Gagal menambah ke katalog", variant: "destructive" });
        },
      }
    );
  }

  const showAddOption = isLoggedIn && query.trim().length > 0 && !exactMatch;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          placeholder="Ketik nama barang..."
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          onFocus={handleFocus}
          className="bg-white/90 pr-8"
          autoComplete="off"
        />
        <BookOpen className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>

      {open && (query.length > 0 || filtered.length > 0) && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-white/60 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {filtered.length > 0 && (
            <div>
              {filtered.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); selectItem(item); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-emerald-50 transition-colors group text-left"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-400">({item.unit})</span>
                  </div>
                  {name === item.name && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 && query.trim().length > 0 && !isLoggedIn && (
            <div className="px-3 py-3 text-sm text-gray-400 text-center italic">
              Login untuk menambahkan nama baru ke katalog.
            </div>
          )}

          {showAddOption && !addMode && (
            <>
              {filtered.length > 0 && <div className="border-t border-gray-100 mx-2" />}
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); setAddMode(true); setNewCategory(category || "alat_kebersihan"); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors font-medium"
              >
                <Plus className="w-4 h-4 shrink-0" />
                Tambah "<span className="font-semibold">{query}</span>" ke katalog
              </button>
            </>
          )}

          {addMode && (
            <div className="px-3 py-3 space-y-2.5 border-t border-gray-100">
              <p className="text-xs font-semibold text-violet-800">Data barang baru "{query}"</p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-gray-500">Kategori</p>
                  <div className="flex flex-wrap gap-1">
                    {CATALOG_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onMouseDown={e => { e.preventDefault(); setNewCategory(cat.id); }}
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full border transition-all",
                          newCategory === cat.id
                            ? "bg-violet-100 border-violet-300 text-violet-700 font-semibold"
                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                        )}
                      >
                        <span className="mr-0.5">{cat.emoji}</span>{cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-gray-500">Satuan baku</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="pcs, botol, kg..."
                      value={newUnit}
                      onChange={e => setNewUnit(e.target.value)}
                      className="bg-white text-sm h-8"
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddToCatalog(); } }}
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={!newUnit.trim() || createCatalog.isPending}
                      onMouseDown={e => { e.preventDefault(); handleAddToCatalog(); }}
                      className="bg-emerald-500 text-white border-0 shrink-0 text-xs h-8"
                    >
                      {createCatalog.isPending ? "..." : "Simpan"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filtered.length === 0 && query.trim().length === 0 && (
            <div className="px-3 py-2.5 text-xs text-gray-400 italic">Ketik nama barang untuk mencari...</div>
          )}
        </div>
      )}
    </div>
  );
}
