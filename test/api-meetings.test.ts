import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeDetection } from "../core/client-detection.js";
import { createApp } from "../api/server.js";

function seedClientRaw(db: ReturnType<typeof createDb>, name: string) {
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run(
    name, JSON.stringify([name]), JSON.stringify(["@testco.com"]),
  );
}

describe("GET /api/clients", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    seedClientRaw(db, "TestCo");
    app = createApp(db, ":memory:");
  });

  it("should return list of client names", async () => {
    const res = await app.request("/api/clients");
    expect(res.status).toBe(200);
    const body = await res.json() as string[];
    expect(body).toEqual(["TestCo"]);
  });
});

describe("GET /api/meetings", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId1: string;
  let meetingId2: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    seedClientRaw(db, "TestCo");
    seedClientRaw(db, "OtherCo");

    meetingId1 = ingestMeeting(db, {
      title: "TestCo DSU",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [{ id: "1", first_name: "A", last_name: "B", email: "a@testco.com" }],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "testco-dsu-1",
    });
    storeDetection(db, meetingId1, [{ client_name: "TestCo", confidence: 0.8, method: "participant" }]);

    meetingId2 = ingestMeeting(db, {
      title: "OtherCo Planning",
      timestamp: "2026-02-25T10:00:00.000Z",
      participants: [{ id: "2", first_name: "C", last_name: "D", email: "c@otherco.com" }],
      rawTranscript: "C | 00:00\nHi.",
      turns: [],
      sourceFilename: "otherco-plan-1",
    });
    storeDetection(db, meetingId2, [{ client_name: "OtherCo", confidence: 0.8, method: "participant" }]);

    app = createApp(db, ":memory:");
  });

  it("should return all meetings with correct shape", async () => {
    const res = await app.request("/api/meetings");
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; title: string; date: string; client: string; series: string; actionItemCount: number }[];
    expect(body).toHaveLength(2);
    expect(body[0]).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      date: expect.any(String),
      client: expect.any(String),
      series: expect.any(String),
      actionItemCount: expect.any(Number),
    });
  });

  it("should filter meetings by client query param", async () => {
    const res = await app.request("/api/meetings?client=TestCo");
    expect(res.status).toBe(200);
    const body = await res.json() as { title: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("TestCo DSU");
  });

  it("should filter meetings by after query param", async () => {
    const res = await app.request("/api/meetings?after=2026-02-25");
    expect(res.status).toBe(200);
    const body = await res.json() as { title: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("OtherCo Planning");
  });

  it("should filter meetings by before query param", async () => {
    const res = await app.request("/api/meetings?before=2026-02-24");
    expect(res.status).toBe(200);
    const body = await res.json() as { title: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("TestCo DSU");
  });

  it("should return 200 with meeting object for valid id", async () => {
    const res = await app.request(`/api/meetings/${meetingId1}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; title: string };
    expect(body).toMatchObject({ id: meetingId1, title: "TestCo DSU" });
  });

  it("should return 404 for unknown meeting id", async () => {
    const res = await app.request("/api/meetings/unknown-id");
    expect(res.status).toBe(404);
  });
});
