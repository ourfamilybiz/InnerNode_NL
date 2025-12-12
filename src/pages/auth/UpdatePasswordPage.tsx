// src/pages/auth/UpdatePasswordPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UpdatePasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Make sure the reset link actually created a session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError(
            "This reset link is invalid or expired. Please request a new one from the Forgot Password page."
          );
        }
      } catch (err) {
        console.error("[UpdatePassword] session check error:", err);
        setError(
          "There was a problem validating your reset link. Try requesting a new one."
        );
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!password || !confirm) {
      setError("Please enter your new password twice.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password should be at least 8 characters long.");
      return;
    }

    try {
      setSubmitting(true);

      const { data, error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      console.log("[UpdatePassword] updated user:", data);

      setMessage("Your password has been updated. You can now log in.");
      // optional: auto-redirect after a short delay
      setTimeout(() => {
        navigate("/auth/login");
      }, 2500);
    } catch (err: any) {
      console.error("[UpdatePassword] error:", err);
      setError(
        err?.message || "Something went wrong updating your password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-cyan-300">
            Set a new password
          </CardTitle>
          <p className="text-xs text-slate-400">
            This page should be opened from the password reset link in your
            email.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {checkingSession && (
            <p className="text-xs text-slate-400">Checking your reset link…</p>
          )}

          {error && (
            <div className="rounded-md border border-rose-500/70 bg-rose-950/60 px-3 py-2 text-xs text-rose-100">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-md border border-emerald-500/70 bg-emerald-950/60 px-3 py-2 text-xs text-emerald-100">
              {message}
            </div>
          )}

          {!checkingSession && !error && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">
                  New password
                </label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">
                  Confirm new password
                </label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="text-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full text-sm"
                disabled={submitting}
              >
                {submitting ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}

          <div className="pt-2 text-xs text-slate-400 text-center">
            <Link
              to="/auth/login"
              className="text-cyan-300 hover:text-cyan-200 underline"
            >
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePasswordPage;
