// src/pages/onboarding/OnboardingStartPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

const OnboardingStartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
        console.error("[OnboardingStart] profile check error:", error.message);
        setCheckingProfile(false);
        return;
      }

      if (data?.onboarding_completed) {
        // If onboarding already done, send straight to Today
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050509] text-slate-100 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950/80 p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Welcome to InnerNode</h1>
          <p className="text-sm text-slate-400">
            Before we drop you into your daily reset space, let&apos;s set a few
            foundations so InnerNode knows how to support you.
          </p>
        </div>

        <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
          <li>Agree to our terms and privacy basics.</li>
          <li>Pick your membership tier (Free, Plus, or Pro).</li>
          <li>Later, you&apos;ll unlock deeper questionnaires and AI tuning.</li>
        </ul>

        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={() => navigate("/today")}
            className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={() => navigate("/onboarding/terms")}
            className="rounded-md bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950"
          >
            Begin setup
          </button>
        </div>
      </div>
    </div>
  );
};

// 🔑 This line is what React/Vite expects for a default import
export default OnboardingStartPage;
