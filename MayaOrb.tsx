"use client";

import React from "react";
import type { AvatarStyle } from "@/lib/storage";
import { companionDesigns } from "@/lib/companion/designs";

export type AssistantState = "idle" | "listening" | "thinking" | "speaking" | "error" | "wake" | "ready";

interface MayaOrbProps {
  state: AssistantState;
  transcript?: string;
  isSpeaking?: boolean;
  energyStyle?: AvatarStyle;
  reducedMotion?: boolean;
}

const ENERGY_PALETTES: Record<string, { primary: string; secondary: string; third: string; glow: string; warning: string }> = {
  orb: { primary: "#25dfff", secondary: "#6957ff", third: "#fb69d1", glow: "rgba(37,223,255,.34)", warning: "#ff705d" },
  "energy-pulse": { primary: "#20e8ff", secondary: "#168cff", third: "#6655ff", glow: "rgba(0,218,255,.5)", warning: "#ff715f" },
  "energy-nova": { primary: "#ed71ff", secondary: "#c04bff", third: "#634dff", glow: "rgba(229,82,255,.48)", warning: "#ff7196" },
  "energy-prism": { primary: "#59f7e9", secondary: "#5793ff", third: "#fb60cf", glow: "rgba(107,150,255,.48)", warning: "#ff8b71" },
  "energy-nebula": { primary: "#b59bff", secondary: "#4747c9", third: "#21d7ff", glow: "rgba(143,93,255,.5)", warning: "#ff716f" },
  "energy-flare": { primary: "#ffc679", secondary: "#ff8e68", third: "#ff4fa8", glow: "rgba(255,152,84,.48)", warning: "#ff594f" },
};

export default function MayaOrb({ state, transcript, isSpeaking, energyStyle = "orb", reducedMotion = false }: MayaOrbProps) {
  const palette = ENERGY_PALETTES[energyStyle] || ENERGY_PALETTES.orb;
  const active = state === "listening" || state === "thinking" || state === "speaking";
  const ringColors: Record<AssistantState, string> = {
    idle: `${palette.glow.replace(/\.[0-9]+\)$/, ".42)")}`,
    listening: `${palette.glow.replace(/\.[0-9]+\)$/, ".78)")}`,
    thinking: `${palette.glow.replace(/\.[0-9]+\)$/, ".65)")}`,
    speaking: `${palette.glow.replace(/\.[0-9]+\)$/, ".9)")}`,
    error: "rgba(255, 111, 93, 0.58)",
    wake: `${palette.glow.replace(/\.[0-9]+\)$/, ".55)")}`,
    ready: `${palette.glow.replace(/\.[0-9]+\)$/, ".48)")}`,
  };
  const labels: Record<AssistantState, string> = {
    idle: "तैयार",
    listening: "ध्यान से सुन रही हूँ",
    thinking: "तुम्हारी बात समझ रही हूँ",
    speaking: "बात कर रही हूँ",
    error: "फिर कोशिश करें",
    wake: "तैयार",
    ready: "बात करें",
  };
  const energyName = companionDesigns.find((item) => item.id === energyStyle)?.name || "ऊर्जा गोला";
  const animation = (value: string) => reducedMotion ? "none" : value;

  return (
    <div className="relative flex flex-col items-center justify-center" aria-label={`FRUITY ${energyName}; अवस्था: ${labels[state]}`}>
      <div className="absolute h-[280px] w-[280px] rounded-full blur-3xl opacity-60 transition-all duration-700 md:h-[330px] md:w-[330px]" style={{ background: `radial-gradient(circle, ${ringColors[state]}, transparent 67%)`, animation: animation(state === "idle" ? "pulse 4s ease-in-out infinite" : state === "listening" ? "pulse 1.2s ease-in-out infinite" : state === "speaking" ? "pulse .72s ease-in-out infinite" : "none") }} />
      <div className="relative z-10 flex h-[260px] w-[260px] items-center justify-center md:h-[300px] md:w-[300px]">
        <svg className="absolute h-full w-full" style={{ animation: animation(`spin-slow ${state === "thinking" ? "5s" : "18s"} linear infinite`) }} viewBox="0 0 300 300" aria-hidden="true">
          <defs><linearGradient id={`fruity-grad-${energyStyle}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={palette.primary}/><stop offset="52%" stopColor={palette.secondary}/><stop offset="100%" stopColor={palette.third}/></linearGradient></defs>
          <circle cx="150" cy="150" r="130" fill="none" stroke={`url(#fruity-grad-${energyStyle})`} strokeWidth="1.8" strokeDasharray={active ? "12 9" : "7 15"} opacity={state === "thinking" ? 0.95 : 0.62}/>
          <circle cx="150" cy="150" r="119" fill="none" stroke={palette.primary} strokeWidth=".65" strokeDasharray="1 13" opacity={state === "idle" ? 0.22 : 0.5}/>
        </svg>
        <div className="absolute h-[205px] w-[205px] rounded-full border-2 transition-all duration-500 md:h-[224px] md:w-[224px]" style={{ borderColor: ringColors[state], boxShadow: `0 0 32px 4px ${ringColors[state]}`, transform: state === "listening" && !reducedMotion ? "scale(1.035)" : state === "speaking" && !reducedMotion ? "scale(1.06)" : "scale(1)", animation: animation(state === "idle" ? "breathe 4s ease-in-out infinite" : state === "listening" ? "waveform .58s ease-in-out infinite alternate" : state === "speaking" ? "pulsate .75s ease-in-out infinite" : "none") }} />
        {state === "listening" ? <div className="absolute flex h-44 w-44 items-center justify-center gap-1" aria-hidden="true">{Array.from({ length: 17 }, (_, index) => <span key={index} className="w-[3px] rounded-full transition-[height] duration-150" style={{ height: `${12 + ((index * 19 + Date.now() / 80) % 74)}%`, background: palette.primary, opacity: .58 }}/>)}</div> : null}
        {state === "speaking" ? <div className="absolute flex h-32 items-center justify-center gap-1" aria-hidden="true">{Array.from({ length: 11 }, (_, index) => <span key={index} className="fruity-equalizer w-1 rounded-full" style={{ height: `${8 + (index % 4) * 4}px`, background: index % 2 ? palette.primary : palette.third, animationDelay: `${index * 45}ms` }}/>)}</div> : null}
        <div className="relative z-10 flex h-[142px] w-[142px] items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-[#0a0f1a] via-[#111a2e] to-[#060914] md:h-[160px] md:w-[160px]" style={{ boxShadow: `0 0 62px 9px ${ringColors[state]}, inset 0 0 40px ${palette.glow}` }}>
          <div className="absolute inset-4 rounded-full" style={{ background: `radial-gradient(circle, ${ringColors[state]} 0%, transparent 70%)`, opacity: .55 }}/>
          <div className="relative z-10 text-center"><h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_0_12px_rgba(0,200,255,.8)] md:text-3xl">FRUITY</h1><p className="mt-1 text-[9px] font-semibold tracking-[.2em] text-cyan-100/65">AI COMPANION</p></div>
        </div>
      </div>
      <div className="mt-4 text-center"><p className="text-sm font-medium tracking-wide md:text-base" style={{ color: state === "error" ? palette.warning : palette.primary }}>{labels[state]}</p>{transcript && state === "listening" ? <p className="mt-2 max-w-[300px] text-xs text-cyan-100/90">{transcript}</p> : null}{typeof isSpeaking === "boolean" ? <span className="sr-only">{isSpeaking ? "Audio playback active" : ""}</span> : null}</div>
      <style jsx>{`
        @keyframes pulse { 0%,100%{opacity:.25;transform:scale(.97)} 50%{opacity:.72;transform:scale(1.04)} }
        @keyframes breathe { 0%,100%{opacity:.28;transform:scale(1)} 50%{opacity:.7;transform:scale(1.035)} }
        @keyframes pulsate { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:.95;transform:scale(1.07)} }
        @keyframes waveform { from{opacity:.32;transform:scale(.98)} to{opacity:.96;transform:scale(1.055)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
