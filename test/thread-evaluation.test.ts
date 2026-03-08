import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createThread, evaluateMeetingAgainstThread } from "../core/threads.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { storeArtifact } from "../core/extractor.js";

let db: Database;
let threadId: string;
const llm = createLlmAdapter({ type: "stub" });

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run("Acme", "[]", "[]");
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m1', 'Sprint Planning', '2026-03-01')").run();
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m2', 'No artifact meeting', '2026-03-02')").run();
  storeArtifact(db, "m1", {
    summary: "We discussed deployment failures.",
    decisions: [{ text: "Roll back the deploy", decided_by: "Alice" }],
    proposed_features: [],
    action_items: [{ description: "Fix the pipeline", owner: "Bob", requester: "Alice", due_date: null, priority: "normal" }],
    open_questions: [],
    risk_items: [],
    additional_notes: [],
  });
  const thread = createThread(db, {
    client_name: "Acme",
    title: "Deployment issues",
    shorthand: "DEPLOY",
    description: "Track deployment failures",
    criteria_prompt: "Look for CI/CD failures and deployment rollbacks",
  });
  threadId = thread.id;
});

describe("evaluateMeetingAgainstThread", () => {
  it("returns related result when stub LLM returns related:true and artifact exists", async () => {
    const thread = db.prepare("SELECT * FROM threads WHERE id = ?").get(threadId) as Parameters<typeof evaluateMeetingAgainstThread>[3];
    const result = await evaluateMeetingAgainstThread(db, llm, "m1", thread);
    expect(result).toEqual({
      related: true,
      relevance_summary: "Stub relevance.",
      relevance_score: 75,
    });
  });

  it("injects keywords into the evaluation prompt", async () => {
    const thread = createThread(db, {
      client_name: "Acme",
      title: "FTP issues",
      shorthand: "FTP",
      description: "FTP failures",
      criteria_prompt: "Look for FTP",
      keywords: '"ftp bug" rollback',
    });
    const spyLlm = createLlmAdapter({ type: "stub" });
    const completeSpy = vi.spyOn(spyLlm, "complete");
    await evaluateMeetingAgainstThread(db, spyLlm, "m1", thread);
    const prompt = completeSpy.mock.calls[0][1] as string;
    expect(prompt).toContain('"ftp bug" rollback');
    expect(prompt).toContain("Keywords to look for:");
  });

  it("returns not-related when no artifact exists for the meeting", async () => {
    const thread = db.prepare("SELECT * FROM threads WHERE id = ?").get(threadId) as Parameters<typeof evaluateMeetingAgainstThread>[3];
    const result = await evaluateMeetingAgainstThread(db, llm, "m2", thread);
    expect(result).toEqual({
      related: false,
      relevance_summary: "",
      relevance_score: 0,
    });
  });
});
