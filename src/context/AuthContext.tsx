// src/context/AuthContext.tsx
import React,
{
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (options: { email: string; password: string }) => Promise<{
    error: string | null;
  }>;
  signIn: (options: { email: string; password: string }) => Promise<{
    error: string | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadUser = async () => {
      setLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!ignore) {
        if (error) {
          console.error("[Auth] getUser error:", error.message);
        }
        setUser(user ?? null);
        setLoading(false);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextType["signUp"] = async ({ email, password }) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error("[Auth] signUp error:", error.message);
      return { error: error.message };
    }
    return { error: null };
  };

  const signIn: AuthContextType["signIn"] = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("[Auth] signIn error:", error.message);
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[Auth] signOut error:", error.message);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex h-screen items-center justify-center bg-[#050509] text-slate-200">
          <div>Loading InnerNode...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

