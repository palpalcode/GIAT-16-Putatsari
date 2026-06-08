import { cn, TEAM_MEMBERS, getMemberColor } from "@/lib/utils";
import { User } from "lucide-react";

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
