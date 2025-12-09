// src/pages/GamesPage.tsx
import React, { useMemo, useState } from "react";

import { useUserProfile } from "../hooks/useUserProfile";
import {
  INNERPLAY_GAMES,
  INNERPLAY_SECTIONS,
  isGameAllowedForTier,
} from "../lib/innerplayGames";

// Type-only import (no runtime export needed)
import type { InnerPlayGame } from "../lib/innerplayGames";

/**
 * Simple prototype flow for one game: Thought Detective
 * 3 steps:
 *  1) Describe the loud thought
 *  2) Pick a thinking pattern
 *  3) Read a gentle reflection
 */

// All the thought patterns the mini-game uses
type ThoughtPatternKey =
  | "all_or_nothing"
  | "mind_reading"
  | "catastrophizing"
  | "personalizing"
  | "not_sure";

const THOUGHT_PATTERN_LABELS: Record<ThoughtPatternKey, string> = {
  all_or_nothing: "All-or-nothing thinking",
  mind_reading: "Mind reading",
  catastrophizing: "Catastrophizing",
  personalizing: "Personalizing",
  not_sure: "I’m not sure yet",
};

const THOUGHT_PATTERN_EXPLANATIONS: Record<ThoughtPatternKey, string> = {
  all_or_nothing:
    "All-or-nothing thinking makes everything either a total success or total failure. Real life is usually more mixed and flexible than that.",
  mind_reading:
    "Mind reading assumes you know what others think without clear evidence. It often increases anxiety and resentment.",
  catastrophizing:
    "Catastrophizing jumps to the worst-case scenario, even when more likely outcomes are milder. It keeps your nervous system on high alert.",
  personalizing:
    "Personalizing treats everything as your fault or about you, even when many factors are involved. It can fuel guilt and shame.",
  not_sure:
    "Not being sure is okay. Noticing that something feels off is already a powerful step toward clearer thinking.",
};

type ThoughtDetectiveState = {
  step: 1 | 2 | 3;
  thoughtText: string;
  selectedPattern: ThoughtPatternKey | null;
};

const initialThoughtDetectiveState: ThoughtDetectiveState = {
  step: 1,
  thoughtText: "",
  selectedPattern: null,
};

const GamesPage: React.FC = () => {
  const { profile, loading } = useUserProfile();

  const [selectedGameKey, setSelectedGameKey] = useState<string | null>(
    "thought_detective"
  );
  const [tdState, setTdState] = useState<ThoughtDetectiveState>(
    initialThoughtDetectiveState
  );

  const rawTier = profile?.plan_tier?.toLowerCase() ?? "free";

  // Only show games allowed for this tier
  const allowedGames = useMemo(
    () => INNERPLAY_GAMES.filter((g) => isGameAllowedForTier(g, rawTier)),
    [rawTier]
  );

  const selectedGame: InnerPlayGame | undefined = useMemo(
    () => allowedGames.find((g) => g.key === selectedGameKey) ?? allowedGames[0],
    [allowedGames, selectedGameKey]
  );

  // Reset Thought Detective state if user switches away and back
  const handleSelectGame = (key: string) => {
    setSelectedGameKey(key);
    if (key === "thought_detective") {
      setTdState(initialThoughtDetectiveState);
    }
  };

  // ---------- Thought Detective Flow Logic ----------

  const canAdvanceFromStep1 =
    tdState.thoughtText.trim().length >= 20; // encourage at least a sentence or two

  const canAdvanceFromStep2 = tdState.selectedPattern !== null;

  const handleTDNext = () => {
    if (tdState.step === 1 && canAdvanceFromStep1) {
      setTdState((prev) => ({ ...prev, step: 2 }));
    } else if (tdState.step === 2 && canAdvanceFromStep2) {
      setTdState((prev) => ({ ...prev, step: 3 }));
    }
  };

  const handleTDRestart = () => {
    setTdState(initialThoughtDetectiveState);
  };

  // ---------- UI helpers ----------

  const renderGameCard = (game: InnerPlayGame) => {
    const isSelected = game.key === selectedGame?.key;
    const locked = !isGameAllowedForTier(game, rawTier);

    return (
      <button
        key={game.key}
        type="button"
        disabled={locked}
        onClick={() => handleSelectGame(game.key)}
        className={`w-full text-left rounded-2xl border px-3 py-3 text-xs transition ${
          locked
            ? "border-slate-800/70 bg-slate-900/40 text-slate-500 cursor-not-allowed opacity-70"
            : isSelected
            ? "border-cyan-400 bg-slate-900/80 text-cyan-100 shadow-md shadow-cyan-500/30"
            : "border-slate-800 bg-slate-950/60 text-slate-200 hover:border-cyan-400/60 hover:text-cyan-100"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold tracking-wide uppercase">
              {game.title}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{game.tagline}</p>
          </div>
          <div className="text-[10px] text-slate-500">
            {game.minTier === "free"
              ? "Free"
              : game.minTier === "plus"
              ? "Plus"
              : "Pro"}
          </div>
        </div>
        {!game.hasPrototype && !locked && (
          <p className="mt-2 text-[10px] text-amber-300/80">
            Coming soon – shell ready, logic next.
          </p>
        )}
        {locked && (
          <p className="mt-2 text-[10px] text-amber-300/80">
            Locked for your current tier.
          </p>
        )}
      </button>
    );
  };

  const renderThoughtDetective = () => {
    if (!selectedGame || selectedGame.key !== "thought_detective") return null;

    return (
      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        {/* Step indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Thought Detective · 3-step scan</span>
          <span>Step {tdState.step} of 3</span>
        </div>

        {/* Progress dots */}
        <div className="mt-2 flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                tdState.step >= i ? "bg-cyan-400" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="mt-4 space-y-3 text-sm text-slate-100">
          {tdState.step === 1 && (
            <>
              <p className="text-sm font-medium text-slate-100">
                1. Capture the loud thought.
              </p>
              <p className="text-xs text-slate-400">
                What is the exact sentence or story running in your head right
                now about this situation?
              </p>
              <textarea
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
                placeholder='Example: "If I mess this up, everyone will think I’m a failure."'
                value={tdState.thoughtText}
                onChange={(e) =>
                  setTdState((prev) => ({
                    ...prev,
                    thoughtText: e.target.value,
                  }))
                }
              />
              <p className="text-[11px] text-slate-500">
                Try to write at least one or two full sentences so we can really
                see the pattern.
              </p>
            </>
          )}

          {tdState.step === 2 && (
            <>
              <p className="text-sm font-medium text-slate-100">
                2. Spot the pattern.
              </p>
              <p className="text-xs text-slate-400">
                Which of these patterns feels closest to the thought you wrote?
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {(Object.keys(
                  THOUGHT_PATTERN_LABELS
                ) as ThoughtPatternKey[]).map((key) => {
                  const isSelected = tdState.selectedPattern === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setTdState((prev) => ({
                          ...prev,
                          selectedPattern: key,
                        }))
                      }
                      className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-500/10 text-cyan-100"
                          : "border-slate-700 bg-slate-900/70 text-slate-200 hover:border-cyan-400/60 hover:text-cyan-100"
                      }`}
                    >
                      <div className="font-semibold text-[11px]">
                        {THOUGHT_PATTERN_LABELS[key]}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500">
                You’re not locked into this forever. This is just a working
                label to help your brain slow down and see what it’s doing.
              </p>
            </>
          )}

          {tdState.step === 3 && tdState.selectedPattern && (
            <>
              <p className="text-sm font-medium text-slate-100">
                3. Read your gentle reflection.
              </p>
              <p className="text-xs text-slate-400">
                Here’s what this pattern usually does to people, and a calmer
                way to see your situation.
              </p>
              <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-xs text-slate-100">
                <p className="font-semibold text-[11px] text-cyan-200">
                  {THOUGHT_PATTERN_LABELS[tdState.selectedPattern]}
                </p>
                <p className="mt-1 text-[11px]">
                  {THOUGHT_PATTERN_EXPLANATIONS[tdState.selectedPattern]}
                </p>
                {tdState.thoughtText.trim().length > 0 && (
                  <p className="mt-3 text-[11px] text-slate-300">
                    The thought you shared was:
                    <br />
                    <span className="italic text-slate-100">
                      “{tdState.thoughtText.trim()}”
                    </span>
                  </p>
                )}
                <p className="mt-3 text-[11px] text-slate-300">
                  You don’t have to instantly believe a new story. For now,
                  just notice that your brain chose a familiar pattern, and that
                  you have permission to question it instead of obeying it.
                </p>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                You can copy this insight into Smart Notes or share it with your
                Companion so InnerNode can remember it for next time.
              </p>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleTDRestart}
            className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100"
          >
            Start over
          </button>

          {tdState.step < 3 && (
            <button
              type="button"
              onClick={handleTDNext}
              disabled={
                (tdState.step === 1 && !canAdvanceFromStep1) ||
                (tdState.step === 2 && !canAdvanceFromStep2)
              }
              className="rounded-xl bg-cyan-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 shadow-md shadow-cyan-500/40 disabled:opacity-50"
            >
              Next step
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading && !profile) {
    return (
      <div className="mx-auto max-w-3xl text-sm text-slate-400">
        Loading your InnerPlay hub…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">
          InnerPlay · Brain Games
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Light, guided games that help you calm down, gain clarity, and wake up
          your focus—without feeling like a casino or a test.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Left: Sections & cards */}
        <section className="space-y-4">
          {INNERPLAY_SECTIONS.map((section) => {
            const gamesInSection = allowedGames.filter(
              (g) => g.category === section.id
            );
            if (!gamesInSection.length) return null;

            return (
              <div
                key={section.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                      {section.label}
                    </h2>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {section.description}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {gamesInSection.map(renderGameCard)}
                </div>
              </div>
            );
          })}
        </section>

        {/* Right: Selected game details + prototype */}
        <aside className="space-y-3">
          {selectedGame ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">
                Game Details
              </div>
              <h2 className="mt-1 text-sm font-semibold text-slate-100">
                {selectedGame.title}
              </h2>
              <p className="mt-1 text-xs text-cyan-200">
                {selectedGame.tagline}
              </p>
              <p className="mt-3 text-xs text-slate-300">
                {selectedGame.purpose}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">
                When to use it: {selectedGame.whenToUse}
              </p>
              <p className="mt-3 text-[11px] text-slate-500">
                Tier:{" "}
                {selectedGame.minTier === "free"
                  ? "Free"
                  : selectedGame.minTier === "plus"
                  ? "Plus"
                  : "Pro"}
              </p>

              {selectedGame.key === "thought_detective" ? (
                renderThoughtDetective()
              ) : (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3 text-[11px] text-slate-300">
                  This game shell is ready, but the full interactive flow will
                  be added next. For now, you can test{" "}
                  <span className="font-semibold text-cyan-200">
                    Thought Detective
                  </span>{" "}
                  as a working example.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
              Select a game on the left to see how it works.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default GamesPage;
