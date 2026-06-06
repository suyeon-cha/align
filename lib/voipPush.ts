import { Platform } from "react-native";
import type { InitialEvent } from "react-native-voip-push-notification";

const VOIP_TOKEN_ENDPOINT = process.env.EXPO_PUBLIC_VOIP_TOKEN_ENDPOINT;
const VOIP_DEVICE_ID = process.env.EXPO_PUBLIC_VOIP_DEVICE_ID ?? "suyeon-iphone";
const REGISTER_EVENT = "RNVoipPushRemoteNotificationsRegisteredEvent";
const NOTIFICATION_EVENT = "RNVoipPushRemoteNotificationReceivedEvent";

type VoipPushNotificationModule = typeof import("react-native-voip-push-notification").default;

declare const require: (
  moduleName: "react-native-voip-push-notification"
) => { default: VoipPushNotificationModule };

type VoipNotification = {
  uuid?: string;
  callerName?: string;
  handle?: string;
};

let isSetup = false;

async function registerTokenWithServer(token: string) {
  if (!VOIP_TOKEN_ENDPOINT) return;

  try {
    await fetch(VOIP_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        deviceId: VOIP_DEVICE_ID,
        platform: "ios",
      }),
    });
  } catch (e) {
    console.error("VoIP token upload failed:", e);
  }
}

function handleRegisteredToken(token: string) {
  console.log("VoIP push token:", token);
  void registerTokenWithServer(token);
}

function handleIncomingNotification(notification: VoipNotification) {
  console.log("VoIP push received:", notification);
}

function handleInitialEvent(event: InitialEvent) {
  if (event.name === REGISTER_EVENT) {
    handleRegisteredToken(event.data as string);
    return;
  }

  if (event.name === NOTIFICATION_EVENT) {
    handleIncomingNotification(event.data as VoipNotification);
  }
}

export function setupVoipPush() {
  if (Platform.OS !== "ios" || isSetup) return () => {};

  const VoipPushNotification = require("react-native-voip-push-notification").default;

  VoipPushNotification.addEventListener("register", handleRegisteredToken);
  VoipPushNotification.addEventListener("notification", handleIncomingNotification);
  VoipPushNotification.addEventListener("didLoadWithEvents", (events) => {
    events?.forEach(handleInitialEvent);
  });
  VoipPushNotification.registerVoipToken();
  isSetup = true;

  return () => {
    VoipPushNotification.removeEventListener("didLoadWithEvents");
    VoipPushNotification.removeEventListener("notification");
    VoipPushNotification.removeEventListener("register");
    isSetup = false;
  };
}
