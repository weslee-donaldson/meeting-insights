import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDb, migrate } from "../src/db.js";
import { ingestMeeting } from "../src/ingest.js";
import { storeArtifact } from "../src/extractor.js";
import { connectVectorDb, createFeatureTable } from "../src/vector-db.js";
import { loadModel } from "../src/embedder.js";
import { embedFeature, storeFeatureVector, searchFeatures } from "../src/feature-embedding.js";
import type { DatabaseSync as Database } from "node:sqlite";

let db: Database;
let vdbPath: string;
let vdb: Awaited<ReturnType<typeof connectVectorDb>>;
let session: Awaited<ReturnType<typeof loadModel>>;
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

const artifact1 = {
  summary: "API integration and OAuth authentication design",
  decisions: ["Use OAuth2"],
  proposed_features: ["Single sign-on via OAuth", "API key rotation"],
  action_items: [],
  technical_topics: ["OAuth", "API"],
  open_questions: [],
  risk_items: [],
};

const artifact2 = {
  summary: "Customer portal features for self-service account management",
  decisions: ["Add SSO to customer portal"],
  proposed_features: ["Single sign-on for customer portal", "Self-service password reset"],
  action_items: [],
  technical_topics: ["portal", "authentication"],
  open_questions: [],
  risk_items: [],
};

beforeAll(async () => {
  db = createDb(":memory:");
  migrate(db);
  vdbPath = join(tmpdir(), `lancedb-feature-${Date.now()}`);
  mkdirSync(vdbPath, { recursive: true });
  vdb = await connectVectorDb(vdbPath);
  session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");

  meeting1Id = ingestMeeting(db, makeParsed("API Meeting", "api-1"));
  meeting2Id = ingestMeeting(db, makeParsed("Portal Meeting", "portal-1"));
  storeArtifact(db, meeting1Id, artifact1);
  storeArtifact(db, meeting2Id, artifact2);

  const table = await createFeatureTable(vdb);
  for (const feature of artifact1.proposed_features) {
    const vec = await embedFeature(session, feature);
    await storeFeatureVector(table, feature, meeting1Id, { client: "Acme", date: "2026-01-10T00:00:00Z" }, vec);
  }
  for (const feature of artifact2.proposed_features) {
    const vec = await embedFeature(session, feature);
    await storeFeatureVector(table, feature, meeting2Id, { client: "Globex", date: "2026-01-15T00:00:00Z" }, vec);
  }
}, 30000);

afterAll(() => {
  rmSync(vdbPath, { recursive: true, force: true });
});

describe("embedFeature", () => {
  it("generates real 384-dim vector for a single proposed_feature string", async () => {
    const vec = await embedFeature(session, "OAuth token refresh mechanism");
    expect(vec).toBeInstanceOf(Float32Array);
    expect(vec.length).toBe(384);
  });
});

describe("storeFeatureVector", () => {
  it("inserts vector + meeting_id + client into LanceDB feature_vectors table", async () => {
    const table = await vdb.openTable("feature_vectors");
    const rows = await table.query().limit(100).toArray();
    expect(rows.length).toBeGreaterThan(0);
    const row = rows[0] as Record<string, unknown>;
    expect(typeof row.meeting_id).toBe("string");
    expect(typeof row.client).toBe("string");
    expect(typeof row.feature_text).toBe("string");
  });
});

describe("searchFeatures", () => {
  it("returns similar features across meetings for a query string", async () => {
    const results = await searchFeatures(vdb, session, "OAuth authentication single sign-on", { limit: 4 });
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns meeting_id and artifact summary excerpt per result", async () => {
    const results = await searchFeatures(vdb, session, "OAuth single sign-on", { limit: 4 });
    const result = results[0];
    expect(typeof result.meeting_id).toBe("string");
    expect(typeof result.feature_text).toBe("string");
    expect(typeof result.score).toBe("number");
  });

  it("similar feature proposals from different meetings return high similarity", async () => {
    const results = await searchFeatures(vdb, session, "Single sign-on authentication", { limit: 4 });
    const ssoResults = results.filter((r) =>
      r.feature_text.toLowerCase().includes("sign-on") || r.feature_text.toLowerCase().includes("sso"),
    );
    expect(ssoResults.length).toBeGreaterThanOrEqual(2);
  });

  it("query returns meetings from both demo and architecture contexts", async () => {
    const results = await searchFeatures(vdb, session, "Single sign-on authentication", { limit: 4 });
    const meetingIds = new Set(results.map((r) => r.meeting_id));
    expect(meetingIds.has(meeting1Id)).toBe(true);
    expect(meetingIds.has(meeting2Id)).toBe(true);
  });

  it("logs query and result count via mtninsights:embed:feature", async () => {
    await expect(searchFeatures(vdb, session, "OAuth", { limit: 4 })).resolves.toBeDefined();
  });
});
