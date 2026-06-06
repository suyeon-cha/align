import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/colors";
import { getDeviceId, getTimezone } from "../lib/device";
import { saveSchedule, ScheduleKind } from "../lib/api";

type TimeState = { h: number; m: number };

const pad = (n: number) => n.toString().padStart(2, "0");
const fmt = (t: TimeState) => `${pad(t.h)}:${pad(t.m)}`;
const wrap = (n: number, max: number) => ((n % max) + max) % max;

function TimeStepper({ value, onChange }: { value: TimeState; onChange: (t: TimeState) => void }) {
  const bump = (field: "h" | "m", dir: 1 | -1) => {
    if (field === "h") onChange({ ...value, h: wrap(value.h + dir, 24) });
    else onChange({ ...value, m: wrap(value.m + dir * 5, 60) });
  };
  return (
    <View style={styles.stepperRow}>
      <View style={styles.stepperCol}>
        <TouchableOpacity onPress={() => bump("h", 1)} style={styles.chev}><Text style={styles.chevText}>▲</Text></TouchableOpacity>
        <Text style={styles.timeNum}>{pad(value.h)}</Text>
        <TouchableOpacity onPress={() => bump("h", -1)} style={styles.chev}><Text style={styles.chevText}>▼</Text></TouchableOpacity>
      </View>
      <Text style={styles.colon}>:</Text>
      <View style={styles.stepperCol}>
        <TouchableOpacity onPress={() => bump("m", 1)} style={styles.chev}><Text style={styles.chevText}>▲</Text></TouchableOpacity>
        <Text style={styles.timeNum}>{pad(value.m)}</Text>
        <TouchableOpacity onPress={() => bump("m", -1)} style={styles.chev}><Text style={styles.chevText}>▼</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function CallCard({
  title, emoji, enabled, setEnabled, time, setTime,
}: {
  title: string; emoji: string; enabled: boolean; setEnabled: (b: boolean) => void;
  time: TimeState; setTime: (t: TimeState) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{emoji}  {title}</Text>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ true: Colors.accent, false: Colors.border }}
          thumbColor={Colors.white}
        />
      </View>
      <View style={[styles.cardBody, !enabled && styles.dimmed]} pointerEvents={enabled ? "auto" : "none"}>
        <TimeStepper value={time} onChange={setTime} />
      </View>
    </View>
  );
}

export default function ScheduleScreen() {
  const router = useRouter();
  const [morningOn, setMorningOn] = useState(true);
  const [morning, setMorning] = useState<TimeState>({ h: 7, m: 0 });
  const [eveningOn, setEveningOn] = useState(true);
  const [evening, setEvening] = useState<TimeState>({ h: 21, m: 0 });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const tz = getTimezone();

  const onSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const device_id = await getDeviceId();
      const schedules = [
        { kind: "morning" as ScheduleKind, time_local: fmt(morning), enabled: morningOn },
        { kind: "evening" as ScheduleKind, time_local: fmt(evening), enabled: eveningOn },
      ];
      await saveSchedule({ device_id, timezone: tz, schedules });
      setStatus("Saved ✓");
      setTimeout(() => router.back(), 800);
    } catch (e) {
      setStatus(`Couldn't save: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Call times</Text>
        <Text style={styles.sub}>Align will call you at these times, every day.</Text>

        <CallCard title="Morning" emoji="🌅" enabled={morningOn} setEnabled={setMorningOn} time={morning} setTime={setMorning} />
        <CallCard title="Evening" emoji="🌙" enabled={eveningOn} setEnabled={setEveningOn} time={evening} setTime={setEvening} />

        <Text style={styles.tz}>Times are in your timezone ({tz})</Text>
      </ScrollView>

      <View style={styles.footer}>
        {status && <Text style={styles.statusText}>{status}</Text>}
        <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving}>
          {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 24, paddingTop: 72, gap: 16 },
  heading: { fontSize: 32, fontWeight: "700", color: Colors.textPrimary, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: Colors.textSecondary, marginBottom: 8 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 18, fontWeight: "600", color: Colors.textPrimary },
  cardBody: { marginTop: 16, alignItems: "center" },
  dimmed: { opacity: 0.35 },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepperCol: { alignItems: "center", gap: 8 },
  chev: { padding: 6 },
  chevText: { color: Colors.accentLight, fontSize: 18 },
  timeNum: { color: Colors.textPrimary, fontSize: 44, fontWeight: "700", fontVariant: ["tabular-nums"], minWidth: 64, textAlign: "center" },
  colon: { color: Colors.textSecondary, fontSize: 40, fontWeight: "300", marginHorizontal: 4 },
  tz: { fontSize: 13, color: Colors.textSecondary, textAlign: "center", marginTop: 8 },
  footer: { padding: 24, paddingBottom: 40, gap: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  statusText: { color: Colors.textSecondary, textAlign: "center", fontSize: 14 },
  saveButton: { backgroundColor: Colors.accent, borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  saveText: { color: Colors.white, fontSize: 17, fontWeight: "600" },
  cancel: { color: Colors.textSecondary, textAlign: "center", fontSize: 15, paddingVertical: 8 },
});
