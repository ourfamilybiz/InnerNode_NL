// src/pages/SupportPage.tsx
import React from "react";

const SupportPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">
          Support & FAQ
        </h1>
        <p className="text-sm text-slate-400">
          Find quick answers and ways to reach us if something feels off.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
        <div>
          <h2 className="text-sm font-medium text-slate-100">FAQ (Preview)</h2>
          <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
            <li>InnerNode is not a crisis service or medical provider.</li>
            <li>
              Your entries are private to your account and stored securely in
              our database.
            </li>
            <li>
              Early versions may change as we learn what actually helps people
              most.
            </li>
          </ul>
        </div>

        <div className="text-xs text-slate-300">
          <p className="font-medium">Need help?</p>
          <p className="text-slate-400">
            In the live app, this page will include a contact form and links to
            support channels. For now, it serves as the placeholder for those
            flows.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;
