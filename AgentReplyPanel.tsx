"use client";

import React, { useState } from "react";
import { Check, ExternalLink, Image as ImageIcon, ShieldCheck, X } from "lucide-react";
import type { AgentReply, PendingAgentAction } from "@/lib/agent/types";
import { persistApprovedAction } from "@/lib/storage";

export default function AgentReplyPanel({ reply, onActionResolved }: { reply: AgentReply; onActionResolved?: (message: string) => void }) {
  const [pending, setPending] = useState(reply.pendingActions);
  const [status, setStatus] = useState("");

  const approve = (action: PendingAgentAction) => {
    try {
      const result = persistApprovedAction(action);
      setPending((items) => items.filter((item) => item.id !== action.id));
      const message = result.kind === "note" ? "नोट इसी उपकरण पर सहेज दिया।" : result.kind === "task" ? "काम इसी उपकरण पर जोड़ दिया।" : "याद दिलाने का समय इसी उपकरण पर सहेज दिया। ऐप बंद रहने पर सूचना आने की गारंटी नहीं है।";
      setStatus(message);
      onActionResolved?.(message);
    } catch {
      setStatus("इसे सहेजा नहीं जा सका। तारीख और विवरण जाँचकर फिर कोशिश करें।");
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {reply.providerNotice ? (
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/40 p-2.5 text-xs leading-5 text-cyan-200">
          <span className="font-semibold text-cyan-100">💡 {reply.activeProvider ? `${reply.activeProvider}: ` : ""}</span>
          {reply.providerNotice}
        </div>
      ) : reply.activeProvider ? (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          इंजन: {reply.activeProvider}
        </div>
      ) : reply.degraded ? (
        <p className="rounded-lg border border-amber-200/10 bg-amber-300/[0.04] px-3 py-2 text-xs text-amber-100">
          इस बार उपलब्ध server विकल्प के साथ जवाब दिया गया।
        </p>
      ) : null}
      {reply.toolUses.length ? <details className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2"><summary className="cursor-pointer text-xs text-slate-400">इस जवाब में इस्तेमाल किए गए साधन ({reply.toolUses.length})</summary><ul className="mt-2 space-y-1">{reply.toolUses.map((tool, index) => <li key={`${tool.name}-${index}`} className="text-xs text-slate-400">{tool.summary}{tool.status === "awaiting_confirmation" ? " · तुम्हारी अनुमति बाकी है" : ""}</li>)}</ul></details> : null}
      {pending.map((action) => <section key={action.id} className="rounded-2xl border border-cyan-200/20 bg-cyan-300/[0.055] p-4" role="group" aria-label="कार्रवाई की अनुमति">
        <div className="flex items-start gap-3"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-cyan-100"><ShieldCheck size={16}/></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">{action.type === "create_note" ? "नोट सहेजने की अनुमति" : action.type === "create_task" ? "काम जोड़ने की अनुमति" : "याद दिलाने की अनुमति"}</p><p className="mt-1 text-sm text-slate-200">{action.title}</p><p className="mt-1 break-words text-xs leading-5 text-slate-400">{action.type === "create_note" ? action.payload.content : action.detail}</p></div></div>
        <div className="mt-3 flex gap-2"><button type="button" onClick={() => approve(action)} className="flex min-h-10 items-center gap-2 rounded-xl bg-cyan-600 px-4 text-xs font-semibold text-white"><Check size={14}/>इसी उपकरण पर सहेजो</button><button type="button" onClick={() => { setPending((items) => items.filter((item) => item.id !== action.id)); setStatus("कार्रवाई रद्द कर दी; कुछ भी नहीं सहेजा।"); }} className="flex min-h-10 items-center gap-2 rounded-xl bg-white/[0.06] px-4 text-xs text-slate-200"><X size={14}/>रद्द करो</button></div>
      </section>)}
      {status ? <p role="status" className="text-xs text-emerald-100/90">{status}</p> : null}
      {reply.citations.length ? <section className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><p className="mb-2 text-xs font-semibold text-cyan-100/80">देखे गए स्रोत</p><ul className="space-y-1.5">{reply.citations.map((citation) => <li key={citation.url}><a href={citation.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 break-all text-xs text-cyan-200 underline decoration-cyan-200/30 underline-offset-2">{citation.title}<ExternalLink size={12} className="shrink-0"/></a></li>)}</ul></section> : null}
      {reply.generatedImages.map((image, index) => <figure key={`${index}-${image.alt}`} className="overflow-hidden rounded-xl border border-white/10"><img src={image.dataUrl} alt={image.alt} className="h-auto max-h-[28rem] w-full object-contain"/><figcaption className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400"><ImageIcon size={13}/>AI द्वारा बनाया गया चित्र</figcaption></figure>)}
    </div>
  );
}
