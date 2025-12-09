// src/lib/innernodeAiClient.ts

export type InnerNodeMode = "companion" | "equalizer";

export type InnerNodeRole = "system" | "user" | "assistant";

export type InnerNodeMessage = {
  role: InnerNodeRole;
  content: string;
};

export type InnerNodeAIRequest = {
  mode: InnerNodeMode;
  messages: InnerNodeMessage[];
  extraContext?: Record<string, any>;
};

export type InnerNodeAIResponse = {
  reply: string;
};

/**
 * Frontend helper that calls your backend at /api/innernode-ai.
 * The backend will actually talk to OpenAI using your secret key.
 */
export async function callInnerNodeAI(
  mode: InnerNodeMode,
  messages: InnerNodeMessage[],
  extraContext: Record<string, any> = {}
): Promise<string> {
  const payload: InnerNodeAIRequest = {
    mode,
    messages,
    extraContext,
  };

  const res = await fetch("/api/innernode-ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[InnerNodeAI] HTTP error:", res.status, text);
    throw new Error("InnerNode AI request failed");
  }

  const data = (await res.json()) as InnerNodeAIResponse;

  if (!data || typeof data.reply !== "string") {
    console.error("[InnerNodeAI] Invalid response payload:", data);
    throw new Error("InnerNode AI: invalid response payload");
  }

  return data.reply;
}
