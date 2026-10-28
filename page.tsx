"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Home, Keyboard, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import FruityCompanion from "@/components/FruityCompanion";
import AgentReplyPanel from "@/components/AgentReplyPanel";
import type { AgentReply } from "@/lib/agent/types";
import { useAgentConfig } from "@/components/AgentConfigProvider";
import type { AssistantState } from "@/components/MayaOrb";
import VoiceButton from "@/components/VoiceButton";
import { startSpeechRecognition } from "@/lib/speech/stt";
import { requestFruityReply } from "@/lib/ai/client";
import { buildLocalAgentContext, loadStorage, saveStorage, type ConversationMessage, type UserProfile } from "@/lib/storage";
import { speakAssistantText, stopSpeaking } from "@/lib/speech/tts";
import { RealtimeSessionManager, type RealtimeEvent } from "@/lib/voice/realtime-session-manager";

export default function VoicePage() {
  const router = useRouter();
  const { keys } = useAgentConfig();
  const keysRef = useRef(keys);
  keysRef.current = keys;
  const [state, setState] = useState<AssistantState>("ready");
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [notice, setNotice] = useState("");
  const [lastReply, setLastReply] = useState<AgentReply | null>(null);
  const [realtimeAvailable, setRealtimeAvailable] = useState(false);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const realtimeRef = useRef<RealtimeSessionManager | null>(null);
  const stopRef = useRef<() => void>(() => {});
  const historyRef = useRef<ConversationMessage[]>([]);
  const handsFreeRef = useRef(false);
  const listenRef = useRef<() => void>(() => {});
  const processRef = useRef<(text: string) => Promise<void>>(async () => {});

  useEffect(() => {
    const saved = loadStorage();
    const history = saved.profile.saveConversationHistory ? saved.conversationHistory : [];
    if (!saved.profile.saveConversationHistory && saved.conversationHistory.length) saveStorage({ conversationHistory: [] });
    setProfile(saved.profile);
    setConversation(history);
    historyRef.current = history;
    fetch("/api/realtime/session", { cache: "no-store" }).then((response) => response.json()).then((data) => setRealtimeAvailable(Boolean(data.available))).catch(() => setRealtimeAvailable(false));
    return () => { stopRef.current(); void realtimeRef.current?.dispose(); stopSpeaking(); };
  }, []);

  const startRecognition = useCallback(() => {
    setTranscript("");
    setState("listening");
    setIsListening(true);
    stopRef.current = startSpeechRecognition((text) => {
      setTranscript(text);
      setIsListening(false);
      stopRef.current();
      void processRef.current(text);
    }, (error) => {
      setIsListening(false);
      setNotice(error);
      setState("error");
    }, loadStorage().profile.language || "hi", (partial) => {
      if (partial) setTranscript(partial);
    });
  }, []);
  listenRef.current = startRecognition;

  const startRealtime = async () => {
    setNotice("");
    const audio = audioRef.current;
    if (!audio) { setNotice("इस browser में live audio output उपलब्ध नहीं है। सामान्य voice mode इस्तेमाल करो।"); return; }
    const manager = new RealtimeSessionManager(audio, {
      onState: (phase) => {
        if (phase === "idle") { setState("ready"); setIsListening(false); setRealtimeActive(false); }
        else if (phase === "connecting" || phase === "thinking") { setState("thinking"); setIsListening(false); }
        else if (phase === "listening" || phase === "interrupted") { setState("listening"); setIsListening(true); }
        else if (phase === "speaking") { setState("speaking"); setIsListening(false); }
        else { setState("error"); setIsListening(false); }
      },
      onEvent: (event: RealtimeEvent) => {
        const text = typeof event.transcript === "string" ? event.transcript.trim() : "";
        const userTurn = event.type === "conversation.item.input_audio_transcription.completed";
        const assistantTurn = event.type === "response.output_audio_transcript.done" || event.type === "response.audio_transcript.done";
        if (!text || (!userTurn && !assistantTurn)) return;
        const message: ConversationMessage = { role: userTurn ? "user" : "assistant", content: text };
        const next = [...historyRef.current, message];
        historyRef.current = next;
        setConversation(next);
        if (message.role === "assistant") setTranscript(text);
        if (profile.saveConversationHistory) saveStorage({ conversationHistory: next });
      },
      onError: (message) => setNotice(message),
    });
    realtimeRef.current = manager;
    try {
      await manager.start(profile.language === "en" ? "en" : profile.language === "hinglish" ? "hinglish" : "hi");
      setRealtimeActive(true);
      setNotice("Live audio चालू है। browser का server-VAD बोलने के turn पहचानता है; बीच में बोलकर रोक सकते हो।");
    } catch (error) {
      realtimeRef.current = null;
      setRealtimeActive(false);
      setNotice(error instanceof Error ? `${error.message} सामान्य voice mode अभी भी उपलब्ध है।` : "Live voice शुरू नहीं हुई। सामान्य voice mode इस्तेमाल करो।");
      setState("error");
    }
  };

  const stopRealtime = async () => {
    const manager = realtimeRef.current;
    realtimeRef.current = null;
    setRealtimeActive(false);
    if (manager) await manager.stop();
    setIsListening(false);
    setState("ready");
  };

  const speak = useCallback((text: string) => {
    setTranscript(text);
    setState("speaking");
    speakAssistantText(text, { provider: profile.ttsProvider || "device", voiceURI: profile.voiceURI, remoteVoice: profile.openAIVoice || "coral", customVoiceId: profile.customVoiceId, rate: profile.voiceRate ?? 1.0, pitch: profile.voicePitch ?? 1.15, language: profile.language || "hi" }, undefined, () => {
      if (handsFreeRef.current) window.setTimeout(() => listenRef.current(), 350);
      else setState("ready");
    }, (error) => { setNotice(error); setState("error"); });
  }, [profile]);

  const processInput = useCallback(async (text: string) => {
    const next: ConversationMessage[] = [...historyRef.current, { role: "user", content: text }];
    historyRef.current = next;
    setConversation(next);
    saveStorage({ conversationHistory: profile.saveConversationHistory ? next : [] });
    setState("thinking");
    setNotice("");
    try {
      const reply = await requestFruityReply(next, profile.name, { userContext: buildLocalAgentContext(keysRef.current), onDelta: setTranscript, voice: true });
      const final: ConversationMessage[] = [...next, { role: "assistant", content: reply.response }];
      historyRef.current = final;
      setConversation(final);
      setLastReply(reply);
      if (profile.saveConversationHistory) saveStorage({ conversationHistory: final });
      speak(reply.response);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "अभी जवाब नहीं मिल पाया। फिर कोशिश करें।");
      setState("error");
    }
  }, [profile.name, speak]);
  processRef.current = processInput;

  const startWithPermission = async () => {
    setNotice("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      startRecognition();
    } catch {
      setNotice("माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र की साइट सेटिंग में हिन्दी सुनने की अनुमति दें।");
      setState("error");
    }
  };

  const onVoiceTap = () => {
    if (realtimeActive) { void stopRealtime(); return; }
    if (state === "speaking") {
      stopSpeaking();
      setState("ready");
      void startWithPermission();
      return;
    }
    if (isListening) {
      stopRef.current();
      setIsListening(false);
      setState("ready");
      return;
    }
    void startWithPermission();
  };

  const toggleHandsFree = () => {
    if (realtimeActive) return;
    const next = !handsFreeRef.current;
    handsFreeRef.current = next;
    setHandsFree(next);
    if (next) void startWithPermission();
    else if (isListening) {
      stopRef.current();
      setIsListening(false);
      setState("ready");
    }
  };

  return (
    <main className="flex min-h-[100svh] flex-col items-center bg-[radial-gradient(ellipse_at_50%_35%,#122541_0%,#060b14_48%,#030714_100%)] px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-[max(env(safe-area-inset-top),1rem)] text-white">
      <header className="flex w-full max-w-2xl items-center justify-between">
        <button onClick={() => router.back()} aria-label="पीछे जाएँ" className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"><ArrowLeft size={19} /></button>
        <div className="text-center"><h1 className="font-black tracking-[.18em]">FRUITY</h1><p className="text-xs text-cyan-100/60">हिन्दी में आवाज़ से बात</p></div>
        <button onClick={() => router.push("/")} aria-label="घर जाएँ" className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"><Home size={18} /></button>
      </header>
      <section className="flex w-full flex-1 flex-col items-center justify-center py-6">
        <audio ref={audioRef} autoPlay playsInline className="sr-only" aria-label="FROOTY live voice audio" />
        <FruityCompanion state={state} style={profile.avatarStyle || "hologram-girl"} transcript={profile.captionsEnabled !== false ? transcript : undefined} />
        {notice ? <p role="alert" className="mt-5 max-w-sm rounded-xl border border-amber-200/10 bg-amber-300/5 p-3 text-center text-sm leading-6 text-amber-100">{notice}</p> : null}
        {lastReply ? <div className="mt-4 max-w-lg text-left"><div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm leading-6">{lastReply.response}</div><AgentReplyPanel reply={lastReply}/></div> : null}
        {conversation.length > 0 && state !== "listening" ? <div className="mt-5 max-w-sm text-center text-sm leading-6 text-slate-300"><span className="text-cyan-100/60">तुमने कहा: </span>{conversation[conversation.length - 1]?.role === "user" ? conversation[conversation.length - 1]?.content : conversation[conversation.length - 2]?.content}</div> : null}
        <div className="mt-8"><VoiceButton state={state} onTap={onVoiceTap} isListening={isListening} /></div>
        <p className="mt-4 text-sm text-slate-300">{state === "listening" ? "अब बोलो, हिन्दी में सुन रही हूँ" : state === "thinking" ? "तुम्हारी बात समझ रही हूँ…" : state === "speaking" ? "जवाब दे रही हूँ · बीच में बोल सकते हो" : "बात शुरू करने के लिए छुओ"}</p>
        <button type="button" onClick={toggleHandsFree} disabled={realtimeActive} className={`mt-5 rounded-full border px-5 py-3 text-sm font-medium disabled:opacity-40 ${handsFree ? "border-cyan-200/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/[0.04] text-slate-200"}`}>
          {handsFree ? "लगातार बातचीत चालू · बंद करें" : "जवाब के बाद फिर सुनो"}
        </button>
        <button type="button" onClick={() => realtimeActive ? void stopRealtime() : void startRealtime()} disabled={!realtimeAvailable && !realtimeActive} className={`mt-3 rounded-full border px-5 py-3 text-sm font-medium ${realtimeActive ? "border-rose-200/35 bg-rose-400/10 text-rose-100" : "border-violet-200/20 bg-violet-300/[0.05] text-violet-100 disabled:opacity-35"}`}>
          {realtimeActive ? "Live बातचीत बंद करें" : realtimeAvailable ? "Realtime live voice शुरू करें" : "Realtime voice server पर configured नहीं"}
        </button>
        {!realtimeAvailable ? <p className="mt-2 max-w-sm text-center text-[10px] leading-4 text-slate-500">सामान्य हिन्दी voice mode उपलब्ध है। Live WebRTC के लिए server में OPENAI_REALTIME_MODEL सेट करें और project access होना चाहिए।</p> : null}
      </section>
      <button onClick={() => router.push("/chat")} className="flex items-center gap-2 rounded-full px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.05]"><Keyboard size={16} /> लिखकर बात करें</button>
    </main>
  );
}
