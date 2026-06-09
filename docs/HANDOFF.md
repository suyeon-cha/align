# Align — Handoff (read this to pick up)

_Last updated: 2026-06-08_

## 🧭 Agent: start here — do these in order
1. **Read [`WORKING_STYLE.md`](./WORKING_STYLE.md) and follow it.** How I want you to talk + work: direct, opinionated, warm, honest-over-agreeable — a **co-founder, not an assistant.** Sets your voice for the whole session.
2. **Read the rest of this doc** — the phase, the energy, what's built, this session's task.
3. **Read [`morning-call-design.md`](./morning-call-design.md)** — the design for what we're building (#2).
4. **Skim [`BACKLOG.md`](./BACKLOG.md)** — prioritized tickets (sev 1–5).
5. **Propose a short plan** for the task → we align → you build.
6. **Work** — commit the moment it works, branch per change, keep the energy.
7. **At session end → read [`SESSION_GUIDE.md`](./SESSION_GUIDE.md)** and produce the three wrap-up docs: (a) this session's summary in `sessions/`, (b) an updated `HANDOFF.md`, (c) the next session's outline + first move. That's how the next agent wakes up warm.

_Everything below is your toolkit for this session._

## ⚙️ Phase: BUILDING (pre-launch)
We're shipping the product *fast* — **no real users yet, test data only.** Risk posture: **move fast, commit on green, YOLO is fine.**
⚠️ This **flips at PRODUCTION** (real users): then it's caution, backups, no breaking changes, privacy is live, migrations are dangerous. _Update this line the day that changes._

## 🔥 The energy
> _If you read only two things, read **this** + **`morning-call-design.md`**._
- **Vibe:** day-one **hackathon**, 5am, flying. We built the *entire skeleton* — calls, scheduling, auth, storage — in one marathon. Build fast, ship fast, keep momentum. High vibes.
- **How we roll:** commit on green · branch per change · lean docs · **never lose work** · match my pace (I think out loud — that's *decisions*, not confusion).
- **The soul — never lose this:** Align is an **energy cleanser / vibration manager** — it calls you and moves you into your best state. Every technical choice serves *that feeling.*
- **👉 Last session (02):** **#2's morning loop is PROVEN end-to-end** — the ritual prompt runs the call, Claude extracts the arc + affect fields into `daily_entries` (validated on a real device call). **Next:** grounded ElevenLabs voice · Level-0 memory injection · evening assistant. See `morning-call-design.md` + `memory-and-insight.md`.

## What Align is
A voice app that **calls you** every morning (and evening) like a real phone call — you pick up and talk to an AI. Not a notification, not journaling: an actual incoming call (CallKit) that rings even when the phone is locked. Its purpose, in the founder's words, is an **"energy cleanser / vibration manager"** — it moves you into your best state to meet the day. iOS-first; Android planned.

## Status: the skeleton is fully standing ✅
- **Native calls** — real CallKit incoming-call UI (foreground **and** locked-screen via VoIP/PushKit). Validated on device.
- **Autonomous scheduling** — you set a time in the app → a Supabase `pg_cron` job fires a VoIP push at that minute (in the device's timezone) → phone rings. **No laptop involved.** Validated end-to-end on device.
- **Auth** — Sign in with Apple working on device (Google wired but untested); login is required on first open; `profiles` auto-created on signup.
- **Data model** — `profiles`, `devices`, `call_schedules`, `daily_entries`, `calls`, all user-owned with per-user RLS.
- **Storage infra** — `daily_entries` (intentions + reflection merge on one day-row) and `save-entry`/`get-entries` ready for the conversation to write into.

## ▶️ Where #2 landed (Session 02) + what's next
**#2's morning loop is DONE and proven on device:** the call runs the 6-beat ritual (prompt in `vapi/morning.md`, pushed to the assistant via `scripts/push-vapi-config.mjs`), the transcript saves on hang-up, and **our own** extractor (`extract-entry`, Claude `haiku-4-5`, forced-tool JSON) writes the structured arc + affect fields into `daily_entries`. Validated end-to-end (real call → accurate `intention` / `action_steps` / affect "grounded").

**Next session — pick up here:**
1. **Grounded voice** — add an ElevenLabs provider key *in the Vapi dashboard* → set a steady voice (biggest felt upgrade; voice is still Vapi's default).
2. **Level-0 memory** — inject yesterday's `daily_entries` row at `vapi.start()` via `variableValues` so the call remembers.
3. **Evening assistant** — clone the arc with a self-compassion framing: `vapi/evening.md` + `evening.schema.json` + a new `EXPO_PUBLIC_VAPI_EVENING_ASSISTANT_ID`; the app picks the assistant by `kind`.
4. **Extraction tuning + the synthesized profile** (FR-016) — the basis for memory + the "edit your brain" surfaces.
Design: [`morning-call-design.md`](./morning-call-design.md) + [`memory-and-insight.md`](./memory-and-insight.md).

## Architecture cheat-sheet
- **App:** Expo (RN) + expo-router, TypeScript. Key files: `app/_layout.tsx` (auth gate + call listeners), `app/login.tsx`, `app/index.tsx`, `app/active-call.tsx`, `app/schedule.tsx`; `lib/` (`callkeep.ts`, `voipPush.ts`, `supabase.ts`, `auth.tsx`, `api.ts`, `device.ts`, `scheduleStore.ts`).
- **Voice:** Vapi (`@vapi-ai/react-native`) on the Daily/WebRTC stack. Morning assistant id is in `.env.local` (`EXPO_PUBLIC_VAPI_MORNING_ASSISTANT_ID`). An **evening** assistant still needs to be created.
- **Calls:** `react-native-callkeep` (CallKit/ConnectionService) + `react-native-voip-push-notification` + a custom config plugin `plugins/with-voip-pushkit.js` (patches AppDelegate for PushKit → reports the call to CallKit).
- **Backend:** Supabase project `align` (ref `ftguelkzinuevjervbjo`, region us-west-2).
  - Tables: `profiles`, `devices`, `call_schedules`, `daily_entries`, `calls`.
  - Edge functions: `send-call` (cron→APNs VoIP push), `register-token`, `claim-device`, `save-schedule`, `save-entry`, `get-entries`, **`extract-entry`** (Claude extraction → `daily_entries`), `vapi-webhook` (**dormant** — built for Vapi-side extraction, we use client-side `extract-entry`).
  - `pg_cron` job `dispatch-due-calls` runs every minute → `dispatch_due_calls()` → `send-call`.
  - APNs `.p8` is a function secret; `project_url` + `service_role_key` live in Vault. **`ANTHROPIC_API_KEY`** is a function secret (used by `extract-entry`).
  - **Local-only keys in `.env.local`** (gitignored): `ANTHROPIC_API_KEY`, `VAPI_PRIVATE_KEY` (assistant config), `SUPABASE_SERVICE_ROLE_KEY` (the new `sb_secret_…` format). Never in chat / never in the app bundle.

## How to run / deploy
- **Dev client (daily driver):** `npx expo start --dev-client -c` then open the app (it live-reloads JS). Rebuild only when native deps change: `eas build --profile development-device --platform ios`.
- **Supabase CLI:** use the full tarball at `~/.local/share/supabase/supabase` (the bare shim breaks). `db push` to apply migrations, `functions deploy <name>` to deploy. It's already `link`ed and authed via `supabase login`.
- **iOS simulator does NOT work for calls** (see gotchas) — test on the physical device.
- **📞 Trigger a call on demand — when the user says "call me":** run `node scripts/ring.mjs [morning|evening]` from the project root. It reads the latest device and fires the VoIP push (same path the cron uses) → the phone rings. Needs in `.env.local`: `SUPABASE_SERVICE_ROLE_KEY` (`sb_secret_…` — reads the DB) **and** `EXPO_PUBLIC_SUPABASE_ANON_KEY` (a JWT — invokes the function; **the Functions gateway rejects the `sb_secret` key**, so reads and invokes use different keys). **When the user asks you to call them, just run this.**
- **Configure the Vapi assistant from code:** `node scripts/push-vapi-config.mjs` pushes `vapi/morning.md` as the system prompt (needs `VAPI_PRIVATE_KEY`). The prompt lives in the repo, not the dashboard.

## Backlog
The full prioritized list (severity 1–5) lives in **[BACKLOG.md](./BACKLOG.md)**.
Top of stack: 🔐 **rotate the exposed Supabase DB password** (sev 1), then persist
transcripts + the clarity/consultant mode (sev 2).

## Said we'd do but haven't yet (loose ends)
- **Finish Phase 5:** user-scope the **schedule save** (`call_schedules.user_id` is still null — schedules tie to the device, not yet the account); consider switching app reads/writes to direct supabase-js (RLS) and retiring redundant functions.
- **Test Google sign-in** (only Apple is validated).
- **Verify the device-claim** actually landed in the DB (we deployed the nullable fix; the app reported no errors and calls work, but the `user_id` stamp wasn't re-confirmed in the DB this session).
- **Sign-out button + a simple profile screen.**
- **Midday check-in** time (schema supports `kind = 'midday'`).
- ~~Save transcripts~~ ✅ **done (Session 02)** — transcript + Claude-extracted fields persist to `daily_entries`.
- **Grounded voice not set yet** — Vapi assistant still uses the default voice; needs an ElevenLabs provider key added in the Vapi dashboard.
- **`calls` table not yet logged** — `extract-entry` writes `daily_entries` but doesn't insert a `calls` row (the dormant `vapi-webhook` would; revisit if we want call-event logging).
- **Finish the morning-call research** — affect labeling + peak-end rule were not searched (hit the web-search session limit); see the design doc.
- Clean up the orphan `bfa2b8c4` / `suyeon-iphone` device rows.

## Gotchas (hard-won — don't re-learn these)
- **iOS Simulator crashes any Vapi/WebRTC call** (`AUVoiceIO` voice-processing unit → `_ReportRPCTimeout` → SIGABRT) regardless of dependency versions. **Test on a real device.** We burned hours misattributing this to daily-js versions.
- **Native modules are frozen into the build; JS hot-swaps from Metro.** Adding a JS import for a new native module crashes until you rebuild the dev client.
- **Mac LAN IP changes between Wi-Fi networks** → Metro/old VoIP endpoint goes stale. Re-check `ipconfig getifaddr en0`; the dev client's "recently opened" server can be a stale IP.
- **Supabase pooler host is `aws-1-us-west-2.pooler.supabase.com`** (not aws-0; direct `db.<ref>.supabase.co` no longer resolves). Exact string is in `supabase/.temp/pooler-url`.
- **CocoaPods needs `LANG=en_US.UTF-8`**; `.npmrc` has `legacy-peer-deps=true` (EAS's npm install needs it).

## Working agreements
- **Commit the moment something works** (even imperfect), **branch per change**, merge when confirmed. `main` is the safe fallback. (Born from an early session where a working call was lost.)
- Be honest over agreeable; verify before asserting.
- Don't paste secrets in chat.
