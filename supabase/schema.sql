-- Water Tracker schema (accounts version). Paste into Supabase: SQL Editor -> New query -> Run.
-- Each row belongs to the signed-in user (auth.uid()). Row Level Security makes
-- sure users can only read and change their own rows.

-- Remove tables from the earlier sync-code version (deletes any data in them).
drop table if exists public.entries;
drop table if exists public.settings;
drop function if exists public.current_sync_code();

-- Drink entries
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ml integer not null check (ml > 0 and ml <= 5000),
  ts timestamptz not null,
  created_at timestamptz not null default now()
);
create index entries_user_ts_idx on public.entries (user_id, ts desc);

-- One settings row per user
create table public.settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  goal_ml integer not null default 2500 check (goal_ml between 500 and 6000),
  unit text not null default 'ml' check (unit in ('ml', 'oz')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  updated_at timestamptz not null default now()
);

alter table public.entries enable row level security;
alter table public.settings enable row level security;

-- Users can select, insert, update and delete only their own rows.
create policy "entries_own_rows" on public.entries
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "settings_own_row" on public.settings
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
