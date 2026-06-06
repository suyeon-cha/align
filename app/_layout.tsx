import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { setupCallKeep, onAnswer } from "../lib/callkeep";

export default function RootLayout() {
  useEffect(() => {
    setupCallKeep();
    // When the user accepts the native incoming call, open the call screen.
    onAnswer(() => {
      router.push("/active-call");
    });
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
