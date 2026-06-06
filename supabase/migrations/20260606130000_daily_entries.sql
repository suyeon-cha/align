-- One record per device per day: morning intentions + evening reflection.
-- (Device-keyed for now; add user_id when accounts land.)
create table if not exists public.daily_entries (
  id          uuid primary key default gen_random_uuid(),
  device_id   text not null references public.devices(device_id) on delete cascade,
  entry_date  date not null,

  -- morning (intentions)
  desired_feeling      text,
  goals                jsonb not null default '[]'::jsonb,   -- array of strings
  todos                jsonb not null default '[]'::jsonb,   -- array of strings
  midday_checkin       boolean,
  midday_time          text,                                  -- 'HH:MM'
  morning_transcript   jsonb,
  morning_completed_at timestamptz,

  -- evening (reflection)
  actual_feeling       text,
  aligned              boolean,
  reflection           text,
  evening_transcript   jsonb,
  evening_completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (device_id, entry_date)
);

-- Same lockdown as the rest: RLS on, edge functions (service_role) write.
alter table public.daily_entries enable row level security;
grant select, insert, update, delete on public.daily_entries to service_role;
