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
  handleDeleteMeetings,
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
    decisions: ["Go with approach A"],
    proposed_features: ["Dark mode"],
    action_items: [{ description: "Write spec", owner: "Bob", due_date: "2026-03-01" }],
    technical_topics: ["TypeScript"],
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
    it("should return parsed artifact for known meeting", () => {
      const artifact = handleGetArtifact(db, meetingId1);
      expect(artifact).toEqual({
        summary: "Key decisions were made.",
        decisions: ["Go with approach A"],
        proposed_features: ["Dark mode"],
        action_items: [{ description: "Write spec", owner: "Bob", due_date: "2026-03-01" }],
        technical_topics: ["TypeScript"],
        open_questions: ["When to ship?"],
        risk_items: ["Timeline risk"],
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

});
