"use client";

import React, { useState } from "react";
import { UserRound, ChevronDown, Settings, X } from "lucide-react";

interface ProfileMenuProps { userName: string; onSettings: () => void }
export default function ProfileMenu({ userName, onSettings }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const label = userName || "अपना नाम";
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-label="अपनी पसंद और नाम खोलें" aria-expanded={open} className="flex max-w-[9.5rem] items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-2 py-2 backdrop-blur-md transition hover:bg-white/[0.08]">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-700 to-violet-700 text-xs font-bold text-white">{label[0]?.toUpperCase() || <UserRound size={14} />}</span>
        <span className="truncate text-xs font-medium text-slate-200">{label}</span><ChevronDown size={13} className="shrink-0 text-slate-400" />
      </button>
      {open ? <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-white/10 bg-[#0a1120]/95 p-2 shadow-2xl backdrop-blur-2xl"><div className="flex items-center justify-between px-3 py-2"><span className="truncate text-xs text-slate-400">{label}</span><button onClick={() => setOpen(false)} aria-label="बंद करें"><X size={14} /></button></div><button onClick={() => { setOpen(false); onSettings(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-200 transition hover:bg-white/[0.06]"><Settings size={16} />अपनी पसंद बदलो</button></div> : null}
    </div>
  );
}
