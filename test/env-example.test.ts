import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");

describe(".env.example", () => {
  const envExample = readFileSync(resolve(rootDir, ".env.example"), "utf-8");

  it("contains all required environment variable keys", () => {
    const required = [
      "ANTHROPIC_API_KEY",
      "MTNINSIGHTS_LLM_PROVIDER",
      "MTNINSIGHTS_DB_PATH",
      "MTNINSIGHTS_VECTOR_PATH",
      "PORT",
      "MTNINSIGHTS_AUTH_ENABLED",
      "MTNINSIGHTS_OWNER_SECRET",
      "MTNINSIGHTS_LOG_LEVEL",
    ];
    for (const key of required) {
      expect(envExample).toContain(key);
    }
  });

  it("does not contain real API key values", () => {
    expect(envExample).not.toMatch(/sk-ant-api\w+/);
    expect(envExample).not.toMatch(/sk-proj-\w+/);
  });
});

describe("ecosystem.config.cjs", () => {
  const ecosystem = readFileSync(resolve(rootDir, "ecosystem.config.cjs"), "utf-8");

  it("includes webhook-watcher entry", () => {
    expect(ecosystem).toContain("webhook-watcher");
  });

  it("includes mti-api entry with correct script path", () => {
    expect(ecosystem).toContain("mti-api");
    expect(ecosystem).toContain("api/main.ts");
  });
});
