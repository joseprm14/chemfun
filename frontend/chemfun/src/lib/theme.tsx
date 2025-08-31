"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { getMe, updatePreferences } from "./api";


type Theme = "light" | "dark";


const ThemeCtx = createContext<{ theme: Theme; toggle: ()=>void }>({ 
    theme: "light", toggle: ()=>{} 
});


export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");

    // Al montar: intentar leer del usuario autenticado; si falla, recurrir a localStorage
    useEffect(() => {
        (async () => {
            try {
                const me = await getMe();
                if (me?.theme) {
                    setThemeState(me.theme as Theme);
                    localStorage.setItem("theme", me.theme);
                    return;
                }
            } catch {}
            const saved = localStorage.getItem("theme") as Theme | null;
            if (saved) setThemeState(saved);
        })();
    }, []);

    // Cada vez que cambie el tema, aplicarlo al <html> y guardarlo en localStorage
    const toggle = () => {
        const t = theme === "light" ? "dark" : "light"
        setThemeState(t);
        localStorage.setItem("theme", t);
        // Persistir si hay sesión (si no la hay, backend devolverá 401 y no pasa nada)
        updatePreferences({ theme: t }).catch(()=>{});
    }
    useEffect(()=>{
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    },[theme]);
    
    const value = useMemo(()=>({ theme, toggle }), [theme]);
    return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}


export function useTheme(){ return useContext(ThemeCtx); }