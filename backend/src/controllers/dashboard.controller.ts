import { Request, Response, NextFunction } from "express";
import { listHabits } from "../services/habits.service";
import { getLogsInRange } from "../services/logs.service";
import { computeStreak } from "../services/streaks.service";

// Same static plan content as the original frontend — not user data,
// so it stays as a constant rather than a database table.
const WEEK_GOALS = [
  { week: 1, focus: "Phone stays face-down until focus block done", color: "#6366f1" },
  { week: 2, focus: "Morning anchor: desk before any screen", color: "#0ea5e9" },
  { week: 3, focus: "Kill notifications during work hours", color: "#10b981" },
  { week: 4, focus: "45 min × 5 days — no weekend binges", color: "#f59e0b" },
];

function getWeekNumber() {
  const start = new Date("2026-06-22");
  const today = new Date();
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
  return Math.min(Math.max(diff + 1, 1), 4);
}

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const supabase = req.supabase!;
    const today = todayKey();

    const habits = await listHabits(supabase, userId);
    const todaysLogs = await getLogsInRange(supabase, userId, today, today);
    const doneIds = new Set(todaysLogs.filter((l) => l.completed).map((l) => l.habit_id));
    const doneCount = habits.filter((h) => doneIds.has(h.id)).length;
    const pct = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;

    const { streak } = await computeStreak(supabase, userId);
    const currentWeek = getWeekNumber();
    const weekGoal = WEEK_GOALS[currentWeek - 1];

    res.json({
      date: today,
      habits: habits.map((h) => ({ ...h, done: doneIds.has(h.id) })),
      doneCount,
      total: habits.length,
      pct,
      streak,
      currentWeek,
      weekGoal,
      weekGoals: WEEK_GOALS,
    });
  } catch (err) {
    next(err);
  }
}
