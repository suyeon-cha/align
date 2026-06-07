// Links the calling device to the signed-in user. Derives the user from their
// JWT (Authorization header) — so a user can only claim a device for themselves.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const { device_id, timezone, platform = "ios" } = await req.json();
    if (!device_id) {
      return new Response(JSON.stringify({ error: "device_id required" }), { status: 400 });
    }

    // Identify the caller from their access token.
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "not authenticated" }), { status: 401 });
    }

    // Upsert the device's user_id with the service role (sets owner; preserves
    // the voip_token that register-token wrote).
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const row: Record<string, unknown> = {
      device_id,
      user_id: user.id,
      platform,
      updated_at: new Date().toISOString(),
    };
    if (timezone) row.timezone = timezone;

    const { error } = await admin.from("devices").upsert(row, { onConflict: "device_id" });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true, user_id: user.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
