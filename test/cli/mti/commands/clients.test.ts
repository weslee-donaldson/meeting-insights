import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Command } from "commander";
import { HttpClient } from "../../../../cli/mti/src/http-client.ts";
import { registerClients } from "../../../../cli/mti/src/commands/clients.ts";

function stubClient(responses: Record<string, unknown>) {
  const stubFetch = async (url: string | URL | Request) => {
    const urlStr = typeof url === "string" ? url : url.toString();
    for (const [pattern, body] of Object.entries(responses)) {
      if (urlStr.includes(pattern)) {
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
    }
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  };
  return new HttpClient({
    baseUrl: "http://localhost:3000",
    token: null,
    fetch: stubFetch,
  });
}

function captureOutput(): { chunks: string[]; stream: NodeJS.WritableStream } {
  const chunks: string[] = [];
  const stream = {
    write(chunk: string) {
      chunks.push(chunk);
      return true;
    },
  } as NodeJS.WritableStream;
  return { chunks, stream };
}

describe("clients list", () => {
  const listData = [
    { id: "aaaa1111-2222-3333-4444-555566667777", name: "Acme Corp" },
    { id: "bbbb1111-2222-3333-4444-555566667777", name: "Initech" },
  ];

  it("displays assigned clients as a table with truncated IDs", async () => {
    const client = stubClient({
      "/api/clients/list": listData,
    });
    const { chunks, stream } = captureOutput();

    const program = new Command();
    registerClients(program, { client, stream });
    await program.parseAsync(["clients", "list"], { from: "user" });

    const output = chunks.join("");
    expect(output).toContain("ID");
    expect(output).toContain("Name");
    expect(output).toContain("aaaa1111");
    expect(output).toContain("Acme Corp");
    expect(output).toContain("bbbb1111");
    expect(output).toContain("Initech");
  });

  it("outputs raw JSON with full UUIDs when --json is passed at program level", async () => {
    const client = stubClient({
      "/api/clients/list": listData,
    });
    const { chunks, stream } = captureOutput();

    const program = new Command();
    program.option("--json", "Output as JSON");
    registerClients(program, { client, stream });
    await program.parseAsync(["clients", "list", "--json"], { from: "user" });

    const parsed = JSON.parse(chunks.join(""));
    expect(parsed).toEqual(listData);
  });

  it("outputs raw JSON when --json is passed as subcommand option with positional options enabled", async () => {
    const client = stubClient({
      "/api/clients/list": listData,
    });
    const { chunks, stream } = captureOutput();

    const program = new Command();
    program.option("--json", "Output as JSON").enablePositionalOptions();
    registerClients(program, { client, stream });
    await program.parseAsync(["clients", "list", "--json"], { from: "user" });

    const parsed = JSON.parse(chunks.join(""));
    expect(parsed).toEqual(listData);
  });

  it("shows help with description, output schema, and example", () => {
    const program = new Command();
    registerClients(program);
    const clientsCmd = program.commands.find((c) => c.name() === "clients");
    const listCmd = clientsCmd!.commands.find((c) => c.name() === "list");
    let helpText = "";
    listCmd!.configureOutput({ writeOut: (s) => (helpText += s) });
    listCmd!.outputHelp();
    expect(helpText).toContain("List your assigned clients");
    expect(helpText).toContain('"id"');
    expect(helpText).toContain('"name"');
    expect(helpText).toContain("mti clients list");
  });
});

describe("clients default", () => {
  it("displays the default client name", async () => {
    const client = stubClient({
      "/api/default-client": "Acme Corp",
    });
    const { chunks, stream } = captureOutput();

    const program = new Command();
    registerClients(program, { client, stream });
    await program.parseAsync(["clients", "default"], { from: "user" });

    const output = chunks.join("");
    expect(output.trim()).toBe("Acme Corp");
  });

  it("displays message when no default client is set", async () => {
    const client = stubClient({
      "/api/default-client": null,
    });
    const { chunks, stream } = captureOutput();

    const program = new Command();
    registerClients(program, { client, stream });
    await program.parseAsync(["clients", "default"], { from: "user" });

    const output = chunks.join("");
    expect(output.trim()).toBe("No default client set.");
  });

  it("shows help with description and example", () => {
    const program = new Command();
    registerClients(program);
    const clientsCmd = program.commands.find((c) => c.name() === "clients");
    const defaultCmd = clientsCmd!.commands.find((c) => c.name() === "default");
    let helpText = "";
    defaultCmd!.configureOutput({ writeOut: (s) => (helpText += s) });
    defaultCmd!.outputHelp();
    expect(helpText).toContain("Show your default client");
    expect(helpText).toContain("mti clients default");
  });
});

describe("clients glossary", () => {
  const glossaryData = [
    {
      term: "OKR",
      variants: ["OKRs"],
      description: "Objectives and Key Results",
    },
    {
      term: "RACI",
      variants: ["RACI matrix", "RACI chart"],
      description: "Responsible, Accountable, Consulted, Informed",
    },
  ];

  it("displays glossary terms as a table", async () => {
    const client = stubClient({
      "/api/glossary": glossaryData,
    });
    const { chunks, stream } = captureOutput();

    const program = new Command();
    registerClients(program, { client, stream });
    await program.parseAsync(["clients", "glossary", "Acme Corp"], {
      from: "user",
    });

    const output = chunks.join("");
    expect(output).toContain("Term");
    expect(output).toContain("Variants");
    expect(output).toContain("Description");
    expect(output).toContain("OKR");
    expect(output).toContain("OKRs");
    expect(output).toContain("RACI matrix, RACI cha");
  });

  it("outputs raw JSON when --json is passed", async () => {
    const client = stubClient({
      "/api/glossary": glossaryData,
    });
    const { chunks, stream } = captureOutput();

    const program = new Command();
    program.option("--json", "Output as JSON");
    registerClients(program, { client, stream });
    await program.parseAsync(["clients", "glossary", "Acme Corp", "--json"], {
      from: "user",
    });

    const parsed = JSON.parse(chunks.join(""));
    expect(parsed).toEqual(glossaryData);
  });

  it("propagates NotFoundError for unknown client", async () => {
    const client = stubClient({});
    const { stream } = captureOutput();

    const program = new Command();
    registerClients(program, { client, stream });

    await expect(
      program.parseAsync(["clients", "glossary", "Unknown"], { from: "user" })
    ).rejects.toThrow("Resource not found.");
  });

  it("shows help with description, output schema, and example", () => {
    const program = new Command();
    registerClients(program);
    const clientsCmd = program.commands.find((c) => c.name() === "clients");
    const glossaryCmd = clientsCmd!.commands.find(
      (c) => c.name() === "glossary"
    );
    let helpText = "";
    glossaryCmd!.configureOutput({ writeOut: (s) => (helpText += s) });
    glossaryCmd!.outputHelp();
    expect(helpText).toContain("Show glossary terms for a client");
    expect(helpText).toContain('"term"');
    expect(helpText).toContain('"variants"');
    expect(helpText).toContain("mti clients glossary");
    expect(helpText).toContain("404");
  });
});

describe("clients info", () => {
  const detailData = {
    id: "aaaa1111-2222-3333-4444-555566667777",
    name: "Acme Corp",
    aliases: ["Acme", "ACME Inc"],
    client_team: [
      { name: "Alice", email: "alice@acme.com", role: "CTO" },
      { name: "Bob", email: "bob@acme.com", role: "PO" },
    ],
    implementation_team: [
      { name: "Charlie", email: "charlie@impl.io", role: "Architect" },
    ],
    meeting_names: ["Acme DSU", "Acme Retro"],
    glossary_count: 5,
  };

  it("displays client detail with header and team tables", async () => {
    const client = stubClient({
      "/api/clients/aaaa1111-2222-3333-4444-555566667777": detailData,
    });
    const { chunks, stream } = captureOutput();

    const program = new Command();
    registerClients(program, { client, stream });
    await program.parseAsync(
      ["clients", "info", "aaaa1111-2222-3333-4444-555566667777"],
      { from: "user" }
    );

    const output = chunks.join("");
    expect(output).toContain("Acme Corp");
    expect(output).toContain("Acme, ACME Inc");
    expect(output).toContain("CLIENT TEAM");
    expect(output).toContain("Alice");
    expect(output).toContain("CTO");
    expect(output).toContain("alice@acme.com");
    expect(output).toContain("IMPLEMENTATION TEAM");
    expect(output).toContain("Charlie");
    expect(output).toContain("Architect");
    expect(output).toContain("MEETING NAMES");
    expect(output).toContain("Acme DSU");
    expect(output).toContain("Acme Retro");
    expect(output).toContain("Glossary Terms:");
    expect(output).toContain("5");
  });

  it("outputs raw JSON when --json is passed", async () => {
    const client = stubClient({
      "/api/clients/aaaa1111-2222-3333-4444-555566667777": detailData,
    });
    const { chunks, stream } = captureOutput();

    const program = new Command();
    program.option("--json", "Output as JSON");
    registerClients(program, { client, stream });
    await program.parseAsync(
      ["clients", "info", "aaaa1111-2222-3333-4444-555566667777", "--json"],
      { from: "user" }
    );

    const parsed = JSON.parse(chunks.join(""));
    expect(parsed).toEqual(detailData);
  });

  it("displays not found message for unknown client id", async () => {
    const client = stubClient({});
    const { chunks, stream } = captureOutput();

    const program = new Command();
    registerClients(program, { client, stream });
    await program.parseAsync(["clients", "info", "nonexistent"], {
      from: "user",
    });

    const output = chunks.join("");
    expect(output.trim()).toBe("Client not found.");
  });
});
