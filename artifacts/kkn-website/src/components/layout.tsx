import React from "react";
import { Link, useLocation } from "wouter";
import { useAdminLogout } from "@workspace/api-client-react";
import { useAuth, ROLE_LABELS } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, ShieldCheck, UserCircle, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/our-life", label: "Our Life" },
  { href: "/our-work", label: "Our Work" },
  { href: "/kas", label: "Kas" },
  { href: "/notulensi", label: "Notulensi" },
  { href: "/pengumuman", label: "Pengumuman" },
  { href: "/deadline", label: "Deadline" },
  { href: "/masalah", label: "Masalah" },
  { href: "/tim", label: "About Us" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isLoggedIn, role, canManage, refetch } = useAuth();
  const logout = useAdminLogout();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href + "/");
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        refetch();
        toast({ title: "Berhasil logout" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-white relative flex flex-col">
      {/* Decorative Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-300/30 mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-sky-300/30 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] rounded-full bg-pink-300/30 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <header className="sticky top-0 z-50 w-full pt-4 px-4 pb-2">
        <div className="max-w-7xl mx-auto glass-card h-16 flex items-center justify-between px-6">
          <Link href="/" className="font-bold text-lg bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent shrink-0">
            Putatsari Wellness
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-white/50",
                  isActive(item.href)
                    ? "bg-white/80 text-rose-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {role && (
                  <span className="text-xs font-medium text-gray-500 px-2 py-1 rounded-full bg-white/60">
                    {ROLE_LABELS[role] ?? role}
                  </span>
                )}
                {canManage && (
                  <Link href="/kelola-akses">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-full text-xs",
                        isActive("/kelola-akses") && "bg-white/80 text-rose-600"
                      )}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                      Kelola Akses
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full text-xs"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Keluar
                </Button>
              </>
            ) : (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="rounded-full text-xs">
                  <UserCircle className="w-3.5 h-3.5 mr-1.5" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Nav */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-panel w-64 p-6 sm:max-w-sm flex flex-col h-full border-l-white/40">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-base bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
                  Putatsari Wellness
                </span>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
              </div>

              <nav className="flex flex-col gap-1 flex-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive(item.href)
                        ? "bg-white/80 text-rose-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-4 border-t border-white/30 space-y-2">
                {isLoggedIn ? (
                  <>
                    {role && (
                      <p className="text-xs text-gray-500 px-1">
                        Masuk sebagai <span className="font-semibold">{ROLE_LABELS[role] ?? role}</span>
                      </p>
                    )}
                    {canManage && (
                      <Link href="/kelola-akses" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start rounded-xl">
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Kelola Akses
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl text-rose-600"
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Keluar
                    </Button>
                  </>
                ) : (
                  <Link href="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start rounded-xl">
                      <UserCircle className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
