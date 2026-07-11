import { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "../middleware/errorHandler";
import { listHabits } from "./habits.service";
import { getLogsInRange } from "./logs.service";

function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function getCurrentWeekForCycle(startDate: string | Date, durationWeeks: number) {
  const today = new Date();
  const start = new Date(startDate);
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 1;
  return Math.min(Math.max(Math.floor(diff / 7) + 1, 1), durationWeeks);
}

export async function getActiveStreakProgram(supabase: SupabaseClient) {
  const { data: cycles, error: cycleError } = await supabase
    .from("streak_cycles")
    .select("id, name, start_date, duration_weeks")
    .eq("is_active", true)
    .order("start_date", { ascending: false })
    .limit(1);
  
  // Handle table not found or other errors gracefully
  if (cycleError) {
    console.warn("Warning: Could not fetch streak cycles:", cycleError.message);
    return null;
  }
  
  const cycle = cycles?.[0] ?? null;
  if (!cycle) return null;

  const { data: weeks, error: weeksError } = await supabase
    .from("streak_weeks")
    .select("week, focus, color, display_order")
    .eq("cycle_id", cycle.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (weeksError) throw new ApiError(500, weeksError.message);

  const { data: highlights, error: highlightsError } = await supabase
    .from("streak_highlights")
    .select("icon, title, description, display_order")
    .eq("cycle_id", cycle.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (highlightsError) throw new ApiError(500, highlightsError.message);

  return {
    cycle,
    weeks: weeks ?? [],
    highlights: highlights ?? [],
    currentWeek: getCurrentWeekForCycle(cycle.start_date, cycle.duration_weeks),
  };
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
