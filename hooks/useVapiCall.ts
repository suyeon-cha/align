import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/react-native";

const VAPI_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPI_KEY ?? "";
const MORNING_ASSISTANT_ID = process.env.EXPO_PUBLIC_VAPI_MORNING_ASSISTANT_ID ?? "";

export type CallStatus = "idle" | "connecting" | "active" | "ended";

type TranscriptLine = { role: "assistant" | "user"; text: string; final: boolean };

export function useVapiCall() {
  const vapiRef = useRef<Vapi | null>(null);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);

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

  const startCall = async () => {
    if (!vapiRef.current) return;
    setStatus("connecting");
    setTranscript([]);
    await vapiRef.current.start(MORNING_ASSISTANT_ID);
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
