-- =========================================================
-- Habit Tracker — Supabase Postgres schema
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- PROFILES (1 row per authenticated user)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------
-- HABITS (per-user list, seeded with the coding-focused micro habits)
-- ---------------------------------------------------------
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_key text not null,
  icon text not null default '✅',
  label text not null,
  detail text,
  phase int not null default 1,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, habit_key)
);

alter table public.habits enable row level security;

drop policy if exists "habits_select_own" on public.habits;
drop policy if exists "habits_insert_own" on public.habits;
drop policy if exists "habits_update_own" on public.habits;
drop policy if exists "habits_delete_own" on public.habits;

create policy "habits_select_own" on public.habits for select using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits for insert with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits for update using (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- STREAK PROGRAMS (dynamic weekly goals and timeline)
-- ---------------------------------------------------------
create table if not exists public.streak_cycles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  start_date date not null,
  duration_weeks int not null default 4,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.streak_cycles enable row level security;

drop policy if exists "streak_cycles_select_all" on public.streak_cycles;

create policy "streak_cycles_select_all" on public.streak_cycles
  for select using (auth.role() = 'authenticated');

create table if not exists public.streak_weeks (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.streak_cycles(id) on delete cascade,
  week int not null,
  focus text not null,
  color text not null default '#6366f1',
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cycle_id, week)
);

alter table public.streak_weeks enable row level security;

drop policy if exists "streak_weeks_select_all" on public.streak_weeks;

create policy "streak_weeks_select_all" on public.streak_weeks
  for select using (auth.role() = 'authenticated');

create table if not exists public.streak_highlights (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.streak_cycles(id) on delete cascade,
  icon text not null default 'ℹ️',
  title text not null,
  description text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cycle_id, title)
);

alter table public.streak_highlights enable row level security;

drop policy if exists "streak_highlights_select_all" on public.streak_highlights;

create policy "streak_highlights_select_all" on public.streak_highlights
  for select using (auth.role() = 'authenticated');

-- Seed a default public streak program if it doesn't already exist.
do $$
begin
  if not exists (select 1 from public.streak_cycles where name = 'default') then
    insert into public.streak_cycles (name, start_date, duration_weeks, is_active)
    values ('default', '2026-06-22', 4, true);
  end if;
end
$$;

do $$
declare
  v_cycle_id uuid;
begin
  select id into v_cycle_id from public.streak_cycles where name = 'default' limit 1;
  if v_cycle_id is not null then
    if not exists (select 1 from public.streak_weeks sw where sw.cycle_id = v_cycle_id and sw.week = 1) then
      insert into public.streak_weeks (cycle_id, week, focus, color, display_order, is_active)
      values (v_cycle_id, 1, 'Phone stays face-down until focus block done', '#6366f1', 1, true);
    end if;
    if not exists (select 1 from public.streak_weeks sw where sw.cycle_id = v_cycle_id and sw.week = 2) then
      insert into public.streak_weeks (cycle_id, week, focus, color, display_order, is_active)
      values (v_cycle_id, 2, 'Morning anchor: desk before any screen', '#0ea5e9', 2, true);
    end if;
    if not exists (select 1 from public.streak_weeks sw where sw.cycle_id = v_cycle_id and sw.week = 3) then
      insert into public.streak_weeks (cycle_id, week, focus, color, display_order, is_active)
      values (v_cycle_id, 3, 'Kill notifications during work hours', '#10b981', 3, true);
    end if;
    if not exists (select 1 from public.streak_weeks sw where sw.cycle_id = v_cycle_id and sw.week = 4) then
      insert into public.streak_weeks (cycle_id, week, focus, color, display_order, is_active)
      values (v_cycle_id, 4, '45 min × 5 days — no weekend binges', '#f59e0b', 4, true);
    end if;
  end if;
end
$$;

do $$
declare
  v_cycle_id uuid;
begin
  select id into v_cycle_id from public.streak_cycles where name = 'default' limit 1;
  if v_cycle_id is not null then
    if not exists (select 1 from public.streak_highlights sh where sh.cycle_id = v_cycle_id and sh.title = 'Phone-first mornings') then
      insert into public.streak_highlights (cycle_id, icon, title, description, display_order, is_active)
      values (v_cycle_id, '📱', 'Phone-first mornings', 'Keep your mind calm by delaying phone use until after your first focus block.', 1, true);
    end if;
    if not exists (select 1 from public.streak_highlights sh where sh.cycle_id = v_cycle_id and sh.title = 'Win the workday') then
      insert into public.streak_highlights (cycle_id, icon, title, description, display_order, is_active)
      values (v_cycle_id, '🧠', 'Win the workday', 'Build deep work momentum with a focused session before distractions.', 2, true);
    end if;
    if not exists (select 1 from public.streak_highlights sh where sh.cycle_id = v_cycle_id and sh.title = 'Notifications on your terms') then
      insert into public.streak_highlights (cycle_id, icon, title, description, display_order, is_active)
      values (v_cycle_id, '🔕', 'Notifications on your terms', 'Limit interruptions and check apps at dedicated times.', 3, true);
    end if;
    if not exists (select 1 from public.streak_highlights sh where sh.cycle_id = v_cycle_id and sh.title = 'Weekend balance') then
      insert into public.streak_highlights (cycle_id, icon, title, description, display_order, is_active)
      values (v_cycle_id, '📅', 'Weekend balance', 'Avoid weekend-only effort by making steady daily progress instead.', 4, true);
    end if;
    if not exists (select 1 from public.streak_highlights sh where sh.cycle_id = v_cycle_id and sh.title = 'Move the needle') then
      insert into public.streak_highlights (cycle_id, icon, title, description, display_order, is_active)
      values (v_cycle_id, '🎯', 'Move the needle', 'Choose at least one small but meaningful win each day.', 5, true);
    end if;
  end if;
end
$$;

-- ---------------------------------------------------------
-- DAILY HABIT LOGS (one row per habit per day)
-- ---------------------------------------------------------
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  log_date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, habit_id, log_date)
);

alter table public.daily_logs enable row level security;

drop policy if exists "logs_select_own" on public.daily_logs;
drop policy if exists "logs_insert_own" on public.daily_logs;
drop policy if exists "logs_update_own" on public.daily_logs;
drop policy if exists "logs_delete_own" on public.daily_logs;

create policy "logs_select_own" on public.daily_logs for select using (auth.uid() = user_id);
create policy "logs_insert_own" on public.daily_logs for insert with check (auth.uid() = user_id);
create policy "logs_update_own" on public.daily_logs for update using (auth.uid() = user_id);
create policy "logs_delete_own" on public.daily_logs for delete using (auth.uid() = user_id);

create index if not exists idx_daily_logs_user_date on public.daily_logs (user_id, log_date);

-- ---------------------------------------------------------
-- REFLECTIONS (one row per saved reflection entry)
-- ---------------------------------------------------------
create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reflections enable row level security;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.reflections'::regclass
      and conname = 'reflections_user_id_log_date_key'
  ) then
    alter table public.reflections drop constraint reflections_user_id_log_date_key;
  end if;
end
$$;

create index if not exists idx_reflections_user_date_created
  on public.reflections (user_id, log_date, created_at desc);

drop policy if exists "reflections_select_own" on public.reflections;
drop policy if exists "reflections_insert_own" on public.reflections;
drop policy if exists "reflections_update_own" on public.reflections;
drop policy if exists "reflections_delete_own" on public.reflections;

create policy "reflections_select_own" on public.reflections for select using (auth.uid() = user_id);
create policy "reflections_insert_own" on public.reflections for insert with check (auth.uid() = user_id);
create policy "reflections_update_own" on public.reflections for update using (auth.uid() = user_id);
create policy "reflections_delete_own" on public.reflections for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_habits_updated_at on public.habits;
create trigger trg_habits_updated_at before update on public.habits
  for each row execute function public.set_updated_at();

drop trigger if exists trg_logs_updated_at on public.daily_logs;
create trigger trg_logs_updated_at before update on public.daily_logs
  for each row execute function public.set_updated_at();

drop trigger if exists trg_reflections_updated_at on public.reflections;
create trigger trg_reflections_updated_at before update on public.reflections
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- New user hook: create profile + seed the coding-focused micro habits
-- (runs with elevated privileges via SECURITY DEFINER, bypassing RLS
--  just for this one bootstrap insert — required since the new user
--  has no session yet at the moment auth.users gets the row)
-- ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));

  delete from public.habits
  where habit_key in ('phone_lock', 'focus_block', 'notif_off', 'no_binge', 'needle', 'gym');

  insert into public.habits (user_id, habit_key, icon, label, detail, phase, sort_order) values
    (new.id, 'wake_600', '⏰', 'Wake Up at 6:00 AM', 'Start the day early and protect your first hour.', 1, 1),
    (new.id, 'phone_free_30', '🚫', 'No Phone for First 30 Min', 'Avoid the scroll and begin with focus.', 1, 2),
    (new.id, 'water_after_wake', '💧', 'Drink Water After Waking Up', 'Hydrate before checking anything else.', 1, 3),
    (new.id, 'study_coding_30', '📚', 'Study Coding for 30 Min', 'Spend a short block learning something useful.', 1, 4),
    (new.id, 'solve_dsa_1', '🧠', 'Solve 1 DSA Problem', 'Practice one problem even if it is small.', 1, 5),
    (new.id, 'deep_coding_60', '💻', '60 Min Deep Coding Session', 'Work without distractions for a full focus block.', 2, 6),
    (new.id, 'side_project_progress', '🚀', 'Make Progress on Side Project', 'Move one real thing forward today.', 2, 7),
    (new.id, 'learn_concept_1', '📝', 'Learn 1 New Coding Concept', 'Pick one concept and make it stick.', 2, 8),
    (new.id, 'read_code_15', '🔍', 'Read Code / Documentation for 15 Min', 'Read well-written code and understand it better.', 2, 9),
    (new.id, 'refactor_code', '🧹', 'Refactor or Clean Up Code', 'Leave the codebase clearer than you found it.', 2, 10),
    (new.id, 'meaningful_commit_1', '📦', 'Make at Least 1 Meaningful Git Commit', 'Commit work that meaningfully moves the project forward.', 3, 11),
    (new.id, 'notifications_off', '📵', 'Keep Notifications Off During Deep Work', 'Protect your focus from context switching.', 3, 12),
    (new.id, 'workout_15', '💪', '15 Min Workout', 'Move your body and reset your energy.', 3, 13),
    (new.id, 'read_pages_5', '📖', 'Read 5 Pages', 'Build momentum through consistent reading.', 3, 14),
    (new.id, 'plan_tomorrow_task', '📋', 'Plan Tomorrow’s Top Coding Task', 'End the day with a clear next step.', 3, 15),
    (new.id, 'sleep_10_11', '😴', 'Sleep by 10–11 PM', 'Protect recovery for tomorrow’s focus.', 3, 16)
  on conflict (user_id, habit_key) do update set
    icon = excluded.icon,
    label = excluded.label,
    detail = excluded.detail,
    phase = excluded.phase,
    sort_order = excluded.sort_order;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
