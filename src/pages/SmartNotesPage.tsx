// src/pages/SmartNotesPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import { supabase } from "../lib/supabaseClient";
import { speakText } from "../lib/voice";

type SmartNote = {
  id: string;
  title: string;
  body: string;
  created_at?: string;
  source: "cloud" | "local";
};

const SmartNotesPage: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cloudDisabled, setCloudDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice input state
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  const rawTier = profile?.plan_tier?.toLowerCase() ?? "free";

  // Soft caps per tier (to keep Supabase costs predictable later)
  const maxNotesForTier = rawTier === "pro" ? 500 : rawTier === "plus" ? 200 : 50;

  const handleLoadNotes = async () => {
    if (!user || cloudDisabled) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: loadError } = await supabase
        .from("smart_notes")
        .select("id, title, body, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (loadError) {
        console.error("[SmartNotes] load error:", loadError);
        setCloudDisabled(true);
        setError(
          "Cloud sync for Smart Notes isn’t fully set up yet. You can still create notes for this session."
        );
        setLoading(false);
        return;
      }

      const mapped: SmartNote[] =
        (data ?? []).map((row: any) => ({
          id: row.id,
          title: row.title ?? "",
          body: row.body ?? "",
          created_at: row.created_at ?? undefined,
          source: "cloud",
        })) ?? [];

      setNotes(mapped);
    } catch (err) {
      console.error("[SmartNotes] unexpected load error:", err);
      setCloudDisabled(true);
      setError(
        "Cloud sync for Smart Notes isn’t fully ready. Notes you make now will stay local until we finish setup."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSaveNote = async () => {
    if (!title.trim() && !body.trim()) return;

    if (notes.length >= maxNotesForTier) {
      setError(
        "You’ve reached the Smart Notes limit for this tier. You can delete older notes or upgrade later for more space."
      );
      return;
    }

    setError(null);

    const newNote: SmartNote = {
      id: `local-${Date.now()}`,
      title: title.trim() || "Untitled note",
      body: body.trim(),
      created_at: new Date().toISOString(),
      source: cloudDisabled ? "local" : "cloud",
    };

    // Optimistic: show immediately
    setNotes((prev) => [newNote, ...prev]);
    setTitle("");
    setBody("");
    setSaving(true);

    if (!user || cloudDisabled) {
      setSaving(false);
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from("smart_notes")
        .insert({
          user_id: user.id,
          title: newNote.title,
          body: newNote.body,
        })
        .select("id, created_at")
        .single();

      if (insertError) {
        console.error("[SmartNotes] save error:", insertError);
        setCloudDisabled(true);
        setError(
          "Note saved locally, but cloud sync isn’t ready yet. You can still copy important notes somewhere safe."
        );
        setSaving(false);
        return;
      }

      // Replace the local note with the real DB id
      setNotes((prev) =>
        prev.map((n) =>
          n.id === newNote.id
            ? {
                ...n,
                id: data.id,
                created_at: data.created_at ?? n.created_at,
                source: "cloud",
              }
            : n
        )
      );
    } catch (err) {
      console.error("[SmartNotes] unexpected save error:", err);
      setCloudDisabled(true);
      setError(
        "Note saved locally, but cloud sync had an issue. We’ll hook this up fully during the next setup pass."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: string, source: "cloud" | "local") => {
    // Remove immediately from UI
    setNotes((prev) => prev.filter((n) => n.id !== id));

    if (source === "local" || !user || cloudDisabled) return;

    try {
      const { error: deleteError } = await supabase
        .from("smart_notes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("[SmartNotes] delete error:", deleteError);
        // We already removed it from the UI; no need to scare the user.
      }
    } catch (err) {
      console.error("[SmartNotes] unexpected delete error:", err);
    }
  };

  // ---- Voice input (dictate a note) ----
  const handleMicClick = () => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input for Smart Notes isn’t supported in this browser yet. You can still type your notes."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError(null);
      setListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript as string;
      setBody((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = (event: any) => {
      console.error("[SmartNotes voice] error:", event);
      setError(
        "Smart Notes couldn’t capture your voice that time. Try again or use typing if it keeps happening."
      );
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-cyan-300">
          Life Logistics · Smart Notes
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          A calm place to park the “don&apos;t forget this” stuff — calls to make,
          forms to file, money moves, errands, and little life admin thoughts that
          crowd your head when you&apos;re already tired.
        </p>
        <p className="text-[11px] text-slate-500">
          These aren&apos;t deep therapy journals — they&apos;re practical notes your
          future self will thank you for. You can speak or type them.
        </p>
      </header>

      {/* Error or cloud info */}
      {error && (
        <div className="rounded-xl border border-amber-500/60 bg-amber-950/40 px-3 py-2 text-[11px] text-amber-100">
          {error}
        </div>
      )}
      {cloudDisabled && !error && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-[11px] text-slate-300">
          Cloud sync for Smart Notes will be wired up fully later. Right now,
          your notes live in this browser session. You can still copy anything
          important into Companion or elsewhere.
        </div>
      )}

      {/* Composer */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Capture a new note
            </h2>
            <p className="text-xs text-slate-400">
              Think: “call the doctor,” “ask HR about…,” “set up payment plan,”
              “renew tag,” “remember to send this email,” etc.
            </p>
          </div>
          <div className="text-[11px] text-slate-500">
            Notes used:{" "}
            <span className="text-cyan-300">
              {notes.length} / {maxNotesForTier}
            </span>
          </div>
        </div>

        <input
          type="text"
          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
          placeholder="Short title (e.g., Call credit card company about late fee)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex gap-2">
          <textarea
            rows={3}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Details, reference numbers, what you want to say, or anything else that will help you handle this later."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex flex-col gap-2 self-end">
            <button
              type="button"
              onClick={handleMicClick}
              className={`rounded-xl border px-3 py-1.5 text-[11px] font-medium ${
                listening
                  ? "border-rose-400 bg-rose-500/20 text-rose-100"
                  : "border-slate-700 bg-slate-950/70 text-slate-200 hover:border-cyan-400 hover:text-cyan-100"
              }`}
            >
              {listening ? "Listening…" : "Dictate"}
            </button>
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={saving || (!title.trim() && !body.trim())}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/40 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
        </div>
      </section>

      {/* Notes list */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-100">
            Your Smart Notes
          </h2>
          {loading && (
            <span className="text-[11px] text-slate-400">Loading…</span>
          )}
        </div>

        {notes.length === 0 && !loading ? (
          <p className="text-xs text-slate-500">
            No notes yet. Think of one thing that&apos;s been sitting in the back
            of your mind and drop it here so your brain can breathe.
          </p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => {
              const createdLabel = note.created_at
                ? new Date(note.created_at).toLocaleString([], {
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <li
                  key={note.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-100"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-[12px]">
                        {note.title}
                      </div>
                      {createdLabel && (
                        <div className="text-[11px] text-slate-500">
                          {createdLabel}{" "}
                          {note.source === "local" && "· local only"}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {note.body && (
                        <button
                          type="button"
                          onClick={() =>
                            speakText(`${note.title}. ${note.body}`)
                          }
                          className="rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:border-cyan-400 hover:text-cyan-100"
                          title="Hear this note"
                        >
                          🔊
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteNote(note.id, note.source)
                        }
                        className="rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:border-rose-400 hover:text-rose-200"
                        title="Delete note"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {note.body && (
                    <p className="mt-1 text-[11px] text-slate-200 whitespace-pre-wrap">
                      {note.body}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default SmartNotesPage;
