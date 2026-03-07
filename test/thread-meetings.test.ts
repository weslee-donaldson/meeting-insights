import { describe, it, expect, beforeEach } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createThread, addThreadMeeting, removeThreadMeeting, getThreadMeetings } from "../core/threads.js";

let db: Database;
let threadId: string;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run("Acme", "[]", "[]");
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m1', 'Sprint Planning', '2026-03-01')").run();
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m2', 'Retrospective', '2026-03-08')").run();
  const thread = createThread(db, { client_name: "Acme", title: "Deployment issues", shorthand: "DEPLOY", description: "", criteria_prompt: "" });
  threadId = thread.id;
});

describe("addThreadMeeting", () => {
  it("adds a meeting association to the thread", () => {
    addThreadMeeting(db, { thread_id: threadId, meeting_id: "m1", relevance_summary: "Deployment was mentioned.", relevance_score: 70 });
    const meetings = getThreadMeetings(db, threadId);
    expect(meetings).toHaveLength(1);
    expect(meetings[0]).toMatchObject({
      thread_id: threadId,
      meeting_id: "m1",
      relevance_summary: "Deployment was mentioned.",
      relevance_score: 70,
      meeting_title: "Sprint Planning",
      meeting_date: "2026-03-01",
    });
  });

  it("upserts — adding the same meeting twice overwrites the existing record", () => {
    addThreadMeeting(db, { thread_id: threadId, meeting_id: "m1", relevance_summary: "Old summary", relevance_score: 40 });
    addThreadMeeting(db, { thread_id: threadId, meeting_id: "m1", relevance_summary: "Updated summary", relevance_score: 90 });
    const meetings = getThreadMeetings(db, threadId);
    expect(meetings).toHaveLength(1);
    expect(meetings[0].relevance_score).toBe(90);
    expect(meetings[0].relevance_summary).toBe("Updated summary");
  });
});

describe("removeThreadMeeting", () => {
  it("removes the association between a thread and a meeting", () => {
    addThreadMeeting(db, { thread_id: threadId, meeting_id: "m1", relevance_summary: "Found it", relevance_score: 60 });
    removeThreadMeeting(db, threadId, "m1");
    const meetings = getThreadMeetings(db, threadId);
    expect(meetings).toHaveLength(0);
  });
});

describe("getThreadMeetings", () => {
  it("returns meetings sorted by relevance_score descending", () => {
    addThreadMeeting(db, { thread_id: threadId, meeting_id: "m1", relevance_summary: "Low", relevance_score: 30 });
    addThreadMeeting(db, { thread_id: threadId, meeting_id: "m2", relevance_summary: "High", relevance_score: 90 });
    const meetings = getThreadMeetings(db, threadId);
    expect(meetings[0].relevance_score).toBe(90);
    expect(meetings[1].relevance_score).toBe(30);
  });

  it("returns empty array when no meetings associated", () => {
    const meetings = getThreadMeetings(db, threadId);
    expect(meetings).toEqual([]);
  });

  it("includes joined meeting_title and meeting_date", () => {
    addThreadMeeting(db, { thread_id: threadId, meeting_id: "m2", relevance_summary: "Retro discussion", relevance_score: 55 });
    const meetings = getThreadMeetings(db, threadId);
    expect(meetings[0].meeting_title).toBe("Retrospective");
    expect(meetings[0].meeting_date).toBe("2026-03-08");
  });
});
