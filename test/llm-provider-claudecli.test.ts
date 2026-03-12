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
    const { createClaudecliAdapter } = await import("../core/llm-provider-claudecli.js");
    const adapter = createClaudecliAdapter();
    mockSuccess('{"tags":["a","b"]}');
    expect(await adapter.complete("cluster_tags", "input")).toEqual({ tags: ["a", "b"] });
  });
});
