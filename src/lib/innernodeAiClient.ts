// src/lib/innernodeAiClient.ts

export type InnerNodeRole = "system" | "user" | "assistant";

export type InnerNodeMessage = {
  role: InnerNodeRole;
  content: string;
};

export type InnerNodeChatOptions = {
  modelHint?: "companion" | "quick_reset" | "lesson";
};

export type InnerNodeChatResult = {
  content: string;
};

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
      console.error("[AI CLIENT] API returned", res.status);
      throw new Error("Bad response from API");
    }

    const data = await res.json();

    if (!data.content) {
      console.error("[AI CLIENT] API response missing content", data);
      throw new Error("No content returned");
    }

    return { content: data.content };
  } catch (err) {
    console.error("[AI CLIENT ERROR]", err);
    return {
      content:
        "I’m here with you. Something glitched on my side — please try again in a moment.",
    };
  }
}
