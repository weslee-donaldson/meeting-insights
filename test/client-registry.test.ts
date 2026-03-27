import { describe, it, expect, beforeAll } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDb, migrate } from "../core/db.js";
import { seedClients, getClientByName, getClientByAlias, getAllClients, getDefaultClient, buildClientContext } from "../core/client-registry.js";
import type { Participant } from "../core/client-registry.js";
import type { DatabaseSync as Database } from "node:sqlite";

let db: Database;
let clientsFile: string;

const clientsData = [
  {
    name: "Revenium",
    aliases: ["Revenium", "REV"],
    client_team: [{ name: "John Smith", email: "john@revenium.com", role: "Developer" }],
  },
  {
    name: "Mandalore",
    aliases: ["Mandalore"],
    client_team: [{ name: "Luke", email: "luke@mandalore.com", role: "Engineer" }],
  },
];

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  const dir = join(tmpdir(), `clients-test-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  clientsFile = join(dir, "clients.json");
  writeFileSync(clientsFile, JSON.stringify(clientsData));
  seedClients(db, clientsFile);
});

describe("seedClients", () => {
  it("inserts client records from JSON file", () => {
    const all = getAllClients(db);
    expect(all).toHaveLength(2);
  });

  it("rejects malformed client entries missing name", () => {
    const badDb = createDb(":memory:");
    migrate(badDb);
    const dir = join(tmpdir(), `clients-bad-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const badFile = join(dir, "clients.json");
    writeFileSync(badFile, JSON.stringify([{ aliases: ["X"] }]));
    expect(() => seedClients(badDb, badFile)).toThrow();
  });

  it("rejects malformed client entries missing aliases", () => {
    const badDb = createDb(":memory:");
    migrate(badDb);
    const dir = join(tmpdir(), `clients-bad2-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const badFile = join(dir, "clients.json");
    writeFileSync(badFile, JSON.stringify([{ name: "X" }]));
    expect(() => seedClients(badDb, badFile)).toThrow();
  });
});

describe("seedClients generates client IDs", () => {
  it("each client has a non-empty id after seeding", () => {
    const all = getAllClients(db);
    for (const client of all) {
      expect(client.id).toEqual(expect.any(String));
      expect(client.id.length).toBeGreaterThan(0);
    }
  });

  it("client IDs are unique", () => {
    const all = getAllClients(db);
    const ids = all.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getClientByName", () => {
  it("retrieves client row by name with id", () => {
    const client = getClientByName(db, "Revenium");
    expect(client).not.toBeNull();
    expect(client!.name).toBe("Revenium");
    expect(client!.id).toEqual(expect.any(String));
  });
});

describe("getClientByAlias", () => {
  it("retrieves client row when alias matches", () => {
    const client = getClientByAlias(db, "REV");
    expect(client).not.toBeNull();
    expect(client!.name).toBe("Revenium");
  });
});

describe("getAllClients", () => {
  it("returns all client rows", () => {
    const all = getAllClients(db);
    expect(all.map((c) => c.name)).toEqual(["Revenium", "Mandalore"]);
  });
});

describe("client_team and implementation_team fields", () => {
  it("stores client_team as parseable Participant array", () => {
    const client = getClientByName(db, "Revenium");
    const team: Participant[] = JSON.parse(client!.client_team);
    expect(team).toEqual([{ name: "John Smith", email: "john@revenium.com", role: "Developer" }]);
  });

  it("stores implementation_team as empty array when not provided", () => {
    const client = getClientByName(db, "Revenium");
    const team: Participant[] = JSON.parse(client!.implementation_team);
    expect(team).toEqual([]);
  });

  it("stores implementation_team when provided", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `clients-impl-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([
      {
        name: "TestCo",
        aliases: ["Test"],
        client_team: [{ name: "Alice", email: "alice@testco.com", role: "PM" }],
        implementation_team: [{ name: "Bob", email: "bob@xolv.io", role: "Architect" }],
      },
    ]));
    seedClients(localDb, file);
    const client = getClientByName(localDb, "TestCo");
    const implTeam: Participant[] = JSON.parse(client!.implementation_team);
    expect(implTeam).toEqual([{ name: "Bob", email: "bob@xolv.io", role: "Architect" }]);
  });
});

describe("additional_extraction_llm_prompt field", () => {
  it("returns additional_extraction_llm_prompt when client is seeded with one", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `clients-refine-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([
      {
        name: "TestCo",
        aliases: ["Test"],
        client_team: [],
        additional_extraction_llm_prompt: "Stace is the CTO.",
      },
    ]));
    seedClients(localDb, file);
    const client = getClientByName(localDb, "TestCo");
    expect(client!.additional_extraction_llm_prompt).toBe("Stace is the CTO.");
  });

  it("returns null additional_extraction_llm_prompt when client has none", () => {
    const client = getClientByName(db, "Revenium");
    expect(client!.additional_extraction_llm_prompt).toBeNull();
  });
});

describe("meeting_names field", () => {
  it("returns parseable meeting_names array when client is seeded with one", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `clients-meetingnames-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([
      {
        name: "TestCo",
        aliases: ["Test"],
        client_team: [],
        meeting_names: ["Weekly Sync", "Team DSU"],
      },
    ]));
    seedClients(localDb, file);
    const client = getClientByName(localDb, "TestCo");
    expect(JSON.parse(client!.meeting_names)).toEqual(["Weekly Sync", "Team DSU"]);
  });

  it("returns empty array meeting_names when client has none", () => {
    const client = getClientByName(db, "Revenium");
    expect(JSON.parse(client!.meeting_names)).toEqual([]);
  });
});

describe("getDefaultClient", () => {
  it("returns name of client with is_default flag", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `clients-default-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([
      { name: "Acme", aliases: ["Acme"], client_team: [], is_default: true },
      { name: "Beta", aliases: ["Beta"], client_team: [] },
    ]));
    seedClients(localDb, file);
    expect(getDefaultClient(localDb)).toBe("Acme");
  });

  it("returns null when no client has is_default flag", () => {
    expect(getDefaultClient(db)).toBeNull();
  });
});

describe("buildClientContext", () => {
  it("includes client name in header", () => {
    const ctx = buildClientContext("Acme", [], [], undefined);
    expect(ctx).toContain("## Client Context: Acme");
  });

  it("lists client team members as name + role", () => {
    const ctx = buildClientContext(
      "Acme",
      [{ name: "Alice", role: "CTO" }, { name: "Bob", role: "Developer" }],
      [],
      undefined,
    );
    expect(ctx).toContain("- Alice, CTO");
    expect(ctx).toContain("- Bob, Developer");
  });

  it("lists implementation team members as name + role", () => {
    const ctx = buildClientContext(
      "Acme",
      [],
      [{ name: "Carol", email: "carol@xolv.io", role: "Architect" }],
      undefined,
    );
    expect(ctx).toContain("- Carol, Architect");
  });

  it("includes role authority guidance paragraph", () => {
    const ctx = buildClientContext("Acme", [], [], undefined);
    expect(ctx).toContain("determining whether a request is critical");
  });

  it("appends additional_extraction_llm_prompt after guidance when provided", () => {
    const ctx = buildClientContext("Acme", [], [], "Alice is the lead engineer.");
    expect(ctx).toContain("Alice is the lead engineer.");
    const guidanceIdx = ctx.indexOf("determining whether a request is critical");
    const promptIdx = ctx.indexOf("Alice is the lead engineer.");
    expect(promptIdx).toBeGreaterThan(guidanceIdx);
  });

  it("omits additional_extraction_llm_prompt section when not provided", () => {
    const ctx = buildClientContext("Acme", [{ name: "Alice", role: "CTO" }], [], undefined);
    expect(ctx).not.toContain("null");
    expect(ctx).not.toContain("undefined");
  });

  it("renders glossary section with canonical terms and variants", () => {
    const glossary = [
      { term: "CSTAR", variants: ["C*", "C star", "Cstar"], description: "Project management platform" },
      { term: "AppDev", variants: ["app dev", "appdev"], description: "Application development team" },
    ];
    const ctx = buildClientContext("Acme", [], [], undefined, glossary);
    expect(ctx).toContain("## Terminology Glossary");
    expect(ctx).toContain("**CSTAR**");
    expect(ctx).toContain('"C*"');
    expect(ctx).toContain('"C star"');
    expect(ctx).toContain('"Cstar"');
    expect(ctx).toContain("Project management platform");
    expect(ctx).toContain("**AppDev**");
    expect(ctx).toContain('"app dev"');
    expect(ctx).toContain("Application development team");
  });

  it("omits glossary section when glossary is undefined", () => {
    const ctx = buildClientContext("Acme", [], [], undefined);
    expect(ctx).not.toContain("Glossary");
  });

  it("omits glossary section when glossary is empty array", () => {
    const ctx = buildClientContext("Acme", [], [], undefined, []);
    expect(ctx).not.toContain("Glossary");
  });

  it("places glossary after authority guidance and before additional prompt", () => {
    const glossary = [{ term: "CSTAR", variants: ["C*"], description: "Platform" }];
    const ctx = buildClientContext("Acme", [], [], "Alice is the lead.", glossary);
    const guidanceIdx = ctx.indexOf("determining whether a request is critical");
    const glossaryIdx = ctx.indexOf("## Terminology Glossary");
    const promptIdx = ctx.indexOf("Alice is the lead.");
    expect(glossaryIdx).toBeGreaterThan(guidanceIdx);
    expect(promptIdx).toBeGreaterThan(glossaryIdx);
  });
});
