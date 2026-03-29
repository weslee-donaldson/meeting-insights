import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadConfig, saveConfig } from "../../../cli/mti/src/config.ts";

describe("config load/save", () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "mti-config-"));
    configPath = join(tempDir, ".mtirc");
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns defaults when config file does not exist", () => {
    const result = loadConfig(configPath);

    expect(result).toEqual({
      baseUrl: "http://localhost:3000",
      token: null,
    });
  });

  it("returns values from an existing config file", () => {
    writeFileSync(
      configPath,
      JSON.stringify({ baseUrl: "https://api.example.com", token: "abc123" })
    );

    const result = loadConfig(configPath);

    expect(result).toEqual({
      baseUrl: "https://api.example.com",
      token: "abc123",
    });
  });

  it("saves a new config file with provided values", () => {
    saveConfig({ baseUrl: "https://custom.api", token: "mytoken" }, configPath);

    const raw = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(raw).toEqual({
      baseUrl: "https://custom.api",
      token: "mytoken",
    });
  });

  it("merges partial save into existing config without clobbering other keys", () => {
    writeFileSync(
      configPath,
      JSON.stringify({ baseUrl: "https://old.api", token: "oldtoken" })
    );

    saveConfig({ token: "newtoken" }, configPath);

    const raw = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(raw).toEqual({
      baseUrl: "https://old.api",
      token: "newtoken",
    });
  });

  it("preserves unrelated keys in the config file during save", () => {
    writeFileSync(
      configPath,
      JSON.stringify({ baseUrl: "http://localhost:3000", token: null, extra: "data" })
    );

    saveConfig({ token: "fresh" }, configPath);

    const raw = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(raw).toEqual({
      baseUrl: "http://localhost:3000",
      token: "fresh",
      extra: "data",
    });
  });

  it("creates config file from defaults when saving partial to nonexistent file", () => {
    saveConfig({ token: "first" }, configPath);

    const raw = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(raw).toEqual({
      baseUrl: "http://localhost:3000",
      token: "first",
    });
  });
});

describe("config env var overrides", () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "mti-config-env-"));
    configPath = join(tempDir, ".mtirc");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("overrides baseUrl from MTI_BASE_URL env var", () => {
    writeFileSync(
      configPath,
      JSON.stringify({ baseUrl: "http://localhost:3000", token: "filetoken" })
    );
    vi.stubEnv("MTI_BASE_URL", "https://env.example.com");

    const result = loadConfig(configPath);

    expect(result).toEqual({
      baseUrl: "https://env.example.com",
      token: "filetoken",
    });
  });

  it("overrides token from MTI_TOKEN env var", () => {
    writeFileSync(
      configPath,
      JSON.stringify({ baseUrl: "http://localhost:3000", token: "filetoken" })
    );
    vi.stubEnv("MTI_TOKEN", "envtoken");

    const result = loadConfig(configPath);

    expect(result).toEqual({
      baseUrl: "http://localhost:3000",
      token: "envtoken",
    });
  });

  it("overrides both baseUrl and token from env vars", () => {
    writeFileSync(
      configPath,
      JSON.stringify({ baseUrl: "http://localhost:3000", token: "filetoken" })
    );
    vi.stubEnv("MTI_BASE_URL", "https://env.api");
    vi.stubEnv("MTI_TOKEN", "envtoken");

    const result = loadConfig(configPath);

    expect(result).toEqual({
      baseUrl: "https://env.api",
      token: "envtoken",
    });
  });

  it("env vars override defaults when config file does not exist", () => {
    vi.stubEnv("MTI_BASE_URL", "https://env-only.api");
    vi.stubEnv("MTI_TOKEN", "env-only-token");

    const result = loadConfig(configPath);

    expect(result).toEqual({
      baseUrl: "https://env-only.api",
      token: "env-only-token",
    });
  });

  it("does not override when env vars are not set", () => {
    vi.stubEnv("MTI_BASE_URL", "");
    vi.stubEnv("MTI_TOKEN", "");
    writeFileSync(
      configPath,
      JSON.stringify({ baseUrl: "https://file.api", token: "filetoken" })
    );

    const result = loadConfig(configPath);

    expect(result).toEqual({
      baseUrl: "https://file.api",
      token: "filetoken",
    });
  });
});
