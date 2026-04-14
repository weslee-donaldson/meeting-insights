import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createThread, getThreadCandidates } from "../core/threads.js";
import type { VectorDb } from "../core/search/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import { seedTestTenant, seedTestClient } from "./helpers/seed-test-tenant.js";

vi.mock("../core/pipeline/embedder.js", () => ({
  embed: vi.fn().mockResolvedValue(new Float32Array(384).fill(0.1)),
}));

const stubVdbEmpty: VectorDb = {
  openTable: vi.fn().mockResolvedValue({
    search: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
    }),
  }),
} as unknown as VectorDb;

const stubVdbWithResults: VectorDb = {
  openTable: vi.fn().mockResolvedValue({
    search: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([
        { meeting_id: "m1", _distance: 0.15, client: "Acme", meeting_type: "Standup", date: "2026-03-01" },
        { meeting_id: "m2", _distance: 0.45, client: "Acme", meeting_type: "Planning", date: "2026-03-08" },
      ]),
    }),
  }),
} as unknown as VectorDb;

const stubSession = {} as InferenceSession & { _tokenizer: unknown };

let db: Database;
let acmeClientId: string;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  const { tenantId } = seedTestTenant(db);
  acmeClientId = seedTestClient(db, tenantId, "Acme").id;
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m1', 'Sprint Planning', '2026-03-01')").run();
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m2', 'Retrospective', '2026-03-08')").run();
});

describe("getThreadCandidates", () => {
  it("returns empty array when no vectors match", async () => {
    const thread = createThread(db, { client_name: "Acme", client_id: acmeClientId, title: "Deploy issues", shorthand: "DEPLOY", description: "Track failures", criteria_prompt: "CI failures" });
    const candidates = await getThreadCandidates(db, stubVdbEmpty, stubSession, thread, "Acme");
    expect(candidates).toEqual([]);
  });

  it("returns candidate list with meeting_id, title, date, and similarity", async () => {
    const thread = createThread(db, { client_name: "Acme", client_id: acmeClientId, title: "Deploy issues", shorthand: "DEPLOY", description: "Track failures", criteria_prompt: "CI failures" });
    const candidates = await getThreadCandidates(db, stubVdbWithResults, stubSession, thread, "Acme");
    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toMatchObject({
      meeting_id: "m1",
      title: "Sprint Planning",
      date: "2026-03-01",
      similarity: expect.any(Number),
    });
  });

  it("converts distance to similarity score (1 - distance)", async () => {
    const thread = createThread(db, { client_name: "Acme", client_id: acmeClientId, title: "T", shorthand: "T", description: "", criteria_prompt: "" });
    const candidates = await getThreadCandidates(db, stubVdbWithResults, stubSession, thread, "Acme");
    expect(candidates[0].similarity).toBeCloseTo(1 - 0.15);
    expect(candidates[1].similarity).toBeCloseTo(1 - 0.45);
  });
});
