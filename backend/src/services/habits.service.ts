import { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "../middleware/errorHandler";

export async function listHabits(supabase: SupabaseClient, userId: string) {
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
