import { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "../middleware/errorHandler";

export async function getLogsInRange(
  supabase: SupabaseClient,
  userId: string,
  start: string,
  end: string
) {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("log_date", start)
    .lte("log_date", end);
  if (error) throw new ApiError(500, error.message);
  return data ?? [];
}

export async function toggleLog(
  supabase: SupabaseClient,
  userId: string,
  habitId: string,
  logDate: string
) {
  const { data: existing, error: fetchErr } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("habit_id", habitId)
    .eq("log_date", logDate)
    .maybeSingle();
  if (fetchErr) throw new ApiError(500, fetchErr.message);

  if (!existing) {
    const { data, error } = await supabase
      .from("daily_logs")
      .insert({ user_id: userId, habit_id: habitId, log_date: logDate, completed: true })
      .select()
      .single();
    if (error) throw new ApiError(400, error.message);
    return data;
  }

  const { data, error } = await supabase
    .from("daily_logs")
    .update({ completed: !existing.completed })
    .eq("id", existing.id)
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);
  return data;
}
