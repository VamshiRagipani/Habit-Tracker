import { Request, Response, NextFunction } from "express";
import { computeStreak, getActiveStreakProgram } from "../services/streaks.service";

export async function getStreaks(req: Request, res: Response, next: NextFunction) {
  try {
    const streakResult = await computeStreak(req.supabase!, req.user!.id);
    const streakProgram = await getActiveStreakProgram(req.supabase!);
    const currentWeek = streakProgram?.currentWeek ?? 1;

    res.json({
      ...streakResult,
      currentWeek,
      weekGoal: streakProgram?.weeks.find((w) => w.week === currentWeek) ?? null,
      weekGoals: streakProgram?.weeks ?? [],
      highlights: streakProgram?.highlights ?? [],
    });
  } catch (err) {
    next(err);
  }
}
