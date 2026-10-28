"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, ShieldCheck, Trash2, Upload, Volume2 } from "lucide-react";

const consentPhrase = "मैं इस आवाज का मालिक हूं और मैं सिंथेटिक आवाज मॉडल बनाने के लिए OpenAI को इस आवाज का उपयोग करने की सहमति देता हूं";
const samplePrompt = "आज सुबह मैंने आराम से चाय पी और बाहर का मौसम देखा। मुझे साफ़, सहज हिन्दी में बात करना अच्छा लगता है। जब कोई सवाल पूछे, तो मैं ध्यान से सुनकर सोच-समझकर जवाब देना चाहती हूँ।";
type Clip = { blob: Blob; seconds: number; type: string };

export default function VoiceEnrollment({ onCreated }: { onCreated: (voiceId: string) => void }) {
  const [consentClip, setConsentClip] = useState<Clip | null>(null);
  const [voiceClip, setVoiceClip] = useState<Clip | null>(null);
  const [recording, setRecording] = useState<"consent" | "sample" | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const pendingKindRef = useRef<"consent" | "sample">("consent");

  const stopTimer = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const stopRecording = () => {
    stopTimer();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    setRecording(null);
  };

  useEffect(() => () => {
    stopTimer();
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const startRecording = async (kind: "consent" | "sample") => {
    setError("");
    setMessage("");
    if (recording) { stopRecording(); return; }
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("इस ब्राउज़र में सुरक्षित ऑडियो रिकॉर्डिंग उपलब्ध नहीं है। Android Chrome आज़माएँ।");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;
      const supportedType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((mime) => MediaRecorder.isTypeSupported(mime));
      const recorder = new MediaRecorder(stream, supportedType ? { mimeType: supportedType } : undefined);
      pendingKindRef.current = kind;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const seconds = Math.round((Date.now() - startedAtRef.current) / 1000);
        const type = recorder.mimeType?.split(";")[0] || "audio/webm";
        const clip = { blob: new Blob(chunksRef.current, { type }), seconds, type };
        if (pendingKindRef.current === "consent") setConsentClip(clip);
        else setVoiceClip(clip);
        stream.getTracks().forEach((track) => track.stop());
        if (streamRef.current === stream) streamRef.current = null;
      };
      recorder.start(250);
      setRecording(kind);
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setElapsed(seconds);
        if (seconds >= 30) stopRecording();
      }, 250);
    } catch {
      setError("माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र की site settings में अनुमति देकर फिर कोशिश करें।");
    }
  };

  const playClip = async (clip: Clip | null) => {
    if (!clip) return;
    const url = URL.createObjectURL(clip.blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);
    try { await audio.play(); } catch { URL.revokeObjectURL(url); setError("रिकॉर्डिंग सुनाई नहीं जा सकी।"); }
  };

  const createVoice = async () => {
    setError("");
    setMessage("");
    if (!agreed) { setError("अपनी आवाज़ की अनुमति की पुष्टि पहले करो।"); return; }
    if (!consentClip || !voiceClip) { setError("सहमति और voice sample—दोनों रिकॉर्ड करके सुन लो।"); return; }
    if (consentClip.seconds < 3 || voiceClip.seconds < 5) { setError("सहमति कम से कम 3 सेकंड और sample कम से कम 5 सेकंड बोलो।"); return; }
    if (consentClip.blob.size > 10 * 1024 * 1024 || voiceClip.blob.size > 10 * 1024 * 1024) { setError("हर recording 10 MB से छोटी होनी चाहिए।"); return; }

    setBusy(true);
    const form = new FormData();
    form.append("consentRecording", consentClip.blob, `consent.${consentClip.type.includes("mp4") ? "mp4" : "webm"}`);
    form.append("voiceSample", voiceClip.blob, `sample.${voiceClip.type.includes("mp4") ? "mp4" : "webm"}`);
    form.append("consentPhrase", consentPhrase);
    form.append("consentConfirmed", "true");
    form.append("consentSeconds", String(consentClip.seconds));
    form.append("sampleSeconds", String(voiceClip.seconds));
    try {
      const response = await fetch("/api/voices/enroll", { method: "POST", credentials: "same-origin", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "अपनी आवाज़ अभी नहीं बन पाई।");
      onCreated(data.voiceId);
      setMessage("तुम्हारी अपनी आवाज़ इस उपकरण पर चुन ली गई। नमूने server पर सहेजे नहीं गए।");
      setConsentClip(null);
      setVoiceClip(null);
      setAgreed(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "आवाज़ जोड़ने में दिक्कत हुई।");
    } finally {
      setBusy(false);
    }
  };

  const clearClips = () => { setConsentClip(null); setVoiceClip(null); setAgreed(false); setMessage("रिकॉर्डिंग इस उपकरण से हटा दी गई।"); setError(""); };
  const clipButton = (kind: "consent" | "sample", clip: Clip | null, title: string) => (
    <div className="rounded-xl border border-white/[0.08] bg-black/15 p-3">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{recording === kind ? `रिकॉर्ड हो रहा है… ${elapsed}/30 सेकंड` : clip ? `रिकॉर्ड हो गया · ${clip.seconds} सेकंड` : "शुरू करने के लिए दबाएँ · अधिकतम 30 सेकंड"}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => void startRecording(kind)} className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg text-xs font-semibold ${recording === kind ? "bg-rose-500/20 text-rose-100" : "bg-cyan-400/10 text-cyan-100"}`}><span>{recording === kind ? <MicOff size={15}/> : <Mic size={15}/>}</span>{recording === kind ? "रिकॉर्डिंग रोकें" : clip ? "फिर रिकॉर्ड करें" : "अपनी आवाज़ रिकॉर्ड करें"}</button>
        <button type="button" disabled={!clip} onClick={() => void playClip(clip)} aria-label="रिकॉर्डिंग सुनें" className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.05] text-slate-200 disabled:opacity-30"><Volume2 size={15}/></button>
      </div>
    </div>
  );

  return (
    <div className="mt-4 rounded-2xl border border-cyan-100/10 bg-cyan-200/[0.025] p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-50"><Mic size={16}/>अपनी आवाज़ से फ्रूटी</h3>
      <p className="mt-2 text-xs leading-5 text-slate-400">केवल अपनी ही आवाज़ रिकॉर्ड करो। सहमति और नमूना दोनों एक ही व्यक्ति के होने चाहिए। हम इन recordings को इस ऐप में जमा नहीं करते; पुष्टि के बाद इन्हें custom voice सुविधा बनाने के लिए OpenAI server को भेजा जाएगा।</p>
      <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/20 p-3"><p className="text-[11px] font-semibold text-slate-300">पहली recording में यह वाक्य हूबहू पढ़ो:</p><p className="mt-2 text-sm leading-7 text-white">{consentPhrase}</p></div>
      <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/20 p-3"><p className="text-[11px] font-semibold text-slate-300">दूसरी recording में सामान्य आवाज़ में यह पढ़ो; शांत जगह में 10–30 सेकंड बोलो:</p><p className="mt-2 text-sm leading-7 text-slate-200">{samplePrompt}</p><p className="mt-2 text-[10px] leading-5 text-slate-500">कम से कम पाँच सेकंड की साफ़ speech चाहिए। अधिक natural परिणाम के लिए पूरा नमूना आराम से पढ़ो।</p></div>
      <div className="mt-3 grid gap-3">{clipButton("consent", consentClip, "1 · अपनी सहमति")}{clipButton("sample", voiceClip, "2 · अपनी आवाज़ का नमूना")}</div>
      <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.07] bg-black/15 p-3"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5 h-4 w-4 accent-cyan-300"/><span className="text-[11px] leading-5 text-slate-300">मैं इस आवाज़ का मालिक/मालकिन हूँ, दोनों recordings मेरी अपनी हैं, और मैं इन्हें कृत्रिम आवाज़ बनाने के लिए भेजने पर सहमत हूँ।</span></label>
      {error ? <p role="alert" className="mt-3 rounded-lg bg-rose-400/10 p-3 text-xs leading-5 text-rose-100">{error}</p> : null}
      {message ? <p role="status" className="mt-3 rounded-lg bg-emerald-300/[0.07] p-3 text-xs leading-5 text-emerald-100">{message}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={busy || !agreed || !consentClip || !voiceClip} onClick={() => void createVoice()} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-4 text-sm font-semibold text-white disabled:opacity-40"><Upload size={15}/>{busy ? "आवाज़ बना रही हूँ…" : "अपनी आवाज़ बनाओ"}</button>
        <button type="button" disabled={busy || (!consentClip && !voiceClip)} onClick={clearClips} className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.05] text-slate-300 disabled:opacity-30" aria-label="रिकॉर्डिंग मिटाएँ"><Trash2 size={16}/></button>
      </div>
      <p className="mt-3 flex items-start gap-2 text-[10px] leading-5 text-slate-500"><ShieldCheck size={13} className="mt-0.5 shrink-0"/>Custom Voice सुविधा OpenAI के project की पात्रता/अनुमतियों पर निर्भर है; सेवा/प्रयोग का शुल्क हो सकता है। अपनी आवाज़ चुनना, उसे किसी अन्य व्यक्ति जैसा बनाना नहीं है।</p>
    </div>
  );
}
