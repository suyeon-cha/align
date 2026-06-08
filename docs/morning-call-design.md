# Morning Call — Design & Prompt Record

_Started 2026-06-06. This is the living design doc for the heart of Align: the
morning (and evening) conversation. The actual Vapi system prompt will be
authored from this — see "Status" at the bottom._

## The north star
Align is an **"energy cleanser / vibration manager."** So the morning call is
**a state-shift ritual, not a planning meeting.**

> A to-do app *extracts* information from you. Align *moves* you — from however
> you woke up (foggy, anxious, scattered, flat) → to resourced, open, intentional.
> The intentions/data we save are a **byproduct**. The real product is **the
> state you're in when you hang up.**

Every question is an *instrument to shift state*, sequenced like a journey.

## The arc (draft — 6 beats, each with a job)
Keep the **structure fixed** (that's what makes it a ritual — automatic, safe);
let the **surface vary** (words/angles change daily so it never goes dead).

1. **Land** — meet them where they are; a breath; "you're here, good morning." No ask yet. _(downshifts sleep inertia, drops defenses)_
2. **Appreciate** — one specific, *felt* gratitude; the angle varies daily (a person / your body / something small / something hard). _(shifts the emotional baseline before we build)_
3. **Tune** — "how do you want to *feel* today?" _(sets the day's energetic target)_
4. **Aim** — "what's *one* thing that would make today feel aligned with that?" _(a single intention, concrete; not a checklist)_
5. **Clear** — "anything you're carrying that you want to set down?" _(the literal cleanse — naming what's heavy lets it move)_
6. **Send-off** — reflect their own words back; one line to carry. _(the close is what they'll remember)_

Some mornings you skip a beat (a 90-sec "Clear + Send-off" on a rough day is its own intentional thing).

## Principles
- **Don't lead with a demand.** Land first, *then* appreciate — asking someone to perform (even gratitude) 3 seconds after waking reads as pressure.
- **One intention, not a list.** Overwhelm is the enemy of energy.
- **Autonomy over instruction** — "what do *you* want…" not "you should…".
- **Fixed structure, varied surface** — ritual for habit, novelty for attention.
- **Feeling before doing** — anchor the day emotionally before the practical.
- **Ground, don't hype.** Empower through _clarity_, not _excitement_. Reflect their energy back; never inject ours. Leave them **settled and ready**, not amped — the app is a mirror, not a battery. _(Positive fantasy demotivates — Oettingen.)_

## Research grounding
_(Be evidence-led; let findings override pretty ideas.)_

**✅ Sourced this session — Self-compassion (shapes the EVENING reflection most):**
Self-criticism → more rumination, more procrastination, less goal progress.
Self-compassion → less procrastination, higher self-efficacy, more intrinsic
motivation, less fear of failure — but it *regulates emotion, it doesn't replace
structure* (pair it with concrete planning). → **The evening "were you aligned?"
must be warm and non-shaming, or people will avoid the call.**
- Neff, _Self-Compassion: Theory, Method, Research_ (Annual Review of Psychology, 2023): https://self-compassion.org/wp-content/uploads/2023/01/Neff-2023.pdf
- Greater Good (Berkeley), "Can Self-Compassion Overcome Procrastination?": https://greatergood.berkeley.edu/article/item/can_self_compassion_overcome_procrastination
- Sirois, "Procrastination and Stress: Exploring the Role of Self-compassion": https://eprints.whiterose.ac.uk/id/eprint/91791/1/ProcrastinationFINAL.pdf

**⏳ Established findings to cite next session (knowledge, not yet freshly sourced — web-search limit hit):**
- **Gratitude habituates.** Lyubomirsky/Sheldon-style work found counting blessings **~1×/week beat 3×/week** for well-being (it goes rote). → Maybe *don't* force gratitude every single morning; vary the angle, or make it less-than-daily. _(verify + cite)_
- **Implementation intentions work.** Gollwitzer & Sheeran's meta-analysis (~94 studies) found "if-then / when-where" plans have a **medium-to-large effect (~d=.65)** on goal attainment. → The "Aim" beat should pull for a *concrete* when/where, not a vague goal. _(verify + cite)_
- **Sleep inertia** impairs cognition for ~15–30 min after waking. → Don't call at the alarm moment; wait, or anchor to a post-wake habit (e.g. after brushing teeth — habit stacking). _(verify + cite)_
- **Positive fantasy demotivates.** Oettingen's work — indulging "it's all about to change!" imagery *reduces* the drive to pursue it; mental contrasting (WOOP) channels it. → grounds the **"Ground, don't hype"** principle (empower through clarity, not excitement). _(verify + cite)_

**🔲 Not yet researched (do next):**
- **Affect labeling** — does naming a desired feeling help? (Lieberman fMRI work) → the "Tune" + "Clear" beats.
- **Peak-end rule** (Kahneman) — endings dominate the memory of an experience → the "Send-off" beat.
- Cortisol awakening response & chronotype → timing. Broaden-and-build (Fredrickson) → gratitude/positive-affect mechanism. Habit formation (Lally et al.; Fogg's anchoring).

## Open questions (being explored with other agents in parallel)
- Does the 6-beat **arc** feel right, or is the *shape* wrong?
- How **long** should a morning call be?
- How much **variation** vs. ritual?
- **Gratitude:** every day, or not? which angles?
- How do you **"clear heavy energy"** without it turning into therapy?
- The voice's **persona** — coach? friend? mirror? guide?
- **When** to call, relative to waking?

## Status
- The **arc + philosophy + principles** above are the agreed design direction.
- **Memory, affect-extraction, and the insight engine now live in their own doc:** [`memory-and-insight.md`](./memory-and-insight.md) (how Align remembers you + turns history into insight).
- **Prompt v1 is written** → canonical source in [`vapi/morning.md`](../vapi/morning.md) (system prompt) + [`vapi/morning.schema.json`](../vapi/morning.schema.json) (extraction). Edit there; this doc keeps the version record below.
- The founder is co-designing the conversation with other voice agents; bring resonant points back here.

## Prompt record
- **v1 — 2026-06-08 (morning).** First draft from the 6-beat arc. Encodes: grounded-warmth persona ("mirror, not a battery"); the six beats each with a one-line *job* + a sample angle; "Ground, don't hype"; read-the-room / skip-beats-on-rough-days; send-off reflects their *own* words back. Extraction schema (`morning.schema.json`) feeds the new `daily_entries` arc + affect fields. **Not yet device-tested; voice + model not yet locked.**
