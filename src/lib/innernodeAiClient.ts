// src/lib/innernodeAiClient.ts

// Shared message types for the InnerNode AI calls
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
   * - "lesson" (lessons, later)
   */
  modelHint?: "companion" | "quick_reset" | "lesson";
};

export type InnerNodeChatResult = {
  content: string;
};

/**
 * Frontend client → calls our secure backend route /api/innernodeChat
 * If anything fails (network / 500 / etc), we fall back to a simple,
 * but still human, message so the app never feels broken.
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
        modelHint: options?.modelHint ?? "companion",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { content: data.content as string };
    } else {
      console.warn(
        "[callInnerNodeChat] Non-OK response",
        res.status,
        await res.text()
      );
    }
  } catch (err) {
    console.warn("[callInnerNodeChat] Error talking to backend:", err);
  }

  // Fallback if backend fails for any reason
  return {
    content:
      "I’m here with you. Something interrupted the deeper reflection on my side, but we can still walk through this together. Tell me a little more about what part feels heaviest.",
  };
}
