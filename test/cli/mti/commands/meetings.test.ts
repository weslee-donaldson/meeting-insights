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
});

describe("meetings get", () => {
  const meetingDetail = {
    id: "m1",
    title: "Sprint Review",
    meeting_type: "standup",
    date: "2026-01-15",
    participants: '["Alice","Bob"]',
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
    expect(text).toContain("Alice, Bob");
    expect(text).toContain("Source:");
    expect(text).toContain("2026-01-15_sprint-review.txt");
    expect(text).not.toContain("full transcript text here");
  });

  it("strips raw_transcript from --json output by default", async () => {
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
      participants: '["Alice","Bob"]',
      source_filename: "2026-01-15_sprint-review.txt",
      created_at: "2026-01-15T10:00:00Z",
    });
  });

  it("includes raw_transcript in --json output when --include-transcript is passed", async () => {
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
