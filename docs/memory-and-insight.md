# Memory & Insight — Design & Idea Log

_Started 2026-06-08. The design record for **how Align remembers you and turns
your own history into insight.** Sibling to `morning-call-design.md` (which is
the conversation itself). This doubles as the **idea log** for this thread:
what we decided · what's unresolved · what to consider next._

## Why this exists (the north star)
Align's deepest value isn't a single good call — it's that **it remembers you
and helps you see yourself.** Over time: _"you were anxious in May; by August
you're not."_ Over your own patterns: _"you tend to feel lighter on days you do
work that's aligned with what you want."_ The memory layer is what turns a daily
ritual into a **mirror that knows you.**

## The core loop
> **inject profile → converse → synthesize (reconcile log → update profile) → user can view/edit → repeat**

Daily calls are the _stream_; the weekly/monthly **reset** is the _consolidation_.

## Decisions — what we said (+ why)
1. **The model is stateless; the agent is stateful.** The LLM remembers nothing
   between calls — "memory" is an illusion **we** build by retrieving past
   context and injecting it into the prompt at call start. Memory lives at **our
   app layer + Supabase**, not in Vapi or the model.
2. **Two artifacts, opposite behavior:**
   - **Raw log** (transcripts) — append-only, immutable, the archive. _Also our
     re-processing insurance:_ if we change the extraction schema later, we
     re-run it over the transcripts.
   - **Synthesized profile** ("what we know about you now") — curated, compact;
     **this is what gets injected**, and **what the user can see/edit.**
3. **Memory needs decay, not accumulation.** The post-call step _reconciles_
   (overwrite / deprecate / sharpen) — it does **not** just append. This is the
   cure for the thing we hate in other apps: stale stuff resurfacing because
   nothing ever gets retired.
4. **Pre-compute what you can predict; retrieve only what you can't.** A daily
   ritual is almost entirely predictable (recent state, patterns) → pre-compute
   it into the profile and inject it. **The profile is the spine; RAG is a limb
   we grow later** (V2: pgvector inside Supabase, for the unpredictable long tail
   only — months-back references, consultant mode). **No RAG, no mid-call writes
   for the MVP.**
5. **The extraction schema IS the real data architecture.** _You can only analyze
   what you structured at capture time._ Every call must emit structured,
   queryable signal **alongside** the transcript — not leave the feeling buried
   in prose. This is the single most important thing to get right early, because
   un-captured feeling-data can't be cleanly backfilled (only re-extracted from
   raw transcripts).
6. **Capture affect as structured signal — dimensional + categorical:**
   - **Dimensional:** valence (pleasant↔unpleasant) × arousal (activated↔calm) —
     Russell's circumplex. _This is Align's native coordinate system: arousal =
     energy, valence = its quality = literally "vibration."_
   - **Categorical:** a human-readable label (anxious / flat / energized / calm…).
   - Plus **themes** (work, relationships, health…), **actions** (what they did),
     **alignment** (did it match the intention).
   - Bonus: naming affect is _therapeutic_ (affect labeling — Lieberman). The
     extraction doubles as intervention.
7. **The insight engine runs on SQL, not RAG or ML.** _"May vs August"_ = a
   time-series query over the affect columns. _"What gets me out of a bad state"_
   = an aggregation over the user's own tagged history. An LLM **narrates** the
   aggregates. No neural net required to start.
8. **The morning→evening pair is a daily n-of-1 experiment.** AM sets the
   intention/target; PM reports the outcome. The diff is our signal — generated
   for free by the product's own structure.
9. **Pruning is a ritual, not a chore — "the reset."** Weekly (light: "how was
   the week, anything to set down?") + monthly (deep: re-aim + prune). This is
   _how_ editing happens — warm, in conversation, not a cold CRM screen. The
   monthly intentions become the **top of the injected profile** for that month.
   Fractal with the morning **"Clear"** beat.
10. **Transparency is the product mechanism, not a nicety.** The editable mirror
    (see/edit/delete what we hold) creates the **trust → safety → vulnerability**
    that makes the conversation deep enough to matter. Ties to FR-004 (data-dignity).
11. **The mirror is a *curated reflection*, not the raw record.** Show the
    synthesized profile — never the raw extraction/transcripts (that machinery is
    the therapist's private "process notes"). Three rules: **curated, not raw ·
    weather, not identity** ("lately you've felt…", never "you are…") **· pull,
    not push** (openable, not confronting — most *target* users want it; not all).
    Align *inverts* therapy: the notes are **yours**, made to serve your own
    self-awareness. Same surface as the insight engine — the **voice journal** you
    talk into and read back.

## Unresolved — open questions to tackle next
- **Affect taxonomy:** which categorical labels, and how many? (Too many = noisy;
  too few = lossy.)
- **When does synthesis run?** After every call, or a nightly job? (Latency vs.
  freshness.)
- **Reset cadence calibration:** keep weekly _light_ so the ritual doesn't go
  rote (the gratitude-habituation risk). Is monthly the right "deep" beat, or
  quarterly?
- **Causality is confounded.** Action→state is correlational (maybe feeling
  better _causes_ the aligned work, not vice versa). Surface as **gentle
  hypotheses, not prescriptions** — safer (no clinical claims) and more on-brand
  (autonomy over instruction).
- **The mirror must feel warm, not reductive** — _"here's what I've come to
  understand about you,"_ never a database dump of a human being.
- **Profile-injection mechanism:** Vapi `assistantOverrides` / `variableValues`
  — confirm exact wiring when we build the memory hook.

## Points to consider
- Start at **Level 0 memory** (inject yesterday's row) — trivial to build, huge
  felt lift — _before_ the running profile (Level 2).
- Design the extraction schema **before** months of data accumulate; keep raw
  transcripts as the backfill escape hatch.
- This thread is bigger than the morning call — it shapes the schema, the evening
  reflection, and a future "insights" surface.

## Research to ground (verify + cite — knowledge, not yet freshly sourced)
- **Russell — circumplex model of affect** (valence × arousal): the dimensional
  representation of feeling.
- **Lieberman — affect labeling** ("putting feelings into words" lowers amygdala
  response): naming as regulation → also justifies extracting/naming affect.
- **Oettingen — positive fantasies / mental contrasting (WOOP):** indulging
  "everything's about to change!" fantasy _reduces_ the drive to pursue it;
  contrasting with present reality channels it → grounds **"Ground, don't hype."**
- **OpenNotes (Delbanco et al.):** patients reading their clinicians' notes →
  more control, understanding, and trust → grounds the editable mirror (FR-017).
- _(Self-compassion — Neff — already sourced in `morning-call-design.md`; shapes
  the evening reflection.)_

## Status
Brainstormed Session (2026-06-08 — the "voice-AI ecosystem & memory" session).
These are the agreed **direction**, not yet built. The MVP slice: **extraction
schema + profile injection + post-call synthesis. No RAG.** Build the extraction
**now** — it rides along with #2's persistence — so signal accrues from day one.
