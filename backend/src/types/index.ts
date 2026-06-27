import { SupabaseClient } from "@supabase/supabase-js";

export interface AuthedUser {
  id: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthedUser;
      supabase?: SupabaseClient;
    }
  }
}

export interface Habit {
  id: string;
  user_id: string;
  habit_key: string;
  icon: string;
  label: string;
  detail: string | null;
  phase: number;
  sort_order: number;
  is_active: boolean;
}

export interface DailyLog {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
}

export interface Reflection {
  id: string;
  user_id: string;
  log_date: string;
  body: string;
}

// Ensures this file is treated as a module augmentation, not a script.
export {};
