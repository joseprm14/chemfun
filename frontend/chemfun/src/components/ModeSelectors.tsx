"use client";
import { Difficulty, GameMode } from "../lib/types";
import { useI18n } from "../lib/i18n";


export function ModeSelectors({ mode, setMode, difficulty, setDifficulty }: { mode: GameMode; setMode?: (m: GameMode) => void; difficulty: Difficulty; setDifficulty?: (d: Difficulty) => void; }) {
  const { t } = useI18n();
  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("mode")}</label>
          <div className="grid grid-cols-2 gap-2">
            {(["click", "drag"] as GameMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode?.(m)}
                disabled={!setMode}
                className={`btn ${mode === m ? "btn-primary" : "btn-ghost"} ${!setMode ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {m==="click"? t("click") : t("drag")}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("difficulty")}</label>
          <div className="grid grid-cols-3 gap-2">
            {(["facil", "medio", "dificil"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty?.(d)}
                disabled={!setDifficulty}
                className={`btn ${difficulty === d ? "btn-primary" : "btn-ghost"} ${!setDifficulty ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {d==="facil"? t("easy") : d==="medio"? t("medium") : t("hard")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}