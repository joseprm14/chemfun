"use client";
import { useState } from "react";
import { registerUser, loginUser } from "@/src/lib/api";
import { useRouter } from "next/navigation";
import BackButton from "@/src/components/BackButton";
import Link from "next/link";
import { useI18n } from "@/src/lib/i18n";

// Condicion para las contraseñas
const strongEnough = (pwd: string) =>
  /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd) && pwd.length >= 8;


export default function RegisterPage() {
  const { t, locale, setLocale } = useI18n();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strongEnough(password)) {
      setError("La contraseña debe tener 8+ caracteres, mayúscula, minúscula, número y carácter especial.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await registerUser({ username, password });
      await loginUser({ username, password });
      router.replace("/");
    } catch (err: any) {
      setError(err?.message ?? "No se pudo registrar");
    } finally {
        setLoading(false);
    }
  };

  return (
    
    <div className="mx-auto max-w-md px-4 py-8">
      <BackButton />
      <div className="mt-6 card p-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{t("register")}</h1>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label className="label" htmlFor="username">{t("user")}</label>
          <input id="username" className="input" value={username} onChange={e=>setU(e.target.value)} autoComplete="username" />

          <label className="label" htmlFor="password">{t("password")}</label>
          <input id="password" type="password" className="input" value={password} onChange={e=>setP(e.target.value)} autoComplete="password" />

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Debe incluir: minúscula, mayúscula, número y carácter especial.
          </div>

          <button
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Creando..." : t("register")}
          </button>
        </form>

        <p className="mt-4 muted">
          {t("alreadyAccount")}{" "}
          <Link href="/login" className="link">{t("login")}</Link>
        </p>
      </div>
    </div>
  );
}