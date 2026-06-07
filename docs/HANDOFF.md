# Align — Handoff (for the next session)

_Last updated: 2026-06-06_

## What Align is
A voice app that **calls you** every morning (and evening) like a real phone call — you pick up and talk to an AI. Not a notification, not journaling: an actual incoming call (CallKit) that rings even when the phone is locked. Its purpose, in the founder's words, is an **"energy cleanser / vibration manager"** — it moves you into your best state to meet the day. iOS-first; Android planned.

## Status: the skeleton is fully standing ✅
- **Native calls** — real CallKit incoming-call UI (foreground **and** locked-screen via VoIP/PushKit). Validated on device.
- **Autonomous scheduling** — you set a time in the app → a Supabase `pg_cron` job fires a VoIP push at that minute (in the device's timezone) → phone rings. **No laptop involved.** Validated end-to-end on device.
- **Auth** — Sign in with Apple working on device (Google wired but untested); login is required on first open; `profiles` auto-created on signup.
- **Data model** — `profiles`, `devices`, `call_schedules`, `daily_entries`, `calls`, all user-owned with per-user RLS.
- **Storage infra** — `daily_entries` (intentions + reflection merge on one day-row) and `save-entry`/`get-entries` ready for the conversation to write into.

## ▶️ The task for this session: #2 — the conversation
The call *connects* but it's still a generic assistant. **#2 makes it actually run the morning/evening routine and save what it captures.** Two parts:
1. **Vapi assistant design** — the morning + evening system prompts / structured-data extraction. **The design thinking lives in [`docs/morning-call-design.md`](./morning-call-design.md)** — read it first. The founder is co-designing the conversation with other agents in parallel; expect to author the actual Vapi prompt from that arc.
2. **Persistence** — on call-end (or via a Vapi post-call webhook → edge function), write the structured fields + **transcript** into `daily_entries` + log the event in `calls`. The `saveEntry()` helper (`lib/api.ts`) and the `save-entry` function already exist; transcripts are currently shown live but **not saved**.

## Architecture cheat-sheet
- **App:** Expo (RN) + expo-router, TypeScript. Key files: `app/_layout.tsx` (auth gate + call listeners), `app/login.tsx`, `app/index.tsx`, `app/active-call.tsx`, `app/schedule.tsx`; `lib/` (`callkeep.ts`, `voipPush.ts`, `supabase.ts`, `auth.tsx`, `api.ts`, `device.ts`, `scheduleStore.ts`).
- **Voice:** Vapi (`@vapi-ai/react-native`) on the Daily/WebRTC stack. Morning assistant id is in `.env.local` (`EXPO_PUBLIC_VAPI_MORNING_ASSISTANT_ID`). An **evening** assistant still needs to be created.
- **Calls:** `react-native-callkeep` (CallKit/ConnectionService) + `react-native-voip-push-notification` + a custom config plugin `plugins/with-voip-pushkit.js` (patches AppDelegate for PushKit → reports the call to CallKit).
- **Backend:** Supabase project `align` (ref `ftguelkzinuevjervbjo`, region us-west-2).
  - Tables: `profiles`, `devices`, `call_schedules`, `daily_entries`, `calls`.
  - Edge functions: `send-call` (cron→APNs VoIP push), `register-token`, `claim-device`, `save-schedule`, `save-entry`, `get-entries`.
  - `pg_cron` job `dispatch-due-calls` runs every minute → `dispatch_due_calls()` → `send-call`.
  - APNs `.p8` is a function secret; `project_url` + `service_role_key` live in Vault.

## How to run / deploy
- **Dev client (daily driver):** `npx expo start --dev-client -c` then open the app (it live-reloads JS). Rebuild only when native deps change: `eas build --profile development-device --platform ios`.
- **Supabase CLI:** use the full tarball at `~/.local/share/supabase/supabase` (the bare shim breaks). `db push` to apply migrations, `functions deploy <name>` to deploy. It's already `link`ed and authed via `supabase login`.
- **iOS simulator does NOT work for calls** (see gotchas) — test on the physical device.

## Backlog
- **🔐 ROTATE the Supabase DB password** — it was pasted in chat (exposed). Reset in Dashboard → Settings → Database, keep the new one out of chat. The CLI uses a stored access token (not the DB password) so it keeps working; move DB verification off raw `psql` onto the CLI/functions. (anon key = public by design, fine; service_role was never printed.)
- **Apple sign-in on Android** — needs the web OAuth flow (Services ID + signing key + redirect — skipped for native iOS). Add when Android ships; Google is native on both and covers Android for now.
- **Load saved times from the backend** in the Call-times screen (a `get-schedule` function) — currently it reads local storage only. (There's a spawned-task chip for this.)

## Said we'd do but haven't yet (loose ends)
- **Finish Phase 5:** user-scope the **schedule save** (`call_schedules.user_id` is still null — schedules tie to the device, not yet the account); consider switching app reads/writes to direct supabase-js (RLS) and retiring redundant functions.
- **Test Google sign-in** (only Apple is validated).
- **Verify the device-claim** actually landed in the DB (we deployed the nullable fix; the app reported no errors and calls work, but the `user_id` stamp wasn't re-confirmed in the DB this session).
- **Sign-out button + a simple profile screen.**
- **Midday check-in** time (schema supports `kind = 'midday'`).
- **Save transcripts** (part of #2).
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
