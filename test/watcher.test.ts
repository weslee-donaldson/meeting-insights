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

  it("periodic scan catches files that fs.watch missed", async () => {
    tmpDir = join(tmpdir(), `watcher-poll-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    writeFileSync(join(tmpDir, "pre-existing.json"), "{}");

    const received = new Promise<string>((resolve) => {
      watcher = createWatcher({
        dir: tmpDir,
        onFile: resolve,
        debounceMs: 50,
        pollIntervalMs: 150,
      });
    });

    expect(await received).toBe("pre-existing.json");
  });

  it("ignores non-JSON and hidden files", async () => {
    tmpDir = join(tmpdir(), `watcher-filter-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    const calls: string[] = [];
    const validReceived = new Promise<void>((resolve) => {
      watcher = createWatcher({
        dir: tmpDir,
        onFile: (filename) => {
          calls.push(filename);
          resolve();
        },
        debounceMs: 50,
        pollIntervalMs: 5000,
      });
    });

    writeFileSync(join(tmpDir, ".DS_Store"), "");
    writeFileSync(join(tmpDir, "readme.txt"), "hello");
    writeFileSync(join(tmpDir, ".hidden.json"), "{}");
    writeFileSync(join(tmpDir, "valid.json"), "{}");

    await validReceived;
    await new Promise((r) => setTimeout(r, 200));

    expect(calls).toEqual(["valid.json"]);
  });

  it("stop() cleans up watchers and timers — no callbacks after stop", async () => {
    tmpDir = join(tmpdir(), `watcher-stop-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    const calls: string[] = [];
    watcher = createWatcher({
      dir: tmpDir,
      onFile: (filename) => {
        calls.push(filename);
      },
      debounceMs: 50,
      pollIntervalMs: 100,
    });

    watcher.stop();
    watcher = undefined;

    writeFileSync(join(tmpDir, "after-stop.json"), "{}");

    await new Promise((r) => setTimeout(r, 400));

    expect(calls).toEqual([]);
  });
});
