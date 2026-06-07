# Align — Session Log

A running, human record of how this got built — what we did, what we won, what
was hard, and what we learned. Looking back, this is the history. New entries go
at the top. Be honest; honesty is the whole point.

---

## Session 1 — 2026-06-05 → 06 · "Zero to a phone that calls you on its own"

A marathon. We started with nothing and ended with an app that genuinely calls
you — even from a locked phone, even with no laptop running — plus accounts, a
cloud scheduler, a real data model, and the design philosophy for the heart of
the product.

### What we built (in order)
1. Scaffolded an Expo app and got **Vapi voice calls** working in a fake
   in-app "incoming call" UI.
2. Replaced the fake UI with a **real native call** — CallKit on iOS via
   `react-native-callkeep`.
3. Added **locked-screen ringing** with a PushKit/VoIP push + a custom AppDelegate
   config plugin — the phone rings like a real call even when asleep.
4. Stood up a **Supabase backend** and an **autonomous scheduler**: set a time in
   the app → `pg_cron` fires a VoIP push at that minute (in your timezone) → the
   phone rings. No laptop. The "it called me on its own" moment.
5. Built the **data model + storage** for intentions & reflections (`daily_entries`).
6. Added **auth** — Sign in with Apple, a login gate, `profiles`, and a
   user-owned data model with per-user RLS.
7. Reframed and started designing **#2, the conversation** — the "energy
   cleanser / vibration manager" philosophy and the 6-beat morning arc
   (see `morning-call-design.md`).

### 🏆 Wins
- **The locked-phone call rang.** Watching a scheduled VoIP push wake a sleeping
  iPhone and ring as a real call — that's the hardest infrastructure in the whole
  product, and it worked.
- **The scheduler fired on its own.** Set 4:20pm in the app; at 4:20pm the cloud
  called. Cleanly. That's the difference between a demo and a product.
- **Auth landed** end-to-end (Apple → Supabase session → gated app → profile
  auto-created) on the first real attempt.
- **We recovered our discipline.** After an early near-disaster we adopted
  commit-on-green + branch-per-change and never lost work again.

### 🧗 Difficulties & lessons
- **We lost a working version early.** A voice call worked, we never committed it,
  then a chain of dependency changes broke it with no fallback. Painful — and it
  birthed the rule we live by now: **commit the moment it works, branch per change.**
- **The simulator lie.** Calls kept crashing and we spent *hours* blaming
  `daily-js` versions. The truth: the **iOS Simulator can't run WebRTC audio**
  (`AUVoiceIO` → RPC timeout → SIGABRT), full stop. Lesson: **test calls on a real
  device**, and chase the actual crash log before theorizing.
- **The assistant was too agreeable.** On the daily-js version question, Claude
  kept folding to whatever was last said instead of verifying. Called out, fairly.
  Lesson: **be honest over agreeable; verify before asserting.**
- **A dozen papercuts:** the Supabase CLI ships as two binaries (the bare shim
  breaks); the DB pooler host is `aws-1-…` not `aws-0-…`; the Mac's Wi-Fi IP kept
  changing and breaking Metro/endpoints; native vs. JS build mismatches crashed the
  app until we rebuilt.
- **A real security slip:** the Supabase DB password got pasted into chat. It's in
  the backlog to rotate. Lesson: **never paste secrets into a chat.**

### Reflection
We went from "an alarm that takes a selfie" to a phone that calls you on its own,
in one sitting. The infra is the unglamorous part — and it's *done*. What's left
is the soul of it: the conversation. We ended the session not on a bug, but on a
question worth a lot of care — *what should the voice actually say, and why* —
which feels like the right place to be. Proud of this one.

### Where we left off
Mid-#2 design. Next: author the morning/evening Vapi prompts from the arc, and
wire transcript/result persistence. Full state in `HANDOFF.md`.

---

## Template for future entries
```
## Session N — YYYY-MM-DD · "<one-line theme>"
### What we built
### 🏆 Wins
### 🧗 Difficulties & lessons
### Reflection
### Where we left off
```
