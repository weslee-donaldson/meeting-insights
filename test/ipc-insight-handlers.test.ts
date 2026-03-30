import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { storeArtifact } from "../core/extractor.js";
import { storeDetection } from "../core/client-detection.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { appendInsightMessage } from "../core/insights.js";
import {
  handleListInsights,
  handleCreateInsight,
  handleUpdateInsight,
  handleDeleteInsight,
  handleGetInsightMeetings,
  handleDiscoverInsightMeetings,
  handleRemoveInsightMeeting,
  handleGenerateInsight,
  handleGetInsightMessages,
  handleClearInsightMessages,
} from "../electron-ui/electron/ipc-handlers.js";

let db: ReturnType<typeof createDb>;
const llm = createLlmAdapter({ type: "stub" });

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT INTO clients (name, id) VALUES ('Acme', 'client-acme')").run();
  db.prepare("INSERT INTO clients (name, id) VALUES ('Beta', 'client-beta')").run();
  db.prepare("INSERT INTO meetings (id, title, date, ignored, client_id) VALUES ('m1', 'Sprint Review', '2026-03-01', 0, 'client-acme')").run();
  db.prepare("INSERT INTO meetings (id, title, date, ignored, client_id) VALUES ('m2', 'Client Sync', '2026-03-02', 0, 'client-acme')").run();
  db.prepare("INSERT INTO meetings (id, title, date, ignored) VALUES ('m3', 'Ignored', '2026-03-03', 1)").run();
  storeDetection(db, "m1", [{ client_name: "Acme", client_id: "client-acme", confidence: 0.9, method: "auto" }]);
  storeDetection(db, "m2", [{ client_name: "Acme", client_id: "client-acme", confidence: 0.9, method: "auto" }]);
  storeArtifact(db, "m1", { summary: "Sprint review.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  storeArtifact(db, "m2", { summary: "Client sync.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
});

describe("insight IPC handlers", () => {
  it("handleCreateInsight creates and returns an insight", () => {
    const insight = handleCreateInsight(db, { client_name: "Acme", client_id: "client-acme", period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" });
    expect(insight.client_name).toBe("Acme");
    expect(insight.period_type).toBe("week");
    expect(insight.status).toBe("draft");
  });

  it("handleListInsights returns insights for a client", () => {
    handleCreateInsight(db, { client_name: "Acme", client_id: "client-acme", period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" });
    const insights = handleListInsights(db, "client-acme");
    expect(insights.length).toBeGreaterThanOrEqual(2);
    expect(insights.every((i) => i.client_name === "Acme")).toBe(true);
  });

  it("handleUpdateInsight updates fields", () => {
    const insight = handleCreateInsight(db, { client_name: "Acme", client_id: "client-acme", period_type: "month", period_start: "2026-03-01", period_end: "2026-03-31" });
    const updated = handleUpdateInsight(db, insight.id, { status: "final", rag_status: "red" });
    expect(updated.status).toBe("final");
    expect(updated.rag_status).toBe("red");
  });

  it("handleDeleteInsight removes the insight", () => {
    const insight = handleCreateInsight(db, { client_name: "Acme", client_id: "client-acme", period_type: "day", period_start: "2026-03-05", period_end: "2026-03-05" });
    handleDeleteInsight(db, insight.id);
    const list = handleListInsights(db, "client-acme");
    expect(list.find((i) => i.id === insight.id)).toBeUndefined();
  });

  it("handleDiscoverInsightMeetings links meetings by client and period", () => {
    const insight = handleCreateInsight(db, { client_name: "Acme", client_id: "client-acme", period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" });
    const meetingIds = handleDiscoverInsightMeetings(db, insight.id);
    expect(meetingIds).toContain("m1");
    expect(meetingIds).toContain("m2");
    const meetings = handleGetInsightMeetings(db, insight.id);
    expect(meetings).toHaveLength(2);
  });

  it("handleRemoveInsightMeeting unlinks a meeting from an insight", () => {
    const insight = handleCreateInsight(db, { client_name: "Acme", client_id: "client-acme", period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" });
    handleDiscoverInsightMeetings(db, insight.id);
    expect(handleGetInsightMeetings(db, insight.id)).toHaveLength(2);
    handleRemoveInsightMeeting(db, insight.id, "m1");
    const remaining = handleGetInsightMeetings(db, insight.id);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].meeting_id).toBe("m2");
  });

  it("handleGenerateInsight calls LLM and stores result", async () => {
    const insight = handleCreateInsight(db, { client_name: "Acme", client_id: "client-acme", period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" });
    handleDiscoverInsightMeetings(db, insight.id);
    const updated = await handleGenerateInsight(db, llm, insight.id);
    expect(updated.rag_status).toBe("yellow");
    expect(updated.executive_summary).toBe("<p>Stub executive summary of the reporting period.</p>");
  });

  it("handleGetInsightMessages returns empty array for new insight", () => {
    const insight = handleCreateInsight(db, { client_name: "Acme", client_id: "client-acme", period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" });
    const messages = handleGetInsightMessages(db, insight.id);
    expect(messages).toEqual([]);
  });

  it("handleClearInsightMessages removes all messages", () => {
    const insight = handleCreateInsight(db, { client_name: "Acme", client_id: "client-acme", period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" });
    appendInsightMessage(db, { insight_id: insight.id, role: "user", content: "hello" });
    expect(handleGetInsightMessages(db, insight.id)).toHaveLength(1);
    handleClearInsightMessages(db, insight.id);
    expect(handleGetInsightMessages(db, insight.id)).toEqual([]);
  });
});
