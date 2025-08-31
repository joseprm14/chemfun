import { Difficulty, TableMask, GameMode} from "./types";

// Definimos que valores se muestran y ocultan segun la dificultad
export function buildTableMaskForDifficulty(d: Difficulty, m: GameMode): TableMask {
  switch (d) {
    case "facil":
      return { showName: (m=='click' ? false : true), showSymbol: (m=='click' ? true : false), showAtomicNumber: true };
    case "medio":
      return { showName: false, showSymbol: false, showAtomicNumber: true };
    case "dificil":
      return { showName: false, showSymbol: false, showAtomicNumber: false };
  }
}