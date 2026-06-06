// Thin client for the Supabase edge functions. Plain fetch + the anon key —
// no extra dependency needed.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function callFn<T = unknown>(name: string, body: unknown): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase env not configured (EXPO_PUBLIC_SUPABASE_URL / ANON_KEY)");
  }
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${name} ${res.status}: ${text}`);
  return (text ? JSON.parse(text) : {}) as T;
}

export type ScheduleKind = "morning" | "evening" | "midday";
export type ScheduleInput = { kind: ScheduleKind; time_local: string; enabled: boolean };

export function registerToken(p: {
  device_id: string;
  voip_token: string;
  platform?: string;
  timezone?: string;
}) {
  return callFn("register-token", p);
}

export function saveSchedule(p: {
  device_id: string;
  timezone: string;
  schedules: ScheduleInput[];
}) {
  return callFn<{ ok: boolean; count: number }>("save-schedule", p);
}
