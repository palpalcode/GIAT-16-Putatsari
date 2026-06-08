import { useParams, useLocation } from "wouter";
import { useState } from "react";
import {
  useGetProgramSchedules,
  useGetLogbookEntries,
  getGetLogbookEntriesQueryKey,
  type LogbookEntry,
  type LogbookPhoto,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { LogbookDrawer } from "@/components/LogbookDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Printer,
  BookOpen,
  User,
  CalendarDays,
  MapPin,
  Users,
  Target,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Loader2,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from "lucide-react";
import { cn, getMemberColor } from "@/lib/utils";

const BASE_URL = (import.meta as any).env?.BASE_URL ?? "/";

function formatTanggal(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  planned: { label: "Direncanakan", color: "bg-violet-100 text-violet-700 border-violet-200" },
  ongoing: { label: "Berjalan", color: "bg-amber-100 text-amber-700 border-amber-200" },
  done: { label: "Selesai", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

type LightboxState = { photos: LogbookPhoto[]; index: number } | null;

function PhotoLightbox({
  state,
  onClose,
  goTo,
}: {
  state: LightboxState;
  onClose: () => void;
  goTo: (i: number) => void;
}) {
  const photo = state ? state.photos[state.index] : null;
  if (!state || !photo) return null;
  const hasPrev = state.index > 0;
  const hasNext = state.index < state.photos.length - 1;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center print:hidden"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      {hasPrev && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goTo(state.index - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goTo(state.index + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
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
            <p className="text-white/70 text-sm">{state.index + 1} / {state.photos.length}</p>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryCard({ entry, onPhotoClick }: {
  entry: LogbookEntry;
  onPhotoClick: (photos: LogbookPhoto[], index: number) => void;
}) {
  const photos = entry.photos as LogbookPhoto[];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm print:shadow-none print:border print:border-gray-300 print:rounded-lg print:break-inside-avoid print:mb-4">
      {/* Entry header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center shrink-0 print:hidden">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{entry.kegiatan}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-sm text-emerald-700 font-medium">{formatTanggal(entry.tanggal)}</span>
            <span className="text-gray-300 print:hidden">·</span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3 print:hidden" />{entry.lokasi}
            </span>
          </div>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm print:gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <Target className="w-3 h-3 print:hidden" />Sasaran
          </div>
          <p className="text-gray-800 leading-relaxed">{entry.sasaran}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <CheckCircle2 className="w-3 h-3 print:hidden" />Hasil Kegiatan
          </div>
          <p className="text-gray-800 leading-relaxed">{entry.hasilKegiatan}</p>
        </div>

        {entry.kendala && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <AlertTriangle className="w-3 h-3 print:hidden" />Kendala
            </div>
            <p className="text-gray-800 leading-relaxed">{entry.kendala}</p>
          </div>
        )}

        {entry.tindakLanjut && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <TrendingUp className="w-3 h-3 print:hidden" />Tindak Lanjut
            </div>
            <p className="text-gray-800 leading-relaxed">{entry.tindakLanjut}</p>
          </div>
        )}
      </div>

      {/* Peserta & PJ */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-400 print:hidden" />
          <span className="text-xs text-gray-500">PJ:</span>
          <span className="text-xs font-semibold text-gray-700">{entry.penanggungjawab}</span>
        </div>
        {(entry.peserta as string[]).length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Users className="w-3.5 h-3.5 text-gray-400 shrink-0 print:hidden" />
            {(entry.peserta as string[]).map((m) => (
              <span key={m} className="text-[11px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-full border border-sky-100 print:border-gray-300 print:bg-transparent">{m}</span>
            ))}
          </div>
        )}
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            <ImageIcon className="w-3 h-3 print:hidden" />Dokumentasi ({photos.length} foto)
          </div>
          <div className="flex flex-wrap gap-2">
            {photos.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPhotoClick(photos, idx)}
                className="relative group/photo w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 hover:border-emerald-300 transition-colors print:w-24 print:h-24 print:cursor-default print:pointer-events-none"
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
                <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/30 transition-colors flex items-center justify-center print:hidden">
                  <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OurWorkDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { can, role, isLoggedIn } = useAuth();
  const isKetSek = role === "ketua" || role === "sekretaris";
  const canEdit = can("our-work");

  const programId = Number(params.id);

  const { data: schedules, isLoading: schedLoading } = useGetProgramSchedules();
  const { data: entries, isLoading: entriesLoading } = useGetLogbookEntries(
    { programId },
    { query: { enabled: !!programId, queryKey: getGetLogbookEntriesQueryKey({ programId }) } },
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const program = schedules?.find((s) => s.id === programId) ?? null;
  const sorted = entries ?? [];
  const isLoading = schedLoading || entriesLoading;

  const status = program ? (STATUS_MAP[program.status] ?? STATUS_MAP["planned"]) : null;

  function handlePrint() {
    window.print();
  }

  function openLightbox(photos: LogbookPhoto[], index: number) {
    setLightbox({ photos, index });
  }

  if (!isLoading && !program) {
    return (
      <div className="flex flex-col items-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-rose-400" />
        </div>
        <p className="text-gray-500">Program tidak ditemukan.</p>
        <Button variant="outline" onClick={() => navigate("/our-work")} className="rounded-full gap-1.5">
          <ArrowLeft className="w-4 h-4" />Kembali ke Our Work
        </Button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; }
          .print-hide { display: none !important; }
          .print-header { page-break-after: avoid; }
        }
      `}</style>

      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 print-hide">
          <button
            type="button"
            onClick={() => navigate("/our-work")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Our Work</span>
          </button>

          <div className="flex items-center gap-2">
            {(isKetSek || canEdit) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDrawerOpen(true)}
                className="rounded-full gap-1.5 text-xs h-8 px-3 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <BookOpen className="w-3.5 h-3.5" />Edit Logbook
              </Button>
            )}
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-gradient-to-r from-rose-400 to-sky-400 text-white border-0 rounded-full gap-1.5 text-xs h-8 px-3"
            >
              <Printer className="w-3.5 h-3.5" />Cetak
            </Button>
          </div>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block text-center mb-6 print-header">
          <h1 className="text-2xl font-bold">LOGBOOK KEGIATAN</h1>
          <p className="text-gray-500 text-sm mt-1">Putatsari Wellness KKN</p>
        </div>

        {/* Program info card */}
        {isLoading ? (
          <div className="glass-card p-6 animate-pulse print:hidden">
            <div className="h-7 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
          </div>
        ) : program && (
          <div className="glass-card p-6 print:border print:border-gray-300 print:rounded-lg print:bg-white print:shadow-none">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {status && (
                    <Badge className={cn("text-xs border", status.color)}>{status.label}</Badge>
                  )}
                  <span className="text-xs text-gray-400">{formatDateShort(program.date)}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{program.programName}</h1>
                {program.notes && (
                  <p className="text-sm text-gray-500 mt-1.5">{program.notes}</p>
                )}
              </div>
              <div className="space-y-2 text-sm shrink-0">
                <div className="flex items-center gap-2">
                  <div className={cn("w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-white shrink-0", getMemberColor(program.leader))}>
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-gray-600">PJ: <span className="font-semibold text-gray-800">{program.leader}</span></span>
                </div>
                {(program.members as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(program.members as string[]).map((m) => (
                      <span key={m} className="flex items-center gap-1 text-[11px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-full border border-sky-100">
                        <span className={cn("w-2.5 h-2.5 rounded-full bg-gradient-to-br inline-block shrink-0", getMemberColor(m))} />
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Entries section */}
        <div>
          <div className="flex items-center justify-between mb-4 print-hide">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Entri Logbook
              {!isLoading && (
                <span className="text-xs font-normal text-gray-400 ml-1">({sorted.length} entri)</span>
              )}
            </h2>
          </div>

          {/* Print section heading */}
          <div className="hidden print:block mb-4">
            <h2 className="text-lg font-bold border-b border-gray-300 pb-2">Daftar Kegiatan</h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse print:hidden">
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-14 bg-gray-100 rounded" />
                    <div className="h-14 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 print:hidden">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-gray-400 text-sm text-center">Belum ada entri logbook.</p>
              {(isKetSek || canEdit) && (
                <Button
                  onClick={() => setDrawerOpen(true)}
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs mt-1 border-emerald-300 text-emerald-700"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1" />Tambah Entri
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onPhotoClick={openLightbox}
                />
              ))}
            </div>
          )}
        </div>

        {/* Print footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          Dicetak dari sistem KKN Putatsari Wellness · {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Logbook Drawer for editing */}
      {program && (
        <LogbookDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          program={{ id: program.id, programName: program.programName, leader: program.leader }}
          isKetSek={isKetSek}
          canEdit={canEdit}
        />
      )}

      {/* Lightbox */}
      <PhotoLightbox
        state={lightbox}
        onClose={() => setLightbox(null)}
        goTo={(i) => setLightbox((prev) => prev ? { ...prev, index: i } : null)}
      />
    </>
  );
}
