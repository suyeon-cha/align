import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "align.schedule.v1";

export type TimeState = { h: number; m: number };
export type StoredSchedule = {
  morningOn: boolean;
  morning: TimeState;
  eveningOn: boolean;
  evening: TimeState;
};

/** Read the last-saved schedule from on-device storage (instant, offline). */
export async function loadLocalSchedule(): Promise<StoredSchedule | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredSchedule) : null;
  } catch {
    return null;
  }
}

/** Mirror the schedule locally so the screen can show it immediately on reopen. */
export async function saveLocalSchedule(s: StoredSchedule): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // non-fatal — the backend is still the source of truth for firing calls
  }
}
