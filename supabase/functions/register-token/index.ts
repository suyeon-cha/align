// Called by the app on launch to store/refresh its VoIP push token + timezone.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { device_id, voip_token, platform = "ios", timezone } = await req.json();
    if (!device_id || !voip_token) {
      return new Response(JSON.stringify({ error: "device_id and voip_token required" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const row: Record<string, unknown> = {
      device_id,
      voip_token,
      platform,
      updated_at: new Date().toISOString(),
    };
    if (timezone) row.timezone = timezone;

    const { error } = await supabase.from("devices").upsert(row, { onConflict: "device_id" });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
