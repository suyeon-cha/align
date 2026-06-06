import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { setupCallKeep, onAnswer } from "../lib/callkeep";

export default function RootLayout() {
  useEffect(() => {
    void setupCallKeep();
    // When the user accepts the native incoming call, open the call screen.
    const removeAnswerListener = onAnswer(() => {
      router.push("/active-call");
    });

    return removeAnswerListener;
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
