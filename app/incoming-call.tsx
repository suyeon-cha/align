import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/colors";

export default function IncomingCallScreen() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for the avatar
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Vibrate like a real incoming call
    const pattern = [0, 500, 1000, 500, 1000, 500];
    Vibration.vibrate(pattern, true);

    return () => {
      pulse.stop();
      Vibration.cancel();
    };
  }, []);

  const handleAccept = () => {
    Vibration.cancel();
    router.replace("/active-call");
  };

  const handleDecline = () => {
    Vibration.cancel();
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.callType}>Morning Check-In</Text>
        <Text style={styles.callLabel}>align • incoming call</Text>
      </View>

      <View style={styles.middle}>
        <Animated.View
          style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>✦</Text>
          </View>
        </Animated.View>
        <Text style={styles.callerName}>Align</Text>
        <Text style={styles.callerSub}>Ready to set your intentions</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={handleDecline}
        >
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept}
        >
          <Text style={styles.actionIcon}>↗</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionLabels}>
        <Text style={styles.actionLabel}>Decline</Text>
        <Text style={styles.actionLabel}>Accept</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 32,
  },
  top: {
    alignItems: "center",
    gap: 6,
  },
  callType: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  callLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  middle: {
    alignItems: "center",
    gap: 16,
  },
  avatarRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: Colors.accent + "55",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.accent + "22",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.accent + "44",
  },
  avatarEmoji: {
    fontSize: 52,
    color: Colors.accentLight,
  },
  callerName: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  callerSub: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: 60,
    alignItems: "center",
  },
  actionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  declineButton: {
    backgroundColor: Colors.decline,
  },
  acceptButton: {
    backgroundColor: Colors.accept,
  },
  actionIcon: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: "300",
  },
  actionLabels: {
    flexDirection: "row",
    gap: 100,
  },
  actionLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
