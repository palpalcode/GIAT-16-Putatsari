import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetLogbookEntries,
  useCreateLogbookEntry,
  useUpdateLogbookEntry,
  useDeleteLogbookEntry,
  useDeleteLogbookPhoto,
  getGetLogbookEntriesQueryKey,
  type LogbookEntry,
  type LogbookEntryInput,
  type LogbookPhoto,
} from "@workspace/api-client-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Download, Camera, X, ImageIcon, Loader2, ChevronLeft, ChevronRight, ZoomIn, FileText, FileType } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn, TEAM_MEMBERS } from "@/lib/utils";

type ProgramInfo = { id: number; programName: string; leader: string };

type PhotoUploadState = { file: File; uploading: boolean; error?: string; fileName: string };

const BASE_URL = (import.meta as any).env?.BASE_URL ?? "/";

async function uploadPhotoToLogbook(file: File, logbookEntryId: number): Promise<LogbookPhoto> {
  const fd = new FormData();
  fd.append("logbookEntryId", String(logbookEntryId));
  fd.append("file", file, file.name);
  const res = await fetch(`${BASE_URL}api/logbook/photos`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || "Gagal mengupload foto");
  }
  return res.json() as Promise<LogbookPhoto>;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

type EntryForm = {
  tanggal: string;
  kegiatan: string;
  lokasi: string;
  peserta: string[];
  sasaran: string;
  hasilKegiatan: string;
  kendala: string;
  tindakLanjut: string;
  penanggungjawab: string;
};

function todayStr() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
}

function formatTanggal(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

type LogbookFormDialogProps = {
  open: boolean;
  onClose: () => void;
  editEntry: LogbookEntry | null;
  program: ProgramInfo;
  onSaved: () => void;
};

function LogbookFormDialog({ open, onClose, editEntry, program, onSaved }: LogbookFormDialogProps) {
  const { toast } = useToast();
  const delPhoto = useDeleteLogbookPhoto();
  const create = useCreateLogbookEntry();
  const update = useUpdateLogbookEntry();
  const qc = useQueryClient();

  const defaultForm: EntryForm = {
    tanggal: todayStr(),
    kegiatan: "",
    lokasi: "",
    peserta: [],
    sasaran: "",
    hasilKegiatan: "",
    kendala: "",
    tindakLanjut: "",
    penanggungjawab: program.leader,
  };

  const [form, setForm] = useState<EntryForm>(defaultForm);

  useEffect(() => {
    if (open) {
      setForm(editEntry
        ? {
            tanggal: editEntry.tanggal,
            kegiatan: editEntry.kegiatan,
            lokasi: editEntry.lokasi,
            peserta: editEntry.peserta as string[],
            sasaran: editEntry.sasaran,
            hasilKegiatan: editEntry.hasilKegiatan,
            kendala: editEntry.kendala ?? "",
            tindakLanjut: editEntry.tindakLanjut ?? "",
            penanggungjawab: editEntry.penanggungjawab,
          }
        : defaultForm);
      setPendingPhotos([]);
      setDeletingPhotoIds(new Set());
    }
  // defaultForm is a new object each render — only re-run when open/editEntry identity changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editEntry]);

  const setF = (k: keyof EntryForm, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const [pendingPhotos, setPendingPhotos] = useState<PhotoUploadState[]>([]);
  const [deletingPhotoIds, setDeletingPhotoIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setForm(editEntry
      ? {
          tanggal: editEntry.tanggal,
          kegiatan: editEntry.kegiatan,
          lokasi: editEntry.lokasi,
          peserta: editEntry.peserta as string[],
          sasaran: editEntry.sasaran,
          hasilKegiatan: editEntry.hasilKegiatan,
          kendala: editEntry.kendala ?? "",
          tindakLanjut: editEntry.tindakLanjut ?? "",
          penanggungjawab: editEntry.penanggungjawab,
        }
      : defaultForm);
    setPendingPhotos([]);
    setDeletingPhotoIds(new Set());
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast({ title: `${f.name}: tipe file tidak didukung`, variant: "destructive" });
        return false;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({ title: `${f.name}: ukuran maksimal ${MAX_SIZE_MB} MB`, variant: "destructive" });
        return false;
      }
      return true;
    });
    if (valid.length === 0) return;
    const newItems: PhotoUploadState[] = valid.map((f) => ({ file: f, uploading: false, fileName: f.name }));
    setPendingPhotos((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePending(idx: number) {
    setPendingPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function deleteExistingPhoto(photoId: number) {
    setDeletingPhotoIds((prev) => new Set(prev).add(photoId));
    delPhoto.mutate({ id: photoId }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetLogbookEntriesQueryKey({ programId: program.id }) });
      },
      onError: () => {
        setDeletingPhotoIds((prev) => { const s = new Set(prev); s.delete(photoId); return s; });
        toast({ title: "Gagal menghapus foto", variant: "destructive" });
      },
    });
  }

  function togglePeserta(m: string) {
    setF("peserta", form.peserta.includes(m) ? form.peserta.filter((x) => x !== m) : [...form.peserta, m]);
  }

  async function handleSave() {
    if (!form.kegiatan.trim() || !form.lokasi.trim() || !form.sasaran.trim() || !form.hasilKegiatan.trim() || !form.penanggungjawab.trim()) {
      toast({ title: "Lengkapi field yang wajib diisi", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let savedEntryId: number;
      if (editEntry) {
        const result = await new Promise<LogbookEntry>((resolve, reject) => {
          update.mutate(
            { id: editEntry.id, data: { ...form, kendala: form.kendala || undefined, tindakLanjut: form.tindakLanjut || undefined } },
            { onSuccess: (d) => resolve(d as LogbookEntry), onError: reject },
          );
        });
        savedEntryId = result.id;
      } else {
        const payload: LogbookEntryInput = {
          programId: program.id,
          tanggal: form.tanggal,
          kegiatan: form.kegiatan,
          lokasi: form.lokasi,
          peserta: form.peserta,
          sasaran: form.sasaran,
          hasilKegiatan: form.hasilKegiatan,
          kendala: form.kendala || undefined,
          tindakLanjut: form.tindakLanjut || undefined,
          penanggungjawab: form.penanggungjawab,
        };
        const result = await new Promise<LogbookEntry>((resolve, reject) => {
          create.mutate({ data: payload }, { onSuccess: (d) => resolve(d as LogbookEntry), onError: reject });
        });
        savedEntryId = result.id;
      }

      for (let i = 0; i < pendingPhotos.length; i++) {
        const item = pendingPhotos[i];
        setPendingPhotos((prev) => prev.map((p, idx) => idx === i ? { ...p, uploading: true } : p));
        try {
          await uploadPhotoToLogbook(item.file, savedEntryId);
          setPendingPhotos((prev) => prev.map((p, idx) => idx === i ? { ...p, uploading: false } : p));
        } catch {
          setPendingPhotos((prev) => prev.map((p, idx) => idx === i ? { ...p, uploading: false, error: "Gagal upload" } : p));
        }
      }

      qc.invalidateQueries({ queryKey: getGetLogbookEntriesQueryKey({ programId: program.id }) });
      toast({ title: editEntry ? "Logbook diperbarui" : "Logbook ditambahkan" });
      handleClose();
      onSaved();
    } catch {
      toast({ title: "Gagal menyimpan logbook", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const existingPhotos = editEntry?.photos ?? [];
  const isAnySaving = saving || create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="form-dialog border-white/50 max-w-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-emerald-400/15 to-sky-400/15">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editEntry ? "Edit Entri Logbook" : "Tambah Entri Logbook"}
            </DialogTitle>
            <p className="text-xs text-gray-500 mt-0.5">{program.programName}</p>
          </DialogHeader>
        </div>
        <div className="px-6 pb-6 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1.5 block">Tanggal *</label>
              <Input type="date" value={form.tanggal} onChange={(e) => setF("tanggal", e.target.value)} className="bg-white/90" />
            </div>
            <div>
              <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1.5 block">Lokasi *</label>
              <Input placeholder="Lokasi kegiatan..." value={form.lokasi} onChange={(e) => setF("lokasi", e.target.value)} className="bg-white/90" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1.5 block">Nama Kegiatan *</label>
            <Input placeholder="Deskripsi kegiatan..." value={form.kegiatan} onChange={(e) => setF("kegiatan", e.target.value)} className="bg-white/90" />
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1.5 block">Sasaran *</label>
            <Input placeholder="Sasaran kegiatan..." value={form.sasaran} onChange={(e) => setF("sasaran", e.target.value)} className="bg-white/90" />
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1.5 block">Hasil Kegiatan *</label>
            <textarea
              placeholder="Uraikan hasil kegiatan..."
              value={form.hasilKegiatan}
              onChange={(e) => setF("hasilKegiatan", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-input bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1.5 block">Kendala</label>
              <Input placeholder="Kendala (opsional)..." value={form.kendala} onChange={(e) => setF("kendala", e.target.value)} className="bg-white/90" />
            </div>
            <div>
              <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1.5 block">Tindak Lanjut</label>
              <Input placeholder="Tindak lanjut (opsional)..." value={form.tindakLanjut} onChange={(e) => setF("tindakLanjut", e.target.value)} className="bg-white/90" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1.5 block">Penanggung Jawab *</label>
            <Input placeholder="Nama PJ..." value={form.penanggungjawab} onChange={(e) => setF("penanggungjawab", e.target.value)} className="bg-white/90" />
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-2 block">Peserta</label>
            <div className="flex flex-wrap gap-2">
              {TEAM_MEMBERS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => togglePeserta(m)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                    form.peserta.includes(m)
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                      : "bg-white/90 text-gray-600 border-white/40 hover:bg-white/90",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-2 block">Dokumentasi</label>
            {existingPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {existingPhotos.map((p) => (
                  <div key={p.id} className="relative group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-emerald-200 bg-gray-100 flex items-center justify-center">
                      <img
                        src={`${BASE_URL}${p.url.replace(/^\//, "")}`}
                        alt={p.fileName}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <ImageIcon className="w-6 h-6 text-gray-400 absolute" style={{ display: "none" }} />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 w-20 truncate">{p.fileName}</p>
                    <button
                      type="button"
                      onClick={() => deleteExistingPhoto(p.id)}
                      disabled={deletingPhotoIds.has(p.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {pendingPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {pendingPhotos.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-sky-200 bg-sky-50 flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(item.file)}
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                      />
                      {item.uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <p className={cn("text-[10px] mt-0.5 w-20 truncate", item.error ? "text-rose-500" : "text-gray-500")}>
                      {item.error ?? item.fileName}
                    </p>
                    {!item.uploading && (
                      <button
                        type="button"
                        onClick={() => removePending(idx)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-xs rounded-full border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Camera className="w-3.5 h-3.5" />
              Tambah Foto
            </Button>
            <p className="text-[10px] text-gray-400 mt-1">JPEG, PNG, WebP · Maks {MAX_SIZE_MB} MB per foto</p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={handleClose} className="rounded-full" disabled={isAnySaving}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isAnySaving}
              className="bg-gradient-to-r from-emerald-400 to-sky-400 text-white border-0 rounded-full gap-1.5"
            >
              {isAnySaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ExportDialogProps = {
  open: boolean;
  onClose: () => void;
  program: ProgramInfo;
  hasEntries: boolean;
};

function ExportDialog({ open, onClose, program, hasEntries }: ExportDialogProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [format, setFormat] = useState<"word" | "pdf">("word");
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  function handleClose() {
    setDateFrom("");
    setDateTo("");
    setFormat("word");
    onClose();
  }

  async function handleExport() {
    if (!hasEntries) return;
    setExporting(true);
    try {
      const params = new URLSearchParams({ programId: String(program.id) });
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const endpoint = format === "pdf" ? "pdf" : "word";
      const url = `${BASE_URL}api/logbook/export/${endpoint}?${params.toString()}`;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({ title: (body as any).error ?? "Gagal mengekspor logbook", variant: "destructive" });
        return;
      }

      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const safeName = program.programName.replace(/[^a-zA-Z0-9]/g, "_");
      const rangeLabel = dateFrom && dateTo
        ? `${dateFrom}_sd_${dateTo}`
        : dateFrom
          ? `mulai_${dateFrom}`
          : dateTo
            ? `sd_${dateTo}`
            : "semua";
      const ext = format === "pdf" ? "pdf" : "docx";
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `logbook_${safeName}_${rangeLabel}.${ext}`;
      a.click();
      URL.revokeObjectURL(objUrl);
      handleClose();
    } catch {
      toast({ title: "Gagal mengekspor logbook", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="border-white/50 max-w-sm p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-emerald-400/15 to-sky-400/15">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Ekspor Logbook</DialogTitle>
            <p className="text-xs text-gray-500 mt-0.5">{program.programName}</p>
          </DialogHeader>
        </div>
        <div className="px-6 pb-6 pt-4 space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Rentang Tanggal (opsional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Mulai</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white/90 text-sm h-9"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Selesai</label>
                <Input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white/90 text-sm h-9"
                />
              </div>
            </div>
            {!dateFrom && !dateTo && (
              <p className="text-[11px] text-gray-400">Kosongkan untuk mengekspor semua entri.</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Format</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("word")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                  format === "word"
                    ? "border-sky-400 bg-sky-50 text-sky-700"
                    : "border-gray-200 bg-white/80 text-gray-500 hover:border-gray-300",
                )}
              >
                <FileType className="w-5 h-5" />
                Word (.docx)
              </button>
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                  format === "pdf"
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-gray-200 bg-white/80 text-gray-500 hover:border-gray-300",
                )}
              >
                <FileText className="w-5 h-5" />
                PDF
              </button>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <Button variant="outline" onClick={handleClose} className="rounded-full" disabled={exporting}>
              Batal
            </Button>
            <Button
              onClick={handleExport}
              disabled={!hasEntries || exporting}
              className="bg-gradient-to-r from-emerald-400 to-sky-400 text-white border-0 rounded-full gap-1.5"
            >
              {exporting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Mengekspor...</>
              ) : (
                <><Download className="w-3.5 h-3.5" />Ekspor</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type LightboxState = { photos: LogbookPhoto[]; index: number } | null;

function PhotoLightbox({ state, onClose, goTo }: { state: LightboxState; onClose: () => void; goTo: (i: number) => void }) {
  const photo = state ? state.photos[state.index] : null;

  useEffect(() => {
    if (!state) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && state && state.index > 0) goTo(state.index - 1);
      if (e.key === "ArrowRight" && state && state.index < state.photos.length - 1) goTo(state.index + 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, onClose, goTo]);

  if (!state || !photo) return null;

  const hasPrev = state.index > 0;
  const hasNext = state.index < state.photos.length - 1;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        aria-label="Tutup"
      >
        <X className="w-5 h-5" />
      </button>

      {hasPrev && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goTo(state.index - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          aria-label="Foto sebelumnya"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goTo(state.index + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          aria-label="Foto berikutnya"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div
        className="flex flex-col items-center gap-3 max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={`${BASE_URL}api/storage${photo.storageKey}`}
          alt={photo.fileName}
          className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl"
        />
        <div className="flex items-center gap-3">
          {state.photos.length > 1 && (
            <p className="text-white/70 text-sm">
              {state.index + 1} / {state.photos.length}
            </p>
          )}
          <p className="text-white/60 text-xs truncate max-w-xs">{photo.fileName}</p>
        </div>
        {state.photos.length > 1 && (
          <div className="flex gap-1.5">
            {state.photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === state.index ? "bg-white" : "bg-white/40 hover:bg-white/60"
                )}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function useLightbox() {
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  function open(photos: LogbookPhoto[], index: number) {
    setLightbox({ photos, index });
  }

  function close() {
    setLightbox(null);
  }

  function goTo(index: number) {
    setLightbox((prev) => prev ? { ...prev, index } : null);
  }

  return { lightbox, open, close, goTo };
}

type Props = {
  open: boolean;
  onClose: () => void;
  program: ProgramInfo | null;
  isKetSek: boolean;
  canEdit: boolean;
};

export function LogbookDrawer({ open, onClose, program, isKetSek, canEdit }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<LogbookEntry | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const delEntry = useDeleteLogbookEntry();
  const { lightbox, open: openLightbox, close: closeLightbox, goTo } = useLightbox();

  const { data: entries, isLoading } = useGetLogbookEntries(
    { programId: program?.id ?? 0 },
    { query: { enabled: !!program && open, queryKey: getGetLogbookEntriesQueryKey({ programId: program?.id ?? 0 }) } },
  );

  function invalidate() {
    if (program) qc.invalidateQueries({ queryKey: getGetLogbookEntriesQueryKey({ programId: program.id }) });
  }

  function openAdd() { setEditEntry(null); setFormOpen(true); }
  function openEdit(entry: LogbookEntry) { setEditEntry(entry); setFormOpen(true); }

  function handleDelete(entry: LogbookEntry) {
    if (!confirm(`Hapus entri logbook tanggal ${formatTanggal(entry.tanggal)}?`)) return;
    delEntry.mutate({ id: entry.id }, {
      onSuccess: () => { invalidate(); toast({ title: "Entri dihapus" }); },
      onError: () => { toast({ title: "Gagal menghapus entri", variant: "destructive" }); },
    });
  }

  const sorted = entries ?? [];

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-emerald-400/15 to-sky-400/15 border-b border-emerald-100/50">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-sky-500 bg-clip-text text-transparent">
                Logbook Kegiatan
              </SheetTitle>
              {program && (
                <p className="text-sm text-gray-600 mt-0.5 font-medium">{program.programName}</p>
              )}
            </SheetHeader>
            <div className="flex items-center gap-2 mt-4">
              {canEdit && (
                <Button
                  onClick={openAdd}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-400 to-sky-400 text-white border-0 rounded-full gap-1.5 text-xs h-8 px-3"
                >
                  <Plus className="w-3.5 h-3.5" />Tambah Entri
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportOpen(true)}
                disabled={!entries || entries.length === 0}
                className="rounded-full gap-1.5 text-xs h-8 px-3 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <Download className="w-3.5 h-3.5" />Ekspor
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="bg-white/90 rounded-xl h-28" />)}
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-gray-400 text-sm text-center">Belum ada entri logbook.</p>
                {canEdit && (
                  <Button
                    onClick={openAdd}
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs mt-1 border-emerald-300 text-emerald-700"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />Tambah Entri Pertama
                  </Button>
                )}
              </div>
            ) : (
              sorted.map((entry) => (
                <div key={entry.id} className="bg-white/90 rounded-2xl border border-white/60 p-4 group shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-xs">
                          {formatTanggal(entry.tanggal)}
                        </Badge>
                        <span className="text-xs text-gray-400">{entry.lokasi}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{entry.kegiatan}</h3>

                      <div className="space-y-1.5 text-xs text-gray-600">
                        <p><span className="font-semibold text-gray-700">Sasaran:</span> {entry.sasaran}</p>
                        <p><span className="font-semibold text-gray-700">Hasil:</span> {entry.hasilKegiatan}</p>
                        {entry.kendala && <p><span className="font-semibold text-gray-700">Kendala:</span> {entry.kendala}</p>}
                        {entry.tindakLanjut && <p><span className="font-semibold text-gray-700">Tindak Lanjut:</span> {entry.tindakLanjut}</p>}
                        <p><span className="font-semibold text-gray-700">PJ:</span> {entry.penanggungjawab}</p>
                        {(entry.peserta as string[]).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(entry.peserta as string[]).map((m) => (
                              <span key={m} className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-full border border-sky-100 text-[11px]">{m}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {entry.photos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {entry.photos.map((p, photoIdx) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => openLightbox(entry.photos as LogbookPhoto[], photoIdx)}
                              className="relative group/photo w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 hover:border-emerald-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              aria-label={`Lihat foto ${p.fileName}`}
                            >
                              <img
                                src={`${BASE_URL}api/storage${p.storageKey}`}
                                alt={p.fileName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const parent = (e.target as HTMLImageElement).parentElement;
                                  if (parent) parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 text-[10px] p-1 text-center">${p.fileName}</div>`;
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/30 transition-colors flex items-center justify-center">
                                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(entry)}>
                          <Pencil className="w-3 h-3 text-sky-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleDelete(entry)}>
                          <Trash2 className="w-3 h-3 text-rose-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {program && (
        <LogbookFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          editEntry={editEntry}
          program={program}
          onSaved={invalidate}
        />
      )}

      {program && (
        <ExportDialog
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          program={program}
          hasEntries={(entries?.length ?? 0) > 0}
        />
      )}

      <PhotoLightbox state={lightbox} onClose={closeLightbox} goTo={goTo} />
    </>
  );
}
