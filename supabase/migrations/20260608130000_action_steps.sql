-- The "Aim" beat evolved (docs/morning-call-design.md): one intention (the anchor)
-- PLUS its concrete, finishable action steps (the breakdown). This is NOT the old
-- scattered goals/todos — it's the decomposition of the single intention.
alter table public.daily_entries
  add column if not exists action_steps jsonb not null default '[]'::jsonb;  -- array of step strings
