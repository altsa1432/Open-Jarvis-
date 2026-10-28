"use client";

import React from "react";
import { Mic, Square, Zap } from "lucide-react";
import { AssistantState } from "./MayaOrb";

interface VoiceButtonProps {
  state: AssistantState;
  onTap: () => void;
  isListening: boolean;
}

export default function VoiceButton({ state, onTap, isListening }: VoiceButtonProps) {
  return (
    <button
      onClick={onTap}
      aria-label={state === "listening" ? "सुनना रोकें" : state === "speaking" ? "बीच में बोलें" : "FRUITY से बात शुरू करें"}
      className="relative flex h-[80px] w-[80px] items-center justify-center rounded-full transition-transform duration-200 active:scale-95 md:h-[96px] md:w-[96px]"
      style={{
        background: state === "listening"
          ? "linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)"
          : state === "speaking"
          ? "linear-gradient(135deg, #ff4f8b 0%, #ff0099 100%)"
          : state === "thinking"
          ? "linear-gradient(135deg, #8844ff 0%, #6600cc 100%)"
          : state === "error"
          ? "linear-gradient(135deg, #ff6b6b 0%, #ff3333 100%)"
          : "linear-gradient(135deg, #00a8e8 0%, #005a8e 100%)",
        boxShadow: state === "listening"
          ? "0 0 40px 10px rgba(0,212,255,0.5)"
          : state === "speaking"
          ? "0 0 40px 10px rgba(255,79,139,0.5)"
          : "0 0 30px 10px rgba(0,160,230,0.4)",
      }}
    >
      {/* Pulsing ring */}
      <div
        className={`absolute rounded-full border-2 transition-all duration-500 ${isListening ? "animate-ping" : ""}`}
        style={{
          width: state === "listening" ? "110px" : state === "speaking" ? "110px" : "100px",
          height: state === "listening" ? "110px" : state === "speaking" ? "110px" : "100px",
          borderColor: state === "listening" ? "rgba(0,212,255,0.6)" : "rgba(255,255,255,0.2)",
        }}
      />

      {/* Icon */}
      <div className="relative z-10 text-white">
        {state === "listening" ? (
          <Mic size={32} strokeWidth={2} className="animate-pulse" />
        ) : state === "speaking" ? (
          <Square size={28} strokeWidth={2} />
        ) : state === "thinking" ? (
          <Zap size={28} strokeWidth={2} className="animate-spin" />
        ) : (
          <Mic size={36} strokeWidth={2} />
        )}
      </div>
    </button>
  );
}
