import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { startIncomingCall } from "../lib/callkeep";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning</Text>
        <Text style={styles.subtitle}>Your check-in is ready</Text>
      </View>

      <TouchableOpacity
        style={styles.callButton}
        onPress={() => {
          void startIncomingCall();
        }}
      >
        <Text style={styles.callButtonText}>Start Morning Call</Text>
      </TouchableOpacity>
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
  header: {
    gap: 8,
  },
  greeting: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  callButton: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  callButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
});
