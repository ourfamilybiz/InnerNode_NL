// src/lib/equalizerPlaybook.ts

import {
  classifyEqualizerInput,
  type TriggerClassification,
} from "./equalizerTriggers";
import {
  callInnerNodeChat,
  type InnerNodeMessage,
} from "./innernodeAiClient";

export type EqualizerTone = "gentle" | "direct" | "playful";

export type EqualizerResult = {
  summary: string;
  safetyNote?: string;
  steps: string[];
  classification: TriggerClassification;
  rawAiText: string;
};

/**
 * Main Equalizer brain.
 * - Cleans the input
 * - Classifies it into emotion / impulse / escalation
 * - Calls the InnerNode AI client with quick_reset hint
 * - Normalizes the AI response into a summary + steps
 */
export async function runEqualizerPlaybook(
  rawInput: unknown,
  tone: EqualizerTone = "gentle"
): Promise<EqualizerResult> {
  // ✅ Make sure we ALWAYS end up with a string
  const inputText = (
    typeof rawInput === "string"
      ? rawInput
      : rawInput == null
      ? ""
      : String(rawInput)
  ).trim();

  // If nothing was really said, return a gentle nudge
  if (!inputText) {
    const fallbackClassification = classifyEqualizerInput("");

    return {
      summary:
        "Tell me a little about what just happened or what you’re about to do, so I can help you slow it down.",
      steps: [
        "Take one slow, deep breath in through your nose, out through your mouth.",
        "In one or two sentences, describe the moment you’re in — not your whole life story, just this scene.",
      ],
      classification: fallbackClassification,
      rawAiText: "",
    };
  }

  // 1) Classify the input using your simple trigger map
  const classification = classifyEqualizerInput(inputText);

  // 2) Build a structured message for the AI
  const messages: InnerNodeMessage[] = [
    {
      role: "user",
      content: [
        `You are the InnerNode Equalizer. The user just tapped the Quick Reset button in the middle of a real-life impulse moment.`,
        ``,
        `User text: "${inputText}"`,
        ``,
        `Internal classification (for your awareness, not to be repeated back as-is):`,
        `- Emotion cluster: ${classification.emotionCluster}`,
        `- Impulse type: ${classification.impulseType}`,
        `- Escalation level: ${classification.escalationLevel}`,
        `- Flags: ${JSON.stringify(classification.flags)}`,
        ``,
        `Your job:`,
        `1. Reflect what you heard in simple, human language (1–2 sentences).`,
        `2. Offer 2–4 tiny, realistic steps that could interrupt or soften this moment.`,
        `3. If the risk feels higher (escalation 2 or 3), gently nudge them toward pausing, stepping away, or reaching out to a real human or emergency services when appropriate.`,
        ``,
        `Tone preference: ${tone} (can be “gentle”, “direct”, or “playful”) — but always respectful, safe, and non-judgmental.`,
      ].join("\n"),
    },
  ];

  // 3) Call the shared AI client with quick_reset hint
  const ai = await callInnerNodeChat(messages, { modelHint: "quick_reset" });

  // 4) Normalize the AI output into summary + bullet steps
  const lines = ai.content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const summary =
    lines[0] ||
    "Let’s slow this moment down together for just a few breaths.";

  const steps: string[] = [];
  for (const line of lines.slice(1)) {
    const cleaned = line.replace(/^[-•\d.)]+\s*/, ""); // remove bullets / numbers
    if (cleaned) steps.push(cleaned);
  }

  const finalSteps =
    steps.length > 0
      ? steps
      : [
          "Pause for 10–20 seconds before you say, send, or do anything.",
          "Name what you’re actually trying to protect here: your peace, your pride, your safety, or your future.",
        ];

  return {
    summary,
    steps: finalSteps,
    classification,
    rawAiText: ai.content,
  };
}


