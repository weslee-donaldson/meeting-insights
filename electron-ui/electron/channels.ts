export const CHANNELS = {
  GET_CLIENTS: "get-clients",
  GET_MEETINGS: "get-meetings",
  GET_ARTIFACT: "get-artifact",
  CHAT: "chat",
  SEARCH_MEETINGS: "search-meetings",
  DELETE_MEETINGS: "delete-meetings",
  RE_EXTRACT: "re-extract",
  REASSIGN_CLIENT: "reassign-client",
  SET_IGNORED: "set-ignored",
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

export interface ElectronAPI {
  getClients: () => Promise<string[]>;
  getMeetings: (filters: MeetingFilters) => Promise<MeetingRow[]>;
  getArtifact: (meetingId: string) => Promise<import("../../core/extractor.js").Artifact | null>;
  chat: (req: ChatRequest) => Promise<ChatResponse>;
  search: (req: SearchRequest) => Promise<SearchResultRow[]>;
  deleteMeetings: (ids: string[]) => Promise<void>;
  reExtract: (meetingId: string) => Promise<void>;
  reassignClient: (meetingId: string, clientName: string) => Promise<void>;
  setIgnored: (meetingId: string, ignored: boolean) => Promise<void>;
}
