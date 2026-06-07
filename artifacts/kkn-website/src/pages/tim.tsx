import { TEAM_MEMBERS, TEAM_ROLES } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TimPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Tim Putatsari Wellness</h1>
        <p className="text-gray-600">Berkenalan dengan anggota tim yang berdedikasi tinggi.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {TEAM_MEMBERS.map((member, i) => (
          <Card key={member} className="glass-card hover:-translate-y-1 transition-transform border-white/40 overflow-hidden group">
            <div className="h-24 bg-gradient-to-r from-rose-200 to-sky-200 group-hover:from-rose-300 group-hover:to-sky-300 transition-colors"></div>
            <CardContent className="pt-0 relative px-6 pb-6 text-center">
              <Avatar className="w-20 h-20 border-4 border-white absolute -top-10 left-1/2 -translate-x-1/2 shadow-sm bg-white text-rose-500 font-bold text-xl">
                <AvatarFallback>{member.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="pt-12">
                <h3 className="font-bold text-lg text-gray-900">{member}</h3>
                <p className="text-sky-600 font-medium text-sm mt-1 bg-sky-50 inline-block px-3 py-1 rounded-full border border-sky-100">{TEAM_ROLES[member]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
