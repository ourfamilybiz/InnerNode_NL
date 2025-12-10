// src/lib/innernodeAiClient.ts

export type InnerNodeRole = "system" | "user" | "assistant";

export type InnerNodeMessage = {
  role: InnerNodeRole;
  content: string;
};

export type InnerNodeChatOptions = {
  // Hint so we can vary tone depending on where it’s used
  // - "companion"  (InnerNode Companion chat)
  // - "quick_reset" (Equalizer / Quick Reset)
  // - "lesson"      (lesson reflections)
  modelHint?: "companion" | "quick_reset" | "lesson";
};

export type InnerNodeChatResult = {
  content: string;
};

function getBaseUrl() {
  // Browser: use current origin (works on Vercel deployment)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server-side / build fallback
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:5173";
}

export async function callInnerNodeChat(
  messages: InnerNodeMessage[],
  options?: InnerNodeChatOptions
): Promise<InnerNodeChatResult> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/innernodeChat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        modelHint: options?.modelHint,
      }),
    });

    if (!res.ok) {
      console.error("[callInnerNodeChat] non-OK status", res.status);
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as { content?: string };

    if (!data.content) {
      throw new Error("Missing content from API");
    }

    return { content: data.content };
  } catch (err) {
    console.error("[callInnerNodeChat] error:", err);
    // Fallback text ONLY if API fails
    return {
      content:
        "I’m here with you. Something interrupted the deeper reflection on my side, but we can still walk through this together. Tell me a little more about what part feels heaviest.",
    };
  }
}
