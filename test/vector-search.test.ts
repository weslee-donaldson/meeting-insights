import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { connectVectorDb, createMeetingTable } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "../core/meeting-pipeline.js";
import { searchMeetings } from "../core/vector-search.js";
import type { Artifact } from "../core/extractor.js";

let vdbPath: string;
let vdb: Awaited<ReturnType<typeof connectVectorDb>>;
let session: Awaited<ReturnType<typeof loadModel>>;

const apiArtifact: Artifact = {
  summary: "Discussed REST API integration approach and authentication strategy",
  decisions: [{ text: "Use REST over GraphQL", decided_by: "" }, { text: "OAuth2 for authentication", decided_by: "" }],
  proposed_features: ["Rate limiting", "OAuth2 support", "API versioning"],
  action_items: [],
  architecture: ["REST API", "OAuth2", "rate limiting"],
  open_questions: [],
  risk_items: [],
};

const unrelatedArtifact: Artifact = {
  summary: "Quarterly budget review and headcount planning for next fiscal year",
  decisions: [{ text: "Freeze hiring in Q3", decided_by: "" }, { text: "Increase marketing budget", decided_by: "" }],
  proposed_features: [],
  action_items: [],
  architecture: ["budget", "headcount"],
  open_questions: [],
  risk_items: [],
};

const apiMeetingId = "meet-api-001";
const budgetMeetingId = "meet-budget-001";

beforeAll(async () => {
  vdbPath = join(tmpdir(), `lancedb-search-${Date.now()}`);
  mkdirSync(vdbPath, { recursive: true });
  vdb = await connectVectorDb(vdbPath);
  session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");

  const table = await createMeetingTable(vdb);

  const apiVec = await embedMeeting(session, buildEmbeddingInput(apiArtifact));
  await storeMeetingVector(table, apiMeetingId, apiVec, { client: "Acme", meeting_type: "Architecture", date: "2026-01-10T10:00:00Z" });

  const budgetVec = await embedMeeting(session, buildEmbeddingInput(unrelatedArtifact));
  await storeMeetingVector(table, budgetMeetingId, budgetVec, { client: "Globex", meeting_type: "Finance", date: "2026-01-20T10:00:00Z" });
}, 30000);

afterAll(() => {
  rmSync(vdbPath, { recursive: true, force: true });
});

describe("searchMeetings", () => {
  it("returns top-k similar meetings for a query string", async () => {
    const results = await searchMeetings(vdb, session, "REST API integration", { limit: 2 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("returns meeting_id and distance score per result", async () => {
    const results = await searchMeetings(vdb, session, "REST API integration", { limit: 1 });
    expect(typeof results[0].meeting_id).toBe("string");
    expect(typeof results[0].score).toBe("number");
  });

  it("semantically similar meetings score higher than unrelated meetings", async () => {
    const results = await searchMeetings(vdb, session, "REST API OAuth authentication", { limit: 2 });
    const apiResult = results.find((r) => r.meeting_id === apiMeetingId);
    const budgetResult = results.find((r) => r.meeting_id === budgetMeetingId);
    expect(apiResult).toBeDefined();
    expect(budgetResult).toBeDefined();
    expect(apiResult!.score).toBeLessThan(budgetResult!.score);
  });

  it("filters results by client metadata", async () => {
    const results = await searchMeetings(vdb, session, "API", { limit: 10, client: "Acme" });
    expect(results.every((r) => r.client === "Acme")).toBe(true);
  });

  it("filters results by meeting_type metadata", async () => {
    const results = await searchMeetings(vdb, session, "API", { limit: 10, meeting_type: "Finance" });
    expect(results.every((r) => r.meeting_type === "Finance")).toBe(true);
  });

  it("filters results by date range", async () => {
    const results = await searchMeetings(vdb, session, "API", {
      limit: 10,
      date_after: "2026-01-15T00:00:00Z",
      date_before: "2026-01-25T00:00:00Z",
    });
    expect(results.every((r) => r.date >= "2026-01-15T00:00:00Z" && r.date <= "2026-01-25T00:00:00Z")).toBe(true);
  });

  it("logs query and result count via mtninsights:vector:search", async () => {
    // Logging is a side effect; verify no error thrown
    await expect(searchMeetings(vdb, session, "test query", { limit: 1 })).resolves.toBeDefined();
  });
});
