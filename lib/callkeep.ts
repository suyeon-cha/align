import "react-native-get-random-values";
import { Platform } from "react-native";
import RNCallKeep, { type EventListener } from "react-native-callkeep";
import { v4 as uuidv4 } from "uuid";

let currentCallUUID: string | null = null;
let isSetup = false;
let setupPromise: Promise<boolean> | null = null;

type Unsubscribe = () => void;

export async function setupCallKeep(): Promise<boolean> {
  if (isSetup) return true;
  if (setupPromise) return setupPromise;

  setupPromise = RNCallKeep.setup({
      ios: {
        appName: "Align",
        supportsVideo: false,
        maximumCallGroups: "1",
        maximumCallsPerCallGroup: "1",
        includesCallsInRecents: false,
      },
      android: {
        alertTitle: "Permissions required",
        alertDescription:
          "Align needs phone-account access to ring you for your check-ins.",
        cancelButton: "Cancel",
        okButton: "OK",
        additionalPermissions: [],
        foregroundService: {
          channelId: "com.syncha.align.call",
          channelName: "Align Calls",
          notificationTitle: "Align is ringing you",
        },
      },
    })
    .then(() => {
      if (Platform.OS === "android") {
        RNCallKeep.setAvailable(true);
      }
      isSetup = true;
      return true;
    })
    .catch((e) => {
      setupPromise = null;
      console.error("CallKeep setup failed:", e);
      return false;
    });

  return setupPromise;
}

/** Ring the user with a native incoming call. Returns the call's UUID. */
export async function startIncomingCall(callerName = "Align"): Promise<string | null> {
  const isReady = await setupCallKeep();
  if (!isReady) return null;

  const uuid = uuidv4();
  currentCallUUID = uuid;
  RNCallKeep.displayIncomingCall(uuid, callerName, callerName, "generic", false);
  return uuid;
}

/** End the active native call (used by our in-app End button). */
export function endCurrentCall() {
  const uuid = currentCallUUID;
  currentCallUUID = null;

  if (uuid) {
    RNCallKeep.endCall(uuid);
  } else {
    RNCallKeep.endAllCalls();
  }
}

/** Fired when the user taps Accept on the native call screen. */
export function onAnswer(handler: () => void): Unsubscribe {
  const listener: EventListener = RNCallKeep.addEventListener("answerCall", ({ callUUID }) => {
    currentCallUUID = callUUID;
    if (Platform.OS === "android") {
      RNCallKeep.setCurrentCallActive(callUUID);
    }
    handler();
  });

  return () => listener.remove();
}

/** Fired when the user taps End/Decline on the native call screen. */
export function onEnd(handler: () => void): Unsubscribe {
  const listener: EventListener = RNCallKeep.addEventListener("endCall", ({ callUUID }) => {
    if (!currentCallUUID || currentCallUUID === callUUID) {
      currentCallUUID = null;
    }
    handler();
  });

  return () => listener.remove();
}
