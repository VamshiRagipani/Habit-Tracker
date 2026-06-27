import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Base client with no user session — used ONLY to verify access tokens
 * that the frontend sends us (via supabase.auth.getUser(token)).
 */
export const supabaseAuthClient: SupabaseClient = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey
);

/**
 * Per-request client that authenticates as the calling user.
 * Because every query runs with the user's JWT attached, Postgres
 * Row Level Security enforces "users can only touch their own rows" —
 * the API code never has to manually scope queries to be safe (though
 * we still pass user_id explicitly in services for clarity/defense-in-depth).
 */
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
