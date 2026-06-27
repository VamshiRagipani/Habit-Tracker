import { Request, Response, NextFunction } from "express";
import { listHabits } from "../services/habits.service";
import { getLogsInRange } from "../services/logs.service";
import { listReflections } from "../services/reflections.service";

function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const supabase = req.supabase!;
    const days = Math.min(Math.max(parseInt((req.query.days as string) || "7", 10), 1), 30);

    const habits = await listHabits(supabase, userId);

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));

    const logs = await getLogsInRange(supabase, userId, isoDate(start), isoDate(today));

    const byDate: Record<string, Set<string>> = {};
    for (const log of logs) {
      if (!log.completed) continue;
      byDate[log.log_date] ??= new Set();
      byDate[log.log_date].add(log.habit_id);
    }

    const todayKey = isoDate(today);
    const bars = Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (days - 1 - i));
      const key = isoDate(d);
      const done = byDate[key]?.size || 0;
      return {
        key,
        label: d.toLocaleDateString("en", { weekday: "short" }),
        done,
        isToday: key === todayKey,
      };
    });

    const reflections = await listReflections(supabase, userId, 5);

    res.json({ bars, total: habits.length, reflections });
  } catch (err) {
    next(err);
  }
}
