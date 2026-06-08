import { useGetDashboardSummary, useGetMembers, useGetKasSummary } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Calendar, AlertTriangle, CheckCircle2, ChefHat, SprayCan, Package, CalendarCheck, Wallet, ShieldCheck, Utensils } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { getMemberColor } from "@/components/ui/member-picker";

function formatRp(n: number) { return "Rp " + Math.abs(n).toLocaleString("id-ID"); }

function daysLeft(dueDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / 86400000);
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-gray-100 rounded-xl", className)} />;
}

function MemberCard({ member }: { member: { id: number; name: string; divisionRole: string; avatarUrl?: string | null } }) {
  const firstLetter = member.name.charAt(0);
  return (
    <Link href="/profil">
      <div className="glass-card p-4 text-center hover:-translate-y-1 transition-all group cursor-pointer">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-white/60 shadow-sm"
          />
        ) : (
          <div
            className={cn(
              "w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br shadow-sm",
              getMemberColor(member.name)
            )}
          >
            {firstLetter}
          </div>
        )}
        <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{member.name}</p>
        <p className="text-xs text-sky-600 mt-1 bg-sky-50 inline-block px-2 py-0.5 rounded-full border border-sky-100">
          {member.divisionRole}
        </p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: members, isLoading: membersLoading } = useGetMembers();
  const { data: kasSummary, isLoading: kasLoading } = useGetKasSummary();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      {/* Hero */}
      <section className="text-center space-y-3 py-8">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 text-sm text-rose-600 font-medium">
          Kuliah Kerja Nyata
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Selamat Datang,{" "}
          <span className="bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
            Putatsari Wellness
          </span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Bersama membangun desa dengan karya dan dedikasi. Semangat, tim!
        </p>
      </section>

      {/* ── PRIMARY: Pengumuman & Deadline ───────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Recent Announcements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-rose-500" />
              </div>
              <h2 className="font-bold text-gray-800">Pengumuman</h2>
              {!isLoading && (
                <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">
                  {summary?.totalAnnouncements ?? 0}
                </span>
              )}
            </div>
            <Link href="/pengumuman" className="text-sm text-rose-500 hover:text-rose-700 transition-colors font-medium">
              Lihat semua
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              [1, 2, 3].map(i => <SkeletonBlock key={i} className="h-20" />)
            ) : !summary?.recentAnnouncements?.length ? (
              <div className="glass-card p-6 text-center text-gray-400 text-sm">Belum ada pengumuman.</div>
            ) : (
              summary.recentAnnouncements.map((a: any) => (
                <Link href="/pengumuman" key={a.id} className="block">
                  <div className="glass-card p-5 hover:-translate-y-0.5 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <Badge className={cn(
                        "text-xs shrink-0 border mt-0.5",
                        a.priority === "high" ? "bg-rose-100 text-rose-700 border-rose-200"
                          : a.priority === "medium" ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      )}>
                        {a.priority === "high" ? "Mendesak" : a.priority === "medium" ? "Penting" : "Normal"}
                      </Badge>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 group-hover:text-rose-600 transition-colors truncate">{a.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.content}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="font-bold text-gray-800">Deadline</h2>
              {!isLoading && (
                <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                  {summary?.upcomingDeadlines ?? 0} mendekat
                </span>
              )}
            </div>
            <Link href="/deadline" className="text-sm text-amber-600 hover:text-amber-700 transition-colors font-medium">
              Lihat semua
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              [1, 2, 3].map(i => <SkeletonBlock key={i} className="h-20" />)
            ) : !summary?.urgentDeadlines?.length ? (
              <div className="glass-card p-6 text-center text-gray-400 text-sm">Tidak ada deadline mendatang.</div>
            ) : (
              summary.urgentDeadlines.map((d: any) => {
                const days = daysLeft(d.dueDate);
                return (
                  <Link href="/deadline" key={d.id} className="block">
                    <div className={cn(
                      "glass-card p-5 hover:-translate-y-0.5 transition-all cursor-pointer group",
                      days <= 3 && days >= 0 && "ring-2 ring-amber-200/70"
                    )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-gray-900 group-hover:text-amber-600 transition-colors truncate">{d.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(d.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <Badge className={cn(
                          "text-xs shrink-0 border whitespace-nowrap",
                          days < 0 ? "bg-rose-200 text-rose-800 border-rose-300"
                            : days === 0 ? "bg-rose-100 text-rose-700 border-rose-200"
                            : days <= 3 ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-sky-100 text-sky-700 border-sky-200"
                        )}>
                          {days < 0 ? "Terlambat" : days === 0 ? "Hari Ini" : `${days} hari`}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── SECONDARY: Stat counters ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isLoading ? (
          [1,2,3,4].map(i => <SkeletonBlock key={i} className="h-24" />)
        ) : (
          <>
            <Link href="/pengumuman">
              <div className="glass-card p-4 hover:-translate-y-1 transition-all cursor-pointer group text-center">
                <Megaphone className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">{summary?.totalAnnouncements ?? 0}</div>
                <p className="text-xs text-gray-400 group-hover:text-rose-500 transition-colors">Pengumuman</p>
              </div>
            </Link>
            <Link href="/deadline">
              <div className="glass-card p-4 hover:-translate-y-1 transition-all cursor-pointer group text-center">
                <Calendar className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">{summary?.upcomingDeadlines ?? 0}</div>
                <p className="text-xs text-gray-400 group-hover:text-amber-500 transition-colors">Deadline</p>
              </div>
            </Link>
            <Link href="/masalah">
              <div className="glass-card p-4 hover:-translate-y-1 transition-all cursor-pointer group text-center">
                <AlertTriangle className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">{(summary?.openIssues ?? 0) + (summary?.openComplaints ?? 0)}</div>
                <p className="text-xs text-gray-400 group-hover:text-rose-500 transition-colors">Masalah</p>
              </div>
            </Link>
            <Link href="/our-work">
              <div className="glass-card p-4 hover:-translate-y-1 transition-all cursor-pointer group text-center">
                <CheckCircle2 className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">{summary?.ongoingPrograms ?? 0}</div>
                <p className="text-xs text-gray-400 group-hover:text-sky-500 transition-colors">Program Aktif</p>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* ── KAS RINGKASAN ─────────────────────────────────────────────────── */}
      <Link href="/kas">
        <div className="glass-card p-4 hover:-translate-y-0.5 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Wallet className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Kas Tim</span>
            </div>
            <span className="text-xs text-emerald-500 group-hover:text-emerald-700 font-medium transition-colors">Lihat Lengkap →</span>
          </div>
          {kasLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-2 bg-gray-100 rounded w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {/* Saldo umum */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Wallet className="w-3.5 h-3.5 text-sky-400" />
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Saldo Umum</p>
                </div>
                <p className={cn("font-bold text-sm", (kasSummary?.saldoUmum ?? 0) >= 0 ? "text-sky-700" : "text-amber-600")}>
                  {formatRp(kasSummary?.saldoUmum ?? 0)}
                </p>
              </div>
              {/* Dana darurat */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Dana Darurat</p>
                </div>
                <p className="font-bold text-sm text-rose-700">{formatRp(kasSummary?.saldoDarurat ?? 0)}</p>
                {(kasSummary?.emergencyFundTarget ?? 0) > 0 && (
                  <div className="mt-1">
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", kasSummary?.emergencyFundStatus === "sangat_cukup" ? "bg-emerald-400" : kasSummary?.emergencyFundStatus === "cukup" ? "bg-amber-400" : "bg-rose-400")}
                        style={{ width: `${Math.min(100, Math.round(((kasSummary?.saldoDarurat ?? 0) / (kasSummary?.emergencyFundTarget ?? 1)) * 100))}%` }}
                      />
                    </div>
                    <p className={cn("text-[10px] mt-0.5", kasSummary?.emergencyFundStatus === "sangat_cukup" ? "text-emerald-500" : kasSummary?.emergencyFundStatus === "cukup" ? "text-amber-500" : "text-rose-500")}>
                      {kasSummary?.emergencyFundStatus === "sangat_cukup" ? "Sangat Cukup ✓" : kasSummary?.emergencyFundStatus === "cukup" ? "Cukup" : "Perlu Penambahan"}
                    </p>
                  </div>
                )}
              </div>
              {/* Jatah makan harian */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Jatah/Hari</p>
                </div>
                <p className="font-bold text-sm text-amber-700">{formatRp(kasSummary?.dailyFoodAllowance ?? 0)}</p>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* ── TERTIARY: Hari ini + Quick nav ────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center">
              <ChefHat className="w-3 h-3 text-rose-500" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Masak Hari Ini</span>
          </div>
          {isLoading ? <SkeletonBlock className="h-4 w-3/4" /> :
            summary?.todayCooking && summary.todayCooking.length > 0
              ? <div className="flex flex-wrap gap-1.5">{summary.todayCooking.map((name) => (
                  <span key={name} className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r", getMemberColor(name))}>
                    {name}
                  </span>
                ))}</div>
              : <p className="text-sm text-gray-400 italic">Belum terjadwal</p>
          }
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
              <SprayCan className="w-3 h-3 text-sky-500" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Bersih Hari Ini</span>
          </div>
          {isLoading ? <SkeletonBlock className="h-4 w-3/4" /> :
            summary?.todayCleaning && summary.todayCleaning.length > 0
              ? <div className="flex flex-wrap gap-1.5">{summary.todayCleaning.map((name) => (
                  <span key={name} className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r", getMemberColor(name))}>
                    {name}
                  </span>
                ))}</div>
              : <p className="text-sm text-gray-400 italic">Belum terjadwal</p>
          }
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Package className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Total Inventaris</span>
          </div>
          {isLoading ? <SkeletonBlock className="h-6 w-1/4" /> :
            <p className="text-xl font-bold text-gray-800">
              {summary?.totalInventoryItems ?? 0}
              <span className="text-sm font-normal text-gray-400 ml-1">item</span>
            </p>
          }
        </div>
      </div>

      {/* ── Absensi Hari Ini ─────────────────────────────────────────────────── */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
              <CalendarCheck className="w-3 h-3 text-violet-500" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Absensi Hari Ini</span>
          </div>
          <Link href="/our-life">
            <span className="text-xs text-rose-400 hover:text-rose-600 cursor-pointer font-medium">Isi Absensi →</span>
          </Link>
        </div>
        {isLoading ? (
          <div className="flex gap-3">
            {[1,2,3,4].map(i => <SkeletonBlock key={i} className="h-12 w-24" />)}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Hadir", emoji: "✅", count: summary?.attendanceSummary?.hadir ?? 0, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { label: "Izin", emoji: "📋", count: summary?.attendanceSummary?.izin ?? 0, color: "bg-amber-50 text-amber-700 border-amber-200" },
              { label: "Sakit", emoji: "🤒", count: summary?.attendanceSummary?.sakit ?? 0, color: "bg-rose-50 text-rose-700 border-rose-200" },
              { label: "Alfa", emoji: "❓", count: summary?.attendanceSummary?.alfa ?? 0, color: "bg-gray-50 text-gray-600 border-gray-200" },
              { label: "Belum diisi", emoji: "—", count: 9 - ((summary?.presentToday ?? 0) + (summary?.absentToday ?? 0)), color: "bg-gray-50 text-gray-400 border-gray-100" },
            ].map(({ label, emoji, count, color }) => (
              <div key={label} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium", color)}>
                <span>{emoji}</span>
                <span>{label}</span>
                <span className="font-bold text-base leading-none">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tim Putatsari Wellness — 3x3 Grid ───────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-100 to-sky-100 flex items-center justify-center">
            <span className="text-sm">👥</span>
          </div>
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Tim Putatsari Wellness</h2>
          <span className="text-xs text-gray-400">{members?.length ?? 9} anggota</span>
        </div>
        {membersLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6,7,8,9].map(i => <SkeletonBlock key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {(members ?? []).map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
