import { describe, it, expect } from "vitest";
import { Command } from "commander";
import { HttpClient } from "../../../../cli/mti/src/http-client.ts";
import { registerHealth } from "../../../../cli/mti/src/commands/health.ts";

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

const healthyResponse = {
  status: "healthy",
  error_groups: [],
  meetings_without_artifact: 0,
  last_error_at: null,
};

const criticalResponse = {
  status: "critical",
  error_groups: [
    {
      error_type: "api_error",
      severity: "critical",
      count: 12,
      latest_message: "[api_error] 402 Insufficient funds",
      latest_meeting_filename: "2026-04-01_standup.json",
      provider: "openai",
      resolution_hint: "Check your LLM provider account billing and API key validity",
    },
  ],
  meetings_without_artifact: 12,
  last_error_at: "2026-04-01 14:30:00",
};

describe("mti health status", () => {
  it("shows HEALTHY when system is healthy", async () => {
    const client = stubClient(async () => new Response(JSON.stringify(healthyResponse)));
    const out = collectOutput();
    const program = new Command();
    registerHealth(program, { client, stream: out.stream });
    await program.parseAsync(["health", "status"], { from: "user" });
    expect(out.text()).toContain("HEALTHY");
    expect(out.text()).toContain("No issues detected");
  });

  it("shows CRITICAL with details when system has errors", async () => {
    const client = stubClient(async () => new Response(JSON.stringify(criticalResponse)));
    const out = collectOutput();
    const program = new Command();
    registerHealth(program, { client, stream: out.stream });
    await program.parseAsync(["health", "status"], { from: "user" });
    const text = out.text();
    expect(text).toContain("CRITICAL");
    expect(text).toContain("api_error");
    expect(text).toContain("openai");
    expect(text).toContain("Check your LLM provider account billing");
    expect(text).toContain("12");
  });

  it("outputs raw JSON with --json flag", async () => {
    const client = stubClient(async () => new Response(JSON.stringify(criticalResponse)));
    const out = collectOutput();
    const program = new Command();
    registerHealth(program, { client, stream: out.stream });
    await program.parseAsync(["health", "status", "--json"], { from: "user" });
    const parsed = JSON.parse(out.text());
    expect(parsed).toEqual(criticalResponse);
  });
});

describe("mti health acknowledge", () => {
  it("calls POST /api/health/acknowledge with empty body and prints confirmation", async () => {
    let capturedBody: unknown;
    let capturedUrl = "";
    const client = stubClient(async (url, init) => {
      capturedUrl = url;
      capturedBody = JSON.parse(init?.body as string);
      return new Response(JSON.stringify({ ok: true }));
    });
    const out = collectOutput();
    const program = new Command();
    registerHealth(program, { client, stream: out.stream });
    await program.parseAsync(["health", "acknowledge"], { from: "user" });
    expect(capturedUrl).toContain("/api/health/acknowledge");
    expect(capturedBody).toEqual({});
    expect(out.text()).toContain("Acknowledged all");
  });

  it("calls POST with errorIds when --id is provided multiple times", async () => {
    let capturedBody: unknown;
    const client = stubClient(async (_, init) => {
      capturedBody = JSON.parse(init?.body as string);
      return new Response(JSON.stringify({ ok: true }));
    });
    const out = collectOutput();
    const program = new Command();
    registerHealth(program, { client, stream: out.stream });
    await program.parseAsync(["health", "acknowledge", "--id", "err1", "--id", "err2"], { from: "user" });
    expect(capturedBody).toEqual({ errorIds: ["err1", "err2"] });
    expect(out.text()).toContain("Acknowledged 2");
  });

  it("outputs JSON with --json flag", async () => {
    const client = stubClient(async () => new Response(JSON.stringify({ ok: true })));
    const out = collectOutput();
    const program = new Command();
    registerHealth(program, { client, stream: out.stream });
    await program.parseAsync(["health", "acknowledge", "--json"], { from: "user" });
    const parsed = JSON.parse(out.text());
    expect(parsed).toEqual({ ok: true });
  });
});
