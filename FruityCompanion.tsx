"use client";

import Image from "next/image";
import MayaOrb, { type AssistantState } from "@/components/MayaOrb";
import { companionDesigns } from "@/lib/companion/designs";
import type { AvatarStyle } from "@/lib/storage";

export default function FruityCompanion({ state, style = "orb", transcript }: { state: AssistantState; style?: AvatarStyle; transcript?: string }) {
  const design = companionDesigns.find((item) => item.id === style) || companionDesigns[0];
  if (design.family === "energy") return <MayaOrb state={state} transcript={transcript} energyStyle={style} />;

  const speaking = state === "speaking";
  const listening = state === "listening";
  const status = state === "speaking" ? "FROOTY जवाब दे रही है" : listening ? "FROOTY ध्यान से सुन रही है" : state === "thinking" ? "तुम्हारी बात समझ रही है" : state === "error" ? "फिर कोशिश करें" : "तुम्हारे साथ हूँ";

  return (
    <div className="flex w-full flex-col items-center" aria-label={`FROOTY AI friend; ${status}`}>
      <div className={`relative w-full max-w-[390px] overflow-hidden rounded-[1.65rem] border bg-[#09020a] shadow-[0_25px_90px_rgba(0,0,0,.58)] ${speaking ? "fruity-speaking" : listening ? "fruity-listening" : "fruity-idle"}`} style={{ height: "min(59svh, 540px)", minHeight: "330px", borderColor: "rgba(255,94,198,.76)", boxShadow: speaking ? "0 0 42px rgba(255,67,185,.38), 0 25px 90px rgba(0,0,0,.58)" : "0 0 22px rgba(255,67,185,.18), 0 25px 90px rgba(0,0,0,.58)" }}>
        <Image src="/images/frooty-hologram.jpg" alt="FROOTY का कल्पित AI hologram चित्र" fill priority sizes="(max-width: 640px) 390px, 440px" className="object-contain object-center" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#10020e]/70 via-transparent via-30% to-[#08020a]/65" />
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between rounded-xl border border-pink-300/50 bg-[#0d040ddc] px-3 py-2.5 shadow-[0_0_22px_rgba(255,48,178,.12)] backdrop-blur-md">
          <div><p className="text-[9px] tracking-[.25em] text-pink-200/75">YOUR AI FRIEND</p><p className="mt-0.5 text-lg font-black tracking-[.21em] text-pink-300 drop-shadow-[0_0_14px_rgba(255,67,196,.8)]">FROOTY</p></div>
          <span className="rounded-full border border-pink-200/25 bg-pink-300/[0.08] px-2.5 py-1 text-[9px] font-semibold text-pink-100">ऑनलाइन</span>
        </div>
        {/* Decorative HUD rings react to real assistant state; they are not lip-sync. */}
        <div className="pointer-events-none absolute left-1/2 top-[19%] h-7 w-[50%] -translate-x-1/2 rounded-[50%] border border-pink-300/90 shadow-[0_0_19px_rgba(255,67,196,.7)]" style={{ animation: speaking ? "fruity-hud-pulse .55s ease-in-out infinite alternate" : listening ? "fruity-hud-pulse .9s ease-in-out infinite alternate" : "fruity-hud-pulse 2.7s ease-in-out infinite alternate" }} />
        <div className="pointer-events-none absolute left-1/2 bottom-[18%] h-8 w-[72%] -translate-x-1/2 rounded-[50%] border border-pink-200/80 shadow-[0_0_22px_rgba(255,67,196,.72)]" style={{ animation: speaking ? "fruity-hud-pulse .48s ease-in-out infinite alternate" : "fruity-hud-pulse 2.1s ease-in-out infinite alternate" }} />
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between rounded-xl border border-pink-200/30 bg-[#100610ed] px-3 py-2 backdrop-blur-md">
          <div className="flex items-center gap-[3px]" aria-hidden="true">{(speaking ? [7, 13, 9, 17, 8, 15, 6, 11, 5] : listening ? [5, 9, 7, 12, 5, 9, 4, 8, 5] : [3, 4, 3, 5, 4, 3, 4, 5, 3]).map((height, index) => <span key={index} className={`w-[3px] rounded-full ${speaking || listening ? "fruity-equalizer" : ""}`} style={{ height, backgroundColor: design.accent || design.border, animationDelay: `${index * 60}ms` }} />)}</div>
          <span className="text-[10px] font-medium text-pink-100">{status}</span><span className="h-2 w-2 rounded-full" style={{ backgroundColor: speaking ? "#ff53be" : listening ? "#ffaadf" : "#7ce7ba" }} />
        </div>
      </div>
      {transcript && listening ? <p className="mt-2 max-w-xs text-center text-sm text-slate-300">“{transcript}”</p> : null}
    </div>
  );
}
