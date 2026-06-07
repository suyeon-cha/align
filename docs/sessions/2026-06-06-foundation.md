# Session 01 — Foundation: zero to a phone that calls you

> **Date:** 2026-06-06 · **Theme:** Build the whole skeleton — calls, scheduling, accounts, storage · **Built with:** Claude (Opus 4.8) + founder; the VoIP PushKit piece with OpenAI Codex

## Goal
Start from nothing and get to an app that *actually calls you*, standing on real, autonomous infrastructure.

## Built (what changed)
1. Expo Router app + **Vapi voice calls**
2. Real native **CallKit** incoming-call screen (`react-native-callkeep`)
3. **Locked-screen ring** via PushKit/VoIP + a custom AppDelegate config plugin
4. **Supabase autonomous scheduler** — `pg_cron` → `send-call` → APNs VoIP push (no laptop)
5. **`daily_entries`** storage (morning + evening merge on one day-row)
6. **Sign in with Apple** + user-owned data model + per-user RLS
7. Started **#2** — the "energy cleanser" conversation design (the 6-beat arc)

_Commits `0abbcdd` → `5eef56e` (25 total). Full map in `TECH_REFERENCE.md`._

## 🏆 Wins
- **The locked phone rang.** A scheduled VoIP push woke a sleeping iPhone and rang as a real call — the hardest infra in the product, working.
- **The scheduler fired on its own.** Set 4:20pm in the app; at 4:20pm the cloud called. Demo → product.
- **Auth landed** end-to-end (Apple → session → gated app → profile) on the first real try.
- **We recovered our discipline** after an early scare and never lost work again.

## 🧗 Difficulties & lessons
- **Lost a working call early** (never committed it) → adopted **commit-on-green / branch-per-change**.
- **The simulator lie** — hours blaming `daily-js` when the truth was the **iOS Simulator can't run WebRTC audio**. Lesson: **test calls on device; read the crash log before theorizing.**
- **Too agreeable** — the assistant kept folding on the daily-js version instead of verifying. Lesson: **honest over agreeable.**
- **Papercuts:** Supabase CLI ships as two binaries; pooler host is `aws-1-` not `aws-0-`; the Mac's Wi-Fi IP kept changing; native/JS build mismatches.
- **Security slip:** the DB password got pasted in chat → **never paste secrets** (and it's in the backlog to rotate).

## Decisions (→ see TECH_REFERENCE §6 / future DECISIONS.md)
Expo + Vapi + Supabase stack · real CallKit over a fake screen · VoIP push for background · pin the supported Daily stack · Supabase for the scheduler · device-keyed → user-keyed data model · native sign-in (Apple/Google) · commit-on-green · **adopt the session-summary docs system.**

## Backlog & loose ends added (→ HANDOFF.md)
Rotate the DB password · finish schedule user-scoping · test Google sign-in · Apple-on-Android (web OAuth) · `get-schedule` load in Call-times · midday check-in · sign-out button.

## Handoff — where we left off
Mid-**#2** design. **Next first move:** author the morning Vapi prompt from the 6-beat arc, and wire transcript/result persistence (`saveEntry`). Start by reading `HANDOFF.md` + `morning-call-design.md`.
