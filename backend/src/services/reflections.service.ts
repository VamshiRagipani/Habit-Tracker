import { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "../middleware/errorHandler";

export async function listReflections(supabase: SupabaseClient, userId: string, limit: number) {
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(limit);
  if (error) throw new ApiError(500, error.message);
  return data ?? [];
}

export async function getReflectionByDate(supabase: SupabaseClient, userId: string, logDate: string) {
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", logDate)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  return data;
}

export async function upsertReflection(
  supabase: SupabaseClient,
  userId: string,
  logDate: string,
  body: string
) {
  const { data, error } = await supabase
    .from("reflections")
    .upsert({ user_id: userId, log_date: logDate, body }, { onConflict: "user_id,log_date" })
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);
  return data;
}

export async function deleteReflection(supabase: SupabaseClient, userId: string, id: string) {
  const { error } = await supabase.from("reflections").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new ApiError(400, error.message);
}
