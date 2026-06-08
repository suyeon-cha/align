// Vapi end-of-call webhook → persists what the call captured.
//
// With `assistant.analysisPlan.structuredDataPlan` enabled (schema = vapi/morning.schema.json),
// Vapi extracts the structured fields at call end and POSTs an `end-of-call-report`
// here. We read `device_id` from the call's variableValues (threaded at vapi.start())
// and write the structured fields into `daily_entries` (+ log the event in `calls`).
//
// Deployed PUBLIC (--no-verify-jwt) since Vapi has no Supabase JWT. Optional shared
// secret via VAPI_WEBHOOK_SECRET (set it in Vapi's server.secret + as a function secret).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function todayInTz(tz: string): string {
  try { return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date()); }
  catch { return new Date().toISOString().slice(0, 10); }
}

const MORNING_FIELDS = [
  "gratitude", "desired_feeling", "intention", "clearing", "action_steps",
  "valence_morning", "arousal_morning", "affect_label_morning", "themes",
];
const EVENING_FIELDS = [
  "actual_feeling", "aligned", "reflection",
  "valence_evening", "arousal_evening", "affect_label_evening", "themes", "actions",
];

Deno.serve(async (req) => {
  try {
    // Optional hardening — works without the secret for MVP, lock down by setting it.
    const expected = Deno.env.get("VAPI_WEBHOOK_SECRET");
    if (expected && req.headers.get("x-vapi-secret") !== expected) {
      return new Response("unauthorized", { status: 401 });
    }

    const body = await req.json();
    const msg = body?.message ?? body ?? {};
    if (msg.type && msg.type !== "end-of-call-report") {
      return new Response(JSON.stringify({ ok: true, ignored: msg.type }), { status: 200 });
    }

    // Be defensive about nesting (varies by Vapi version): check msg.* and msg.call.*
    const call = msg.call ?? {};
    const analysis = msg.analysis ?? call.analysis ?? {};
    const artifact = msg.artifact ?? call.artifact ?? {};
    const vars = artifact.variableValues ?? call.metadata ?? msg.metadata ?? {};

    const structured = analysis.structuredData ?? {};
    const device_id = vars.device_id;
    const user_id = vars.user_id || null;
    const kind = vars.kind === "evening" ? "evening" : "morning";
    const vapiCallId = call.id ?? msg.callId ?? null;
    const transcript = artifact.transcript ?? null;
    const startedAt = msg.startedAt ?? call.startedAt ?? null;
    const durationSeconds = msg.durationSeconds ?? call.durationSeconds ?? null;

    // Log the shape once so we can confirm the field paths against reality on the device test.
    console.log("[vapi-webhook] type=", msg.type, "device_id=", device_id,
      "structuredKeys=", Object.keys(structured), "hasTranscript=", !!transcript);

    if (!device_id) {
      return new Response(JSON.stringify({ error: "no device_id in variableValues/metadata" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: dev } = await supabase
      .from("devices").select("timezone,user_id").eq("device_id", device_id).single();
    const date = todayInTz(dev?.timezone ?? "UTC");
    const now = new Date().toISOString();

    const fields = kind === "morning" ? MORNING_FIELDS : EVENING_FIELDS;
    const row: Record<string, unknown> = { device_id, entry_date: date, updated_at: now };
    for (const k of fields) if (structured[k] !== undefined) row[k] = structured[k];
    row[kind === "morning" ? "morning_completed_at" : "evening_completed_at"] = now;

    const { data: saved, error } = await supabase
      .from("daily_entries")
      .upsert(row, { onConflict: "device_id,entry_date" })
      .select("id").single();
    if (error) {
      console.error("[vapi-webhook] daily_entries upsert error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // Best-effort: log the call event. calls.user_id is NOT NULL — fall back to the device owner.
    const callUser = user_id ?? dev?.user_id ?? null;
    if (callUser) {
      const { error: callErr } = await supabase.from("calls").insert({
        user_id: callUser, device_id, daily_entry_id: saved?.id ?? null, kind,
        status: "completed", vapi_call_id: vapiCallId, transcript,
        started_at: startedAt, duration_seconds: durationSeconds,
      });
      if (callErr) console.error("[vapi-webhook] calls insert (non-fatal):", callErr.message);
    } else {
      console.warn("[vapi-webhook] no user_id available; skipped calls log");
    }

    return new Response(JSON.stringify({ ok: true, entry_id: saved?.id }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[vapi-webhook] error:", String(e));
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
