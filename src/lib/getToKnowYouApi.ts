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
    if ((row as any).question_id) {
      const qid = (row as any).question_id as string;
      const text = (row as any).answer_text as string | null;
      map[qid] = text ?? "";
    }
  }

  return map;
}

export type SaveGetToKnowYouPayload = {
  question_id: string;
  answer_text: string;
  answer_mode?: string;
};

export async function saveGetToKnowYouAnswers(
  userId: string,
  payload: SaveGetToKnowYouPayload[]
) {
  if (!payload.length) return;

  // Only use fields we are sure exist in the table
  const rows = payload.map((item) => ({
    user_id: userId,
    question_id: item.question_id,
    answer_text: item.answer_text,
  }));

  const { error } = await supabase
    .from("get_to_know_you_answers")
    .upsert(rows); // let Supabase pick the conflict target

  if (error) {
    console.error("Error saving get-to-know-you answers:", error);
    throw error;
  }
}


