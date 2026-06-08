import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAttendance,
  useCreateAttendance,
  AttendanceInputStatus,
  type AttendanceInputStatus as AttendanceStatus,
  getGetAttendanceQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

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

const ATTENDANCE_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string; emoji: string }> = {
  hadir: { label: "Hadir", color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-300", emoji: "✅" },
  izin: { label: "Izin", color: "text-amber-700", bg: "bg-amber-100 border-amber-300", emoji: "📋" },
  sakit: { label: "Sakit", color: "text-rose-700", bg: "bg-rose-100 border-rose-300", emoji: "🤒" },
  alfa: { label: "Alfa", color: "text-gray-600", bg: "bg-gray-100 border-gray-300", emoji: "❓" },
};

function today() { return new Date().toISOString().split("T")[0]; }

export function AttendanceWidget({
  memberName,
  isKetSek,
  isLoggedIn,
  defaultDate = today(),
  showDatePicker = true,
}: {
  memberName: string | null;
  isKetSek: boolean;
  isLoggedIn: boolean;
  defaultDate?: string;
  showDatePicker?: boolean;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(defaultDate);

  const { data: attendance, isLoading } = useGetAttendance({ date: selectedDate });
  const submitAttendance = useCreateAttendance();

  function invalidate() {
    qc.invalidateQueries({ queryKey: getGetAttendanceQueryKey({ date: selectedDate }) });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  }

  function canSetFor(member: string) {
    return isLoggedIn && (memberName === member || isKetSek) && selectedDate <= today();
  }

  function handleStatus(member: string, status: AttendanceStatus) {
    if (selectedDate > today()) {
      toast({ title: "Tidak bisa mengisi presensi untuk hari esok", variant: "destructive" });
      return;
    }
    submitAttendance.mutate(
      { data: { memberName: member, date: selectedDate, status } },
      { onSuccess: () => { invalidate(); toast({ title: `Absensi ${member}: ${status}` }); } }
    );
  }

  const attendanceMap = new Map((attendance ?? []).map(a => [a.memberName, a]));
  const presentCount = (attendance ?? []).filter(a => a.status === "hadir").length;
  const izinCount = (attendance ?? []).filter(a => a.status === "izin").length;
  const sakitCount = (attendance ?? []).filter(a => a.status === "sakit").length;
  const alfaCount = (attendance ?? []).filter(a => a.status === "alfa").length;
  const totalFilled = (attendance ?? []).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-700">Rekap Absensi</h2>
        <div className="flex items-center gap-2">
          {showDatePicker && (
            <>
              <label className="text-xs text-gray-500 font-medium">Tanggal:</label>
              <input
                type="date"
                value={selectedDate}
                max={today()}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-xl border border-white/50 bg-white/60 focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300"
              />
              {selectedDate === today() && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                  Hari Ini
                </span>
              )}
              {selectedDate < today() && (
                <span className="text-xs font-medium text-sky-600 bg-sky-50 border border-sky-200 px-2 py-1 rounded-full">
                  Riwayat
                </span>
              )}
            </>
          )}
          {isKetSek && (
            <button
              onClick={() => {
                const start = "2026-06-15";
                const weeks = 7;
                window.open(`/api/attendance/export?start=${start}&weeks=${weeks}`, "_blank");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </button>
          )}
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 flex-wrap">
        {((Object.entries(ATTENDANCE_CONFIG) as [AttendanceStatus, typeof ATTENDANCE_CONFIG[AttendanceStatus]][]).map(([s, cfg]) => {
          const count = s === "hadir" ? presentCount : s === "izin" ? izinCount : s === "sakit" ? sakitCount : alfaCount;
          return (
            <div key={s} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border", cfg.bg)}>
              <span>{cfg.emoji}</span>
              <span className={cfg.color}>{cfg.label}: <strong>{count}</strong></span>
            </div>
          );
        }))}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-gray-50 border-gray-200">
          <span className="text-gray-500">Belum diisi: <strong>{9 - totalFilled}</strong></span>
        </div>
      </div>

      {!isLoggedIn && (
        <div className="glass-card p-4 text-center text-sm text-gray-400">
          Login untuk mengisi absensi diri sendiri.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="animate-pulse glass-card h-16" />)}</div>
      ) : (
        <div className="space-y-2">
          {MEMBERS.map(member => {
            const record = attendanceMap.get(member);
            const canSet = canSetFor(member);
            const currentStatus = record?.status as AttendanceStatus | undefined;
            const isSelf = memberName === member;

            return (
              <div key={member} className={cn("glass-card p-3 flex items-center gap-3 transition-all", isSelf && "ring-1 ring-rose-200")}>
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-gradient-to-br", getMemberColor(member))}>
                  {member.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {member}
                    {isSelf && <span className="ml-1.5 text-xs text-rose-400 font-normal">(saya)</span>}
                  </p>
                  {record?.notes && <p className="text-xs text-gray-400 truncate">{record.notes}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {canSet ? (
                    (Object.keys(ATTENDANCE_CONFIG) as AttendanceStatus[]).map(s => {
                      const cfg = ATTENDANCE_CONFIG[s];
                      const isActive = currentStatus === s;
                      return (
                        <button key={s} type="button"
                          onClick={() => handleStatus(member, s)}
                          disabled={submitAttendance.isPending}
                          title={cfg.label}
                          className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border-2 transition-all",
                            isActive ? cn("border-current", cfg.bg, cfg.color, "shadow-sm") : "border-gray-200 bg-white/40 text-gray-400 hover:bg-white/70"
                          )}>
                          <span>{cfg.emoji}</span>
                          <span className="hidden sm:inline">{cfg.label}</span>
                        </button>
                      );
                    })
                  ) : (
                    currentStatus ? (
                      <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border", ATTENDANCE_CONFIG[currentStatus].bg)}>
                        <span>{ATTENDANCE_CONFIG[currentStatus].emoji}</span>
                        <span className={ATTENDANCE_CONFIG[currentStatus].color}>{ATTENDANCE_CONFIG[currentStatus].label}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 italic">Belum diisi</span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Compact version for dashboard (summary-only with click-through)
export function AttendanceSummary({ summary }: {
  summary?: {
    attendanceSummary?: { hadir: number; izin: number; sakit: number; alfa: number };
    presentToday?: number; absentToday?: number;
  } | null;
}) {
  const items = [
    { label: "Hadir", emoji: "✅", count: summary?.attendanceSummary?.hadir ?? 0, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { label: "Izin", emoji: "📋", count: summary?.attendanceSummary?.izin ?? 0, color: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "Sakit", emoji: "🤒", count: summary?.attendanceSummary?.sakit ?? 0, color: "bg-rose-50 text-rose-700 border-rose-200" },
    { label: "Alfa", emoji: "❓", count: summary?.attendanceSummary?.alfa ?? 0, color: "bg-gray-50 text-gray-600 border-gray-200" },
    { label: "Belum diisi", emoji: "—", count: 9 - ((summary?.presentToday ?? 0) + (summary?.absentToday ?? 0)), color: "bg-gray-50 text-gray-400 border-gray-100" },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(({ label, emoji, count, color }) => (
        <div key={label} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium", color)}>
          <span>{emoji}</span>
          <span>{label}</span>
          <span className="font-bold text-base leading-none">{count}</span>
        </div>
      ))}
    </div>
  );
}
