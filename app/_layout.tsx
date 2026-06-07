import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { setupCallKeep, onAnswer } from "../lib/callkeep";
import { setupVoipPush } from "../lib/voipPush";
import { AuthProvider, useAuth } from "../lib/auth";

function RootNavigator() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Call / VoIP listeners (set up once).
  useEffect(() => {
    void setupCallKeep();
    const removeVoipPushListeners = setupVoipPush();
    const removeAnswerListener = onAnswer(() => {
      router.push("/active-call");
    });
    return () => {
      removeAnswerListener();
      removeVoipPushListeners();
    };
  }, []);

  // Auth gate: require login on first open.
  useEffect(() => {
    if (loading) return;
    const onLogin = segments[0] === "login";
    if (!session && !onLogin) router.replace("/login");
    else if (session && onLogin) router.replace("/");
  }, [session, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen
        name="active-call"
        options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="schedule"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
