// src/pages/TodayPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useUserProfile } from "../hooks/useUserProfile";

type MoodValue = 1 | 2 | 3 | 4 | 5;

type MoodEntry = {
  id: string;
  user_id: string;
  mood: MoodValue;
  note: string | null;
  created_at: string;
};

const moodOptions: { value: MoodValue; label: string; emoji: string }[] = [
  { value: 1, label: "Very Low", emoji: "😞" },
  { value: 2, label: "Low", emoji: "☁️" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Great", emoji: "🌈" },
];

const TodayPage: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Daily assessment local state (for now this is just in-memory)
  const [assessmentTheme, setAssessmentTheme] = useState("");
  const [assessmentDrain, setAssessmentDrain] = useState("");
  const [assessmentSupport, setAssessmentSupport] = useState("");
  const [assessmentPromise, setAssessmentPromise] = useState("");
  const [assessmentSummary, setAssessmentSummary] = useState<string | null>(
    null
  );

  // Figure out tier from profile
  const tier: "free" | "plus" | "pro" | "preview" = useMemo(() => {
    const raw = profile?.plan_tier?.toLowerCase() ?? "free";
    if (raw === "pro") return "pro";
    if (raw === "plus") return "plus";
    if (raw === "free") return "free";
    return "preview";
  }, [profile?.plan_tier]);

  const tierLabel =
    tier === "pro" ? "Pro" : tier === "plus" ? "Plus" : tier === "free" ? "Free" : "Preview";

  // Tier-based daily mood check-in limits
  const maxCheckinsPerDay =
    tier === "pro" ? 8 : tier === "plus" ? 5 : 3; // preview behaves like free

  // Load today's entries for this user
  useEffect(() => {
    const loadEntries = async () => {
      if (!user) return;
      setLoadingEntries(true);
      setError(null);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("mood_checkins")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startOfToday.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[TodayPage] loadEntries error:", error.message);
        setError("Could not load today’s check-ins.");
      } else {
        setEntries((data ?? []) as MoodEntry[]);
      }

      setLoadingEntries(false);
    };

    loadEntries();
  }, [user]);

  const todaysCheckinsUsed = entries.length;
  const todaysCheckinsRemaining = Math.max(
    0,
    maxCheckinsPerDay - todaysCheckinsUsed
  );

  const handleSave = async () => {
    if (!user) return;

    // Enforce daily limit by tier
    if (todaysCheckinsUsed >= maxCheckinsPerDay) {
      setError(
        `You’ve reached your ${maxCheckinsPerDay} check-ins for today on the ${tierLabel} plan.`
      );
      return;
    }

    if (!selectedMood) {
      setError("Please select a mood before saving.");
      return;
    }

    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("mood_checkins")
      .insert({
        user_id: user.id,
        mood: selectedMood,
        note: note.trim() || null,
      })
      .select("*")
      .single();

    setSaving(false);

    if (error) {
      console.error("[TodayPage] save error:", error.message);
      setError("Could not save your check-in. Please try again.");
      return;
    }

    // Prepend new entry to list
    setEntries((prev) => [data as MoodEntry, ...prev]);
    setNote("");
    setSelectedMood(null);
  };

  // Build a simple, human daily reflection from their answers + mood log
  const handleGenerateAssessment = () => {
    setError(null);

    if (!assessmentTheme.trim()) {
      setError("Give your day a simple headline first.");
      return;
    }

    const latestEntry = entries[0] ?? null;
    const latestMoodMeta = latestEntry
      ? moodOptions.find((m) => m.value === latestEntry.mood)
      : undefined;

    const parts: string[] = [];

    parts.push(`Today felt like: ${assessmentTheme.trim()}.`);

    if (entries.length > 0) {
      const moodSentence = latestMoodMeta
        ? `You checked in ${entries.length} time(s), and your last mood was "${latestMoodMeta.label}".`
        : `You checked in ${entries.length} time(s) today.`;
      parts.push(moodSentence);
    } else {
      parts.push(
        "You didn’t log a mood check-in today, but you still showed up for this reflection, and that matters."
      );
    }

    if (assessmentDrain.trim()) {
      parts.push(`Biggest drain on your energy: ${assessmentDrain.trim()}.`);
    }

    if (assessmentSupport.trim()) {
      parts.push(
        `Something that supported you (even a little): ${assessmentSupport.trim()}.`
      );
    }

    if (assessmentPromise.trim()) {
      parts.push(
        `The small promise you want to carry into tomorrow: ${assessmentPromise.trim()}.`
      );
    }

    parts.push(
      "You don’t have to fix everything overnight. Keep honoring how days actually feel, not how you think they’re supposed to look."
    );

    setAssessmentSummary(parts.join(" "));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">Today</h1>
        <p className="text-sm text-slate-400">
          Quick pulse on how you&apos;re really doing, right now.
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Today: {todaysCheckinsUsed} / {maxCheckinsPerDay} check-ins used for
          your {tierLabel} plan.
        </p>
      </header>

      {/* Mood selector + note */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-slate-100">
            How are you feeling in this moment?
          </h2>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setSelectedMood(m.value)}
                disabled={todaysCheckinsRemaining <= 0}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                  selectedMood === m.value
                    ? "border-cyan-400 bg-cyan-500/10 text-cyan-200"
                    : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-cyan-400/60 hover:text-cyan-200"
                } ${
                  todaysCheckinsRemaining <= 0
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >
                <span className="text-lg">{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
          {todaysCheckinsRemaining <= 0 && (
            <p className="text-[11px] text-amber-300 mt-1">
              You&apos;ve used all of today&apos;s check-ins for this plan. You
              can still write in your Companion or Smart Notes.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-200">
            What&apos;s contributing to this mood?
          </label>
          <textarea
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Be as honest as you can with yourself. No filters needed here."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/60 bg-red-950/50 px-3 py-2 text-xs text-red-100">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || todaysCheckinsRemaining <= 0}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/40 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save check-in"}
          </button>
        </div>
      </section>

      {/* Today’s history */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-100">
            Today&apos;s check-ins
          </h2>
          {loadingEntries && (
            <span className="text-[11px] text-slate-400">Loading...</span>
          )}
        </div>

        {entries.length === 0 && !loadingEntries ? (
          <p className="text-xs text-slate-500">
            No check-ins yet today. Your future self will thank you for making
            this a habit.
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => {
              const moodMeta = moodOptions.find((m) => m.value === e.mood);
              const time = new Date(e.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li
                  key={e.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{moodMeta?.emoji}</span>
                      <span className="font-medium">{moodMeta?.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{time}</span>
                  </div>
                  {e.note && (
                    <p className="mt-1 text-[11px] text-slate-300">
                      {e.note}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* End-of-day snapshot (local prototype) */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-slate-100">
              End-of-Day Snapshot
            </h2>
            <p className="text-[11px] text-slate-400">
              A quick, honest check-in about how the whole day felt. In the full
              version, these will roll up into your InnerNode evaluations.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <label className="block text-slate-200 mb-1">
              If today had a headline, what would it be?
            </label>
            <input
              type="text"
              value={assessmentTheme}
              onChange={(e) => setAssessmentTheme(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
              placeholder='Example: "Quiet survival mode with one bright moment"'
            />
          </div>

          <div>
            <label className="block text-slate-200 mb-1">
              One thing that drained you the most:
            </label>
            <input
              type="text"
              value={assessmentDrain}
              onChange={(e) => setAssessmentDrain(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="A conversation, a bill, a feeling, a thought pattern…"
            />
          </div>

          <div>
            <label className="block text-slate-200 mb-1">
              One thing that quietly supported you:
            </label>
            <input
              type="text"
              value={assessmentSupport}
              onChange={(e) => setAssessmentSupport(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="A person, a routine, a break you gave yourself…"
            />
          </div>

          <div>
            <label className="block text-slate-200 mb-1">
              One small promise you want to keep to yourself tomorrow:
            </label>
            <input
              type="text"
              value={assessmentPromise}
              onChange={(e) => setAssessmentPromise(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="Keep it tiny and realistic."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGenerateAssessment}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/40"
          >
            Generate today&apos;s reflection
          </button>
        </div>

        {assessmentSummary && (
          <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-[11px] text-slate-100">
            {assessmentSummary}
          </div>
        )}

        <p className="mt-2 text-[10px] text-slate-500">
          For this soft launch, this reflection stays on this screen only. In
          the full build, InnerNode will save these into your timeline so you
          can see patterns over weeks and months.
        </p>
      </section>
    </div>
  );
};

export default TodayPage;

