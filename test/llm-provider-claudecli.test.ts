import { describe, it, expect, vi, afterEach } from "vitest";
import { execFile } from "node:child_process";

vi.mock("node:child_process", () => ({ execFile: vi.fn() }));
vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

const mockExecFile = vi.mocked(execFile);

function mockSuccess(result: string, sessionId = "sess-123") {
  const envelope = JSON.stringify({ result, session_id: sessionId });
  mockExecFile.mockImplementation((_bin, _args, ...rest) => {
    const cb = rest[rest.length - 1] as Function;
    cb(null, envelope, "");
    return {} as ReturnType<typeof execFile>;
  });
}

function mockError(message: string, stderr = "") {
  mockExecFile.mockImplementation((_bin, _args, ...rest) => {
    const cb = rest[rest.length - 1] as Function;
    const err = Object.assign(new Error(message), { stderr });
    cb(err, "", stderr);
    return {} as ReturnType<typeof execFile>;
  });
}

afterEach(() => vi.clearAllMocks());

describe("createClaudecliAdapter", () => {
  it("complete parses JSON response for non-synthesize_answer capability", async () => {
    const { createClaudecliAdapter } = await import("../core/llm/provider-claudecli.js");
    const adapter = createClaudecliAdapter();
    mockSuccess('{"tags":["a","b"]}');
    expect(await adapter.complete("cluster_tags", "input")).toEqual({ tags: ["a", "b"] });
  });

  it("complete returns { answer } wrapper for synthesize_answer", async () => {
    const { createClaudecliAdapter } = await import("../core/llm/provider-claudecli.js");
    const adapter = createClaudecliAdapter();
    mockSuccess("The answer is 42.");
    expect(await adapter.complete("synthesize_answer", "question")).toEqual({ answer: "The answer is 42." });
  });

  it("complete throws [rate_limit] when stderr contains rate limit", async () => {
    const { createClaudecliAdapter } = await import("../core/llm/provider-claudecli.js");
    const adapter = createClaudecliAdapter();
    mockError("Rate limit exceeded", "Rate limit exceeded");
    await expect(adapter.complete("cluster_tags", "input")).rejects.toThrow("[rate_limit]");
  });

  it("complete throws [api_error] on other subprocess errors", async () => {
    const { createClaudecliAdapter } = await import("../core/llm/provider-claudecli.js");
    const adapter = createClaudecliAdapter();
    mockError("Connection refused");
    await expect(adapter.complete("cluster_tags", "input")).rejects.toThrow("[api_error]");
  });

  it("complete appends temp file paths to prompt when attachments provided", async () => {
    const { createClaudecliAdapter } = await import("../core/llm/provider-claudecli.js");
    const adapter = createClaudecliAdapter();
    mockSuccess('{"tags":["x"]}');
    await adapter.complete("cluster_tags", "describe this", [
      { name: "screenshot.png", base64: "abc", mimeType: "image/png" },
    ]);
    const calledArgs = (mockExecFile.mock.calls[0] as unknown[])[1] as string[];
    expect(calledArgs[calledArgs.length - 1]).toMatch(/screenshot\.png/);
    expect(calledArgs[calledArgs.length - 1]).toMatch(/\.png/);
  });

  it("converse sends full formatted history with system prompt on first call", async () => {
    const { createClaudecliAdapter } = await import("../core/llm/provider-claudecli.js");
    const adapter = createClaudecliAdapter();
    mockSuccess("hello back", "sess-abc");
    const result = await adapter.converse("be helpful", [{ role: "user", content: "hi" }]);
    expect(result).toBe("hello back");
    const calledArgs = (mockExecFile.mock.calls[0] as unknown[])[1] as string[];
    expect(calledArgs).toContain("--system-prompt");
    expect(calledArgs).toContain("be helpful");
    expect(calledArgs[calledArgs.length - 1]).toContain("[User]: hi");
  });

  it("converse uses --resume with only last message on cache hit", async () => {
    const { createClaudecliAdapter } = await import("../core/llm/provider-claudecli.js");
    const adapter = createClaudecliAdapter();

    mockSuccess("first reply", "sess-xyz");
    await adapter.converse("sys", [{ role: "user", content: "msg1" }]);

    mockSuccess("second reply", "sess-xyz");
    await adapter.converse("sys", [
      { role: "user", content: "msg1" },
      { role: "assistant", content: "first reply" },
      { role: "user", content: "msg2" },
    ]);

    const secondCallArgs = (mockExecFile.mock.calls[1] as unknown[])[1] as string[];
    expect(secondCallArgs).toContain("--resume");
    expect(secondCallArgs).toContain("sess-xyz");
    expect(secondCallArgs[secondCallArgs.length - 1]).toBe("msg2");
  });
});
