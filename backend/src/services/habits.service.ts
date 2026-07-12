import { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "../middleware/errorHandler";
import { HabitClientPayload } from "../types";

const DEFAULT_HABIT_DEFINITIONS = [
  { habit_key: "wake_600", icon: "⏰", label: "Wake Up at 6:00 AM", detail: "Start the day early and protect your first hour.", phase: 1, sort_order: 1 },
  { habit_key: "phone_free_30", icon: "🚫", label: "No Phone for First 30 Min", detail: "Avoid the scroll and begin with focus.", phase: 1, sort_order: 2 },
  { habit_key: "water_after_wake", icon: "💧", label: "Drink Water After Waking Up", detail: "Hydrate before checking anything else.", phase: 1, sort_order: 3 },
  { habit_key: "study_coding_30", icon: "📚", label: "Study Coding for 30 Min", detail: "Spend a short block learning something useful.", phase: 1, sort_order: 4 },
  { habit_key: "solve_dsa_1", icon: "🧠", label: "Solve 1 DSA Problem", detail: "Practice one problem even if it is small.", phase: 1, sort_order: 5 },
  { habit_key: "deep_coding_60", icon: "💻", label: "60 Min Deep Coding Session", detail: "Work without distractions for a full focus block.", phase: 2, sort_order: 6 },
  { habit_key: "side_project_progress", icon: "🚀", label: "Make Progress on Side Project", detail: "Move one real thing forward today.", phase: 2, sort_order: 7 },
  { habit_key: "learn_concept_1", icon: "📝", label: "Learn 1 New Coding Concept", detail: "Pick one concept and make it stick.", phase: 2, sort_order: 8 },
  { habit_key: "read_code_15", icon: "🔍", label: "Read Code / Documentation for 15 Min", detail: "Read well-written code and understand it better.", phase: 2, sort_order: 9 },
  { habit_key: "refactor_code", icon: "🧹", label: "Refactor or Clean Up Code", detail: "Leave the codebase clearer than you found it.", phase: 2, sort_order: 10 },
  { habit_key: "meaningful_commit_1", icon: "📦", label: "Make at Least 1 Meaningful Git Commit", detail: "Commit work that meaningfully moves the project forward.", phase: 3, sort_order: 11 },
  { habit_key: "notifications_off", icon: "📵", label: "Keep Notifications Off During Deep Work", detail: "Protect your focus from context switching.", phase: 3, sort_order: 12 },
  { habit_key: "workout_15", icon: "💪", label: "15 Min Workout", detail: "Move your body and reset your energy.", phase: 3, sort_order: 13 },
  { habit_key: "read_pages_5", icon: "📖", label: "Read 5 Pages", detail: "Build momentum through consistent reading.", phase: 3, sort_order: 14 },
  { habit_key: "plan_tomorrow_task", icon: "📋", label: "Plan Tomorrow’s Top Coding Task", detail: "End the day with a clear next step.", phase: 3, sort_order: 15 },
  { habit_key: "sleep_10_11", icon: "😴", label: "Sleep by 10–11 PM", detail: "Protect recovery for tomorrow’s focus.", phase: 3, sort_order: 16 },
];

const LEGACY_HABIT_KEYS = new Set(["phone_lock", "focus_block", "notif_off", "no_binge", "needle", "gym"]);

async function ensureDefaultHabitsForUser(supabase: SupabaseClient, userId: string) {
  const { data: existingHabits, error: fetchError } = await supabase
    .from("habits")
    .select("habit_key, is_active")
    .eq("user_id", userId);

  if (fetchError) throw new ApiError(500, fetchError.message);

  const activeKeys = new Set((existingHabits ?? []).filter((habit) => habit.is_active !== false).map((habit) => habit.habit_key));
  const hasAllDefaults = DEFAULT_HABIT_DEFINITIONS.every((habit) => activeKeys.has(habit.habit_key));
  const hasLegacyHabits = (existingHabits ?? []).some((habit) => LEGACY_HABIT_KEYS.has(habit.habit_key));

  if (!existingHabits?.length || hasLegacyHabits || !hasAllDefaults) {
    if (hasLegacyHabits) {
      const { error: deleteError } = await supabase
        .from("habits")
        .delete()
        .eq("user_id", userId)
        .in("habit_key", Array.from(LEGACY_HABIT_KEYS));

      if (deleteError) throw new ApiError(500, deleteError.message);
    }

    const payload = DEFAULT_HABIT_DEFINITIONS.map((habit) => ({
      user_id: userId,
      habit_key: habit.habit_key,
      icon: habit.icon,
      label: habit.label,
      detail: habit.detail,
      phase: habit.phase,
      sort_order: habit.sort_order,
      is_active: true,
    }));

    const { error: upsertError } = await supabase.from("habits").upsert(payload, {
      onConflict: "user_id,habit_key",
    });

    if (upsertError) throw new ApiError(500, upsertError.message);
  }
}

export function serializeHabitForClient(habit: any, completed = false): HabitClientPayload {
  return {
    id: habit.id,
    title: habit.label ?? habit.title ?? "Habit",
    description: habit.detail ?? habit.description ?? "",
    icon: habit.icon ?? "✅",
    completed,
    order: habit.sort_order ?? habit.order ?? 0,
    habit_key: habit.habit_key,
    phase: habit.phase,
    sort_order: habit.sort_order,
    label: habit.label,
    detail: habit.detail,
    is_active: habit.is_active,
  };
}

export function serializeHabitsForClient(habits: any[], completedIds: Set<string> = new Set()) {
  return habits.map((habit) => serializeHabitForClient(habit, completedIds.has(habit.id)));
}

export async function listHabits(supabase: SupabaseClient, userId: string) {
  await ensureDefaultHabitsForUser(supabase, userId);

  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new ApiError(500, error.message);
  return data ?? [];
}

export async function createHabit(supabase: SupabaseClient, userId: string, payload: any) {
  const { data, error } = await supabase
    .from("habits")
    .insert({ ...payload, user_id: userId })
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);
  return data;
}

export async function updateHabit(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  payload: any
) {
  const { data, error } = await supabase
    .from("habits")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Habit not found");
  return data;
}

export async function deleteHabit(supabase: SupabaseClient, userId: string, id: string) {
  // Soft delete: keeps historical logs intact for streak/history accuracy.
  const { data, error } = await supabase
    .from("habits")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Habit not found");
  return data;
}
