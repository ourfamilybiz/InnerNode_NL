// src/pages/GetToKnowYouPage.tsx
import React, { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import {
  GET_TO_KNOW_YOU_SLUG,
  QUESTIONS,
  type Question,
  type QuestionCategory,
} from "../lib/getToKnowYouQuestions";
import {
  fetchGetToKnowYouAnswers,
  saveGetToKnowYouAnswers,
} from "../lib/getToKnowYouApi";

type AnswerState = Record<string, string>;

const categoryLabels: Record<QuestionCategory, string> = {
  foundation: "Foundation & Identity",
  stress: "Stress & Reactions",
  relationships: "Relationships & People",
  goals: "Goals & Momentum",
};

const GetToKnowYouPage: React.FC = () => {
  const { user } = useAuth();

  const [answers, setAnswers] = useState<AnswerState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  // Load any existing answers when user is available
  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const map = await fetchGetToKnowYouAnswers(user.id);
        setAnswers(map);
      } catch (err) {
        console.error("Failed to load get-to-know-you answers", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setStatus("idle");

    try {
      const payload = Object.entries(answers)
        .filter(([, value]) => value && value.trim().length > 0)
        .map(([question_id, answer_text]) => ({
          question_id,
          answer_text,
          answer_mode: "text",
        }));

      await saveGetToKnowYouAnswers(user.id, payload);
      setStatus("saved");
    } catch (err) {
      console.error("Failed to save get-to-know-you answers", err);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-100 mb-2">
          Let InnerNode get to know you
        </h1>
        <p className="text-sm text-slate-400">
          You’ll need to be signed in to answer these questions.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-slate-400">
          Loading your previous answers…
        </p>
      </div>
    );
  }

  // Group questions by category to give some structure
  const grouped: Record<QuestionCategory, Question[]> = {
    foundation: [],
    stress: [],
    relationships: [],
    goals: [],
  };

  for (const q of QUESTIONS) {
    grouped[q.category].push(q);
  }

  const orderedCategories: QuestionCategory[] = [
    "foundation",
    "stress",
    "relationships",
    "goals",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-100 mb-1">
          Let InnerNode get to know who you are
        </h1>
        <p className="text-sm text-slate-400">
          These questions help your Companion and tools like Quick Reset respond
          in a way that matches your real life, not just generic advice.
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          You can update these anytime. InnerNode will treat your answers as
          living information, not a test you have to pass.
        </p>

        {status === "saved" && (
          <div className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            Answers saved. Your Companion will use this to better understand
            your patterns, triggers, and goals.
          </div>
        )}

        {status === "error" && (
          <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            We heard you, but couldn&apos;t save this right now. Please try
            again in a moment.
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {orderedCategories.map((cat) => {
          const qs = grouped[cat];
          if (!qs.length) return null;

          return (
            <section
              key={cat}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-4 space-y-4"
            >
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {categoryLabels[cat]}
              </h2>

              {qs.map((q) => (
                <div key={q.id} className="space-y-2">
                  <label className="block text-sm font-medium text-slate-100">
                    {q.prompt}
                  </label>
                  {q.helper && (
                    <p className="text-[11px] text-slate-400">
                      {q.helper}
                    </p>
                  )}

                  <textarea
                    value={answers[q.id] ?? ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
                    rows={4}
                    placeholder="Share as much or as little as you feel comfortable with in this moment."
                  />
                </div>
              ))}
            </section>
          );
        })}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save answers"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GetToKnowYouPage;
