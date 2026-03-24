import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createWatcher, Watcher } from "../local-service/watcher.js";

let tmpDir: string;
let watcher: Watcher | undefined;

afterEach(() => {
  watcher?.stop();
  watcher = undefined;
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("createWatcher", () => {
  it("detects new JSON file and calls callback with filename", async () => {
    tmpDir = join(tmpdir(), `watcher-test-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    const received = new Promise<string>((resolve) => {
      watcher = createWatcher({
        dir: tmpDir,
        onFile: resolve,
        debounceMs: 100,
        pollIntervalMs: 200,
      });
    });

    writeFileSync(join(tmpDir, "meeting.json"), "{}");

    expect(await received).toBe("meeting.json");
  });

  it("debounces rapid events for the same file", async () => {
    tmpDir = join(tmpdir(), `watcher-debounce-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    const calls: string[] = [];
    const settled = new Promise<void>((resolve) => {
      watcher = createWatcher({
        dir: tmpDir,
        onFile: (filename) => {
          calls.push(filename);
          resolve();
        },
        debounceMs: 100,
        pollIntervalMs: 5000,
      });
    });

    writeFileSync(join(tmpDir, "data.json"), '{"v":1}');
    writeFileSync(join(tmpDir, "data.json"), '{"v":2}');
    writeFileSync(join(tmpDir, "data.json"), '{"v":3}');

    await settled;
    await new Promise((r) => setTimeout(r, 200));

    expect(calls).toEqual(["data.json"]);
  });
});
