import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createMilestone, getMilestone, updateMilestone, deleteMilestone, listMilestonesByClient, addMilestoneMention } from "../core/timelines.js";

let db: Database;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES ('Acme', '[]', '[]')").run();
});

describe("createMilestone", () => {
  it("inserts a milestone and returns it with generated id and timestamps", () => {
    const result = createMilestone(db, {
      clientName: "Acme",
      title: "Launch commerce platform",
      description: "Phase 1 go-live",
      targetDate: "2026-06-01",
    });

    expect(result).toEqual({
      id: expect.any(String),
      client_name: "Acme",
      title: "Launch commerce platform",
      description: "Phase 1 go-live",
      target_date: "2026-06-01",
      status: "identified",
      completed_at: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it("defaults description to empty string and target_date to null when omitted", () => {
    const result = createMilestone(db, {
      clientName: "Acme",
      title: "Migration complete",
    });

    expect(result).toEqual({
      id: expect.any(String),
      client_name: "Acme",
      title: "Migration complete",
      description: "",
      target_date: null,
      status: "identified",
      completed_at: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });
});

describe("getMilestone", () => {
  it("returns milestone by id", () => {
    const created = createMilestone(db, { clientName: "Acme", title: "Get test" });
    const result = getMilestone(db, created.id);
    expect(result).toEqual(created);
  });

  it("returns null for non-existent id", () => {
    const result = getMilestone(db, "non-existent");
    expect(result).toBe(null);
  });
});

describe("updateMilestone", () => {
  it("updates title and returns updated milestone", () => {
    const created = createMilestone(db, { clientName: "Acme", title: "Original" });
    const result = updateMilestone(db, created.id, { title: "Updated" });
    expect(result).toEqual({
      ...created,
      title: "Updated",
      updated_at: expect.any(String),
    });
  });

  it("updates status to completed and sets completed_at", () => {
    const created = createMilestone(db, { clientName: "Acme", title: "Complete me" });
    const result = updateMilestone(db, created.id, { status: "completed" });
    expect(result!.status).toBe("completed");
    expect(result!.completed_at).toEqual(expect.any(String));
  });

  it("clears completed_at when status changes away from completed", () => {
    const created = createMilestone(db, { clientName: "Acme", title: "Uncomplete me" });
    updateMilestone(db, created.id, { status: "completed" });
    const result = updateMilestone(db, created.id, { status: "tracked" });
    expect(result!.status).toBe("tracked");
    expect(result!.completed_at).toBe(null);
  });

  it("returns null for non-existent id", () => {
    const result = updateMilestone(db, "non-existent", { title: "Nope" });
    expect(result).toBe(null);
  });
});

describe("deleteMilestone", () => {
  it("deletes milestone and cascades to mentions, action items, and messages", () => {
    const m = createMilestone(db, { clientName: "Acme", title: "Delete me" });
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('del-m1', 'Standup', '2026-01-15')").run();
    db.prepare("INSERT INTO milestone_mentions (milestone_id, meeting_id, mention_type, mentioned_at) VALUES (?, 'del-m1', 'introduced', '2026-01-15')").run(m.id);
    db.prepare("INSERT INTO milestone_action_items (milestone_id, meeting_id, item_index, linked_at) VALUES (?, 'del-m1', 0, '2026-01-15')").run(m.id);
    db.prepare("INSERT INTO milestone_messages (id, milestone_id, role, content, created_at) VALUES ('msg1', ?, 'user', 'hi', '2026-01-15')").run(m.id);

    deleteMilestone(db, m.id);

    expect(getMilestone(db, m.id)).toBe(null);
    expect(db.prepare("SELECT * FROM milestone_mentions WHERE milestone_id = ?").all(m.id)).toEqual([]);
    expect(db.prepare("SELECT * FROM milestone_action_items WHERE milestone_id = ?").all(m.id)).toEqual([]);
    expect(db.prepare("SELECT * FROM milestone_messages WHERE milestone_id = ?").all(m.id)).toEqual([]);
  });
});

describe("listMilestonesByClient", () => {
  it("returns milestones with mention_count and first_mentioned_at ordered by target_date", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES ('Beta', '[]', '[]')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('list-m1', 'DSU', '2026-02-01')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('list-m2', 'DSU 2', '2026-02-10')").run();

    const m1 = createMilestone(db2, { clientName: "Beta", title: "Alpha launch", targetDate: "2026-03-01" });
    const m2 = createMilestone(db2, { clientName: "Beta", title: "Beta launch", targetDate: "2026-04-01" });

    db2.prepare("INSERT INTO milestone_mentions (milestone_id, meeting_id, mention_type, mentioned_at) VALUES (?, 'list-m1', 'introduced', '2026-02-01')").run(m1.id);
    db2.prepare("INSERT INTO milestone_mentions (milestone_id, meeting_id, mention_type, mentioned_at) VALUES (?, 'list-m2', 'updated', '2026-02-10')").run(m1.id);
    db2.prepare("INSERT INTO milestone_mentions (milestone_id, meeting_id, mention_type, mentioned_at) VALUES (?, 'list-m1', 'introduced', '2026-02-01')").run(m2.id);

    const result = listMilestonesByClient(db2, "Beta");
    expect(result).toEqual([
      { ...m1, mention_count: 2, first_mentioned_at: "2026-02-01", pending_review_count: 0 },
      { ...m2, mention_count: 1, first_mentioned_at: "2026-02-01", pending_review_count: 0 },
    ]);
  });

  it("returns empty array when client has no milestones", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES ('Empty', '[]', '[]')").run();
    expect(listMilestonesByClient(db2, "Empty")).toEqual([]);
  });
});

describe("addMilestoneMention", () => {
  it("inserts a mention and returns it", () => {
    const m = createMilestone(db, { clientName: "Acme", title: "Mention test" });
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('mention-m1', 'DSU', '2026-03-01')").run();

    const result = addMilestoneMention(db, {
      milestoneId: m.id,
      meetingId: "mention-m1",
      mentionType: "introduced",
      excerpt: "We plan to launch in March",
      targetDateAtMention: "2026-03-15",
      mentionedAt: "2026-03-01",
    });

    expect(result).toEqual({
      milestone_id: m.id,
      meeting_id: "mention-m1",
      mention_type: "introduced",
      excerpt: "We plan to launch in March",
      target_date_at_mention: "2026-03-15",
      mentioned_at: "2026-03-01",
      pending_review: 0,
    });
  });

  it("upserts on same milestone_id + meeting_id", () => {
    const m = createMilestone(db, { clientName: "Acme", title: "Upsert test" });
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('upsert-m1', 'DSU', '2026-03-01')").run();

    addMilestoneMention(db, {
      milestoneId: m.id,
      meetingId: "upsert-m1",
      mentionType: "introduced",
      excerpt: "first",
      targetDateAtMention: "2026-03-15",
      mentionedAt: "2026-03-01",
    });

    const result = addMilestoneMention(db, {
      milestoneId: m.id,
      meetingId: "upsert-m1",
      mentionType: "updated",
      excerpt: "revised",
      targetDateAtMention: "2026-04-01",
      mentionedAt: "2026-03-01",
    });

    expect(result).toEqual({
      milestone_id: m.id,
      meeting_id: "upsert-m1",
      mention_type: "updated",
      excerpt: "revised",
      target_date_at_mention: "2026-04-01",
      mentioned_at: "2026-03-01",
      pending_review: 0,
    });

    const count = db.prepare("SELECT COUNT(*) as c FROM milestone_mentions WHERE milestone_id = ? AND meeting_id = 'upsert-m1'").get(m.id) as { c: number };
    expect(count.c).toBe(1);
  });

  it("supports pending_review flag for fuzzy matches", () => {
    const m = createMilestone(db, { clientName: "Acme", title: "Fuzzy test" });
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('fuzzy-m1', 'DSU', '2026-03-01')").run();

    const result = addMilestoneMention(db, {
      milestoneId: m.id,
      meetingId: "fuzzy-m1",
      mentionType: "referenced",
      excerpt: "maybe related",
      targetDateAtMention: null,
      mentionedAt: "2026-03-01",
      pendingReview: true,
    });

    expect(result).toEqual({
      milestone_id: m.id,
      meeting_id: "fuzzy-m1",
      mention_type: "referenced",
      excerpt: "maybe related",
      target_date_at_mention: null,
      mentioned_at: "2026-03-01",
      pending_review: 1,
    });
  });
});
