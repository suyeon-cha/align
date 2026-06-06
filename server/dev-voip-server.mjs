import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nextLocalTimeDelayMs, sendVoipPush } from "./voip-apns.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TOKEN_FILE = path.join(ROOT, ".voip-token.json");
const PORT = Number(process.env.VOIP_DEV_SERVER_PORT ?? 8787);

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body, null, 2));
}

function scheduleCall({ callerName, handle, at }) {
  const delayMs = at ? nextLocalTimeDelayMs(at) : 0;

  setTimeout(() => {
    sendVoipPush({ callerName, handle }).catch((error) => {
      console.error("Scheduled VoIP push failed:", error.message);
    });
  }, Math.max(0, delayMs));

  return Math.max(0, delayMs);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/voip-token") {
      const payload = JSON.parse((await readBody(req)) || "{}");
      if (!payload.token) {
        sendJson(res, 400, { error: "Missing token" });
        return;
      }

      fs.writeFileSync(
        TOKEN_FILE,
        JSON.stringify({ ...payload, updatedAt: new Date().toISOString() }, null, 2)
      );
      console.log(`Saved VoIP token for ${payload.deviceId ?? "device"}`);
      sendJson(res, 200, { ok: true });
      return;
    }

    if ((req.method === "GET" || req.method === "POST") && url.pathname === "/call") {
      const delayMs = scheduleCall({
        at: url.searchParams.get("at"),
        callerName: url.searchParams.get("callerName") ?? "Align",
        handle: url.searchParams.get("handle") ?? "Align",
      });
      sendJson(res, 200, { ok: true, scheduledInSeconds: Math.round(delayMs / 1000) });
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`VoIP dev server listening on http://0.0.0.0:${PORT}`);
  console.log("Set EXPO_PUBLIC_VOIP_TOKEN_ENDPOINT=http://<your-mac-lan-ip>:8787/voip-token");
});
