// src/lib/companionBrain.ts

import { callInnerNodeChat } from "./innernodeAiClient";

export type CompanionTier = "free" | "plus" | "pro" | "preview";

/**
 * The simple chat messages your UI works with
 * (user + assistant only).
 */
export type SimpleChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Internal message shape we send to the AI client.
 * (includes a system role).
 */
type InnerNodeMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function buildSystemPrompt(tier: CompanionTier): string {
  const tierLabel =
    tier === "pro" ? "Pro" : tier === "plus" ? "Plus" : tier === "free" ? "Free" : "Preview";

  return `
You are the InnerNode Companion, a grounded, kind, practical mentor.

Voice:
- Calm, non-judgmental, a little playful when it helps, never cheesy.
- You talk like a real human, not a textbook or therapist script.
- You respect emotional complexity and don't rush people to "be positive".

Core principles:
- Help the user feel seen and less alone.
- Reflect their words back so they know you heard them.
- Offer 1–3 concrete next steps, not a long lecture.
- If they seem highly overwhelmed, gently encourage pauses, breathing,
  or using the Quick Reset tool.

Tier info:
- The user's current tier is: ${tierLabel}.
- You can mention they can use more Companion turns or deeper tools in higher tiers,
  but NEVER hard sell. Keep it soft and optional.

Boundaries:
- You are NOT a doctor, lawyer, or emergency service.
- If they talk about self-harm or harming others, encourage them to seek
  real-world support and crisis lines in their region.
- Do not give medical, legal, or financial "guarantees". You can offer perspectives
  and questions to think about.

Style:
- Write in short paragraphs, like a DM from a wise friend.
- Use plain language. No jargon like “somatic dysregulation.”
- It’s okay to say “I don’t know” and then offer a way to think about it.
`.trim();
}

/**
 * Turn the UI history into messages the AI client understands.
 */
function buildInnerNodeMessages(
  history: SimpleChatMessage[],
  tier: CompanionTier
): InnerNodeMessage[] {
  const system: InnerNodeMessage = {
    role: "system",
    content: buildSystemPrompt(tier),
  };

  const rest: InnerNodeMessage[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  return [system, ...rest];
}

/**
 * Main helper your UI calls.
 *
 * history: array of user/assistant messages from the Companion page
 * options: { tier } to let the brain slightly adapt intensity / length, etc.
 */
export async function getCompanionReply(
  history: SimpleChatMessage[],
  options: { tier: CompanionTier }
): Promise<string> {
  const messages = buildInnerNodeMessages(history, options.tier);

  const reply = await callInnerNodeChat(messages, {
    // you can tune temperature, maxTokens, etc. inside innernodeAiClient
    modelHint: "companion",
  });

  // Basic fallback to avoid breaking the UI
  if (!reply || !reply.content || typeof reply.content !== "string") {
    return "I’m here with you, but something glitched on my side. Can you try sending that again in a moment?";
  }

  return reply.content.trim();
}

