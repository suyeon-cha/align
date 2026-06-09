// extract-entry — OUR OWN structured extraction over a call transcript (Claude).
//
// The app POSTs { device_id, kind, transcript[] } after a call; we call Claude
// with a forced tool schema (reliable JSON), then write the fields into
// daily_entries. Owning this (vs Vapi's built-in) lets us re-run an evolving
// schema over OLD transcripts later — the basis of the "edit your brain" vision.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MODEL = Deno.env.get("EXTRACT_MODEL") ?? "claude-haiku-4-5-20251001";

const MORNING_TOOL = {
  name: "record_morning",
  description: "Record the structured fields from a morning check-in call.",
  input_schema: {
    type: "object",
    properties: {
      gratitude: { type: "string", description: "What they appreciated / were grateful for. Empty string if none." },
      desired_feeling: { type: "string", description: "How they want to FEEL today, e.g. 'calm', 'focused'. Empty if not given." },
      intention: { type: "string", description: "The single anchor thing that would make today feel aligned. Empty if none." },
      action_steps: { type: "array", items: { type: "string" }, description: "1-3 concrete steps to accomplish the intention, with a when if mentioned." },
      clearing: { type: "string", description: "Anything heavy they wanted to set down. Empty if none." },
      valence_morning: { type: "number", description: "How they ARRIVED: -1 (very unpleasant) to 1 (very pleasant). Infer from tone; 0 if unclear." },
      arousal_morning: { type: "number", description: "-1 (calm/flat) to 1 (activated/agitated). Infer from tone." },
      affect_label_morning: { type: "string", description: "One word for their dominant arriving state, e.g. 'anxious', 'calm', 'tired'." },
      themes: { type: "array", items: { type: "string" }, description: "1-4 lowercase topic tags, e.g. 'work', 'family'." },
    },
    required: [],
  },
};

const EVENING_TOOL = {
  name: "record_evening",
  description: "Record the structured fields from an evening reflection call.",
  input_schema: {
    type: "object",
    properties: {
      actual_feeling: { type: "string", description: "How the day actually felt. Empty if none." },
      aligned: { type: "boolean", description: "Did the day align with their morning intention?" },
      reflection: { type: "string", description: "Their reflection on the day, condensed to their own words." },
      valence_evening: { type: "number", description: "-1 (very unpleasant) to 1 (very pleasant)." },
      arousal_evening: { type: "number", description: "-1 (calm) to 1 (activated)." },
      affect_label_evening: { type: "string", description: "One word for their end-of-day state." },
      themes: { type: "array", items: { type: "string" }, description: "1-4 lowercase topic tags." },
      actions: { type: "array", items: { type: "string" }, description: "What they actually did today." },
    },
    required: [],
  },
};

function todayInTz(tz: string): string {
  try { return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date()); }
  catch { return new Date().toISOString().slice(0, 10); }
}

Deno.serve(async (req) => {
  try {
    const { device_id, kind = "morning", transcript } = await req.json();
    if (!device_id || !Array.isArray(transcript) || transcript.length === 0) {
      return new Response(JSON.stringify({ error: "device_id and non-empty transcript[] required" }), { status: 400 });
    }
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), { status: 500 });

    const text = transcript
      .map((l: { role: string; text: string }) => `${l.role === "user" ? "User" : "Align"}: ${l.text}`)
      .join("\n");
    const tool = kind === "evening" ? EVENING_TOOL : MORNING_TOOL;

    const ai = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        tools: [tool],
        tool_choice: { type: "tool", name: tool.name },
        messages: [{
          role: "user",
          content: `Extract the fields from this ${kind} check-in call. Infer affect from tone and content; never invent facts not in the transcript. Use empty string / empty array where something wasn't covered.\n\nTranscript:\n${text}`,
        }],
      }),
    });
    if (!ai.ok) {
      console.error("[extract-entry] anthropic error:", ai.status, await ai.text());
      return new Response(JSON.stringify({ error: `anthropic ${ai.status}` }), { status: 502 });
    }
    const data = await ai.json();
    const toolUse = (data.content ?? []).find((c: { type: string }) => c.type === "tool_use");
    const extracted = (toolUse?.input ?? {}) as Record<string, unknown>;
    console.log("[extract-entry] kind=", kind, "extractedKeys=", Object.keys(extracted));

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: dev } = await supabase.from("devices").select("timezone").eq("device_id", device_id).single();
    const date = todayInTz(dev?.timezone ?? "UTC");
    const now = new Date().toISOString();

    const row: Record<string, unknown> = { device_id, entry_date: date, updated_at: now };
    for (const [k, v] of Object.entries(extracted)) row[k] = v;
    row[kind === "evening" ? "evening_completed_at" : "morning_completed_at"] = now;

    const { data: saved, error } = await supabase
      .from("daily_entries").upsert(row, { onConflict: "device_id,entry_date" }).select().single();
    if (error) {
      console.error("[extract-entry] upsert error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true, extracted, entry_id: saved?.id }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[extract-entry] error:", String(e));
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
