import { describe, it, expect } from "vitest";
import { Command } from "commander";
import { HttpClient } from "../../../../cli/mti/src/http-client.ts";
import { registerMeetings } from "../../../../cli/mti/src/commands/meetings.ts";

function stubClient(
  handler: (url: string, init?: RequestInit) => Promise<Response>
): HttpClient {
  return new HttpClient({
    baseUrl: "http://localhost:3000",
    token: "test-token",
    fetch: handler,
  });
}

function collectOutput(): { stream: NodeJS.WritableStream; text: () => string } {
  let buffer = "";
  const stream = {
    write(chunk: string | Uint8Array): boolean {
      buffer += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
      return true;
    },
  } as NodeJS.WritableStream;
  return { stream, text: () => buffer };
}

describe("meetings list", () => {
  const meetingsPayload = [
    {
      id: "m1",
      title: "Sprint Review",
      date: "2026-01-15",
      client: "Acme",
      series: "sprint review",
      actionItemCount: 3,
      thread_tags: [],
      milestone_tags: [],
    },
    {
      id: "m2",
      title: "Kickoff",
      date: "2026-02-01",
      client: "Initech",
      series: "kickoff",
      actionItemCount: 0,
    },
  ];

  it("displays meetings as a table with ID, Title, Date, Client, Items columns", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(meetingsPayload))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "list"], { from: "user" });

    const lines = out.text().split("\n");
    expect(lines[0]).toMatch(/ID\s+Title\s+Date\s+Client\s+Items/);
    expect(lines[2]).toMatch(/m1\s+Sprint Review\s+2026-01-15\s+Acme\s+3/);
    expect(lines[3]).toMatch(/m2\s+Kickoff\s+2026-02-01\s+Initech\s+0/);
  });

  it("passes client, after, and before filters as query params", async () => {
    let capturedUrl = "";
    const client = stubClient(async (url) => {
      capturedUrl = url;
      return new Response(JSON.stringify([]));
    });
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "list", "--client", "Acme", "--after", "2026-01-01", "--before", "2026-12-31"],
      { from: "user" }
    );

    const url = new URL(capturedUrl);
    expect(url.searchParams.get("client")).toBe("Acme");
    expect(url.searchParams.get("after")).toBe("2026-01-01");
    expect(url.searchParams.get("before")).toBe("2026-12-31");
  });

  it("outputs raw JSON including thread_tags and milestone_tags with --json", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(meetingsPayload))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "list", "--json"], { from: "user" });

    expect(JSON.parse(out.text())).toEqual(meetingsPayload);
  });

  it("shows help with description, output schema, example, and errors", () => {
    const program = new Command();
    registerMeetings(program, {
      client: stubClient(async () => new Response("{}")),
      stream: collectOutput().stream,
    });

    const meetingsCmd = program.commands.find((c) => c.name() === "meetings")!;
    const listCmd = meetingsCmd.commands.find((c) => c.name() === "list")!;
    const help = listCmd.helpInformation();

    expect(help).toContain("List meetings");
    expect(help).toContain("--client <name>");
    expect(help).toContain("--after <date>");
    expect(help).toContain("--before <date>");
    expect(help).toContain("Output schema");
    expect(help).toContain("actionItemCount");
    expect(help).toContain("Example");
    expect(help).toContain("mti meetings list");
    expect(help).toContain("Errors");
    expect(help).toContain("401");
  });

  function generateMeetings(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `m${i + 1}`,
      title: `Meeting ${i + 1}`,
      date: "2026-01-15",
      client: "Acme",
      series: "standup",
      actionItemCount: 0,
    }));
  }

  it("defaults to showing first 25 meetings with truncation footer", async () => {
    const payload = generateMeetings(30);
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload))
    );
    const out = collectOutput();
    const err = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream, stderr: err.stream });
    await program.parseAsync(["meetings", "list"], { from: "user" });

    const lines = out.text().split("\n");
    const dataLines = lines.slice(2).filter((l) => l.trim() !== "");
    expect(dataLines.length).toBe(25);
    expect(err.text()).toBe("Showing 25 of 30 meetings. Use --limit 0 to show all.\n");
  });

  it("respects --limit to cap displayed meetings", async () => {
    const payload = generateMeetings(20);
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload))
    );
    const out = collectOutput();
    const err = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream, stderr: err.stream });
    await program.parseAsync(["meetings", "list", "--limit", "10"], { from: "user" });

    const lines = out.text().split("\n");
    const dataLines = lines.slice(2).filter((l) => l.trim() !== "");
    expect(dataLines.length).toBe(10);
    expect(err.text()).toBe("Showing 10 of 20 meetings. Use --limit 0 to show all.\n");
  });

  it("shows all meetings with --limit 0 and no footer", async () => {
    const payload = generateMeetings(30);
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload))
    );
    const out = collectOutput();
    const err = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream, stderr: err.stream });
    await program.parseAsync(["meetings", "list", "--limit", "0"], { from: "user" });

    const lines = out.text().split("\n");
    const dataLines = lines.slice(2).filter((l) => l.trim() !== "");
    expect(dataLines.length).toBe(30);
    expect(err.text()).toBe("");
  });

  it("does not show footer when total is within default limit", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(meetingsPayload))
    );
    const out = collectOutput();
    const err = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream, stderr: err.stream });
    await program.parseAsync(["meetings", "list"], { from: "user" });

    const lines = out.text().split("\n");
    const dataLines = lines.slice(2).filter((l) => l.trim() !== "");
    expect(dataLines.length).toBe(2);
    expect(err.text()).toBe("");
  });

  it("truncates JSON array with --limit in --json mode", async () => {
    const payload = generateMeetings(30);
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload))
    );
    const out = collectOutput();
    const err = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream, stderr: err.stream });
    await program.parseAsync(["meetings", "list", "--json", "--limit", "5"], { from: "user" });

    const parsed = JSON.parse(out.text());
    expect(parsed).toHaveLength(5);
    expect(parsed[0].id).toBe("m1");
    expect(parsed[4].id).toBe("m5");
  });

  it("shows --limit in help text", () => {
    const program = new Command();
    registerMeetings(program, {
      client: stubClient(async () => new Response("{}")),
      stream: collectOutput().stream,
    });

    const meetingsCmd = program.commands.find((c) => c.name() === "meetings")!;
    const listCmd = meetingsCmd.commands.find((c) => c.name() === "list")!;
    const help = listCmd.helpInformation();

    expect(help).toContain("--limit <n>");
  });

  it("truncates long values by default when columns have widths", async () => {
    const longTitle = "A".repeat(50);
    const payload = [
      { id: "m1", title: longTitle, date: "2026-01-15", client: "Acme", series: "standup", actionItemCount: 0 },
    ];
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload))
    );
    const out = collectOutput();
    const err = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream, stderr: err.stream });
    await program.parseAsync(["meetings", "list"], { from: "user" });

    const dataLine = out.text().split("\n")[2];
    expect(dataLine).not.toContain(longTitle);
    expect(dataLine).toContain("\u2026");
  });

  it("renders full values without truncation when --full is passed", async () => {
    const longTitle = "A".repeat(50);
    const payload = [
      { id: "m1", title: longTitle, date: "2026-01-15", client: "Acme", series: "standup", actionItemCount: 0 },
    ];
    const client = stubClient(async () =>
      new Response(JSON.stringify(payload))
    );
    const out = collectOutput();
    const err = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream, stderr: err.stream });
    await program.parseAsync(["meetings", "list", "--full"], { from: "user" });

    const dataLine = out.text().split("\n")[2];
    expect(dataLine).toContain(longTitle);
    expect(dataLine).not.toContain("\u2026");
  });

  it("shows --full in help text", () => {
    const program = new Command();
    registerMeetings(program, {
      client: stubClient(async () => new Response("{}")),
      stream: collectOutput().stream,
    });

    const meetingsCmd = program.commands.find((c) => c.name() === "meetings")!;
    const listCmd = meetingsCmd.commands.find((c) => c.name() === "list")!;
    const help = listCmd.helpInformation();

    expect(help).toContain("--full");
  });
});

describe("meetings get", () => {
  const meetingDetail = {
    id: "m1",
    title: "Sprint Review",
    meeting_type: "standup",
    date: "2026-01-15",
    participants:
      '[{"last_name":"Smith","id":"p1","first_name":"Alice","email":"alice@example.com"},{"last_name":"Jones","id":"p2","first_name":"Bob","email":"bob@example.com"}]',
    raw_transcript: "full transcript text here",
    source_filename: "2026-01-15_sprint-review.txt",
    created_at: "2026-01-15T10:00:00Z",
  };

  it("displays meeting detail as key-value pairs with parsed participants", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(meetingDetail))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "get", "m1"], { from: "user" });

    const text = out.text();
    expect(text).toContain("Title:");
    expect(text).toContain("Sprint Review");
    expect(text).toContain("Date:");
    expect(text).toContain("2026-01-15");
    expect(text).toContain("Type:");
    expect(text).toContain("standup");
    expect(text).toContain("Participants:");
    expect(text).toContain("Alice Smith, Bob Jones");
    expect(text).toContain("Source:");
    expect(text).toContain("2026-01-15_sprint-review.txt");
    expect(text).not.toContain("full transcript text here");
  });

  it("outputs JSON when parent program also declares --json", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(meetingDetail))
    );
    const out = collectOutput();

    const program = new Command();
    program.option("--json", "Output as JSON").enablePositionalOptions();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "get", "m1", "--json"], { from: "user" });

    const parsed = JSON.parse(out.text());
    expect(parsed.id).toBe("m1");
  });

  it("strips raw_transcript from --json output by default and parses participants as array", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(meetingDetail))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "get", "m1", "--json"], { from: "user" });

    const parsed = JSON.parse(out.text());
    expect(parsed).toEqual({
      id: "m1",
      title: "Sprint Review",
      meeting_type: "standup",
      date: "2026-01-15",
      participants: [
        { last_name: "Smith", id: "p1", first_name: "Alice", email: "alice@example.com" },
        { last_name: "Jones", id: "p2", first_name: "Bob", email: "bob@example.com" },
      ],
      source_filename: "2026-01-15_sprint-review.txt",
      created_at: "2026-01-15T10:00:00Z",
    });
  });

  it("includes raw_transcript in --json output when --include-transcript is passed and participants is parsed array", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(meetingDetail))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "get", "m1", "--json", "--include-transcript"],
      { from: "user" }
    );

    const parsed = JSON.parse(out.text());
    expect(parsed.raw_transcript).toBe("full transcript text here");
    expect(Array.isArray(parsed.participants)).toBe(true);
  });

  it("shows help with description, output schema, example, and errors", () => {
    const program = new Command();
    registerMeetings(program, {
      client: stubClient(async () => new Response("{}")),
      stream: collectOutput().stream,
    });

    const meetingsCmd = program.commands.find((c) => c.name() === "meetings")!;
    const getCmd = meetingsCmd.commands.find((c) => c.name() === "get")!;
    const help = getCmd.helpInformation();

    expect(help).toContain("Show full details");
    expect(help).toContain("--include-transcript");
    expect(help).toContain("Output schema");
    expect(help).toContain("meeting_type");
    expect(help).toContain("Example");
    expect(help).toContain("mti meetings get");
    expect(help).toContain("Errors");
    expect(help).toContain("404");
  });
});

describe("meetings transcript", () => {
  it("outputs raw transcript text with no formatting", async () => {
    const transcriptResponse = { transcript: "Speaker A: Hello\nSpeaker B: Hi there" };
    const client = stubClient(async () =>
      new Response(JSON.stringify(transcriptResponse))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "transcript", "m1"], { from: "user" });

    expect(out.text()).toBe("Speaker A: Hello\nSpeaker B: Hi there");
  });

  it("shows help with description and errors", () => {
    const program = new Command();
    registerMeetings(program, {
      client: stubClient(async () => new Response("{}")),
      stream: collectOutput().stream,
    });

    const meetingsCmd = program.commands.find((c) => c.name() === "meetings")!;
    const transcriptCmd = meetingsCmd.commands.find((c) => c.name() === "transcript")!;
    const help = transcriptCmd.helpInformation();

    expect(help).toContain("raw transcript");
    expect(help).toContain("Errors");
    expect(help).toContain("404");
  });
});

describe("meetings artifact", () => {
  const artifactPayload = {
    summary: "Team discussed Q1 objectives.",
    decisions: [
      { text: "Use TypeScript for new services", decided_by: "Alice" },
    ],
    proposed_features: ["Dashboard redesign"],
    action_items: [
      {
        description: "Draft Q2 roadmap",
        owner: "Bob",
        requester: "Alice",
        due_date: "2026-04-01",
        priority: "critical",
        short_id: "f3a1b2",
      },
    ],
    open_questions: ["What is the Q2 budget?"],
    risk_items: [
      { category: "engineering", description: "Tight timeline for migration" },
    ],
    additional_notes: [],
    milestones: [],
  };

  it("displays artifact with formatted sections", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(artifactPayload))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "artifact", "m1"], { from: "user" });

    const text = out.text();
    expect(text).toContain("SUMMARY");
    expect(text).toContain("Team discussed Q1 objectives.");
    expect(text).toContain("DECISIONS");
    expect(text).toContain("Use TypeScript for new services (decided by Alice)");
    expect(text).toContain("ACTION ITEMS");
    expect(text).toContain("[critical] Draft Q2 roadmap (Bob, due: 2026-04-01)");
    expect(text).toContain("OPEN QUESTIONS");
    expect(text).toContain("What is the Q2 budget?");
    expect(text).toContain("RISKS");
    expect(text).toContain("Tight timeline for migration");
  });

  it("outputs raw JSON with --json", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(artifactPayload))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "artifact", "m1", "--json"], { from: "user" });

    expect(JSON.parse(out.text())).toEqual(artifactPayload);
  });

  it("displays message when no artifact has been extracted", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(null))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "artifact", "m1"], { from: "user" });

    expect(out.text()).toContain("No artifact extracted yet.");
  });

  it("shows help with description, output schema, example, and errors", () => {
    const program = new Command();
    registerMeetings(program, {
      client: stubClient(async () => new Response("{}")),
      stream: collectOutput().stream,
    });

    const meetingsCmd = program.commands.find((c) => c.name() === "meetings")!;
    const artifactCmd = meetingsCmd.commands.find((c) => c.name() === "artifact")!;
    const help = artifactCmd.helpInformation();

    expect(help).toContain("extracted summary");
    expect(help).toContain("Output schema");
    expect(help).toContain("decisions");
    expect(help).toContain("action_items");
    expect(help).toContain("Example");
    expect(help).toContain("mti meetings artifact");
    expect(help).toContain("Errors");
    expect(help).toContain("404");
  });
});

describe("meetings rename", () => {
  it("renames a meeting and confirms with a message", async () => {
    let capturedBody = "";
    const client = stubClient(async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response(null, { status: 204 });
    });
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "rename", "m1", "New Title"],
      { from: "user" }
    );

    expect(JSON.parse(capturedBody)).toEqual({ title: "New Title" });
    expect(out.text()).toContain("Meeting m1 updated.");
  });

  it("outputs JSON confirmation with --json", async () => {
    const client = stubClient(async () =>
      new Response(null, { status: 204 })
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "rename", "m1", "New Title", "--json"],
      { from: "user" }
    );

    expect(JSON.parse(out.text())).toEqual({ ok: true });
  });

  it("shows help with description and errors", () => {
    const program = new Command();
    registerMeetings(program, {
      client: stubClient(async () => new Response("{}")),
      stream: collectOutput().stream,
    });

    const meetingsCmd = program.commands.find((c) => c.name() === "meetings")!;
    const renameCmd = meetingsCmd.commands.find((c) => c.name() === "rename")!;
    const help = renameCmd.helpInformation();

    expect(help).toContain("Rename a meeting");
    expect(help).toContain("Errors");
    expect(help).toContain("404");
  });
});

describe("meetings reassign", () => {
  it("reassigns a meeting to a different client", async () => {
    let capturedBody = "";
    const client = stubClient(async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response(null, { status: 204 });
    });
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "reassign", "m1", "Initech"],
      { from: "user" }
    );

    expect(JSON.parse(capturedBody)).toEqual({ clientName: "Initech" });
    expect(out.text()).toContain("Meeting m1 updated.");
  });

  it("outputs JSON confirmation with --json", async () => {
    const client = stubClient(async () =>
      new Response(null, { status: 204 })
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "reassign", "m1", "Initech", "--json"],
      { from: "user" }
    );

    expect(JSON.parse(out.text())).toEqual({ ok: true });
  });

  it("shows help with description and errors", () => {
    const program = new Command();
    registerMeetings(program, {
      client: stubClient(async () => new Response("{}")),
      stream: collectOutput().stream,
    });

    const meetingsCmd = program.commands.find((c) => c.name() === "meetings")!;
    const reassignCmd = meetingsCmd.commands.find((c) => c.name() === "reassign")!;
    const help = reassignCmd.helpInformation();

    expect(help).toContain("Reassign a meeting");
    expect(help).toContain("Errors");
    expect(help).toContain("404");
  });
});

describe("meetings delete", () => {
  it("aborts without --confirm flag", async () => {
    let fetchCalled = false;
    const client = stubClient(async () => {
      fetchCalled = true;
      return new Response(null, { status: 204 });
    });
    const out = collectOutput();
    const err = collectOutput();

    const program = new Command();
    program.configureOutput({ writeErr: (str: string) => err.stream.write(str) });
    registerMeetings(program, { client, stream: out.stream, stderr: err.stream });
    await program.parseAsync(["meetings", "delete", "m1"], { from: "user" });

    expect(fetchCalled).toBe(false);
    expect(out.text() + err.text()).toContain("Aborted. Use --confirm to delete.");
  });

  it("deletes multiple meetings with --confirm", async () => {
    let capturedBody = "";
    const client = stubClient(async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response(null, { status: 204 });
    });
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "delete", "m1", "m2", "m3", "--confirm"],
      { from: "user" }
    );

    expect(JSON.parse(capturedBody)).toEqual({ ids: ["m1", "m2", "m3"] });
    expect(out.text()).toContain("Deleted 3 meeting(s).");
  });

  it("outputs JSON confirmation with --json", async () => {
    const client = stubClient(async () =>
      new Response(null, { status: 204 })
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "delete", "m1", "m2", "--confirm", "--json"],
      { from: "user" }
    );

    expect(JSON.parse(out.text())).toEqual({ ok: true, count: 2 });
  });

  it("shows help with description and confirm requirement", () => {
    const program = new Command();
    registerMeetings(program, {
      client: stubClient(async () => new Response("{}")),
      stream: collectOutput().stream,
    });

    const meetingsCmd = program.commands.find((c) => c.name() === "meetings")!;
    const deleteCmd = meetingsCmd.commands.find((c) => c.name() === "delete")!;
    const help = deleteCmd.helpInformation();

    expect(help).toContain("Delete one or more meetings");
    expect(help).toContain("--confirm");
  });
});

describe("meetings ignore", () => {
  it("marks a meeting as ignored", async () => {
    let capturedBody = "";
    const client = stubClient(async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response(null, { status: 204 });
    });
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "ignore", "m1"], { from: "user" });

    expect(JSON.parse(capturedBody)).toEqual({ ignored: true });
    expect(out.text()).toContain("Meeting m1 ignored.");
  });

  it("restores a meeting with --undo", async () => {
    let capturedBody = "";
    const client = stubClient(async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response(null, { status: 204 });
    });
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "ignore", "m1", "--undo"],
      { from: "user" }
    );

    expect(JSON.parse(capturedBody)).toEqual({ ignored: false });
    expect(out.text()).toContain("Meeting m1 restored.");
  });

  it("outputs JSON confirmation with --json", async () => {
    const client = stubClient(async () =>
      new Response(null, { status: 204 })
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "ignore", "m1", "--json"],
      { from: "user" }
    );

    expect(JSON.parse(out.text())).toEqual({ ok: true });
  });

  it("shows help with description and undo option", () => {
    const program = new Command();
    registerMeetings(program, {
      client: stubClient(async () => new Response("{}")),
      stream: collectOutput().stream,
    });

    const meetingsCmd = program.commands.find((c) => c.name() === "meetings")!;
    const ignoreCmd = meetingsCmd.commands.find((c) => c.name() === "ignore")!;
    const help = ignoreCmd.helpInformation();

    expect(help).toContain("Mark a meeting as ignored");
    expect(help).toContain("--undo");
    expect(help).toContain("Errors");
    expect(help).toContain("404");
  });
});

describe("meetings search", () => {
  const searchResults = [
    {
      meeting_id: "m1",
      score: 0.92,
      client: "Acme",
      meeting_type: "standup",
      date: "2026-01-15",
      cluster_tags: ["budget", "planning"],
      series: "standup",
    },
    {
      meeting_id: "m2",
      score: 0.81,
      client: "Acme",
      meeting_type: "review",
      date: "2026-02-01",
      cluster_tags: [],
      series: "review",
    },
  ];

  it("sends query and optional filters as query params to /api/search", async () => {
    let capturedUrl = "";
    const client = stubClient(async (url) => {
      capturedUrl = url;
      return new Response(JSON.stringify(searchResults));
    });
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "search", "Q1 budget", "--client", "Acme", "--after", "2026-01-01", "--before", "2026-12-31", "--limit", "5"],
      { from: "user" }
    );

    const url = new URL(capturedUrl);
    expect(url.searchParams.get("q")).toBe("Q1 budget");
    expect(url.searchParams.get("client")).toBe("Acme");
    expect(url.searchParams.get("date_after")).toBe("2026-01-01");
    expect(url.searchParams.get("date_before")).toBe("2026-12-31");
    expect(url.searchParams.get("limit")).toBe("5");
  });

  it("displays results as a table with ID, Date, Client, Score, Tags columns", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(searchResults))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "search", "budget"], { from: "user" });

    const text = out.text();
    expect(text).toMatch(/ID\s+Date\s+Client\s+Score\s+Tags/);
    expect(text).toContain("m1");
    expect(text).toContain("0.92");
    expect(text).toContain("budget, planning");
    expect(text).toContain("m2");
    expect(text).toContain("0.81");
  });

  it("outputs raw JSON with --json", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(searchResults))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(["meetings", "search", "budget", "--json"], { from: "user" });

    expect(JSON.parse(out.text())).toEqual(searchResults);
  });

  it("shows help with description, output schema, example, and errors", () => {
    const program = new Command();
    registerMeetings(program, {
      client: stubClient(async () => new Response("{}")),
      stream: collectOutput().stream,
    });

    const meetingsCmd = program.commands.find((c) => c.name() === "meetings")!;
    const searchCmd = meetingsCmd.commands.find((c) => c.name() === "search")!;
    const help = searchCmd.helpInformation();

    expect(help).toContain("Search meetings");
    expect(help).toContain("Output schema");
    expect(help).toContain("cluster_tags");
    expect(help).toContain("Example");
    expect(help).toContain("Errors");
    expect(help).toContain("400");
    expect(help).toContain("503");
  });
});

describe("meetings split", () => {
  const splitResponse = {
    source_meeting_id: "m1",
    segments: [
      { meeting_id: "s1", segment_index: 0, title: "Part 1", duration_minutes: 30 },
      { meeting_id: "s2", segment_index: 1, title: "Part 2", duration_minutes: 45 },
    ],
  };

  it("sends correct POST body to /api/meetings/:id/split", async () => {
    let capturedUrl = "";
    let capturedBody = "";
    const client = stubClient(async (url, init) => {
      capturedUrl = url;
      capturedBody = init?.body as string;
      return new Response(JSON.stringify(splitResponse));
    });
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "split", "m1", "--durations", "30,45"],
      { from: "user" }
    );

    expect(new URL(capturedUrl).pathname).toBe("/api/meetings/m1/split");
    expect(JSON.parse(capturedBody)).toEqual({ durations: [30, 45] });
  });

  it("prints segment summary lines on success", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(splitResponse))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "split", "m1", "--durations", "30,45"],
      { from: "user" }
    );

    const text = out.text();
    expect(text).toContain("Segment 1: Part 1 (30 min)");
    expect(text).toContain("Segment 2: Part 2 (45 min)");
  });

  it("outputs raw JSON with --json", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify(splitResponse))
    );
    const out = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream });
    await program.parseAsync(
      ["meetings", "split", "m1", "--durations", "30,45", "--json"],
      { from: "user" }
    );

    expect(JSON.parse(out.text())).toEqual(splitResponse);
  });

  it("writes error to stderr and sets exitCode=1 on API error", async () => {
    const client = stubClient(async () =>
      new Response(JSON.stringify({ error: "durations exceed total meeting length" }), { status: 400 })
    );
    const out = collectOutput();
    const err = collectOutput();

    const program = new Command();
    registerMeetings(program, { client, stream: out.stream, stderr: err.stream });
    await program.parseAsync(
      ["meetings", "split", "m1", "--durations", "999"],
      { from: "user" }
    );

    expect(out.text()).toBe("");
    expect(err.text()).toContain("durations exceed total meeting length");
    expect(process.exitCode).toBe(1);
  });
});
