# vapi/ — assistant config as code

The conversation is **Layer 4 — the actual product** — so its canonical source
lives here in the repo (version-controlled, reviewable), **not** trapped in the
Vapi dashboard. The dashboard becomes just a place this gets *deployed to.*

## Files
| File | What it is | Maps to (in the Vapi assistant) |
|------|------------|---------------------------------|
| `morning.md` | The morning system prompt (the 6-beat arc + persona) | **System Prompt** field |
| `morning.schema.json` | Structured-data **extraction** schema | **Analysis → Structured Data** (`analysis.structuredDataPlan`) |

_(Evening assistant: TODO — clone the arc with a self-compassion reflection framing.)_

## Recommended assistant config
- **Model (brain):** Claude Sonnet *or* GPT-4o — judge by *feel* (warmth + following the arc). Don't drop to a tiny model until you've confirmed it holds the tone.
- **Voice (TTS):** ElevenLabs — audition for **groundedness, not perkiness** (the "mirror, not a battery" persona). This is half the soul; pick deliberately.
- **Transcriber (STT):** Deepgram.

## How to deploy (now)
We currently hold only the **public** Vapi key (`EXPO_PUBLIC_VAPI_KEY`), which can
start calls + pass per-call overrides but **cannot** edit assistants. So for now:
1. Open the morning assistant in the Vapi dashboard (id in `.env.local`).
2. Paste the body of `morning.md` (everything below the `---`) into **System Prompt**.
3. Paste `morning.schema.json` into the **Structured Data** schema.
4. Set model / voice / transcriber per above.

## How to deploy (later — automate)
Add a small push script using the **private** Vapi API key (kept server-side — a
Supabase function secret or local env, **never** `EXPO_PUBLIC_*`). Then editing
the prompt = edit the file + run the script. No more hand-pasting.

## The dynamic layer (later — memory)
Per-call context (yesterday's intention/feeling, morning vs. evening) is injected
at `vapi.start()` via `assistantOverrides` / `variableValues` — it *layers on top*
of this base prompt, it doesn't replace it. Not in v1. See `docs/memory-and-insight.md`.

## The loop, end to end
`vapi.start()` → Vapi runs the call on `morning.md` → app saves the transcript on
hang-up (done) → extraction LLM reads the transcript against `morning.schema.json`
→ `save-entry` writes the fields into `daily_entries` (FR-015 wires this webhook).
