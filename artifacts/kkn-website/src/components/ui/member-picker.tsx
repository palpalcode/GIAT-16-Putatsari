import { cn, TEAM_MEMBERS } from "@/lib/utils";
import { User } from "lucide-react";

export const MEMBER_COLORS = [
  "from-rose-400 to-pink-400",
  "from-sky-400 to-blue-400",
  "from-violet-400 to-purple-400",
  "from-violet-400 to-violet-400",
  "from-emerald-400 to-teal-400",
  "from-fuchsia-400 to-pink-400",
  "from-cyan-400 to-sky-400",
  "from-lime-400 to-green-400",
  "from-indigo-400 to-violet-400",
];

export function getMemberColor(name: string) {
  const idx = TEAM_MEMBERS.indexOf(name);
  return MEMBER_COLORS[idx >= 0 ? idx : 0];
}

export function MemberPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(m: string) {
    onChange(selected.includes(m) ? selected.filter((x) => x !== m) : [...selected, m]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {TEAM_MEMBERS.map((m) => (
        <button
          key={m}
          onClick={() => toggle(m)}
          type="button"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border-2 transition-all",
            selected.includes(m)
              ? "bg-gradient-to-r " + getMemberColor(m) + " text-white border-transparent shadow-sm"
              : "bg-white/40 text-gray-600 border-white/40 hover:bg-white/60"
          )}
        >
          <div
            className={cn(
              "w-4 h-4 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[8px] font-bold shrink-0",
              selected.includes(m) ? "bg-white/30" : getMemberColor(m)
            )}
          >
            <User className="w-2.5 h-2.5" />
          </div>
          {m}
        </button>
      ))}
    </div>
  );
}
