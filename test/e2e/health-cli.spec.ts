import { test, expect } from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const MTI_BASE_URL = process.env.MTI_BASE_URL ?? "http://localhost:3000";
const MTI_TOKEN = process.env.VITE_API_TOKEN ?? process.env.MTI_TOKEN ?? "";

async function runMti(...args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await execFileAsync(
      "node",
      ["--import", "tsx/esm", "cli/mti/bin/mti.ts", ...args],
      {
        env: {
          ...process.env,
          MTI_BASE_URL,
          MTI_TOKEN,
        },
      }
    );
    return { stdout, stderr, code: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return { stdout: e.stdout ?? "", stderr: e.stderr ?? "", code: e.code ?? 1 };
  }
}

test("mti health status --json returns valid HealthStatus JSON", async () => {
  const { stdout, code } = await runMti("health", "status", "--json");
  expect(code).toBe(0);
  const parsed = JSON.parse(stdout) as { status: string; error_groups: unknown[]; meetings_without_artifact: number; last_error_at: string | null };
  expect(parsed.status === "healthy" || parsed.status === "critical").toBe(true);
  expect(Array.isArray(parsed.error_groups)).toBe(true);
  expect(typeof parsed.meetings_without_artifact).toBe("number");
});

test("mti health status (human-readable) shows Status line", async () => {
  const { stdout, code } = await runMti("health", "status");
  expect(code).toBe(0);
  expect(stdout).toMatch(/Status:\s+(HEALTHY|CRITICAL)/);
});

test("mti health acknowledge --json returns { ok: true }", async () => {
  const { stdout, code } = await runMti("health", "acknowledge", "--json");
  expect(code).toBe(0);
  const parsed = JSON.parse(stdout) as { ok: boolean };
  expect(parsed).toEqual({ ok: true });
});

test("mti health status exits with code 0 on success", async () => {
  const { code } = await runMti("health", "status");
  expect(code).toBe(0);
});
