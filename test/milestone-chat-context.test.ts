import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createMilestone, addMilestoneMention, getMilestoneChatContext } from "../core/timelines.js";
import type { VectorDb } from "../core/search/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import { storeArtifact } from "../core/pipeline/extractor.js";

vi.mock("../core/pipeline/embedder.js", () => ({
  embed: vi.fn().mockResolvedValue(new Float32Array(384).fill(0.1)),
}));

const stubVdbWithResults: VectorDb = {
  openTable: vi.fn().mockResolvedValue({
    search: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([
        { meeting_id: "m1", _distance: 0.15 },
        { meeting_id: "m2", _distance: 0.45 },
      ]),
    }),
  }),
} as unknown as VectorDb;

const stubVdbEmpty: VectorDb = {
  openTable: vi.fn().mockResolvedValue({
    search: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
    }),
  }),
} as unknown as VectorDb;

const stubSession = {} as InferenceSession & { _tokenizer: unknown };

let db: Database;
let milestoneId: string;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run("Acme", "[]", "[]", "client-acme");
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m1', 'Sprint Planning', '2026-03-01')").run();
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m2', 'Retrospective', '2026-03-08')").run();
  storeArtifact(db, "m1", { summary: "Discussed launch timeline.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  storeArtifact(db, "m2", { summary: "Launch delayed to July.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  const ms = createMilestone(db, { clientId: "client-acme", title: "Platform Launch", targetDate: "2026-06-01", description: "Phase 1 go-live" });
  milestoneId = ms.id;
  addMilestoneMention(db, { milestoneId, meetingId: "m1", mentionType: "introduced", excerpt: "First discussion", targetDateAtMention: "2026-06-01", mentionedAt: "2026-03-01" });
  addMilestoneMention(db, { milestoneId, meetingId: "m2", mentionType: "updated", excerpt: "Pushed to July", targetDateAtMention: "2026-07-01", mentionedAt: "2026-03-08" });
});

describe("getMilestoneChatContext", () => {
  it("returns systemContext containing milestone title and meeting summaries", async () => {
    const { systemContext, meetingIds } = await getMilestoneChatContext(db, stubVdbWithResults, stubSession, milestoneId, "What is the status?", false);
    expect(systemContext).toContain("Platform Launch");
    expect(systemContext).toContain("Phase 1 go-live");
    expect(systemContext).toContain("2026-06-01");
    expect(meetingIds).toHaveLength(2);
  });

  it("returns empty meetingIds when milestone has no mentions", async () => {
    const emptyMs = createMilestone(db, { clientId: "client-acme", title: "Empty milestone" });
    const { systemContext, meetingIds } = await getMilestoneChatContext(db, stubVdbEmpty, stubSession, emptyMs.id, "Any updates?", false);
    expect(systemContext).toContain("Empty milestone");
    expect(meetingIds).toHaveLength(0);
  });
});
