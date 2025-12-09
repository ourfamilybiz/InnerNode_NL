// src/App.tsx
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  NavLink,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { useUserProfile } from "./hooks/useUserProfile";

import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

import TodayPage from "./pages/TodayPage";
import CompanionPage from "./pages/CompanionPage";
import QuickResetPage from "./pages/QuickResetPage";

import LessonsPage from "./pages/LessonsPage";
import SmartNotesPage from "./pages/SmartNotesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import GamesPage from "./pages/GamesPage";
import FocusPage from "./pages/FocusPage";
import SettingsPage from "./pages/SettingsPage";
import SupportPage from "./pages/SupportPage";

import OnboardingStartPage from "./pages/onboarding/OnboardingStartPage";
import OnboardingTermsPage from "./pages/onboarding/OnboardingTermsPage";
import OnboardingTierSelectPage from "./pages/onboarding/OnboardingTierSelectPage";
import GetToKnowYouPage from "./pages/GetToKnowYouPage";

// ---- Protected route wrapper ----
const AuthOnlyRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-100">
        <p className="text-sm text-slate-400">Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

// ---- Main app shell with sidebar + top bar ----
const InnerNodeShell: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const navLinkBase =
    "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors";
  const navLinkInactive =
    "text-slate-300 hover:text-cyan-200 hover:bg-slate-900/70";
  const navLinkActive =
    "text-cyan-200 bg-slate-900/80 border border-cyan-500/40";

  const rawTier = profile?.plan_tier?.toLowerCase() ?? null;
  const tierLabel =
    rawTier === "free"
      ? "Free"
      : rawTier === "plus"
      ? "Plus"
      : rawTier === "pro"
      ? "Pro"
      : "Preview";

  return (
    // ⬇️ NOTE: NO bg-* CLASS HERE — background comes from <body> theme
    <div className="min-h-screen flex text-slate-100">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/80 p-4">
        <div className="mb-6">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
            <div className="h-4 w-4 rounded-full bg-slate-950/90" />
          </div>
          <h1 className="mt-3 text-sm font-semibold tracking-wide text-slate-100">
            INNER<span className="text-cyan-400">NODE</span>
          </h1>
          <p className="mt-1 text-[11px] text-slate-400">
            Your real-life reset space.
          </p>
        </div>

                <nav className="flex-1 space-y-1 text-xs">
          {/* Core daily flows */}
          <NavLink
            to="/today"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            <span>Today</span>
          </NavLink>

          <NavLink
            to="/companion"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            <span>Companion</span>
          </NavLink>

          <NavLink
            to="/quick-reset"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            <span>Quick Reset</span>
          </NavLink>

          {/* Growth & learning */}
          <div className="pt-3 text-[10px] uppercase tracking-wide text-slate-500">
            Growth
          </div>

          <NavLink
            to="/lessons"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            <span>Lessons</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            <span>Analytics</span>
          </NavLink>

          <NavLink
            to="/games"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            <span>Brain Games</span>
          </NavLink>

          <NavLink
            to="/focus"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            <span>Focus Lanes</span>
          </NavLink>

          {/* Life logistics */}
          <div className="pt-3 text-[10px] uppercase tracking-wide text-slate-500">
            Life Logistics
          </div>

          <NavLink
            to="/smart-notes"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            <span>Smart Notes</span>
          </NavLink>

          {/* Settings / support */}
          <div className="pt-3 text-[10px] uppercase tracking-wide text-slate-500">
            System
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            <span>Settings &amp; FAQ</span>
          </NavLink>

          <NavLink
            to="/support"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            <span>Support</span>
          </NavLink>
        </nav>


        <div className="pt-4 border-t border-slate-800 mt-4 text-[11px] space-y-1">
          {user && (
            <p className="text-slate-400 break-all">
              {user.email}
            </p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-1 inline-flex items-center rounded-lg border border-slate-700 px-3 py-1 text-[11px] text-slate-200 hover:border-cyan-400 hover:text-cyan-200"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar (slightly translucent so themes show through a bit) */}
        <header className="h-12 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline">
              InnerNode · Soft Launch Preview
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-200">
              Tier: {tierLabel}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ---- Main App component: define all routes ----
const App: React.FC = () => {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />

      {/* Protected routes */}
      <Route element={<AuthOnlyRoute />}>
        {/* Onboarding screens (full-screen, outside shell but still protected) */}
        <Route path="/onboarding/start" element={<OnboardingStartPage />} />
        <Route path="/onboarding/terms" element={<OnboardingTermsPage />} />
        <Route path="/onboarding/tier" element={<OnboardingTierSelectPage />} />

        {/* Main app shell + inner pages */}
        <Route element={<InnerNodeShell />}>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/companion" element={<CompanionPage />} />
           {/* NEW: “Let InnerNode get to know you” */}
  <Route path="/get-to-know-you" element={<GetToKnowYouPage />} />
          <Route path="/quick-reset" element={<QuickResetPage />} />

          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/smart-notes" element={<SmartNotesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/focus" element={<FocusPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/today" replace />} />
    </Routes>
  );
};

export default App;
