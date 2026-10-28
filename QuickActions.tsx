"use client";

import React from "react";
import { Music, BookOpen, PenLine, CloudSun, CalendarDays, Smile, Users, FileSearch, ClipboardList, Search, ShieldCheck } from "lucide-react";

interface QuickActionsProps { onAction: (action: string) => void }
const actions = [
  { id: "music", label: "संगीत", icon: Music, desc: "पसंद का सुनो" },
  { id: "study", label: "पढ़ाई", icon: BookOpen, desc: "मिलकर सीखें" },
  { id: "notes", label: "नोट", icon: PenLine, desc: "निजी लिखावट" },
  { id: "tasks", label: "काम", icon: ClipboardList, desc: "योजना और सूची" },
  { id: "files", label: "फ़ाइल", icon: FileSearch, desc: "तस्वीर/दस्तावेज़" },
  { id: "search", label: "खोज", icon: Search, desc: "ताज़ा जानकारी" },
  { id: "permissions", label: "फ़ोन", icon: ShieldCheck, desc: "अनुमतियाँ चुनो" },
  { id: "contacts", label: "संपर्क", icon: Users, desc: "खुद चुनकर फोन करो" },
];
const cards = [
  { id: "weather", label: "मौसम", icon: CloudSun, desc: "शहर का हाल" },
  { id: "today", label: "आज", icon: CalendarDays, desc: "दिन की जानकारी" },
  { id: "mood", label: "मन", icon: Smile, desc: "कैसा लग रहा है?" },
];

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <section className="mx-auto w-full max-w-2xl px-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {actions.map((action) => (
          <button key={action.id} type="button" onClick={() => onAction(action.id)} className="group flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-2.5 text-center backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/[0.08] sm:min-h-28 sm:gap-2 sm:p-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cyan-900/45 to-violet-900/45 text-cyan-100 shadow-[0_0_20px_rgba(0,200,255,.13)]"><action.icon size={19}/></span>
            <span className="text-sm font-semibold text-white">{action.label}</span><span className="text-[10px] text-slate-400">{action.desc}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {cards.map((card) => (
          <button key={card.id} type="button" onClick={() => onAction(card.id)} className="flex min-h-22 flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#101a2b]/65 to-[#090e18]/75 p-2.5 text-center transition hover:bg-white/[0.07] sm:min-h-24">
            <card.icon size={19} className="text-cyan-100"/><span className="text-sm font-medium text-slate-200">{card.label}</span><span className="text-[10px] text-slate-500">{card.desc}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
