// src/pages/FocusPage.tsx
import React from "react";

const FocusPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">
          Focus Lanes
        </h1>
        <p className="text-sm text-slate-400">
          Choose a lane (spiritual, professional, personal, creative, etc.) and
          let InnerNode aim your nudges toward what matters most right now.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
        <p className="text-xs text-slate-300">
          Eventually, this page will let you:
        </p>
        <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
          <li>Select or change your current focus lane.</li>
          <li>Answer lane-specific questions for better targeting.</li>
          <li>See lane-related suggestions, prompts, and lessons.</li>
        </ul>
      </section>
    </div>
  );
};

export default FocusPage;
