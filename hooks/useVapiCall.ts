import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/react-native";

const VAPI_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPI_KEY ?? "";
const MORNING_ASSISTANT_ID = process.env.EXPO_PUBLIC_VAPI_MORNING_ASSISTANT_ID ?? "";

export type CallStatus = "idle" | "connecting" | "active" | "ended";

export function useVapiCall() {
  const vapiRef = useRef<Vapi | null>(null);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);

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
      if (msg.transcriptType !== "final") return;
      const role = msg.role as "assistant" | "user";
      const text = msg.transcript;
      setTranscript((prev) => [...prev, `${role === "user" ? "You" : "Align"}: ${text}`]);
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
