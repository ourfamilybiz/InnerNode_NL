// src/pages/SmartNotesPage.tsx
import React, { useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type SmartNote = {
  id: string;
  user_id: string;
  title: string | null;
  body: string | null;
  note_type: string | null;
  priority: string | null;
  status: string | null;
  due_at: string | null;
  tags: string[] | null;
  created_at: string;
};

const SmartNotesPage: React.FC = () => {
  const { user } = useAuth();

  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New note form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [noteType, setNoteType] = useState<"idea" | "task" | "journal" | "other">(
    "idea"
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [dueAt, setDueAt] = useState<string>("");

  // --- Voice input state ---
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  // Check browser support for SpeechRecognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const AnyWindow = window as any;
    const SpeechRecognition =
      AnyWindow.SpeechRecognition || AnyWindow.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const result = event.results[event.resultIndex];

        // Only save the final transcript, not interim versions
        if (result.isFinal) {
          const transcript = result[0].transcript.trim();
          if (transcript.length > 0) {
            setBody((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }
  }, []);

  const toggleRecording = () => {
    if (!voiceSupported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setError(null);
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  // --- Load notes for current user ---
  useEffect(() => {
    if (!user) return;

    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: dbError } = await supabase
          .from("smart_notes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (dbError) throw dbError;
        setNotes((data ?? []) as SmartNote[]);
      } catch (err: any) {
        console.error("[SmartNotes] fetch error:", err);
        setError("Could not load your notes right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  const handleSaveNote = async () => {
    // 🔍 Debug: see who the app thinks you are
    console.log("[SmartNotes] current user:", user);

    if (!user) {
      setError("You must be logged in to save notes.");
      return;
    }

    if (!body.trim() && !title.trim()) {
      setError("Say or type something for this note first.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        user_id: user.id,
        title: title.trim() || null,
        body: body.trim() || null,
        note_type: noteType,
        priority,
        status: "open",
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
        tags: null as string[] | null,
      };

      const { data, error: dbError } = await supabase
        .from("smart_notes")
        .insert([payload])
        .select("*")
        .single();

      if (dbError) throw dbError;

      setNotes((prev) => [data as SmartNote, ...prev]);

      // clear the form
      setTitle("");
      setBody("");
      setNoteType("idea");
      setPriority("low");
      setDueAt("");
    } catch (err: any) {
      console.error("[SmartNotes] save error raw:", err);
      if (err?.message) console.error("[SmartNotes] message:", err.message);
      if (err?.code) console.error("[SmartNotes] code:", err.code);
      if (err?.details) console.error("[SmartNotes] details:", err.details);

      setError(
        err?.message ?? "Could not save that note. Try again in a moment."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto h-full">
      {/* Header */}
      <header className="border-b border-slate-800 pb-3">
        <h1 className="text-xl font-semibold text-cyan-300">Smart Notes</h1>
        <p className="text-xs text-slate-400">
          Capture what’s in your head in plain language. Speak or type, and
          InnerNode will keep it organized for later.
        </p>
      </header>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-amber-500/60 bg-amber-950/40 px-3 py-2 text-[11px] text-amber-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] h-full">
        {/* Left: new note composer */}
        <Card className="bg-slate-950/70 border-slate-800 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-100">
              New Smart Note
            </CardTitle>
            <p className="text-[11px] text-slate-500">
              Speak your note, type details, then save. Later we can route
              this into tasks, reminders, or lesson prompts.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 flex-1">
            <Input
              placeholder="Short title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Note body</span>
                {voiceSupported ? (
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border ${
                      isRecording
                        ? "border-rose-500/70 bg-rose-500/10 text-rose-200"
                        : "border-slate-600 bg-slate-900 text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
                    }`}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                    {isRecording ? "Listening… tap to stop" : "Tap mic to speak"}
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-500">
                    Voice capture not supported in this browser.
                  </span>
                )}
              </div>
              <Textarea
                rows={5}
                placeholder="Say it like you’d text a friend. Your words will be saved exactly as they come out."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-300">
              <div className="space-y-1">
                <label className="block">Note type</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs"
                >
                  <option value="idea">Idea / Brain dump</option>
                  <option value="task">Task / Follow-up</option>
                  <option value="journal">Journal / Feelings</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="block">
                  Optional reminder date (for later features)
                </label>
                <Input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                onClick={handleSaveNote}
                disabled={saving}
                className="text-sm"
              >
                {saving ? "Saving…" : "Save Smart Note"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: recent notes list */}
        <Card className="bg-slate-950/70 border-slate-800 flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-100">
              Recent Notes
            </CardTitle>
            <p className="text-[11px] text-slate-500">
              The latest things you’ve captured, newest first.
            </p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading && (
              <p className="text-[11px] text-slate-400">
                Loading your notes…
              </p>
            )}

            {!loading && notes.length === 0 && (
              <p className="text-[11px] text-slate-500">
                No Smart Notes yet. Try speaking one into the mic or typing it
                on the left.
              </p>
            )}

            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-slate-100 truncate">
                    {note.title || "(Untitled note)"}
                  </div>
                  <div className="flex gap-1 text-[10px] text-slate-400">
                    {note.note_type && (
                      <span className="rounded-full border border-slate-700 px-2 py-0.5">
                        {note.note_type}
                      </span>
                    )}
                    {note.priority && (
                      <span className="rounded-full border border-slate-700 px-2 py-0.5">
                        {note.priority}
                      </span>
                    )}
                  </div>
                </div>
                {note.body && (
                  <p className="text-[11px] text-slate-200 whitespace-pre-wrap">
                    {note.body}
                  </p>
                )}
                <div className="text-[10px] text-slate-500">
                  {new Date(note.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartNotesPage;
