import { describe, it, expect, beforeAll } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDb, migrate } from "../core/db.js";
import { seedClients, getClientByName, getClientByAlias, getAllClients, getDefaultClient, getGlossaryForClient, buildClientContext, getClientById } from "../core/client-registry.js";
import type { Participant, GlossaryEntry, ClientRow } from "../core/client-registry.js";
import type { DatabaseSync as Database } from "node:sqlite";
import { seedTestTenant } from "./helpers/seed-test-tenant.js";

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

  it("updates existing client fields when re-seeded with new data", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `clients-upsert-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([{
      name: "UpsertCo",
      aliases: ["UC"],
      client_team: [],
      glossary: [{ term: "OldTerm", variants: ["old"], description: "Old desc" }],
    }]));
    seedClients(localDb, file);
    const before = getGlossaryForClient(localDb, "UpsertCo");
    expect(before).toEqual([{ term: "OldTerm", variants: ["old"], description: "Old desc" }]);
    writeFileSync(file, JSON.stringify([{
      name: "UpsertCo",
      aliases: ["UC"],
      client_team: [{ name: "Alice", email: "alice@uc.com", role: "CTO" }],
      glossary: [
        { term: "OldTerm", variants: ["old"], description: "Old desc" },
        { term: "NewTerm", variants: ["new"], description: "New desc" },
      ],
    }]));
    seedClients(localDb, file);
    const after = getGlossaryForClient(localDb, "UpsertCo");
    expect(after).toEqual([
      { term: "OldTerm", variants: ["old"], description: "Old desc" },
      { term: "NewTerm", variants: ["new"], description: "New desc" },
    ]);
    const client = getClientByName(localDb, "UpsertCo");
    const team = JSON.parse(client!.client_team);
    expect(team).toEqual([{ name: "Alice", email: "alice@uc.com", role: "CTO" }]);
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

describe("seedClients tenant-scoping", () => {
  it("writes tenant_id when tenantId is provided", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const { tenantId } = seedTestTenant(localDb);
    const dir = join(tmpdir(), `clients-tenant-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([{ name: "TenantCo", aliases: ["TC"], client_team: [] }]));
    seedClients(localDb, file, tenantId);
    const row = localDb.prepare("SELECT tenant_id FROM clients WHERE name = ?").get("TenantCo") as { tenant_id: string };
    expect(row.tenant_id).toBe(tenantId);
  });

  it("defaults to bootstrap tenant when tenantId is omitted", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const bootstrapTenantId = (localDb.prepare("INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?) RETURNING id").get(
      "00000000-0000-0000-0000-000000000001", "Default", "default",
    ) as { id: string }).id;
    const dir = join(tmpdir(), `clients-default-tenant-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([{ name: "DefaultCo", aliases: ["DC"], client_team: [] }]));
    seedClients(localDb, file);
    const row = localDb.prepare("SELECT tenant_id FROM clients WHERE name = ?").get("DefaultCo") as { tenant_id: string };
    expect(row.tenant_id).toBe(bootstrapTenantId);
  });

  it("preserves tenant_id on upsert when tenantId is provided", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const { tenantId } = seedTestTenant(localDb);
    const dir = join(tmpdir(), `clients-upsert-tenant-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([{ name: "UpsertTenantCo", aliases: ["UTC"], client_team: [] }]));
    seedClients(localDb, file, tenantId);
    writeFileSync(file, JSON.stringify([{ name: "UpsertTenantCo", aliases: ["UTC", "UTC2"], client_team: [] }]));
    seedClients(localDb, file, tenantId);
    const row = localDb.prepare("SELECT tenant_id, aliases FROM clients WHERE name = ?").get("UpsertTenantCo") as { tenant_id: string; aliases: string };
    expect(row.tenant_id).toBe(tenantId);
    expect(JSON.parse(row.aliases)).toEqual(["UTC", "UTC2"]);
  });
});

describe("getClientByName", () => {
  it("retrieves client row by name with id", () => {
    const client = getClientByName(db, "Revenium");
    expect(client).not.toBeNull();
    expect(client!.name).toBe("Revenium");
    expect(client!.id).toEqual(expect.any(String));
  });

  it("returns client when name matches within tenant", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const { tenantId } = seedTestTenant(localDb);
    const dir = join(tmpdir(), `clients-byname-tenant-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([{ name: "ScopedCo", aliases: ["SC"], client_team: [] }]));
    seedClients(localDb, file, tenantId);
    const client = getClientByName(localDb, "ScopedCo", tenantId);
    expect(client).toEqual(expect.objectContaining({ name: "ScopedCo", tenant_id: tenantId }));
  });

  it("returns null when name exists but tenant does not match", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const { tenantId: t1 } = seedTestTenant(localDb);
    const t2 = "00000000-0000-0000-0000-ffffffffffff";
    localDb.prepare("INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)").run(t2, "Other", "other");
    const dir = join(tmpdir(), `clients-byname-wrong-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([{ name: "WrongTenantCo", aliases: ["WTC"], client_team: [] }]));
    seedClients(localDb, file, t1);
    const client = getClientByName(localDb, "WrongTenantCo", t2);
    expect(client).toBeNull();
  });
});

describe("getClientByAlias", () => {
  it("retrieves client row when alias matches", () => {
    const client = getClientByAlias(db, "REV");
    expect(client).not.toBeNull();
    expect(client!.name).toBe("Revenium");
  });

  it("scopes alias search to tenant when tenantId provided", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const { tenantId: t1 } = seedTestTenant(localDb);
    const t2 = "00000000-0000-0000-0000-bbbbbbbbbbbb";
    localDb.prepare("INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)").run(t2, "Other", "other-alias");
    const dir = join(tmpdir(), `clients-alias-tenant-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file1 = join(dir, "c1.json");
    writeFileSync(file1, JSON.stringify([{ name: "AliasCo1", aliases: ["SHARED"], client_team: [] }]));
    seedClients(localDb, file1, t1);
    const file2 = join(dir, "c2.json");
    writeFileSync(file2, JSON.stringify([{ name: "AliasCo2", aliases: ["OTHER"], client_team: [] }]));
    seedClients(localDb, file2, t2);
    const found = getClientByAlias(localDb, "SHARED", t1);
    expect(found).toEqual(expect.objectContaining({ name: "AliasCo1", tenant_id: t1 }));
    const notFound = getClientByAlias(localDb, "SHARED", t2);
    expect(notFound).toBeNull();
  });
});

describe("getAllClients", () => {
  it("returns all client rows", () => {
    const all = getAllClients(db);
    expect(all.map((c) => c.name)).toEqual(["Revenium", "Mandalore"]);
  });

  it("returns only clients for specified tenant", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const { tenantId: t1 } = seedTestTenant(localDb);
    const t2 = "00000000-0000-0000-0000-aaaaaaaaaaaa";
    localDb.prepare("INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)").run(t2, "Second", "second");
    const dir = join(tmpdir(), `clients-all-tenant-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file1 = join(dir, "clients1.json");
    writeFileSync(file1, JSON.stringify([{ name: "AlphaCo", aliases: ["A"], client_team: [] }]));
    seedClients(localDb, file1, t1);
    const file2 = join(dir, "clients2.json");
    writeFileSync(file2, JSON.stringify([{ name: "BetaCo", aliases: ["B"], client_team: [] }]));
    seedClients(localDb, file2, t2);
    const t1Clients = getAllClients(localDb, t1);
    expect(t1Clients.map(c => c.name)).toEqual(["AlphaCo"]);
    const t2Clients = getAllClients(localDb, t2);
    expect(t2Clients.map(c => c.name)).toEqual(["BetaCo"]);
    const allClients = getAllClients(localDb);
    expect(allClients.map(c => c.name)).toEqual(["AlphaCo", "BetaCo"]);
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

describe("glossary field", () => {
  it("stores glossary as parseable GlossaryEntry array when client is seeded with one", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `clients-glossary-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([
      {
        name: "TestCo",
        aliases: ["Test"],
        client_team: [],
        glossary: [
          { term: "CSTAR", variants: ["C*", "C star"], description: "Platform" },
        ],
      },
    ]));
    seedClients(localDb, file);
    const client = getClientByName(localDb, "TestCo");
    const glossary: GlossaryEntry[] = JSON.parse(client!.glossary);
    expect(glossary).toEqual([{ term: "CSTAR", variants: ["C*", "C star"], description: "Platform" }]);
  });

  it("returns empty array glossary when client has none", () => {
    const client = getClientByName(db, "Revenium");
    expect(JSON.parse(client!.glossary)).toEqual([]);
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

  it("scopes default client lookup to tenant", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const { tenantId: t1 } = seedTestTenant(localDb);
    const t2 = "00000000-0000-0000-0000-cccccccccccc";
    localDb.prepare("INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)").run(t2, "Other", "other-default");
    const dir = join(tmpdir(), `clients-default-tenant-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file1 = join(dir, "c1.json");
    writeFileSync(file1, JSON.stringify([{ name: "DefaultT1", aliases: ["DT1"], client_team: [], is_default: true }]));
    seedClients(localDb, file1, t1);
    const file2 = join(dir, "c2.json");
    writeFileSync(file2, JSON.stringify([{ name: "DefaultT2", aliases: ["DT2"], client_team: [], is_default: true }]));
    seedClients(localDb, file2, t2);
    expect(getDefaultClient(localDb, t1)).toBe("DefaultT1");
    expect(getDefaultClient(localDb, t2)).toBe("DefaultT2");
  });
});

describe("getGlossaryForClient", () => {
  it("returns parsed glossary entries for client with glossary", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `clients-glossary-lookup-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([{
      name: "TestCo",
      aliases: ["Test"],
      client_team: [],
      glossary: [
        { term: "CSTAR", variants: ["C*", "C star"], description: "Platform" },
        { term: "AppDev", variants: ["app dev"], description: "Dev team" },
      ],
    }]));
    seedClients(localDb, file);
    const result = getGlossaryForClient(localDb, "TestCo");
    expect(result).toEqual([
      { term: "CSTAR", variants: ["C*", "C star"], description: "Platform" },
      { term: "AppDev", variants: ["app dev"], description: "Dev team" },
    ]);
  });

  it("returns empty array for unknown client", () => {
    const result = getGlossaryForClient(db, "NonExistent");
    expect(result).toEqual([]);
  });

  it("returns empty array for client without glossary", () => {
    const result = getGlossaryForClient(db, "Revenium");
    expect(result).toEqual([]);
  });

  it("scopes glossary lookup to tenant", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const { tenantId: t1 } = seedTestTenant(localDb);
    const t2 = "00000000-0000-0000-0000-dddddddddddd";
    localDb.prepare("INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)").run(t2, "Other", "other-glossary");
    const dir = join(tmpdir(), `clients-glossary-tenant-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file1 = join(dir, "c1.json");
    writeFileSync(file1, JSON.stringify([{
      name: "GlossaryCo",
      aliases: ["GC"],
      client_team: [],
      glossary: [{ term: "FooBar", variants: ["FB"], description: "A thing" }],
    }]));
    seedClients(localDb, file1, t1);
    const result = getGlossaryForClient(localDb, "GlossaryCo", t1);
    expect(result).toEqual([{ term: "FooBar", variants: ["FB"], description: "A thing" }]);
    const wrongTenant = getGlossaryForClient(localDb, "GlossaryCo", t2);
    expect(wrongTenant).toEqual([]);
  });
});

describe("getClientById", () => {
  it("returns client row by UUID", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const { tenantId } = seedTestTenant(localDb);
    const dir = join(tmpdir(), `clients-byid-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([{ name: "IdLookupCo", aliases: ["ILC"], client_team: [] }]));
    seedClients(localDb, file, tenantId);
    const byName = getClientByName(localDb, "IdLookupCo");
    const byId = getClientById(localDb, byName!.id);
    expect(byId).toEqual(byName);
  });

  it("returns null for unknown UUID", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const result = getClientById(localDb, "00000000-0000-0000-0000-999999999999");
    expect(result).toBeNull();
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
    expect(ctx).toContain("**CSTAR** →");
    expect(ctx).toContain('"C*"');
    expect(ctx).toContain('"C star"');
    expect(ctx).toContain('"Cstar"');
    expect(ctx).toContain("**AppDev** →");
    expect(ctx).toContain('"app dev"');
    expect(ctx).not.toContain("Project management platform");
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
