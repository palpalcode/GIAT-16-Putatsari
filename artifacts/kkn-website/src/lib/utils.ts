import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), "EEEE, d MMMM yyyy", { locale: id })
  } catch (e) {
    return dateString
  }
}

export const TEAM_MEMBERS = [
  "Muhamad Naufal",
  "Fadhilah Apta Nur Safitri",
  "Lutfia Tri Rahmacahyani",
  "Navida Fitria",
  "Miftakhul Jannah",
  "Vrizcka Aullia Asmara",
  "Quro'atul A'ini",
  "Dewi Anita Sari",
  "Tiara Nuril Safitri"
]

export const MEMBER_COLORS = [
  "from-rose-400 to-pink-400",
  "from-sky-400 to-blue-400",
  "from-violet-400 to-purple-400",
  "from-amber-400 to-orange-400",
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

export const TEAM_ROLES: Record<string, string> = {
  "Muhamad Naufal": "Kormades",
  "Fadhilah Apta Nur Safitri": "Sekretaris",
  "Lutfia Tri Rahmacahyani": "Bendahara",
  "Navida Fitria": "Acara",
  "Miftakhul Jannah": "Acara",
  "Vrizcka Aullia Asmara": "Humas",
  "Quro'atul A'ini": "Humas",
  "Dewi Anita Sari": "PDD",
  "Tiara Nuril Safitri": "PDD"
}
