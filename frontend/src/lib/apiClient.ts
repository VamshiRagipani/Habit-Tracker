import { supabase } from "./supabaseClient";

const DEFAULT_LOCAL_API_URL = "http://localhost:4000";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiBaseUrls(): string[] {
  const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  const candidates = [configured, ...(import.meta.env.DEV ? [DEFAULT_LOCAL_API_URL] : [])].filter(
    (value): value is string => Boolean(value)
  );
  return [...new Set(candidates)];
}

/**
 * Render's free tier spins the backend down after 15 min idle, so the first
 * request after a quiet spell can take 20-50s to wake it up. We retry a
 * couple of times with backoff instead of surfacing that as an error.
 */
async function authedFetch(path: string, options: RequestInit = {}, attempt = 0): Promise<any> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const baseUrls = getApiBaseUrls();
  let lastError: Error | null = null;

  for (const baseUrl of baseUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);
      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
      clearTimeout(timeout);

      if (res.status >= 500 && attempt < 2) {
        await sleep(1500 * (attempt + 1));
        return authedFetch(path, options, attempt + 1);
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      if (res.status === 204) return null;
      return res.json();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Request failed");
    }
  }

  if (attempt < 2) {
    await sleep(1500 * (attempt + 1));
    return authedFetch(path, options, attempt + 1);
  }

  throw new Error(
    lastError?.message || "Can't reach the server. It may be waking up from sleep — try again in a few seconds."
  );
}

export const api = {
  // Dashboard / History / Streaks (aggregated reads)
  getDashboard: () => authedFetch("/api/dashboard"),
  getHistory: (days = 7) => authedFetch(`/api/history?days=${days}`),
  getStreaks: () => authedFetch("/api/streaks"),

  // Habits (CRUD)
  getHabits: () => authedFetch("/api/habits"),
  createHabit: (payload: {
    habit_key: string;
    icon?: string;
    label: string;
    detail?: string;
    phase?: number;
    sort_order?: number;
  }) =>
    authedFetch("/api/habits", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateHabit: (id: string, payload: Record<string, unknown>) =>
    authedFetch(`/api/habits/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteHabit: (id: string) => authedFetch(`/api/habits/${id}`, { method: "DELETE" }),

  // Daily habit logs (CRUD via toggle + range read)
  getLogsRange: (start: string, end: string) => authedFetch(`/api/logs?start=${start}&end=${end}`),
  toggleLog: (habitId: string, logDate: string) =>
    authedFetch("/api/logs/toggle", {
      method: "POST",
      body: JSON.stringify({ habit_id: habitId, log_date: logDate }),
    }),

  // Reflections (CRUD)
  getReflections: (page = 1, limit = 10) => authedFetch(`/api/reflections?page=${page}&limit=${limit}`),
  saveReflection: (logDate: string, body: string) =>
    authedFetch("/api/reflections", {
      method: "POST",
      body: JSON.stringify({ log_date: logDate, body }),
    }),
  deleteReflection: (id: string) => authedFetch(`/api/reflections/${id}`, { method: "DELETE" }),

  // Profile
  getProfile: () => authedFetch("/api/profile"),
  updateProfile: (displayName: string) =>
    authedFetch("/api/profile", {
      method: "PUT",
      body: JSON.stringify({ display_name: displayName }),
    }),
};
