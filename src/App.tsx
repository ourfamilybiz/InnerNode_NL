import React from "react";
import { NavLink, Route, Routes, Navigate } from "react-router-dom";

function TodayPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display">Today</h1>
      <p className="text-text-muted text-sm">
        This is the placeholder for the Today experience. We&apos;ll plug in
        mood check-ins, quick reflections, and the daily evaluation here.
      </p>
    </div>
  );
}

function InnerGuidePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display">Inner Guide</h1>
      <p className="text-text-muted text-sm">
        This will become your primary AI companion chat space, tuned to each
        member&apos;s profile, tone, and tier.
      </p>
    </div>
  );
}

function AnalyticsPlusPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display">Analytics Plus</h1>
      <p className="text-text-muted text-sm">
        Here we&apos;ll surface signals, trends, and growth patterns. Think:
        mood graphs, behavior streaks, and suggested focus areas.
      </p>
    </div>
  );
}

function GrowthLabPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display">Growth Lab</h1>
      <p className="text-text-muted text-sm">
        Lessons, micro-experiments, and guided challenges will live here.
      </p>
    </div>
  );
}

function LifeDeskPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display">Life Desk</h1>
      <p className="text-text-muted text-sm">
        This will become the Smart Notes / Admin assistant space, powered by
        the AI Administrative Assistant features.
      </p>
    </div>
  );
}

function MindGymPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display">Mind Gym</h1>
      <p className="text-text-muted text-sm">
        Brain games, quick cognitive resets, and micro-challenges will plug in
        here.
      </p>
    </div>
  );
}

function FocusLanesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display">Focus Lanes</h1>
      <p className="text-text-muted text-sm">
        Interest lanes (spiritual, professional, personal, etc.) will live
        here—each with its own prompts and progress.
      </p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display">Settings</h1>
      <p className="text-text-muted text-sm">
        Avatar building, tone selection, tier upgrades, and privacy controls
        will be managed here.
      </p>
    </div>
  );
}

function SupportPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display">Support & FAQ</h1>
      <p className="text-text-muted text-sm">
        FAQ, contact support, and onboarding explanations will be surfaced
        here.
      </p>
    </div>
  );
}

const navItems = [
  { to: "/today", label: "Today" },
  { to: "/inner-guide", label: "Inner Guide" },
  { to: "/analytics-plus", label: "Analytics Plus" },
  { to: "/growth-lab", label: "Growth Lab" },
  { to: "/life-desk", label: "Life Desk" },
  { to: "/mind-gym", label: "Mind Gym" },
  { to: "/focus-lanes", label: "Focus Lanes" },
  { to: "/settings", label: "Settings" },
  { to: "/support", label: "Support" },
];

function App() {
  return (
    <div className="min-h-screen bg-background text-text flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border bg-background-soft/80 backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-border">
          <div className="w-10 h-10 rounded-2xl bg-innernode-gradient shadow-aura flex items-center justify-center mb-2">
            <span className="w-5 h-5 rounded-full bg-background-elevated" />
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-text-soft">
            InnerNode
          </div>
          <div className="text-xs text-text-muted">
            Your real-life reset button
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center px-3 py-2 rounded-xl text-sm transition-all",
                  "text-text-soft hover:text-text hover:bg-background-elevated/70",
                  isActive
                    ? "bg-background-elevated text-text shadow-aura"
                    : "",
                ].join(" ")
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 text-[11px] text-text-soft border-t border-border">
          v0.1 • InnerNode-NL layout shell
        </div>
      </aside>

      {/* Main region */}
      <div className="flex-1 flex flex-col">
        {/* Top bar (mobile + global header) */}
        <header className="w-full border-b border-border bg-background-soft/60 backdrop-blur-xl px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex md:hidden w-8 h-8 rounded-xl bg-innernode-gradient shadow-aura items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-background-elevated" />
            </div>
            <div>
              <div className="text-sm font-display tracking-wide">
                InnerNode
              </div>
              <div className="text-[11px] text-text-soft">
                Prototype shell — motion graphics & avatars plug in here
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-text-soft">
            <span>Member</span>
            <span className="w-7 h-7 rounded-full bg-background-elevated border border-border" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/today" replace />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/inner-guide" element={<InnerGuidePage />} />
              <Route path="/analytics-plus" element={<AnalyticsPlusPage />} />
              <Route path="/growth-lab" element={<GrowthLabPage />} />
              <Route path="/life-desk" element={<LifeDeskPage />} />
              <Route path="/mind-gym" element={<MindGymPage />} />
              <Route path="/focus-lanes" element={<FocusLanesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/support" element={<SupportPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
