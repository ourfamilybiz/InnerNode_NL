// src/pages/ResetPage.tsx
import React from "react";

const ResetPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">
          Quick Reset
        </h1>
        <p className="text-sm text-slate-400">
          A fast “real-life reset button” for when you need to pause, breathe,
          and re-orient.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
        <p className="text-xs text-slate-300">
          In this preview build, we&apos;re setting up the container for rapid
          check-ins and short AI nudges. Later, this page will:
        </p>
        <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
          <li>Ask what&apos;s happening right now (3–30 second flare-ups).</li>
          <li>Offer short reframes or micro-steps to stabilize you.</li>
          <li>Connect with your Today history and Companion patterns.</li>
        </ul>
      </section>
    </div>
  );
};

export default ResetPage;
