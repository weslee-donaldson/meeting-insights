import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildBatchDedupPrompt, filterAndCapItems, parseBatchDedupResponse, assignCanonicalGroups, deepScanClient } from "../core/dedup/deep-dedup.js";
import type { BatchDedupItem } from "../core/dedup/deep-dedup.js";
import { connectVectorDb, createItemTable } from "../core/search/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createLlmAdapter } from "../core/llm/adapter.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact } from "../core/extractor.js";
import type { Artifact } from "../core/extractor.js";
import { seedTestTenant, seedTestClient } from "./helpers/seed-test-tenant.js";

describe("buildBatchDedupPrompt", () => {
  const template = "Analyze these items:\n\n{{items}}";

  it("formats numbered items with priority tags and replaces placeholder", () => {
    const items = [
      { description: "Deploy application to production", priority: "critical" as const, meetingTitle: "Monday Standup", date: "2026-01-10" },
      { description: "Update API documentation", priority: "normal" as const, meetingTitle: "Friday Review", date: "2026-01-14" },
    ];
    const result = buildBatchDedupPrompt(template, items);
    expect(result).toBe(
      "Analyze these items:\n\n" +
      "Items:\n" +
      '0. [critical] [Monday Standup, 2026-01-10] "Deploy application to production"\n' +
      '1. [normal] [Friday Review, 2026-01-14] "Update API documentation"',
    );
  });

  it("returns template with empty items list when no items provided", () => {
    const result = buildBatchDedupPrompt(template, []);
    expect(result).toBe("Analyze these items:\n\nItems:");
  });
});

describe("filterAndCapItems", () => {
  const makeItem = (priority: "critical" | "normal" | "low", date: string, desc = "task"): BatchDedupItem => ({
    description: desc,
    priority,
    meetingTitle: "Meeting",
    date,
  });

  it("excludes low-priority items", () => {
    const items = [makeItem("critical", "2026-01-10"), makeItem("low", "2026-01-11"), makeItem("normal", "2026-01-12")];
    const result = filterAndCapItems(items, 50);
    expect(result).toEqual([
      { ...items[0], originalIndex: 0 },
      { ...items[2], originalIndex: 2 },
    ]);
  });

  it("caps each priority group to batchSize most recent items", () => {
    const items = [
      makeItem("critical", "2026-01-01", "old critical"),
      makeItem("critical", "2026-01-03", "new critical"),
      makeItem("critical", "2026-01-02", "mid critical"),
      makeItem("normal", "2026-01-05", "new normal"),
      makeItem("normal", "2026-01-04", "old normal"),
    ];
    const result = filterAndCapItems(items, 2);
    expect(result).toEqual([
      { ...items[1], originalIndex: 1 },
      { ...items[2], originalIndex: 2 },
      { ...items[3], originalIndex: 3 },
      { ...items[4], originalIndex: 4 },
    ]);
  });

  it("preserves original indices for mapping back", () => {
    const items = [makeItem("low", "2026-01-01"), makeItem("normal", "2026-01-02"), makeItem("critical", "2026-01-03")];
    const result = filterAndCapItems(items, 50);
    expect(result.map((r) => r.originalIndex)).toEqual([2, 1]);
  });

  it("returns empty array when all items are low priority", () => {
    const items = [makeItem("low", "2026-01-01"), makeItem("low", "2026-01-02")];
    expect(filterAndCapItems(items, 50)).toEqual([]);
  });
});

describe("parseBatchDedupResponse", () => {
  it("extracts valid groups from LLM response", () => {
    const response = { groups: [[0, 1], [2, 3]], reasoning: {} };
    expect(parseBatchDedupResponse(response, 5)).toEqual([[0, 1], [2, 3]]);
  });

  it("returns empty array when groups is missing", () => {
    expect(parseBatchDedupResponse({ reasoning: {} }, 5)).toEqual([]);
  });

  it("filters out-of-bounds indices", () => {
    const response = { groups: [[0, 5, 1]], reasoning: {} };
    expect(parseBatchDedupResponse(response, 3)).toEqual([[0, 1]]);
  });

  it("drops groups with fewer than 2 valid indices", () => {
    const response = { groups: [[0], [1, 2]], reasoning: {} };
    expect(parseBatchDedupResponse(response, 3)).toEqual([[1, 2]]);
  });

  it("removes duplicate indices across groups", () => {
    const response = { groups: [[0, 1], [1, 2]], reasoning: {} };
    expect(parseBatchDedupResponse(response, 3)).toEqual([[0, 1]]);
  });

  it("handles empty groups array", () => {
    expect(parseBatchDedupResponse({ groups: [] }, 5)).toEqual([]);
  });
});

describe("assignCanonicalGroups", () => {
  const makeItem = (date: string, desc = "task"): BatchDedupItem => ({
    description: desc,
    priority: "normal",
    meetingTitle: "Meeting",
    date,
  });

  it("assigns same canonical_id to grouped items with earliest date", () => {
    const items = [makeItem("2026-01-10", "A"), makeItem("2026-01-05", "B"), makeItem("2026-01-15", "C")];
    const result = assignCanonicalGroups([[0, 1]], items);
    const a0 = result.get(0)!;
    const a1 = result.get(1)!;
    const a2 = result.get(2)!;
    expect(a0.canonicalId).toBe(a1.canonicalId);
    expect(a0.firstMentionedAt).toBe("2026-01-05");
    expect(a1.firstMentionedAt).toBe("2026-01-05");
    expect(a2.canonicalId).not.toBe(a0.canonicalId);
    expect(a2.firstMentionedAt).toBe("2026-01-15");
  });

  it("assigns unique canonical_ids to singletons", () => {
    const items = [makeItem("2026-01-10"), makeItem("2026-01-11"), makeItem("2026-01-12")];
    const result = assignCanonicalGroups([], items);
    const ids = [result.get(0)!.canonicalId, result.get(1)!.canonicalId, result.get(2)!.canonicalId];
    expect(new Set(ids).size).toBe(3);
  });

  it("covers all items in assignments", () => {
    const items = [makeItem("2026-01-10"), makeItem("2026-01-11")];
    const result = assignCanonicalGroups([[0, 1]], items);
    expect(result.size).toBe(2);
  });
});

describe("deepScanClient", () => {
  let db: Database;
  let vdbPath: string;
  let table: Awaited<ReturnType<typeof createItemTable>>;
  let session: Awaited<ReturnType<typeof loadModel>>;
  const llm = createLlmAdapter({ type: "stub" });
  const template = "{{items}}";

  const baseArtifact: Artifact = {
    summary: "Test",
    decisions: [],
    proposed_features: [],
    action_items: [],
    open_questions: ["What next?"],
    risk_items: [],
    additional_notes: [],
    milestones: [],
  };

  beforeAll(async () => {
    session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");
  }, 30000);

  let clientId: string;

  const setupDb = async () => {
    db = createDb(":memory:");
    migrate(db);
    const { tenantId } = seedTestTenant(db);
    const client = seedTestClient(db, tenantId, "acme");
    clientId = client.id;
    vdbPath = join(tmpdir(), `lancedb-deep-dedup-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(vdbPath, { recursive: true });
    const vdb = await connectVectorDb(vdbPath);
    table = await createItemTable(vdb);
  };

  afterAll(() => {
    if (vdbPath) rmSync(vdbPath, { recursive: true, force: true });
  });

  it("groups paraphrased action items and auto-completes duplicates", async () => {
    await setupDb();
    const m1Id = ingestMeeting(db, { timestamp: "2026-01-10T10:00:00Z", title: "Standup", participants: [], turns: [], rawTranscript: "", sourceFilename: "standup" });
    const m2Id = ingestMeeting(db, { timestamp: "2026-01-12T10:00:00Z", title: "Review", participants: [], turns: [], rawTranscript: "", sourceFilename: "review" });

    storeArtifact(db, m1Id, {
      ...baseArtifact,
      action_items: [
        { description: "Deploy to production", owner: "Alice", requester: "Bob", due_date: null, priority: "normal" },
      ],
    });
    storeArtifact(db, m2Id, {
      ...baseArtifact,
      action_items: [
        { description: "Push app to prod", owner: "Carol", requester: "Dave", due_date: null, priority: "normal" },
      ],
    });

    const meetings = [
      { id: m1Id, date: "2026-01-10", title: "Standup" },
      { id: m2Id, date: "2026-01-12", title: "Review" },
    ];

    const result = await deepScanClient(db, table, session, llm, clientId, meetings, template);
    expect(result.mentionsCreated).toBeGreaterThanOrEqual(2);
    expect(result.duplicatesAutoCompleted).toBe(1);

    const completions = db.prepare("SELECT * FROM action_item_completions WHERE note LIKE '[auto-dedup-deep]%'").all() as Array<{ note: string }>;
    expect(completions.length).toBe(1);
    expect(completions[0].note).toContain("[auto-dedup-deep]");
  }, 30000);

  it("assigns unique canonical_ids to low-priority items without auto-completion", async () => {
    await setupDb();
    const m1Id = ingestMeeting(db, { timestamp: "2026-01-10T10:00:00Z", title: "Standup", participants: [], turns: [], rawTranscript: "", sourceFilename: "standup-low" });

    storeArtifact(db, m1Id, {
      ...baseArtifact,
      action_items: [
        { description: "Nice to have feature", owner: "", requester: "", due_date: null, priority: "low" },
        { description: "Another aspirational item", owner: "", requester: "", due_date: null, priority: "low" },
      ],
    });

    const meetings = [{ id: m1Id, date: "2026-01-10", title: "Standup" }];
    const result = await deepScanClient(db, table, session, llm, clientId, meetings, template);
    expect(result.duplicatesAutoCompleted).toBe(0);

    const mentions = db.prepare("SELECT * FROM item_mentions WHERE meeting_id = ? AND item_type = 'action_items'").all(m1Id) as Array<{ canonical_id: string }>;
    expect(mentions.length).toBe(2);
    expect(mentions[0].canonical_id).not.toBe(mentions[1].canonical_id);
  }, 30000);

  it("embeds and stores non-action-item fields with unique canonical_ids", async () => {
    await setupDb();
    const m1Id = ingestMeeting(db, { timestamp: "2026-01-10T10:00:00Z", title: "Standup", participants: [], turns: [], rawTranscript: "", sourceFilename: "standup-fields" });

    storeArtifact(db, m1Id, {
      ...baseArtifact,
      open_questions: ["What is the timeline?", "Who owns the deployment?"],
      action_items: [{ description: "Deploy", owner: "Alice", requester: "Bob", due_date: null, priority: "normal" }],
    });

    const meetings = [{ id: m1Id, date: "2026-01-10", title: "Standup" }];
    const result = await deepScanClient(db, table, session, llm, clientId, meetings, template);
    const oqMentions = db.prepare("SELECT * FROM item_mentions WHERE meeting_id = ? AND item_type = 'open_questions'").all(m1Id);
    expect(oqMentions.length).toBe(2);
    expect(result.mentionsCreated).toBe(3);
  }, 30000);
});
