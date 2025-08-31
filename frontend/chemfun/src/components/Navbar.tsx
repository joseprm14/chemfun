"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getMe, logoutUser } from "@/src/lib/api";
import { useRouter, usePathname } from "next/navigation";
import { useI18n } from "../lib/i18n";
import { useTheme } from "../lib/theme";


export default function Navbar(){
    const { locale, setLocale, t } = useI18n();
    const { theme, toggle } = useTheme();
    const [auth, setAuth] = useState<null | { username: string }>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        (async ()=>{
            try {
                const me = await getMe();
                setAuth({ username: me.username });
            } catch {
                setAuth(null);
            }
        })();
    }, [pathname]); // actualiza al cambiar de página

    const onLogout = async () => {
        await logoutUser();
        setAuth(null);
        router.replace("/login");
    };

    return (
        <header className="border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto flex items-center justify-between py-3 px-4">
                <Link className="font-semibold" href="/">{t("title")}</Link>
                <nav className="flex items-center gap-3">
                    <Link href="/rankings" className="nav-link">Rankings</Link>

                    <select
                        value={locale}
                        onChange={(e)=>setLocale(e.target.value as any)}
                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
                    >
                        <option value="es">ES</option>
                        <option value="en">EN</option>
                    </select>

                    <button onClick={toggle} className="btn btn-ghost" aria-label="theme toggle">
                        {theme === 'dark' ? '🌙' : '☀️'}
                    </button>

                    {auth ? (
                        <>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{auth.username}</span>
                        <button onClick={onLogout} className="nav-link">{t("logout")}</button>
                        </>
                    ) : (
                        <>
                        <Link href="/login" className="nav-link">{t("login")}</Link>
                        <Link href="/register" className="nav-link">{t("register")}</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}