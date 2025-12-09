// src/pages/AnalyticsPage.tsx
import React from "react";

const AnalyticsPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">
          Analytics & Patterns
        </h1>
        <p className="text-sm text-slate-400">
          A view into your emotional patterns, energy cycles, and growth over
          time.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
        <p className="text-xs text-slate-300">
          In the future, this page will visualize:
        </p>
        <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
          <li>Mood trends from your Today check-ins.</li>
          <li>Which days or contexts are most challenging.</li>
          <li>How often you use Quick Reset and Companion sessions.</li>
          <li>Progress across lesson tracks and focus lanes.</li>
        </ul>
      </section>
    </div>
  );
};

export default AnalyticsPage;
