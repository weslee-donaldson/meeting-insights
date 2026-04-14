import { describe, it, expect } from "vitest";
import { Command } from "commander";
import { Writable } from "node:stream";
import { HttpClient } from "../../../../cli/mti/src/http-client.ts";
import {
  registerItems,
  listItems,
  createItem,
  editItem,
  completeItem,
  uncompleteItem,
  listCompletions,
  itemHistory,
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

  it("declares --json as a Commander option on the list subcommand", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const list = items.commands.find((c) => c.name() === "list")!;
    const optionNames = list.options.map((o) => o.long);

    expect(optionNames).toContain("--json");
  });

  function generateItems(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      meeting_id: `m${i}`,
      meeting_title: `Meeting ${i}`,
      meeting_date: "2026-01-15",
      item_index: i,
      description: `Item ${i}`,
      owner: "Alice",
      requester: "Bob",
      due_date: null,
      priority: "normal",
      canonical_id: `c${i}`,
      total_mentions: 1,
      short_id: `sid${i}`,
    }));
  }

  it("defaults to showing first 25 items with truncation footer on stderr", async () => {
    const payload = generateItems(30);
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload), { status: 200 })
    );
    const out = collectStream();
    const err = collectStream();

    await listItems("Acme", {}, { client, stream: out.stream, stderr: err.stream });

    const lines = out.output().split("\n");
    const dataLines = lines.slice(2).filter((l) => l.trim() !== "");
    expect(dataLines.length).toBe(25);
    expect(err.output()).toBe(
      "Showing 25 of 30 items. Use --limit 0 to show all.\n"
    );
  });

  it("respects limit option to cap displayed items", async () => {
    const payload = generateItems(20);
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload), { status: 200 })
    );
    const out = collectStream();
    const err = collectStream();

    await listItems("Acme", { limit: "10" }, { client, stream: out.stream, stderr: err.stream });

    const lines = out.output().split("\n");
    const dataLines = lines.slice(2).filter((l) => l.trim() !== "");
    expect(dataLines.length).toBe(10);
    expect(err.output()).toBe(
      "Showing 10 of 20 items. Use --limit 0 to show all.\n"
    );
  });

  it("shows all items with limit 0 and no footer", async () => {
    const payload = generateItems(30);
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload), { status: 200 })
    );
    const out = collectStream();
    const err = collectStream();

    await listItems("Acme", { limit: "0" }, { client, stream: out.stream, stderr: err.stream });

    const lines = out.output().split("\n");
    const dataLines = lines.slice(2).filter((l) => l.trim() !== "");
    expect(dataLines.length).toBe(30);
    expect(err.output()).toBe("");
  });

  it("does not show footer when total is within default limit", async () => {
    const payload = generateItems(5);
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload), { status: 200 })
    );
    const out = collectStream();
    const err = collectStream();

    await listItems("Acme", {}, { client, stream: out.stream, stderr: err.stream });

    const lines = out.output().split("\n");
    const dataLines = lines.slice(2).filter((l) => l.trim() !== "");
    expect(dataLines.length).toBe(5);
    expect(err.output()).toBe("");
  });

  it("truncates long column values by default", async () => {
    const longDesc = "A".repeat(50);
    const payload = [
      { ...sampleItems[0], description: longDesc },
    ];
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload), { status: 200 })
    );
    const out = collectStream();

    await listItems("Acme", {}, { client, stream: out.stream });

    const dataLine = out.output().split("\n")[2];
    expect(dataLine).not.toContain(longDesc);
    expect(dataLine).toContain("\u2026");
  });

  it("renders full values without truncation when full is true", async () => {
    const longDesc = "A".repeat(50);
    const payload = [
      { ...sampleItems[0], description: longDesc },
    ];
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload), { status: 200 })
    );
    const out = collectStream();

    await listItems("Acme", { full: true }, { client, stream: out.stream });

    const dataLine = out.output().split("\n")[2];
    expect(dataLine).toContain(longDesc);
    expect(dataLine).not.toContain("\u2026");
  });

  it("applies limit in json mode", async () => {
    const payload = generateItems(30);
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload), { status: 200 })
    );
    const out = collectStream();

    await listItems("Acme", { json: true, limit: "5" }, { client, stream: out.stream });

    const parsed = JSON.parse(out.output());
    expect(parsed).toHaveLength(5);
    expect(parsed[0].short_id).toBe("sid0");
    expect(parsed[4].short_id).toBe("sid4");
  });

  it("declares --limit and --full options on list subcommand", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const list = items.commands.find((c) => c.name() === "list")!;
    const optionNames = list.options.map((o) => o.long);

    expect(optionNames).toContain("--limit");
    expect(optionNames).toContain("--full");
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

  it("declares --json as a Commander option on the create subcommand", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const create = items.commands.find((c) => c.name() === "create")!;
    const optionNames = create.options.map((o) => o.long);

    expect(optionNames).toContain("--json");
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

    expect(help).toContain("Edit an existing action item's fields (index is 0-based");
    expect(help).toContain("Errors:");
    expect(help).toContain("404");
  });

  it("declares --json as a Commander option on the edit subcommand", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const edit = items.commands.find((c) => c.name() === "edit")!;
    const optionNames = edit.options.map((o) => o.long);

    expect(optionNames).toContain("--json");
  });
});

describe("items complete", () => {
  const batchResponse = {
    results: [
      { short_id: "a1b2c3", status: "completed" },
      { short_id: "d4e5f6", status: "completed" },
    ],
  };

  it("marks multiple items complete by short_id with a note", async () => {
    let capturedUrl = "";
    let capturedBody = "";
    let capturedMethod = "";
    const client = stubClient(async (url, init) => {
      capturedUrl = url;
      capturedBody = init?.body as string;
      capturedMethod = init?.method as string;
      return new Response(JSON.stringify(batchResponse), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    const { stream, output } = collectStream();

    await completeItem(["a1b2c3", "d4e5f6"], { note: "Done via PR #42" }, { client, stream });

    expect(capturedMethod).toBe("POST");
    expect(new URL(capturedUrl).pathname).toBe("/api/action-items/complete");
    expect(JSON.parse(capturedBody)).toEqual({ short_ids: ["a1b2c3", "d4e5f6"], note: "Done via PR #42" });
    const out = output();
    expect(out).toContain("a1b2c3");
    expect(out).toContain("completed");
  });

  it("sends empty note when --note is omitted", async () => {
    let capturedBody = "";
    const client = stubClient(async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response(JSON.stringify({ results: [{ short_id: "a1b2c3", status: "completed" }] }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    const { stream } = collectStream();

    await completeItem(["a1b2c3"], {}, { client, stream });

    expect(JSON.parse(capturedBody)).toEqual({ short_ids: ["a1b2c3"], note: "" });
  });

  it("outputs JSON when --json is passed", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(batchResponse), { status: 200, headers: { "Content-Type": "application/json" } })
    );
    const { stream, output } = collectStream();

    await completeItem(["a1b2c3", "d4e5f6"], { json: true }, { client, stream });

    expect(JSON.parse(output())).toEqual(batchResponse);
  });

  it("shows help with description", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const complete = items.commands.find((c) => c.name() === "complete")!;
    const help = captureHelp(complete);

    expect(help).toContain("Mark action items as complete by Short ID");
    expect(help).toContain("Errors:");
    expect(help).toContain("400");
  });

  it("declares --json as a Commander option on the complete subcommand", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const complete = items.commands.find((c) => c.name() === "complete")!;
    const optionNames = complete.options.map((o) => o.long);

    expect(optionNames).toContain("--json");
  });
});

describe("items uncomplete", () => {
  const batchResponse = {
    results: [
      { short_id: "a1b2c3", status: "uncompleted" },
    ],
  };

  it("reverts completion for items by short_id", async () => {
    let capturedUrl = "";
    let capturedBody = "";
    let capturedMethod = "";
    const client = stubClient(async (url, init) => {
      capturedUrl = url;
      capturedBody = init?.body as string;
      capturedMethod = init?.method as string;
      return new Response(JSON.stringify(batchResponse), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    const { stream, output } = collectStream();

    await uncompleteItem(["a1b2c3"], {}, { client, stream });

    expect(capturedMethod).toBe("POST");
    expect(new URL(capturedUrl).pathname).toBe("/api/action-items/uncomplete");
    expect(JSON.parse(capturedBody)).toEqual({ short_ids: ["a1b2c3"] });
    const out = output();
    expect(out).toContain("a1b2c3");
    expect(out).toContain("uncompleted");
  });

  it("outputs JSON when --json is passed", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(batchResponse), { status: 200, headers: { "Content-Type": "application/json" } })
    );
    const { stream, output } = collectStream();

    await uncompleteItem(["a1b2c3"], { json: true }, { client, stream });

    expect(JSON.parse(output())).toEqual(batchResponse);
  });

  it("shows help with description", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const uncomplete = items.commands.find((c) => c.name() === "uncomplete")!;
    const help = captureHelp(uncomplete);

    expect(help).toContain("Revert action item completion by Short ID");
    expect(help).toContain("Errors:");
    expect(help).toContain("400");
  });

  it("declares --json as a Commander option on the uncomplete subcommand", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const uncomplete = items.commands.find((c) => c.name() === "uncomplete")!;
    const optionNames = uncomplete.options.map((o) => o.long);

    expect(optionNames).toContain("--json");
  });
});

describe("items completions", () => {
  const sampleCompletions = [
    {
      id: "c1",
      meeting_id: "m1",
      item_index: 0,
      completed_at: "2026-01-20T10:00:00Z",
      note: "Done via PR #42",
    },
    {
      id: "c2",
      meeting_id: "m1",
      item_index: 2,
      completed_at: "2026-01-21T14:30:00Z",
      note: "",
    },
  ];

  it("shows completion records in table format", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(sampleCompletions), { status: 200 })
    );
    const { stream, output } = collectStream();

    await listCompletions("m1", {}, { client, stream });

    const text = output();
    expect(text).toContain("Item #");
    expect(text).toContain("Completed At");
    expect(text).toContain("Note");
    expect(text).toContain("0");
    expect(text).toContain("2026-01-20T10:00:00Z");
    expect(text).toContain("Done via PR #42");
  });

  it("sends GET to the correct endpoint", async () => {
    let capturedUrl = "";
    const client = stubClient(async (url) => {
      capturedUrl = url;
      return new Response(JSON.stringify([]), { status: 200 });
    });
    const { stream } = collectStream();

    await listCompletions("m1", {}, { client, stream });

    expect(new URL(capturedUrl).pathname).toBe("/api/meetings/m1/completions");
  });

  it("outputs raw JSON when --json is passed", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(sampleCompletions), { status: 200 })
    );
    const { stream, output } = collectStream();

    await listCompletions("m1", { json: true }, { client, stream });

    expect(JSON.parse(output())).toEqual(sampleCompletions);
  });

  it("shows help with output schema, example, and errors", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const completions = items.commands.find(
      (c) => c.name() === "completions"
    )!;
    const help = captureHelp(completions);

    expect(help).toContain("Show completion records for a meeting's action items.");
    expect(help).toContain("Output schema (--json):");
    expect(help).toContain("Errors:");
    expect(help).toContain("404");
  });

  it("declares --json as a Commander option on the completions subcommand", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const completions = items.commands.find(
      (c) => c.name() === "completions"
    )!;
    const optionNames = completions.options.map((o) => o.long);

    expect(optionNames).toContain("--json");
  });
});

describe("items history", () => {
  const sampleHistory = [
    {
      canonical_id: "f3a1b2",
      meeting_id: "m1",
      item_type: "action_item",
      item_index: 0,
      item_text: "Draft Q2 roadmap",
      first_mentioned_at: "2026-01-15",
      meeting_title: "Q1 Planning Review",
      meeting_date: "2026-01-15",
    },
    {
      canonical_id: "f3a1b2",
      meeting_id: "m2",
      item_type: "action_item",
      item_index: 1,
      item_text: "Draft Q2 roadmap (updated scope)",
      first_mentioned_at: "2026-01-15",
      meeting_title: "Sprint Retro",
      meeting_date: "2026-02-01",
    },
  ];

  it("shows cross-meeting history in table format", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(sampleHistory), { status: 200 })
    );
    const { stream, output } = collectStream();

    await itemHistory("f3a1b2", {}, { client, stream });

    const text = output();
    expect(text).toContain("Meeting");
    expect(text).toContain("Date");
    expect(text).toContain("Description");
    expect(text).toContain("Q1 Planning Review");
    expect(text).toContain("2026-01-15");
    expect(text).toContain("Draft Q2 roadmap");
    expect(text).toContain("Sprint Retro");
    expect(text).toContain("2026-02-01");
  });

  it("sends GET to the correct endpoint", async () => {
    let capturedUrl = "";
    const client = stubClient(async (url) => {
      capturedUrl = url;
      return new Response(JSON.stringify([]), { status: 200 });
    });
    const { stream } = collectStream();

    await itemHistory("f3a1b2", {}, { client, stream });

    expect(new URL(capturedUrl).pathname).toBe("/api/items/f3a1b2/history");
  });

  it("outputs raw JSON when --json is passed", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(sampleHistory), { status: 200 })
    );
    const { stream, output } = collectStream();

    await itemHistory("f3a1b2", { json: true }, { client, stream });

    expect(JSON.parse(output())).toEqual(sampleHistory);
  });

  it("shows help with output schema, example, and errors", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const history = items.commands.find((c) => c.name() === "history")!;
    const help = captureHelp(history);

    expect(help).toContain("Show cross-meeting history for an action item.");
    expect(help).toContain("Short ID");
    expect(help).toContain("items list");
    expect(help).toContain("Output schema (--json):");
    expect(help).toContain("Example:");
    expect(help).toContain("Errors:");
    expect(help).toContain("404");
  });

  it("declares --json as a Commander option on the history subcommand", () => {
    const program = buildProgram();
    const items = program.commands.find((c) => c.name() === "items")!;
    const history = items.commands.find((c) => c.name() === "history")!;
    const optionNames = history.options.map((o) => o.long);

    expect(optionNames).toContain("--json");
  });
});
