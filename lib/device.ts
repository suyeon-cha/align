import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const KEY = "align.device_id";
let cached: string | null = null;
let inflight: Promise<string> | null = null;

/** A stable per-install ID, generated once and persisted.
 *  Guarded against concurrent callers (the VoIP register event can fire
 *  twice) so we never generate two IDs for the same install. */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    let id = await AsyncStorage.getItem(KEY);
    if (!id) {
      id = uuidv4();
      await AsyncStorage.setItem(KEY, id);
    }
    cached = id;
    return id;
  })();
  return inflight;
}

/** The device's IANA timezone, e.g. "America/Los_Angeles". */
export function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
