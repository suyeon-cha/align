import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { setupCallKeep, onAnswer } from "../lib/callkeep";
import { setupVoipPush } from "../lib/voipPush";

export default function RootLayout() {
  useEffect(() => {
    void setupCallKeep();
    const removeVoipPushListeners = setupVoipPush();
    // When the user accepts the native incoming call, open the call screen.
    const removeAnswerListener = onAnswer(() => {
      router.push("/active-call");
    });

    return () => {
      removeAnswerListener();
      removeVoipPushListeners();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="active-call"
        options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}
