// api/innernodeChat.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

type InnerNodeRole = "system" | "user" | "assistant";

type InnerNodeMessage = {
  role: InnerNodeRole;
  content: string;
};

type InnerNodeChatBody = {
  messages: InnerNodeMessage[];
  modelHint?: "companion" | "quick_reset" | "lesson";
};

function buildSystemPrompt(modelHint?: string): string {
  if (modelHint === "quick_reset") {
    return `
You are InnerNode's Equalizer — a grounded, non-judgmental reset guide.
Your job: help the user interrupt impulsive reactions, regulate their nervous system,
and find one or two tiny, realistic next steps.

Tone:
- Calm, practical, human.
- No therapy jargon, no fake hype.
- One paragraph plus 2–3 short bullet suggestions is enough.

Safety:
- If you detect self-harm or harm-to-others, gently encourage reaching out
  to crisis resources or a trusted person. Do NOT give instructions for harm.
`;
  }

  if (modelHint === "lesson") {
    return `
You are InnerNode's lesson reflection guide.
Your job: connect the lesson concept to the user's real life
using simple language, concrete examples, and 1–2 reflection questions.
Keep replies short and readable.
`;
  }

  // default: Companion
  return `
You are the InnerNode Companion: a grounded, kind presence.
You listen first, reflect what you heard in plain language, and then offer
one or two practical next steps the user could actually take today.
No therapy-speak, no toxic positivity. Sound like a real human friend
with good emotional intelligence.
`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("[innernodeChat] Missing OPENAI_API_KEY env var");
    res.status(500).json({
      error: "InnerNode had trouble responding. Try again soon.",
      detail: "OPENAI_API_KEY is not set on the server.",
    });
    return;
  }

  try {
    const body = req.body as InnerNodeChatBody;

    if (!body?.messages || !Array.isArray(body.messages)) {
      res.status(400).json({ error: "Missing messages array" });
      return;
    }

    const systemPrompt = buildSystemPrompt(body.modelHint);

    const messagesForModel: InnerNodeMessage[] = [
      { role: "system", content: systemPrompt },
      ...body.messages,
    ];

    // --- Plain fetch to OpenAI Chat Completions ---
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: messagesForModel,
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error("[innernodeChat] OpenAI error:", data);
      res.status(500).json({
        error: "InnerNode had trouble responding. Try again soon.",
        detail:
          data?.error?.message ??
          data?.message ??
          JSON.stringify(data ?? {}),
      });
      return;
    }

    const content: string =
      data?.choices?.[0]?.message?.content?.trim() ??
      "I’m here with you. Something glitched on my side—try again in a moment.";

    res.status(200).json({ content });
  } catch (err: any) {
    console.error("[innernodeChat] error:", err);
    res.status(500).json({
      error: "InnerNode had trouble responding. Try again soon.",
      detail:
        err?.message ??
        (typeof err === "string" ? err : JSON.stringify(err ?? {})),
    });
  }
}
