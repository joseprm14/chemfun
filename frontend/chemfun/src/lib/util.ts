import { useTheme } from "../lib/theme";

// Colección de funciones utiles que se utilizan a lo largo del codigo

export function classNames(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

export function pickRandom<T>(arr: T[]): T {
  // Elige un elemento aleatorio de un array
  return arr[Math.floor(Math.random() * arr.length)];
}

// Colores por categoría (Tailwind)
export function categoryBg(category: string) {
  switch (category) {
    case "alkali": return "bg-red-300";
    case "alkaline": return "bg-orange-300";
    case "transition": return "bg-yellow-300";
    case "post-transition": return "bg-amber-300";
    case "metalloid": return "bg-lime-300";
    case "nonmetal": return "bg-emerald-300";
    case "halogen": return "bg-teal-300";
    case "noble": return "bg-sky-300";
    case "lanthanoid": return "bg-indigo-300";
    case "actinoid": return "bg-purple-300";
    default: return "bg-slate-300";
  }
}