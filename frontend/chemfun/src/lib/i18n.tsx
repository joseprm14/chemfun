"use client";
import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { getMe, updatePreferences } from "./api";


type Locale = "es" | "en";


type Dict = Record<string, { es: string; en: string }>


const dict: Dict = {
    title: { es: "🧪 ChemFun", en: "🧪 ChemFun" },
    start: { es: "Iniciar partida", en: "Start game" },
    pause: { es: "Pausar", en: "Pause" },
    resume: { es: "Reanudar", en: "Resume" },
    restart: { es: "Reiniciar", en: "Restart" },
    dragTitle: { es: "Elementos para arrastrar", en: "Draggable elements" },
    score: { es: "Puntuación", en: "Score" },
    time: { es: "Tiempo", en: "Time" },
    mode: { es: "Modo", en: "Mode" },
    difficulty: { es: "Dificultad", en: "Difficulty" },
    click: { es: "Click", en: "Click" },
    drag: { es: "Arrastrar", en: "Drag" },
    easy: { es: "Fácil", en: "Easy" },
    medium: { es: "Medio", en: "Medium" },
    hard: { es: "Difícil", en: "Hard" },
    youDidIt: { es: "¡Lo has conseguido!", en: "You did it!" },
    allGuessed: { es: "Has adivinado todos los elementos.", en: "You guessed all the elements." },
    mistakes: { es: "Fallos", en: "Mistakes" },
    ok: { es: "Aceptar", en: "OK" },
    skip: { es: "Saltar", en: "Skip" },
    element: { es: "name", en: "nameEN" },
    board: { es: "Tablero", en: "Board" },
    descriptionClick: { es: "Haz clic en la casilla correcta para el elemento solicitado.", en: "Click the correct location for the element" },
    descriptionDrag: { es: "Arrastra cada elemento a su posición correcta.", en: "Drag each element to its correct location" },
    login: {es: "Iniciar sesión", en: "Login"},
    register: {es: "Registrarse", en: "Register"},
    logout: {es: "Cerrar sesión", en: "Logout"},
    user: {es: "Usuario", en: "User"},
    password: {es: "Contraseña", en: "Password"},
    enter: {es: "Entrar", en: "Enter"},
    noAccount: {es: "¿No tienes cuenta?", en: "You don't have an account?"},
    alreadyAccount: {es: "¿Ya tienes cuenta?", en: "You already have an account?"},
    back: {es: "Volver", en: "Back"},
    rankingDesc: {es: "Consulta mejores puntuaciones y tiempos por modo y dificultad.", en: "Check best scores and times per mode and dificulty"},
    update: {es: "Actualizar", en: "Update"},
    bestPer: {es: "Mejores por ", en: "Best per "},
};


const I18nCtx = createContext<{ locale: Locale; setLocale: (l:Locale)=>void; t:(k:keyof typeof dict)=>string }>({
    locale: "es",
    setLocale: ()=>{},
    t: ()=>"",
});


export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("es");

    // Al montar: intentar leer del usuario autenticado; si falla, recurrir a localStorage
    useEffect(() => {
        (async () => {
            try {
                const me = await getMe();
                if (me?.locale) {
                setLocaleState(me.locale);
                localStorage.setItem("locale", me.locale);
                return;
                }
            } catch {}
            const saved = localStorage.getItem("locale") as Locale | null;
            if (saved) setLocaleState(saved);
        })();
    }, []);

    // Guardar idioma cuando cambie
    const setLocale = (l: Locale) => {
        setLocaleState(l);
        localStorage.setItem("locale", l);
        // Persistir si hay sesión (si no la hay, backend devolverá 401 y no pasa nada)
        updatePreferences({ locale: l }).catch(()=>{});
    };
    
    const t = (k: keyof typeof dict) => (dict[k][locale] ?? dict[k].es);
    const value = useMemo(()=>({ locale, setLocale, t }), [locale]);
    return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}


export function useI18n() { return useContext(I18nCtx); }