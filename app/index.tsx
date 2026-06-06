import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/colors";
import { startIncomingCall } from "../lib/callkeep";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning</Text>
        <Text style={styles.subtitle}>Your check-in is ready</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => {
            void startIncomingCall();
          }}
        >
          <Text style={styles.callButtonText}>Start Morning Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/schedule")}
        >
          <Text style={styles.secondaryText}>Call times</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "space-between",
    padding: 32,
    paddingTop: 80,
    paddingBottom: 60,
  },
  header: { gap: 8 },
  greeting: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 18, color: Colors.textSecondary },
  actions: { gap: 12 },
  callButton: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  callButtonText: { color: Colors.white, fontSize: 17, fontWeight: "600" },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  secondaryText: { color: Colors.textPrimary, fontSize: 17, fontWeight: "600" },
});
