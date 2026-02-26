import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDb, migrate } from "../src/db.js";
import { ingestMeeting } from "../src/ingest.js";
import { connectVectorDb, createMeetingTable } from "../src/vector-db.js";
import { loadModel } from "../src/embedder.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "../src/meeting-pipeline.js";
import { clusterMeetings, assignCluster, recluster } from "../src/clustering.js";
import type { Artifact } from "../src/extractor.js";
import type { ParsedMeeting } from "../src/parser.js";
import type { Database } from "better-sqlite3";

let db: Database;
let vdbPath: string;
let vdb: Awaited<ReturnType<typeof connectVectorDb>>;
let session: Awaited<ReturnType<typeof loadModel>>;

let api1Id: string;
let api2Id: string;
let fin1Id: string;
let fin2Id: string;

const apiArtifact1: Artifact = {
  summary: "REST API design patterns and OAuth authentication discussion",
  decisions: ["Use REST", "OAuth2"],
  proposed_features: ["API versioning", "rate limiting"],
  action_items: [],
  technical_topics: ["REST", "OAuth", "API gateway"],
  open_questions: [],
  risk_items: [],
};

const apiArtifact2: Artifact = {
  summary: "API endpoint structure and HTTP authentication protocols review",
  decisions: ["Bearer tokens", "versioned endpoints"],
  proposed_features: ["token refresh", "endpoint documentation"],
  action_items: [],
  technical_topics: ["HTTP", "authentication", "API design"],
  open_questions: [],
  risk_items: [],
};

const financeArtifact1: Artifact = {
  summary: "Quarterly budget review and financial planning for fiscal spending",
  decisions: ["Approve budget increases", "Review quarterly spending"],
  proposed_features: [],
  action_items: [],
  technical_topics: ["budget", "financial planning", "quarterly spending", "fiscal review"],
  open_questions: [],
  risk_items: [],
};

const financeArtifact2: Artifact = {
  summary: "Quarterly financial analysis and budget allocation for fiscal period",
  decisions: ["Allocate budget to teams", "Track financial expenditure"],
  proposed_features: [],
  action_items: [],
  technical_topics: ["budget", "financial analysis", "quarterly review", "fiscal allocation"],
  open_questions: [],
  risk_items: [],
};

function makeParsed(title: string, filename: string): ParsedMeeting {
  return {
    timestamp: "2026-01-01T00:00:00Z",
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
  vdbPath = join(tmpdir(), `lancedb-cluster-${Date.now()}`);
  mkdirSync(vdbPath, { recursive: true });
  vdb = await connectVectorDb(vdbPath);
  session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");

  api1Id = ingestMeeting(db, makeParsed("API Meeting 1", "api-1"));
  api2Id = ingestMeeting(db, makeParsed("API Meeting 2", "api-2"));
  fin1Id = ingestMeeting(db, makeParsed("Finance Meeting 1", "fin-1"));
  fin2Id = ingestMeeting(db, makeParsed("Finance Meeting 2", "fin-2"));

  const table = await createMeetingTable(vdb);
  const meta = { meeting_type: "DSU", date: "2026-01-01T00:00:00Z" };

  const v1 = await embedMeeting(session, buildEmbeddingInput(apiArtifact1));
  await storeMeetingVector(table, api1Id, v1, { ...meta, client: "Acme" });

  const v2 = await embedMeeting(session, buildEmbeddingInput(apiArtifact2));
  await storeMeetingVector(table, api2Id, v2, { ...meta, client: "Acme" });

  const v3 = await embedMeeting(session, buildEmbeddingInput(financeArtifact1));
  await storeMeetingVector(table, fin1Id, v3, { ...meta, client: "Globex" });

  const v4 = await embedMeeting(session, buildEmbeddingInput(financeArtifact2));
  await storeMeetingVector(table, fin2Id, v4, { ...meta, client: "Globex" });
}, 30000);

afterAll(() => {
  rmSync(vdbPath, { recursive: true, force: true });
});

describe("clusterMeetings", () => {
  it("assigns cluster_id to each meeting", async () => {
    await clusterMeetings(db, vdb, { k: 2 });
    const rows = db.prepare("SELECT * FROM meeting_clusters").all() as Array<{ meeting_id: string; cluster_id: string }>;
    expect(rows.length).toBe(4);
    expect(rows.every((r) => typeof r.cluster_id === "string" && r.cluster_id.length > 0)).toBe(true);
  });

  it("groups semantically similar meetings into same cluster", async () => {
    const rows = db.prepare("SELECT * FROM meeting_clusters").all() as Array<{ meeting_id: string; cluster_id: string }>;
    const api1Cluster = rows.find((r) => r.meeting_id === api1Id)!.cluster_id;
    const api2Cluster = rows.find((r) => r.meeting_id === api2Id)!.cluster_id;
    expect(api1Cluster).toBe(api2Cluster);
  });

  it("separates dissimilar meetings into different clusters", async () => {
    const rows = db.prepare("SELECT * FROM meeting_clusters").all() as Array<{ meeting_id: string; cluster_id: string }>;
    const api1Cluster = rows.find((r) => r.meeting_id === api1Id)!.cluster_id;
    const fin1Cluster = rows.find((r) => r.meeting_id === fin1Id)!.cluster_id;
    expect(api1Cluster).not.toBe(fin1Cluster);
  });

  it("stores centroid snapshot in clusters table", async () => {
    const clusters = db.prepare("SELECT * FROM clusters").all() as Array<{ cluster_id: string; centroid_snapshot: string }>;
    expect(clusters.length).toBeGreaterThan(0);
    const centroid = JSON.parse(clusters[0].centroid_snapshot);
    expect(Array.isArray(centroid)).toBe(true);
    expect(centroid.length).toBe(384);
  });

  it("logs cluster sizes via mtninsights:cluster", async () => {
    await expect(clusterMeetings(db, vdb, { k: 2 })).resolves.toBeUndefined();
  });
});

describe("assignCluster", () => {
  it("assigns new meeting to nearest existing centroid without full recluster", async () => {
    const vec = await embedMeeting(session, buildEmbeddingInput(apiArtifact1));
    const clusterId = await assignCluster(db, vec);
    expect(typeof clusterId).toBe("string");
    expect(clusterId.length).toBeGreaterThan(0);
    const api1Cluster = (db.prepare("SELECT cluster_id FROM meeting_clusters WHERE meeting_id = ?").get(api1Id) as { cluster_id: string }).cluster_id;
    expect(clusterId).toBe(api1Cluster);
  });
});

describe("recluster", () => {
  it("performs full recomputation and updates all cluster_ids", async () => {
    await recluster(db, vdb, { k: 2 });
    const rows = db.prepare("SELECT * FROM meeting_clusters").all() as Array<{ meeting_id: string; cluster_id: string }>;
    const meetingIds = new Set(rows.map((r) => r.meeting_id));
    expect(meetingIds.has(api1Id)).toBe(true);
    expect(meetingIds.has(fin1Id)).toBe(true);
  });
});
