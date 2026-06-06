import "react-native-get-random-values";
import { Platform } from "react-native";
import RNCallKeep from "react-native-callkeep";
import { v4 as uuidv4 } from "uuid";

let currentCallUUID: string | null = null;
let isSetup = false;

export async function setupCallKeep() {
  if (isSetup) return;
  try {
    await RNCallKeep.setup({
      ios: {
        appName: "Align",
        supportsVideo: false,
        maximumCallGroups: "1",
        maximumCallsPerCallGroup: "1",
      },
      android: {
        alertTitle: "Permissions required",
        alertDescription:
          "Align needs phone-account access to ring you for your check-ins.",
        cancelButton: "Cancel",
        okButton: "OK",
        foregroundService: {
          channelId: "com.syncha.align.call",
          channelName: "Align Calls",
          notificationTitle: "Align is ringing you",
        },
      },
    });
    // Android: mark the app available to receive calls
    RNCallKeep.setAvailable(true);
    isSetup = true;
  } catch (e) {
    console.error("CallKeep setup failed:", e);
  }
}

/** Ring the user with a native incoming call. Returns the call's UUID. */
export function startIncomingCall(callerName = "Align"): string {
  const uuid = uuidv4();
  currentCallUUID = uuid;
  RNCallKeep.displayIncomingCall(uuid, callerName, callerName, "generic", false);
  return uuid;
}

/** End the active native call (used by our in-app End button). */
export function endCurrentCall() {
  if (currentCallUUID) {
    RNCallKeep.endCall(currentCallUUID);
    currentCallUUID = null;
  } else {
    RNCallKeep.endAllCalls();
  }
}

/** Fired when the user taps Accept on the native call screen. */
export function onAnswer(handler: () => void) {
  RNCallKeep.addEventListener("answerCall", ({ callUUID }) => {
    currentCallUUID = callUUID;
    if (Platform.OS === "ios") {
      RNCallKeep.setCurrentCallActive(callUUID);
    }
    handler();
  });
}

/** Fired when the user taps End/Decline on the native call screen. */
export function onEnd(handler: () => void) {
  RNCallKeep.addEventListener("endCall", () => {
    currentCallUUID = null;
    handler();
  });
}

export function removeEndListener() {
  RNCallKeep.removeEventListener("endCall");
}
