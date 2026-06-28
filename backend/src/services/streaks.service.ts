import { SupabaseClient } from "@supabase/supabase-js";
import { listHabits } from "./habits.service";
import { getLogsInRange } from "./logs.service";

function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}

/**
 * A day counts toward the streak when the user completes at least half of
 * the active habits for that day. It does not require completing every habit.
 *
 * Examples:
 *   6 habits -> threshold 3
 *   5 habits -> threshold 3
 *   4 habits -> threshold 2
 */
export async function computeStreak(supabase: SupabaseClient, userId: string, windowDays = 60) {
  const habits = await listHabits(supabase, userId);
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - windowDays);

  const logs = await getLogsInRange(supabase, userId, isoDate(start), isoDate(today));

  const byDate: Record<string, Set<string>> = {};
  for (const log of logs) {
    if (!log.completed) continue;
    byDate[log.log_date] ??= new Set();
    byDate[log.log_date].add(log.habit_id);
  }

  const threshold = habits.length > 0 ? Math.ceil(habits.length / 2) : 1;
  let streak = 0;
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = isoDate(d);
    const doneSet = byDate[key];
    if (!doneSet) break;
    const done = habits.filter((h) => doneSet.has(h.id)).length;
    if (done >= threshold) streak++;
    else break;
  }
  return { streak, habitsCount: habits.length, threshold };
}
