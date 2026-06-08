import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/react-native";
import { getDeviceId } from "../lib/device";
import { saveEntry } from "../lib/api";

const VAPI_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPI_KEY ?? "";
const MORNING_ASSISTANT_ID = process.env.EXPO_PUBLIC_VAPI_MORNING_ASSISTANT_ID ?? "";

export type CallStatus = "idle" | "connecting" | "active" | "ended";

type TranscriptLine = { role: "assistant" | "user"; text: string; final: boolean };

export function useVapiCall(kind: "morning" | "evening" = "morning") {
  const vapiRef = useRef<Vapi | null>(null);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const transcriptRef = useRef<TranscriptLine[]>([]);
  const savedRef = useRef(false);

  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", () => setStatus("active"));
    vapi.on("call-end", () => setStatus("ended"));
    vapi.on("error", (e: Error) => {
      console.error("Vapi error:", e);
      setStatus("ended");
    });
    vapi.on("message", (msg: { type: string; role?: string; transcript?: string; transcriptType?: string }) => {
      if (msg.type !== "transcript") return;
      if (!msg.transcript || !msg.role) return;
      const role = msg.role as "assistant" | "user";
      const text = msg.transcript;
      const isFinal = msg.transcriptType === "final";
      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === role && !last.final) {
          return [...prev.slice(0, -1), { role, text, final: isFinal }];
        }
        return [...prev, { role, text, final: isFinal }];
      });
    });

    return () => {
      vapi.stop();
    };
  }, []);

  // Mirror the latest transcript into a ref so the end-of-call save (whose closure
  // is set up once) can read the final lines.
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Persist the transcript exactly once when the call ends — no matter how it ended
  // (user tapped end, native CallKit end, or the assistant hung up). Best-effort:
  // a failed save must never crash the call UI.
  useEffect(() => {
    if (status !== "ended" || savedRef.current) return;
    savedRef.current = true;
    const lines = transcriptRef.current
      .map((l) => ({ role: l.role, text: l.text.trim() }))
      .filter((l) => l.text.length > 0);
    if (lines.length === 0) return;
    (async () => {
      try {
        const device_id = await getDeviceId();
        await saveEntry({ device_id, kind, data: { transcript: lines } });
        console.log(`[align] saved ${kind} transcript (${lines.length} lines)`);
      } catch (e) {
        console.error("[align] saveEntry failed:", e);
      }
    })();
  }, [status, kind]);

  const startCall = async () => {
    if (!vapiRef.current) return;
    savedRef.current = false;
    transcriptRef.current = [];
    setStatus("connecting");
    setTranscript([]);
    try {
      await vapiRef.current.start(MORNING_ASSISTANT_ID);
    } catch (e) {
      console.error("Vapi start failed:", e);
      setStatus("ended");
    }
  };

  const endCall = () => {
    vapiRef.current?.stop();
    setStatus("ended");
  };

  const toggleMute = () => {
    if (!vapiRef.current) return;
    const next = !isMuted;
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  };

  return { status, isMuted, transcript, startCall, endCall, toggleMute };
}
