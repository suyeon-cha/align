// Called by the app when the user saves their call times.
// Body: { device_id, timezone?, schedules: [{ kind, time_local, enabled }] }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { device_id, timezone, schedules } = await req.json();
    if (!device_id || !Array.isArray(schedules)) {
      return new Response(JSON.stringify({ error: "device_id and schedules[] required" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (timezone) {
      await supabase
        .from("devices")
        .update({ timezone, updated_at: new Date().toISOString() })
        .eq("device_id", device_id);
    }

    // Reset last_fired_on so a newly chosen time can still fire today.
    const rows = schedules.map((s: { kind: string; time_local: string; enabled?: boolean }) => ({
      device_id,
      kind: s.kind,
      time_local: s.time_local,
      enabled: s.enabled ?? true,
      last_fired_on: null,
    }));

    const { error } = await supabase
      .from("call_schedules")
      .upsert(rows, { onConflict: "device_id,kind" });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true, count: rows.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
