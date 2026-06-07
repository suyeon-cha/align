# Align — Technical Reference & Glossary

_The "everything technical" doc: code status, branches, the commit map, the
systems we built, the decisions behind them, the stack, and a keys/services
glossary. Updated 2026-06-06._

> ⚠️ **No secret values live in this file** (it's version-controlled, possibly
> public). Secrets are referenced by *name + location* only. See "Keys & secrets."

---

## 1. Code status
- **`main` is the source of truth** and is **pushed to GitHub** (`origin/main` @ `5eef56e`).
- **Working & validated on a real device:** native calls (foreground + locked-screen VoIP), autonomous cloud scheduling, Sign in with Apple, the storage layer.
- **Built but not yet validated:** Google sign-in (wired, untested); device-claim (deployed; `user_id` stamp not re-confirmed in DB).
- **Partial:** Phase 5 — schedule rows are not yet user-scoped (`call_schedules.user_id` still null).
- **Total: 25 commits**, 6 feature branches (4 merged), 0 uncommitted changes at session end.

## 2. Repository & branches
- **Remote:** `origin` → https://github.com/suyeon-cha/align.git
- **Default branch:** `main` (always-green, the fallback).

| Branch | Purpose | Status |
|---|---|---|
| `main` | integration / source of truth | active, pushed |
| `fix/daily-upgrade` | pin the supported Daily/WebRTC stack | merged → `main` |
| `feat/native-call` | CallKit + VoIP background ring | merged → `main` |
| `feat/scheduling` | Supabase cron scheduler + app schedule UI | merged → `main` (also on origin) |
| `feat/storage` | `daily_entries` + save/get functions | merged → `main` |
| `feat/auth` | Apple/Google sign-in + user data model | merged → `main` |

**Workflow:** branch per change → commit the moment it works → merge to `main`
when confirmed on device (`--no-ff`, so merges are visible). `main` is never broken.

## 3. Branch / merge map
```
main
*   5eef56e  Merge feat/auth  ── Sign in with Apple, user data model, session docs
|\
| * 15f4a4f  docs: handoff, morning-call design, session log
| * 3f41f40  Phase 5 (partial): device-claim under user + user-aware API
| * c7743f4  Auth: Supabase client + Apple/Google sign-in + login gate
| * 4d93fd3  Auth schema: profiles, ownership, calls table, mood/alignment, RLS
|/
*   fe2e1a6  Merge feat/storage ── daily_entries storage
|\
| * 45fae75  Daily-entries: schema + save-entry/get-entries
|/
* e95816a  Local schedule persistence (AsyncStorage)
*   a7fcb9e  Merge feat/scheduling ── autonomous Supabase calls
|\
| * 0408431  App-side scheduling: device ID, token repoint, schedule screen
| * a8ced5c  Grant service_role table access
| * 2f5c96d  Scheduling backend: schema + pg_cron dispatcher + edge functions
|/
*   eaea54a  Merge feat/native-call ── CallKit + VoIP background ring
|\
| * b9e2f3a  VoIP PushKit background-call path  (built w/ OpenAI Codex)
| * a24222d  Finish native CallKeep call flow
| * 70ce190  Native-call checkpoint
|/
* 791056d  development-device EAS profile (live-reload on device)
*   4c74b7a  Merge fix/daily-upgrade ── supported Daily stack
|\
| * f42c52b  .npmrc legacy-peer-deps for EAS
| * c418506  Upgrade to react-native-daily-js 0.85 + daily-js 0.90
|/
* 9e25e61  Real-time transcript streaming
* e060485  Transcript: final-only messages
* 2177da2  daily-js 0.90 (stop server ejection)
* 0152cad  Working Vapi voice call + transcript
* 0abbcdd  Initial scaffold: Expo Router + Vapi
```

## 4. What we accomplished, by feature
- **Voice foundation** (`0abbcdd`–`9e25e61`): Expo Router app; Vapi voice calls; live transcript; stabilized the Daily/WebRTC stack (the unsupported `daily-js 0.81` was getting ejected by Daily's servers).
- **Supported Daily stack** (`fix/daily-upgrade`): `react-native-daily-js@0.85` + `daily-js@0.90` + `react-native-webrtc@124`; `.npmrc` so EAS installs resolve.
- **Dev workflow** (`791056d`): EAS `development-device` profile → a dev client that live-reloads JS over Metro (rebuild only on native changes).
- **Native calls** (`feat/native-call`): real CallKit/ConnectionService incoming-call screen (`react-native-callkeep`); locked-screen ring via PushKit/VoIP + a custom AppDelegate config plugin.
- **Scheduling** (`feat/scheduling`): Supabase schema (`devices`, `call_schedules`), a `pg_cron` dispatcher, and the `send-call` edge function that signs an APNs VoIP push; app-side device ID + schedule screen.
- **Storage** (`feat/storage`): `daily_entries` (morning + evening merge on one day-row) + `save-entry`/`get-entries`.
- **Auth** (`feat/auth`): `profiles` + signup trigger, `user_id` ownership across tables, per-user RLS, Apple/Google native sign-in, login gate, device-claim.

## 5. Systems implemented
1. **Native call layer** — CallKit (iOS) / ConnectionService (Android) via `react-native-callkeep`; PushKit/VoIP for waking a locked phone.
2. **Voice AI** — Vapi (`@vapi-ai/react-native`) over the Daily/WebRTC transport.
3. **Cloud scheduler** — Supabase `pg_cron` (every minute) → `dispatch_due_calls()` → `send-call` edge function → APNs VoIP push. Runs 24/7, no laptop.
4. **Backend** — Supabase Postgres + RLS + Deno edge functions + Vault (secrets) + `pg_net` (HTTP from SQL).
5. **Auth + identity** — Supabase Auth + Apple/Google ID-token sign-in; user-owned data via RLS.
6. **Data model** — `profiles`, `devices`, `call_schedules`, `daily_entries`, `calls`.
7. **Dev + process** — EAS dev client + Metro; commit-on-green / branch-per-change git; session-summary docs.

## 6. Key decisions (and why)
- **Expo + Vapi + Supabase** — all mainstream and maintainable (founder's requirement), single managed backend for DB + auth + scheduler + functions.
- **Real CallKit over a fake call screen** — the product *is* "a phone that calls you"; a faux UI can't wake a locked phone. VoIP/PushKit was required for background.
- **Pin the Daily stack to supported versions** — Daily's servers eject unsupported `daily-js`; the simulator crash was *not* this (see gotchas).
- **Supabase for scheduling** — managed `pg_cron` + edge functions = a 24/7 scheduler with no server to babysit, and it doubles as our auth + storage.
- **Device-keyed → user-keyed** — started device-keyed to move fast, migrated to user accounts (Apple/Google) so history follows the *person*, not the phone.
- **Native sign-in (ID-token flow)** — Apple is native-only (bundle id); Google native covers iOS+Android; Apple-on-Android (web OAuth) deferred to backlog.
- **Commit-on-green + branch-per-change** — adopted after losing a working voice call early with no fallback.
- **Session-summary docs** — adopted this session (see `README.md`) so context survives across chats/agents.

## 7. Stack, tools & services
- **App:** Expo (React Native 0.85) + expo-router, TypeScript, Hermes.
- **Build/deploy:** EAS Build (`development-device`, `preview`), Metro.
- **Voice:** Vapi; Daily/WebRTC transport.
- **Calls:** `react-native-callkeep`, `react-native-voip-push-notification`, custom `plugins/with-voip-pushkit.js`.
- **Backend:** Supabase (Postgres 17, Auth/GoTrue, Edge Functions/Deno, `pg_cron`, `pg_net`, Vault).
- **Identity:** Apple Developer (APNs, Sign in with Apple), Google Cloud (OAuth).
- **CLIs:** Supabase CLI (full tarball at `~/.local/share/supabase/supabase`), EAS CLI, `psql`, `git`/GitHub.
- **Built by:** the founder (suyeon-cha) with **Claude (Opus 4.8)**; the VoIP PushKit background-call piece was done with **OpenAI Codex**. Commits are co-authored to Claude.

## 8. Supabase — what / why / which
- **What:** an open-source Firebase alternative — managed **Postgres** database + **Auth** + **Edge Functions** (serverless Deno) + storage + cron, with a dashboard. "Backend-as-a-service."
- **Why we use it:** one mainstream, low-maintenance platform that gives us the database, user accounts, the always-on scheduler, and serverless functions — no custom server to run.
- **Our project:** name **`align`**, ref **`ftguelkzinuevjervbjo`**, org **`ikkrierocmmiifmnxzdj`**, region **us-west-2 (West US / Oregon)**.
- **URL:** `https://ftguelkzinuevjervbjo.supabase.co`
- **Account:** the founder's Supabase account; CLI authed via `supabase login` (stored access token).
- **DB connection (for psql):** session pooler `aws-1-us-west-2.pooler.supabase.com:5432`, user `postgres.ftguelkzinuevjervbjo` (exact string in `supabase/.temp/pooler-url`).
- **Edge functions:** `send-call`, `register-token`, `claim-device`, `save-schedule`, `save-entry`, `get-entries`.

## 9. Keys & secrets glossary
_(Values are **not** here — only what/where/sensitivity.)_

| Name | Purpose | Lives in | Sensitivity |
|---|---|---|---|
| `EXPO_PUBLIC_VAPI_KEY` | client voice calls | `.env.local` | client-public |
| `EXPO_PUBLIC_VAPI_MORNING_ASSISTANT_ID` | which Vapi assistant | `.env.local` | identifier |
| `EXPO_PUBLIC_SUPABASE_URL` | backend endpoint | `.env.local` | public |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | client API key (RLS-scoped) | `.env.local` + EAS env | public by design |
| Supabase **service_role** key | full DB access (server) | Supabase Vault + auto-injected to functions | **SECRET** — never print / never commit |
| Supabase **DB password** | direct `psql` | _was pasted in chat_ | **SECRET — 🔐 ROTATE (backlog #1)** |
| APNs **Auth Key** (`AuthKey_3R5BG278WJ.p8`) | sign VoIP pushes | `~/Downloads/…p8` + Supabase function secret `APNS_KEY` | **SECRET** (`.p8` gitignored) |
| APNs **Key ID** | `3R5BG278WJ` | function secret / this doc | identifier |
| Apple **Team ID** | `UTXA7352UW` | signing | identifier |
| Google **Web client ID** | Supabase verifies the login token | `.env.local` + Supabase Google provider | identifier (public) |
| Google **iOS client ID** | native Google sign-in | `.env.local` + `app.json` URL scheme | identifier (public) |
| iOS **bundle id** | `com.syncha.align` | `app.json` | public |
| `EXPO_PUBLIC_VOIP_*` | Mac dev-server token endpoint (legacy, superseded by Supabase) | `.env.local` | local-dev only |

## 10. Glossary of terms
- **CallKit / ConnectionService** — the OS-native incoming-call UI (iOS / Android).
- **CallKeep** — RN library wrapping both, so the app shows a real call screen.
- **VoIP push / PushKit** — a high-priority Apple push that wakes the app to report a call to CallKit (rings a locked phone). Requires a VoIP `.p8` and a native AppDelegate handler.
- **APNs** — Apple Push Notification service (where VoIP pushes are sent).
- **Vapi** — the voice-AI platform driving the conversation. **Daily/WebRTC** — the real-time audio transport underneath.
- **EAS** — Expo Application Services (cloud builds). **Dev client** — a custom build that hot-reloads JS from **Metro** (the JS dev server).
- **pg_cron** — Postgres cron (runs SQL on a schedule). **pg_net** — make HTTP calls from SQL. **Edge function** — serverless Deno function. **Vault** — Supabase's encrypted secret store.
- **RLS** — Row-Level Security: per-row access rules (here, `auth.uid() = user_id`).
- **ID-token flow** — native sign-in where the OS returns an identity token we hand to Supabase (`signInWithIdToken`); no web redirect/secret needed.
- **Sleep inertia / implementation intentions / affect labeling** — see `morning-call-design.md`.
