// src/lib/innernodeAiClient.ts

import { supabase } from "./supabaseClient";

// Basic message shape used by the “AI client”
export type InnerNodeRole = "system" | "user" | "assistant";

export type InnerNodeMessage = {
  role: InnerNodeRole;
  content: string;
};

export async function getUserPreferencesForAI(userId: string) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select(
      "preferred_name,pronouns,tone_preference,support_style,stress_lanes,avoidances,avoidances_custom,reminder_style,motivation_line,onboarding_completed"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[AI CLIENT] prefs fetch failed:", error.message);
    return null;
  }
  return data ?? null;
}

export type InnerNodeChatOptions = {
  /**
   * Hint so we can slightly vary tone depending on where it’s used:
   * - "companion" (InnerNode Companion chat)
   * - "quick_reset" (Equalizer / Quick Reset)
   * - "lesson" (lesson reflections, later)
   */
  modelHint?: "companion" | "quick_reset" | "lesson";

  /**
   * Optional preferences object (Get-To-Know-You / onboarding answers)
   * that gets injected into the chat API request.
   */
  preferences?: any;
};

export type InnerNodeChatResult = {
  content: string;
};

// Decide which base URL to call:
// - In local dev, we’ll use VITE_INNERNODE_API_BASE (your Vercel URL)
// - Otherwise, fall back to the current origin (works on Vercel itself)
const API_BASE =
  import.meta.env.VITE_INNERNODE_API_BASE ||
  (typeof window !== "undefined" ? window.location.origin : "");

export async function callInnerNodeChat(
  messages: InnerNodeMessage[],
  options?: InnerNodeChatOptions
): Promise<InnerNodeChatResult> {
  if (!API_BASE) {
    console.error("[AI CLIENT] Missing API base URL");
    return {
      content: "I’m here with you, but InnerNode’s brain isn’t reachable right now.",
    };
  }

  const url = `${API_BASE.replace(/\/$/, "")}/api/innernodeChat`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        modelHint: options?.modelHint,
        preferences: options?.preferences ?? null,
      }),
    });

    if (!res.ok) {
      console.error("[AI CLIENT] API returned", res.status);
      throw new Error(`Bad response from API (${res.status})`);
    }

    const json = (await res.json()) as {
      content?: string;
      error?: string;
    };

    if (json.error || !json.content) {
      console.error("[AI CLIENT] JSON error payload:", json);
      throw new Error(json.error || "No content in response");
    }

    return { content: json.content };
  } catch (err) {
    console.error("[AI CLIENT ERROR]", err);
    return {
      content:
        "I’m here with you, but something glitched trying to reach the brain behind InnerNode. Try again in a moment.",
    };
  }
}

