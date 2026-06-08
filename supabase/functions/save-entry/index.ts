// Persists what a call captured. Called per-call (morning or evening) — by the
// app after the call, or a Vapi webhook. Upserts the day's row so morning and
// evening land on the same record.
//
// Body: { device_id, kind: "morning"|"evening", entry_date?, data: {...} }
//   morning data: { gratitude, desired_feeling, intention, clearing, midday_checkin,
//                   midday_time, valence_morning, arousal_morning, affect_label_morning,
//                   themes, transcript }
//   evening data: { actual_feeling, aligned, reflection, valence_evening, arousal_evening,
//                   affect_label_evening, themes, actions, transcript }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function todayInTz(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date()); // YYYY-MM-DD
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

Deno.serve(async (req) => {
  try {
    const { device_id, kind, entry_date, data = {} } = await req.json();
    if (!device_id || (kind !== "morning" && kind !== "evening")) {
      return new Response(
        JSON.stringify({ error: "device_id and kind ('morning'|'evening') required" }),
        { status: 400 },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Default the date to "today" in the device's own timezone.
    let date = entry_date;
    if (!date) {
      const { data: dev } = await supabase
        .from("devices").select("timezone").eq("device_id", device_id).single();
      date = todayInTz(dev?.timezone ?? "UTC");
    }

    const now = new Date().toISOString();
    const row: Record<string, unknown> = { device_id, entry_date: date, updated_at: now };

    if (kind === "morning") {
      const f = [
        "gratitude", "desired_feeling", "intention", "clearing",
        "midday_checkin", "midday_time",
        "valence_morning", "arousal_morning", "affect_label_morning", "themes",
      ] as const;
      for (const k of f) if (data[k] !== undefined) row[k] = data[k];
      if (data.transcript !== undefined) row.morning_transcript = data.transcript;
      row.morning_completed_at = now;
    } else {
      const f = [
        "actual_feeling", "aligned", "reflection",
        "valence_evening", "arousal_evening", "affect_label_evening", "themes", "actions",
      ] as const;
      for (const k of f) if (data[k] !== undefined) row[k] = data[k];
      if (data.transcript !== undefined) row.evening_transcript = data.transcript;
      row.evening_completed_at = now;
    }

    const { data: saved, error } = await supabase
      .from("daily_entries")
      .upsert(row, { onConflict: "device_id,entry_date" })
      .select()
      .single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true, entry: saved }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
