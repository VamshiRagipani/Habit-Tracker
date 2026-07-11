import { Request, Response, NextFunction } from "express";
import { listHabits } from "../services/habits.service";
import { getLogsInRange } from "../services/logs.service";
import { computeStreak, getActiveStreakProgram } from "../services/streaks.service";

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

    const streakResult = await computeStreak(supabase, userId);
    const streakProgram = await getActiveStreakProgram(supabase);
    const currentWeek = streakProgram?.currentWeek ?? 1;

    res.json({
      date: today,
      habits: habits.map((h) => ({ ...h, done: doneIds.has(h.id) })),
      doneCount,
      total: habits.length,
      pct,
      streak: streakResult.streak,
      currentWeek,
      weekGoal: streakProgram?.weeks.find((w) => w.week === currentWeek) ?? null,
      weekGoals: streakProgram?.weeks ?? [],
      highlights: streakProgram?.highlights ?? [],
    });
  } catch (err) {
    next(err);
  }
}
