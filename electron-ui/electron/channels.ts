export const CHANNELS = {
  GET_CLIENTS: "get-clients",
  GET_MEETINGS: "get-meetings",
  GET_ARTIFACT: "get-artifact",
  CHAT: "chat",
  SEARCH_MEETINGS: "search-meetings",
  DELETE_MEETINGS: "delete-meetings",
  RE_EXTRACT: "re-extract",
  RE_EMBED_MEETING: "re-embed-meeting",
  REASSIGN_CLIENT: "reassign-client",
  SET_IGNORED: "set-ignored",
  COMPLETE_ACTION_ITEM: "complete-action-item",
  CONVERSATION_CHAT: "conversation-chat",
  GET_COMPLETIONS: "get-completions",
  GET_ITEM_HISTORY: "get-item-history",
  GET_MENTION_STATS: "get-mention-stats",
  GET_DEFAULT_CLIENT: "get-default-client",
  GET_CLIENT_ACTION_ITEMS: "get-client-action-items",
  GET_TEMPLATES: "get-templates",
  CREATE_MEETING: "create-meeting",
  DEEP_SEARCH: "deep-search",
} as const;

export type ChannelName = (typeof CHANNELS)[keyof typeof CHANNELS];

export interface MeetingRow {
  id: string;
  title: string;
  date: string;
  client: string;
  series: string;
  actionItemCount: number;
}

export interface ChatRequest {
  meetingIds: string[];
  question: string;
  attachments?: { name: string; base64: string; mimeType: string }[];
}

export interface ChatResponse {
  answer: string;
  sources: string[];
  charCount: number;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationChatRequest {
  meetingIds: string[];
  messages: ConversationMessage[];
  attachments?: { name: string; base64: string; mimeType: string }[];
  includeTranscripts?: boolean;
  template?: string;
}

export interface ConversationChatResponse {
  answer: string;
  sources: string[];
  charCount: number;
}

export interface MeetingFilters {
  client?: string;
  after?: string;
  before?: string;
}

export interface SearchRequest {
  query: string;
  client?: string;
  date_after?: string;
  date_before?: string;
  limit?: number;
}

export interface SearchResultRow {
  meeting_id: string;
  score: number;
  client: string;
  meeting_type: string;
  date: string;
}

export interface ActionItemCompletion {
  id: string;
  meeting_id: string;
  item_index: number;
  completed_at: string;
  note: string;
}

export interface ItemHistoryEntry {
  canonical_id: string;
  meeting_id: string;
  item_type: string;
  item_index: number;
  item_text: string;
  first_mentioned_at: string;
  meeting_title: string;
  meeting_date: string;
}

export interface MentionStat {
  canonical_id: string;
  item_type: string;
  item_index: number;
  mention_count: number;
  first_mentioned_at: string;
}

export interface ClientActionItem {
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  item_index: number;
  description: string;
  owner: string;
  requester: string;
  due_date: string | null;
  priority: "critical" | "normal";
}

export type TranscriptFormat = "krisp" | "webvtt";

export interface CreateMeetingRequest {
  clientName: string;
  date: string;
  title: string;
  rawTranscript: string;
  format: TranscriptFormat;
}

export interface DeepSearchRequest {
  meetingIds: string[];
  query: string;
}

export interface DeepSearchResultRow {
  meeting_id: string;
  relevanceSummary: string;
  relevanceScore: number;
}

export interface ElectronAPI {
  getClients: () => Promise<string[]>;
  getMeetings: (filters: MeetingFilters) => Promise<MeetingRow[]>;
  getArtifact: (meetingId: string) => Promise<import("../../core/extractor.js").Artifact | null>;
  chat: (req: ChatRequest) => Promise<ChatResponse>;
  conversationChat: (req: ConversationChatRequest) => Promise<ConversationChatResponse>;
  search: (req: SearchRequest) => Promise<SearchResultRow[]>;
  deleteMeetings: (ids: string[]) => Promise<void>;
  reExtract: (meetingId: string) => Promise<void>;
  reEmbedMeeting: (meetingId: string) => Promise<void>;
  reassignClient: (meetingId: string, clientName: string) => Promise<void>;
  setIgnored: (meetingId: string, ignored: boolean) => Promise<void>;
  completeActionItem: (meetingId: string, itemIndex: number, note: string) => Promise<void>;
  uncompleteActionItem: (meetingId: string, itemIndex: number) => Promise<void>;
  getCompletions: (meetingId: string) => Promise<ActionItemCompletion[]>;
  getItemHistory: (canonicalId: string) => Promise<ItemHistoryEntry[]>;
  getMentionStats: (meetingId: string) => Promise<MentionStat[]>;
  getDefaultClient: () => Promise<string | null>;
  getClientActionItems: (clientName: string) => Promise<ClientActionItem[]>;
  getTemplates: () => Promise<string[]>;
  createMeeting: (req: CreateMeetingRequest) => Promise<{ meetingId: string }>;
  deepSearch: (req: DeepSearchRequest) => Promise<DeepSearchResultRow[]>;
}
