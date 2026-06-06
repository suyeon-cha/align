// Sends an APNs VoIP push that makes the device ring (CallKit). Called by the
// per-minute cron (dispatch_due_calls) with the service-role key.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function b64url(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") bytes = new TextEncoder().encode(input);
  else bytes = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): Uint8Array {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const raw = atob(body);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function makeApnsJwt(p8: string, keyId: string, teamId: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(p8),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const header = b64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const claims = b64url(JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) }));
  const signingInput = `${header}.${claims}`;
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${b64url(sig)}`;
}

Deno.serve(async (req) => {
  try {
    const { device_id, kind = "morning" } = await req.json();
    if (!device_id) {
      return new Response(JSON.stringify({ error: "device_id required" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: device, error } = await supabase
      .from("devices")
      .select("voip_token, apns_env")
      .eq("device_id", device_id)
      .single();
    if (error || !device) {
      return new Response(JSON.stringify({ error: "device not found" }), { status: 404 });
    }

    const bundleId = Deno.env.get("APNS_BUNDLE_ID") ?? "com.syncha.align";
    const jwt = await makeApnsJwt(
      Deno.env.get("APNS_KEY")!,
      Deno.env.get("APNS_KEY_ID")!,
      Deno.env.get("APNS_TEAM_ID")!,
    );
    const host = device.apns_env === "sandbox"
      ? "api.sandbox.push.apple.com"
      : "api.push.apple.com";
    const uuid = crypto.randomUUID();

    const apns = await fetch(`https://${host}/3/device/${device.voip_token}`, {
      method: "POST",
      headers: {
        authorization: `bearer ${jwt}`,
        "apns-topic": `${bundleId}.voip`,
        "apns-push-type": "voip",
        "apns-priority": "10",
        "apns-expiration": "0",
      },
      body: JSON.stringify({ aps: {}, uuid, handle: "Align", callerName: "Align", kind }),
    });

    const body = await apns.text();
    if (!apns.ok) {
      console.error("APNs error", apns.status, body);
      return new Response(JSON.stringify({ ok: false, status: apns.status, body }), { status: 502 });
    }
    return new Response(JSON.stringify({ ok: true, uuid }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
