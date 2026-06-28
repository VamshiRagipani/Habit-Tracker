import { useState, useEffect, useCallback } from "react";
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

export default function DailyTracker() {
  const todayKey = getTodayKey();

  const [dashboard, setDashboard] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [greetingName, setGreetingName] = useState("");

  const [view, setView] = useState<ViewKey>("today");
  const [reflectionText, setReflectionText] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    const d = await api.getDashboard();
    setDashboard(d);
  }, []);

  const loadHistory = useCallback(async () => {
    const h = await api.getHistory(7);
    setHistory(h);
  }, []);

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
        await Promise.all([loadDashboard(), loadHistory()]);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load your data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadDashboard, loadHistory]);

  async function toggle(habitId: string) {
    setDashboard((prev: any) => {
      if (!prev) return prev;
      const habits = prev.habits.map((h: any) => (h.id === habitId ? { ...h, done: !h.done } : h));
      const doneCount = habits.filter((h: any) => h.done).length;
      const pct = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;
      return { ...prev, habits, doneCount, pct };
    });
    try {
      await api.toggleLog(habitId, getTodayKey());
      await Promise.all([loadDashboard(), loadHistory()]);
    } catch (err: any) {
      setErrorMsg(err.message || "Couldn't save that — try again.");
      await loadDashboard();
    }
  }

  async function saveReflection() {
    try {
      await api.saveReflection(getTodayKey(), reflectionText);
      await loadHistory();
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
        <Header greetingName={greetingName} streak={streak} onSignOut={handleSignOut} />

        <div className="app-rail">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 20, padding: 20, marginTop: 16 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <ProgressRing pct={pct} done={doneCount} total={HABITS.length} />
              <DayEndTimer compact />
            </div>
            <div style={{ minWidth: 140 }}>
              {doneCount === HABITS.length && HABITS.length > 0 ? (
                <div style={{ fontSize: 13, color: "var(--ember-500)", marginTop: 4, fontWeight: 600 }}>
                  🔥 Full day!
                </div>
              ) : null}
            </div>
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

              {view === "history" && <HistoryView bars={bars} total={HABITS.length} reflections={reflections} />}

              {view === "plan" && <PlanView weekGoals={weekGoals} currentWeek={currentWeek} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
