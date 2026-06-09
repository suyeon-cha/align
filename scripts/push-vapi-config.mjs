// Push the morning assistant's config to Vapi from code (so the conversation lives
// in the repo, not the dashboard). Reads VAPI_PRIVATE_KEY + the assistant id from
// .env.local; sets the system prompt from vapi/morning.md. Preserves the existing
// model provider/model and voice.
//
// Run:  node scripts/push-vapi-config.mjs
import { readFileSync } from "node:fs";

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return env;
}

const env = loadEnv(".env.local");
const KEY = env.VAPI_PRIVATE_KEY;
const ID = env.EXPO_PUBLIC_VAPI_MORNING_ASSISTANT_ID;
if (!KEY || !ID) {
  console.error("Missing VAPI_PRIVATE_KEY or EXPO_PUBLIC_VAPI_MORNING_ASSISTANT_ID in .env.local");
  process.exit(1);
}

// System prompt = everything in vapi/morning.md below the first horizontal rule.
const md = readFileSync("vapi/morning.md", "utf8");
const prompt = md.split(/^---\s*$/m).slice(1).join("---").trim();
if (prompt.length < 100) { console.error("morning.md body looks too short — aborting"); process.exit(1); }

const base = "https://api.vapi.ai";
const headers = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const cur = await fetch(`${base}/assistant/${ID}`, { headers }).then((r) => r.json());
if (cur.error || cur.message) { console.error("GET assistant failed:", JSON.stringify(cur).slice(0, 400)); process.exit(1); }

// Preserve the working provider/model; just swap in our system prompt.
const model = {
  provider: cur.model?.provider ?? "openai",
  model: cur.model?.model ?? "gpt-4o",
  messages: [{ role: "system", content: prompt }],
};

const res = await fetch(`${base}/assistant/${ID}`, {
  method: "PATCH", headers, body: JSON.stringify({ model }),
});
const out = await res.json();
if (!res.ok) { console.error("PATCH failed:", res.status, JSON.stringify(out).slice(0, 600)); process.exit(1); }

console.log(`✅ pushed system prompt (${prompt.length} chars) to assistant ${ID}`);
console.log(`   brain: ${out.model?.provider} / ${out.model?.model}   voice: ${out.voice?.provider ?? "?"}`);
