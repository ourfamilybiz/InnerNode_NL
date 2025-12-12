// src/lib/feedbackApi.ts
import { supabase } from "./supabaseClient";

export type FeedbackType = "bug" | "idea" | "confusion" | "praise" | "general";

export async function submitTesterFeedback(params: {
  userId: string;
  message: string;
  feedbackType?: FeedbackType;
  page?: string;
  device?: string;
  appVersion?: string;
}) {
  const payload = {
    user_id: params.userId,
    message: params.message,
    feedback_type: params.feedbackType ?? "general",
    page: params.page ?? null,
    device: params.device ?? null,
    app_version: params.appVersion ?? null,
  };

  const { error } = await supabase.from("tester_feedback").insert([payload]);

  if (error) throw error;
}
