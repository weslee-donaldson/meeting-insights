#!/usr/bin/env tsx
import { Command } from "commander";
import { createRequire } from "node:module";
import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnavailableError,
} from "../src/errors.ts";

const require = createRequire(import.meta.url);
const pkg = require("../../../package.json");

export const program = new Command();

program
  .name("mti")
  .version(pkg.version)
  .description("Meeting Insights CLI — query meetings, clients, and action items")
  .option("--json", "Output as JSON");

export function wrapAction(
  fn: (...args: unknown[]) => Promise<unknown>
): (...args: unknown[]) => Promise<void> {
  return async (...args: unknown[]) => {
    try {
      await fn(...args);
    } catch (err) {
      if (
        err instanceof AuthError ||
        err instanceof ForbiddenError ||
        err instanceof NotFoundError
      ) {
        process.stderr.write(err.message + "\n");
        process.exit(1);
      }
      if (
        err instanceof ServerError ||
        err instanceof UnavailableError
      ) {
        process.stderr.write(err.message + "\n");
        process.exit(2);
      }
      const message =
        err instanceof Error ? err.message : String(err);
      process.stderr.write(message + "\n");
      process.exit(1);
    }
  };
}
