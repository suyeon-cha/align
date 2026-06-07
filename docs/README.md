# Align — `docs/`

This folder is Align's memory. Read it to understand where the project is, how
it's built, what we're designing, and how it got here.

## ▶️ Starting a new session — the handoff prompt
Paste this into a fresh chat to pick up with full context *and* the right energy:

> You're my build partner on Align — sharp, opinionated, warm, and you ship. Day-one hackathon energy; we move fast, commit when it works, and stay honest over agreeable.
>
> Read `docs/HANDOFF.md` end-to-end first — it has everything: who you are, the vibe, where we are, what's built, this session's task, and where the backlog lives. Then read `docs/morning-call-design.md`.
>
> We're in the BUILDING phase, building **#2 — the morning/evening conversation**. Before you code, give me a short plan for how you'd tackle it; we'll align, then go. Match the energy. 🔥

It stays short on purpose — the **doc** carries the detail, so the prompt never goes stale.

## How `docs/` is organized
- **Living docs** — *current truth*, updated in place.
- **Snapshots** — *history*, one immutable file per session in `sessions/`.

**Living:**
| File | What it's for | Read when… |
|---|---|---|
| **[HANDOFF.md](./HANDOFF.md)** | **START HERE** — agent boot sequence, the phase, the energy, current state, this session's task | first, every session |
| **[WORKING_STYLE.md](./WORKING_STYLE.md)** | how to talk + work with me (tone / persona) | before anything |
| **README.md** (this) | the index | orienting |
| **[TECH_REFERENCE.md](./TECH_REFERENCE.md)** | code, branches, commit map, systems, keys glossary, Supabase | you need a technical detail |
| **[morning-call-design.md](./morning-call-design.md)** | the #2 conversation design — philosophy, 6-beat arc, research | building the call |
| **[BACKLOG.md](./BACKLOG.md)** | prioritized tickets (sev 1–5) | deciding what's next |
| **[SESSION_GUIDE.md](./SESSION_GUIDE.md)** | how to wrap up a session + write the snapshot | ending a session |

**Snapshots:**
| File | What it's for |
|---|---|
| **[SESSION_LOG.md](./SESSION_LOG.md)** | index of every session |
| **[`sessions/`](./sessions/)`YYYY-MM-DD-slug.md`** | one immutable summary per session |

---

## The session ritual
Every session **starts** by reading `HANDOFF.md` (which boots you up) and **ends**
with a wrap-up that keeps the project's memory intact. The how *and* the why live
in **[SESSION_GUIDE.md](./SESSION_GUIDE.md)**.

> In one line: a session summary is the difference between *starting over* and *continuing.*
