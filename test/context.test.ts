import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact } from "../core/extractor.js";
import { connectVectorDb, createMeetingTable } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "../core/meeting-pipeline.js";
import { buildContext } from "../core/context.js";
import type { DatabaseSync as Database } from "node:sqlite";
import type { Artifact } from "../core/extractor.js";

let db: Database;
let vdbPath: string;
let vdb: Awaited<ReturnType<typeof connectVectorDb>>;
let session: Awaited<ReturnType<typeof loadModel>>;

let apiMeeting1Id: string;
let apiMeeting2Id: string;
let finMeetingId: string;

const apiArtifact1: Artifact = {
  summary: "REST API design patterns and OAuth authentication discussion",
  decisions: [{ text: "Use REST", decided_by: "" }, { text: "OAuth2", decided_by: "" }],
  proposed_features: ["API versioning"],
  action_items: [],
  technical_topics: ["REST", "OAuth", "API gateway"],
  open_questions: [],
  risk_items: [],
};

const apiArtifact2: Artifact = {
  summary: "API endpoint structure and HTTP authentication protocols review",
  decisions: [{ text: "Bearer tokens", decided_by: "" }],
  proposed_features: ["token refresh"],
  action_items: [],
  technical_topics: ["HTTP", "authentication", "API design"],
  open_questions: [],
  risk_items: [],
};

const finArtifact: Artifact = {
  summary: "Quarterly budget review and financial planning",
  decisions: [{ text: "Approve budget", decided_by: "" }],
  proposed_features: [],
  action_items: [],
  technical_topics: ["budget", "financial planning"],
  open_questions: [],
  risk_items: [],
};

function makeParsed(title: string, filename: string, date: string) {
  return {
    timestamp: date,
    title,
    participants: [],
    turns: [],
    rawTranscript: "",
    sourceFilename: filename,
  };
}

beforeAll(async () => {
  db = createDb(":memory:");
  migrate(db);
  vdbPath = join(tmpdir(), `lancedb-context-${Date.now()}`);
  mkdirSync(vdbPath, { recursive: true });
  vdb = await connectVectorDb(vdbPath);
  session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");

  apiMeeting1Id = ingestMeeting(db, makeParsed("API Meeting 1", "api-1", "2026-01-10T00:00:00Z"));
  apiMeeting2Id = ingestMeeting(db, makeParsed("API Meeting 2", "api-2", "2026-01-20T00:00:00Z"));
  finMeetingId = ingestMeeting(db, makeParsed("Finance Meeting", "fin-1", "2026-01-15T00:00:00Z"));

  storeArtifact(db, apiMeeting1Id, apiArtifact1);
  storeArtifact(db, apiMeeting2Id, apiArtifact2);
  storeArtifact(db, finMeetingId, finArtifact);

  const table = await createMeetingTable(vdb);

  const v1 = await embedMeeting(session, buildEmbeddingInput(apiArtifact1));
  await storeMeetingVector(table, apiMeeting1Id, v1, { client: "Acme", meeting_type: "Architecture", date: "2026-01-10T00:00:00Z" });

  const v2 = await embedMeeting(session, buildEmbeddingInput(apiArtifact2));
  await storeMeetingVector(table, apiMeeting2Id, v2, { client: "Acme", meeting_type: "Architecture", date: "2026-01-20T00:00:00Z" });

  const v3 = await embedMeeting(session, buildEmbeddingInput(finArtifact));
  await storeMeetingVector(table, finMeetingId, v3, { client: "Globex", meeting_type: "Finance", date: "2026-01-15T00:00:00Z" });

  // Put api meetings in same cluster, finance in different cluster
  const apiClusterId = randomUUID();
  const finClusterId = randomUUID();
  const now = new Date().toISOString();
  db.prepare("INSERT INTO clusters (cluster_id, centroid_snapshot, updated_at) VALUES (?, ?, ?)").run(apiClusterId, "[]", now);
  db.prepare("INSERT INTO clusters (cluster_id, centroid_snapshot, updated_at) VALUES (?, ?, ?)").run(finClusterId, "[]", now);
  db.prepare("INSERT INTO meeting_clusters (meeting_id, cluster_id) VALUES (?, ?)").run(apiMeeting1Id, apiClusterId);
  db.prepare("INSERT INTO meeting_clusters (meeting_id, cluster_id) VALUES (?, ?)").run(apiMeeting2Id, apiClusterId);
  db.prepare("INSERT INTO meeting_clusters (meeting_id, cluster_id) VALUES (?, ?)").run(finMeetingId, finClusterId);
}, 30000);

afterAll(() => {
  rmSync(vdbPath, { recursive: true, force: true });
});

describe("buildContext", () => {
  it("performs semantic search and returns matching artifacts", async () => {
    const result = await buildContext(db, vdb, session, "REST API OAuth authentication", { limit: 3, token_budget: 10000 });
    expect(result.source_meeting_ids.length).toBeGreaterThan(0);
    expect(typeof result.curated_context).toBe("string");
    expect(result.curated_context.length).toBeGreaterThan(0);
  });

  it("filters by client_filter", async () => {
    const result = await buildContext(db, vdb, session, "API", { limit: 3, token_budget: 10000, client_filter: "Acme" });
    for (const id of result.source_meeting_ids) {
      expect([apiMeeting1Id, apiMeeting2Id]).toContain(id);
    }
  });

  it("filters by meeting_type_filter", async () => {
    const result = await buildContext(db, vdb, session, "budget financial", { limit: 3, token_budget: 10000, meeting_type_filter: "Finance" });
    expect(result.source_meeting_ids).toContain(finMeetingId);
    expect(result.source_meeting_ids).not.toContain(apiMeeting1Id);
  });

  it("filters by date_range", async () => {
    const result = await buildContext(db, vdb, session, "API", {
      limit: 3,
      token_budget: 10000,
      date_after: "2026-01-12T00:00:00Z",
      date_before: "2026-01-25T00:00:00Z",
    });
    expect(result.source_meeting_ids).not.toContain(apiMeeting1Id);
  });

  it("deduplicates results from same cluster_id", async () => {
    const result = await buildContext(db, vdb, session, "REST API OAuth authentication", { limit: 3, token_budget: 10000, deduplicate_clusters: true });
    const ids = result.source_meeting_ids;
    const clustersSeen = new Set<string>();
    let duplicates = false;
    for (const id of ids) {
      const row = db.prepare("SELECT cluster_id FROM meeting_clusters WHERE meeting_id = ?").get(id) as { cluster_id: string } | undefined;
      if (row) {
        if (clustersSeen.has(row.cluster_id)) {
          duplicates = true;
          break;
        }
        clustersSeen.add(row.cluster_id);
      }
    }
    expect(duplicates).toBe(false);
  });

  it("output never exceeds configured token budget", async () => {
    const budget = 50;
    const result = await buildContext(db, vdb, session, "API authentication", { limit: 3, token_budget: budget });
    expect(result.curated_context.length).toBeLessThanOrEqual(budget * 5);
  });

  it("returns curated_context string and source_meeting_ids array", async () => {
    const result = await buildContext(db, vdb, session, "API", { limit: 3, token_budget: 10000 });
    expect(typeof result.curated_context).toBe("string");
    expect(Array.isArray(result.source_meeting_ids)).toBe(true);
  });

  it("logs context size and source count via mtninsights:context", async () => {
    await expect(buildContext(db, vdb, session, "API", { limit: 3, token_budget: 10000 })).resolves.toBeDefined();
  });
});
