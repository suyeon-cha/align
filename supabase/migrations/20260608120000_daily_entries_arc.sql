-- Evolve daily_entries from the old "planning-meeting" framing (goals/todos,
-- 1-5 mood) to the morning-call ARC + structured affect capture.
--   • Arc:    docs/morning-call-design.md  (Land·Appreciate·Tune·Aim·Clear·Send-off)
--   • Affect: docs/memory-and-insight.md   (valence × arousal = "vibration" + a label,
--             captured at BOTH ends — the morning→evening n-of-1 experiment)
-- BUILDING phase, test data only → safe to drop the superseded columns.

-- 1. Arc fields (morning capture)
alter table public.daily_entries
  add column if not exists gratitude text,   -- Appreciate beat
  add column if not exists intention text,   -- Aim beat (ONE thing — replaces goals/todos)
  add column if not exists clearing  text;   -- Clear beat (what they set down)

-- 2. Structured affect — Russell's circumplex. valence ∈ [-1,1] (unpleasant..pleasant),
--    arousal ∈ [-1,1] (calm..activated); label = human-readable (e.g. "anxious").
alter table public.daily_entries
  add column if not exists valence_morning      real,
  add column if not exists arousal_morning      real,
  add column if not exists affect_label_morning text,
  add column if not exists valence_evening      real,
  add column if not exists arousal_evening      real,
  add column if not exists affect_label_evening text;

-- 3. Tags for the future insight engine (FR-019): themes surfaced, actions taken.
alter table public.daily_entries
  add column if not exists themes  jsonb not null default '[]'::jsonb,
  add column if not exists actions jsonb not null default '[]'::jsonb;

-- 4. Drop the superseded columns (no real data yet).
alter table public.daily_entries
  drop column if exists goals,
  drop column if exists todos,
  drop column if exists mood_morning,
  drop column if exists mood_evening,
  drop column if exists alignment_score;
