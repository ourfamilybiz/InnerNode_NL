// src/pages/onboarding/OnboardingTierSelectPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

const OnboardingTierSelectPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050509] text-slate-100">
        <p className="text-sm text-slate-400">
          You need to be logged in to view this page.
        </p>
      </div>
    );
  }

  const selectTier = async (tier: "free" | "plus" | "pro") => {
    setSaving(true);
    setError(null);

    const now = new Date().toISOString();

    const { error } = await supabase.from("user_profiles").upsert(
      {
        user_id: user.id,
        plan_tier: tier,
        onboarding_completed: true,
        updated_at: now,
      },
      { onConflict: "user_id" } as any
    );

    setSaving(false);

    if (error) {
      console.error("[TierSelect] save error:", error.message);
      setError("Could not save your selection. Please try again.");
      return;
    }

    // When tier is saved, send them to the main Today page
    navigate("/today");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050509] text-slate-100 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950/80 p-6 space-y-6">
        <h1 className="text-xl font-semibold">Choose Your Tier</h1>
        <p className="text-xs text-slate-400">
          You can change your plan anytime. For launch, all tiers behave like a
          “soft launch” — we’re mostly learning how you use InnerNode.
        </p>

        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-950/50 px-3 py-2 text-[11px] text-red-100">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            disabled={saving}
            onClick={() => selectTier("free")}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-left hover:border-cyan-400/60 hover:text-cyan-200"
          >
            <span className="font-semibold text-sm">Free</span>
            <p className="text-xs text-slate-400">
              Core daily check-ins, simple reflections, and light insights.
            </p>
          </button>

          <button
            disabled={saving}
            onClick={() => selectTier("plus")}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-left hover:border-cyan-400/60 hover:text-cyan-200"
          >
            <span className="font-semibold text-sm">Plus</span>
            <p className="text-xs text-slate-400">
              More check-ins, deeper nudges, and saved patterns over time.
            </p>
          </button>

          <button
            disabled={saving}
            onClick={() => selectTier("pro")}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-left hover:border-cyan-400/60 hover:text-cyan-200"
          >
            <span className="font-semibold text-sm">Pro</span>
            <p className="text-xs text-slate-400">
              Highest check-in volume, richer analytics, and future voice/companion
              features.
            </p>
          </button>
        </div>

        {saving && (
          <p className="text-xs text-cyan-300 text-center pt-2">
            Saving your selection...
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => navigate("/today")}
            className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTierSelectPage;
