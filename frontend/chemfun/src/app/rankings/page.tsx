"use client";
import { useEffect, useState } from "react";
import { getRankings } from "@/src/lib/api";
import BackButton from "@/src/components/BackButton";
import { useI18n } from "@/src/lib/i18n";
import { Difficulty, GameMode } from "../../lib/types";

export default function RankingsPage() {
  const { t } = useI18n();
  const [mode, setMode] = useState<GameMode>("click");
  const [difficulty, setDifficulty] = useState<Difficulty>("fácil");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ byScore: any[]; byTime: any[] }>({ byScore: [], byTime: [] });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getRankings({ mode, difficulty });
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo cargar el ranking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [mode, difficulty]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <BackButton />
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Rankings</h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {t("rankingDesc")}
            </p>
          </div>
          <div className="flex gap-2">
            <select
              className="border border-slate-300 dark:border-slate-600 rounded px-3 py-2
                         bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50"
              value={mode} onChange={e=>setMode(e.target.value as GameMode)}
            >
              <option value="click">{t("click")}</option>
              <option value="drag">{t("drag")}</option>
            </select>
            <select
              className="border border-slate-300 dark:border-slate-600 rounded px-3 py-2
                         bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50"
              value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}
            >
              <option value="fácil">{t("easy")}</option>
              <option value="medio">{t("medium")}</option>
              <option value="difícil">{t("hard")}</option>
            </select>
            <button
              onClick={fetchData}
              className="px-3 py-2 rounded border
                         border-slate-300 dark:border-slate-600
                         bg-white dark:bg-slate-800
                         text-slate-700 dark:text-slate-200
                         hover:bg-gray-50 dark:hover:bg-slate-700/50
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50"
            >
              {t("update")}
            </button>
          </div>
        </div>

        {loading && <div className="h-24 animate-pulse bg-gray-100 dark:bg-slate-700 rounded" />}
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="grid md:grid-cols-2 gap-6">
            <section className="border rounded-xl overflow-hidden dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 font-semibold
                              text-slate-900 dark:text-slate-100
                              border-b border-slate-200 dark:border-slate-700">
                {t("bestPer")}{t("score")}
              </div>
              <table className="w-full text-sm text-slate-800 dark:text-slate-200">
                <thead>
                  <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2 w-10 text-slate-700 dark:text-slate-300">#</th>
                    <th className="p-2 text-slate-700 dark:text-slate-300">{t("user")}</th>
                    <th className="p-2 text-right text-slate-700 dark:text-slate-300">{t("score")}</th>
                    <th className="p-2 text-right text-slate-700 dark:text-slate-300">{t("time")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byScore.length === 0 && (
                    <tr>
                      <td className="p-3 text-center text-gray-500 dark:text-slate-400" colSpan={4}>
                        Sin datos
                      </td>
                    </tr>
                  )}
                  {data.byScore.map((r, i) => (
                    <tr
                      key={`s-${i}`}
                      className="odd:bg-white even:bg-gray-50 odd:dark:bg-slate-900 even:dark:bg-slate-800
                                 border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="p-2">{i+1}</td>
                      <td className="p-2">{r.username}</td>
                      <td className="p-2 text-right">{r.score}</td>
                      <td className="p-2 text-right">{r.timeTaken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="border rounded-xl overflow-hidden dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 font-semibold
                              text-slate-900 dark:text-slate-100
                              border-b border-slate-200 dark:border-slate-700">
                {t("bestPer")}{t("time")}
              </div>
              <table className="w-full text-sm text-slate-800 dark:text-slate-200">
                <thead>
                  <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2 w-10 text-slate-700 dark:text-slate-300">#</th>
                    <th className="p-2 text-slate-700 dark:text-slate-300">{t("user")}</th>
                    <th className="p-2 text-right text-slate-700 dark:text-slate-300">{t("score")}</th>
                    <th className="p-2 text-right text-slate-700 dark:text-slate-300">{t("time")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byTime.length === 0 && (
                    <tr>
                      <td className="p-3 text-center text-gray-500 dark:text-slate-400" colSpan={4}>
                        Sin datos
                      </td>
                    </tr>
                  )}
                  {data.byTime.map((r, i) => (
                    <tr
                      key={`t-${i}`}
                      className="odd:bg-white even:bg-gray-50 odd:dark:bg-slate-900 even:dark:bg-slate-800
                                 border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="p-2">{i+1}</td>
                      <td className="p-2">{r.username}</td>
                      <td className="p-2 text-right">{r.score}</td>
                      <td className="p-2 text-right">{r.timeTaken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}