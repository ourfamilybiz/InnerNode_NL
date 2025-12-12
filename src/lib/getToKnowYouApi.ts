// src/lib/getToKnowYouApi.ts
import { supabase } from "./supabaseClient";

export type GetToKnowYouAnswerRow = {
  id: string;
  user_id: string;
  question_id: string;
  answer_text: string | null;
  answer_mode: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchGetToKnowYouAnswers(userId: string) {
  const { data, error } = await supabase
    .from("get_to_know_you_answers")
    .select("question_id, answer_text")
    .eq("user_id", userId);

  if (error) {
    console.error("Error loading get-to-know-you answers:", error);
    throw error;
  }

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    // row is typed by Supabase as any-ish, but we selected these fields explicitly:
    const qid = (row as { question_id?: string }).question_id;
    if (!qid) continue;

    const text = (row as { answer_text?: string | null }).answer_text ?? "";
    map[qid] = text;
  }

  return map; // Record<question_id, answer_text>
}

export type SaveGetToKnowYouPayload = {
  question_id: string;
  answer_text: string;
  answer_mode?: string; // optional for future use
};

export async function saveGetToKnowYouAnswers(
  userId: string,
  payload: SaveGetToKnowYouPayload[]
) {
  if (!payload.length) return;

  // Store only fields we’re sure exist
  const rows = payload.map((item) => ({
    user_id: userId,
    question_id: item.question_id,
    answer_text: item.answer_text,
    // If you add the column later, you can safely enable this:
    // answer_mode: item.answer_mode ?? null,
  }));

  /**
   * IMPORTANT:
   * This requires a UNIQUE constraint on (user_id, question_id) in Supabase.
   * Example:
   *   ALTER TABLE public.get_to_know_you_answers
   *   ADD CONSTRAINT get_to_know_you_answers_user_question_unique
   *   UNIQUE (user_id, question_id);
   */
  const { error } = await supabase
    .from("get_to_know_you_answers")
    .upsert(rows, { onConflict: "user_id,question_id" });

  if (error) {
    console.error("Error saving get-to-know-you answers:", error);
    throw error;
  }
}


