"use client";

import React from "react";
import { Mic, ShieldCheck } from "lucide-react";

interface PermissionDialogProps {
  status: "hidden" | "prompt" | "denied" | "granted";
  onAllow: () => void;
  onNotNow: () => void;
}

export default function PermissionDialog({ status, onAllow, onNotNow }: PermissionDialogProps) {
  if (status === "hidden" || status === "granted") return null;
  const denied = status === "denied";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="microphone-title">
      <section className="w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-[#111a2b] to-[#060b14] p-6 shadow-[0_24px_80px_rgba(0,0,0,.6)]">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-200"><Mic size={20} /></div>
          <div><h2 id="microphone-title" className="font-bold text-white">माइक्रोफ़ोन की अनुमति</h2><p className="text-xs text-slate-400">सिर्फ बोलते समय इस्तेमाल होगा</p></div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          {denied
            ? "माइक्रोफ़ोन बंद है। फ़ोन की ब्राउज़र सेटिंग में इस वेबसाइट के लिए माइक्रोफ़ोन चालू करें, फिर वापस आकर कोशिश करें।"
            : "फ्रूटी को तुम्हारी बात सुनने और उसका जवाब देने के लिए माइक्रोफ़ोन चाहिए। तुम्हारी अनुमति के बिना इसे चालू नहीं किया जाएगा।"}
        </p>
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><ShieldCheck size={14} className="text-emerald-300" />सुनना रोकने के लिए आवाज़ बटन फिर दबाओ।</p>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onNotNow} className="min-h-12 flex-1 rounded-xl bg-white/[0.06] px-3 text-sm text-slate-300 hover:bg-white/10">अभी नहीं</button>
          <button type="button" onClick={onAllow} className="min-h-12 flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-3 text-sm font-semibold text-white">{denied ? "फिर कोशिश करें" : "माइक्रोफ़ोन चालू करें"}</button>
        </div>
      </section>
    </div>
  );
}
