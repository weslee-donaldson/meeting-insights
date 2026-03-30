import { describe, it, expect, beforeEach } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createThread, getThread, listThreadsByClient } from "../core/threads.js";
import { seedTestTenant, seedTestClient } from "./helpers/seed-test-tenant.js";

let db: Database;
let acmeClientId: string;
let betaClientId: string;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  const { tenantId } = seedTestTenant(db);
  acmeClientId = seedTestClient(db, tenantId, "Acme").id;
  betaClientId = seedTestClient(db, tenantId, "Beta Co").id;
});

describe("createThread", () => {
  it("creates a thread and returns a Thread with all fields including client_id", () => {
    const thread = createThread(db, {
      client_name: "Acme",
      client_id: acmeClientId,
      title: "PR Deployments broken",
      shorthand: "PR-DEPLOY",
      description: "Track broken deployments",
      criteria_prompt: "Look for deployment failures or CI issues",
    });
    expect(thread).toMatchObject({
      client_name: "Acme",
      client_id: acmeClientId,
      title: "PR Deployments broken",
      shorthand: "PR-DEPLOY",
      description: "Track broken deployments",
      criteria_prompt: "Look for deployment failures or CI issues",
      status: "open",
      summary: "",
    });
    expect(typeof thread.id).toBe("string");
    expect(thread.id.length).toBeGreaterThan(0);
    expect(typeof thread.created_at).toBe("string");
    expect(typeof thread.updated_at).toBe("string");
    expect(typeof thread.criteria_changed_at).toBe("string");
  });

  it("sets criteria_changed_at to created_at on creation", () => {
    const thread = createThread(db, {
      client_name: "Acme",
      client_id: acmeClientId,
      title: "Outage tracking",
      shorthand: "OUTAGE",
      description: "",
      criteria_prompt: "Production outages",
    });
    expect(thread.criteria_changed_at).toBe(thread.created_at);
  });

  it("summary starts empty", () => {
    const thread = createThread(db, {
      client_name: "Acme",
      client_id: acmeClientId,
      title: "My thread",
      shorthand: "MY-T",
      description: "",
      criteria_prompt: "",
    });
    expect(thread.summary).toBe("");
  });
});

describe("getThread", () => {
  it("returns the thread by id", () => {
    const created = createThread(db, {
      client_name: "Acme",
      client_id: acmeClientId,
      title: "Feature requests",
      shorthand: "FEAT-REQ",
      description: "Track recurring feature asks",
      criteria_prompt: "Feature requests from client",
    });
    const found = getThread(db, created.id);
    expect(found).toEqual(created);
  });

  it("returns null for unknown id", () => {
    const result = getThread(db, "nonexistent-id");
    expect(result).toBeNull();
  });
});

describe("listThreadsByClient", () => {
  it("returns threads for the matching client_id ordered by created_at desc", () => {
    createThread(db, { client_name: "Acme", client_id: acmeClientId, title: "Thread A", shorthand: "T-A", description: "", criteria_prompt: "" });
    createThread(db, { client_name: "Acme", client_id: acmeClientId, title: "Thread B", shorthand: "T-B", description: "", criteria_prompt: "" });
    createThread(db, { client_name: "Beta Co", client_id: betaClientId, title: "Thread C", shorthand: "T-C", description: "", criteria_prompt: "" });
    const acmeThreads = listThreadsByClient(db, acmeClientId);
    expect(acmeThreads).toHaveLength(2);
    expect(acmeThreads.every((t) => t.client_id === acmeClientId)).toBe(true);
  });

  it("filters out threads from other clients", () => {
    createThread(db, { client_name: "Beta Co", client_id: betaClientId, title: "Beta Thread", shorthand: "B-T", description: "", criteria_prompt: "" });
    const acmeThreads = listThreadsByClient(db, acmeClientId);
    expect(acmeThreads).toHaveLength(0);
  });

  it("returns meeting_count of 0 for new threads", () => {
    createThread(db, { client_name: "Acme", client_id: acmeClientId, title: "No meetings yet", shorthand: "NM", description: "", criteria_prompt: "" });
    const threads = listThreadsByClient(db, acmeClientId);
    expect(threads[0].meeting_count).toBe(0);
  });
});
