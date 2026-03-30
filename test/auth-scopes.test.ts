import { describe, it, expect } from "vitest";
import {
  VALID_SCOPES,
  isValidScope,
  scopesForRoute,
} from "../core/auth/scopes.js";
import type { Scope, AuthIdentity } from "../core/auth/scopes.js";

describe("VALID_SCOPES", () => {
  it("contains exactly the 12 defined scopes", () => {
    expect(VALID_SCOPES).toEqual([
      "meetings:read",
      "meetings:write",
      "search:execute",
      "threads:read",
      "threads:write",
      "insights:read",
      "insights:write",
      "milestones:read",
      "milestones:write",
      "notes:read",
      "notes:write",
      "admin",
    ]);
  });
});

describe("isValidScope", () => {
  it("returns true for a valid scope", () => {
    expect(isValidScope("meetings:read")).toBe(true);
  });

  it("returns true for the admin scope", () => {
    expect(isValidScope("admin")).toBe(true);
  });

  it("returns false for an unknown scope string", () => {
    expect(isValidScope("fake:scope")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isValidScope("")).toBe(false);
  });
});

describe("scopesForRoute", () => {
  it("maps GET /api/meetings to meetings:read", () => {
    expect(scopesForRoute("GET", "/api/meetings")).toEqual(["meetings:read"]);
  });

  it("maps GET /api/meetings/:id to meetings:read", () => {
    expect(scopesForRoute("GET", "/api/meetings/abc-123")).toEqual(["meetings:read"]);
  });

  it("maps GET /api/meetings/:id/artifact to meetings:read", () => {
    expect(scopesForRoute("GET", "/api/meetings/abc/artifact")).toEqual(["meetings:read"]);
  });

  it("maps POST /api/meetings to meetings:write", () => {
    expect(scopesForRoute("POST", "/api/meetings")).toEqual(["meetings:write"]);
  });

  it("maps DELETE /api/meetings to meetings:write", () => {
    expect(scopesForRoute("DELETE", "/api/meetings")).toEqual(["meetings:write"]);
  });

  it("maps PUT /api/meetings/:id/action-items/:index to meetings:write", () => {
    expect(scopesForRoute("PUT", "/api/meetings/m1/action-items/0")).toEqual(["meetings:write"]);
  });

  it("maps GET /api/meetings/:id/messages to meetings:write", () => {
    expect(scopesForRoute("GET", "/api/meetings/m1/messages")).toEqual(["meetings:write"]);
  });

  it("maps DELETE /api/meetings/:id/messages to meetings:write", () => {
    expect(scopesForRoute("DELETE", "/api/meetings/m1/messages")).toEqual(["meetings:write"]);
  });

  it("maps GET /api/clients to meetings:read", () => {
    expect(scopesForRoute("GET", "/api/clients")).toEqual(["meetings:read"]);
  });

  it("maps GET /api/clients/list to meetings:read", () => {
    expect(scopesForRoute("GET", "/api/clients/list")).toEqual(["meetings:read"]);
  });

  it("maps GET /api/templates to meetings:read", () => {
    expect(scopesForRoute("GET", "/api/templates")).toEqual(["meetings:read"]);
  });

  it("maps POST /api/chat to search:execute", () => {
    expect(scopesForRoute("POST", "/api/chat")).toEqual(["search:execute"]);
  });

  it("maps POST /api/chat/conversation to search:execute", () => {
    expect(scopesForRoute("POST", "/api/chat/conversation")).toEqual(["search:execute"]);
  });

  it("maps GET /api/search to search:execute", () => {
    expect(scopesForRoute("GET", "/api/search")).toEqual(["search:execute"]);
  });

  it("maps POST /api/deep-search to search:execute", () => {
    expect(scopesForRoute("POST", "/api/deep-search")).toEqual(["search:execute"]);
  });

  it("maps GET /api/threads to threads:read", () => {
    expect(scopesForRoute("GET", "/api/threads")).toEqual(["threads:read"]);
  });

  it("maps GET /api/threads/:id/meetings to threads:read", () => {
    expect(scopesForRoute("GET", "/api/threads/t1/meetings")).toEqual(["threads:read"]);
  });

  it("maps POST /api/threads to threads:write", () => {
    expect(scopesForRoute("POST", "/api/threads")).toEqual(["threads:write"]);
  });

  it("maps PUT /api/threads/:id to threads:write", () => {
    expect(scopesForRoute("PUT", "/api/threads/t1")).toEqual(["threads:write"]);
  });

  it("maps DELETE /api/threads/:id to threads:write", () => {
    expect(scopesForRoute("DELETE", "/api/threads/t1")).toEqual(["threads:write"]);
  });

  it("maps GET /api/insights to insights:read", () => {
    expect(scopesForRoute("GET", "/api/insights")).toEqual(["insights:read"]);
  });

  it("maps GET /api/insights/:id/meetings to insights:read", () => {
    expect(scopesForRoute("GET", "/api/insights/i1/meetings")).toEqual(["insights:read"]);
  });

  it("maps POST /api/insights to insights:write", () => {
    expect(scopesForRoute("POST", "/api/insights")).toEqual(["insights:write"]);
  });

  it("maps DELETE /api/insights/:id to insights:write", () => {
    expect(scopesForRoute("DELETE", "/api/insights/i1")).toEqual(["insights:write"]);
  });

  it("maps POST /api/insights/:id/generate to insights:write", () => {
    expect(scopesForRoute("POST", "/api/insights/i1/generate")).toEqual(["insights:write"]);
  });

  it("maps GET /api/milestones to milestones:read", () => {
    expect(scopesForRoute("GET", "/api/milestones")).toEqual(["milestones:read"]);
  });

  it("maps GET /api/milestones/:id/mentions to milestones:read", () => {
    expect(scopesForRoute("GET", "/api/milestones/ms1/mentions")).toEqual(["milestones:read"]);
  });

  it("maps POST /api/milestones to milestones:write", () => {
    expect(scopesForRoute("POST", "/api/milestones")).toEqual(["milestones:write"]);
  });

  it("maps DELETE /api/milestones/:id to milestones:write", () => {
    expect(scopesForRoute("DELETE", "/api/milestones/ms1")).toEqual(["milestones:write"]);
  });

  it("maps GET /api/notes/meeting/m1 to notes:read", () => {
    expect(scopesForRoute("GET", "/api/notes/meeting/m1")).toEqual(["notes:read"]);
  });

  it("maps GET /api/notes/meeting/m1/count to notes:read", () => {
    expect(scopesForRoute("GET", "/api/notes/meeting/m1/count")).toEqual(["notes:read"]);
  });

  it("maps POST /api/notes/meeting/m1 to notes:write", () => {
    expect(scopesForRoute("POST", "/api/notes/meeting/m1")).toEqual(["notes:write"]);
  });

  it("maps PATCH /api/notes/n1 to notes:write", () => {
    expect(scopesForRoute("PATCH", "/api/notes/n1")).toEqual(["notes:write"]);
  });

  it("maps DELETE /api/notes/n1 to notes:write", () => {
    expect(scopesForRoute("DELETE", "/api/notes/n1")).toEqual(["notes:write"]);
  });

  it("maps GET /api/debug to admin", () => {
    expect(scopesForRoute("GET", "/api/debug")).toEqual(["admin"]);
  });

  it("maps POST /api/re-embed to admin", () => {
    expect(scopesForRoute("POST", "/api/re-embed")).toEqual(["admin"]);
  });

  it("returns empty array for unknown routes", () => {
    expect(scopesForRoute("GET", "/api/unknown")).toEqual([]);
  });
});

describe("AuthIdentity type", () => {
  it("satisfies the interface shape", () => {
    const identity: AuthIdentity = {
      tenantId: "t1",
      userId: "u1",
      scopes: ["meetings:read", "admin"],
    };
    expect(identity).toEqual({
      tenantId: "t1",
      userId: "u1",
      scopes: ["meetings:read", "admin"],
    });
  });
});
