"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModeSelectors } from "../components/ModeSelectors";
import { ScoreBar } from "../components/ScoreBar";
import { PeriodicTable } from "../components/PeriodicTable";
import { DraggablePalette } from "../components/DraggablePalette";
import { Difficulty, GameMode, TableMask, ElementData } from "../lib/types";
import { buildTableMaskForDifficulty } from "../lib/difficulty";
import { elements } from "../data/elements";
import { pickRandom } from "../lib/util";
import { saveGameSession, isLoggedIn } from "../lib/api";
import { useI18n } from "../lib/i18n";
import SidebarRanking from "@/src/components/SidebarRanking";


export default function MainPage() {
  const { t } = useI18n();
  const [mode, setMode] = useState<GameMode>("click");
  const [difficulty, setDifficulty] = useState<Difficulty>("fácil");
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [target, setTarget] = useState<ElementData | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [mask, setMask] = useState<TableMask>(() => buildTableMaskForDifficulty("fácil", "click"));
  const [feedback, setFeedback] = useState<"ok"|"fail"|null>(null);
  const [guessed, setGuessed] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [locked, setLocked] = useState(false);

  // Construye máscara (qué mostrar en las casillas) según dificultad y modo
  useEffect(() => { setMask(buildTableMaskForDifficulty(difficulty, mode)); }, [difficulty, mode]);
  
  // Elementos aún no acertados
  const remaining = useMemo(
    () => elements.filter(e => !guessed.has(e.atomicNumber)),
    [guessed]
  );

  // Elige el siguiente objetivo de forma aleatoria (evitando repetir el actual si hay alternativas)
  const pickNextTarget = useCallback((avoid?: number | null) => {
    if (remaining.length === 1) return remaining[0];

    // Si hay más de uno evita 'avoid' si se puede
    const pool = avoid == null ? remaining : remaining.filter(e => e.atomicNumber !== avoid);
    const choice = pool[Math.floor(Math.random() * pool.length)];
    return choice;
  }, [guessed]);

  const handleSkip = () => {
    setTarget(pickNextTarget(target?.atomicNumber));
  }

  // Cuando arranca, bloquea selectores y arranca cronómetro
  const startGame = () => {
    if (started && paused){ setPaused(false); return; }
    setStarted(true);
    setLocked(true);
    if (mode === "click") {
      const e = pickRandom(elements);
      setTarget(e);
    }
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
  };

  // pausar
  function pauseGame(){ 
    setPaused(true); 
    if (timerRef.current) { 
      clearInterval(timerRef.current); 
      timerRef.current = null; 
    } 
  }
  // reanudar
  function resumeGame(){ 
    if (!started) return; 
    if (!timerRef.current) timerRef.current = setInterval(()=> setTime(t=>t+1), 1000); 
    setPaused(false); 
  }
  // reiniciar (NO guarda ni muestra popup)
  function restartGame(){ 
    if (timerRef.current) clearInterval(timerRef.current); 
    resetGame();
  }

  const stopGame = async () => {
    timerRef.current && clearInterval(timerRef.current);
    // Guardar sesión en tu backend (ajusta URL y auth según tu app)
    setShowMessage(true);
    try {
      if (isLoggedIn()) {
        await saveGameSession({
          difficulty,
          mode,
          score,
          timeTaken: time
        });
      }
    } catch (e) {
      console.log(e)
    }
  };

  const resetGame = () => {
    setStarted(false);
    setLocked(false);
    setPaused(false);
    setScore(0);
    setTime(0);
    setTarget(null);
    setGuessed(new Set());
    setMistakes(0);
    setShowMessage(false);
  }

  useEffect(() => {
    if (remaining.length === 0 && started) {
      stopGame();
    }
  }, [remaining]);

  // Manejadores de juego
  const handleClickCell = (atomicNumber: number) => {
    if (!started || paused || mode !== "click" || !target || guessed.has(atomicNumber)) return;
    const correct = elements.find(e => e.atomicNumber === atomicNumber)?.name === target.name;
    if (correct) {
      setGuessed(prev => new Set(prev).add(atomicNumber));
      setScore((s) => s + 1);
      setFeedback("ok");
      // nuevo objetivo si quedan elementos
      if (remaining.length !== 0) {
        const e = pickNextTarget(target.atomicNumber);
        setTarget(e);
      }
    } else {
      setFeedback("fail");
      setScore((s) => Math.max(0, s - 1));
      setMistakes((s) => s + 1);
    }
    setTimeout(() => setFeedback(null), 300);
  };

  const handleDropOnCell = (atomicNumber: number, droppedAtomicNumber: number) => {
    if (!started || paused || mode !== "drag" || guessed.has(atomicNumber)) return;
    const correct = atomicNumber === droppedAtomicNumber;
    if (correct) {
      setGuessed(prev => new Set(prev).add(atomicNumber));
      setScore((s) => s + 1);
      setFeedback("ok");
    } else {
      setFeedback("fail");
      setScore((s) => Math.max(0, s - 1));
      setMistakes((s) => s + 1);
    }
    setTimeout(() => setFeedback(null), 250);
  };

  const draggablePool = useMemo(() => {
    if (mode !== "drag") return [];
    // Para drag: baraja todos los elementos
    return [...elements].sort(() => Math.random() - 0.5);
  }, [mode, guessed]);

  return (
    <div className="grid md:grid-cols-[320px,1fr] gap-4">
      <section className="card p-4 h-fit sticky md:top-24">
        <ModeSelectors
          mode={mode}
          setMode={locked ? undefined : setMode}
          difficulty={difficulty}
          setDifficulty={locked ? undefined : setDifficulty}
        />
        <div className="mt-4 flex gap-2">
          {!started ? (
            <button className="btn btn-primary w-full" onClick={startGame}>
              {t("start")}
            </button>
          ) : (
            <div className="flex gap-2">
                {!paused ? (
                  <button className="btn btn-ghost" onClick={pauseGame}>{t("pause")}</button>
                  ) : (
                  <button className="btn btn-ghost" onClick={resumeGame}>{t("resume")}</button>
                )}
                <button className="btn btn-ghost" onClick={restartGame}>{t("restart")}</button>
              </div>
          )}
        </div>
        <ScoreBar score={score} time={time} />
      </section>

      <section className="card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{t("board")}</h2>
            <p className="text-sm text-slate-500">
              {mode === "click"
                ? t("descriptionClick")
                : t("descriptionDrag")}
            </p>
          </div>
          <AnimatePresence>
            {feedback && (
              <motion.div
                key={feedback}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`pill px-4 py-2 text-lg font-bold rounded-md shadow-md ${feedback === "ok" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"}`}
              >
                {feedback === "ok" ? "✔ Acierto" : "✖ Fallo"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {mode === "click" && (
          <div className="mt-4">
            <div className="text-2xl font-bold" 
              data-testid="target"
              data-target-symbol={target?.symbol ?? ''}
            >
              {started ? (t("element")==="nameEN" ? target?.nameEN : target?.name) : "—"}
            </div>
            <button
              className="px-3 py-1.5 rounded-md border hover:bg-slate-50"
              onClick={handleSkip}
              disabled={remaining.length < 1}
              aria-label="Saltar a otro elemento no acertado"
              title="Saltar (S o →)"
            >
              {t("skip")}
            </button>
          </div>
        )}

        <div className="mt-4">
          <div className={"relative transition " + (paused ? "paused-blur" : "")}>
            <div className={feedback === "ok" ? "animate-pop" : feedback === "fail" ? "animate-shake" : ""}></div>
            <PeriodicTable
              mask={mask}
              preview={false}
              onCellClick={handleClickCell}
              onCellDrop={handleDropOnCell}
              highlightAtomicNumber={null}
              enableDrop={mode === "drag"}
              guessed={guessed}
            />
          </div>
        </div>

        {mode === "drag" && (
          <div className="mt-6">
            <DraggablePalette
              elements={draggablePool}
              disabled={!started}
              mask={mask}
              guessed={guessed}
            />
          </div>
        )}
      </section>

      {/* Barra lateral con mini ranking */}
      <div className="lg:col-span-4">
        <SidebarRanking mode={mode} difficulty={difficulty} />
      </div>

      {showMessage && (<div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gameover-title"
        className="fixed inset-0 z-50 grid place-items-center"
      >
        <div className="absolute inset-0 bg-black/50" onClick={resetGame} />
        <div className="relative z-10 w-[min(90vw,720px)] max-h-[90vh] overflow-auto rounded-2xl bg-white p-6 shadow-xl">
          <h2 id="gameover-title" className="text-2xl font-bold mb-2">{t("youDidIt")}</h2>
          <ScoreBar score={score} time={time} />
          <p className="text-sm text-slate-600 mb-4">
            {t("mistakes")}: <span className="font-semibold">{mistakes}</span>
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-md border hover:bg-slate-50"
              onClick={resetGame}
              autoFocus
            >
              {t("ok")}
            </button>
          </div>
        </div>
      </div>)}
      {showMessage && (
        <div role="status" data-testid="game-finished">Partida completada</div>
      )}
    </div>
  );
}