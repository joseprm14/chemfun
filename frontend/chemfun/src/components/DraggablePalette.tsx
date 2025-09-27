"use client";
import { ElementData, TableMask } from "../lib/types";
import { classNames } from "../lib/util";
import { useMemo } from "react";
import { useI18n } from "../lib/i18n";


export function DraggablePalette({ elements, disabled, mask, guessed }: { elements: ElementData[]; disabled?: boolean; mask: TableMask; guessed: Set<number>; }) {
  // Este componente corresponde a la paleta de elementos arrastrables para el modo de juego de arrastre
  const { t } = useI18n();

  function startDrag(e: React.DragEvent<HTMLDivElement>, atomicNumber: number){
    e.dataTransfer.setData("text/atomicNumber", String(atomicNumber));
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{t("dragTitle")}</h3>
      {/* Contenedor con scroll propio, independiente de la página */}
      <div className="max-h-64 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-900/40">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-[clamp(4px,0.6vw,10px)]">
          {elements.filter(el => !guessed.has(el.atomicNumber)).map((el) => (
          <div
            key={el.atomicNumber}
            draggable={!disabled}
            data-testid={`palette-${el.symbol}`}
            data-symbol={el.symbol}
            onDragStart={(e)=>startDrag(e, el.atomicNumber)}
            className={classNames(
            "w-full aspect-[5/4] min-w-0 rounded-md border flex flex-col items-center justify-center text-center",
            "transition hover:shadow-md bg-slate-100 dark:bg-slate-700/60 border-slate-300 dark:border-slate-600"
            )}
          >
            <div className="text-[clamp(12px,2.2vw,18px)] font-bold leading-none">{el.symbol}</div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
}