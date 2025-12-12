// src/pages/QuickResetPage.tsx

import React, { useState } from "react";
import {
  runEqualizerPlaybook,
  type EqualizerResult,
  type EqualizerTone,
} from "../lib/equalizerPlaybook";
import { speakText } from "../lib/voice";

const QuickResetPage: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [tone, setTone] = useState<EqualizerTone>("gentle");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EqualizerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await runEqualizerPlaybook(input, tone);
      setResult(res);

      // Read the summary out loud
      if (res.summary) {
        speakText(res.summary);
      }
    } catch (err) {
      console.error("[QuickReset] error:", err);
      setError(
        "InnerNode heard you, but something glitched trying to help. Try again in a moment."
      );
    } finally {
      setLoading(false);
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

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {/* Header */}
      <header className="border-b border-slate-800 pb-3">
        <h1 className="text-xl font-semibold text-cyan-300">
          Quick Reset · Equalizer
        </h1>
        <p className="text-xs text-slate-400 max-w-xl">
          When you’re about to say, send, spend, or show up in a way that could
          change your day (or life), tap here first. Tell InnerNode what’s going
          on and it will help you slow the moment down.
        </p>
      </header>

      {/* Input area */}
      <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <label className="text-[11px] font-medium text-slate-300">
          What&apos;s happening right now?
        </label>
        <textarea
          rows={3}
          className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
          placeholder='Example: "I’m about to text something wild to my ex because I’m mad and tired of being ignored."'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Tone selector */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span>How do you want InnerNode to talk to you?</span>
          <div className="inline-flex overflow-hidden rounded-full border border-slate-700 bg-slate-950/80 text-[11px]">
            {(["gentle", "direct", "playful"] as EqualizerTone[]).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 capitalize transition ${
                    tone === t
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-transparent text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  {t}
                </button>
              )
            )}
          </div>
        </div>

        {/* Run button */}
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/40 disabled:opacity-60"
          >
            {loading ? "Scanning moment…" : "Run Quick Reset"}
          </button>
        </div>

        {/* Error, if any */}
        {error && (
          <div className="mt-2 rounded-xl border border-amber-500/60 bg-amber-950/40 px-3 py-2 text-[11px] text-amber-100">
            {error}
          </div>
        )}
      </section>

      {/* Result area */}
      {result && (
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">
            Equalizer Reflection
          </div>

          <p className="text-sm text-slate-100">{result.summary}</p>

          <div className="mt-2 space-y-1 text-[11px] text-slate-300">
            {result.steps.map((step, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="mt-0.5 rounded-full bg-cyan-500/20 px-1.5 text-[10px] text-cyan-300">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-slate-500">
            <div>
              Emotion cluster:{" "}
              <span className="text-cyan-300">
                {result.classification.emotionCluster}
              </span>
            </div>
            <div>
              Impulse lane:{" "}
              <span className="text-cyan-300">
                {result.classification.impulseType || "unknown"}
              </span>
            </div>
            <div>
              Escalation:{" "}
              <span className="text-cyan-300">
                {result.classification.escalationLevel}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default QuickResetPage;
