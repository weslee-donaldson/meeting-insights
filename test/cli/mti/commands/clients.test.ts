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
  it("displays assigned clients as a table", async () => {
    const client = stubClient({
      "/api/clients": ["Acme Corp", "Initech"],
    });
    const { chunks, stream } = captureOutput();

    const program = new Command();
    registerClients(program, { client, stream });
    await program.parseAsync(["clients", "list"], { from: "user" });

    const output = chunks.join("");
    expect(output).toContain("Name");
    expect(output).toContain("Acme Corp");
    expect(output).toContain("Initech");
  });

  it("outputs raw JSON when --json is passed", async () => {
    const client = stubClient({
      "/api/clients": ["Acme Corp", "Initech"],
    });
    const { chunks, stream } = captureOutput();

    const program = new Command();
    program.option("--json", "Output as JSON");
    registerClients(program, { client, stream });
    await program.parseAsync(["clients", "list", "--json"], { from: "user" });

    const parsed = JSON.parse(chunks.join(""));
    expect(parsed).toEqual(["Acme Corp", "Initech"]);
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
    expect(helpText).toContain('["string"]');
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
