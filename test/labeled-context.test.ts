import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact, generateShortId } from "../core/extractor.js";
import { buildLabeledContext, buildDistilledContext } from "../core/labeled-context.js";
import { recordMention } from "../core/item-dedup.js";
import { createMilestone, addMilestoneMention } from "../core/timelines.js";
import { createNote } from "../core/notes.js";

function makeArtifact() {
  return {
    summary: "We discussed the roadmap.",
    decisions: [{ text: "Use TypeScript", decided_by: "CEO" }],
    proposed_features: [],
    action_items: [{ description: "Write tests", owner: "Alice", requester: "Bob", due_date: null }],
    open_questions: ["When to launch?"],
    risk_items: [],
    additional_notes: [],
  };
}

describe("buildLabeledContext", () => {
  let db: ReturnType<typeof createDb>;
  let id1: string;
  let id2: string;

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);

    id1 = ingestMeeting(db, {
      title: "Alpha Meeting",
      timestamp: "2026-02-25T10:00:00.000Z",
      participants: [],
      rawTranscript: "Alice | 00:00\nHello.",
      turns: [],
      sourceFilename: "alpha",
    });
    storeArtifact(db, id1, makeArtifact());

    id2 = ingestMeeting(db, {
      title: "Beta Meeting",
      timestamp: "2026-02-26T10:00:00.000Z",
      participants: [],
      rawTranscript: "Bob | 00:00\nHi.",
      turns: [],
      sourceFilename: "beta",
    });
    storeArtifact(db, id2, makeArtifact());
  });

  it("should return labeled blocks for 2 meeting IDs", () => {
    const result = buildLabeledContext(db, [id1, id2]);
    expect(result.contextText).toContain("[M1]");
    expect(result.contextText).toContain("[M2]");
  });

  it("should sort meetings newest first", () => {
    const result = buildLabeledContext(db, [id1, id2]);
    const m1pos = result.contextText.indexOf("[M1]");
    const betaPos = result.contextText.indexOf("Beta Meeting");
    expect(betaPos).toBeGreaterThanOrEqual(m1pos);
    expect(betaPos).toBeLessThan(result.contextText.indexOf("Alpha Meeting"));
  });

  it("should return correct charCount equal to contextText length", () => {
    const result = buildLabeledContext(db, [id1, id2]);
    expect(result.charCount).toBe(result.contextText.length);
  });

  it("should return meetings array with id, title, date", () => {
    const result = buildLabeledContext(db, [id1, id2]);
    expect(result.meetings).toHaveLength(2);
    expect(result.meetings[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      date: expect.any(String),
    });
  });

  it("formats decisions with decided_by and action items with requester", () => {
    const result = buildLabeledContext(db, [id1]);
    expect(result.contextText).toContain("- Use TypeScript (decided by CEO)");
    expect(result.contextText).toContain(`[${generateShortId(id1, 0)}] Write tests (Alice, requested by Bob)`);
  });

  it("should return empty context for unknown meeting IDs", () => {
    const result = buildLabeledContext(db, ["nonexistent-id"]);
    expect(result.contextText).toBe("");
    expect(result.charCount).toBe(0);
    expect(result.meetings).toHaveLength(0);
  });

  it("annotates items with mention count when raised multiple times", () => {
    const extraId = ingestMeeting(db, {
      title: "Extra Meeting",
      timestamp: "2026-02-27T10:00:00.000Z",
      participants: [],
      rawTranscript: "X | 00:00\nHi.",
      turns: [],
      sourceFilename: "extra",
    });
    recordMention(db, "can-ctx-1", id1, "action_items", 0, "Write tests", "2026-02-25");
    recordMention(db, "can-ctx-1", id2, "action_items", 0, "Write tests", "2026-02-26");
    recordMention(db, "can-ctx-1", extraId, "action_items", 0, "Write tests", "2026-02-27");
    const result = buildLabeledContext(db, [id1]);
    expect(result.contextText).toContain("[raised 3x, first mentioned 2026-02-25]");
  });

  it("does not annotate items with only one mention", () => {
    recordMention(db, "can-ctx-2", id1, "decisions", 0, "Use TypeScript", "2026-02-25");
    const result = buildLabeledContext(db, [id1]);
    const decisionLine = result.contextText.split("\n").find(l => l.includes("Use TypeScript"));
    expect(decisionLine).not.toContain("[raised");
  });

  it("prefixes [CRITICAL] on critical action items", () => {
    const critId = ingestMeeting(db, {
      title: "Critical Meeting",
      timestamp: "2026-03-01T10:00:00.000Z",
      participants: [],
      rawTranscript: "X | 00:00\nHi.",
      turns: [],
      sourceFilename: "critical",
    });
    storeArtifact(db, critId, {
      ...makeArtifact(),
      action_items: [{ description: "Fix broken build", owner: "Carol", requester: "Dave", due_date: null, priority: "critical" }],
    });
    const result = buildLabeledContext(db, [critId]);
    expect(result.contextText).toContain("[CRITICAL] Fix broken build");
  });

  it("does not prefix normal action items with [CRITICAL]", () => {
    const result = buildLabeledContext(db, [id1]);
    expect(result.contextText).not.toContain("[CRITICAL]");
  });

  it("includes raw transcript text in labeled context", () => {
    const result = buildLabeledContext(db, [id1]);
    expect(result.contextText).toContain("Alice | 00:00");
    expect(result.contextText).toContain("Hello.");
  });

  it("includes milestone context when meeting has milestone mentions", () => {
    db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run("TestCo", "[]", "[]");
    const ms = createMilestone(db, { clientName: "TestCo", title: "Platform Launch", targetDate: "2026-06-01", description: "Phase 1 go-live" });
    addMilestoneMention(db, { milestoneId: ms.id, meetingId: id1, mentionType: "introduced", excerpt: "First mention", targetDateAtMention: "2026-06-01", mentionedAt: "2026-02-25" });
    const result = buildLabeledContext(db, [id1]);
    expect(result.contextText).toContain("Milestones:");
    expect(result.contextText).toContain("Platform Launch");
    expect(result.contextText).toContain("2026-06-01");
    expect(result.contextText).toContain("identified");
  });

  it("prefixes action items with [short_id] when short_id is present", () => {
    const shortId = generateShortId(id1, 0);
    const result = buildLabeledContext(db, [id1]);
    expect(result.contextText).toContain(`[${shortId}] Write tests`);
  });

  it("formats risk_items by description", () => {
    const riskId = ingestMeeting(db, {
      title: "Risk Meeting",
      timestamp: "2026-03-02T10:00:00.000Z",
      participants: [],
      rawTranscript: "X | 00:00\nHi.",
      turns: [],
      sourceFilename: "risk",
    });
    storeArtifact(db, riskId, {
      ...makeArtifact(),
      risk_items: [{ category: "engineering" as const, description: "Staffing risk" }],
    });
    const result = buildLabeledContext(db, [riskId]);
    expect(result.contextText).toContain("- Staffing risk");
  });
});

describe("buildDistilledContext", () => {
  let dDb: ReturnType<typeof createDb>;
  let dId1: string;
  let dId2: string;

  beforeAll(() => {
    dDb = createDb(":memory:");
    migrate(dDb);

    dId1 = ingestMeeting(dDb, {
      title: "Distilled Alpha",
      timestamp: "2026-03-01T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHi.",
      turns: [],
      sourceFilename: "d-alpha",
    });
    storeArtifact(dDb, dId1, {
      summary: "Alpha summary text.",
      decisions: [{ text: "Ship by Q2", decided_by: "CEO" }],
      proposed_features: [],
      action_items: [
        { description: "Write spec", owner: "Alice", requester: "Bob", due_date: "2026-04-01", priority: "normal" as const },
        { description: "Fix pipeline", owner: "Carol", requester: "Dave", due_date: null, priority: "critical" as const },
      ],
      open_questions: [],
      risk_items: [],
      additional_notes: [{ category: "team", notes: ["Alice is out Monday"] }],
    });

    dId2 = ingestMeeting(dDb, {
      title: "Distilled Beta",
      timestamp: "2026-03-02T10:00:00.000Z",
      participants: [],
      rawTranscript: "B | 00:00\nHi.",
      turns: [],
      sourceFilename: "d-beta",
    });
    storeArtifact(dDb, dId2, {
      summary: "Beta summary text.",
      decisions: [],
      proposed_features: [],
      action_items: [],
      open_questions: [],
      risk_items: [],
      additional_notes: [],
    });
  });

  it("returns string with summary section for a meeting", () => {
    const result = buildDistilledContext(dDb, [dId1]);
    expect(typeof result).toBe("string");
    expect(result).toContain("Alpha summary text.");
  });

  it("includes decisions with decided_by", () => {
    const result = buildDistilledContext(dDb, [dId1]);
    expect(result).toContain("Ship by Q2");
    expect(result).toContain("CEO");
  });

  it("includes action items with owner and requester", () => {
    const result = buildDistilledContext(dDb, [dId1]);
    expect(result).toContain("Write spec");
    expect(result).toContain("Alice");
  });

  it("prefixes critical action items with [CRITICAL]", () => {
    const result = buildDistilledContext(dDb, [dId1]);
    expect(result).toContain("[CRITICAL] Fix pipeline");
  });

  it("prefixes action items with [short_id] in distilled context", () => {
    const result = buildDistilledContext(dDb, [dId1]);
    const shortId = generateShortId(dId1, 0);
    expect(result).toContain(`[${shortId}] Write spec`);
  });

  it("includes additional_notes", () => {
    const result = buildDistilledContext(dDb, [dId1]);
    expect(result).toContain("Alice is out Monday");
  });

  it("concatenates multiple meetings", () => {
    const result = buildDistilledContext(dDb, [dId1, dId2]);
    expect(result).toContain("Alpha summary text.");
    expect(result).toContain("Beta summary text.");
  });

  it("returns empty string for unknown meeting IDs", () => {
    const result = buildDistilledContext(dDb, ["nonexistent"]);
    expect(result).toBe("");
  });

  it("appends selected notes to distilled context", () => {
    const note = createNote(dDb, { objectType: "meeting", objectId: dId1, title: "Krisp Key Points", body: "- Key point A\n- Key point B", noteType: "key-points" });
    const result = buildDistilledContext(dDb, [dId1], [note.id]);
    expect(result).toContain("Krisp Key Points:");
    expect(result).toContain("- Key point A");
  });

  it("truncates output to maxChars budget when provided", () => {
    const full = buildDistilledContext(dDb, [dId1, dId2]);
    const maxChars = 100;
    const truncated = buildDistilledContext(dDb, [dId1, dId2], [], { maxChars });
    expect(truncated.length).toBeLessThanOrEqual(maxChars);
    expect(truncated.length).toBeGreaterThan(0);
    expect(truncated.length).toBeLessThan(full.length);
  });

  it("allocates per-meeting budget evenly across meetings", () => {
    const maxChars = 200;
    const result = buildDistilledContext(dDb, [dId1, dId2], [], { maxChars });
    const blocks = result.split("\n\n---\n\n");
    expect(blocks.length).toBe(2);
    const perMeetingBudget = Math.floor(maxChars / 2);
    for (const block of blocks) {
      expect(block.length).toBeLessThanOrEqual(perMeetingBudget);
    }
  });

  it("returns full output when maxChars is omitted", () => {
    const withoutLimit = buildDistilledContext(dDb, [dId1]);
    const withLargeLimit = buildDistilledContext(dDb, [dId1], [], { maxChars: 100000 });
    expect(withoutLimit).toBe(withLargeLimit);
  });

  it("prepends relevance summary when relevanceSummaries map provided", () => {
    const summaries = new Map<string, string>();
    summaries.set(dId1, "Discusses Q2 shipping timeline");
    const result = buildDistilledContext(dDb, [dId1], [], { relevanceSummaries: summaries });
    const lines = result.split("\n");
    const headerIdx = lines.findIndex((l) => l.startsWith("## Distilled Alpha"));
    expect(lines[headerIdx + 1]).toBe("Relevance: Discusses Q2 shipping timeline");
  });

  it("omits relevance line for meetings not in relevanceSummaries map", () => {
    const summaries = new Map<string, string>();
    summaries.set(dId1, "Alpha relevance");
    const result = buildDistilledContext(dDb, [dId1, dId2], [], { relevanceSummaries: summaries });
    const blocks = result.split("\n\n---\n\n");
    expect(blocks[0]).toContain("Relevance: Alpha relevance");
    expect(blocks[1]).not.toContain("Relevance:");
  });

  it("does not include relevance line when relevanceSummaries is omitted", () => {
    const result = buildDistilledContext(dDb, [dId1]);
    expect(result).not.toContain("Relevance:");
  });
});

describe("buildLabeledContext with notes", () => {
  let nDb: ReturnType<typeof createDb>;
  let nId: string;

  beforeAll(() => {
    nDb = createDb(":memory:");
    migrate(nDb);
    nId = ingestMeeting(nDb, {
      timestamp: "2026-03-26T10:00:00.000Z",
      title: "Notes Test Meeting",
      participants: [],
      turns: [],
      rawTranscript: "transcript",
      sourceFilename: "notes-test.md",
    });
    storeArtifact(nDb, nId, { ...makeArtifact(), summary: "Notes meeting summary." });
  });

  it("includes selected note bodies in labeled context", () => {
    const note = createNote(nDb, { objectType: "meeting", objectId: nId, title: "Krisp Action Items", body: "- [ ] Task 1", noteType: "action-items" });
    const { contextText } = buildLabeledContext(nDb, [nId], [note.id]);
    expect(contextText).toContain("Notes:");
    expect(contextText).toContain("Krisp Action Items:");
    expect(contextText).toContain("- [ ] Task 1");
  });

  it("excludes notes when noteIds is empty", () => {
    const { contextText } = buildLabeledContext(nDb, [nId]);
    expect(contextText).not.toContain("Krisp Action Items:");
  });
});
