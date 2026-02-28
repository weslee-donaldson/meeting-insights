export const CHANNELS = {
  GET_CLIENTS: "get-clients",
  GET_MEETINGS: "get-meetings",
  GET_ARTIFACT: "get-artifact",
  CHAT: "chat",
} as const;

export type ChannelName = (typeof CHANNELS)[keyof typeof CHANNELS];

export interface MeetingRow {
  id: string;
  title: string;
  date: string;
  client: string;
  series: string;
}

export interface ChatRequest {
  meetingIds: string[];
  question: string;
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

export interface ElectronAPI {
  getClients: () => Promise<string[]>;
  getMeetings: (filters: MeetingFilters) => Promise<MeetingRow[]>;
  getArtifact: (meetingId: string) => Promise<import("../src/extractor.js").Artifact | null>;
  chat: (req: ChatRequest) => Promise<ChatResponse>;
}
