import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";
import { HttpClient } from "../../../../cli/mti/src/http-client.ts";
import {
  registerNotes,
  notesList,
} from "../../../../cli/mti/src/commands/notes.ts";

function createStubClient(
  handler: (url: string | URL | Request, init?: RequestInit) => Promise<Response>
): HttpClient {
  return new HttpClient({
    baseUrl: "http://localhost:3000",
    token: "test-token",
    fetch: handler,
  });
}

function collectOutput(): { chunks: string[]; stream: NodeJS.WritableStream } {
  const chunks: string[] = [];
  const stream = {
    write(chunk: string) {
      chunks.push(chunk);
      return true;
    },
  } as unknown as NodeJS.WritableStream;
  return { chunks, stream };
}

function getHelpText(cmd: Command): string {
  let helpOutput = "";
  cmd.configureOutput({
    writeOut: (str: string) => {
      helpOutput += str;
    },
    writeErr: (str: string) => {
      helpOutput += str;
    },
  });
  cmd.outputHelp();
  return helpOutput;
}

describe("notes list", () => {
  it("displays notes for a meeting in a table", async () => {
    const notes = [
      {
        id: "n1x2y3",
        objectType: "meeting",
        objectId: "a1b2c3d4",
        title: "Follow-up needed",
        body: "Check with legal on contract terms before next Tuesday",
        noteType: "user",
        createdAt: "2026-01-15T10:00:00Z",
        updatedAt: "2026-01-16T14:30:00Z",
      },
    ];

    const client = createStubClient(async () =>
      new Response(JSON.stringify(notes), { status: 200 })
    );

    const { chunks, stream } = collectOutput();

    await notesList("a1b2c3d4", { json: false }, { client, stream });

    const table = chunks.join("");
    expect(table).toContain("ID");
    expect(table).toContain("Title");
    expect(table).toContain("Body");
    expect(table).toContain("Created");
    expect(table).toContain("Updated");
    expect(table).toContain("n1x2y3");
    expect(table).toContain("Follow-up needed");
    expect(table).toContain("2026-01-15T10:00:00Z");
    expect(table).toContain("2026-01-16T14:30:00Z");
  });

  it("truncates note body to 40 characters", async () => {
    const notes = [
      {
        id: "n1",
        objectType: "meeting",
        objectId: "m1",
        title: null,
        body: "This is a very long body that should definitely be truncated to forty characters",
        noteType: "user",
        createdAt: "2026-01-15T10:00:00Z",
        updatedAt: "2026-01-15T10:00:00Z",
      },
    ];

    const client = createStubClient(async () =>
      new Response(JSON.stringify(notes), { status: 200 })
    );

    const { chunks, stream } = collectOutput();

    await notesList("m1", { json: false }, { client, stream });

    const table = chunks.join("");
    expect(table).toContain("(untitled)");
    expect(table).not.toContain(
      "This is a very long body that should definitely be truncated to forty characters"
    );
  });

  it("outputs raw JSON with --json flag", async () => {
    const notes = [
      {
        id: "n1x2y3",
        objectType: "meeting",
        objectId: "a1b2c3d4",
        title: "Follow-up needed",
        body: "Check with legal",
        noteType: "user",
        createdAt: "2026-01-15T10:00:00Z",
        updatedAt: "2026-01-16T14:30:00Z",
      },
    ];

    const client = createStubClient(async () =>
      new Response(JSON.stringify(notes), { status: 200 })
    );

    const { chunks, stream } = collectOutput();

    await notesList("a1b2c3d4", { json: true }, { client, stream });

    const parsed = JSON.parse(chunks.join(""));
    expect(parsed).toEqual(notes);
  });

  it("sends GET request to /api/notes/meeting/<meetingId>", async () => {
    let capturedUrl = "";
    const client = createStubClient(async (url) => {
      capturedUrl = String(url);
      return new Response(JSON.stringify([]), { status: 200 });
    });

    const { stream } = collectOutput();

    await notesList("abc123", { json: false }, { client, stream });

    expect(capturedUrl).toBe("http://localhost:3000/api/notes/meeting/abc123");
  });

  it("includes help text with description, schema, example, and errors", () => {
    const program = new Command();
    registerNotes(program);

    const notesCmd = program.commands.find((c) => c.name() === "notes")!;
    const listCmd = notesCmd.commands.find((c) => c.name() === "list")!;
    const help = getHelpText(listCmd);

    expect(help).toContain("List notes attached to a meeting");
    expect(help).toContain("Output schema");
    expect(help).toContain("Example");
    expect(help).toContain("Errors");
  });
});
