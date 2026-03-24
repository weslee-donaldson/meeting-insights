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
});
