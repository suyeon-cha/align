-- The open, self-adapting layer (docs/memory-and-insight.md #12): per-user "life
-- threads" that grow/prune WITH the person (tennis, a move, a breakup). New
-- salience = a new ENTRY here, never a new column. Lives on the user profile
-- (persists across days), not on a daily row. MVP = the vessel; the auto-populate
-- + prune logic is V2 (FR-016).
alter table public.profiles
  add column if not exists life_threads jsonb not null default '[]'::jsonb;  -- [{ thread, status, notes, since }]
