// src/pages/LessonsPage.tsx
import React, { useMemo, useState } from "react";

import { useUserProfile } from "../hooks/useUserProfile";
import {
  LESSON_TRACKS,
  LESSONS,
  isLessonAllowedForTier,
  type Lesson,
  type LessonTrack,
  type PlanTier,
} from "../lib/lessonsCatalog";
import { speakText } from "../lib/voice";

const LessonsPage: React.FC = () => {
  const { profile, loading } = useUserProfile();

  const tier: PlanTier = useMemo(() => {
    const raw = profile?.plan_tier?.toLowerCase();
    if (raw === "pro") return "pro";
    if (raw === "plus") return "plus";
    if (raw === "free") return "free";
    return "preview";
  }, [profile?.plan_tier]);

  const [selectedLessonKey, setSelectedLessonKey] = useState<string | null>(
    LESSONS[0]?.key ?? null
  );

  const selectedLesson: Lesson | undefined = useMemo(
    () => LESSONS.find((l) => l.key === selectedLessonKey) ?? LESSONS[0],
    [selectedLessonKey]
  );

  // Placeholder for future Supabase integration:
  // For now we consider everything "not completed".
  const isLessonCompleted = (lesson: Lesson): boolean => {
    return false; // will wire to Supabase later
  };

  const isLessonUnlockedByProgress = (lesson: Lesson): boolean => {
    if (!lesson.requiresLessonKey) return true;
    // Future: check Supabase for completion of lesson.requiresLessonKey
    return false; // default locked for now if it has a prerequisite
  };

  const handleSpeakSummary = () => {
    if (!selectedLesson) return;
    const text = `${selectedLesson.title}. ${selectedLesson.subtitle}. ${selectedLesson.purpose}`;
    speakText(text);
  };

  const renderTrackSection = (track: LessonTrack) => {
    const lessonsInTrack = LESSONS.filter(
      (lesson) => lesson.trackId === track.id
    );

    if (!lessonsInTrack.length) return null;

    return (
      <section
        key={track.id}
        className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3"
      >
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              {track.label}
            </h2>
            <p className="mt-1 text-[11px] text-slate-500 max-w-2xl">
              {track.description}
            </p>
          </div>
          <div className="text-[10px] text-slate-500">
            Suggested for:{" "}
            <span className="text-cyan-300">
              {track.suggestedTier === "free"
                ? "Free"
                : track.suggestedTier === "plus"
                ? "Plus"
                : "Pro"}
            </span>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {lessonsInTrack.map((lesson) => {
            const isAllowed = isLessonAllowedForTier(lesson, tier);
            const isUnlocked = isLessonUnlockedByProgress(lesson);
            const isCompleted = isLessonCompleted(lesson);
            const isSelected = selectedLesson?.key === lesson.key;

            const lockedByTier = !isAllowed;
            const lockedByProgress = isAllowed && !isUnlocked;

            return (
              <button
                key={lesson.key}
                type="button"
                disabled={lockedByTier}
                onClick={() => {
                  if (!lockedByTier && isUnlocked) {
                    setSelectedLessonKey(lesson.key);
                  }
                }}
                className={`w-full text-left rounded-2xl border px-3 py-3 text-xs transition ${
                  lockedByTier
                    ? "border-slate-800/70 bg-slate-900/40 text-slate-500 cursor-not-allowed opacity-70"
                    : isSelected
                    ? "border-cyan-400 bg-slate-900/80 text-cyan-100 shadow-md shadow-cyan-500/30"
                    : "border-slate-800 bg-slate-950/60 text-slate-200 hover:border-cyan-400/60 hover:text-cyan-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold tracking-wide uppercase">
                      {lesson.title}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {lesson.subtitle}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500">
                    <div>{lesson.estMinutes} min</div>
                    <div>
                      {lesson.minTier === "free"
                        ? "Free"
                        : lesson.minTier === "plus"
                        ? "Plus"
                        : "Pro"}
                    </div>
                  </div>
                </div>

                {lockedByTier && (
                  <p className="mt-2 text-[10px] text-amber-300/80">
                    Locked for your current tier.
                  </p>
                )}

                {lockedByProgress && !lockedByTier && lesson.requiresLessonKey && (
                  <p className="mt-2 text-[10px] text-amber-200/90">
                    Unlocks after completing:{" "}
                    <span className="font-semibold">
                      {
                        LESSONS.find((l) => l.key === lesson.requiresLessonKey)
                          ?.title
                      }
                    </span>
                    .
                  </p>
                )}

                {isCompleted && (
                  <p className="mt-2 text-[10px] text-emerald-300/90">
                    ✓ Marked as completed
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  if (loading && !profile) {
    return (
      <div className="mx-auto max-w-3xl text-sm text-slate-400">
        Loading your lesson access…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">
          Lessons · InnerNode School
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          These are short, focused lessons designed to work with your Quick
          Reset, Companion, and Today check-ins. You don&apos;t have to rush—
          each one is built for real life, not perfection.
        </p>
        <p className="text-[11px] text-slate-500">
          Tier:{" "}
          <span className="text-cyan-300">
            {tier === "pro"
              ? "Pro"
              : tier === "plus"
              ? "Plus"
              : tier === "free"
              ? "Free"
              : "Preview"}
          </span>
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Left: Tracks + lesson cards */}
        <div className="space-y-4">
          {LESSON_TRACKS.map(renderTrackSection)}
        </div>

        {/* Right: Selected lesson detail */}
        <aside className="space-y-3">
          {selectedLesson ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">
                Lesson Details
              </div>
              <h2 className="mt-1 text-sm font-semibold text-slate-100">
                {selectedLesson.title}
              </h2>
              <p className="mt-1 text-xs text-cyan-200">
                {selectedLesson.subtitle}
              </p>

              <p className="mt-3 text-xs text-slate-300">
                {selectedLesson.purpose}
              </p>

              <p className="mt-2 text-[11px] text-slate-400">
                When to use it: {selectedLesson.whenToUse}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5">
                  Track:{" "}
                  <span className="text-cyan-300">
                    {
                      LESSON_TRACKS.find(
                        (t) => t.id === selectedLesson.trackId
                      )?.label
                    }
                  </span>
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5">
                  Domain:{" "}
                  <span className="capitalize text-cyan-300">
                    {selectedLesson.domain}
                  </span>
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5">
                  ~{selectedLesson.estMinutes} min
                </span>
              </div>

              {selectedLesson.requiresLessonKey && (
                <p className="mt-2 text-[11px] text-amber-200/90">
                  Recommended after:{" "}
                  <span className="font-semibold">
                    {
                      LESSONS.find(
                        (l) => l.key === selectedLesson.requiresLessonKey
                      )?.title
                    }
                  </span>
                  .
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSpeakSummary}
                  className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100"
                >
                  🔊 Hear a quick summary
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-cyan-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 shadow-md shadow-cyan-500/40 disabled:opacity-50"
                  disabled
                >
                  Start lesson (coming soon)
                </button>
              </div>

              <p className="mt-3 text-[11px] text-slate-500">
                In the full build, this button will open a step-by-step lesson
                with check-ins, micro-practices, and a way to send your
                takeaways to Companion or Smart Notes.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
              Select a lesson on the left to see details.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default LessonsPage;
