"use client";

import React, { useRef, useState } from "react";
import { ClipboardPaste, Eye, EyeOff, Loader2 } from "lucide-react";

export default function ApiKeyPasteField({
  value,
  placeholder,
  accent,
  busy,
  testMessage,
  onChange,
  onTest,
}: {
  value: string;
  placeholder: string;
  accent: "cyan" | "violet" | "amber" | "fuchsia";
  busy: boolean;
  testMessage?: { ok: boolean; message: string };
  onChange: (value: string) => void;
  onTest: () => void;
}) {
  const [pasteNotice, setPasteNotice] = useState("");
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusClass = { cyan: "focus:border-cyan-400", violet: "focus:border-violet-400", amber: "focus:border-amber-400", fuchsia: "focus:border-fuchsia-400" }[accent];
  const buttonClass = { cyan: "bg-cyan-700 hover:bg-cyan-600", violet: "bg-violet-700 hover:bg-violet-600", amber: "bg-amber-700 hover:bg-amber-600", fuchsia: "bg-fuchsia-800 hover:bg-fuchsia-700" }[accent];

  const paste = async () => {
    setPasteNotice("");
    try {
      if (!navigator.clipboard?.readText) throw new Error("Clipboard API unavailable");
      const clip = await navigator.clipboard.readText();
      const cleaned = clip.trim();
      if (!cleaned) { setPasteNotice("Clipboard खाली है। API key कॉपी करके फिर दबाएँ।"); return; }
      onChange(cleaned);
      inputRef.current?.focus();
      setPasteNotice("कुंजी लग गई और इस डिवाइस पर सहेजी रहेगी। जाँचने के लिए दबाएँ।");
    } catch {
      inputRef.current?.focus();
      setPasteNotice("Clipboard अनुमति नहीं मिली। key field पर देर तक दबाकर Paste चुनें।");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <input
          ref={inputRef}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData("text");
            if (pasted) {
              event.preventDefault();
              onChange(pasted.trim());
              setPasteNotice("कुंजी लग गई और इस डिवाइस पर सहेजी रहेगी।");
            }
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          inputMode="text"
          data-1p-ignore="true"
          data-lpignore="true"
          placeholder={placeholder}
          className={`min-h-11 min-w-0 flex-1 select-text rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono text-white caret-white outline-none placeholder:text-slate-500 [user-select:text] [-webkit-user-select:text] [-webkit-touch-callout:default] ${focusClass}`}
        />
        <button type="button" onClick={() => setVisible((shown) => !shown)} title={visible ? "कुंजी छिपाएँ" : "कुंजी दिखाएँ"} aria-label={visible ? "कुंजी छिपाएँ" : "कुंजी दिखाएँ"} aria-pressed={visible} className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.07] px-3 text-[11px] font-medium text-slate-100 active:bg-white/15">{visible ? <EyeOff size={14}/> : <Eye size={14}/>}{visible ? "छिपाएँ" : "दिखाएँ"}</button>
        <button type="button" onClick={() => void paste()} title="Clipboard से API key paste करें" aria-label="Clipboard से API key paste करें" className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.07] px-3 text-[11px] font-medium text-slate-100 active:bg-white/15"><ClipboardPaste size={14}/>Paste</button>
        <button type="button" disabled={!value.trim() || busy} onClick={onTest} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold text-white disabled:opacity-35 ${buttonClass}`}>{busy ? <Loader2 size={13} className="animate-spin"/> : null}जाँचें</button>
      </div>
      {pasteNotice ? <p role="status" className="mt-1.5 text-[10px] leading-4 text-slate-400">{pasteNotice}</p> : null}
      {testMessage ? <p role="status" className={`mt-1.5 break-words text-[11px] leading-5 ${testMessage.ok ? "font-semibold text-emerald-300" : "text-amber-200"}`}>{testMessage.ok ? "✓ " : "⚠ "}{testMessage.message}</p> : null}
    </div>
  );
}
