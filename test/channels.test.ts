import { describe, it, expect } from "vitest";
import { CHANNELS } from "../electron-ui/electron/channels.js";
import type { SearchRequest, SearchResultRow, DeepSearchRequest, DeepSearchResultRow, CreateThreadRequest, UpdateThreadRequest, ThreadChatRequest, CreateInsightRequest, UpdateInsightRequest, InsightChatRequest, CreateMilestoneRequest, UpdateMilestoneRequest, MilestoneChatRequest, MilestoneChatResponse } from "../electron-ui/electron/channels.js";

describe("CHANNELS", () => {
  it("should have 77 unique non-empty channel strings", () => {
    const values = Object.values(CHANNELS);
    expect(values).toHaveLength(77);
    expect(new Set(values).size).toBe(77);
    for (const v of values) {
      expect(typeof v).toBe("string");
      expect(v.length).toBeGreaterThan(0);
    }
  });

  it("should define GET_CLIENTS channel", () => {
    expect(CHANNELS.GET_CLIENTS).toBe("get-clients");
  });

  it("should define GET_MEETINGS channel", () => {
    expect(CHANNELS.GET_MEETINGS).toBe("get-meetings");
  });

  it("should define GET_ARTIFACT channel", () => {
    expect(CHANNELS.GET_ARTIFACT).toBe("get-artifact");
  });

  it("should define CHAT channel", () => {
    expect(CHANNELS.CHAT).toBe("chat");
  });

  it("should define SEARCH_MEETINGS channel", () => {
    expect(CHANNELS.SEARCH_MEETINGS).toBe("search-meetings");
  });

  it("should define DELETE_MEETINGS channel", () => {
    expect(CHANNELS.DELETE_MEETINGS).toBe("delete-meetings");
  });

  it("should define RE_EXTRACT channel", () => {
    expect(CHANNELS.RE_EXTRACT).toBe("re-extract");
  });

  it("should define RE_EMBED_MEETING channel", () => {
    expect(CHANNELS.RE_EMBED_MEETING).toBe("re-embed-meeting");
  });

  it("should define REASSIGN_CLIENT channel", () => {
    expect(CHANNELS.REASSIGN_CLIENT).toBe("reassign-client");
  });

  it("should define SET_IGNORED channel", () => {
    expect(CHANNELS.SET_IGNORED).toBe("set-ignored");
  });

  it("should define COMPLETE_ACTION_ITEM channel", () => {
    expect(CHANNELS.COMPLETE_ACTION_ITEM).toBe("complete-action-item");
  });

  it("should define GET_COMPLETIONS channel", () => {
    expect(CHANNELS.GET_COMPLETIONS).toBe("get-completions");
  });

  it("should define GET_DEFAULT_CLIENT channel", () => {
    expect(CHANNELS.GET_DEFAULT_CLIENT).toBe("get-default-client");
  });

  it("SearchRequest has correct shape", () => {
    const req: SearchRequest = { query: "auth", client: "Acme", limit: 6 };
    expect(req.query).toBe("auth");
    expect(req.limit).toBe(6);
  });

  it("SearchResultRow has correct shape", () => {
    const row: SearchResultRow = {
      meeting_id: "abc",
      score: 0.9,
      client: "Acme",
      meeting_type: "DSU",
      date: "2026-01-01",
      cluster_tags: ["billing", "auth"],
      series: "daily standup",
    };
    expect(row).toEqual({
      meeting_id: "abc",
      score: 0.9,
      client: "Acme",
      meeting_type: "DSU",
      date: "2026-01-01",
      cluster_tags: ["billing", "auth"],
      series: "daily standup",
    });
  });

  it("should define GET_CLIENT_ACTION_ITEMS channel", () => {
    expect(CHANNELS.GET_CLIENT_ACTION_ITEMS).toBe("get-client-action-items");
  });

  it("ClientActionItem has correct shape", () => {
    const item: import("../electron-ui/electron/channels.js").ClientActionItem = {
      meeting_id: "m1",
      meeting_title: "Weekly Sync",
      meeting_date: "2026-01-01",
      item_index: 0,
      description: "Write tests",
      owner: "Alice",
      requester: "Bob",
      due_date: null,
      priority: "critical",
    };
    expect(item.priority).toBe("critical");
    expect(item.meeting_id).toBe("m1");
  });

  it("ConversationChatRequest carries includeTranscripts flag", () => {
    const req: import("../electron-ui/electron/channels.js").ConversationChatRequest = {
      meetingIds: [],
      messages: [],
      includeTranscripts: true,
    };
    expect(req.includeTranscripts).toBe(true);
  });

  it("should define GET_TEMPLATES channel", () => {
    expect(CHANNELS.GET_TEMPLATES).toBe("get-templates");
  });

  it("should define CREATE_MEETING channel", () => {
    expect(CHANNELS.CREATE_MEETING).toBe("create-meeting");
  });

  it("should define DEEP_SEARCH channel", () => {
    expect(CHANNELS.DEEP_SEARCH).toBe("deep-search");
  });

  it("DeepSearchRequest has correct shape", () => {
    const req: DeepSearchRequest = { meetingIds: ["m1", "m2"], query: "DLQ issue" };
    expect(req.meetingIds).toEqual(["m1", "m2"]);
    expect(req.query).toBe("DLQ issue");
  });

  it("DeepSearchResultRow has correct shape", () => {
    const row: DeepSearchResultRow = {
      meeting_id: "m1",
      relevanceSummary: "Evidence of DLQ discussion.",
      relevanceScore: 85,
    };
    expect(row.meeting_id).toBe("m1");
    expect(row.relevanceSummary).toBe("Evidence of DLQ discussion.");
    expect(row.relevanceScore).toBe(85);
  });

  it("ConversationChatRequest accepts optional template", () => {
    const req: import("../electron-ui/electron/channels.js").ConversationChatRequest = {
      meetingIds: [],
      messages: [],
      includeTranscripts: false,
      template: "jira-ticket",
    };
    expect(req.template).toBe("jira-ticket");
  });

  it("should define LIST_THREADS channel", () => {
    expect(CHANNELS.LIST_THREADS).toBe("list-threads");
  });

  it("should define CREATE_THREAD channel", () => {
    expect(CHANNELS.CREATE_THREAD).toBe("create-thread");
  });

  it("should define UPDATE_THREAD channel", () => {
    expect(CHANNELS.UPDATE_THREAD).toBe("update-thread");
  });

  it("should define DELETE_THREAD channel", () => {
    expect(CHANNELS.DELETE_THREAD).toBe("delete-thread");
  });

  it("CreateThreadRequest has correct shape", () => {
    const req: CreateThreadRequest = { client_name: "Acme", title: "Deploy", shorthand: "DEPLOY", description: "desc", criteria_prompt: "CI failures" };
    expect(req.client_name).toBe("Acme");
    expect(req.shorthand).toBe("DEPLOY");
  });

  it("UpdateThreadRequest has correct shape", () => {
    const req: UpdateThreadRequest = { title: "New title", status: "resolved" };
    expect(req.title).toBe("New title");
    expect(req.status).toBe("resolved");
  });

  it("should define GET_THREAD_MEETINGS channel", () => {
    expect(CHANNELS.GET_THREAD_MEETINGS).toBe("get-thread-meetings");
  });

  it("should define GET_THREAD_CANDIDATES channel", () => {
    expect(CHANNELS.GET_THREAD_CANDIDATES).toBe("get-thread-candidates");
  });

  it("should define EVALUATE_THREAD_CANDIDATES channel", () => {
    expect(CHANNELS.EVALUATE_THREAD_CANDIDATES).toBe("evaluate-thread-candidates");
  });

  it("should define THREAD_CHAT channel", () => {
    expect(CHANNELS.THREAD_CHAT).toBe("thread-chat");
  });

  it("should define GET_MEETING_THREADS channel", () => {
    expect(CHANNELS.GET_MEETING_THREADS).toBe("get-meeting-threads");
  });

  it("ThreadChatRequest has correct shape", () => {
    const req: ThreadChatRequest = { threadId: "t1", message: "What happened?", includeTranscripts: true };
    expect(req.threadId).toBe("t1");
    expect(req.includeTranscripts).toBe(true);
  });

  it("should define LIST_INSIGHTS channel", () => {
    expect(CHANNELS.LIST_INSIGHTS).toBe("list-insights");
  });

  it("should define CREATE_INSIGHT channel", () => {
    expect(CHANNELS.CREATE_INSIGHT).toBe("create-insight");
  });

  it("should define GENERATE_INSIGHT channel", () => {
    expect(CHANNELS.GENERATE_INSIGHT).toBe("generate-insight");
  });

  it("should define INSIGHT_CHAT channel", () => {
    expect(CHANNELS.INSIGHT_CHAT).toBe("insight-chat");
  });

  it("CreateInsightRequest has correct shape", () => {
    const req: CreateInsightRequest = { client_name: "Acme", period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" };
    expect(req.client_name).toBe("Acme");
    expect(req.period_type).toBe("week");
  });

  it("UpdateInsightRequest has correct shape", () => {
    const req: UpdateInsightRequest = { status: "final", rag_status: "green" };
    expect(req.status).toBe("final");
    expect(req.rag_status).toBe("green");
  });

  it("InsightChatRequest has correct shape", () => {
    const req: InsightChatRequest = { insightId: "i1", message: "Summarize", includeTranscripts: false };
    expect(req.insightId).toBe("i1");
    expect(req.message).toBe("Summarize");
  });

  it("should define LIST_MILESTONES channel", () => {
    expect(CHANNELS.LIST_MILESTONES).toBe("list-milestones");
  });

  it("should define CREATE_MILESTONE channel", () => {
    expect(CHANNELS.CREATE_MILESTONE).toBe("create-milestone");
  });

  it("should define UPDATE_MILESTONE channel", () => {
    expect(CHANNELS.UPDATE_MILESTONE).toBe("update-milestone");
  });

  it("should define DELETE_MILESTONE channel", () => {
    expect(CHANNELS.DELETE_MILESTONE).toBe("delete-milestone");
  });

  it("should define MILESTONE_CHAT channel", () => {
    expect(CHANNELS.MILESTONE_CHAT).toBe("milestone-chat");
  });

  it("should define GET_MILESTONE_MENTIONS channel", () => {
    expect(CHANNELS.GET_MILESTONE_MENTIONS).toBe("get-milestone-mentions");
  });

  it("should define CONFIRM_MILESTONE_MENTION channel", () => {
    expect(CHANNELS.CONFIRM_MILESTONE_MENTION).toBe("confirm-milestone-mention");
  });

  it("should define MERGE_MILESTONES channel", () => {
    expect(CHANNELS.MERGE_MILESTONES).toBe("merge-milestones");
  });

  it("should define GET_MEETING_MILESTONES channel", () => {
    expect(CHANNELS.GET_MEETING_MILESTONES).toBe("get-meeting-milestones");
  });

  it("CreateMilestoneRequest has correct shape", () => {
    const req: CreateMilestoneRequest = { clientName: "Acme", title: "Launch", targetDate: "2026-06-01", description: "Go-live" };
    expect(req.clientName).toBe("Acme");
    expect(req.title).toBe("Launch");
  });

  it("UpdateMilestoneRequest has correct shape", () => {
    const req: UpdateMilestoneRequest = { title: "New title", status: "tracked" };
    expect(req.title).toBe("New title");
    expect(req.status).toBe("tracked");
  });

  it("MilestoneChatRequest has correct shape", () => {
    const req: MilestoneChatRequest = { milestoneId: "ms1", message: "Status?", includeTranscripts: false };
    expect(req.milestoneId).toBe("ms1");
    expect(req.message).toBe("Status?");
  });

  it("should define RENAME_MEETING channel", () => {
    expect(CHANNELS.RENAME_MEETING).toBe("rename-meeting");
  });

  it("MilestoneChatResponse has correct shape", () => {
    const res: MilestoneChatResponse = { answer: "On track", sources: [{ id: "m1", label: "[M1]" }] };
    expect(res.answer).toBe("On track");
    expect(res.sources).toHaveLength(1);
  });

  it("should define GET_TRANSCRIPT channel", () => {
    expect(CHANNELS.GET_TRANSCRIPT).toBe("get-transcript");
  });

  it("should define ARTIFACT_BATCH channel", () => {
    expect(CHANNELS.ARTIFACT_BATCH).toBe("artifact-batch");
  });
});
