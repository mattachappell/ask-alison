import { supabase } from "../db/supabase";

interface AnalyticsEvent {
  chat_id: string;
  user_question: string;
  topics_matched: string[];
  chunks_used: number;
}

export async function trackQuestion(event: AnalyticsEvent): Promise<void> {
  const { error } = await supabase.from("chat_analytics").insert({
    chat_id: event.chat_id,
    user_question: event.user_question,
    topics_matched: event.topics_matched,
    chunks_used: event.chunks_used,
  });

  if (error) {
    console.error("Failed to track analytics:", error.message);
  }
}
