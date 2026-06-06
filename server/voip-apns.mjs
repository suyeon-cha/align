import crypto from "node:crypto";
import fs from "node:fs";
import http2 from "node:http2";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TOKEN_FILE = path.join(ROOT, ".voip-token.json");
const DEFAULT_BUNDLE_ID = "com.syncha.align";

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function readTokenFile() {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));
}

function createProviderToken({ keyId, teamId, privateKey }) {
  const header = base64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const claims = base64url(
    JSON.stringify({
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
    })
  );
  const signingInput = `${header}.${claims}`;
  const signature = crypto
    .createSign("sha256")
    .update(signingInput)
    .end()
    .sign({ key: privateKey, dsaEncoding: "ieee-p1363" });

  return `${signingInput}.${signature.toString("base64url")}`;
}

function readApnsConfig() {
  const keyPath = process.env.APNS_AUTH_KEY_PATH;
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const bundleId = process.env.APNS_BUNDLE_ID ?? DEFAULT_BUNDLE_ID;
  const environment = process.env.APNS_ENV ?? "production";

  const missing = [
    ["APNS_AUTH_KEY_PATH", keyPath],
    ["APNS_KEY_ID", keyId],
    ["APNS_TEAM_ID", teamId],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing APNs env var(s): ${missing.join(", ")}`);
  }

  return {
    bundleId,
    environment,
    host: environment === "production" ? "api.push.apple.com" : "api.sandbox.push.apple.com",
    keyId,
    privateKey: fs.readFileSync(path.resolve(keyPath), "utf8"),
    teamId,
    topic: process.env.APNS_TOPIC ?? `${bundleId}.voip`,
  };
}

export function nextLocalTimeDelayMs(hhmm) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!match) throw new Error(`Expected --at HH:MM, got ${hhmm}`);

  const [, hourText, minuteText] = match;
  const target = new Date();
  target.setHours(Number(hourText), Number(minuteText), 0, 0);
  if (target <= new Date()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - Date.now();
}

export async function sendVoipPush({
  callerName = "Align",
  handle = "Align",
  token,
  uuid = crypto.randomUUID(),
} = {}) {
  const savedToken = readTokenFile()?.token;
  const deviceToken = token ?? process.env.VOIP_DEVICE_TOKEN ?? savedToken;
  if (!deviceToken) {
    throw new Error("No VoIP device token. Pass --token, set VOIP_DEVICE_TOKEN, or run the token server.");
  }

  const config = readApnsConfig();
  const providerToken = createProviderToken(config);
  const payload = JSON.stringify({
    aps: {},
    callerName,
    handle,
    uuid,
  });

  const client = http2.connect(`https://${config.host}`);

  return new Promise((resolve, reject) => {
    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${providerToken}`,
      "apns-expiration": "0",
      "apns-priority": "10",
      "apns-push-type": "voip",
      "apns-topic": config.topic,
    });

    let responseBody = "";
    let statusCode = 0;

    req.setEncoding("utf8");
    req.on("response", (headers) => {
      statusCode = Number(headers[":status"] ?? 0);
    });
    req.on("data", (chunk) => {
      responseBody += chunk;
    });
    req.on("error", (error) => {
      client.close();
      reject(error);
    });
    req.on("end", () => {
      client.close();
      if (statusCode >= 200 && statusCode < 300) {
        resolve({ uuid, statusCode });
        return;
      }
      reject(new Error(`APNs ${statusCode}: ${responseBody || "<empty response>"}`));
    });
    req.end(payload);
  });
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    args[key] = next && !next.startsWith("--") ? next : "true";
    if (args[key] === next) i += 1;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const delayMs = args.at ? nextLocalTimeDelayMs(args.at) : 0;

  if (delayMs > 0) {
    console.log(`Scheduling VoIP push in ${Math.round(delayMs / 1000)}s`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  const result = await sendVoipPush({
    callerName: args["caller-name"],
    handle: args.handle,
    token: args.token,
    uuid: args.uuid,
  });
  console.log(`Sent VoIP push ${result.uuid} (${result.statusCode})`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
