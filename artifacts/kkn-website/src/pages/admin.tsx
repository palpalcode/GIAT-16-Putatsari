import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronDown } from "lucide-react";
import { TEAM_MEMBERS } from "@/lib/utils";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [, setLocation] = useLocation();
  const { isLoggedIn, refetch } = useAuth();
  const login = useAdminLogin();
  const { toast } = useToast();

  if (isLoggedIn) {
    setLocation("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) return;

    login.mutate({ data: { name, password } }, {
      onSuccess: (result) => {
        refetch();
        const displayName = result?.memberName ?? name;
        toast({ title: `Selamat datang, ${displayName}! 👋` });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Nama atau password salah", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
            Masuk ke Tim Putatsari Wellness
          </CardTitle>
          <CardDescription className="text-gray-600">
            Pilih nama kamu dan masukkan password untuk masuk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nama Anggota</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-white/50 bg-white border-violet-200/50 text-sm focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-300"
                >
                  <span className={name ? "text-gray-900" : "text-gray-400"}>
                    {name || "Pilih nama kamu..."}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white/90 backdrop-blur-sm border border-white/60 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {TEAM_MEMBERS.map((member) => (
                      <button
                        key={member}
                        type="button"
                        onClick={() => { setName(member); setShowDropdown(false); }}
                        className="w-full px-3 py-2.5 text-left text-sm hover:bg-rose-50 transition-colors first:rounded-t-md last:rounded-b-md"
                      >
                        {member}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-violet-200/50 border-white/50 focus:border-rose-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-400 to-sky-400 hover:from-rose-500 hover:to-sky-500 text-white border-0"
              disabled={login.isPending || !name || !password}
            >
              {login.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
