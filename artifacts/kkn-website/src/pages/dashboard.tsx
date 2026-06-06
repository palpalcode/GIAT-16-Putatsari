import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, ClipboardList, Megaphone, ChefHat, SprayCan, Package, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

function daysLeft(dueDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / 86400000);
}

function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-100 rounded w-1/4" />
    </div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Hero section */}
      <section className="text-center space-y-4 py-10">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 text-sm text-rose-600 font-medium mb-2">
          Kuliah Kerja Nyata
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Selamat Datang,{" "}
          <span className="bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
            Tim KKN 42
          </span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Bersama membangun desa dengan karya dan dedikasi. Semangat, tim!
        </p>
      </section>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
        ) : (
          <>
            <Link href="/pengumuman">
              <Card className="glass-card hover:-translate-y-1 transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 group-hover:text-rose-600 transition-colors">Pengumuman</CardTitle>
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <Megaphone className="h-4 w-4 text-rose-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{summary?.totalAnnouncements ?? 0}</div>
                  <p className="text-xs text-gray-400 mt-1">total</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/deadline">
              <Card className="glass-card hover:-translate-y-1 transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 group-hover:text-amber-600 transition-colors">Deadline</CardTitle>
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{summary?.upcomingDeadlines ?? 0}</div>
                  <p className="text-xs text-gray-400 mt-1">mendatang</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/proker">
              <Card className="glass-card hover:-translate-y-1 transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 group-hover:text-sky-600 transition-colors">Program Berjalan</CardTitle>
                  <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-sky-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{summary?.ongoingPrograms ?? 0}</div>
                  <p className="text-xs text-gray-400 mt-1">sedang berjalan</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/proker">
              <Card className="glass-card hover:-translate-y-1 transition-all cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 group-hover:text-rose-600 transition-colors">Masalah Terbuka</CardTitle>
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-rose-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{summary?.openIssues ?? 0}</div>
                  <p className="text-xs text-gray-400 mt-1">perlu perhatian</p>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      {/* Today's schedule */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center">
              <ChefHat className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Masak Hari Ini</h3>
          </div>
          {isLoading ? <div className="animate-pulse h-5 bg-gray-100 rounded w-3/4" /> :
            summary?.todayCooking ? (
              <p className="text-sm text-gray-700 font-medium">{summary.todayCooking}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Belum ada jadwal</p>
            )
          }
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center">
              <SprayCan className="w-3.5 h-3.5 text-sky-500" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Bersih-Bersih Hari Ini</h3>
          </div>
          {isLoading ? <div className="animate-pulse h-5 bg-gray-100 rounded w-3/4" /> :
            summary?.todayCleaning ? (
              <p className="text-sm text-gray-700 font-medium">{summary.todayCleaning}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Belum ada jadwal</p>
            )
          }
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Total Inventaris</h3>
          </div>
          {isLoading ? <div className="animate-pulse h-5 bg-gray-100 rounded w-1/4" /> :
            <p className="text-2xl font-bold text-gray-800">{summary?.totalInventoryItems ?? 0} <span className="text-sm font-normal text-gray-400">item</span></p>
          }
        </div>
      </div>

      {/* Recent announcements + urgent deadlines */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent announcements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-700">Pengumuman Terbaru</h2>
            <Link href="/pengumuman" className="text-sm text-rose-500 hover:text-rose-700 transition-colors">Lihat semua</Link>
          </div>
          {isLoading ? (
            [1, 2].map(i => <div key={i} className="glass-card h-20 animate-pulse" />)
          ) : !summary?.recentAnnouncements?.length ? (
            <div className="glass-card p-6 text-center text-gray-400 text-sm">Belum ada pengumuman.</div>
          ) : (
            summary.recentAnnouncements.map((a: any) => (
              <Link href="/pengumuman" key={a.id}>
                <div className="glass-card p-4 hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Badge className={cn("text-xs shrink-0 border mt-0.5", a.priority === "high" ? "bg-rose-100 text-rose-700 border-rose-200" : a.priority === "medium" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200")}>
                      {a.priority === "high" ? "Penting" : a.priority === "medium" ? "Sedang" : "Biasa"}
                    </Badge>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.content}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Urgent deadlines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-700">Deadline Mendesak</h2>
            <Link href="/deadline" className="text-sm text-sky-500 hover:text-sky-700 transition-colors">Lihat semua</Link>
          </div>
          {isLoading ? (
            [1, 2].map(i => <div key={i} className="glass-card h-20 animate-pulse" />)
          ) : !summary?.urgentDeadlines?.length ? (
            <div className="glass-card p-6 text-center text-gray-400 text-sm">Tidak ada deadline mendesak.</div>
          ) : (
            summary.urgentDeadlines.map((d: any) => {
              const days = daysLeft(d.dueDate);
              return (
                <Link href="/deadline" key={d.id}>
                  <div className={cn("glass-card p-4 hover:-translate-y-0.5 transition-all cursor-pointer", days <= 3 && "ring-2 ring-amber-200/60")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-gray-900 truncate">{d.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(d.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
                        </p>
                      </div>
                      <Badge className={cn("text-xs shrink-0 border", days <= 0 ? "bg-rose-200 text-rose-800 border-rose-300" : days <= 3 ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-sky-100 text-sky-700 border-sky-200")}>
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

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {[
          { href: "/tim", label: "Tim KKN", icon: "👥", color: "from-rose-400 to-pink-400" },
          { href: "/kehidupan", label: "Kehidupan", icon: "🏠", color: "from-sky-400 to-blue-400" },
          { href: "/proker", label: "Program Kerja", icon: "📋", color: "from-violet-400 to-purple-400" },
          { href: "/inventaris", label: "Inventaris", icon: "📦", color: "from-emerald-400 to-teal-400" },
        ].map(nav => (
          <Link key={nav.href} href={nav.href}>
            <div className="glass-card p-4 text-center hover:-translate-y-1 transition-all cursor-pointer group">
              <div className={cn("w-10 h-10 rounded-2xl bg-gradient-to-br mx-auto mb-2 flex items-center justify-center text-xl", nav.color)}>
                {nav.icon}
              </div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{nav.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
