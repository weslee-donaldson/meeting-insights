import { Command } from "commander";
import { loadConfig, saveConfig } from "../config.ts";
import { outputJson } from "../format.ts";

const VALID_KEYS = ["baseUrl", "token"] as const;
type ConfigKey = (typeof VALID_KEYS)[number];

function maskToken(token: string | null): string {
  if (token === null) {
    return "not set";
  }
  if (token.length <= 6) {
    return token;
  }
  return token.slice(0, 3) + "..." + token.slice(-3);
}

export function configShow(
  opts: { json: boolean },
  deps: {
    configPath?: string;
    stream?: NodeJS.WritableStream;
  }
): void {
  const config = loadConfig(deps.configPath);
  const masked = maskToken(config.token);
  const stream = deps.stream ?? process.stdout;

  if (opts.json) {
    outputJson({ baseUrl: config.baseUrl, token: masked }, stream);
    return;
  }

  const entries = [
    { label: "Base URL", value: config.baseUrl },
    { label: "Token", value: masked },
  ];
  const maxLabel = Math.max(...entries.map((e) => e.label.length));
  const padTo = maxLabel + 4;
  const lines = entries
    .map((e) => `${(e.label + ":").padEnd(padTo)}${e.value}`)
    .join("\n");
  stream.write(lines + "\n");
}

export function configSet(
  key: string,
  value: string,
  deps: {
    configPath?: string;
    stream?: NodeJS.WritableStream;
    errStream?: NodeJS.WritableStream;
  }
): number {
  const errStream = deps.errStream ?? process.stderr;
  const stream = deps.stream ?? process.stdout;

  if (!VALID_KEYS.includes(key as ConfigKey)) {
    errStream.write(
      `Invalid key "${key}". Valid keys: ${VALID_KEYS.join(", ")}\n`
    );
    return 1;
  }

  saveConfig({ [key]: value }, deps.configPath);

  const displayValue = key === "token" ? maskToken(value) : value;
  stream.write(`Config updated: ${key} = ${displayValue}\n`);
  return 0;
}

export function registerConfig(program: Command): void {
  const config = new Command("config").description(
    "View and update CLI configuration."
  );

  config
    .command("show")
    .description("Display current resolved configuration.")
    .option("--json", "Output as JSON")
    .addHelpText(
      "after",
      `
Output schema (--json):
  { "baseUrl": "string", "token": "string (masked)" }

Environment variable overrides (take precedence over ~/.mtirc):
  MTI_BASE_URL  Override base URL
  MTI_TOKEN     Override authentication token

Example:
  $ mti config show
  Base URL:   http://localhost:3000
  Token:      abc...xyz

  $ mti config show --json
  { "baseUrl": "http://localhost:3000", "token": "abc...xyz" }`
    )
    .action((cmdOpts: { json?: boolean }) => {
      const parentOpts = program.opts();
      configShow(
        { json: cmdOpts.json ?? parentOpts.json ?? false },
        {}
      );
    });

  config
    .command("set")
    .description("Set a configuration value.")
    .argument("<key>", "Config key (baseUrl or token)")
    .argument("<value>", "Value to set")
    .addHelpText(
      "after",
      `
Valid keys:
  baseUrl    API server URL (default: http://localhost:3000)
  token      Authentication token

Example:
  $ mti config set baseUrl https://api.example.com
  Config updated: baseUrl = https://api.example.com

  $ mti config set token mytoken123
  Config updated: token = myt...123`
    )
    .action((key: string, value: string) => {
      const exitCode = configSet(key, value, {});
      if (exitCode !== 0) {
        process.exit(exitCode);
      }
    });

  program.addCommand(config);
}
