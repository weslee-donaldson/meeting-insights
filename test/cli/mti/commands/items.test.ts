import { describe, it, expect } from "vitest";
import { Command } from "commander";
import { Writable } from "node:stream";
import { HttpClient } from "../../../../cli/mti/src/http-client.ts";
import {
  registerItems,
  listItems,
  createItem,
  editItem,
} from "../../../../cli/mti/src/commands/items.ts";

function collectStream(): { stream: Writable; output: () => string } {
  const chunks: Buffer[] = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(Buffer.from(chunk));
      cb();
    },
  });
  return {
    stream,
    output: () => Buffer.concat(chunks).toString(),
  };
}

function stubClient(
  handler: (url: string, init?: RequestInit) => Promise<Response>
): HttpClient {
  return new HttpClient({
    baseUrl: "http://localhost:3000",
    token: "test-token",
    fetch: handler as (
      url: string | URL | Request,
      init?: RequestInit
    ) => Promise<Response>,
  });
}

function buildProgram(): Command {
  const program = new Command();
  program.option("--json", "Output as JSON");
  registerItems(program);
  return program;
}

function captureHelp(cmd: Command): string {
  let text = "";
  cmd.configureOutput({
    writeOut: (str) => {
      text += str;
    },
    writeErr: (str) => {
      text += str;
    },
  });
  cmd.outputHelp();
  return text;
}

describe("items list", () => {
  const sampleItems = [
    {
      meeting_id: "m1",
      meeting_title: "Q1 Planning Review",
      meeting_date: "2026-01-15",
      item_index: 0,
      description: "Draft Q2 roadmap",
      owner: "Alice",
      requester: "Bob",
      due_date: "2026-04-01",
      priority: "critical",
      canonical_id: "c1",
      total_mentions: 2,
      short_id: "f3a1b2",
    },
  ];

  it("shows action items for a client in table format", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(sampleItems), { status: 200 })
    );
    const { stream, output } = collectStream();

    await listItems("Acme", {}, { client, stream });

    const text = output();
    expect(text).toContain("Short ID");
    expect(text).toContain("Description");
    expect(text).toContain("f3a1b2");
    expect(text).toContain("Draft Q2 roadmap");
    expect(text).toContain("Alice");
    expect(text).toContain("2026-04-01");
    expect(text).toContain("critical");
    expect(text).toContain("Q1 Planning Review");
    expect(text).toContain("2026-01-15");
  });

  it("outputs raw JSON when --json is passed", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(sampleItems), { status: 200 })
    );
    const { stream, output } = collectStream();

    await listItems("Acme", { json: true }, { client, stream });

    expect(JSON.parse(output())).toEqual(sampleItems);
  });

  it("passes date filters as query params", async () => {
    let capturedUrl = "";
    const client = stubClient(async (url) => {
      capturedUrl = url;
      return new Response(JSON.stringify([]), { status: 200 });
    });
    const { stream } = collectStream();

    await listItems(
      "Acme",
      { after: "2026-01-01", before: "2026-06-01" },
      { client, stream }
    );

    const parsed = new URL(capturedUrl);
    expect(parsed.pathname).toBe("/api/clients/Acme/action-items");
    expect(parsed.searchParams.get("after")).toBe("2026-01-01");
    expect(parsed.searchParams.get("before")).toBe("2026-06-01");
  });

  it("encodes client name in URL path", async () => {
    let capturedUrl = "";
    const client = stubClient(async (url) => {
      capturedUrl = url;
      return new Response(JSON.stringify([]), { status: 200 });
    });
    const { stream } = collectStream();

    await listItems("Acme Corp", {}, { client, stream });

    const parsed = new URL(capturedUrl);
    expect(parsed.pathname).toBe("/api/clients/Acme%20Corp/action-items");
  });

  it("shows help with output schema, example, and errors", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const list = items.commands.find((c) => c.name() === "list")!;
    const help = captureHelp(list);

    expect(help).toContain("List action items across all meetings for a client.");
    expect(help).toContain("Output schema (--json):");
    expect(help).toContain("Example:");
    expect(help).toContain("Errors:");
    expect(help).toContain("404");
  });
});

describe("items create", () => {
  it("adds a new action item to a meeting", async () => {
    let capturedUrl = "";
    let capturedBody = "";
    const client = stubClient(async (url, init) => {
      capturedUrl = url;
      capturedBody = init?.body as string;
      return new Response(null, { status: 204 });
    });
    const { stream, output } = collectStream();

    await createItem(
      "m1",
      { desc: "Draft Q2 roadmap", owner: "Alice", due: "2026-04-01", priority: "critical" },
      { client, stream }
    );

    expect(new URL(capturedUrl).pathname).toBe("/api/meetings/m1/action-items");
    expect(JSON.parse(capturedBody)).toEqual({
      description: "Draft Q2 roadmap",
      owner: "Alice",
      due_date: "2026-04-01",
      priority: "critical",
    });
    expect(output()).toContain("Action item added to meeting m1.");
  });

  it("sends only description when optional fields omitted", async () => {
    let capturedBody = "";
    const client = stubClient(async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response(null, { status: 204 });
    });
    const { stream } = collectStream();

    await createItem("m1", { desc: "Do the thing" }, { client, stream });

    expect(JSON.parse(capturedBody)).toEqual({ description: "Do the thing" });
  });

  it("outputs JSON confirmation when --json is passed", async () => {
    const client = stubClient(async () =>
      new Response(null, { status: 204 })
    );
    const { stream, output } = collectStream();

    await createItem(
      "m1",
      { desc: "Do the thing", json: true },
      { client, stream }
    );

    expect(JSON.parse(output())).toEqual({ ok: true });
  });

  it("shows help with description and errors", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const create = items.commands.find((c) => c.name() === "create")!;
    const help = captureHelp(create);

    expect(help).toContain("Add a new action item to a meeting.");
    expect(help).toContain("Errors:");
    expect(help).toContain("404");
  });
});

describe("items edit", () => {
  it("updates an action item with specified fields", async () => {
    let capturedUrl = "";
    let capturedBody = "";
    let capturedMethod = "";
    const client = stubClient(async (url, init) => {
      capturedUrl = url;
      capturedBody = init?.body as string;
      capturedMethod = init?.method as string;
      return new Response(null, { status: 204 });
    });
    const { stream, output } = collectStream();

    await editItem(
      "m1",
      "2",
      { desc: "Updated roadmap", owner: "Bob", due: "2026-05-01", priority: "low" },
      { client, stream }
    );

    expect(capturedMethod).toBe("PUT");
    expect(new URL(capturedUrl).pathname).toBe("/api/meetings/m1/action-items/2");
    expect(JSON.parse(capturedBody)).toEqual({
      description: "Updated roadmap",
      owner: "Bob",
      due_date: "2026-05-01",
      priority: "low",
    });
    expect(output()).toContain("Action item 2 updated.");
  });

  it("sends only the fields that are provided", async () => {
    let capturedBody = "";
    const client = stubClient(async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response(null, { status: 204 });
    });
    const { stream } = collectStream();

    await editItem("m1", "0", { owner: "Charlie" }, { client, stream });

    expect(JSON.parse(capturedBody)).toEqual({ owner: "Charlie" });
  });

  it("outputs JSON confirmation when --json is passed", async () => {
    const client = stubClient(async () =>
      new Response(null, { status: 204 })
    );
    const { stream, output } = collectStream();

    await editItem("m1", "0", { desc: "New desc", json: true }, { client, stream });

    expect(JSON.parse(output())).toEqual({ ok: true });
  });

  it("shows help with description and errors", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const edit = items.commands.find((c) => c.name() === "edit")!;
    const help = captureHelp(edit);

    expect(help).toContain("Edit an existing action item's fields.");
    expect(help).toContain("Errors:");
    expect(help).toContain("404");
  });
});
