// Definición de los distintos tipos personalizados que se utilizaran
export type GameMode = "click" | "drag";
export type Difficulty = "facil" | "medio" | "dificil";

export type ElementCategory =
  | "alkali"
  | "alkaline"
  | "transition"
  | "post-transition"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble"
  | "lanthanoid"
  | "actinoid"
  | "unknown";

export type ElementData = {
  atomicNumber: number;
  symbol: string;
  name: string;
  nameEN: string;
  group: number;   // 1..18
  period: number;  // 1..7 ; usamos 8 para lanthanoids y 9 para actinoids en la fila separada
  category: ElementCategory;
};

export type TableMask = {
  showName: boolean;
  showSymbol: boolean;
  showAtomicNumber: boolean;
};