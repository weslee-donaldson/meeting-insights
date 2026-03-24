import { watch, readdirSync } from "node:fs";
import { basename } from "node:path";

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
