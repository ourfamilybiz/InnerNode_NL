// src/lib/innernodeAiClient.ts

// Basic message shape used by the “AI client”
export type InnerNodeRole = "system" | "user" | "assistant";

export type InnerNodeMessage = {
  role: InnerNodeRole;
  content: string;
};

export type InnerNodeChatOptions = {
  /**
   * Hint so we can slightly vary tone depending on where it’s used:
   * - "companion" (InnerNode Companion chat)
   * - "quick_reset" (Equalizer / Quick Reset)
   * - "lesson" (lesson reflections, later)
   */
  modelHint?: "companion" | "quick_reset" | "lesson";
};

export type InnerNodeChatResult = {
  content: string;
};

/**
 * TEMP STUB:
 * This is a local, fake “AI client” so the app feels real during testing
 * WITHOUT needing any secret API keys or a backend.
 *
 * Later, this function is where we’ll plug in:
 * - a Vercel / Supabase Edge Function, or
 * - an internal API that talks to OpenAI / other models securely.
 */
export async function callInnerNodeChat(
  messages: InnerNodeMessage[],
  options?: InnerNodeChatOptions
): Promise<InnerNodeChatResult> {
  // Grab the most recent user message (if any)
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userText = lastUser?.content?.trim() ?? "";

  let prefix: string;

  switch (options?.modelHint) {
    case "quick_reset":
      prefix =
        "Here’s a grounded quick reset reflection based on what you shared:";
      break;
    case "lesson":
      prefix =
        "Here’s a simple, real-world reflection to go with this lesson:";
      break;
    case "companion":
    default:
      prefix = "I’m taking in what you just shared.";
      break;
  }

  let body: string;

  if (userText.length > 0) {
    body = `

I hear you saying: “${userText}”.

You’re not overreacting for feeling this way. Let’s keep it practical:

1. Take one slow breath and notice what part of this feels heaviest right now.
2. Name one tiny move that would make today **2% easier** (not perfect, just lighter).
3. If you had to text a trusted friend about this in one sentence, what would you say?

You don’t have to fix everything today. Just pick one small action that matches your current energy.`;
  } else {
    body = `

If you want, try typing (or speaking) a bit more about what’s going on so I can respond more specifically. Start with:
- “Right now I feel…” or
- “The part that hurts the most is…”`;
  }

  return {
    content: `${prefix} ${body}`,
  };
}
