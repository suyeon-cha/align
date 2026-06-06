import { Platform } from "react-native";
import type { InitialEvent } from "react-native-voip-push-notification";
import { getDeviceId, getTimezone } from "./device";
import { registerToken } from "./api";

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

async function registerTokenWithBackend(token: string) {
  try {
    const device_id = await getDeviceId();
    await registerToken({
      device_id,
      voip_token: token,
      platform: "ios",
      timezone: getTimezone(),
    });
    console.log("VoIP token registered with Supabase");
  } catch (e) {
    console.error("VoIP token upload failed:", e);
  }
}

function handleRegisteredToken(token: string) {
  console.log("VoIP push token:", token);
  void registerTokenWithBackend(token);
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
