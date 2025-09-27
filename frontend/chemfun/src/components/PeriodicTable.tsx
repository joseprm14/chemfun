"use client";
import { elements } from "../data/elements";
import { useI18n } from "../lib/i18n";
import { TableMask } from "../lib/types";
import { categoryBg, classNames } from "../lib/util";
import { motion } from "framer-motion";
import { useMemo } from "react";

type Props = {
  mask: TableMask;
  preview?: boolean;
  onCellClick: (atomicNumber: number) => void;
  onCellDrop: (cellAtomicNumber: number, draggedAtomicNumber: number) => void;
  enableDrop?: boolean;
  highlightAtomicNumber: number | null;
  guessed: Set<number>;
};

export function PeriodicTable({
  mask,
  preview = false,
  onCellClick,
  onCellDrop,
  enableDrop = false,
  highlightAtomicNumber,
  guessed
}: Props) {
  // Componente que genera el tablero de juego de la tabla periódica

  const { t } = useI18n();

  // Mapa rápido por (period,group) -> elemento
  const byCoord = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of elements) {
      map.set(`${e.period}:${e.group}`, e.atomicNumber);
    }
    return map;
  }, []);

  // Mapa rápido por número atómico ya que se estaban realizando demasiadas busquedas
  const byAtomic = useMemo(() => {
    const m = new Map<number, typeof elements[number]>();
    for (const e of elements) m.set(e.atomicNumber, e);
    return m;
  }, []);

  const rows = [1,2,3,4,5,6,7];
  const groups = Array.from({length:18}, (_,i)=>i+1);

  function handleDrop(ev: React.DragEvent<HTMLDivElement>, atomicNumber: number) {
    const payload = ev.dataTransfer.getData("text/atomicNumber");
    if (!payload) return;
    onCellDrop(atomicNumber, parseInt(payload, 10));
  }

  function cellContent(atomicNumber?: number) {
    // Esta función decide que información se muestra para cada celda
    if (!atomicNumber) return null;
    const e = byAtomic.get(atomicNumber)!;
    return (
      <>
        {(mask.showAtomicNumber || guessed.has(atomicNumber)) ? (
          <div className="text-[10px] opacity-70">{e.atomicNumber}</div>
        ) : (
          <div className="text-[10px] text-transparent opacity-70">-</div>
        )}
        {(mask.showSymbol || guessed.has(atomicNumber)) ? (
          <div className="text-[clamp(11px,1.8vw,14px)] font-bold leading-none">{e.symbol}</div>
        ) : (
          <div className="text-[clamp(11px,1.8vw,14px)] text-transparent leading-none">-</div>
        )}
        {(mask.showName || guessed.has(atomicNumber)) ? (
          <div className="text-[10px] truncate">{t("element")==="nameEN" ? e.nameEN : e.name}</div>
        ) : (
          <div className="text-[10px] text-transparent truncate">-</div>
        )}
      </>
    );
  }

  function cellClass(atomicNumber?: number) {
    // Función que obtiene el color de fondo de cada celda
    if (!atomicNumber) return "bg-transparent";
    const e = byAtomic.get(atomicNumber)!;
    return categoryBg(e.category);
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Tabla principal */}
      <div className="grid w-full max-w-[min(95vw,1200px)] [grid-template-columns:repeat(18,minmax(0,1fr))] gap-1 p-2">
        {rows.map(period => (
          groups.map(group => {
            const atomicNumber = byCoord.get(`${period}:${group}`);
            const isEmpty = !atomicNumber;
            const isHighlight = highlightAtomicNumber === atomicNumber;
            return (
              <motion.div
                key={`${period}-${group}`}
                data-testid={atomicNumber ? `cell-${byAtomic.get(atomicNumber)?.symbol}` : null}
                data-symbol={atomicNumber ? byAtomic.get(atomicNumber)?.symbol : null}
                whileHover={{ scale: isEmpty ? 1 : 1.05 }}
                className={classNames(
                  "relative w-full aspect-[5/4] min-w-0 rounded-md border text-center flex flex-col items-center justify-center select-none transition-transform p-1",
                  isEmpty ? "invisible" : (guessed.has(atomicNumber!) ? "border-2 border-black" : "border-slate-200"),
                  !isEmpty && cellClass(atomicNumber),
                  !isEmpty && "hover:shadow-md"
                )}
                onClick={() => !isEmpty && onCellClick(atomicNumber!)}
                onDragOver={(e) => { if (enableDrop && !isEmpty) e.preventDefault(); }}
                onDrop={(e) => { if (enableDrop && !isEmpty) { e.preventDefault(); handleDrop(e, atomicNumber!); }}}
              >
                {!isEmpty && (
                  <div className={classNames(
                    "absolute inset-0 rounded-md",
                    isHighlight ? "ring-2 ring-indigo-500" : ""
                  )} />
                )}
                <div className="relative z-10 px-1 text-black">{!isEmpty && cellContent(atomicNumber)}</div>
              </motion.div>
            );
          })
        ))}
      </div>

      {/* Separador */}
      <div className="h-4" />

      {/* Lantánidos */}
      <div className="grid w-full max-w-[min(95vw,1200px)] [grid-template-columns:repeat(18,minmax(0,1fr))] gap-1 p-2">
        <div className="col-span-3" />
        {elements.filter(e => e.category === "lanthanoid" && e.name !== "Lantano").map(e => (
          <motion.div
            key={e.atomicNumber}
            data-testid={`cell-${e.symbol}`}
            data-symbol={e.symbol}
            whileHover={{ scale: 1.05 }}
            className={classNames(
              "relative w-full aspect-[5/4] min-w-0 rounded-md border text-center flex flex-col items-center justify-center select-none transition-transform",
              cellClass(e.atomicNumber),
              "hover:shadow-md",
              (guessed.has(e.atomicNumber!) ? "border-2 border-black" : "border-slate-200")
            )}
            onClick={() => onCellClick(e.atomicNumber)}
            onDragOver={(ev) => { if (enableDrop) ev.preventDefault(); }}
            onDrop={(ev) => { if (enableDrop) { ev.preventDefault(); handleDrop(ev, e.atomicNumber); } }}
          >
            <div className="relative z-10 px-1 text-black">{cellContent(e.atomicNumber)}</div>
          </motion.div>
        ))}
      </div>

      {/* Actínidos */}
      <div className="grid w-full max-w-[min(95vw,1200px)] [grid-template-columns:repeat(18,minmax(0,1fr))] gap-1 p-2">
        <div className="col-span-3" />
        {elements.filter(e => (e.category === "actinoid" && e.name !== "Actinio")).map(e => (
          <motion.div
            key={e.atomicNumber}
            role="gridcell"
            data-testid={`cell-${e.symbol}`}
            data-symbol={e.symbol}
            whileHover={{ scale: 1.05 }}
            className={classNames(
              "relative w-full aspect-[5/4] min-w-0 rounded-md border text-center flex flex-col items-center justify-center select-none transition-transform",
              cellClass(e.atomicNumber),
              "hover:shadow-md",
              (guessed.has(e.atomicNumber!) ? "border-2 border-black" : "border-slate-200")
            )}
            onClick={() => onCellClick(e.atomicNumber)}
            onDragOver={(ev) => { if (enableDrop) ev.preventDefault(); }}
            onDrop={(ev) => { if (enableDrop) { ev.preventDefault(); handleDrop(ev, e.atomicNumber); } }}
          >
            <div className="relative z-10 px-1 text-black">{cellContent(e.atomicNumber)}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}