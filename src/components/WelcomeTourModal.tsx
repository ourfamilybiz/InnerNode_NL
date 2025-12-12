import React from "react";
import { Link } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function WelcomeTourModal({ open, onClose }: Props) {
  if (!open) return null;

  const handleClose = () => {
    localStorage.setItem("innernode_seen_nav_guide", "1");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-cyan-300">
            Quick Navigation Guide
          </h2>

          <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5">
            <li><b>Companion</b> = talk things through</li>
            <li><b>Quick Reset</b> = calm impulsive moments</li>
            <li><b>Smart Notes</b> = capture thoughts or voice notes</li>
            <li><b>Testing Info</b> = what to try + how to give feedback</li>
            <li><b>Mobile</b> uses tabs · <b>Desktop</b> uses sidebar</li>
          </ul>

          <div className="flex gap-2 pt-2">
            <Link
              to="/testing-info"
              onClick={handleClose}
              className="flex-1 text-center rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Open Testing Info
            </Link>
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
