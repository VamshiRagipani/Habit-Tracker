-- Run this once in Supabase SQL Editor after applying schema.sql
-- This backfills the new coding-focused habits for existing users.

DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN SELECT id FROM auth.users LOOP
    DELETE FROM public.habits
    WHERE user_id = u.id
      AND habit_key IN ('phone_lock', 'focus_block', 'notif_off', 'no_binge', 'needle', 'gym');

    INSERT INTO public.habits (user_id, habit_key, icon, label, detail, phase, sort_order)
    VALUES
      (u.id, 'wake_600', '⏰', 'Wake Up at 6:00 AM', 'Start the day early and protect your first hour.', 1, 1),
      (u.id, 'phone_free_30', '🚫', 'No Phone for First 30 Min', 'Avoid the scroll and begin with focus.', 1, 2),
      (u.id, 'water_after_wake', '💧', 'Drink Water After Waking Up', 'Hydrate before checking anything else.', 1, 3),
      (u.id, 'study_coding_30', '📚', 'Study Coding for 30 Min', 'Spend a short block learning something useful.', 1, 4),
      (u.id, 'solve_dsa_1', '🧠', 'Solve 1 DSA Problem', 'Practice one problem even if it is small.', 1, 5),
      (u.id, 'deep_coding_60', '💻', '60 Min Deep Coding Session', 'Work without distractions for a full focus block.', 2, 6),
      (u.id, 'side_project_progress', '🚀', 'Make Progress on Side Project', 'Move one real thing forward today.', 2, 7),
      (u.id, 'learn_concept_1', '📝', 'Learn 1 New Coding Concept', 'Pick one concept and make it stick.', 2, 8),
      (u.id, 'read_code_15', '🔍', 'Read Code / Documentation for 15 Min', 'Read well-written code and understand it better.', 2, 9),
      (u.id, 'refactor_code', '🧹', 'Refactor or Clean Up Code', 'Leave the codebase clearer than you found it.', 2, 10),
      (u.id, 'meaningful_commit_1', '📦', 'Make at Least 1 Meaningful Git Commit', 'Commit work that meaningfully moves the project forward.', 3, 11),
      (u.id, 'notifications_off', '📵', 'Keep Notifications Off During Deep Work', 'Protect your focus from context switching.', 3, 12),
      (u.id, 'workout_15', '💪', '15 Min Workout', 'Move your body and reset your energy.', 3, 13),
      (u.id, 'read_pages_5', '📖', 'Read 5 Pages', 'Build momentum through consistent reading.', 3, 14),
      (u.id, 'plan_tomorrow_task', '📋', 'Plan Tomorrow’s Top Coding Task', 'End the day with a clear next step.', 3, 15),
      (u.id, 'sleep_10_11', '😴', 'Sleep by 10–11 PM', 'Protect recovery for tomorrow’s focus.', 3, 16)
    ON CONFLICT (user_id, habit_key) DO UPDATE SET
      icon = EXCLUDED.icon,
      label = EXCLUDED.label,
      detail = EXCLUDED.detail,
      phase = EXCLUDED.phase,
      sort_order = EXCLUDED.sort_order;
  END LOOP;
END $$;
