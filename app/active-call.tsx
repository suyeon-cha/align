import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useVapiCall } from "../hooks/useVapiCall";
import { onEnd, removeEndListener, endCurrentCall } from "../lib/callkeep";
import { Colors } from "../constants/colors";

export default function ActiveCallScreen() {
  const router = useRouter();
  const { status, isMuted, transcript, startCall, endCall, toggleMute } = useVapiCall();
  const waveAnim = useRef(new Animated.Value(0.6)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    startCall();
    // If the user ends the call from the native CallKit screen, stop Vapi too.
    onEnd(() => {
      endCall();
      router.replace("/");
    });
    return () => removeEndListener();
  }, []);

  // Animate the waveform when call is active
  useEffect(() => {
    if (status === "active") {
      const wave = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0.6, duration: 600, useNativeDriver: true }),
        ])
      );
      wave.start();
      return () => wave.stop();
    }
  }, [status]);

  useEffect(() => {
    if (status === "ended") {
      // Vapi ended on its own (e.g. assistant hung up) — clear the native call.
      endCurrentCall();
      const t = setTimeout(() => router.replace("/"), 1500);
      return () => clearTimeout(t);
    }
  }, [status]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [transcript]);

  const handleEnd = () => {
    endCall();
    router.replace("/");
  };

  const statusLabel = {
    idle: "Starting...",
    connecting: "Connecting...",
    active: "In call",
    ended: "Call ended",
  }[status];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.callerName}>Align</Text>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>

      {/* Visual indicator */}
      <View style={styles.visualizer}>
        {[0.5, 0.8, 1, 0.8, 0.5].map((scale, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                transform: [
                  {
                    scaleY: status === "active"
                      ? Animated.multiply(waveAnim, scale)
                      : new Animated.Value(0.3),
                  },
                ],
                opacity: status === "active" ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>

      {/* Live transcript */}
      <View style={styles.transcriptContainer}>
        <ScrollView ref={scrollRef} style={styles.transcriptScroll} showsVerticalScrollIndicator={false}>
          {transcript.length === 0 ? (
            <Text style={styles.transcriptPlaceholder}>
              {status === "connecting" ? "Connecting to Align..." : "Align will speak shortly..."}
            </Text>
          ) : (
            transcript.map((line, i) => (
              <Text key={i} style={[styles.transcriptLine, !line.final && styles.transcriptPartial]}>
                {line.role === "user" ? "You" : "Align"}: {line.text}
              </Text>
            ))
          )}
        </ScrollView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Text style={styles.controlIcon}>{isMuted ? "🔇" : "🎙"}</Text>
          <Text style={styles.controlLabel}>{isMuted ? "Unmute" : "Mute"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endButton} onPress={handleEnd}>
          <Text style={styles.endIcon}>✕</Text>
        </TouchableOpacity>

        <View style={styles.controlButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    gap: 6,
    marginBottom: 40,
  },
  callerName: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  visualizer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 80,
    marginBottom: 40,
  },
  bar: {
    width: 5,
    height: 50,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transcriptScroll: {
    flex: 1,
  },
  transcriptPlaceholder: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  transcriptLine: {
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  transcriptPartial: {
    color: Colors.textSecondary,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  controlButton: {
    width: 64,
    alignItems: "center",
    gap: 6,
  },
  controlButtonActive: {
    opacity: 0.5,
  },
  controlIcon: {
    fontSize: 28,
  },
  controlLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  endButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.decline,
    alignItems: "center",
    justifyContent: "center",
  },
  endIcon: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: "300",
  },
});
