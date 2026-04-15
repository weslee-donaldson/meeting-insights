import { watch, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export interface WatcherOptions {
  dir: string;
  onFile: (filename: string) => void | Promise<void>;
  pollIntervalMs?: number;
  debounceMs?: number;
}

export interface Watcher {
  stop: () => void;
}

export function createWatcher(options: WatcherOptions): Watcher {
  const { dir, onFile, pollIntervalMs = 30000, debounceMs = 2000 } = options;
  const seen = new Set<string>();
  const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  function scheduleCallback(filename: string): void {
    if (seen.has(filename)) return;
    if (debounceTimers.has(filename)) {
      clearTimeout(debounceTimers.get(filename));
    }
    debounceTimers.set(
      filename,
      setTimeout(() => {
        debounceTimers.delete(filename);
        if (seen.has(filename)) return;
        seen.add(filename);
        onFile(filename);
      }, debounceMs),
    );
  }

  function isEligible(filename: string): boolean {
    return filename.endsWith(".json") && !filename.startsWith(".");
  }

  const fsWatcher = watch(dir, (_event, filename) => {
    if (filename && isEligible(filename)) {
      scheduleCallback(filename);
    }
  });

  function scan(): void {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (isEligible(entry)) {
        scheduleCallback(entry);
      }
    }
  }

  const pollTimer = setInterval(scan, pollIntervalMs);

  function stop(): void {
    fsWatcher.close();
    clearInterval(pollTimer);
    for (const timer of debounceTimers.values()) {
      clearTimeout(timer);
    }
    debounceTimers.clear();
  }

  return { stop };
}

export interface FolderWatcherOptions {
  dir: string;
  onFolder: (folderName: string) => void | Promise<void>;
  pollIntervalMs?: number;
  quietPeriodMs?: number;
}

function newestMtimeMs(path: string): number {
  let newest = 0;
  const stack = [path];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const stat = statSync(current);
    if (stat.mtimeMs > newest) newest = stat.mtimeMs;
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current)) {
        stack.push(join(current, entry));
      }
    }
  }
  return newest;
}

export function createFolderWatcher(options: FolderWatcherOptions): Watcher {
  const { dir, onFolder, pollIntervalMs = 30000, quietPeriodMs = 60000 } = options;
  const fired = new Set<string>();

  function scan(): void {
    const now = Date.now();
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith(".")) continue;
      if (fired.has(entry)) continue;
      const full = join(dir, entry);
      const stat = statSync(full);
      if (!stat.isDirectory()) continue;
      const newest = newestMtimeMs(full);
      if (now - newest >= quietPeriodMs) {
        fired.add(entry);
        onFolder(entry);
      }
    }
  }

  const pollTimer = setInterval(scan, pollIntervalMs);

  function stop(): void {
    clearInterval(pollTimer);
  }

  return { stop };
}
