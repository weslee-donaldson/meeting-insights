export interface Thread {
  id: string;
  client_name: string;
  title: string;
  shorthand: string;
  description: string;
  status: "open" | "resolved";
  summary: string;
  criteria_prompt: string;
  criteria_changed_at: string;
  created_at: string;
  updated_at: string;
}

export interface ThreadMeeting {
  thread_id: string;
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  relevance_summary: string;
  relevance_score: number;
  evaluated_at: string;
}

export interface ThreadMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  sources: string | null;
  context_stale: boolean;
  stale_details: string | null;
  created_at: string;
}
