// Reads a device's recent daily entries (newest first). For history / the
// pattern-detection work later.
// Body: { device_id, limit? }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { device_id, limit = 30 } = await req.json();
    if (!device_id) {
      return new Response(JSON.stringify({ error: "device_id required" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("device_id", device_id)
      .order("entry_date", { ascending: false })
      .limit(Math.min(Number(limit) || 30, 200));
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true, entries: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
