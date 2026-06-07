-- ============================================================
-- Auth + user-centric data model. ADDITIVE / non-breaking:
-- existing device-keyed functions keep working (service_role,
-- nullable user_id) until the app cutover switches them to users.
-- ============================================================

-- 1. profiles — one row per authenticated user (mirrors auth.users)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up (Google/Apple/etc.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. devices belong to a user (a user has many devices)
alter table public.devices
  add column if not exists user_id uuid references public.profiles(id) on delete cascade;
-- composite key lets a schedule prove the device is owned by that user
alter table public.devices
  drop constraint if exists devices_device_user_key;
alter table public.devices
  add constraint devices_device_user_key unique (device_id, user_id);

-- 3. call_schedules — user AND device; device must belong to the user
alter table public.call_schedules
  add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.call_schedules
  drop constraint if exists call_schedules_device_owned_fk;
alter table public.call_schedules
  add constraint call_schedules_device_owned_fk
  foreign key (device_id, user_id) references public.devices(device_id, user_id);

-- 4. daily_entries — owned by the user; device_id stays as "captured on";
--    plus the numeric fields. (Per-day uniqueness moves to user in the cutover.)
alter table public.daily_entries
  add column if not exists user_id        uuid references public.profiles(id) on delete cascade,
  add column if not exists mood_morning   smallint,  -- 1..5
  add column if not exists mood_evening   smallint,  -- 1..5
  add column if not exists alignment_score smallint; -- 0..100

-- 5. calls — one row per call event (morning/evening/midday)
create table if not exists public.calls (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  device_id        text references public.devices(device_id) on delete set null,
  daily_entry_id   uuid references public.daily_entries(id) on delete set null,
  kind             text not null check (kind in ('morning','evening','midday')),
  status           text not null default 'initiated'
                     check (status in ('initiated','ringing','answered','missed','declined','completed','failed')),
  started_at       timestamptz,
  duration_seconds integer,
  vapi_call_id     text,
  recording_url    text,
  transcript       jsonb,
  created_at       timestamptz not null default now()
);

-- 6. RLS — authenticated users see only their own rows.
--    (service_role still bypasses RLS for the cron + existing functions.)
alter table public.profiles enable row level security;
alter table public.calls    enable row level security;

grant select, insert, update, delete on public.profiles, public.calls to service_role;
grant select, insert, update, delete
  on public.profiles, public.devices, public.call_schedules, public.daily_entries, public.calls
  to authenticated;

drop policy if exists "own profile"   on public.profiles;
drop policy if exists "own devices"   on public.devices;
drop policy if exists "own schedules" on public.call_schedules;
drop policy if exists "own entries"   on public.daily_entries;
drop policy if exists "own calls"     on public.calls;

create policy "own profile"   on public.profiles      for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own devices"   on public.devices       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own schedules" on public.call_schedules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own entries"   on public.daily_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own calls"     on public.calls         for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
