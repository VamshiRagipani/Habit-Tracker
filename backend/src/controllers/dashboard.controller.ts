import { Request, Response, NextFunction } from "express";
import { listHabits, serializeHabitsForClient } from "../services/habits.service";
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
    const serializedHabits = serializeHabitsForClient(habits, doneIds);
    const doneCount = serializedHabits.filter((h) => h.completed).length;
    const pct = serializedHabits.length ? Math.round((doneCount / serializedHabits.length) * 100) : 0;

    const streakResult = await computeStreak(supabase, userId);
    const streakProgram = await getActiveStreakProgram(supabase);
    const currentWeek = streakProgram?.currentWeek ?? 1;

    res.json({
      date: today,
      habits: serializedHabits,
      doneCount,
      total: serializedHabits.length,
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
