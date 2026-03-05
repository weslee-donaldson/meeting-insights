import { describe, it, expect } from "vitest";
import { DatabaseSync as Database } from "node:sqlite";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact } from "../core/extractor.js";
import type { Artifact } from "../core/extractor.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { deepSearch } from "../core/deep-search.js";

function seedMeeting(db: Database, id: string, title: string, artifact: Artifact): void {
  ingestMeeting(db, {
    externalId: id,
    title,
    timestamp: "2026-03-05T10:00:00Z",
    participants: [],
    turns: [{ speaker_name: "Alice", timestamp: "10:00:00", text: "hello" }],
    rawTranscript: "Alice | 10:00:00\nhello",
    sourceFilename: `${id}.txt`,
  });
  storeArtifact(db, id, artifact);
}

const ARTIFACT: Artifact = {
  summary: "Discussed the DLQ issue in production. Messages are backing up in the dead letter queue.",
  decisions: [{ text: "Increase DLQ retention to 7 days", decided_by: "Alice" }],
  proposed_features: [],
  action_items: [{ description: "Investigate DLQ backlog root cause", owner: "Bob", requester: "Alice", due_date: null, priority: "normal" }],
  open_questions: ["Why are messages failing?"],
  risk_items: [{ category: "engineering", description: "DLQ overflow could cause data loss" }],
  additional_notes: [],
};

const PROMPT = "You are evaluating.\n\n## Search Query\n\n{{query}}\n\n## Meeting Context\n\n{{meeting_context}}\n\nReturn JSON.";

describe("deepSearch", () => {
  it("returns relevant meetings with relevanceSummary and relevanceScore from stub LLM", async () => {
    const db = createDb(":memory:");
    migrate(db);
    seedMeeting(db, "m1", "DLQ Triage", ARTIFACT);

    const llm = createLlmAdapter({ type: "stub" });
    const results = await deepSearch(llm, db, ["m1"], "DLQ issue", PROMPT);

    expect(results).toEqual([
      {
        meeting_id: "m1",
        relevanceSummary: expect.any(String),
        relevanceScore: expect.any(Number),
      },
    ]);
    expect(results[0].relevanceSummary.length).toBeGreaterThan(0);
    expect(results[0].relevanceScore).toBeGreaterThanOrEqual(0);
    expect(results[0].relevanceScore).toBeLessThanOrEqual(100);
  });
});
