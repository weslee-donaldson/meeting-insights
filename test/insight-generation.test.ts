import { describe, it, expect, beforeAll, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createStubAdapter, STUB_FIXTURES } from "../core/llm-provider-stub.js";
import type { LlmAdapter } from "../core/llm-adapter.js";
import { createInsight, addInsightMeeting, getInsight, generateInsight } from "../core/insights.js";

let db: Database;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT INTO clients (name) VALUES ('Acme')").run();
  db.prepare("INSERT INTO meetings (id, title, date) VALUES ('m1', 'Sprint Review', '2026-03-01')").run();
  db.prepare("INSERT INTO meetings (id, title, date) VALUES ('m2', 'Client Sync', '2026-03-02')").run();
  db.prepare(`
    INSERT INTO artifacts (meeting_id, summary, decisions, proposed_features, action_items, open_questions, risk_items, additional_notes)
    VALUES ('m1', 'Sprint review covered feature delivery.', '[{"text":"Ship v2","decided_by":"Alice"}]', '[]', '[{"description":"Deploy staging","owner":"Bob","requester":"Alice","due_date":null,"priority":"normal"}]', '[]', '[]', '[]')
  `).run();
  db.prepare(`
    INSERT INTO artifacts (meeting_id, summary, decisions, proposed_features, action_items, open_questions, risk_items, additional_notes)
    VALUES ('m2', 'Client sync discussed timeline.', '[]', '[]', '[]', '["When is launch?"]', '[]', '[]')
  `).run();
});

describe("generateInsight", () => {
  it("calls LLM and stores structured result on the insight", async () => {
    const llm = createStubAdapter();
    const insight = createInsight(db, { client_name: "Acme", period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" });
    addInsightMeeting(db, { insight_id: insight.id, meeting_id: "m1", contribution_summary: "" });
    addInsightMeeting(db, { insight_id: insight.id, meeting_id: "m2", contribution_summary: "" });

    const updated = await generateInsight(db, llm, insight.id);

    expect(updated.rag_status).toBe("yellow");
    expect(updated.rag_rationale).toBe("Some action items remain open from previous period.");
    expect(updated.executive_summary).toBe("<p>Stub executive summary of the reporting period.</p>");
    expect(JSON.parse(updated.topic_details)).toEqual([
      { topic: "Feature Delivery", summary: "Feature X is on track.", status: "green", meeting_ids: [] },
      { topic: "Open Issues", summary: "Two unresolved blockers.", status: "yellow", meeting_ids: [] },
    ]);
  });

  it("persists the generated result to the database", async () => {
    const llm = createStubAdapter();
    const insight = createInsight(db, { client_name: "Acme", period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" });
    addInsightMeeting(db, { insight_id: insight.id, meeting_id: "m1", contribution_summary: "" });

    await generateInsight(db, llm, insight.id);

    const reloaded = getInsight(db, insight.id)!;
    expect(reloaded.rag_status).toBe("yellow");
    expect(reloaded.executive_summary).toBe("<p>Stub executive summary of the reporting period.</p>");
    expect(reloaded.generated_at).toEqual(expect.any(String));
  });

  it("returns the insight unchanged when no meetings are linked", async () => {
    const llm = createStubAdapter();
    const insight = createInsight(db, { client_name: "Acme", period_type: "day", period_start: "2026-03-05", period_end: "2026-03-05" });

    const result = await generateInsight(db, llm, insight.id);

    expect(result.executive_summary).toBe("");
    expect(result.rag_status).toBe("green");
  });
});

  it("sends prompt with template instructions to LLM", async () => {
    let capturedPrompt = "";
    const spyLlm: LlmAdapter = {
      async complete(_cap, content) {
        capturedPrompt = content;
        return STUB_FIXTURES.generate_insight;
      },
      async converse() { return ""; },
    };
    const insight = createInsight(db, { client_name: "Acme", period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" });
    addInsightMeeting(db, { insight_id: insight.id, meeting_id: "m1", contribution_summary: "" });

    await generateInsight(db, spyLlm, insight.id);

    expect(capturedPrompt).toContain("Return ONLY valid JSON");
    expect(capturedPrompt).toContain("## Client\nAcme");
    expect(capturedPrompt).toContain("week: 2026-03-01 to 2026-03-07");
    expect(capturedPrompt).toContain("Sprint review covered feature delivery.");
  });
