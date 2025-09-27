// Definición de los distintos tipos personalizados que se utilizan en la aplicación

// Modo de juego y dificultad
export type GameMode = "click" | "drag";
export type Difficulty = "fácil" | "medio" | "difícil";

// Categorías de los elementos de la tabla periódica
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

// Parámetros de un elemento de la tabla periódica
export type ElementData = {
  atomicNumber: number;
  symbol: string;
  name: string;
  nameEN: string;
  group: number;   // 1..18
  period: number;  // 1..7 ; usamos 8 para lantanidos y 9 para actinidos en la fila separada
  category: ElementCategory;
};

// "Máscara" que define que partes de cada casilla de la tabla se ocultan o muestran
export type TableMask = {
  showName: boolean;
  showSymbol: boolean;
  showAtomicNumber: boolean;
};