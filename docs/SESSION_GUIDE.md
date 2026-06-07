# Session Guide — how to wrap up a session

_The last step of every session. Follow this to hand off cleanly so the next
agent (or future-me) picks up **warm**, not cold._

**Trigger:** when I say _"let's end the session"_ / _"session summary"_ — run this.

## 🎯 The goal — the only test that matters
When you're done, a **brand-new agent should be able to read `HANDOFF.md` (+ the
few docs it points to) and begin working correctly with zero other context.**
That single sentence is the whole point. If a fresh agent couldn't read it and
go, the handoff **isn't done.** Write for that agent — the one who knows nothing
except what you leave behind.

## Why we do this
Work spans many sessions, chats, and agents — each starts with **zero memory.**
Without a written record, every handoff means re-deriving what's built and
repeating mistakes. **Git captures the code; these docs capture the *context*.**
The summary is the difference between *starting over* and *continuing.* (Born
from a real loss early on — a working call we never wrote down, then broke.)

## The wrap-up — produce THREE things
When a session ends, in this order:

### 1. Commit & push everything
Leave a clean git state on `main` (or a branch). Code is the first record.

### 2. Write this session's snapshot → `sessions/YYYY-MM-DD-slug.md`
**Immutable** (never edited later). Naming + title:
- **File:** `sessions/YYYY-MM-DD-slug.md` — date-first so the folder sorts itself; `slug` = the theme. Two in a day → `…-2.md` / `…-am` / `…-pm`.
- **Title:** `Session NN — <short, evocative theme>` (like a commit subject for the whole session).
- **Outline (use every time):**
  ```md
  # Session NN — <Title>
  > **Date:** … · **Theme:** … · **Built with:** …

  ## Goal — what we set out to do
  ## Built — what changed (+ commit refs)
  ## 🏆 Wins
  ## 🧗 Difficulties & lessons (honest)
  ## Decisions — what we chose + why
  ## Backlog & loose ends added (→ BACKLOG.md)
  ## Handoff — where we left off + the next session's first move
  ```
- Then add a row to the index in `SESSION_LOG.md`.

### 3. Update the LIVING docs so they reflect *now*
- **`HANDOFF.md`** — current state, the phase, **this session's task → next session's task**, the energy. (This is what the next agent reads first.)
- **`TECH_REFERENCE.md`** — if branches, architecture, keys, or services changed.
- **`BACKLOG.md`** — add/triage tickets (sev 1–5).
- **Design docs** — record new decisions + their rationale.
- **The next session's outline** — leave the "what's next / first move" crisp in `HANDOFF.md` so the next session opens with a clear target.

### 4. Hand me the next-session prompt
Give me the copyable handoff prompt (it lives in `README.md`) so I can paste it
into the next chat. It just says *"Read `docs/HANDOFF.md` and begin"* — because
the doc now carries everything. **That one line + a clean handoff = a new session
instantly up to speed.** That's success.

## Principles
Keep it **lean** — one doc, one job; essentials only; if a section isn't
load-bearing, cut it. Be **honest** — looking back, this is the history.
**Living docs = the present** (overwrite; git remembers). **Snapshots = the past**
(immutable). Don't archive old handoffs separately — git + snapshots already keep them.
