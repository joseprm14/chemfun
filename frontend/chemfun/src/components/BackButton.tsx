"use client";
import { useRouter } from "next/navigation";
import { useI18n } from "../lib/i18n";

export default function BackButton({ label = "Volver" }: { label?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  label = t("back");
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
             border border-slate-300 dark:border-slate-600
             text-sm bg-white dark:bg-slate-800
             text-slate-700 dark:text-slate-200
             hover:bg-slate-100 dark:hover:bg-slate-700/50"
      type="button"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {label}
    </button>
  );
}