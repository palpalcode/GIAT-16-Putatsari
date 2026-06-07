import { useState } from "react";
import { useLocation } from "wouter";
import { useGetAuthMe, useAdminLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { data: auth, refetch } = useGetAuthMe();
  const login = useAdminLogin();
  const { toast } = useToast();

  if (auth?.isAdmin) {
    setLocation("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    login.mutate({ data: { password } }, {
      onSuccess: () => {
        refetch();
        toast({ title: "Berhasil masuk sebagai admin" });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Password salah", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
          <CardDescription className="text-gray-600">
            Masuk untuk mengelola data Tim Putatsari Wellness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/50 border-white/50 focus:border-rose-300"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-400 to-sky-400 hover:from-rose-500 hover:to-sky-500 text-white border-0"
              disabled={login.isPending || !password}
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
