import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../lib/auth";
import { Colors } from "../constants/colors";

export default function LoginScreen() {
  const { signInWithApple, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      // Ignore user-cancelled sign-ins
      if (code !== "ERR_REQUEST_CANCELED" && code !== "-5" && code !== "SIGN_IN_CANCELLED") {
        Alert.alert("Sign-in failed", e instanceof Error ? e.message : String(e));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <Text style={styles.logo}>✦</Text>
        <Text style={styles.title}>Align</Text>
        <Text style={styles.subtitle}>Start each day with intention.</Text>
      </View>

      <View style={styles.buttons}>
        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={14}
            style={styles.appleButton}
            onPress={() => run(signInWithApple)}
          />
        )}

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => run(signInWithGoogle)}
          disabled={busy}
          activeOpacity={0.85}
        >
          <Text style={styles.googleText}>Continue with Google</Text>
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
    paddingHorizontal: 32,
    paddingTop: 140,
    paddingBottom: 60,
  },
  brand: { alignItems: "center", gap: 12 },
  logo: { fontSize: 56, color: Colors.accentLight },
  title: { fontSize: 44, fontWeight: "700", color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 17, color: Colors.textSecondary, textAlign: "center" },
  buttons: { gap: 14 },
  appleButton: { height: 54, width: "100%" },
  googleButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  googleText: { color: "#1F1F1F", fontSize: 17, fontWeight: "600" },
});
