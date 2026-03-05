import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mergeSearchResults, hybridVectorSearch } from "../core/hybrid-search.js";
import { createDb, migrate } from "../core/db.js";
import { connectVectorDb, createMeetingTable, createFeatureTable, createItemTable } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { embedMeeting, storeMeetingVector } from "../core/meeting-pipeline.js";
import { embedFeature, storeFeatureVector } from "../core/feature-embedding.js";
import { embedItem, storeItemVector } from "../core/item-dedup.js";
import type { DatabaseSync as Database } from "node:sqlite";

describe("mergeSearchResults", () => {
  it("returns min score per meeting_id across multiple result arrays", () => {
    const a = [
      { meeting_id: "m1", score: 0.5 },
      { meeting_id: "m2", score: 0.8 },
    ];
    const b = [
      { meeting_id: "m1", score: 0.3 },
      { meeting_id: "m3", score: 0.6 },
    ];
    const merged = mergeSearchResults([a, b]);
    expect(merged).toEqual(
      new Map([
        ["m1", 0.3],
        ["m2", 0.8],
        ["m3", 0.6],
      ]),
    );
  });

  it("handles empty arrays gracefully", () => {
    const merged = mergeSearchResults([[], []]);
    expect(merged).toEqual(new Map());
  });

  it("handles single result array", () => {
    const a = [{ meeting_id: "m1", score: 0.4 }];
    const merged = mergeSearchResults([a]);
    expect(merged).toEqual(new Map([["m1", 0.4]]));
  });

  it("picks the lower score when same meeting appears in all arrays", () => {
    const a = [{ meeting_id: "m1", score: 1.2 }];
    const b = [{ meeting_id: "m1", score: 0.9 }];
    const c = [{ meeting_id: "m1", score: 1.5 }];
    const merged = mergeSearchResults([a, b, c]);
    expect(merged).toEqual(new Map([["m1", 0.9]]));
  });
});

let db: Database;
let vdbPath: string;
let vdb: Awaited<ReturnType<typeof connectVectorDb>>;
let session: Awaited<ReturnType<typeof loadModel>>;

const apiMeetingId = "hybrid-api-001";
const opsMeetingId = "hybrid-ops-001";

beforeAll(async () => {
  db = createDb(":memory:");
  migrate(db);

  db.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run("Acme", "[]", "[]");
  db.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run("Globex", "[]", "[]");
  db.prepare("INSERT INTO meetings (id, title, meeting_type, date) VALUES (?, ?, ?, ?)").run(
    apiMeetingId, "API Integration Meeting", "Architecture", "2026-01-10T10:00:00Z",
  );
  db.prepare("INSERT INTO meetings (id, title, meeting_type, date) VALUES (?, ?, ?, ?)").run(
    opsMeetingId, "Ops Monitoring Meeting", "Operations", "2026-01-15T10:00:00Z",
  );
  db.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES (?, ?, ?, ?)").run(
    apiMeetingId, "Acme", 0.9, "title",
  );
  db.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES (?, ?, ?, ?)").run(
    opsMeetingId, "Globex", 0.9, "title",
  );

  vdbPath = join(tmpdir(), `lancedb-hybrid-${Date.now()}`);
  mkdirSync(vdbPath, { recursive: true });
  vdb = await connectVectorDb(vdbPath);
  session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");

  const meetingTable = await createMeetingTable(vdb);
  const featureTable = await createFeatureTable(vdb);
  const itemTable = await createItemTable(vdb);

  const apiVec = await embedMeeting(session, "REST API integration and OAuth2 authentication strategy");
  await storeMeetingVector(meetingTable, apiMeetingId, apiVec, { client: "Acme", meeting_type: "Architecture", date: "2026-01-10T10:00:00Z" });

  const opsVec = await embedMeeting(session, "Monitoring dashboard and alerting setup for production systems");
  await storeMeetingVector(meetingTable, opsMeetingId, opsVec, { client: "Globex", meeting_type: "Operations", date: "2026-01-15T10:00:00Z" });

  const featureVec = await embedFeature(session, "OAuth2 single sign-on");
  await storeFeatureVector(featureTable, "OAuth2 single sign-on", apiMeetingId, { client: "Acme", date: "2026-01-10T10:00:00Z" }, featureVec);

  const dlqVec = await embedItem(session, "Implement DLQ for failed webhook messages");
  await storeItemVector(itemTable, "can-dlq", "Implement DLQ for failed webhook messages", "action_items", opsMeetingId, "2026-01-15T10:00:00Z", dlqVec);
}, 30000);

afterAll(() => {
  rmSync(vdbPath, { recursive: true, force: true });
});

describe("hybridVectorSearch", () => {
  it("finds meeting with DLQ only in item_vectors via multi-table search", async () => {
    const results = await hybridVectorSearch(db, vdb, session, "DLQ dead letter queue", { limit: 10 });
    const opsResult = results.find((r) => r.meeting_id === opsMeetingId);
    expect(opsResult).toBeDefined();
  });

  it("returns metadata enriched from SQLite for all results", async () => {
    const results = await hybridVectorSearch(db, vdb, session, "REST API authentication", { limit: 10 });
    const apiResult = results.find((r) => r.meeting_id === apiMeetingId);
    expect(apiResult).toBeDefined();
    expect(apiResult!.client).toBe("Acme");
    expect(apiResult!.meeting_type).toBe("Architecture");
    expect(apiResult!.date).toBe("2026-01-10T10:00:00Z");
  });

  it("filters results exceeding maxDistance on merged scores", async () => {
    const results = await hybridVectorSearch(db, vdb, session, "REST API OAuth", { limit: 10, maxDistance: 0.5 });
    expect(results.every((r) => r.score <= 0.5)).toBe(true);
  });

  it("returns results sorted by score ascending (best first)", async () => {
    const results = await hybridVectorSearch(db, vdb, session, "API authentication", { limit: 10 });
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i - 1].score);
    }
  });
});
