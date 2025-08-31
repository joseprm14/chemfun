"use client";
import { useState } from "react";
import { loginUser } from "@/src/lib/api";
import { useRouter } from "next/navigation";
import BackButton from "@/src/components/BackButton";
import Link from "next/link";
import { useI18n } from "@/src/lib/i18n";

export default function LoginPage() {
  const { t, setLocale } = useI18n();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user } = await loginUser({ username, password });
      // Aplicar preferencias del usuario
      if (user?.locale) setLocale(user.locale as any);
      if (user?.theme === 'dark') {
        // forzar modo oscuro si te interesa directamente aquí
        document.documentElement.classList.add('dark');
        localStorage.setItem("theme", "dark");
      } else if (user?.theme === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem("theme", "light");
      }
      router.replace("/");
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
        <BackButton />
        <div className="mt-6 card p-6">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{t("login")}</h1>

            {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <label className="label" htmlFor="username">{t("user")}</label>
            <input id="username" className="input" value={username} onChange={e=>setU(e.target.value)} autoComplete="username" />

            <label className="label" htmlFor="password">{t("password")}</label>
            <input id="password" type="password" className="input" value={password} onChange={e=>setP(e.target.value)} autoComplete="current-password" />

            <button className="btn btn-primary w-full" disabled={loading}>
                {loading ? "Entrando..." : t("enter")}
            </button>
            </form>

            <p className="mt-4 muted">
            {t("noAccount")}{" "}
            <Link href="/register" className="link">{t("register")}</Link>
            </p>
        </div>
    </div>
  );
}