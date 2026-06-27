import { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "../middleware/errorHandler";

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(404, "Profile not found");
  return data;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  payload: { display_name?: string }
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Profile not found");
  return data;
}
