// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email first.");
      return;
    }

    try {
      setSubmitting(true);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        }
      );

      if (resetError) throw resetError;

      setMessage(
        "If that email exists in our system, a reset link has been sent. Check your inbox (and spam folder)."
      );
    } catch (err: any) {
      console.error("[ForgotPassword] error:", err);
      setError(
        err?.message || "Something went wrong sending the reset email."
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
            Reset your password
          </CardTitle>
          <p className="text-xs text-slate-400">
            Enter the email you used to sign up. You’ll get a link to set a new
            password.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Email</label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="text-sm"
              />
            </div>

            <Button
              type="submit"
              className="w-full text-sm"
              disabled={submitting}
            >
              {submitting ? "Sending link…" : "Send reset link"}
            </Button>
          </form>

          <div className="pt-2 text-xs text-slate-400 text-center">
            <span>Remembered it?</span>{" "}
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

export default ForgotPasswordPage;
