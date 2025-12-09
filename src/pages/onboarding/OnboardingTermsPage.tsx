// src/pages/onboarding/OnboardingTermsPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

const OnboardingTermsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [agree, setAgree] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[OnboardingTerms] profile check error:", error.message);
        setCheckingProfile(false);
        return;
      }

      if (data?.onboarding_completed) {
        navigate("/today", { replace: true });
      } else {
        setCheckingProfile(false);
      }
    };

    checkOnboarding();
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050509] text-slate-100">
        <p className="text-sm text-slate-400">
          You need to be logged in to view this page.
        </p>
      </div>
    );
  }

  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050509] text-slate-100">
        <p className="text-sm text-slate-400">Preparing your InnerNode setup…</p>
      </div>
    );
  }

  const handleContinue = async () => {
    if (!agree) {
      setError("Please confirm that you’ve read and agree to the terms.");
      return;
    }

    setSaving(true);
    setError(null);

    const now = new Date().toISOString();

    const { error } = await supabase.from("user_profiles").upsert(
      {
        user_id: user.id,
        agreed_to_terms: true,
        agreed_at: now,
        updated_at: now,
      },
      {
        onConflict: "user_id",
      } as any
    );

    setSaving(false);

    if (error) {
      console.error("[OnboardingTerms] upsert error:", error.message);
      setError("Could not save your agreement. Please try again.");
      return;
    }

    navigate("/onboarding/tier");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050509] text-slate-100 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950/80 p-6 space-y-4">
        <h1 className="text-xl font-semibold">Terms & Privacy Basics</h1>

        <div className="space-y-2 text-xs text-slate-300 max-h-60 overflow-y-auto border border-slate-800/70 rounded-md p-3 bg-slate-950/80">
          <p>
            InnerNode is a personal support space designed to help you check in
            with yourself, reflect honestly, and get AI-assisted nudges and
            insights. It is not a replacement for professional medical,
            psychological, or legal services.
          </p>
          <p>
            By continuing, you acknowledge that you are responsible for your own
            decisions and that InnerNode&apos;s content is provided for
            self-awareness and personal growth only.
          </p>
          <p>
            We store your check-ins, notes, and other inputs securely using our
            cloud provider. Aggregated, anonymized usage data may be used to
            improve the product. We will never sell your individual identity or
            raw personal entries to third parties.
          </p>
          <p>
            If you ever feel at risk of harming yourself or others, please seek
            immediate help from local emergency services or a qualified
            professional. InnerNode cannot respond to crises.
          </p>
          <p>
            By checking the box below and continuing, you confirm that you have
            read these basics and agree to our full terms and privacy policy
            (which will be linked in the live app).
          </p>
        </div>

        <label className="flex items-start gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-[2px]"
          />
          <span>
            I have read and agree to InnerNode&apos;s terms and privacy basics.
          </span>
        </label>

        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-950/50 px-3 py-2 text-[11px] text-red-100">
            {error}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate("/onboarding/start")}
            className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className="rounded-md bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTermsPage;
