import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";
import Header from "./ui/Header";
import DayEndTimer from "./ui/DayEndTimer";
import WeekBanner from "./ui/WeekBanner";
import NavTabs, { ViewKey } from "./ui/NavTabs";
import HabitCard from "./ui/HabitCard";
import ReflectionPanel from "./ui/ReflectionPanel";
import HistoryView from "./ui/HistoryView";
import PlanView from "./ui/PlanView";
import ProgressRing from "./ui/ProgressRing";
import Toast from "./ui/Toast";
import DashboardSkeleton from "./ui/Skeleton";

function buildFallbackDashboard() {
  return {
    habits: [
      { id: "demo-phone", habit_key: "phone_lock", icon: "📵", label: "No phone for first 30 min", detail: "Wake up → water → desk. Zero apps.", done: true },
      { id: "demo-focus", habit_key: "focus_block", icon: "🧠", label: "45-min deep work done", detail: "DSA / side project / article. Before anything else.", done: true },
      { id: "demo-notifs", habit_key: "notif_off", icon: "🔕", label: "Notifications off 9am–7pm", detail: "Check WhatsApp at 1pm & 8pm only.", done: false },
      { id: "demo-binge", habit_key: "no_binge", icon: "📅", label: "No weekend-only binge plan", detail: "Did I do something today instead of saving it for Saturday?", done: false },
      { id: "demo-needle", habit_key: "needle", icon: "🎯", label: "Moved the needle today", detail: "Not just busy — actually progressed on a real goal.", done: false },
      { id: "demo-gym", habit_key: "gym", icon: "💪", label: "Gym / workout done", detail: "Push / Pull / Legs / Shoulders split.", done: false },
    ],
    doneCount: 2,
    pct: 33,
    streak: 4,
    currentWeek: 2,
    weekGoal: "Stay focused and protect your mornings.",
    weekGoals: [
      { week: 1, focus: "Phone stays face-down until focus block done", color: "#6366f1" },
      { week: 2, focus: "Morning anchor: desk before any screen", color: "#0ea5e9" },
      { week: 3, focus: "Kill notifications during work hours", color: "#10b981" },
      { week: 4, focus: "45 min × 5 days — no weekend binges", color: "#f59e0b" },
    ],
    highlights: [
      { icon: "📱", title: "Phone-first mornings", description: "Keep your mind calm by delaying phone use until after your first focus block." },
      { icon: "🧠", title: "Win the workday", description: "Build deep work momentum with a focused session before distractions." },
    ],
  };
}

function buildFallbackHistory() {
  return {
    bars: [
      { key: "mon", label: "Mon", done: 4, isToday: false },
      { key: "tue", label: "Tue", done: 3, isToday: false },
      { key: "wed", label: "Wed", done: 5, isToday: false },
      { key: "thu", label: "Thu", done: 3, isToday: false },
      { key: "fri", label: "Fri", done: 4, isToday: false },
      { key: "sat", label: "Sat", done: 2, isToday: false },
      { key: "sun", label: "Sun", done: 4, isToday: true },
    ],
    reflections: [
      {
        id: "demo-reflection",
        log_date: getTodayKey(),
        body: "Demo mode is active. Connect the backend to sync your real habit data.",
        created_at: new Date().toISOString(),
      },
    ],
  };
}

function getTodayKey() {
  // Compute current date in IST (UTC+5:30) regardless of client timezone
  const now = new Date();
  const nowUtcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffsetMs = (5 * 60 + 30) * 60 * 1000; // 5 hours 30 minutes
  const ist = new Date(nowUtcMs + istOffsetMs);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function applyHabitState(dashboard: any, habitId: string, done: boolean) {
  if (!dashboard) return dashboard;

  const habits = dashboard.habits.map((habit: any) => (habit.id === habitId ? { ...habit, done } : habit));
  const doneCount = habits.filter((habit: any) => habit.done).length;
  const pct = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;

  return { ...dashboard, habits, doneCount, pct };
}

function toggleHabitState(dashboard: any, habitId: string) {
  if (!dashboard) return dashboard;

  const target = dashboard.habits.find((habit: any) => habit.id === habitId);
  if (!target) return dashboard;

  return applyHabitState(dashboard, habitId, !target.done);
}

export default function DailyTracker() {
  const todayKey = getTodayKey();

  const [dashboard, setDashboard] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [greetingName, setGreetingName] = useState("");
  const dashboardRef = useRef<any>(null);
  const latestToggleRef = useRef(0);

  const [view, setView] = useState<ViewKey>("today");
  const [reflectionText, setReflectionText] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const d = await api.getDashboard();
      dashboardRef.current = d;
      setDashboard(d);
      return d;
    } catch (err: any) {
      const fallback = buildFallbackDashboard();
      dashboardRef.current = fallback;
      setDashboard(fallback);
      throw err;
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const h = await api.getHistory(7);
      setHistory(h);
      return h;
    } catch (err: any) {
      setHistory(buildFallbackHistory());
      throw err;
    }
  }, []);

  useEffect(() => {
    dashboardRef.current = dashboard;
  }, [dashboard]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta: any = data.user?.user_metadata || {};
      const name = meta.full_name || meta.name || data.user?.email?.split("@")[0] || "";
      setGreetingName(name.split(" ")[0]);
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setOfflineMode(false);
        setErrorMsg(null);
        await Promise.all([loadDashboard(), loadHistory()]);
      } catch (err: any) {
        setOfflineMode(true);
        setErrorMsg(err.message || "Failed to load your data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadDashboard, loadHistory]);

  async function toggle(habitId: string) {
    const currentDashboard = dashboardRef.current;
    const targetHabit = currentDashboard?.habits?.find((habit: any) => habit.id === habitId);
    const previousDone = targetHabit?.done ?? false;
    const nextDone = !previousDone;
    const toggleId = ++latestToggleRef.current;

    setDashboard((prev: any) => {
      if (!prev) return prev;

      const nextDashboard = applyHabitState(prev, habitId, nextDone);
      dashboardRef.current = nextDashboard;
      return nextDashboard;
    });

    try {
      await api.toggleLog(habitId, getTodayKey());
    } catch (err: any) {
      setDashboard((prev: any) => {
        if (!prev) return prev;

        const revertedDashboard = applyHabitState(prev, habitId, previousDone);
        dashboardRef.current = revertedDashboard;
        return revertedDashboard;
      });
      setErrorMsg(err.message || "Couldn't save that — try again.");
    }
  }

  async function saveReflection(text: string) {
    try {
      await api.saveReflection(getTodayKey(), text);
      setHistoryRefreshKey((value) => value + 1);
      setReflectionText("");
    } catch (err: any) {
      setErrorMsg(err.message || "Couldn't save your reflection.");
      throw err;
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="app-container" style={{ display: "block" }}>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!dashboard || !history) {
    return (
      <div className="app-shell">
        <div className="app-container" style={{ textAlign: "center", paddingTop: 60 }}>
          <p style={{ color: "var(--text-dim)", marginBottom: 16 }}>
            {errorMsg || "Something went wrong loading your tracker."}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const HABITS = dashboard.habits;
  const doneCount = dashboard.doneCount;
  const pct = dashboard.pct;
  const streak = dashboard.streak;
  const currentWeek = dashboard.currentWeek;
  const weekGoal = dashboard.weekGoal;
  const weekGoals = dashboard.weekGoals;
  const bars = history.bars;
  const reflections = history.reflections;

  return (
    <div className="app-shell">
      <Toast message={errorMsg} onDismiss={() => setErrorMsg(null)} />

      <div className="app-container">
        {offlineMode ? (
          <div
            className="card"
            style={{
              marginTop: 16,
              padding: "10px 12px",
              borderColor: "rgba(245,151,61,0.32)",
              background: "rgba(245,151,61,0.08)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ember-500)" }}>Offline demo mode</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
              The backend is unavailable right now, so you can still browse the experience with sample data.
            </div>
          </div>
        ) : null}

        <Header greetingName={greetingName} streak={streak} onSignOut={handleSignOut} />

        <div className="app-rail">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: 16,
              marginTop: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <ProgressRing pct={pct} done={doneCount} total={HABITS.length} />
              <DayEndTimer compact />
            </div>
            {doneCount === HABITS.length && HABITS.length > 0 ? (
              <div style={{ fontSize: 13, color: "var(--ember-500)", fontWeight: 600, textAlign: "center" }}>
                🔥 Full day!
              </div>
            ) : null}
          </motion.div>

          <WeekBanner weekGoal={weekGoal} />
        </div>

        <div>
          <NavTabs view={view} onChange={setView} />

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{ marginTop: 16 }}
            >
              {view === "today" && (
                <div>
                  {HABITS.map((h: any) => (
                    <HabitCard key={h.id} habit={h} done={!!h.done} onToggle={() => toggle(h.id)} />
                  ))}
                  <ReflectionPanel value={reflectionText} onChange={setReflectionText} onSave={saveReflection} />
                </div>
              )}

              {view === "history" && (
                <HistoryView
                  bars={bars}
                  total={HABITS.length}
                  refreshKey={historyRefreshKey}
                />
              )}

              {view === "plan" && (
                <PlanView
                  weekGoals={weekGoals}
                  currentWeek={currentWeek}
                  highlights={dashboard.highlights ?? []}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
