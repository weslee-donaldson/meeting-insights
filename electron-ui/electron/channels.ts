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
  EDIT_ACTION_ITEM: "edit-action-item",
  CREATE_ACTION_ITEM: "create-action-item",
  COMPLETE_ACTION_ITEM: "complete-action-item",
  CONVERSATION_CHAT: "conversation-chat",
  GET_MEETING_MESSAGES: "get-meeting-messages",
  CLEAR_MEETING_MESSAGES: "clear-meeting-messages",
  GET_COMPLETIONS: "get-completions",
  GET_ITEM_HISTORY: "get-item-history",
  GET_MENTION_STATS: "get-mention-stats",
  GET_DEFAULT_CLIENT: "get-default-client",
  GET_CLIENT_ACTION_ITEMS: "get-client-action-items",
  GET_TEMPLATES: "get-templates",
  CREATE_MEETING: "create-meeting",
  DEEP_SEARCH: "deep-search",
  LIST_THREADS: "list-threads",
  CREATE_THREAD: "create-thread",
  UPDATE_THREAD: "update-thread",
  DELETE_THREAD: "delete-thread",
  GET_THREAD_MEETINGS: "get-thread-meetings",
  GET_THREAD_CANDIDATES: "get-thread-candidates",
  EVALUATE_THREAD_CANDIDATES: "evaluate-thread-candidates",
  REMOVE_THREAD_MEETING: "remove-thread-meeting",
  REGENERATE_THREAD_SUMMARY: "regenerate-thread-summary",
  GET_THREAD_MESSAGES: "get-thread-messages",
  THREAD_CHAT: "thread-chat",
  CLEAR_THREAD_MESSAGES: "clear-thread-messages",
  ADD_THREAD_MEETING: "add-thread-meeting",
  GET_MEETING_THREADS: "get-meeting-threads",
  LIST_INSIGHTS: "list-insights",
  CREATE_INSIGHT: "create-insight",
  UPDATE_INSIGHT: "update-insight",
  DELETE_INSIGHT: "delete-insight",
  GET_INSIGHT_MEETINGS: "get-insight-meetings",
  DISCOVER_INSIGHT_MEETINGS: "discover-insight-meetings",
  GENERATE_INSIGHT: "generate-insight",
  GET_INSIGHT_MESSAGES: "get-insight-messages",
  INSIGHT_CHAT: "insight-chat",
  CLEAR_INSIGHT_MESSAGES: "clear-insight-messages",
  REMOVE_INSIGHT_MEETING: "remove-insight-meeting",
  LIST_MILESTONES: "list-milestones",
  CREATE_MILESTONE: "create-milestone",
  UPDATE_MILESTONE: "update-milestone",
  DELETE_MILESTONE: "delete-milestone",
  GET_MILESTONE_MENTIONS: "get-milestone-mentions",
  CONFIRM_MILESTONE_MENTION: "confirm-milestone-mention",
  REJECT_MILESTONE_MENTION: "reject-milestone-mention",
  MERGE_MILESTONES: "merge-milestones",
  LINK_MILESTONE_ACTION_ITEM: "link-milestone-action-item",
  UNLINK_MILESTONE_ACTION_ITEM: "unlink-milestone-action-item",
  GET_MILESTONE_ACTION_ITEMS: "get-milestone-action-items",
  MILESTONE_CHAT: "milestone-chat",
  GET_MILESTONE_MESSAGES: "get-milestone-messages",
  CLEAR_MILESTONE_MESSAGES: "clear-milestone-messages",
  GET_MEETING_MILESTONES: "get-meeting-milestones",
  GET_DATE_SLIPPAGE: "get-date-slippage",
  UPLOAD_ASSET: "upload-asset",
  GET_MEETING_ASSETS: "get-meeting-assets",
  DELETE_ASSET: "delete-asset",
  GET_ASSET_DATA: "get-asset-data",
  RENAME_MEETING: "rename-meeting",
  GET_TRANSCRIPT: "get-transcript",
  NOTES_LIST: "notes:list",
  NOTES_CREATE: "notes:create",
  NOTES_UPDATE: "notes:update",
  NOTES_DELETE: "notes:delete",
  NOTES_COUNT: "notes:count",
} as const;

export type ChannelName = (typeof CHANNELS)[keyof typeof CHANNELS];

export interface MeetingRow {
  id: string;
  title: string;
  date: string;
  client: string;
  series: string;
  actionItemCount: number;
  thread_tags?: Array<{ thread_id: string; title: string; shorthand: string }>;
  milestone_tags?: Array<{ milestone_id: string; title: string; target_date: string | null; status: string }>;
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
  noteIds?: string[];
  contextMode?: "full" | "distilled";
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
  canonical_id?: string;
  total_mentions?: number;
  short_id?: string;}

export interface EditActionItemFields {
  description?: string;
  owner?: string;
  requester?: string;
  due_date?: string | null;
  priority?: "critical" | "normal" | "low";
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

export interface CreateThreadRequest {
  client_name: string;
  title: string;
  shorthand: string;
  description: string;
  criteria_prompt: string;
  keywords?: string;
}

export interface UpdateThreadRequest {
  title?: string;
  shorthand?: string;
  description?: string;
  status?: "open" | "resolved";
  summary?: string;
  criteria_prompt?: string;
  keywords?: string;
}

export interface ThreadChatRequest {
  threadId: string;
  message: string;
  includeTranscripts?: boolean;
  attachments?: { name: string; base64: string; mimeType: string }[];
}

export interface SourceRef {
  id: string;
  label: string;
}

export interface ThreadChatResponse {
  answer: string;
  sources: SourceRef[];
}

export interface CreateInsightRequest {
  client_name: string;
  name?: string;
  period_type: "day" | "week" | "month";
  period_start: string;
  period_end: string;
}

export interface UpdateInsightRequest {
  name?: string;
  status?: "draft" | "final";
  rag_status?: "red" | "yellow" | "green";
  rag_rationale?: string;
  executive_summary?: string;
  topic_details?: string;
}

export interface InsightChatRequest {
  insightId: string;
  message: string;
  includeTranscripts?: boolean;
  attachments?: { name: string; base64: string; mimeType: string }[];
}

export interface InsightChatResponse {
  answer: string;
  sources: SourceRef[];
}

export interface CreateMilestoneRequest {
  clientName: string;
  title: string;
  targetDate?: string;
  description?: string;
}

export interface UpdateMilestoneRequest {
  title?: string;
  description?: string;
  targetDate?: string | null;
  status?: "identified" | "tracked" | "completed" | "missed" | "deferred";
}

export interface MilestoneChatRequest {
  milestoneId: string;
  message: string;
  includeTranscripts?: boolean;
  attachments?: { name: string; base64: string; mimeType: string }[];
}

export interface MilestoneChatResponse {
  answer: string;
  sources: SourceRef[];
}

export interface ElectronAPI {
  getClients: () => Promise<string[]>;
  getMeetings: (filters: MeetingFilters) => Promise<MeetingRow[]>;
  getArtifact: (meetingId: string) => Promise<import("../../core/extractor.js").Artifact | null>;
  chat: (req: ChatRequest) => Promise<ChatResponse>;
  conversationChat: (req: ConversationChatRequest) => Promise<ConversationChatResponse>;
  getMeetingMessages: (meetingId: string) => Promise<import("../../core/meeting-messages.js").MeetingMessage[]>;
  meetingChat: (meetingId: string, message: string, includeTranscripts?: boolean, template?: string, includeAssets?: boolean, attachments?: { name: string; base64: string; mimeType: string }[], noteIds?: string[]) => Promise<ConversationChatResponse>;
  clearMeetingMessages: (meetingId: string) => Promise<void>;
  search: (req: SearchRequest) => Promise<SearchResultRow[]>;
  deleteMeetings: (ids: string[]) => Promise<void>;
  reExtract: (meetingId: string) => Promise<void>;
  reEmbedMeeting: (meetingId: string) => Promise<void>;
  reassignClient: (meetingId: string, clientName: string) => Promise<void>;
  setIgnored: (meetingId: string, ignored: boolean) => Promise<void>;
  editActionItem: (meetingId: string, itemIndex: number, fields: EditActionItemFields) => Promise<void>;
  updateArtifactSection: (meetingId: string, field: string, value: unknown) => Promise<void>;
  createActionItem: (meetingId: string, fields: EditActionItemFields) => Promise<void>;
  completeActionItem: (meetingId: string, itemIndex: number, note: string) => Promise<void>;
  uncompleteActionItem: (meetingId: string, itemIndex: number) => Promise<void>;
  getCompletions: (meetingId: string) => Promise<ActionItemCompletion[]>;
  getItemHistory: (canonicalId: string) => Promise<ItemHistoryEntry[]>;
  getMentionStats: (meetingId: string) => Promise<MentionStat[]>;
  getDefaultClient: () => Promise<string | null>;
  getClientActionItems: (clientName: string, filters?: { after?: string; before?: string }) => Promise<ClientActionItem[]>;
  getTemplates: () => Promise<string[]>;
  createMeeting: (req: CreateMeetingRequest) => Promise<{ meetingId: string }>;
  deepSearch: (req: DeepSearchRequest) => Promise<DeepSearchResultRow[]>;
  listThreads: (clientName: string) => Promise<import("../../core/threads.js").Thread[]>;
  createThread: (req: CreateThreadRequest) => Promise<import("../../core/threads.js").Thread>;
  updateThread: (threadId: string, req: UpdateThreadRequest) => Promise<import("../../core/threads.js").Thread>;
  deleteThread: (threadId: string) => Promise<void>;
  getThreadMeetings: (threadId: string) => Promise<import("../../core/threads.js").ThreadMeeting[]>;
  getThreadCandidates: (threadId: string) => Promise<Array<{ meeting_id: string; title: string; date: string; similarity: number }>>;
  evaluateThreadCandidates: (threadId: string, meetingIds: string[], overrideExisting: boolean) => Promise<{ added: number; updated: number; errors: Array<{ meetingId: string; reason: string }> }>;
  removeThreadMeeting: (threadId: string, meetingId: string) => Promise<void>;
  regenerateThreadSummary: (threadId: string, meetingIds?: string[]) => Promise<{ summary: string }>;
  getThreadMessages: (threadId: string) => Promise<import("../../core/threads.js").ThreadMessage[]>;
  threadChat: (req: ThreadChatRequest) => Promise<ThreadChatResponse>;
  clearThreadMessages: (threadId: string) => Promise<void>;
  addThreadMeeting: (threadId: string, meetingId: string, summary: string, score: number) => Promise<void>;
  getMeetingThreads: (meetingId: string) => Promise<Array<{ thread_id: string; title: string; shorthand: string }>>;
  listInsights: (clientName: string) => Promise<import("../../core/insights.js").Insight[]>;
  createInsight: (req: CreateInsightRequest) => Promise<import("../../core/insights.js").Insight>;
  updateInsight: (insightId: string, req: UpdateInsightRequest) => Promise<import("../../core/insights.js").Insight>;
  deleteInsight: (insightId: string) => Promise<void>;
  getInsightMeetings: (insightId: string) => Promise<import("../../core/insights.js").InsightMeeting[]>;
  discoverInsightMeetings: (insightId: string) => Promise<string[]>;
  generateInsight: (insightId: string, meetingIds?: string[]) => Promise<import("../../core/insights.js").Insight>;
  getInsightMessages: (insightId: string) => Promise<import("../../core/insights.js").InsightMessage[]>;
  insightChat: (req: InsightChatRequest) => Promise<InsightChatResponse>;
  clearInsightMessages: (insightId: string) => Promise<void>;
  removeInsightMeeting: (insightId: string, meetingId: string) => Promise<void>;
  listMilestones: (clientName: string) => Promise<import("../../core/timelines.js").Milestone[]>;
  createMilestone: (req: CreateMilestoneRequest) => Promise<import("../../core/timelines.js").Milestone>;
  updateMilestone: (milestoneId: string, req: UpdateMilestoneRequest) => Promise<import("../../core/timelines.js").Milestone>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
  getMilestoneMentions: (milestoneId: string) => Promise<import("../../core/timelines.js").MilestoneMention[]>;
  confirmMilestoneMention: (milestoneId: string, meetingId: string) => Promise<void>;
  rejectMilestoneMention: (milestoneId: string, meetingId: string) => Promise<void>;
  mergeMilestones: (sourceId: string, targetId: string) => Promise<void>;
  linkMilestoneActionItem: (milestoneId: string, meetingId: string, itemIndex: number) => Promise<void>;
  unlinkMilestoneActionItem: (milestoneId: string, meetingId: string, itemIndex: number) => Promise<void>;
  getMilestoneActionItems: (milestoneId: string) => Promise<import("../../core/timelines.js").MilestoneActionItem[]>;
  milestoneChat: (req: MilestoneChatRequest) => Promise<MilestoneChatResponse>;
  getMilestoneMessages: (milestoneId: string) => Promise<import("../../core/timelines.js").MilestoneMessage[]>;
  clearMilestoneMessages: (milestoneId: string) => Promise<void>;
  getMeetingMilestones: (meetingId: string) => Promise<Array<{ milestone_id: string; title: string; target_date: string | null; status: string }>>;
  getDateSlippage: (milestoneId: string) => Promise<import("../../core/timelines.js").DateSlippageEntry[]>;
  uploadAsset: (meetingId: string, filename: string, mimeType: string, base64: string) => Promise<import("../../core/assets.js").AssetRow>;
  getMeetingAssets: (meetingId: string) => Promise<import("../../core/assets.js").AssetRow[]>;
  deleteAsset: (assetId: string) => Promise<void>;
  getAssetData: (assetId: string) => Promise<{ data: string; filename: string; mimeType: string } | null>;
  renameMeeting: (meetingId: string, newTitle: string) => Promise<void>;
  getTranscript: (meetingId: string) => Promise<string | null>;
  notesList: (objectType: string, objectId: string) => Promise<import("../../core/notes.js").Note[]>;
  notesCreate: (objectType: string, objectId: string, title: string | null, body: string, noteType?: string) => Promise<import("../../core/notes.js").Note>;
  notesUpdate: (id: string, title?: string | null, body?: string) => Promise<import("../../core/notes.js").Note>;
  notesDelete: (id: string) => Promise<void>;
  notesCount: (objectType: string, objectId: string) => Promise<number>;
}
