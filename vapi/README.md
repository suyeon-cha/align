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
We hold only the **public** Vapi key, which starts calls + passes overrides but
**cannot** edit assistants — so configure the morning assistant in the dashboard:
1. **System Prompt** ← paste the body of `morning.md` (everything below the `---`).
2. **Model / Voice / Transcriber** ← per the table above (audition the voice).
3. **Analysis → Structured Data:** enable it, paste `morning.schema.json` as the schema.
   Vapi runs extraction at call-end → `call.analysis.structuredData`.
4. **Server URL (webhook):** `https://ftguelkzinuevjervbjo.supabase.co/functions/v1/vapi-webhook`
   - Enable the **`end-of-call-report`** server message.
   - Optional hardening: set a `server.secret`, then add it as the `VAPI_WEBHOOK_SECRET` function secret.
   - If Vapi reports 401: append `?apikey=<anon key>` to the URL (or add an `apikey` header).

The app already threads `device_id` / `user_id` / `kind` as `variableValues` at
`vapi.start()`, so the webhook knows which `daily_entries` row to fill.

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
