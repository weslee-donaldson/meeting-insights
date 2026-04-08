import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting, getMeeting } from "../core/ingest.js";
import { storeArtifact, generateShortId } from "../core/extractor.js";
import { storeDetection } from "../core/client-detection.js";
import { createLlmAdapter, type LlmAdapter } from "../core/llm-adapter.js";
import { createThread, addThreadMeeting, appendThreadMessage, getThreadMessages } from "../core/threads.js";
import { listMilestonesByClient, createMilestone, addMilestoneMention } from "../core/timelines.js";
import {
  handleGetClients,
  handleGetClientList,
  handleGetClientDetail,
  handleGetMeetings,
  handleGetArtifact,
  handleChat,
  handleConversationChat,
  handleDeleteMeetings,
  handleReExtract,
  handleReassignClient,
  handleSetIgnored,
  handleEditActionItem,
  handleCreateActionItem,
  handleCompleteActionItem,
  handleUncompleteActionItem,
  handleGetCompletions,
  handleGetClientActionItems,
  handleGetTemplates,
  handleCreateMeeting,
  handleDeepSearch,
  handleListThreads,
  handleCreateThread,
  handleUpdateThread,
  handleDeleteThread,
  handleGetThreadMeetings,
  handleRemoveThreadMeeting,
  handleRegenerateThreadSummary,
  handleGetThreadMessages,
  handleClearThreadMessages,
  handleGetMeetingThreads,
  handleListMilestones,
  handleCreateMilestone,
  handleUpdateMilestone,
  handleDeleteMilestone,
  handleGetMilestoneMentions,
  handleGetMeetingMilestones,
  handleGetDateSlippage,
  handleGetMilestoneMessages,
  handleClearMilestoneMessages,
  handleRenameMeeting,
  handleGetHealth,
  handleAcknowledgeHealthErrors,
} from "../electron-ui/electron/ipc-handlers.js";

function seedClientsRaw(db: ReturnType<typeof createDb>) {
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run(
    "Acme", JSON.stringify(["Acme Corp"]), JSON.stringify(["@acme.com"]), "client-acme",
  );
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run(
    "Beta Co", JSON.stringify(["Beta"]), JSON.stringify(["@beta.io"]), "client-beta",
  );
}

function makeArtifact() {
  return {
    summary: "Key decisions were made.",
    decisions: [{ text: "Go with approach A", decided_by: "CEO" }],
    proposed_features: ["Dark mode"],
    action_items: [{ description: "Write spec", owner: "Bob", requester: "Alice", due_date: "2026-03-01" }],
    open_questions: ["When to ship?"],
    risk_items: ["Timeline risk"],
    additional_notes: [],
  };
}

describe("IPC handlers", () => {
  let db: ReturnType<typeof createDb>;
  let meetingId1: string;
  let meetingId2: string;

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);
    seedClientsRaw(db);

    meetingId1 = ingestMeeting(db, {
      title: "Acme DSU",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [{ id: "1", first_name: "A", last_name: "B", email: "a@acme.com" }],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "acme-dsu-1",
    });
    storeArtifact(db, meetingId1, makeArtifact());
    storeDetection(db, meetingId1, [
      { client_name: "Acme", client_id: "client-acme", confidence: 0.8, method: "participant" },
    ]);

    meetingId2 = ingestMeeting(db, {
      title: "Beta Planning",
      timestamp: "2026-02-25T10:00:00.000Z",
      participants: [{ id: "2", first_name: "C", last_name: "D", email: "c@beta.io" }],
      rawTranscript: "C | 00:00\nHi.",
      turns: [],
      sourceFilename: "beta-plan-1",
    });
    storeArtifact(db, meetingId2, makeArtifact());
    storeDetection(db, meetingId2, [
      { client_name: "Beta Co", client_id: "client-beta", confidence: 0.9, method: "participant" },
    ]);
  });

  describe("handleGetClients", () => {
    it("should return sorted list of client names", () => {
      const clients = handleGetClients(db);
      expect(clients).toEqual(["Acme", "Beta Co"]);
    });
  });

  describe("handleGetClientList", () => {
    it("should return sorted list of {id, name} objects", () => {
      const list = handleGetClientList(db);
      expect(list).toEqual([
        { id: "client-acme", name: "Acme" },
        { id: "client-beta", name: "Beta Co" },
      ]);
    });
  });

  describe("handleGetClientDetail", () => {
    it("should return parsed client detail for a valid id", () => {
      const detail = handleGetClientDetail(db, "client-acme");
      expect(detail).toEqual({
        id: "client-acme",
        name: "Acme",
        aliases: ["Acme Corp"],
        client_team: [],
        implementation_team: [],
        meeting_names: [],
        glossary_count: 0,
      });
    });

    it("should return null for an unknown id", () => {
      const detail = handleGetClientDetail(db, "nonexistent");
      expect(detail).toBeNull();
    });
  });

  describe("handleGetMeetings", () => {
    it("should return all meetings with id, title, date, client, series", () => {
      const meetings = handleGetMeetings(db, {});
      expect(meetings).toHaveLength(2);
      expect(meetings[0]).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        date: expect.any(String),
        client: expect.any(String),
        series: expect.any(String),
      });
    });

    it("should filter meetings by client", () => {
      const meetings = handleGetMeetings(db, { client: "Acme" });
      expect(meetings).toHaveLength(1);
      expect(meetings[0].title).toBe("Acme DSU");
    });

    it("should exclude meeting where selected client is not the top detection", () => {
      const mid = ingestMeeting(db, {
        title: "Shared Meeting",
        timestamp: "2026-02-24T15:00:00.000Z",
        participants: [],
        rawTranscript: "Hello.",
        turns: [],
        sourceFilename: "shared-meeting-1",
      });
      storeDetection(db, mid, [
        { client_name: "Acme", client_id: "client-acme", confidence: 0.3, method: "title" },
        { client_name: "Beta Co", client_id: "client-beta", confidence: 0.9, method: "participant" },
      ]);
      try {
        const acmeMeetings = handleGetMeetings(db, { client: "Acme" });
        expect(acmeMeetings.find((m) => m.id === mid)).toBeUndefined();
        const betaMeetings = handleGetMeetings(db, { client: "Beta Co" });
        expect(betaMeetings.find((m) => m.id === mid)).toBeDefined();
      } finally {
        db.prepare("DELETE FROM client_detections WHERE meeting_id = ?").run(mid);
        db.prepare("DELETE FROM meetings WHERE id = ?").run(mid);
      }
    });

    it("should filter meetings by after date", () => {
      const meetings = handleGetMeetings(db, { after: "2026-02-25" });
      expect(meetings).toHaveLength(1);
      expect(meetings[0].title).toBe("Beta Planning");
    });

    it("should filter meetings by before date", () => {
      const meetings = handleGetMeetings(db, { before: "2026-02-24" });
      expect(meetings).toHaveLength(1);
      expect(meetings[0].title).toBe("Acme DSU");
    });

    it("should return meetings sorted newest first", () => {
      const meetings = handleGetMeetings(db, {});
      expect(meetings[0].date > meetings[1].date).toBe(true);
    });

    it("should set series as normalized lowercase title", () => {
      const meetings = handleGetMeetings(db, {});
      for (const m of meetings) {
        expect(m.series).toBe(m.title.toLowerCase().trim());
      }
    });

    it("should include actionItemCount from artifact", () => {
      const meetings = handleGetMeetings(db, {});
      for (const m of meetings) {
        expect(m.actionItemCount).toBe(1);
      }
    });

    it("should include thread_tags for meetings linked to threads", () => {
      const thread = createThread(db, {
        client_name: "Acme",
        client_id: "client-acme",
        title: "AI Access Policy",
        shorthand: "ai-policy",
        description: "Track AI access concerns",
        criteria_prompt: "",
        keywords: "AI AWS",
      });
      addThreadMeeting(db, {
        thread_id: thread.id,
        meeting_id: meetingId1,
        relevance_summary: "Relevant",
        relevance_score: 80,
      });
      try {
        const meetings = handleGetMeetings(db, {});
        const m1 = meetings.find((r) => r.id === meetingId1)!;
        expect(m1.thread_tags).toEqual([{ thread_id: thread.id, title: "AI Access Policy", shorthand: "ai-policy" }]);
        const m2 = meetings.find((r) => r.id === meetingId2)!;
        expect(m2.thread_tags).toEqual([]);
      } finally {
        db.prepare("DELETE FROM thread_meetings WHERE thread_id = ?").run(thread.id);
        db.prepare("DELETE FROM threads WHERE id = ?").run(thread.id);
      }
    });

    it("should include milestone_tags for meetings with milestone mentions", () => {
      const ms = createMilestone(db, { clientId: "client-acme", title: "Platform Launch", targetDate: "2026-06-01", description: "Phase 1 go-live" });
      addMilestoneMention(db, { milestoneId: ms.id, meetingId: meetingId1, mentionType: "introduced", excerpt: "First discussion", targetDateAtMention: "2026-06-01", mentionedAt: "2026-01-15" });
      try {
        const meetings = handleGetMeetings(db, {});
        const m1 = meetings.find((r) => r.id === meetingId1)!;
        expect(m1.milestone_tags).toEqual([{ milestone_id: ms.id, title: "Platform Launch", target_date: "2026-06-01", status: "identified" }]);
        const m2 = meetings.find((r) => r.id === meetingId2)!;
        expect(m2.milestone_tags).toEqual([]);
      } finally {
        db.prepare("DELETE FROM milestone_mentions WHERE milestone_id = ?").run(ms.id);
        db.prepare("DELETE FROM milestones WHERE id = ?").run(ms.id);
      }
    });

    it("should return actionItemCount of 0 for meeting with no artifact", () => {
      const noArtifactId = ingestMeeting(db, {
        title: "No Artifact Meeting",
        timestamp: "2026-02-20T10:00:00.000Z",
        participants: [],
        rawTranscript: "X | 00:00\nHi.",
        turns: [],
        sourceFilename: "no-artifact",
      });
      const meetings = handleGetMeetings(db, {});
      const m = meetings.find((r) => r.id === noArtifactId)!;
      expect(m.actionItemCount).toBe(0);
    });
  });

  describe("handleGetArtifact", () => {
    it("should return parsed artifact with normalized priority and risk_items", () => {
      const artifact = handleGetArtifact(db, meetingId1);
      expect(artifact).toEqual({
        summary: "Key decisions were made.",
        decisions: [{ text: "Go with approach A", decided_by: "CEO" }],
        proposed_features: ["Dark mode"],
        action_items: [{ description: "Write spec", owner: "Bob", requester: "Alice", due_date: "2026-03-01", priority: "normal", short_id: generateShortId(meetingId1, 0) }],
        open_questions: ["When to ship?"],
        risk_items: [{ category: "engineering", description: "Timeline risk" }],
        additional_notes: [],
      });
    });

    it("should return null for unknown meeting", () => {
      const artifact = handleGetArtifact(db, "nonexistent");
      expect(artifact).toBeNull();
    });
  });

  describe("handleChat", () => {
    it("should return answer, sources, and charCount from stub LLM", async () => {
      const llm = createLlmAdapter({ type: "stub" });
      const result = await handleChat(db, llm, {
        meetingIds: [meetingId1],
        question: "What decisions were made?",
      });
      expect(result).toMatchObject({
        answer: expect.any(String),
        sources: expect.any(Array),
        charCount: expect.any(Number),
      });
      expect(result.answer.length).toBeGreaterThan(0);
      expect(result.charCount).toBeGreaterThan(0);
    });

    it("should return empty sources for no meeting IDs", async () => {
      const llm = createLlmAdapter({ type: "stub" });
      const result = await handleChat(db, llm, {
        meetingIds: [],
        question: "Anything?",
      });
      expect(result.sources).toEqual([]);
    });

    it("forwards attachments to LLM adapter", async () => {
      let capturedAttachments: unknown;
      const spyLlm: LlmAdapter = {
        async complete(_cap, _content, attachments) {
          capturedAttachments = attachments;
          return { answer: "ok" };
        },
      };
      await handleChat(db, spyLlm, {
        meetingIds: [],
        question: "Describe this image.",
        attachments: [{ name: "shot.png", base64: "abc123", mimeType: "image/png" }],
      });
      expect(capturedAttachments).toEqual([
        { name: "shot.png", base64: "abc123", mimeType: "image/png" },
      ]);
    });
  });

  describe("handleConversationChat", () => {
    it("uses distilled context by default (no includeTranscripts)", async () => {
      let capturedSystem = "";
      const spyLlm: LlmAdapter = {
        async complete() { return { answer: "" }; },
        async converse(system) { capturedSystem = system; return "Distilled answer."; },
      };
      const result = await handleConversationChat(db, spyLlm, {
        meetingIds: [meetingId2],
        messages: [{ role: "user", content: "What was decided?" }],
      });
      expect(result.charCount).toBeGreaterThan(0);
      expect(capturedSystem).toContain("meeting intelligence assistant");
      expect(capturedSystem).toContain("## Beta Planning");
      expect(capturedSystem).toContain("Summary:");
    });

    it("uses labeled context when includeTranscripts is true", async () => {
      let capturedSystem = "";
      let capturedMessages: Array<{ role: string; content: string }> = [];
      const spyLlm: LlmAdapter = {
        async complete() { return { answer: "" }; },
        async converse(system, messages) {
          capturedSystem = system;
          capturedMessages = messages;
          return "The team decided to go with approach A [M1].";
        },
      };
      const result = await handleConversationChat(db, spyLlm, {
        meetingIds: [meetingId2],
        messages: [{ role: "user", content: "What was decided?" }],
        includeTranscripts: true,
      });
      expect(result.answer).toContain("The team decided to go with approach A Beta Planning (");
      expect(result.sources).toEqual(["Beta Planning"]);
      expect(result.charCount).toBeGreaterThan(0);
      expect(capturedSystem).toContain("meeting intelligence assistant");
      expect(capturedSystem).toContain("[M1]");
      expect(capturedMessages).toEqual([{ role: "user", content: "What was decided?" }]);
    });

    it("returns empty sources when no meetingIds provided", async () => {
      const spyLlm: LlmAdapter = {
        async complete() { return { answer: "" }; },
        async converse() { return "No context available."; },
      };
      const result = await handleConversationChat(db, spyLlm, {
        meetingIds: [],
        messages: [{ role: "user", content: "Hello" }],
      });
      expect(result.answer).toBe("No context available.");
      expect(result.sources).toEqual([]);
    });

    it("injects template content with directive into system prompt when template is set", async () => {
      let capturedSystem = "";
      const spyLlm: LlmAdapter = {
        async complete() { return { answer: "" }; },
        async converse(system) { capturedSystem = system; return "ok"; },
      };
      await handleConversationChat(db, spyLlm, {
        meetingIds: [],
        messages: [{ role: "user", content: "Make a Jira ticket" }],
        template: "jira-ticket",
      });
      expect(capturedSystem).toContain("Output Template: Jira Ticket");
      expect(capturedSystem).toContain("CRITICAL");
      expect(capturedSystem).toContain("output ONLY the sections above");
    });

    it("does not inject template content when template is not set", async () => {
      let capturedSystem = "";
      const spyLlm: LlmAdapter = {
        async complete() { return { answer: "" }; },
        async converse(system) { capturedSystem = system; return "ok"; },
      };
      await handleConversationChat(db, spyLlm, {
        meetingIds: [],
        messages: [{ role: "user", content: "Hello" }],
      });
      expect(capturedSystem).not.toContain("Output Template");
    });

    it("forwards attachments to llm.converse", async () => {
      let capturedAttachments: unknown;
      const spyLlm: LlmAdapter = {
        async complete() { return { answer: "" }; },
        async converse(_system, _messages, attachments) {
          capturedAttachments = attachments;
          return "I see the image.";
        },
      };
      await handleConversationChat(db, spyLlm, {
        meetingIds: [meetingId2],
        messages: [{ role: "user", content: "What is in this image?" }],
        attachments: [{ name: "screenshot.png", base64: "abc123", mimeType: "image/png" }],
      });
      expect(capturedAttachments).toEqual([{ name: "screenshot.png", base64: "abc123", mimeType: "image/png" }]);
    });

    it("uses distilled context with contextMode 'distilled' even when includeTranscripts is true", async () => {
      let capturedSystem = "";
      const spyLlm: LlmAdapter = {
        async complete() { return { answer: "" }; },
        async converse(system) { capturedSystem = system; return "ok"; },
      };
      const result = await handleConversationChat(db, spyLlm, {
        meetingIds: [meetingId2],
        messages: [{ role: "user", content: "What?" }],
        includeTranscripts: true,
        contextMode: "distilled",
      });
      expect(capturedSystem).toContain("## Beta Planning");
      expect(capturedSystem).not.toContain("Transcript:");
      expect(capturedSystem).not.toContain("[M1] Beta Planning");
      expect(result.charCount).toBeGreaterThan(0);
    });

    it("uses full labeled context with contextMode 'full'", async () => {
      let capturedSystem = "";
      const spyLlm: LlmAdapter = {
        async complete() { return { answer: "" }; },
        async converse(system) { capturedSystem = system; return "ok"; },
      };
      await handleConversationChat(db, spyLlm, {
        meetingIds: [meetingId2],
        messages: [{ role: "user", content: "What?" }],
        contextMode: "full",
      });
      expect(capturedSystem).toContain("[M1] Beta Planning");
      expect(capturedSystem).toContain("Transcript:");
    });
  });

  describe("handleDeleteMeetings", () => {
    it("removes meeting, artifact, and client_detection rows for given IDs", async () => {
      const before = handleGetMeetings(db, {});
      expect(before.some((m) => m.id === meetingId1)).toBe(true);
      await handleDeleteMeetings(db, null, [meetingId1]);
      const after = handleGetMeetings(db, {});
      expect(after.some((m) => m.id === meetingId1)).toBe(false);
      const artifact = handleGetArtifact(db, meetingId1);
      expect(artifact).toBeNull();
    });

    it("does nothing when given an empty list", async () => {
      const before = handleGetMeetings(db, {}).length;
      await handleDeleteMeetings(db, null, []);
      expect(handleGetMeetings(db, {}).length).toBe(before);
    });

    it("deletes from all vector tables when vdb is provided", async () => {
      const freshDb = createDb(":memory:");
      migrate(freshDb);
      const tempId = ingestMeeting(freshDb, {
        title: "Temp",
        timestamp: "2026-03-04T10:00:00.000Z",
        participants: [],
        rawTranscript: "",
        turns: [],
        sourceFilename: "temp-delete-test",
      });
      const deletedFilters: Record<string, string[]> = { meeting_vectors: [], feature_vectors: [], item_vectors: [] };
      const makeTable = (name: string) => ({
        delete: async (filter: string) => { deletedFilters[name].push(filter); },
      });
      const vdb = {
        tableNames: async () => ["meeting_vectors", "feature_vectors", "item_vectors"],
        openTable: async (name: string) => makeTable(name),
      } as unknown as import("../core/vector-db.js").VectorDb;
      await handleDeleteMeetings(freshDb, vdb, [tempId]);
      expect(deletedFilters).toEqual({
        meeting_vectors: [`meeting_id = '${tempId}'`],
        feature_vectors: [`meeting_id = '${tempId}'`],
        item_vectors: [`meeting_id = '${tempId}'`],
      });
    });
  });

  describe("handleReassignClient", () => {
    it("upserts client_detections so meeting.client updates to new client", () => {
      handleReassignClient(db, meetingId2, "Acme");
      const meetings = handleGetMeetings(db, {});
      const m = meetings.find((r) => r.id === meetingId2)!;
      expect(m.client).toBe("Acme");
    });
  });

  describe("handleSetIgnored", () => {
    it("excludes meeting from getMeetings when ignored=true", () => {
      handleSetIgnored(db, meetingId2, true);
      const meetings = handleGetMeetings(db, {});
      expect(meetings.some((m) => m.id === meetingId2)).toBe(false);
    });

    it("restores meeting in getMeetings when ignored=false", () => {
      handleSetIgnored(db, meetingId2, false);
      const meetings = handleGetMeetings(db, {});
      expect(meetings.some((m) => m.id === meetingId2)).toBe(true);
    });
  });

  describe("handleCompleteActionItem + handleGetCompletions", () => {
    it("complete → get returns record with meetingId, itemIndex, note", () => {
      handleCompleteActionItem(db, meetingId2, 0, "done");
      const completions = handleGetCompletions(db, meetingId2);
      expect(completions).toHaveLength(1);
      expect(completions[0]).toMatchObject({
        meeting_id: meetingId2,
        item_index: 0,
        note: "done",
        completed_at: expect.any(String),
      });
    });

    it("calling complete again for same index upserts the note", () => {
      handleCompleteActionItem(db, meetingId2, 0, "updated");
      const completions = handleGetCompletions(db, meetingId2);
      const c = completions.filter(r => r.item_index === 0);
      expect(c).toHaveLength(1);
      expect(c[0].note).toBe("updated");
    });

    it("uncomplete removes the completion record", () => {
      handleCompleteActionItem(db, meetingId2, 1, "will remove");
      expect(handleGetCompletions(db, meetingId2).filter(r => r.item_index === 1)).toHaveLength(1);
      handleUncompleteActionItem(db, meetingId2, 1);
      expect(handleGetCompletions(db, meetingId2).filter(r => r.item_index === 1)).toHaveLength(0);
    });
  });

  describe("handleEditActionItem", () => {
    let editMeetingId: string;

    beforeAll(() => {
      editMeetingId = ingestMeeting(db, {
        title: "Edit Test",
        timestamp: "2026-02-28T10:00:00.000Z",
        participants: [],
        rawTranscript: "X | 00:00\nTest.",
        turns: [],
        sourceFilename: "edit-test-1",
      });
      storeArtifact(db, editMeetingId, makeArtifact());
    });
    it("updates description and priority of an action item", () => {
      handleEditActionItem(db, editMeetingId, 0, { description: "Write updated spec", priority: "critical" });
      const artifact = handleGetArtifact(db, editMeetingId);
      expect(artifact!.action_items[0]).toEqual({
        description: "Write updated spec",
        owner: "Bob",
        requester: "Alice",
        due_date: "2026-03-01",
        priority: "critical",
        short_id: generateShortId(editMeetingId, 0),
      });
    });

    it("updates owner and due_date without affecting other fields", () => {
      handleEditActionItem(db, editMeetingId, 0, { owner: "Charlie", due_date: "2026-04-01" });
      const artifact = handleGetArtifact(db, editMeetingId);
      expect(artifact!.action_items[0]).toEqual({
        description: "Write updated spec",
        owner: "Charlie",
        requester: "Alice",
        due_date: "2026-04-01",
        priority: "critical",
        short_id: generateShortId(editMeetingId, 0),
      });
    });

    it("clears due_date when set to null", () => {
      handleEditActionItem(db, editMeetingId, 0, { due_date: null });
      const artifact = handleGetArtifact(db, editMeetingId);
      expect(artifact!.action_items[0].due_date).toBeNull();
    });

    it("throws for out-of-range index", () => {
      expect(() => handleEditActionItem(db, editMeetingId, 99, { description: "nope" })).toThrow("out of range");
    });

    it("throws for missing artifact", () => {
      expect(() => handleEditActionItem(db, "nonexistent", 0, { description: "nope" })).toThrow("Artifact not found");
    });
  });

  describe("handleCreateActionItem", () => {
    let createMeetingId: string;

    beforeAll(() => {
      createMeetingId = ingestMeeting(db, {
        title: "Create Test",
        timestamp: "2026-02-28T11:00:00.000Z",
        participants: [],
        rawTranscript: "X | 00:00\nTest.",
        turns: [],
        sourceFilename: "create-test-1",
      });
      storeArtifact(db, createMeetingId, makeArtifact());
    });

    it("appends a new action item to existing items", () => {
      handleCreateActionItem(db, createMeetingId, { description: "Deploy staging", owner: "Eve", requester: "Frank", priority: "critical" });
      const artifact = handleGetArtifact(db, createMeetingId);
      expect(artifact!.action_items).toHaveLength(2);
      expect(artifact!.action_items[1]).toEqual({
        description: "Deploy staging",
        owner: "Eve",
        requester: "Frank",
        due_date: null,
        priority: "critical",
        short_id: generateShortId(createMeetingId, 1),
      });
    });

    it("throws for missing artifact", () => {
      expect(() => handleCreateActionItem(db, "nonexistent", { description: "nope" })).toThrow("Artifact not found");
    });
  });

    describe("handleGetClientActionItems", () => {
    let acmeMeetingId: string;

    beforeAll(() => {
      acmeMeetingId = ingestMeeting(db, {
        title: "Acme Planning",
        timestamp: "2026-03-01T10:00:00.000Z",
        participants: [],
        rawTranscript: "A | 00:00\nHi.",
        turns: [],
        sourceFilename: "acme-plan-2",
      });
      storeArtifact(db, acmeMeetingId, {
        summary: "Important planning meeting.",
        decisions: [],
        proposed_features: [],
        action_items: [
          { description: "Fix the build", owner: "Alice", requester: "Bob", due_date: null, priority: "critical" },
          { description: "Write docs", owner: "Charlie", requester: "Alice", due_date: null, priority: "normal" },
        ],
        open_questions: [],
        risk_items: [],
        additional_notes: [],
      });
      storeDetection(db, acmeMeetingId, [
        { client_name: "Acme", client_id: "client-acme", confidence: 0.9, method: "participant" },
      ]);
    });

    it("returns only incomplete action items for client, critical first", () => {
      const items = handleGetClientActionItems(db, "Acme");
      const fromAcmePlanning = items.filter((i) => i.meeting_id === acmeMeetingId);
      expect(fromAcmePlanning[0].priority).toBe("critical");
      expect(fromAcmePlanning[0].description).toBe("Fix the build");
      expect(fromAcmePlanning[1].priority).toBe("normal");
      expect(fromAcmePlanning[1].description).toBe("Write docs");
    });

    it("excludes completed items", () => {
      handleCompleteActionItem(db, acmeMeetingId, 1, "Done");
      const items = handleGetClientActionItems(db, "Acme");
      const fromAcmePlanning = items.filter((i) => i.meeting_id === acmeMeetingId);
      expect(fromAcmePlanning.every((i) => i.item_index !== 1)).toBe(true);
    });

    it("returns empty array for unknown client", () => {
      expect(handleGetClientActionItems(db, "Unknown Client")).toEqual([]);
    });

    it("each item has required shape with meeting metadata", () => {
      const items = handleGetClientActionItems(db, "Acme");
      const item = items.find((i) => i.meeting_id === acmeMeetingId);
      expect(item).toMatchObject({
        meeting_id: acmeMeetingId,
        meeting_title: "Acme Planning",
        meeting_date: expect.any(String),
        item_index: expect.any(Number),
        description: expect.any(String),
        owner: expect.any(String),
        requester: expect.any(String),
        due_date: null,
        priority: expect.any(String),
      });
    });

    it("includes short_id from stored artifact data", () => {
      const items = handleGetClientActionItems(db, "Acme");
      const item = items.find((i) => i.meeting_id === acmeMeetingId);
      expect(item?.short_id).toBe(generateShortId(acmeMeetingId, 0));
    });

    it("filters action items by after date", () => {
      const items = handleGetClientActionItems(db, "Acme", { after: "2026-03-02" });
      expect(items.filter((i) => i.meeting_id === acmeMeetingId)).toHaveLength(0);
    });

    it("filters action items by before date", () => {
      const items = handleGetClientActionItems(db, "Acme", { before: "2026-02-28" });
      expect(items.filter((i) => i.meeting_id === acmeMeetingId)).toHaveLength(0);
    });

    it("returns items within date range", () => {
      const items = handleGetClientActionItems(db, "Acme", { after: "2026-02-28", before: "2026-03-02" });
      expect(items.filter((i) => i.meeting_id === acmeMeetingId).length).toBeGreaterThan(0);
    });
  });

  describe("handleGetTemplates", () => {
    it("returns sorted list of template names from chat-templates directory", () => {
      const templates = handleGetTemplates();
      expect(templates).toEqual(["jira-epic", "jira-ticket", "team-actions", "thread-discovery"]);
    });
  });

  describe("handleCreateMeeting", () => {
    let createDb2: ReturnType<typeof createDb>;
    const stubLlm: LlmAdapter = {
      async complete() {
        return {
          summary: "Created meeting summary",
          decisions: [],
          proposed_features: [],
          action_items: [],
          open_questions: [],
          risk_items: [],
          additional_notes: [],
        };
      },
    };

    beforeAll(() => {
      createDb2 = createDb(":memory:");
      migrate(createDb2);
      createDb2.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run(
        "Acme", "[]", "[]", "client-acme-create",
      );
    });

    it("ingests meeting, stores artifact, returns new meeting id", async () => {
      const meetingId = await handleCreateMeeting(createDb2, stubLlm, {
        clientName: "Acme",
        date: "2026-03-10",
        title: "Manual Meeting",
        rawTranscript: "Alice | 00:00\nHello world.",
        format: "krisp",
      });
      expect(meetingId).toEqual(expect.any(String));
      const meetings = handleGetMeetings(createDb2, {});
      expect(meetings.some((m) => m.id === meetingId)).toBe(true);
      const artifact = handleGetArtifact(createDb2, meetingId);
      expect(artifact?.summary).toBe("Created meeting summary");
    });

    it("stores manual client detection when clientName is provided", async () => {
      const meetingId = await handleCreateMeeting(createDb2, stubLlm, {
        clientName: "Acme",
        date: "2026-03-10",
        title: "Acme Manual",
        rawTranscript: "Alice | 00:00\nHello.",
        format: "krisp",
      });
      const filtered = handleGetMeetings(createDb2, { client: "Acme" });
      expect(filtered.some((m) => m.id === meetingId)).toBe(true);
    });

    it("wraps plain text transcript as single turn for extraction", async () => {
      const meetingId = await handleCreateMeeting(createDb2, stubLlm, {
        clientName: "",
        date: "2026-03-10",
        title: "Plain Text Meeting",
        rawTranscript: "This is a plain text transcript without speaker headers.",
        format: "krisp",
      });
      const artifact = handleGetArtifact(createDb2, meetingId);
      expect(artifact?.summary).toBe("Created meeting summary");
    });

    it("sets date as ISO timestamp from YYYY-MM-DD input", async () => {
      const meetingId = await handleCreateMeeting(createDb2, stubLlm, {
        clientName: "",
        date: "2026-03-10",
        title: "Date Test Meeting",
        rawTranscript: "Alice | 00:00\nHi.",
        format: "krisp",
      });
      const meetings = handleGetMeetings(createDb2, {});
      const m = meetings.find((r) => r.id === meetingId)!;
      expect(m.date).toBe("2026-03-10T00:00:00.000Z");
    });

    it("passes extraction prompt template to LLM", async () => {
      let capturedContent = "";
      const spyLlm: LlmAdapter = {
        async complete(_type: string, content: string) {
          capturedContent = content;
          return { summary: "s", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] };
        },
      };
      await handleCreateMeeting(createDb2, spyLlm, {
        clientName: "",
        date: "2026-03-10",
        title: "Prompt Test",
        rawTranscript: "Alice | 00:00\nHello.",
        format: "krisp",
      });
      expect(capturedContent).toContain("meeting analyst");
    });

    it("uses WebVTT parser when format is webvtt", async () => {
      const vtt = "1\n00:00:01.000 --> 00:00:02.000\nAlice: Hello from VTT.";
      const meetingId = await handleCreateMeeting(createDb2, stubLlm, {
        clientName: "",
        date: "2026-03-10",
        title: "WebVTT Meeting",
        rawTranscript: vtt,
        format: "webvtt",
      });
      const artifact = handleGetArtifact(createDb2, meetingId);
      expect(artifact?.summary).toBe("Created meeting summary");
    });
  });

  describe("handleDeepSearch", () => {
    it("returns deep search results using stub LLM", async () => {
      const stubLlm = createLlmAdapter({ type: "stub" });
      const results = await handleDeepSearch(db, stubLlm, { meetingIds: [meetingId2], query: "engineering" });
      expect(results).toEqual([
        {
          meeting_id: meetingId2,
          relevanceSummary: expect.any(String),
          relevanceScore: expect.any(Number),
        },
      ]);
      expect(results[0].relevanceSummary.length).toBeGreaterThan(0);
    });
  });

  describe("handleReExtract", () => {
    it("stores re-extracted artifact for meeting", async () => {
      const spyLlm: LlmAdapter = {
        async complete() {
          return {
            summary: "Re-extracted summary",
            decisions: [],
            proposed_features: [],
            action_items: [],
            open_questions: [],
            risk_items: [],
            additional_notes: [],
          };
        },
      };
      await handleReExtract(db, spyLlm, meetingId2);
      const artifact = handleGetArtifact(db, meetingId2);
      expect(artifact?.summary).toBe("Re-extracted summary");
    });

    it("passes extraction prompt template to LLM", async () => {
      let capturedContent = "";
      const spyLlm: LlmAdapter = {
        async complete(_type: string, content: string) {
          capturedContent = content;
          return { summary: "s", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] };
        },
      };
      await handleReExtract(db, spyLlm, meetingId2);
      expect(capturedContent).toContain("meeting analyst");
    });

    it("re-reconciles milestones after re-extraction", async () => {
      const spyLlm: LlmAdapter = {
        async complete() {
          return {
            summary: "s", decisions: [], proposed_features: [], action_items: [],
            open_questions: [], risk_items: [], additional_notes: [],
            milestones: [{ title: "Platform launch v2", target_date: "2026-06-01", status_signal: "introduced", excerpt: "Targeting June" }],
          };
        },
      };
      await handleReExtract(db, spyLlm, meetingId2);
      const milestones = listMilestonesByClient(db, "client-acme");
      expect(milestones.length).toBeGreaterThanOrEqual(1);
      const match = milestones.find((m: { title: string }) => m.title === "Platform launch v2");
      expect(match).toBeDefined();
    });
  });

  describe("Thread CRUD handlers", () => {
    it("createThread creates a thread and listThreads returns it", () => {
      const thread = handleCreateThread(db, { client_name: "Acme", client_id: "client-acme", title: "Deploy issues", shorthand: "DEPLOY", description: "Track CI", criteria_prompt: "CI failures" });
      expect(thread.title).toBe("Deploy issues");
      expect(thread.shorthand).toBe("DEPLOY");
      const list = handleListThreads(db, "client-acme");
      expect(list).toHaveLength(1);
      expect(list[0].title).toBe("Deploy issues");
    });

    it("updateThread updates thread fields", () => {
      const thread = handleCreateThread(db, { client_name: "Acme", client_id: "client-acme", title: "Old", shorthand: "OLD", description: "", criteria_prompt: "" });
      const updated = handleUpdateThread(db, thread.id, { title: "New title", status: "resolved" });
      expect(updated.title).toBe("New title");
      expect(updated.status).toBe("resolved");
    });

    it("deleteThread removes thread from list", () => {
      const thread = handleCreateThread(db, { client_name: "Acme", client_id: "client-acme", title: "To delete", shorthand: "DEL", description: "", criteria_prompt: "" });
      handleDeleteThread(db, thread.id);
      const list = handleListThreads(db, "client-acme");
      expect(list.find((t) => t.id === thread.id)).toBeUndefined();
    });
  });

  describe("meeting deletion marks thread messages stale", () => {
    it("deleting a meeting marks associated thread messages as context_stale", async () => {
      const staleDb = createDb(":memory:");
      migrate(staleDb);
      staleDb.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run("Acme", "[]", "[]", "client-acme-stale");
      const mId = ingestMeeting(staleDb, {
        title: "Stale Test Meeting",
        timestamp: "2026-03-05T10:00:00.000Z",
        participants: [],
        rawTranscript: "",
        turns: [],
        sourceFilename: "stale-test",
      });
      const thread = createThread(staleDb, { client_name: "Acme", client_id: "client-acme-stale", title: "Stale Thread", shorthand: "STALE", description: "", criteria_prompt: "" });
      addThreadMeeting(staleDb, { thread_id: thread.id, meeting_id: mId, relevance_summary: "related", relevance_score: 80 });
      appendThreadMessage(staleDb, { thread_id: thread.id, role: "user", content: "Question?" });
      appendThreadMessage(staleDb, { thread_id: thread.id, role: "assistant", content: "Answer." });

      await handleDeleteMeetings(staleDb, null, [mId]);

      const messages = getThreadMessages(staleDb, thread.id);
      expect(messages.length).toBe(2);
      expect(messages[0].context_stale).toBe(true);
      expect(messages[1].context_stale).toBe(true);
      expect(JSON.parse(messages[0].stale_details!)).toEqual([{ id: mId, title: "Stale Test Meeting" }]);

      const associations = staleDb.prepare("SELECT * FROM thread_meetings WHERE thread_id = ?").all(thread.id) as unknown[];
      expect(associations.length).toBe(0);
    });
  });

  describe("milestone handlers", () => {
    let msMeetingId1: string;
    let msMeetingId2: string;

    beforeAll(() => {
      msMeetingId1 = ingestMeeting(db, { title: "MS Meeting 1", timestamp: "2026-04-01T10:00:00.000Z", participants: [], rawTranscript: "A | 00:00\nHi.", turns: [], sourceFilename: "ms-m1" });
      msMeetingId2 = ingestMeeting(db, { title: "MS Meeting 2", timestamp: "2026-04-08T10:00:00.000Z", participants: [], rawTranscript: "B | 00:00\nHi.", turns: [], sourceFilename: "ms-m2" });
    });

    it("creates and lists milestones by client", () => {
      const ms = handleCreateMilestone(db, { clientName: "Acme", title: "Platform Launch", targetDate: "2026-06-01", description: "Go-live" });
      expect(ms.title).toBe("Platform Launch");
      expect(ms.target_date).toBe("2026-06-01");
      const list = handleListMilestones(db, "Acme");
      expect(list.some((m) => m.id === ms.id)).toBe(true);
      db.prepare("DELETE FROM milestones WHERE id = ?").run(ms.id);
    });

    it("updates milestone fields", () => {
      const ms = handleCreateMilestone(db, { clientName: "Acme", title: "Old Title" });
      const updated = handleUpdateMilestone(db, ms.id, { title: "New Title", status: "tracked" });
      expect(updated.title).toBe("New Title");
      expect(updated.status).toBe("tracked");
      db.prepare("DELETE FROM milestones WHERE id = ?").run(ms.id);
    });

    it("deletes milestone", () => {
      const ms = handleCreateMilestone(db, { clientName: "Acme", title: "Temp" });
      handleDeleteMilestone(db, ms.id);
      const list = handleListMilestones(db, "Acme");
      expect(list.some((m) => m.id === ms.id)).toBe(false);
    });

    it("gets milestone mentions with meeting context", () => {
      const ms = handleCreateMilestone(db, { clientName: "Acme", title: "Mentions Test" });
      addMilestoneMention(db, { milestoneId: ms.id, meetingId: msMeetingId1, mentionType: "introduced", excerpt: "Excerpt", targetDateAtMention: "2026-06-01", mentionedAt: "2026-04-01" });
      const mentions = handleGetMilestoneMentions(db, ms.id);
      expect(mentions).toHaveLength(1);
      expect(mentions[0].meeting_title).toBe("MS Meeting 1");
      db.prepare("DELETE FROM milestone_mentions WHERE milestone_id = ?").run(ms.id);
      db.prepare("DELETE FROM milestones WHERE id = ?").run(ms.id);
    });

    it("gets meeting milestones", () => {
      const ms = handleCreateMilestone(db, { clientName: "Acme", title: "Meeting MS" });
      addMilestoneMention(db, { milestoneId: ms.id, meetingId: msMeetingId1, mentionType: "introduced", excerpt: "Ex", targetDateAtMention: null, mentionedAt: "2026-04-01" });
      const tags = handleGetMeetingMilestones(db, msMeetingId1);
      expect(tags.some((t) => t.milestone_id === ms.id)).toBe(true);
      db.prepare("DELETE FROM milestone_mentions WHERE milestone_id = ?").run(ms.id);
      db.prepare("DELETE FROM milestones WHERE id = ?").run(ms.id);
    });

    it("gets date slippage", () => {
      const ms = handleCreateMilestone(db, { clientName: "Acme", title: "Slippage Test" });
      addMilestoneMention(db, { milestoneId: ms.id, meetingId: msMeetingId1, mentionType: "introduced", excerpt: "Ex", targetDateAtMention: "2026-06-01", mentionedAt: "2026-04-01" });
      addMilestoneMention(db, { milestoneId: ms.id, meetingId: msMeetingId2, mentionType: "updated", excerpt: "Ex", targetDateAtMention: "2026-07-01", mentionedAt: "2026-04-08" });
      const slippage = handleGetDateSlippage(db, ms.id);
      expect(slippage).toHaveLength(2);
      expect(slippage[0].target_date_at_mention).toBe("2026-06-01");
      expect(slippage[1].target_date_at_mention).toBe("2026-07-01");
      db.prepare("DELETE FROM milestone_mentions WHERE milestone_id = ?").run(ms.id);
      db.prepare("DELETE FROM milestones WHERE id = ?").run(ms.id);
    });

    it("manages milestone messages", () => {
      const ms = handleCreateMilestone(db, { clientName: "Acme", title: "Chat Test" });
      handleGetMilestoneMessages(db, ms.id);
      handleClearMilestoneMessages(db, ms.id);
      const msgs = handleGetMilestoneMessages(db, ms.id);
      expect(msgs).toHaveLength(0);
      db.prepare("DELETE FROM milestones WHERE id = ?").run(ms.id);
    });
  });

  describe("rename meeting", () => {
    it("updates the meeting title via handler", () => {
      const id = ingestMeeting(db, {
        title: "Original Title",
        timestamp: "2026-02-28T10:00:00.000Z",
        participants: [],
        rawTranscript: "Hello.",
        turns: [],
        sourceFilename: "rename-test-handler",
      });
      handleRenameMeeting(db, id, "Renamed Meeting");
      const row = getMeeting(db, id);
      expect(row.title).toBe("Renamed Meeting");
    });
  });

  describe("health IPC handlers", () => {
    it("handleGetHealth returns healthy status for empty DB", () => {
      const result = handleGetHealth(db);
      expect(result).toMatchObject({
        status: "healthy",
        error_groups: [],
        meetings_without_artifact: 0,
        last_error_at: null,
      });
    });

    it("handleGetHealth returns critical status when api_error exists", () => {
      db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('hh-e1', 'api_error', 'critical', 'test err')").run();
      const result = handleGetHealth(db);
      expect(result.status).toBe("critical");
      expect(result.error_groups).toHaveLength(1);
      db.prepare("DELETE FROM system_errors WHERE id = 'hh-e1'").run();
    });

    it("handleAcknowledgeHealthErrors by IDs makes status healthy", () => {
      db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('hh-e2', 'api_error', 'critical', 'err2')").run();
      handleAcknowledgeHealthErrors(db, ["hh-e2"]);
      const result = handleGetHealth(db);
      expect(result.status).toBe("healthy");
      db.prepare("DELETE FROM system_errors WHERE id = 'hh-e2'").run();
    });
  });

});
