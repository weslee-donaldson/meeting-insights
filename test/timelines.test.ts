import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createMilestone, getMilestone, updateMilestone, deleteMilestone, listMilestonesByClient, addMilestoneMention, getMilestoneMentions, getDateSlippage, linkActionItem, unlinkActionItem, getMilestoneActionItems, getMeetingMilestones, reconcileMilestones } from "../core/timelines.js";

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

describe("getMilestoneMentions", () => {
  it("returns mentions joined with meeting title and date in chronological order", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES ('Gamma', '[]', '[]')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('gm-m1', 'Kickoff', '2026-01-10')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('gm-m2', 'Sprint Review', '2026-02-05')").run();

    const m = createMilestone(db2, { clientName: "Gamma", title: "Platform launch" });

    addMilestoneMention(db2, {
      milestoneId: m.id,
      meetingId: "gm-m2",
      mentionType: "updated",
      excerpt: "pushed to April",
      targetDateAtMention: "2026-04-01",
      mentionedAt: "2026-02-05",
    });
    addMilestoneMention(db2, {
      milestoneId: m.id,
      meetingId: "gm-m1",
      mentionType: "introduced",
      excerpt: "targeting March",
      targetDateAtMention: "2026-03-15",
      mentionedAt: "2026-01-10",
    });

    const result = getMilestoneMentions(db2, m.id);
    expect(result).toEqual([
      {
        milestone_id: m.id,
        meeting_id: "gm-m1",
        mention_type: "introduced",
        excerpt: "targeting March",
        target_date_at_mention: "2026-03-15",
        mentioned_at: "2026-01-10",
        pending_review: 0,
        meeting_title: "Kickoff",
        meeting_date: "2026-01-10",
      },
      {
        milestone_id: m.id,
        meeting_id: "gm-m2",
        mention_type: "updated",
        excerpt: "pushed to April",
        target_date_at_mention: "2026-04-01",
        mentioned_at: "2026-02-05",
        pending_review: 0,
        meeting_title: "Sprint Review",
        meeting_date: "2026-02-05",
      },
    ]);
  });

  it("returns empty array when milestone has no mentions", () => {
    const m = createMilestone(db, { clientName: "Acme", title: "No mentions" });
    expect(getMilestoneMentions(db, m.id)).toEqual([]);
  });
});

describe("getDateSlippage", () => {
  it("returns date changes across mentions in chronological order", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES ('Slip', '[]', '[]')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('slip-m1', 'DSU 1', '2026-01-10')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('slip-m2', 'DSU 2', '2026-02-05')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('slip-m3', 'DSU 3', '2026-03-01')").run();

    const m = createMilestone(db2, { clientName: "Slip", title: "Slippery milestone" });

    addMilestoneMention(db2, { milestoneId: m.id, meetingId: "slip-m1", mentionType: "introduced", excerpt: "", targetDateAtMention: "2026-03-15", mentionedAt: "2026-01-10" });
    addMilestoneMention(db2, { milestoneId: m.id, meetingId: "slip-m2", mentionType: "updated", excerpt: "", targetDateAtMention: "2026-03-31", mentionedAt: "2026-02-05" });
    addMilestoneMention(db2, { milestoneId: m.id, meetingId: "slip-m3", mentionType: "referenced", excerpt: "", targetDateAtMention: "2026-03-31", mentionedAt: "2026-03-01" });

    const result = getDateSlippage(db2, m.id);
    expect(result).toEqual([
      { mentioned_at: "2026-01-10", target_date_at_mention: "2026-03-15", meeting_title: "DSU 1" },
      { mentioned_at: "2026-02-05", target_date_at_mention: "2026-03-31", meeting_title: "DSU 2" },
    ]);
  });

  it("returns empty array when target date never changes", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES ('Stable', '[]', '[]')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('stable-m1', 'DSU', '2026-01-10')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('stable-m2', 'DSU 2', '2026-02-05')").run();

    const m = createMilestone(db2, { clientName: "Stable", title: "Stable milestone" });

    addMilestoneMention(db2, { milestoneId: m.id, meetingId: "stable-m1", mentionType: "introduced", excerpt: "", targetDateAtMention: "2026-06-01", mentionedAt: "2026-01-10" });
    addMilestoneMention(db2, { milestoneId: m.id, meetingId: "stable-m2", mentionType: "referenced", excerpt: "", targetDateAtMention: "2026-06-01", mentionedAt: "2026-02-05" });

    expect(getDateSlippage(db2, m.id)).toEqual([]);
  });

  it("returns empty array when milestone has no mentions", () => {
    const m = createMilestone(db, { clientName: "Acme", title: "No slippage mentions" });
    expect(getDateSlippage(db, m.id)).toEqual([]);
  });
});

describe("linkActionItem + unlinkActionItem", () => {
  it("links an action item to a milestone and returns the row", () => {
    const m = createMilestone(db, { clientName: "Acme", title: "Link test" });
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('link-m1', 'DSU', '2026-03-01')").run();

    const result = linkActionItem(db, m.id, "link-m1", 0);
    expect(result).toEqual({
      milestone_id: m.id,
      meeting_id: "link-m1",
      item_index: 0,
      linked_at: expect.any(String),
    });
  });

  it("is idempotent — linking same item twice does not throw", () => {
    const m = createMilestone(db, { clientName: "Acme", title: "Idempotent link" });
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('idem-m1', 'DSU', '2026-03-01')").run();

    linkActionItem(db, m.id, "idem-m1", 0);
    const result = linkActionItem(db, m.id, "idem-m1", 0);
    expect(result).toEqual({
      milestone_id: m.id,
      meeting_id: "idem-m1",
      item_index: 0,
      linked_at: expect.any(String),
    });

    const count = db.prepare("SELECT COUNT(*) as c FROM milestone_action_items WHERE milestone_id = ? AND meeting_id = 'idem-m1'").get(m.id) as { c: number };
    expect(count.c).toBe(1);
  });

  it("unlinks an action item from a milestone", () => {
    const m = createMilestone(db, { clientName: "Acme", title: "Unlink test" });
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('unlink-m1', 'DSU', '2026-03-01')").run();

    linkActionItem(db, m.id, "unlink-m1", 2);
    unlinkActionItem(db, m.id, "unlink-m1", 2);

    const rows = db.prepare("SELECT * FROM milestone_action_items WHERE milestone_id = ? AND meeting_id = 'unlink-m1'").all(m.id);
    expect(rows).toEqual([]);
  });
});

describe("getMilestoneActionItems", () => {
  it("returns linked action items with meeting title and date", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES ('ItemClient', '[]', '[]')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('ai-m1', 'Sprint Planning', '2026-02-01')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('ai-m2', 'Retro', '2026-02-15')").run();
    db2.prepare("INSERT INTO artifacts (meeting_id, action_items) VALUES ('ai-m1', '[\"Deploy new API\",\"Update docs\"]')").run();
    db2.prepare("INSERT INTO artifacts (meeting_id, action_items) VALUES ('ai-m2', '[\"Fix auth bug\"]')").run();

    const m = createMilestone(db2, { clientName: "ItemClient", title: "Action items test" });
    linkActionItem(db2, m.id, "ai-m1", 0);
    linkActionItem(db2, m.id, "ai-m2", 0);

    const result = getMilestoneActionItems(db2, m.id);
    expect(result).toEqual([
      {
        milestone_id: m.id,
        meeting_id: "ai-m1",
        item_index: 0,
        linked_at: expect.any(String),
        meeting_title: "Sprint Planning",
        meeting_date: "2026-02-01",
      },
      {
        milestone_id: m.id,
        meeting_id: "ai-m2",
        item_index: 0,
        linked_at: expect.any(String),
        meeting_title: "Retro",
        meeting_date: "2026-02-15",
      },
    ]);
  });

  it("returns empty array when no action items linked", () => {
    const m = createMilestone(db, { clientName: "Acme", title: "No action items" });
    expect(getMilestoneActionItems(db, m.id)).toEqual([]);
  });
});

describe("getMeetingMilestones", () => {
  it("returns milestone tags for a meeting via its mentions", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES ('TagClient', '[]', '[]')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('tag-m1', 'DSU', '2026-03-01')").run();

    const m1 = createMilestone(db2, { clientName: "TagClient", title: "Go-live v1", targetDate: "2026-04-01" });
    const m2 = createMilestone(db2, { clientName: "TagClient", title: "Migration", targetDate: "2026-05-01" });

    addMilestoneMention(db2, { milestoneId: m1.id, meetingId: "tag-m1", mentionType: "introduced", excerpt: "", targetDateAtMention: "2026-04-01", mentionedAt: "2026-03-01" });
    addMilestoneMention(db2, { milestoneId: m2.id, meetingId: "tag-m1", mentionType: "referenced", excerpt: "", targetDateAtMention: "2026-05-01", mentionedAt: "2026-03-01" });

    const result = getMeetingMilestones(db2, "tag-m1");
    expect(result).toEqual([
      { id: m1.id, title: "Go-live v1", target_date: "2026-04-01", status: "identified" },
      { id: m2.id, title: "Migration", target_date: "2026-05-01", status: "identified" },
    ]);
  });

  it("returns empty array when meeting has no milestone mentions", () => {
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('no-ms-m1', 'Empty', '2026-03-01')").run();
    expect(getMeetingMilestones(db, "no-ms-m1")).toEqual([]);
  });
});

describe("reconcileMilestones", () => {
  it("matches existing milestone by normalized title and creates mention", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES ('Exact', '[]', '[]')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('exact-m1', 'Kickoff', '2026-01-15')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('exact-m2', 'Sprint Review', '2026-02-10')").run();

    const existing = createMilestone(db2, { clientName: "Exact", title: "Commerce Platform Go-Live", targetDate: "2026-06-01" });

    addMilestoneMention(db2, { milestoneId: existing.id, meetingId: "exact-m1", mentionType: "introduced", excerpt: "initial", targetDateAtMention: "2026-06-01", mentionedAt: "2026-01-15" });

    reconcileMilestones(db2, "Exact", "exact-m2", "2026-02-10", [
      { title: "commerce platform go-live", target_date: "2026-07-01", status_signal: "updated", excerpt: "Pushed to July" },
    ]);

    const milestones = listMilestonesByClient(db2, "Exact");
    expect(milestones).toHaveLength(1);
    expect(milestones[0].id).toBe(existing.id);
    expect(milestones[0].mention_count).toBe(2);

    const mentions = getMilestoneMentions(db2, existing.id);
    expect(mentions).toHaveLength(2);
    expect(mentions[1]).toEqual(expect.objectContaining({
      meeting_id: "exact-m2",
      mention_type: "updated",
      excerpt: "Pushed to July",
      target_date_at_mention: "2026-07-01",
    }));
  });

  it("creates a new milestone and mention when no existing title matches", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES ('Recon', '[]', '[]')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('recon-m1', 'Kickoff', '2026-03-01')").run();

    reconcileMilestones(db2, "Recon", "recon-m1", "2026-03-01", [
      { title: "Commerce platform go-live", target_date: "2026-06-01", status_signal: "introduced", excerpt: "Targeting June for go-live" },
    ]);

    const milestones = listMilestonesByClient(db2, "Recon");
    expect(milestones).toEqual([
      expect.objectContaining({
        client_name: "Recon",
        title: "Commerce platform go-live",
        target_date: "2026-06-01",
        status: "identified",
        mention_count: 1,
        first_mentioned_at: "2026-03-01",
      }),
    ]);

    const mentions = getMilestoneMentions(db2, milestones[0].id);
    expect(mentions).toEqual([
      expect.objectContaining({
        meeting_id: "recon-m1",
        mention_type: "introduced",
        excerpt: "Targeting June for go-live",
        target_date_at_mention: "2026-06-01",
        mentioned_at: "2026-03-01",
        pending_review: 0,
      }),
    ]);
  });
});
