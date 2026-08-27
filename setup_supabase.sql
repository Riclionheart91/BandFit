-- ============================================================
-- BandFit — Setup completo Supabase
-- Esegui in: Supabase Dashboard > SQL Editor > New query > Run
-- Idempotente: puoi rilanciarlo senza errori se già eseguito
-- ============================================================

-- 1. TABELLE -----------------------------------------------------

create table if not exists sessions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  "workoutId" text not null,
  "workoutName" text not null,
  date timestamptz not null default now(),
  duration integer not null default 0,
  "heartRates" jsonb not null default '[]',
  calories integer not null default 0,
  exercises jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists custom_workouts (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text not null,
  description text not null default '',
  exercises jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists weekly_programs (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  frequency integer not null,
  "createdAt" timestamptz not null default now(),
  "currentWeek" integer not null default 1,
  "currentDay" integer not null default 0,
  days jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- 2. INDICI --------------------------------------------------------

create index if not exists idx_sessions_user_date on sessions (user_id, date desc);
create index if not exists idx_custom_workouts_user on custom_workouts (user_id);
create index if not exists idx_weekly_programs_user on weekly_programs (user_id);

-- 3. TRIGGER updated_at ---------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_custom_workouts_updated on custom_workouts;
create trigger trg_custom_workouts_updated
before update on custom_workouts
for each row execute function set_updated_at();

drop trigger if exists trg_weekly_programs_updated on weekly_programs;
create trigger trg_weekly_programs_updated
before update on weekly_programs
for each row execute function set_updated_at();

-- 4. ROW LEVEL SECURITY -----------------------------------------------

alter table sessions enable row level security;
alter table custom_workouts enable row level security;
alter table weekly_programs enable row level security;

drop policy if exists "sessions_select_own" on sessions;
drop policy if exists "sessions_insert_own" on sessions;
drop policy if exists "sessions_update_own" on sessions;
drop policy if exists "sessions_delete_own" on sessions;

create policy "sessions_select_own" on sessions
  for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on sessions
  for insert with check (auth.uid() = user_id);
create policy "sessions_update_own" on sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions_delete_own" on sessions
  for delete using (auth.uid() = user_id);

drop policy if exists "custom_workouts_select_own" on custom_workouts;
drop policy if exists "custom_workouts_insert_own" on custom_workouts;
drop policy if exists "custom_workouts_update_own" on custom_workouts;
drop policy if exists "custom_workouts_delete_own" on custom_workouts;

create policy "custom_workouts_select_own" on custom_workouts
  for select using (auth.uid() = user_id);
create policy "custom_workouts_insert_own" on custom_workouts
  for insert with check (auth.uid() = user_id);
create policy "custom_workouts_update_own" on custom_workouts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "custom_workouts_delete_own" on custom_workouts
  for delete using (auth.uid() = user_id);

drop policy if exists "weekly_programs_select_own" on weekly_programs;
drop policy if exists "weekly_programs_insert_own" on weekly_programs;
drop policy if exists "weekly_programs_update_own" on weekly_programs;
drop policy if exists "weekly_programs_delete_own" on weekly_programs;

create policy "weekly_programs_select_own" on weekly_programs
  for select using (auth.uid() = user_id);
create policy "weekly_programs_insert_own" on weekly_programs
  for insert with check (auth.uid() = user_id);
create policy "weekly_programs_update_own" on weekly_programs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weekly_programs_delete_own" on weekly_programs
  for delete using (auth.uid() = user_id);

-- 5. STORAGE BUCKET PUBBLICO PER LE GIF ESERCIZI --------------------

insert into storage.buckets (id, name, public)
values ('gifs', 'gifs', true)
on conflict (id) do update set public = true;

drop policy if exists "gifs_public_read" on storage.objects;
create policy "gifs_public_read" on storage.objects
  for select using (bucket_id = 'gifs');

drop policy if exists "gifs_authenticated_write" on storage.objects;
create policy "gifs_authenticated_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'gifs');

drop policy if exists "gifs_authenticated_update" on storage.objects;
create policy "gifs_authenticated_update" on storage.objects
  for update to authenticated using (bucket_id = 'gifs');

drop policy if exists "gifs_authenticated_delete" on storage.objects;
create policy "gifs_authenticated_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'gifs');

-- ============================================================
-- Fine setup. URL pubblico bucket GIF:
-- https://<project-ref>.supabase.co/storage/v1/object/public/gifs/
-- Da inserire in EXPO_PUBLIC_CDN_BASE_URL (.env)
-- ============================================================
