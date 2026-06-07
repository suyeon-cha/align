# Align — `docs/`

This folder is Align's memory. Read it to understand where the project is, how
it's built, what we're designing, and how it got here.

## How `docs/` is organized
Two kinds of docs:
- **Living docs** — reflect *current truth*, updated in place.
- **Snapshots** — *history*, one immutable file per session in `sessions/`.

**Living:**
| File | What it's for | Read when… |
|---|---|---|
| **README.md** (this) | index + the "why" + conventions | first |
| **[HANDOFF.md](./HANDOFF.md)** | current state, what's next, backlog, loose ends, gotchas | starting any session |
| **[TECH_REFERENCE.md](./TECH_REFERENCE.md)** | code status, branches, commit map, systems, decisions, stack, keys glossary, Supabase | you need a technical detail |
| **[morning-call-design.md](./morning-call-design.md)** | the #2 conversation design — philosophy, the 6-beat arc, research | building/iterating the call |

**Snapshots:**
| File | What it's for |
|---|---|
| **[SESSION_LOG.md](./SESSION_LOG.md)** | the index of every session + the naming/outline convention |
| **[`sessions/`](./sessions/)`YYYY-MM-DD-slug.md`** | one immutable summary per session |

---

## Why we keep session summaries

**The problem they solve:** work happens across many sessions, across different
chats, and across different agents (Claude, Codex, the founder). Each new session
starts with **zero memory** of the last. Without a written record, every handoff
means re-deriving what's built, re-explaining decisions, and **repeating mistakes
we already paid for.** A session summary is how the project *remembers itself.*

**Why this system is in place:** it was born from a real loss — early on we had a
working voice call, never wrote it down, and a chain of changes broke it with no
way back. The lesson generalized: **if it isn't captured, it isn't safe.** Code is
captured by git; *context* is captured by these docs.

**What a session summary does:**
1. **Snapshots state** — what's built, what's deployed, what's next (HANDOFF).
2. **Records decisions + the *why*** — so we don't relitigate or accidentally undo them (TECH_REFERENCE §6, design docs).
3. **Lists the backlog & loose ends** — the "said we'd do but didn't."
4. **Preserves hard-won gotchas** — the traps, so we never re-learn them.
5. **Keeps the narrative** — wins and difficulties, honestly (SESSION_LOG).

**What we hope to gain:**
- **Seamless handoff** — a new chat / agent / future-you picks up *warm*, in minutes, not hours.
- **No lost work, no repeated mistakes.**
- **An accountable trail** — every decision has a reason on record.
- **Compounding speed** — each session starts further ahead than the last.
- **A history worth keeping** — the story of how this got built.

> In short: the summary is the difference between *starting over* and *continuing.*

---

## The wrap-up ritual (do this when ending a session)
1. **Commit & push everything** — leave a clean git state on `main` (or a branch). Code is the first record.
2. **Update [HANDOFF.md](./HANDOFF.md)** — current state, backlog, loose ends.
3. **Update [TECH_REFERENCE.md](./TECH_REFERENCE.md)** if branches, architecture, keys, or services changed.
4. **Add a [SESSION_LOG.md](./SESSION_LOG.md) entry** — what we built, 🏆 wins, 🧗 difficulties & lessons, reflection, where we left off.
5. **Update the design docs** with any new decisions + their rationale.
6. **Flag anything to secure** (e.g. a key to rotate) and update the cross-session memory.

Keep it honest. Looking back, this is the history — write it like it matters.
