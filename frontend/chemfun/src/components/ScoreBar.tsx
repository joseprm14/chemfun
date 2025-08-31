"use client";
import { useI18n } from "../lib/i18n";

export function ScoreBar({ score, time }: { score: number; time: number }) {
  const { t } = useI18n();
  const mm = Math.floor(time / 60).toString().padStart(2, "0");
  const ss = (time % 60).toString().padStart(2, "0");
  return (
    <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="text-sm">
        <div className="font-semibold">{t("score")}</div>
        <div className="text-2xl">{score}</div>
      </div>
      <div className="text-sm">
        <div className="font-semibold">{t("time")}</div>
        <div className="text-2xl tabular-nums">{mm}:{ss}</div>
      </div>
    </div>
  );
}