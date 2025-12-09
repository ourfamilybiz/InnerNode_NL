// src/hooks/useUserProfile.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export type UserProfile = {
  user_id: string;
  display_name: string | null;
  plan_tier: string | null;
  onboarding_completed: boolean | null;
  agreed_to_terms: boolean | null;
  // add any other columns you have if needed
};

type UseUserProfileResult = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export const useUserProfile = (): UseUserProfileResult => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[useUserProfile] error:", error.message);
      setError("Could not load your profile.");
      setProfile(null);
    } else {
      setProfile((data as UserProfile) ?? null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
  };
};
