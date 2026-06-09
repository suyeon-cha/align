// Ring the phone on demand — fires the same VoIP push the cron uses.
// Usage:  node scripts/ring.mjs [morning|evening]
import { readFileSync } from "node:fs";

function loadEnv(path) {
  const e = {};
  for (const l of readFileSync(path, "utf8").split("\n")) {
    const m = l.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return e;
}

const env = loadEnv(".env.local");
const URL = env.EXPO_PUBLIC_SUPABASE_URL;
const SR = env.SUPABASE_SERVICE_ROLE_KEY;          // reads the DB (bypasses RLS)
const ANON = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;    // a JWT — invokes the function (gateway needs a JWT)
const kind = process.argv[2] || "morning";
if (!URL || !SR || !ANON) {
  console.error("Need EXPO_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const dbHeaders = { Authorization: `Bearer ${SR}`, apikey: SR, "Content-Type": "application/json" };
const fnHeaders = { Authorization: `Bearer ${ANON}`, apikey: ANON, "Content-Type": "application/json" };

// Most-recently-active device = the phone in hand.
const devs = await fetch(
  `${URL}/rest/v1/devices?select=device_id,updated_at&order=updated_at.desc&limit=1`,
  { headers: dbHeaders },
).then((r) => r.json());
if (!Array.isArray(devs) || !devs.length) { console.error("No devices found."); process.exit(1); }

const device_id = devs[0].device_id;
const res = await fetch(`${URL}/functions/v1/send-call`, {
  method: "POST", headers: fnHeaders, body: JSON.stringify({ device_id, kind }),
});
const out = await res.json();
console.log(res.ok ? `📞 ringing ${device_id.slice(0, 8)}… (${kind})` : `❌ ${res.status}`, out);
