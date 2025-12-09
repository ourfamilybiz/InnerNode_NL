// src/lib/voice.ts

// Simple text-to-speech helper using the browser Speech Synthesis API.
// Safe to call from any component – will just no-op if unsupported.

export function speakText(text: string) {
  if (typeof window === "undefined") return;

  const synth = window.speechSynthesis;
  if (!synth || !text.trim()) return;

  // Stop any current speech
  if (synth.speaking) {
    synth.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;      // 1 = normal speed
  utterance.pitch = 1;     // 1 = normal pitch

  synth.speak(utterance);
}
