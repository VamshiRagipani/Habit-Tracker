import { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "../middleware/errorHandler";

export async function listReflections(
  supabase: SupabaseClient,
  userId: string,
  page: number,
  limit: number
) {
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from("reflections")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new ApiError(500, error.message);
  return { reflections: data ?? [], total: count ?? 0 };
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

export async function createReflection(
  supabase: SupabaseClient,
  userId: string,
  logDate: string,
  body: string
) {
  const { data, error } = await supabase
    .from("reflections")
    .insert({ user_id: userId, log_date: logDate, body })
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);
  return data;
}

export async function deleteReflection(supabase: SupabaseClient, userId: string, id: string) {
  const { error } = await supabase.from("reflections").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new ApiError(400, error.message);
}
