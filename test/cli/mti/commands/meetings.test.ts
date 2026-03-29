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
