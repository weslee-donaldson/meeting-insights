import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { connectVectorDb, createItemTable } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { embedItem, storeItemVector, searchSimilarItems } from "../core/item-dedup.js";
import { cosineSimilarity } from "../core/math.js";

let vdbPath: string;
let vdb: Awaited<ReturnType<typeof connectVectorDb>>;
let table: Awaited<ReturnType<typeof createItemTable>>;
let session: Awaited<ReturnType<typeof loadModel>>;

beforeAll(async () => {
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
