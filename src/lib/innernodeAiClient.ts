// src/lib/innernodeAiClient.ts

// Shared message types
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

// Fallback text if the API fails for any reason
const FALLBACK_TEXT =
  "I’m here with you. Something glitched on my side—try again in a moment or share a little more so I can respond better.";

/**
 * Real client: calls the Vercel serverless function at /api/innernodeChat
 * which then talks to OpenAI using your secure API key.
 */
export async function callInnerNodeChat(
  messages: InnerNodeMessage[],
  options?: InnerNodeChatOptions
): Promise<InnerNodeChatResult> {
  try {
    const res = await fetch("/api/innernodeChat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        modelHint: options?.modelHint,
      }),
    });

    if (!res.ok) {
      console.error(
        "[callInnerNodeChat] Non-OK response:",
        res.status,
        await res.text()
      );
      return { content: FALLBACK_TEXT };
    }

    const data = (await res.json()) as { content?: string; error?: string };

    if (data?.content && data.content.trim().length > 0) {
      return { content: data.content.trim() };
    }

    console.warn("[callInnerNodeChat] Missing content in API response:", data);
    return { content: FALLBACK_TEXT };
  } catch (err) {
    console.error("[callInnerNodeChat] Network / fetch error:", err);
    return { content: FALLBACK_TEXT };
  }
}
