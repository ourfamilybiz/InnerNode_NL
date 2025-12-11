// src/lib/companionBrain.ts

import {
  callInnerNodeChat,
  type InnerNodeMessage,
} from "./innernodeAiClient";

export type CompanionTier = "free" | "plus" | "pro" | "preview";

type SimpleChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CompanionBrainOptions = {
  tier: CompanionTier;
};

/**
 * getCompanionReply
 *
 * - Takes the chat history from CompanionPage
 * - Trims it and converts to InnerNodeMessage format
 * - Calls the /api/innernodeChat function via callInnerNodeChat
 * - Returns the reply text for the UI
 */
export async function getCompanionReply(
  history: SimpleChatMessage[],
  options: CompanionBrainOptions
): Promise<string> {
  // Keep only the last ~12 messages so prompts stay light
  const trimmedHistory = history
    .filter((m) => m.content.trim().length > 0)
    .slice(-12);

  let messagesForModel: InnerNodeMessage[];

  if (trimmedHistory.length === 0) {
    // Safety fallback: if somehow called with no history,
    // send a simple opener so the model has context.
    messagesForModel = [
      {
        role: "user",
        content:
          "I just opened InnerNode Companion and need a gentle check-in to get started.",
      },
    ];
  } else {
    messagesForModel = trimmedHistory.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }

  const result = await callInnerNodeChat(messagesForModel, {
    modelHint: "companion",
  });

  return result.content;
}

