// src/pages/CompanionPage.tsx
import React, { useMemo, useRef, useState } from "react";
import { useUserProfile } from "../hooks/useUserProfile";
import { getCompanionReply } from "../lib/companionBrain";
import { speakText } from "../lib/voice";
import { useAuth } from "../context/AuthContext";

// Simple in-page chat message type
type SimpleChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatMessage = SimpleChatMessage & {
  id: string;
};

const CompanionPage: React.FC = () => {
  const { profile } = useUserProfile();
  const { user } = useAuth(); // ✅ added (so we can pass userId to the brain)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "I'm here. What’s on your mind right now? You don’t have to impress me — just be real.",
    },
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice input state for Companion
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  const tier: "free" | "plus" | "pro" | "preview" = useMemo(() => {
    const raw = profile?.plan_tier?.toLowerCase();
    if (raw === "pro") return "pro";
    if (raw === "plus") return "plus";
    if (raw === "free") return "free";
    return "preview";
  }, [profile?.plan_tier]);

  // Daily message limits by tier
  const maxMessagesForTier = tier === "pro" ? 80 : tier === "plus" ? 40 : 15;
  const usedMessages = messages.filter((m) => m.role === "user").length;
  const remainingMessages = Math.max(0, maxMessagesForTier - usedMessages);

  // Avatar meta (later this can come from Settings / user profile)
  const avatarName = "Aria";
  const avatarRole = "Motivational Coach";

  // Figure out last assistant message (for subtle UI hints)
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  // Status line for the “call window”
  let callStatus = "Connected";
  if (listening) {
    callStatus = "Listening…";
  } else if (sending) {
    callStatus = "Thinking…";
  } else if (!lastAssistant) {
    callStatus = "Ready";
  }

  // ---- MIC: tap-to-start / tap-to-stop speech input ----
  const handleMicClick = () => {
    // If already listening, stop current recognition
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input isn’t supported in this browser yet. You can still type what you want to say."
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
      // Append to whatever is already in the input box
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = (event: any) => {
      console.error("[Companion voice] error:", event);
      setError(
        "Companion couldn’t capture your voice that time. Try again, or type if it keeps happening."
      );
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  // ---- Send message to Companion ----
  const handleSend = async () => {
    if (!input.trim() || sending) return;

    if (remainingMessages <= 0) {
      setError(
        "You’ve hit today’s Companion limit for this tier. We’ll unlock more sessions in higher plans."
      );
      return;
    }

    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const historyForBrain: SimpleChatMessage[] = [...messages, userMessage].map(
        (m) => ({ role: m.role, content: m.content })
      );

      // ✅ pass userId so the brain layer can fetch preferences + onboarding answers
      const replyText = await getCompanionReply(historyForBrain, {
        tier,
        userId: user?.id ?? null,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: replyText,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // 🔊 Speak the reply out loud using your existing voice.ts helper
      speakText(replyText);
    } catch (err) {
      console.error("[Companion] error:", err);
      setError("Something glitched while generating a reply. Try again in a moment.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <header className="border-b border-slate-800 pb-3">
        <h1 className="text-xl font-semibold text-cyan-300">InnerNode Companion</h1>
        <p className="text-xs text-slate-400">
          A private space to say the thing you don&apos;t say out loud.
        </p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Tier:{" "}
            <span className="text-cyan-200">
              {tier === "pro"
                ? "Pro"
                : tier === "plus"
                ? "Plus"
                : tier === "free"
                ? "Free"
                : "Preview"}
            </span>
          </span>
          <span>
            Companion turns left today:{" "}
            <span className="text-cyan-300">
              {remainingMessages} / {maxMessagesForTier}
            </span>
          </span>
        </div>
      </header>

      {/* 🎥 Avatar / “Fake Facetime” call window */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 flex flex-col sm:flex-row gap-3">
        {/* Avatar visual box */}
        <div className="flex items-center justify-center">
          <div className="relative h-24 w-32 sm:h-28 sm:w-40 rounded-2xl bg-gradient-to-br from-cyan-500/30 via-blue-600/30 to-slate-900 border border-cyan-500/40 shadow-lg shadow-cyan-500/40 overflow-hidden flex items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-slate-950/80 border border-cyan-400 flex items-center justify-center">
              <span className="text-sm font-semibold text-cyan-200">AI</span>
            </div>

            <div className="absolute top-2 left-2 flex items-center gap-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  listening ? "bg-rose-400" : sending ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
              <span className="text-[10px] text-slate-100">{callStatus}</span>
            </div>
          </div>
        </div>

        {/* Avatar text + mode info */}
        <div className="flex-1 space-y-1 text-xs text-slate-200">
          <div className="font-semibold text-[12px] text-slate-100">
            You&apos;re with: <span className="text-cyan-200">{avatarName}</span>
          </div>
          <div className="text-[11px] text-slate-400">Role: {avatarRole}</div>
          <p className="text-[11px] text-slate-400">
            This is your steady Companion window. Over time, this box can show a static
            portrait, subtle breathing animation, or short “speaking” loops while replies
            play out loud.
          </p>
          <p className="text-[11px] text-slate-500">
            Try speaking or typing below — Aria will respond in both text and voice, and
            this call window will stay present as your anchor.
          </p>
        </div>
      </section>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-800 text-slate-100"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-3 py-2 text-[11px] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              InnerNode is thinking…
            </div>
          </div>
        )}

        {messages.length === 0 && !sending && (
          <p className="text-xs text-slate-500">
            Start by telling InnerNode what&apos;s bothering you, what you&apos;re excited
            about, or what you&apos;re struggling to name.
          </p>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-xl border border-amber-500/60 bg-amber-950/40 px-3 py-2 text-[11px] text-amber-100">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="space-y-2">
        <label className="text-[11px] font-medium text-slate-300">
          What do you want to say right now?
        </label>
        <div className="flex gap-2">
          <textarea
            rows={2}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Be as unfiltered as you need to be. Press Enter to send, Shift+Enter for a new line."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex flex-col gap-2 self-end">
            <button
              type="button"
              onClick={handleMicClick}
              className={`rounded-xl border px-3 py-2 text-[11px] font-medium ${
                listening
                  ? "border-rose-400 bg-rose-500/20 text-rose-100"
                  : "border-slate-700 bg-slate-950/70 text-slate-200 hover:border-cyan-400 hover:text-cyan-100"
              }`}
            >
              {listening ? "Listening…" : "Tap to speak"}
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/40 disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-500">
          Tap the mic once to start, again to stop. You can edit the text before you
          send it.
        </p>
      </div>
    </div>
  );
};

export default CompanionPage;

