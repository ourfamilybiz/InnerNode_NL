// src/pages/auth/SignupPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);

    const { error } = await signUp({ email, password });

    setSubmitting(false);

    if (error) {
      setError(error);
      return;
    }

    setInfo("Check your email to confirm your account, then log in.");
    setTimeout(() => navigate("/auth/login", { replace: true }), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050509] text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h1 className="text-xl font-semibold mb-2">Create InnerNode Account</h1>
        <p className="text-sm text-slate-400 mb-4">
          Start setting up your personal reset space.
        </p>

        {error && (
          <div className="mb-3 rounded-md bg-red-900/50 border border-red-500/70 px-3 py-2 text-xs text-red-100">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-3 rounded-md bg-emerald-900/40 border border-emerald-500/60 px-3 py-2 text-xs text-emerald-100">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-cyan-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

