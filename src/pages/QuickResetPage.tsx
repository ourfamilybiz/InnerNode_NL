// src/pages/QuickResetPage.tsx
import React, { useEffect, useRef, useState } from "react";

import { useUserProfile } from "../hooks/useUserProfile";
import {
  runEqualizerPlaybook,
  type EqualizerResult,
  type EqualizerTone,
} from "../lib/equalizerPlaybook";

import { speakText } from "../lib/voice";


type RecognitionType =
  | (SpeechRecognition & { continuous?: boolean })
  | (webkitSpeechRecognition & { continuous?: boolean })
  | null;

declare global {
  interface Window {
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

const QuickResetPage: React.FC = () => {
  const { profile } = useUserProfile();

  const [input, setInput] = useState("");
  const [result, setResult] = useState<EqualizerResult | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<RecognitionType>(null);

  const coachStyle = (profile?.coach_style || "").toLowerCase();
  const userTone: EqualizerTone =
    coachStyle === "direct"
      ? "direct"
      : coachStyle === "mentor"
      ? "mentor"
      : coachStyle === "neutral"
      ? "neutral"
      : "gentle";

  // ----- Voice input (tap-to-toggle mic) -----

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const recognition: any = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript;
        }
      }
      if (finalTranscript.trim()) {
        setInput((prev) =>
          prev ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim()
        );
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current as any;
    if (!recognition) return;

    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      setError(null);
      try {
        recognition.start();
        setListening(true);
      } catch (e) {
        console.error("Speech recognition error:", e);
        setListening(false);
      }
    }
  };

  // ----- Run Equalizer -----

  const handleRun = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await runEqualizerPlaybook({
        text: input,
        userTone,
      });
      setResult(res);
    } catch (err) {
      console.error("[QuickReset] error:", err);
      setError(
        "Something glitched while trying to respond. You can try again in a moment or paste this into your Companion."
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRun();
    }
  };

  const handleSpeak = () => {
    if (result?.mainResponse) {
      speakText(result.mainResponse);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-5">
      {/* Page intro – STATIC per Equalizer spec */}
      <header className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <p className="text-[11px] uppercase tracking-wide text-cyan-300">
          Quick Reset · The Equalizer
        </p>
        <h1 className="text-lg font-semibold text-slate-100">
          This space is for you to equalize and reset.
        </h1>
        <p className="text-sm text-slate-300">
          When emotions spike or impulses rush in, InnerNode helps you pause,
          breathe, and create space between impulse and action—so the moment
          doesn’t decide for you.
        </p>
        <p className="text-xs text-cyan-200">
          Pause. Breathe. Choose with intention.
        </p>
        <p className="mt-2 text-[11px] text-slate-500">
          This isn’t a crisis hotline or emergency service. If you are in
          immediate danger or thinking about seriously harming yourself or
          someone else, contact local emergency services or a crisis line
          first. InnerNode is here to help you practice the pause around your
          next move.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* Left: input + controls */}
        <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-slate-100">
              What’s happening in this moment?
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] transition ${
                  listening
                    ? "border-rose-400 bg-rose-500/10 text-rose-200"
                    : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200"
                }`}
              >
                <span className="mr-1 text-xs">
                  {listening ? "●" : "🎤"}
                </span>
                {listening ? "Listening…" : "Tap to speak"}
              </button>
            </div>
          </div>

          <p className="mt-1 text-[11px] text-slate-500">
            You can type or talk. No need to sound polished — just describe
            what you’re about to do, say, send, spend, or show up for.
          </p>

          <textarea
            rows={4}
            className="mt-3 flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Example: “I’m about to text my boss and quit on the spot because I feel disrespected.”"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {result?.microPrompt && (
            <p className="mt-2 text-[11px] text-cyan-200">
              {result.microPrompt}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500">
              Tone:{" "}
              <span className="text-cyan-200">
                {userTone === "mentor"
                  ? "Grounded mentor"
                  : userTone === "direct"
                  ? "Direct"
                  : userTone === "neutral"
                  ? "Neutral"
                  : "Gentle"}
              </span>
            </p>
            <button
              type="button"
              onClick={handleRun}
              disabled={sending || !input.trim()}
              className="rounded-xl bg-cyan-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 shadow-md shadow-cyan-500/40 disabled:opacity-60"
            >
              {sending ? "Equalizing…" : "Run Quick Reset"}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-[11px] text-amber-200">
              {error}
            </p>
          )}
        </section>

        {/* Right: response card */}
        <aside className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <h2 className="text-sm font-medium text-slate-100">
            Your Equalizer reflection
          </h2>
          {!result && !sending && (
            <p className="mt-2 text-xs text-slate-500">
              After you share what’s happening, InnerNode will reflect back
              what it hears, help you slow the surge, and suggest a calmer
              way to move forward. You can always paste key parts into your
              Companion so it stays in your story.
            </p>
          )}

          {sending && (
            <p className="mt-2 text-xs text-slate-400">
              InnerNode is reading the moment and preparing a reflection…
            </p>
          )}

          {result && !sending && (
            <>
              <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>
                  Tone used:{" "}
                  <span className="text-cyan-200">
                    {result.toneUsed === "mentor"
                      ? "Grounded mentor"
                      : result.toneUsed === "direct"
                      ? "Direct"
                      : result.toneUsed === "neutral"
                      ? "Neutral"
                      : "Gentle"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleSpeak}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-200 hover:border-cyan-400 hover:text-cyan-100"
                >
                  <span>🔊</span>
                  <span>Play response</span>
                </button>
              </div>
              <div className="mt-2 flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-sm leading-relaxed text-slate-100 whitespace-pre-wrap">
                {result.mainResponse}
              </div>

              {result.escalationSuggested && (
                <p className="mt-2 text-[11px] text-amber-200">
                  This moment touches important parts of your life. After you
                  finish here, consider bringing this to your Companion, a
                  trusted person, or a professional so you’re not carrying it
                  alone.
                </p>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default QuickResetPage;

