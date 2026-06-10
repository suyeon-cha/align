# TASKS — the next action, always

_The execution board. Open this first; the **▶ NEXT** line is your move._

> **▶ NEXT:** Build the **evening assistant** → start at task **E1** below
> (clone `vapi/morning.md` → `vapi/evening.md`, self-compassion reframe).

**How this doc works (so it stays lean):** only **active** tickets get broken
into steps here. Everything else stays a one-liner in [`BACKLOG.md`](./BACKLOG.md)
until it reaches the top, then we step it out. **TASKS = _how_, in order ·
BACKLOG = _what / why_.** Check a box the moment it's true; prune shipped work to
the bottom. Commit on green.

---

## 🔥 Active — Evening assistant (FR — clone the arc, evening framing)

_Why: closes the daily loop. AM sets the intention; PM reports the outcome — the
morning→evening **n-of-1 pair** is our core signal (see `memory-and-insight.md`).
Framing must be **warm + non-shaming** (self-compassion — Neff) or people dodge
the call._

**Good news from the code:** `hooks/useVapiCall.ts` already takes
`kind: "morning" | "evening"` and threads it through `saveEntry` / `extractEntry`
/ `variableValues`. Only the **assistant-id pick** and **passing kind from the
screen** are missing. Closer than it looks.

- [ ] **E1 · Prompt.** Clone `vapi/morning.md` → `vapi/evening.md`. Keep the
      6-beat spine; reframe for night: _Land → Reflect (what happened) →
      Were-you-aligned (warm, non-shaming) → Clear → Send-off._ Self-compassion
      over self-criticism throughout.
- [ ] **E2 · Schema.** Clone `vapi/morning.schema.json` → `vapi/evening.schema.json`.
      Evening fields: `alignment` (did the day match the AM intention),
      `actions` (what they did), end-of-day affect (`valence`/`arousal`/`affect_label`),
      `clearing`. **Mirror the morning field shape** so it merges into the same
      day-row (reflection side), not a new row.
- [ ] **E3 · Push script.** Generalize `scripts/push-vapi-config.mjs` to take
      `[morning|evening]` — currently hardcodes `EXPO_PUBLIC_VAPI_MORNING_ASSISTANT_ID`
      + `vapi/morning.md`. Make it pick the id + md file by arg.
- [ ] **E4 · Create the assistant.** Make the evening assistant in Vapi → grab
      its id → add `EXPO_PUBLIC_VAPI_EVENING_ASSISTANT_ID` to `.env.local`
      (gitignored). Run the E3 script to push the evening prompt onto it.
- [ ] **E5 · App picks by kind.** `hooks/useVapiCall.ts`: add an
      `EVENING_ASSISTANT_ID` const (line ~8) and select id by `kind` at the
      `vapiRef.current.start(...)` call (line ~97). Hook already receives `kind`. ✅
- [ ] **E6 · Thread kind to the screen.** `app/active-call.tsx:17` calls
      `useVapiCall()` with no kind → always morning. Pass the call's `kind` in.
      **Verify how `kind` arrives** at the route (VoIP push payload → route param?
      `ring.mjs evening` already sends a kind — confirm it reaches the JS side).
- [ ] **E7 · Extraction merges.** `supabase/functions/extract-entry`: add the
      evening branch (E2 fields) and **update the reflection columns of the same
      `daily_entries` (user/device, date) row** — don't clobber the morning
      intention side. Deploy: `functions deploy extract-entry`.
- [ ] **E8 · Prove on device.** `node scripts/ring.mjs evening` → take the call →
      confirm evening fields land in `daily_entries` on the **same row** as the
      morning entry. Commit. 🎉

---

## 🔓 Sev-1 quick win — rotate the exposed DB password (FR-001)

_Independent of the build; it's a data risk (password was pasted in chat). ~10 min._

- [ ] Reset DB password: Supabase Dashboard → Settings → Database.
- [ ] Update anything that stored the old one (check `.env.local`,
      `supabase/.temp/pooler-url`). Keep the new value **out of chat / git**.
- [ ] Confirm `db push` + `functions deploy` still auth with the rotated creds.

---

## 🧊 Queued — next up, in priority order (step out when they go active)

1. **Grounded voice** (nice-to-have) — add an ElevenLabs/Cartesia/Hume provider
   key in the Vapi dashboard; audition 2–3 "warm-but-honestly-synthetic" voices;
   pick **by listening**; set on the morning assistant.
2. **Log a `calls` row** — `extract-entry` writes `daily_entries` but never inserts
   a `calls` event row. Small; do when extraction is already open.
3. **FR-006** — finish schedule user-scoping (`call_schedules.user_id` still null).
4. **FR-007** — `get-schedule` backend load (call-times screen shows defaults, not saved).
5. **FR-009** — sign-out button + simple profile screen.
6. **FR-008** — test Google sign-in on device (only Apple validated).
7. **FR-022** — "stop talking" manual-interrupt button (find the Vapi silence
   control — **not** `.stop()`, which ends the call).

---

## 🛑 Blocked / on hold — needs a decision before steps

- **FR-016 · Memory injection** _(founder's call — parked)._ Level-0 = inject
  yesterday's row at call start. **Unblocks when** we decide how to **weight**
  past calls as they pile up (recency-weighted decay). Design in
  `memory-and-insight.md`.
- **FR-002 · Clarity/consultant mode** _(design-first)._ A sharp, framework-driven
  goal-clarity persona, distinct from the morning-energy voice. **Unblocks when**
  the persona + arc are designed (don't code before the design lands).

---

## ✅ Just shipped _(prune as it ages — git remembers)_

- **FR-024** — this board. (S03)
- **FR-003** — persist transcripts + Claude extraction → `daily_entries`. (S02)
- **FR-015** — structured affect/state extraction (`extract-entry`). (S02)
- **FR-021** — `daily_entries` evolved to the conversation arc. (S02)
