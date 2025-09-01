"use client";
import { useEffect, useState } from "react";
import { getRankings } from "@/src/lib/api";
import { useI18n } from "../lib/i18n";
import { Difficulty, GameMode } from "../lib/types";


export default function SidebarRanking({
  mode,
  difficulty,
  limit = 5
}: { mode: GameMode; difficulty: Difficulty; limit?: number }) {
  const { t } = useI18n();
  const [rows, setRows] = useState<Array<{username:string; score:number; timeTaken:number}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getRankings({ mode, difficulty })
      .then(data => {
        if (!mounted) return;
        setRows((data.byScore || []).slice(0, limit));
      })
      .catch(() => mounted && setRows([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [mode, difficulty, limit]);

  return (
    <aside className="card p-3">
      <h2 className="font-semibold mb-1">Top {limit} {t("score")}</h2>

      {loading ? (
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">Sin datos todavía.</p>
      ) : (
        <ol className="space-y-1">
            {rows.map((r, i) => (
                <li
                key={i}
                className="flex items-center justify-between text-sm
                            border-b last:border-b-0
                            border-slate-200 dark:border-slate-700 py-1"
                >
                <span className="flex items-center gap-2">
                    <span
                    className="inline-flex w-6 h-6 items-center justify-center rounded-full
                                border border-slate-200 dark:border-slate-600
                                bg-slate-50 dark:bg-slate-700
                                text-xs text-slate-600 dark:text-slate-300"
                    >
                    {i + 1}
                    </span>
                    <span className="truncate max-w-[10rem] text-slate-800 dark:text-slate-200">
                    {r.username}
                    </span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{r.score}</span>
                </li>
            ))}
        </ol>
      )}
    </aside>
  );
}