import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { connectVectorDb, createItemTable } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import {
  embedItem,
  storeItemVector,
  searchSimilarItems,
  recordMention,
  getMentionsByCanonical,
  getMentionStats,
  cleanupMentions,
  cleanupItemVectors,
} from "../core/item-dedup.js";
import { cosineSimilarity } from "../core/math.js";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";

let db: Database;
let vdbPath: string;
let vdb: Awaited<ReturnType<typeof connectVectorDb>>;
let table: Awaited<ReturnType<typeof createItemTable>>;
let session: Awaited<ReturnType<typeof loadModel>>;

beforeAll(async () => {
  db = createDb(":memory:");
  migrate(db);
  vdbPath = join(tmpdir(), `lancedb-item-dedup-${Date.now()}`);
  mkdirSync(vdbPath, { recursive: true });
  vdb = await connectVectorDb(vdbPath);
  session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");
  table = await createItemTable(vdb);

  const items = [
    { id: "can-1", text: "Deploy application to production", type: "action_items", meeting: "m1", date: "2026-01-10" },
    { id: "can-1", text: "Push app to production environment", type: "action_items", meeting: "m2", date: "2026-01-12" },
    { id: "can-2", text: "Review quarterly budget report", type: "action_items", meeting: "m1", date: "2026-01-10" },
  ];

  for (const item of items) {
    const vec = await embedItem(session, item.text);
    await storeItemVector(table, item.id, item.text, item.type, item.meeting, item.date, vec);
  }
}, 30000);

afterAll(() => {
  rmSync(vdbPath, { recursive: true, force: true });
});

describe("embedItem", () => {
  it("returns 384-dim Float32Array", async () => {
    const vec = await embedItem(session, "Deploy to production");
    expect(vec).toBeInstanceOf(Float32Array);
    expect(vec.length).toBe(384);
  });

  it("produces high cosine similarity for semantically similar texts", async () => {
    const a = await embedItem(session, "Deploy application to production");
    const b = await embedItem(session, "Deploy app to production environment");
    const sim = cosineSimilarity(Array.from(a), Array.from(b));
    expect(sim).toBeGreaterThan(0.7);
  });

  it("produces low cosine similarity for unrelated texts", async () => {
    const a = await embedItem(session, "Deploy app to production");
    const b = await embedItem(session, "Review quarterly budget");
    const sim = cosineSimilarity(Array.from(a), Array.from(b));
    expect(sim).toBeLessThan(0.5);
  });
});

describe("storeItemVector", () => {
  it("stores rows queryable with correct fields", async () => {
    const rows = await table.query().limit(100).toArray();
    expect(rows.length).toBe(3);
    const row = rows[0] as Record<string, unknown>;
    expect(typeof row.canonical_id).toBe("string");
    expect(typeof row.item_text).toBe("string");
    expect(typeof row.item_type).toBe("string");
    expect(typeof row.meeting_id).toBe("string");
    expect(typeof row.date).toBe("string");
  });
});

describe("searchSimilarItems", () => {
  it("returns similar items ranked by distance", async () => {
    const results = await searchSimilarItems(table, session, "Deploy to production", { limit: 3 });
    expect(results.length).toBe(3);
    expect(results[0].distance).toBeLessThan(results[2].distance);
  });

  it("top results are the deploy-related items, not the budget item", async () => {
    const results = await searchSimilarItems(table, session, "Deploy app to prod", { limit: 3 });
    const deployResults = results.slice(0, 2);
    for (const r of deployResults) {
      expect(r.item_text.toLowerCase()).toMatch(/deploy|push|prod/);
    }
  });

  it("filters by item_type when specified", async () => {
    const results = await searchSimilarItems(table, session, "Deploy to production", { itemType: "action_items", limit: 10 });
    for (const r of results) {
      expect(r.item_type).toBe("action_items");
    }
  });

  it("returns canonical_id, meeting_id, date, and distance per result", async () => {
    const results = await searchSimilarItems(table, session, "Deploy to production", { limit: 1 });
    const r = results[0];
    expect(typeof r.canonical_id).toBe("string");
    expect(typeof r.meeting_id).toBe("string");
    expect(typeof r.date).toBe("string");
    expect(typeof r.distance).toBe("number");
  });
});

describe("recordMention", () => {
  beforeEach(() => {
    db.prepare("DELETE FROM item_mentions").run();
    db.prepare("DELETE FROM meetings").run();
    db.prepare("INSERT INTO meetings (id, title, date) VALUES ('mt-1', 'Monday Standup', '2026-01-10')").run();
    db.prepare("INSERT INTO meetings (id, title, date) VALUES ('mt-2', 'Wednesday Standup', '2026-01-12')").run();
    db.prepare("INSERT INTO meetings (id, title, date) VALUES ('mt-3', 'Friday Standup', '2026-01-14')").run();
  });

  it("inserts a mention row queryable by canonical_id", () => {
    recordMention(db, "can-a", "mt-1", "action_items", 0, "Deploy to prod", "2026-01-10");
    const rows = db.prepare("SELECT * FROM item_mentions WHERE canonical_id = 'can-a'").all();
    expect(rows.length).toBe(1);
    expect(rows[0]).toEqual({
      canonical_id: "can-a",
      meeting_id: "mt-1",
      item_type: "action_items",
      item_index: 0,
      item_text: "Deploy to prod",
      first_mentioned_at: "2026-01-10",
    });
  });

  it("sets first_mentioned_at to earliest date across mentions", () => {
    recordMention(db, "can-b", "mt-2", "action_items", 0, "Deploy to prod", "2026-01-12");
    recordMention(db, "can-b", "mt-1", "action_items", 1, "Deploy app to production", "2026-01-10");
    const rows = db.prepare("SELECT first_mentioned_at FROM item_mentions WHERE canonical_id = 'can-b'").all() as { first_mentioned_at: string }[];
    for (const row of rows) {
      expect(row.first_mentioned_at).toBe("2026-01-10");
    }
  });
});

describe("getMentionsByCanonical", () => {
  beforeEach(() => {
    db.prepare("DELETE FROM item_mentions").run();
    db.prepare("DELETE FROM meetings").run();
    db.prepare("INSERT INTO meetings (id, title, date) VALUES ('mt-1', 'Monday Standup', '2026-01-10')").run();
    db.prepare("INSERT INTO meetings (id, title, date) VALUES ('mt-2', 'Wednesday Standup', '2026-01-12')").run();
    db.prepare("INSERT INTO meetings (id, title, date) VALUES ('mt-3', 'Friday Standup', '2026-01-14')").run();
  });

  it("returns all mentions sorted by date ascending", () => {
    recordMention(db, "can-c", "mt-3", "action_items", 0, "Deploy v3", "2026-01-14");
    recordMention(db, "can-c", "mt-1", "action_items", 0, "Deploy v1", "2026-01-10");
    recordMention(db, "can-c", "mt-2", "action_items", 0, "Deploy v2", "2026-01-12");
    const mentions = getMentionsByCanonical(db, "can-c");
    expect(mentions.length).toBe(3);
    expect(mentions[0].meeting_id).toBe("mt-1");
    expect(mentions[1].meeting_id).toBe("mt-2");
    expect(mentions[2].meeting_id).toBe("mt-3");
  });
});

describe("getMentionStats", () => {
  beforeEach(() => {
    db.prepare("DELETE FROM item_mentions").run();
    db.prepare("DELETE FROM meetings").run();
    db.prepare("INSERT INTO meetings (id, title, date) VALUES ('mt-1', 'Monday Standup', '2026-01-10')").run();
    db.prepare("INSERT INTO meetings (id, title, date) VALUES ('mt-2', 'Wednesday Standup', '2026-01-12')").run();
    db.prepare("INSERT INTO meetings (id, title, date) VALUES ('mt-3', 'Friday Standup', '2026-01-14')").run();
  });

  it("returns correct mention counts per canonical item in a meeting", () => {
    recordMention(db, "can-d", "mt-1", "action_items", 0, "Deploy", "2026-01-10");
    recordMention(db, "can-d", "mt-2", "action_items", 0, "Deploy", "2026-01-12");
    recordMention(db, "can-d", "mt-3", "action_items", 0, "Deploy", "2026-01-14");
    recordMention(db, "can-e", "mt-1", "decisions", 1, "Use React", "2026-01-10");

    const stats = getMentionStats(db, "mt-1");
    expect(stats.length).toBe(2);
    const deployStat = stats.find(s => s.canonical_id === "can-d");
    const reactStat = stats.find(s => s.canonical_id === "can-e");
    expect(deployStat).toEqual({
      canonical_id: "can-d",
      item_type: "action_items",
      item_index: 0,
      mention_count: 3,
      first_mentioned_at: "2026-01-10",
    });
    expect(reactStat).toEqual({
      canonical_id: "can-e",
      item_type: "decisions",
      item_index: 1,
      mention_count: 1,
      first_mentioned_at: "2026-01-10",
    });
  });
});

describe("cleanupMentions", () => {
  beforeEach(() => {
    db.prepare("DELETE FROM item_mentions").run();
    db.prepare("DELETE FROM meetings").run();
    db.prepare("INSERT INTO meetings (id, title, date) VALUES ('mt-1', 'Monday Standup', '2026-01-10')").run();
    db.prepare("INSERT INTO meetings (id, title, date) VALUES ('mt-2', 'Wednesday Standup', '2026-01-12')").run();
  });

  it("removes only the specified meeting's mentions", () => {
    recordMention(db, "can-f", "mt-1", "action_items", 0, "Deploy", "2026-01-10");
    recordMention(db, "can-f", "mt-2", "action_items", 0, "Deploy", "2026-01-12");
    cleanupMentions(db, "mt-1");
    const remaining = db.prepare("SELECT * FROM item_mentions").all();
    expect(remaining.length).toBe(1);
    expect((remaining[0] as { meeting_id: string }).meeting_id).toBe("mt-2");
  });
});

describe("cleanupItemVectors", () => {
  it("removes only the specified meeting's vectors from the item table", async () => {
    const cleanupTable = await createItemTable(vdb);
    const vec = await embedItem(session, "test cleanup item");
    await storeItemVector(cleanupTable, "can-clean-1", "test item", "action_items", "cleanup-m1", "2026-01-01", vec);
    await storeItemVector(cleanupTable, "can-clean-2", "other item", "action_items", "cleanup-m2", "2026-01-02", vec);
    await cleanupItemVectors(cleanupTable, "cleanup-m1");
    const rows = await cleanupTable.query().where("meeting_id = 'cleanup-m1'").toArray();
    expect(rows.length).toBe(0);
    const remaining = await cleanupTable.query().where("meeting_id = 'cleanup-m2'").toArray();
    expect(remaining.length).toBe(1);
  });
});
