// Helpers para hablar con el backend Node/Express.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

// ==== Token helpers ====
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}
export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}
export function isLoggedIn(): boolean {
  return !!getToken();
}

async function fetchWithAuth(input: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(input, {
    ...init,
    headers,
    // MUY IMPORTANTE: para que el refresh por cookie funcione
    credentials: 'include',
  });

  // Si expiró el access token, intentamos refrescarlo y repetimos 1 vez
  if (res.status === 401 && retry) {
    const ok = await tryRefresh();
    if (ok) {
      return fetchWithAuth(input, init, /* retry */ false);
    }
  }

  return res;
}

// Llama al endpoint de refresh; si va bien, guarda el nuevo access token
async function tryRefresh(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE_URL}/users/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!r.ok) return false;
    const data = await r.json(); // { token: string }
    if (data?.token) {
      setToken(data.token);
      return true;
    }
  } catch {}
  // si falla, limpiamos token
  clearToken();
  return false;
}

// ==== Endpoints ====
export async function registerUser(payload: { username: string; password: string; locale?: 'es'|'en'; theme?: 'light'|'dark' }) {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(msg || 'No se pudo registrar');
  }
  return res.json();
}

export async function loginUser(payload: { username: string; password: string }) {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    credentials: 'include', // para setear la cookie httpOnly del refresh
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(msg || 'Credenciales inválidos');
  }
  const data = await res.json() as {
    token: string;
    user: { id: string; username: string; locale: 'es'|'en'; theme: 'light'|'dark' };
  };
  setToken(data.token);
  return data;
}

export async function logoutUser() {
  if (!isLoggedIn) {
    // Si no se ha iniciado sesión, no hay autorización
    return null;
  }
  await fetchWithAuth(`${BASE_URL}/users/logout`, { method: 'POST' });
  clearToken();
}

// Perfil
export async function getMe() {
  if (!isLoggedIn) {
    // Si no se ha iniciado sesión, no hay autorización
    return null;
  }
  const res = await fetchWithAuth(`${BASE_URL}/users/me`, { method: 'GET' });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(msg || 'No se pudo obtener el usuario');
  }
  return res.json() as Promise<{ id:string; username:string; locale:'es'|'en'; theme:'light'|'dark' }>;
}

export async function updatePreferences(payload: Partial<{ locale: 'es'|'en'; theme: 'light'|'dark' }>) {
  if (!isLoggedIn) {
    // Si no se ha iniciado sesión, no hay autorización
    return null;
  }
  const res = await fetchWithAuth(`${BASE_URL}/users/me/preferences`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(msg || 'No se pudieron actualizar las preferencias');
  }
  return res.json() as Promise<{ id:string; username:string; locale:'es'|'en'; theme:'light'|'dark' }>;
}

// Juego
export async function saveGameSession(payload: { mode: "click" | "drag"; difficulty: "fácil" | "medio" | "difícil"; score: number; timeTaken: number; }) {
  if (!isLoggedIn) {
    // Si no se ha iniciado sesión, no hay autorización
    return null;
  }
  const res = await fetchWithAuth(`${BASE_URL}/game/save`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await safeMsg(res) || "No se pudo guardar la sesión");
  return res.json();
}

export async function getRankings(params: { mode: "click" | "drag"; difficulty: "fácil" | "medio" | "difícil" }) {
  const res = await fetch(`${BASE_URL}/rankings/${params.mode}/${params.difficulty}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // opcional, no hace daño
  });
  if (!res.ok) throw new Error(await safeMsg(res) || "No se pudo obtener el ranking");
  return res.json() as Promise<{ byScore: Array<{username:string;score:number;timeTaken:number}>; byTime: Array<{username:string;score:number;timeTaken:number}> }>;
}

// Util
async function safeMsg(res: Response) {
  try { const j = await res.json(); return (j?.error || j?.message) as string | undefined; }
  catch { return res.statusText; }
}
