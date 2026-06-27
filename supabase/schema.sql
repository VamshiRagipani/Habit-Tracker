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

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------
-- HABITS (per-user list, seeded with the original 6 defaults)
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

create policy "habits_select_own" on public.habits for select using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits for insert with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits for update using (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits for delete using (auth.uid() = user_id);

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

create policy "logs_select_own" on public.daily_logs for select using (auth.uid() = user_id);
create policy "logs_insert_own" on public.daily_logs for insert with check (auth.uid() = user_id);
create policy "logs_update_own" on public.daily_logs for update using (auth.uid() = user_id);
create policy "logs_delete_own" on public.daily_logs for delete using (auth.uid() = user_id);

create index if not exists idx_daily_logs_user_date on public.daily_logs (user_id, log_date);

-- ---------------------------------------------------------
-- REFLECTIONS (one row per day)
-- ---------------------------------------------------------
create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

alter table public.reflections enable row level security;

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
-- New user hook: create profile + seed the original 6 habits
-- (runs with elevated privileges via SECURITY DEFINER, bypassing RLS
--  just for this one bootstrap insert — required since the new user
--  has no session yet at the moment auth.users gets the row)
-- ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));

  insert into public.habits (user_id, habit_key, icon, label, detail, phase, sort_order) values
    (new.id, 'phone_lock',  '📵', 'No phone for first 30 min',  'Wake up → water → desk. Zero apps.', 1, 1),
    (new.id, 'focus_block', '🧠', '45-min deep work done',      'DSA / side project / article. Before anything else.', 1, 2),
    (new.id, 'notif_off',   '🔕', 'Notifications off 9am–7pm',  'Check WhatsApp at 1pm & 8pm only.', 2, 3),
    (new.id, 'no_binge',    '📅', 'No weekend-only binge plan', 'Did I do something today instead of saving it for Saturday?', 2, 4),
    (new.id, 'needle',      '🎯', 'Moved the needle today',     'Not just busy — actually progressed on a real goal.', 3, 5),
    (new.id, 'gym',         '💪', 'Gym / workout done',         'Push / Pull / Legs / Shoulders split.', 3, 6);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
