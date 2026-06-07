# Session Log — Index

Every work session ends with a **snapshot** saved in [`sessions/`](./sessions/).
A snapshot is **immutable** — it records what happened that day and never changes.
(Contrast: *living* docs like `HANDOFF.md` / `TECH_REFERENCE.md` hold *current*
truth and get updated in place. Sessions are *history*; living docs are *now*.)

This file is the index of all sessions, newest first.

## Sessions
| # | Date | Title | In one line | File |
|---|------|-------|-------------|------|
| 01 | 2026-06-06 | Foundation: zero to a phone that calls you | Calls + scheduling + accounts + storage; started #2 | [→](./sessions/2026-06-06-foundation.md) |

---

## Conventions

**Where:** one file per session in `docs/sessions/`.

**File name:** `YYYY-MM-DD-slug.md`
- Date-first so the folder sorts itself chronologically.
- `slug` = a short kebab-case theme (e.g. `2026-06-06-foundation.md`).
- Two sessions in one day → add a suffix: `…-2.md`, or `…-am` / `…-pm`.

**Title (first line of the file):** `Session NN — <short, evocative theme>`
- `NN` is a running number (01, 02, …). Think of the theme like a commit subject, but for the whole session.

**Every session uses the same outline:**
1. **Goal** — what we set out to do
2. **Built** — what changed (with commit refs)
3. **🏆 Wins**
4. **🧗 Difficulties & lessons** — honest
5. **Decisions** — what we chose + why (cross-ref the decision log)
6. **Backlog & loose ends added** — cross-ref `HANDOFF.md`
7. **Handoff** — where we left off + the next session's *first move*

When you add a session: write the file, then add a row to the table above.

## Template (copy this)
```md
# Session NN — <Title>

> **Date:** YYYY-MM-DD · **Theme:** … · **Built with:** …

## Goal
## Built (what changed)
## 🏆 Wins
## 🧗 Difficulties & lessons
## Decisions
## Backlog & loose ends added
## Handoff — where we left off
```
