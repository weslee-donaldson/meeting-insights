import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact } from "../core/extractor.js";
import { storeDetection } from "../core/client-detection.js";
import { createLlmAdapter, type LlmAdapter } from "../core/llm-adapter.js";
import {
  handleGetClients,
  handleGetMeetings,
  handleGetArtifact,
  handleChat,
  handleConversationChat,
  handleDeleteMeetings,
  handleReExtract,
  handleReassignClient,
  handleSetIgnored,
  handleCompleteActionItem,
  handleUncompleteActionItem,
  handleGetCompletions,
  handleGetClientActionItems,
  handleGetTemplates,
} from "../electron-ui/electron/ipc-handlers.js";

function seedClientsRaw(db: ReturnType<typeof createDb>) {
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run(
    "Acme", JSON.stringify(["Acme Corp"]), JSON.stringify(["@acme.com"]),
  );
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run(
    "Beta Co", JSON.stringify(["Beta"]), JSON.stringify(["@beta.io"]),
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
      { client_name: "Acme", confidence: 0.8, method: "participant" },
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
      { client_name: "Beta Co", confidence: 0.9, method: "participant" },
    ]);
  });

  describe("handleGetClients", () => {
    it("should return sorted list of client names", () => {
      const clients = handleGetClients(db);
      expect(clients).toEqual(["Acme", "Beta Co"]);
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
        action_items: [{ description: "Write spec", owner: "Bob", requester: "Alice", due_date: "2026-03-01", priority: "normal" }],
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

    it("injects template content into system prompt when template is set", async () => {
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
  });

  describe("handleDeleteMeetings", () => {
    it("removes meeting, artifact, and client_detection rows for given IDs", () => {
      const before = handleGetMeetings(db, {});
      expect(before.some((m) => m.id === meetingId1)).toBe(true);
      handleDeleteMeetings(db, [meetingId1]);
      const after = handleGetMeetings(db, {});
      expect(after.some((m) => m.id === meetingId1)).toBe(false);
      const artifact = handleGetArtifact(db, meetingId1);
      expect(artifact).toBeNull();
    });

    it("does nothing when given an empty list", () => {
      const before = handleGetMeetings(db, {}).length;
      handleDeleteMeetings(db, []);
      expect(handleGetMeetings(db, {}).length).toBe(before);
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
        { client_name: "Acme", confidence: 0.9, method: "participant" },
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
  });

  describe("handleGetTemplates", () => {
    it("returns sorted list of template names from chat-templates directory", () => {
      const templates = handleGetTemplates();
      expect(templates).toEqual(["jira-epic", "jira-ticket"]);
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
  });

});
