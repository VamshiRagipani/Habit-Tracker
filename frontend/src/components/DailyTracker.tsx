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

function getEmptyHabitForm() {
  return {
    label: "",
    detail: "",
    icon: "✅",
    category: "",
    frequency: "daily",
    target: "",
    unit: "",
    start_date: getTodayKey(),
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

  const habits = dashboard.habits.map((habit: any) => {
    if (habit.id !== habitId) return habit;
    return { ...habit, completed: done, done };
  });
  const doneCount = habits.filter((habit: any) => habit.completed ?? habit.done).length;
  const pct = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;

  return { ...dashboard, habits, doneCount, pct };
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
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [habitForm, setHabitForm] = useState<any>(getEmptyHabitForm());
  const [habitSaving, setHabitSaving] = useState(false);

  const loadDashboard = useCallback(async () => {
    const d = await api.getDashboard();
    dashboardRef.current = d;
    setDashboard(d);
    return d;
  }, []);

  const loadHistory = useCallback(async () => {
    const h = await api.getHistory(7);
    setHistory(h);
    return h;
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadDashboard(), loadHistory()]);
  }, [loadDashboard, loadHistory]);

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
        setErrorMsg(null);
        await refreshAll();
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load your data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshAll]);

  async function toggle(habitId: string) {
    const currentDashboard = dashboardRef.current;
    const targetHabit = currentDashboard?.habits?.find((habit: any) => habit.id === habitId);
    const previousDone = targetHabit?.completed ?? targetHabit?.done ?? false;
    const nextDone = !previousDone;

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

  function openNewHabitForm() {
    setEditingHabitId(null);
    setHabitForm(getEmptyHabitForm());
    setShowHabitForm(true);
  }

  function openEditHabitForm(habit: any) {
    setEditingHabitId(habit.id);
    setHabitForm({
      label: habit.label ?? habit.title ?? "",
      detail: habit.detail ?? "",
      icon: habit.icon ?? "✅",
      category: habit.category ?? "",
      frequency: habit.frequency ?? "daily",
      target: habit.target ?? "",
      unit: habit.unit ?? "",
      start_date: habit.start_date ?? getTodayKey(),
    });
    setShowHabitForm(true);
  }

  async function submitHabitForm(event: React.FormEvent) {
    event.preventDefault();
    const trimmedLabel = habitForm.label.trim();
    if (!trimmedLabel) {
      setErrorMsg("Habit name is required.");
      return;
    }

    setHabitSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        label: trimmedLabel,
        detail: habitForm.detail.trim(),
        icon: habitForm.icon.trim() || "✅",
        category: habitForm.category.trim(),
        frequency: habitForm.frequency || "daily",
        target: habitForm.target === "" ? null : Number(habitForm.target),
        unit: habitForm.unit.trim(),
        start_date: habitForm.start_date || getTodayKey(),
      };

      if (editingHabitId) {
        await api.updateHabit(editingHabitId, payload);
      } else {
        await api.createHabit(payload);
      }

      setShowHabitForm(false);
      setEditingHabitId(null);
      setHabitForm(getEmptyHabitForm());
      await refreshAll();
    } catch (err: any) {
      setErrorMsg(err.message || "Couldn't save your habit.");
    } finally {
      setHabitSaving(false);
    }
  }

  async function removeHabit(habitId: string) {
    if (!window.confirm("Delete this habit? It will be archived for your history and dashboard.")) {
      return;
    }

    try {
      await api.deleteHabit(habitId);
      await refreshAll();
    } catch (err: any) {
      setErrorMsg(err.message || "Couldn't delete that habit.");
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

  const HABITS = [...(dashboard.habits ?? [])].sort((a: any, b: any) => {
    const aOrder = a.order ?? a.sort_order ?? 0;
    const bOrder = b.order ?? b.sort_order ?? 0;
    return aOrder - bOrder;
  });
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                      {HABITS.length} active {HABITS.length === 1 ? "habit" : "habits"}
                    </div>
                    <button className="btn btn-primary" type="button" onClick={openNewHabitForm}>
                      + Add habit
                    </button>
                  </div>

                  {showHabitForm && (
                    <form className="card" onSubmit={submitHabitForm} style={{ padding: 16, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <strong>{editingHabitId ? "Edit habit" : "Create habit"}</strong>
                        <button type="button" className="btn btn-ghost" onClick={() => setShowHabitForm(false)}>
                          Close
                        </button>
                      </div>

                      <div style={{ display: "grid", gap: 10 }}>
                        <input
                          className="input"
                          placeholder="Habit name"
                          value={habitForm.label}
                          onChange={(e) => setHabitForm((prev: any) => ({ ...prev, label: e.target.value }))}
                        />
                        <textarea
                          className="input"
                          placeholder="Description"
                          value={habitForm.detail}
                          onChange={(e) => setHabitForm((prev: any) => ({ ...prev, detail: e.target.value }))}
                          style={{ minHeight: 88, resize: "vertical" }}
                        />
                        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8 }}>
                          <input
                            className="input"
                            placeholder="Icon"
                            value={habitForm.icon}
                            onChange={(e) => setHabitForm((prev: any) => ({ ...prev, icon: e.target.value }))}
                          />
                          <input
                            className="input"
                            placeholder="Category"
                            value={habitForm.category}
                            onChange={(e) => setHabitForm((prev: any) => ({ ...prev, category: e.target.value }))}
                          />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <select
                            className="input"
                            value={habitForm.frequency}
                            onChange={(e) => setHabitForm((prev: any) => ({ ...prev, frequency: e.target.value }))}
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="custom">Custom</option>
                          </select>
                          <input
                            className="input"
                            type="date"
                            value={habitForm.start_date}
                            onChange={(e) => setHabitForm((prev: any) => ({ ...prev, start_date: e.target.value }))}
                          />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <input
                            className="input"
                            type="number"
                            min="0"
                            placeholder="Target"
                            value={habitForm.target}
                            onChange={(e) => setHabitForm((prev: any) => ({ ...prev, target: e.target.value }))}
                          />
                          <input
                            className="input"
                            placeholder="Unit"
                            value={habitForm.unit}
                            onChange={(e) => setHabitForm((prev: any) => ({ ...prev, unit: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                        <button type="button" className="btn btn-ghost" onClick={() => setShowHabitForm(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={habitSaving}>
                          {habitSaving ? "Saving..." : editingHabitId ? "Save changes" : "Create habit"}
                        </button>
                      </div>
                    </form>
                  )}

                  {HABITS.length === 0 ? (
                    <div className="card" style={{ padding: 16, textAlign: "center", color: "var(--text-dim)" }}>
                      <div style={{ fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>You don’t have any habits yet.</div>
                      <div style={{ marginBottom: 12 }}>Create your first habit to get started.</div>
                      <button className="btn btn-primary" type="button" onClick={openNewHabitForm}>Add your first habit</button>
                    </div>
                  ) : (
                    HABITS.map((h: any) => (
                      <div key={h.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <HabitCard key={h.id} habit={h} done={!!(h.completed ?? h.done)} onToggle={() => toggle(h.id)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <button type="button" className="btn btn-ghost" onClick={() => openEditHabitForm(h)} style={{ minWidth: 0, padding: "8px 10px" }}>
                            Edit
                          </button>
                          <button type="button" className="btn btn-ghost" onClick={() => removeHabit(h.id)} style={{ minWidth: 0, padding: "8px 10px", color: "#fca5a5" }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
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
