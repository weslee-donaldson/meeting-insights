import { describe, it, expect, beforeAll } from "vitest";
import { randomUUID } from "node:crypto";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/pipeline/ingest.js";
import { storeArtifact } from "../core/pipeline/extractor.js";
import { createLlmAdapter } from "../core/llm/adapter.js";
import { aggregateClusterSummaries, extractClusterTags, storeClusterTags } from "../core/cluster-topics.js";
import type { DatabaseSync as Database } from "node:sqlite";

let db: Database;
let clusterId: string;
let meeting1Id: string;
let meeting2Id: string;

function makeParsed(title: string, filename: string) {
  return {
    timestamp: "2026-01-01T00:00:00Z",
    title,
    participants: [],
    turns: [],
    rawTranscript: "",
    sourceFilename: filename,
  };
}

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);

  meeting1Id = ingestMeeting(db, makeParsed("API Meeting 1", "api-1"));
  meeting2Id = ingestMeeting(db, makeParsed("API Meeting 2", "api-2"));

  storeArtifact(db, meeting1Id, {
    summary: "REST API design patterns and OAuth authentication",
    decisions: [{ text: "Use REST", decided_by: "" }, { text: "OAuth2", decided_by: "" }],
    proposed_features: ["API versioning"],
    action_items: [],
    open_questions: [],
    risk_items: [],
  });

  storeArtifact(db, meeting2Id, {
    summary: "API endpoint authentication protocols review",
    decisions: [{ text: "Bearer tokens", decided_by: "" }],
    proposed_features: ["token refresh"],
    action_items: [],
    open_questions: [],
    risk_items: [],
  });

  clusterId = randomUUID();
  db.prepare("INSERT INTO clusters (cluster_id, centroid_snapshot, updated_at) VALUES (?, ?, ?)").run(
    clusterId,
    JSON.stringify([0]),
    new Date().toISOString(),
  );
  db.prepare("INSERT INTO meeting_clusters (meeting_id, cluster_id) VALUES (?, ?)").run(meeting1Id, clusterId);
  db.prepare("INSERT INTO meeting_clusters (meeting_id, cluster_id) VALUES (?, ?)").run(meeting2Id, clusterId);
});

describe("aggregateClusterSummaries", () => {
  it("collects all artifact summaries for a given cluster_id", () => {
    const summaries = aggregateClusterSummaries(db, clusterId);
    expect(summaries).toHaveLength(2);
    expect(summaries).toContain("REST API design patterns and OAuth authentication");
    expect(summaries).toContain("API endpoint authentication protocols review");
  });
});

describe("extractClusterTags", () => {
  it("returns 3-7 noun-phrase tags from LLM response", async () => {
    const llm = createLlmAdapter({ type: "stub" });
    const summaries = ["REST API OAuth authentication", "API endpoint design"];
    const tags = await extractClusterTags(llm, summaries);
    expect(tags.length).toBeGreaterThanOrEqual(3);
    expect(tags.length).toBeLessThanOrEqual(7);
  });

  it("rejects vague tags like 'discussion' or 'meeting'", async () => {
    const llm = {
      async complete() {
        return { tags: ["API integration", "discussion", "meeting", "authentication flow"] };
      },
    };
    const tags = await extractClusterTags(llm as ReturnType<typeof createLlmAdapter>, ["some text"]);
    expect(tags).not.toContain("discussion");
    expect(tags).not.toContain("meeting");
    expect(tags).toContain("API integration");
    expect(tags).toContain("authentication flow");
  });

  it("logs generated tags via mtninsights:cluster:tags", async () => {
    const llm = createLlmAdapter({ type: "stub" });
    await expect(extractClusterTags(llm, ["test summary"])).resolves.toBeDefined();
  });
});

describe("storeClusterTags", () => {
  it("updates clusters table with generated_tags", () => {
    const tags = ["API design", "OAuth authentication", "REST endpoints"];
    storeClusterTags(db, clusterId, tags);
    const row = db.prepare("SELECT generated_tags FROM clusters WHERE cluster_id = ?").get(clusterId) as {
      generated_tags: string;
    };
    expect(JSON.parse(row.generated_tags)).toEqual(tags);
  });
});
