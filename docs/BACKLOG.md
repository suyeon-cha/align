# Backlog — feature requests & to-dos (by severity)

The single prioritized list of everything we want to do. Lowest sev number =
most urgent. Keep it lean: one line per item, prune what's done.

## Severity scale
| Sev | Meaning |
|-----|---------|
| **1** | **Now / critical** — blocking the current goal, or a security/data risk. Do ASAP. |
| **2** | **High** — clearly needed, *not* urgent. Schedule it soon. |
| **3** | **Medium** — valuable, should do, not pressing. |
| **4** | **Low** — nice-to-have / do when that area is already open. |
| **5** | **Someday / maybe** — interesting, parking lot. |

**Type:** `feat` (feature) · `bug` · `debt` (tech debt / cleanup) · `policy`.

## Open items
| ID | Sev | Type | Item | Notes |
|----|-----|------|------|-------|
| FR-001 | 1 | debt | **Rotate the exposed Supabase DB password** | Pasted in chat. Reset in Dashboard → Settings → Database; keep new one out of chat. |
| FR-024 | 1 | debt | **A clearly broken-down task list** | Break the feature tickets (FR-XXX) into small, concrete, *ordered steps* — so every session opens with an obvious next action, not a vague feature. Founder wants granular "do X, then Y" clarity. Could be a `TASKS.md` or an expanded backlog. |
| FR-002 | 2 | feat | **"Clarity / consultant" conversation mode** | A sharp, framework-driven goal-clarity mode alongside the warm energy mode — "a McKinsey consultant for your life." Distinct *persona* from the morning-energy voice; design deliberately. |
| ~~FR-003~~ | ✅ | feat | ~~Persist call transcripts + structured results~~ | **DONE (S02)** — transcript saved on call-end + Claude extraction → `daily_entries`. (`calls`-row logging still TODO.) |
| FR-004 | 2 | policy | **Data-dignity / privacy policy + one-tap delete** | Required pre-launch; intimate data. "Your inner world is sacred" as a real policy. |
| FR-012 | 2 | feat | **Interactive session wrap-up (guided Q&A)** | At session end, the logger asks *dynamic, session-specific* questions to fill gaps — "did the summary catch the key points?", "anything to add?", and walks me through choosing the next task. Quick toggle / yes-no prompts (like permission prompts). Questions chosen from what we actually discussed, **not a fixed list.** Pairs with FR-013. |
| FR-013 | 2 | feat | **Running session capture ("breadcrumbs")** | Agent is aware a summary is coming, so it logs *significant* moments as they happen — wins, breakthroughs, key decisions — to a running scratchpad. **Not everything**, only what clears the bar. Define an explicit "what's important enough" criteria list in `SESSION_GUIDE.md`; the scratchpad feeds the summary. Pairs with FR-012. |
| ~~FR-015~~ | ✅ | feat | ~~Structured affect/state extraction~~ | **DONE (S02)** — `extract-entry` (Claude haiku-4-5) → intention/action_steps/gratitude/clearing + valence/arousal/affect_label + themes. |
| FR-016 | 2 | feat | **Synthesized user profile + memory injection** | "What we know about you" distillate; **reconciled** post-call (decay, not append); injected at call start via Vapi overrides. Start Level 0 (inject yesterday) → Level 2 (running profile). **Open Q: how to *weight* past calls — recency-weighted decay — as they pile up.** See `memory-and-insight.md`. |
| FR-014 | 3 | debt | **Keep refining the session-log / docs system** | Ongoing: is it too wordy? Prune for leanness, tighten templates, improve clarity. Don't let the knowledge system bloat. |
| FR-005 | 3 | feat | **Multi-language / cultural localization** | Conversation re-designed per culture (not translated). Vapi config is quick; the *design* is the work. Do **after #2 is solid in English**. |
| FR-006 | 3 | debt | **Finish schedule user-scoping (Phase 5)** | `call_schedules.user_id` still null — schedules tie to device, not yet the account. |
| FR-007 | 3 | bug | **Call-times shows defaults, not saved times** | Add a `get-schedule` backend load (currently reads local only). |
| FR-008 | 3 | debt | **Test Google sign-in** | Only Apple validated on device. |
| FR-009 | 3 | feat | **Sign-out button + simple profile screen** | — |
| FR-017 | 2 | feat | **Editable memory mirror (the "notes Align takes on you")** | User sees/edits/deletes the *synthesized profile* — a **curated** reflection, never the raw extraction. **Weather not identity · pull not push.** The transparency moat (OpenNotes-style); pairs with FR-004. The voice-journal surface. See `memory-and-insight.md`. |
| FR-018 | 3 | feat | **Reset ritual (weekly light / monthly deep)** | Re-aim + prune memory; the monthly intention sets the injected frame. The consolidation tier; fractal with the morning "Clear" beat. Keep weekly light (rote risk). |
| FR-022 | 3 | feat | **"Stop talking" button — manual interrupt** | A button on the active-call screen that instantly silences the agent mid-sentence **without ending the call**. Voice barge-in already works via Vapi; this is the explicit tap affordance. Mechanism TBD — find the Vapi SDK interrupt/stop-speech control (NOT `.stop()`, which ends the call). |
| FR-021 | 3 | debt | **Evolve `daily_entries` to the conversation arc** | ✅ Done 2026-06-08 — `gratitude`/`intention`/`clearing` + affect + `action_steps` migrated (20260608120000/130000); old `goals`/`todos`/`mood_*`/`alignment_score` dropped. |
| FR-010 | 4 | feat | **Midday check-in scheduling** | Schema already supports `kind = 'midday'`. |
| FR-011 | 4 | feat | **Apple sign-in on Android** | Needs the web OAuth flow (skipped for native iOS). When Android ships. |
| FR-019 | 4 | feat | **State-over-time + action→state insight engine** | Longitudinal affect trajectory + correlational "what helps you," surfaced as **gentle hypotheses** (not prescriptions). Runs on SQL/aggregation, not RAG/ML. Needs accumulated data first. |
| FR-020 | 5 | feat | **pgvector RAG retrieval tool (V2)** | Long-tail only: months-back references, consultant mode. **Deferred by design** — profile injection covers the MVP. pgvector lives inside Supabase; additive, not a rearchitecture. |

## Done
_(move completed items here with the date, or delete — git remembers.)_
