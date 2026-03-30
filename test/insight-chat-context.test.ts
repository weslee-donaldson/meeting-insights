import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createInsight, addInsightMeeting, getInsightChatContext } from "../core/insights.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import { storeArtifact } from "../core/extractor.js";
import { seedTestTenant, seedTestClient } from "./helpers/seed-test-tenant.js";

vi.mock("../core/embedder.js", () => ({
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
let acmeClientId: string;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  const { tenantId } = seedTestTenant(db);
  acmeClientId = seedTestClient(db, tenantId, "Acme").id;
  db.prepare("INSERT INTO meetings (id, title, date) VALUES ('m1', 'Sprint Review', '2026-03-01')").run();
  db.prepare("INSERT INTO meetings (id, title, date) VALUES ('m2', 'Client Sync', '2026-03-02')").run();
  storeArtifact(db, "m1", { summary: "Sprint review covered delivery.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  storeArtifact(db, "m2", { summary: "Client sync on timeline.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
});

describe("getInsightChatContext", () => {
  it("returns systemContext containing insight client and period", async () => {
    const insight = createInsight(db, { client_name: "Acme", client_id: acmeClientId, period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" });
    addInsightMeeting(db, { insight_id: insight.id, meeting_id: "m1", contribution_summary: "" });
    addInsightMeeting(db, { insight_id: insight.id, meeting_id: "m2", contribution_summary: "" });

    const { systemContext, meetingIds } = await getInsightChatContext(db, stubVdbWithResults, stubSession, insight.id, "What happened?", false);

    expect(systemContext).toContain("Acme");
    expect(systemContext).toContain("week");
    expect(meetingIds).toHaveLength(2);
  });

  it("includes meeting summaries in systemContext", async () => {
    const insight = createInsight(db, { client_name: "Acme", client_id: acmeClientId, period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" });
    addInsightMeeting(db, { insight_id: insight.id, meeting_id: "m1", contribution_summary: "" });

    const stubVdbSingle: VectorDb = {
      openTable: vi.fn().mockResolvedValue({
        search: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue([{ meeting_id: "m1", _distance: 0.1 }]),
        }),
      }),
    } as unknown as VectorDb;

    const { systemContext } = await getInsightChatContext(db, stubVdbSingle, stubSession, insight.id, "Tell me more", false);

    expect(systemContext).toContain("Sprint Review");
    expect(systemContext).toContain("Sprint review covered delivery.");
  });

  it("returns empty meetingIds when no meetings are linked", async () => {
    const insight = createInsight(db, { client_name: "Acme", client_id: acmeClientId, period_type: "day", period_start: "2026-03-05", period_end: "2026-03-05" });

    const { systemContext, meetingIds } = await getInsightChatContext(db, stubVdbEmpty, stubSession, insight.id, "Any updates?", false);

    expect(systemContext).toContain("Acme");
    expect(meetingIds).toHaveLength(0);
  });
});
