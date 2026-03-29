import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";
import { HttpClient } from "../../../../cli/mti/src/http-client.ts";
import {
  registerNotes,
  notesList,
  notesCreate,
  notesUpdate,
} from "../../../../cli/mti/src/commands/notes.ts";
import { ForbiddenError } from "../../../../cli/mti/src/errors.ts";

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

describe("notes create", () => {
  it("creates a note on a meeting and shows confirmation", async () => {
    const createdNote = {
      id: "n-new-1",
      objectType: "meeting",
      objectId: "m1",
      title: "My Note",
      body: "Some content here",
      noteType: "user",
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-01-15T10:00:00Z",
    };

    const client = createStubClient(async () =>
      new Response(JSON.stringify(createdNote), { status: 201 })
    );

    const { chunks, stream } = collectOutput();

    await notesCreate(
      "m1",
      { json: false, body: "Some content here", title: "My Note" },
      { client, stream }
    );

    expect(chunks.join("")).toContain("Note created on meeting m1.");
  });

  it("sends POST to /api/notes/meeting/<meetingId> with body and title", async () => {
    let capturedUrl = "";
    let capturedBody = "";

    const client = createStubClient(async (url, init) => {
      capturedUrl = String(url);
      capturedBody = init?.body as string;
      return new Response(
        JSON.stringify({ id: "n1", objectType: "meeting", objectId: "m1", title: "T", body: "B", noteType: "user", createdAt: "", updatedAt: "" }),
        { status: 201 }
      );
    });

    const { stream } = collectOutput();

    await notesCreate(
      "m1",
      { json: false, body: "B", title: "T" },
      { client, stream }
    );

    expect(capturedUrl).toBe("http://localhost:3000/api/notes/meeting/m1");
    expect(JSON.parse(capturedBody)).toEqual({ title: "T", body: "B" });
  });

  it("sends POST without title when title is not provided", async () => {
    let capturedBody = "";

    const client = createStubClient(async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response(
        JSON.stringify({ id: "n1", objectType: "meeting", objectId: "m1", title: null, body: "B", noteType: "user", createdAt: "", updatedAt: "" }),
        { status: 201 }
      );
    });

    const { stream } = collectOutput();

    await notesCreate(
      "m1",
      { json: false, body: "B" },
      { client, stream }
    );

    expect(JSON.parse(capturedBody)).toEqual({ body: "B" });
  });

  it("outputs the created note as JSON with --json flag", async () => {
    const createdNote = {
      id: "n-new-1",
      objectType: "meeting",
      objectId: "m1",
      title: null,
      body: "Content",
      noteType: "user",
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-01-15T10:00:00Z",
    };

    const client = createStubClient(async () =>
      new Response(JSON.stringify(createdNote), { status: 201 })
    );

    const { chunks, stream } = collectOutput();

    await notesCreate(
      "m1",
      { json: true, body: "Content" },
      { client, stream }
    );

    const parsed = JSON.parse(chunks.join(""));
    expect(parsed).toEqual(createdNote);
  });

  it("includes help text with description, schema, example, and errors", () => {
    const program = new Command();
    registerNotes(program);

    const notesCmd = program.commands.find((c) => c.name() === "notes")!;
    const createCmd = notesCmd.commands.find((c) => c.name() === "create")!;
    const help = getHelpText(createCmd);

    expect(help).toContain("Create a note on a meeting");
    expect(help).toContain("Output schema");
    expect(help).toContain("Example");
    expect(help).toContain("Errors");
  });
});

describe("notes update", () => {
  it("updates a note and shows confirmation", async () => {
    const updatedNote = {
      id: "n1",
      objectType: "meeting",
      objectId: "m1",
      title: "Updated Title",
      body: "Updated body",
      noteType: "user",
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-01-16T14:30:00Z",
    };

    const client = createStubClient(async () =>
      new Response(JSON.stringify(updatedNote), { status: 200 })
    );

    const { chunks, stream } = collectOutput();

    await notesUpdate("n1", { json: false, title: "Updated Title", body: "Updated body" }, { client, stream });

    expect(chunks.join("")).toContain("Note n1 updated.");
  });

  it("sends PATCH to /api/notes/<noteId> with title and body", async () => {
    let capturedUrl = "";
    let capturedBody = "";
    let capturedMethod = "";

    const client = createStubClient(async (url, init) => {
      capturedUrl = String(url);
      capturedBody = init?.body as string;
      capturedMethod = init?.method ?? "";
      return new Response(
        JSON.stringify({ id: "n1", objectType: "meeting", objectId: "m1", title: "T", body: "B", noteType: "user", createdAt: "", updatedAt: "" }),
        { status: 200 }
      );
    });

    const { stream } = collectOutput();

    await notesUpdate("n1", { json: false, title: "T", body: "B" }, { client, stream });

    expect(capturedUrl).toBe("http://localhost:3000/api/notes/n1");
    expect(capturedMethod).toBe("PATCH");
    expect(JSON.parse(capturedBody)).toEqual({ title: "T", body: "B" });
  });

  it("sends only provided fields in the PATCH body", async () => {
    let capturedBody = "";

    const client = createStubClient(async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response(
        JSON.stringify({ id: "n1", objectType: "meeting", objectId: "m1", title: null, body: "B", noteType: "user", createdAt: "", updatedAt: "" }),
        { status: 200 }
      );
    });

    const { stream } = collectOutput();

    await notesUpdate("n1", { json: false, body: "B" }, { client, stream });

    expect(JSON.parse(capturedBody)).toEqual({ body: "B" });
  });

  it("allows clearing title with empty string", async () => {
    let capturedBody = "";

    const client = createStubClient(async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response(
        JSON.stringify({ id: "n1", objectType: "meeting", objectId: "m1", title: null, body: "B", noteType: "user", createdAt: "", updatedAt: "" }),
        { status: 200 }
      );
    });

    const { stream } = collectOutput();

    await notesUpdate("n1", { json: false, title: "" }, { client, stream });

    expect(JSON.parse(capturedBody)).toEqual({ title: "" });
  });

  it("outputs the updated note as JSON with --json flag", async () => {
    const updatedNote = {
      id: "n1",
      objectType: "meeting",
      objectId: "m1",
      title: "New Title",
      body: "New body",
      noteType: "user",
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-01-16T14:30:00Z",
    };

    const client = createStubClient(async () =>
      new Response(JSON.stringify(updatedNote), { status: 200 })
    );

    const { chunks, stream } = collectOutput();

    await notesUpdate("n1", { json: true, title: "New Title", body: "New body" }, { client, stream });

    const parsed = JSON.parse(chunks.join(""));
    expect(parsed).toEqual(updatedNote);
  });

  it("surfaces 403 as a note-specific ownership error", async () => {
    const client = createStubClient(async () =>
      new Response(JSON.stringify({ error: "Cannot modify non-user notes" }), { status: 403 })
    );

    const { stream } = collectOutput();

    await expect(
      notesUpdate("n1", { json: false, body: "New body" }, { client, stream })
    ).rejects.toThrow("Cannot modify this note \u2014 it was not created by you.");
  });

  it("includes help text with description, example, and errors", () => {
    const program = new Command();
    registerNotes(program);

    const notesCmd = program.commands.find((c) => c.name() === "notes")!;
    const updateCmd = notesCmd.commands.find((c) => c.name() === "update")!;
    const help = getHelpText(updateCmd);

    expect(help).toContain("Update a user-created note");
    expect(help).toContain("Output schema");
    expect(help).toContain("Example");
    expect(help).toContain("Errors");
  });
});
