import { describe, it, expect } from "vitest";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const scriptPath = resolve(import.meta.dirname, "..", "setup.sh");

describe("setup.sh", () => {
  const script = readFileSync(scriptPath, "utf-8");

  it("is executable (file mode has owner-execute bit)", () => {
    const mode = statSync(scriptPath).mode;
    expect(mode & 0o100).toBe(0o100);
  });

  it("starts with a bash shebang", () => {
    expect(script).toMatch(/^#!\/(usr\/bin\/env )?bash/);
  });

  it("uses set -e for fail-fast behavior", () => {
    expect(script).toMatch(/set -e/);
  });

  it("checks node version is at least 22", () => {
    expect(script).toMatch(/node.*22|22.*node|NODE_MAJOR/);
  });

  it("checks for pnpm availability", () => {
    expect(script).toMatch(/command -v pnpm|which pnpm/);
  });

  it("runs pnpm install", () => {
    expect(script).toMatch(/pnpm install/);
  });

  it("copies .env.example to .env.local when missing", () => {
    expect(script).toMatch(/\.env\.example/);
    expect(script).toMatch(/\.env\.local/);
  });

  it("runs download-models", () => {
    expect(script).toMatch(/pnpm download-models|download-models/);
  });

  it("runs pnpm setup", () => {
    expect(script).toMatch(/pnpm setup/);
  });

  it("prompts to install mti globally via pnpm link", () => {
    expect(script).toMatch(/pnpm link --global/);
  });

  it("gates the global-link prompt on an interactive TTY", () => {
    expect(script).toMatch(/-t 0/);
  });

  it("honors MTI_SETUP_SKIP_PROMPTS to bypass interactive prompts", () => {
    expect(script).toMatch(/MTI_SETUP_SKIP_PROMPTS/);
  });
});
