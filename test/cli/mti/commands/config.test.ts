import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  configShow,
  configSet,
} from "../../../../cli/mti/src/commands/config.ts";

function collectOutput(): { chunks: string[]; stream: NodeJS.WritableStream } {
  const chunks: string[] = [];
  const stream = {
    write(chunk: string) {
      chunks.push(chunk);
      return true;
    },
  } as unknown as NodeJS.WritableStream;
  return { chunks, stream };
}

describe("config show", () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "mti-cmd-config-"));
    configPath = join(tempDir, ".mtirc");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("displays resolved config with token masked", () => {
    writeFileSync(
      configPath,
      JSON.stringify({ baseUrl: "https://api.example.com", token: "abcdefghijk" })
    );

    const { chunks, stream } = collectOutput();

    configShow({ json: false }, { configPath, stream });

    const output = chunks.join("");
    expect(output).toContain("Base URL:");
    expect(output).toContain("https://api.example.com");
    expect(output).toContain("Token:");
    expect(output).toContain("abc...ijk");
    expect(output).not.toContain("abcdefghijk");
  });

  it("displays 'not set' when token is null", () => {
    const { chunks, stream } = collectOutput();

    configShow({ json: false }, { configPath, stream });

    const output = chunks.join("");
    expect(output).toContain("Token:");
    expect(output).toContain("not set");
  });

  it("displays short tokens without masking", () => {
    writeFileSync(
      configPath,
      JSON.stringify({ baseUrl: "http://localhost:3000", token: "short" })
    );

    const { chunks, stream } = collectOutput();

    configShow({ json: false }, { configPath, stream });

    const output = chunks.join("");
    expect(output).toContain("Token:");
    expect(output).toContain("short");
  });

  it("outputs JSON with masked token when --json is passed", () => {
    writeFileSync(
      configPath,
      JSON.stringify({ baseUrl: "https://api.example.com", token: "abcdefghijk" })
    );

    const { chunks, stream } = collectOutput();

    configShow({ json: true }, { configPath, stream });

    const parsed = JSON.parse(chunks.join(""));
    expect(parsed).toEqual({
      baseUrl: "https://api.example.com",
      token: "abc...ijk",
    });
  });

  it("outputs JSON with 'not set' when token is null", () => {
    const { chunks, stream } = collectOutput();

    configShow({ json: true }, { configPath, stream });

    const parsed = JSON.parse(chunks.join(""));
    expect(parsed).toEqual({
      baseUrl: "http://localhost:3000",
      token: "not set",
    });
  });
});

describe("config set", () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "mti-cmd-config-set-"));
    configPath = join(tempDir, ".mtirc");
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("sets baseUrl and confirms update", () => {
    const { chunks, stream } = collectOutput();

    configSet("baseUrl", "https://new.api", { configPath, stream });

    const output = chunks.join("");
    expect(output).toContain("Config updated: baseUrl = https://new.api");

    const saved = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(saved.baseUrl).toBe("https://new.api");
  });

  it("sets token and masks it in output", () => {
    const { chunks, stream } = collectOutput();

    configSet("token", "mysecrettoken123", { configPath, stream });

    const output = chunks.join("");
    expect(output).toContain("Config updated: token = mys...123");
    expect(output).not.toContain("mysecrettoken123");

    const saved = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(saved.token).toBe("mysecrettoken123");
  });

  it("saves the actual unmasked token value", () => {
    const { chunks, stream } = collectOutput();

    configSet("token", "abcdefghijk", { configPath, stream });

    const saved = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(saved.token).toBe("abcdefghijk");
  });

  it("rejects invalid keys with an error message", () => {
    const { chunks, stream } = collectOutput();

    const errChunks: string[] = [];
    const errStream = {
      write(chunk: string) {
        errChunks.push(chunk);
        return true;
      },
    } as unknown as NodeJS.WritableStream;

    const exitCode = configSet("invalid", "value", { configPath, stream, errStream });

    const errOutput = errChunks.join("");
    expect(errOutput).toContain("Invalid key");
    expect(errOutput).toContain("baseUrl");
    expect(errOutput).toContain("token");
    expect(exitCode).toBe(1);
  });
});

describe("config help text", () => {
  it("show help contains description, example, and output schema", async () => {
    const { Command } = await import("commander");
    const { registerConfig } = await import(
      "../../../../cli/mti/src/commands/config.ts"
    );
    const program = new Command();
    registerConfig(program);

    const configCmd = program.commands.find((c) => c.name() === "config");
    const showCmd = configCmd!.commands.find((c) => c.name() === "show");

    let helpOutput = "";
    showCmd!.configureOutput({
      writeOut: (str: string) => {
        helpOutput += str;
      },
      writeErr: (str: string) => {
        helpOutput += str;
      },
    });
    showCmd!.outputHelp();

    expect(helpOutput).toContain("Display current");
    expect(helpOutput).toContain("Output schema");
    expect(helpOutput).toContain("Example");
  });

  it("set help contains description, example, and valid keys", async () => {
    const { Command } = await import("commander");
    const { registerConfig } = await import(
      "../../../../cli/mti/src/commands/config.ts"
    );
    const program = new Command();
    registerConfig(program);

    const configCmd = program.commands.find((c) => c.name() === "config");
    const setCmd = configCmd!.commands.find((c) => c.name() === "set");

    let helpOutput = "";
    setCmd!.configureOutput({
      writeOut: (str: string) => {
        helpOutput += str;
      },
      writeErr: (str: string) => {
        helpOutput += str;
      },
    });
    setCmd!.outputHelp();

    expect(helpOutput).toContain("Set a configuration");
    expect(helpOutput).toContain("baseUrl");
    expect(helpOutput).toContain("token");
    expect(helpOutput).toContain("Example");
  });
});
