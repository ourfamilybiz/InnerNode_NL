// src/components/FeedbackModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { submitTesterFeedback, type FeedbackType } from "../lib/feedbackApi";
import { useAuth } from "../context/AuthContext";

type Props = {
  open: boolean;
  onClose: () => void;
  page?: string; // e.g. "/companion"
  googleFormUrl?: string; // backup link
};

export default function FeedbackModal({
  open,
  onClose,
  page,
  googleFormUrl,
}: Props) {
  const { user } = useAuth();

  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement | null>(null);

  const device = useMemo(() => {
    if (typeof navigator === "undefined") return null;
    return navigator.userAgent;
  }, []);

  // ✅ Reset state each time the modal opens + lock background scroll
  useEffect(() => {
    if (!open) return;

    setDone(false);
    setError(null);
    setSending(false);
    setMessage("");

    // lock background scroll (helps a lot on iPhone)
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus the sheet for keyboard users
    setTimeout(() => sheetRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // ✅ ESC closes modal
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!user) {
      setError("Please sign in first, then try again.");
      return;
    }
    if (!message.trim()) {
      setError("Write a quick note first (even 1 sentence helps).");
      return;
    }

    try {
      setSending(true);
      setError(null);

      await submitTesterFeedback({
        userId: user.id,
        message: message.trim(),
        feedbackType,
        page,
        device: device ?? undefined,
      });

      setDone(true);
      setMessage("");
    } catch (e: any) {
      console.error("[Feedback] submit error:", e);
      setError(e?.message ?? "Could not send feedback right now.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    // reset minimal state on close so reopen feels fresh
    setDone(false);
    setError(null);
    setSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      {/* sheet */}
      <div className="absolute bottom-0 left-0 right-0 md:inset-0 md:flex md:items-center md:justify-center">
        <div
          ref={sheetRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Send feedback"
          // ✅ stop clicks inside the modal from closing via overlay
          onClick={(e) => e.stopPropagation()}
          className="w-full md:max-w-lg rounded-t-2xl md:rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl outline-none"
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Send Feedback</div>
              <div className="text-[11px] text-slate-400">
                Quick + honest is perfect. This helps improve InnerNode fast.
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-[11px] px-3 py-1 rounded-lg border border-slate-700 hover:border-cyan-400"
            >
              Close
            </button>
          </div>

          <div className="p-4 space-y-3">
            {done ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-[12px] text-emerald-100">
                ✅ Thanks! Your feedback was submitted.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-amber-500/60 bg-amber-950/40 p-3 text-[11px] text-amber-100">
                {error}
              </div>
            ) : null}

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">Type</label>
              <select
                value={feedbackType}
                onChange={(e) =>
                  setFeedbackType(e.target.value as FeedbackType)
                }
                disabled={sending || done}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm disabled:opacity-70"
              >
                <option value="general">General</option>
                <option value="bug">Bug / not working</option>
                <option value="confusion">Confusing / unclear</option>
                <option value="idea">Idea / feature request</option>
                <option value="praise">Something I liked</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">Your message</label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What were you trying to do? What happened? What would you prefer?"
                disabled={sending || done}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400 disabled:opacity-70"
              />
            </div>

            {!done ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={sending}
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/40 disabled:opacity-60"
              >
                {sending ? "Sending…" : "Submit feedback"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  setError(null);
                  setMessage("");
                }}
                className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400"
              >
                Send another
              </button>
            )}

            {googleFormUrl ? (
              <div className="text-[11px] text-slate-400 pt-1">
                If the button fails, use the backup form:{" "}
                <a
                  className="text-cyan-200 underline"
                  href={googleFormUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open backup feedback form
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
