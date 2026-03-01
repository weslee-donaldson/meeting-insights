import { describe, it, expect, beforeAll } from "vitest";
import { randomUUID } from "node:crypto";
import { createDb, migrate } from "../src/db.js";
import { ingestMeeting } from "../src/ingest.js";
import { storeArtifact } from "../src/extractor.js";
import { overrideClient, overrideTag, flagExtraction } from "../src/feedback.js";
import type { DatabaseSync as Database } from "node:sqlite";

let db: Database;
let meetingId: string;
let clusterId: string;

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

  meetingId = ingestMeeting(db, makeParsed("Test Meeting", "test-1"));

  storeArtifact(db, meetingId, {
    summary: "Original summary",
    decisions: [],
    proposed_features: [],
    action_items: [],
    technical_topics: [],
    open_questions: [],
    risk_items: [],
  });

  db.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run("OldClient", "[]", "[]");
  db.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run("NewClient", "[]", "[]");
  db.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES (?, ?, ?, ?)").run(
    meetingId,
    "OldClient",
    0.5,
    "title",
  );

  clusterId = randomUUID();
  const now = new Date().toISOString();
  db.prepare("INSERT INTO clusters (cluster_id, centroid_snapshot, updated_at) VALUES (?, ?, ?)").run(
    clusterId,
    "[]",
    now,
  );
});

describe("overrideClient", () => {
  it("updates client_detections table for a meeting_id", () => {
    overrideClient(db, meetingId, "NewClient");
    const row = db
      .prepare("SELECT client_name, method FROM client_detections WHERE meeting_id = ?")
      .get(meetingId) as { client_name: string; method: string };
    expect(row.client_name).toBe("NewClient");
    expect(row.method).toBe("override");
  });
});

describe("overrideTag", () => {
  it("updates generated_tags in clusters table for a cluster_id", () => {
    const newTags = ["custom tag A", "custom tag B", "custom tag C"];
    overrideTag(db, clusterId, newTags);
    const row = db
      .prepare("SELECT generated_tags FROM clusters WHERE cluster_id = ?")
      .get(clusterId) as { generated_tags: string };
    expect(JSON.parse(row.generated_tags)).toEqual(newTags);
  });
});

describe("flagExtraction", () => {
  it("marks artifact row for re-extraction", () => {
    flagExtraction(db, meetingId);
    const row = db.prepare("SELECT needs_reextraction FROM artifacts WHERE meeting_id = ?").get(meetingId) as {
      needs_reextraction: number;
    };
    expect(row.needs_reextraction).toBe(1);
  });
});
