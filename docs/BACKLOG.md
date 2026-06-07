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
| FR-002 | 2 | feat | **"Clarity / consultant" conversation mode** | A sharp, framework-driven goal-clarity mode alongside the warm energy mode — "a McKinsey consultant for your life." Distinct *persona* from the morning-energy voice; design deliberately. |
| FR-003 | 2 | feat | **Persist call transcripts + structured results** | Part of #2. On call-end (or Vapi webhook) → `saveEntry` into `daily_entries` + log `calls`. Shown live now, not saved. |
| FR-004 | 2 | policy | **Data-dignity / privacy policy + one-tap delete** | Required pre-launch; intimate data. "Your inner world is sacred" as a real policy. |
| FR-012 | 2 | feat | **Interactive session wrap-up (guided Q&A)** | At session end, the logger asks *dynamic, session-specific* questions to fill gaps — "did the summary catch the key points?", "anything to add?", and walks me through choosing the next task. Quick toggle / yes-no prompts (like permission prompts). Questions chosen from what we actually discussed, **not a fixed list.** Pairs with FR-013. |
| FR-013 | 2 | feat | **Running session capture ("breadcrumbs")** | Agent is aware a summary is coming, so it logs *significant* moments as they happen — wins, breakthroughs, key decisions — to a running scratchpad. **Not everything**, only what clears the bar. Define an explicit "what's important enough" criteria list in `SESSION_GUIDE.md`; the scratchpad feeds the summary. Pairs with FR-012. |
| FR-005 | 3 | feat | **Multi-language / cultural localization** | Conversation re-designed per culture (not translated). Vapi config is quick; the *design* is the work. Do **after #2 is solid in English**. |
| FR-006 | 3 | debt | **Finish schedule user-scoping (Phase 5)** | `call_schedules.user_id` still null — schedules tie to device, not yet the account. |
| FR-007 | 3 | bug | **Call-times shows defaults, not saved times** | Add a `get-schedule` backend load (currently reads local only). |
| FR-008 | 3 | debt | **Test Google sign-in** | Only Apple validated on device. |
| FR-009 | 3 | feat | **Sign-out button + simple profile screen** | — |
| FR-010 | 4 | feat | **Midday check-in scheduling** | Schema already supports `kind = 'midday'`. |
| FR-011 | 4 | feat | **Apple sign-in on Android** | Needs the web OAuth flow (skipped for native iOS). When Android ships. |

## Done
_(move completed items here with the date, or delete — git remembers.)_
