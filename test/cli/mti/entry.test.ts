import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { program, wrapAction } from "../../../cli/mti/bin/mti.ts";
import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnavailableError,
} from "../../../cli/mti/src/errors.ts";

describe("mti entry point", () => {
  it("has the correct program name", () => {
    expect(program.name()).toBe("mti");
  });

  it("has a version string", () => {
    const version = program.version();
    expect(typeof version).toBe("string");
    expect(version!.length).toBeGreaterThan(0);
  });

  it("declares a global --json option", () => {
    const jsonOption = program.options.find(
      (opt) => opt.long === "--json"
    );
    expect(jsonOption).toBeDefined();
    expect(jsonOption!.description).toBe("Output as JSON");
  });
});

describe("wrapAction error-to-exit-code mapping", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);
  });

  afterEach(() => {
    exitSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it("exits with code 1 for AuthError", async () => {
    const action = wrapAction(async () => {
      throw new AuthError();
    });
    await expect(action()).rejects.toThrow("process.exit called");
    expect(stderrSpy).toHaveBeenCalledWith(
      "Token invalid or expired. Run `mti config set token <token>` to update.\n"
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("exits with code 1 for ForbiddenError", async () => {
    const action = wrapAction(async () => {
      throw new ForbiddenError();
    });
    await expect(action()).rejects.toThrow("process.exit called");
    expect(stderrSpy).toHaveBeenCalledWith(
      "You don't have access to this resource.\n"
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("exits with code 1 for NotFoundError", async () => {
    const action = wrapAction(async () => {
      throw new NotFoundError();
    });
    await expect(action()).rejects.toThrow("process.exit called");
    expect(stderrSpy).toHaveBeenCalledWith("Resource not found.\n");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("exits with code 2 for ServerError", async () => {
    const action = wrapAction(async () => {
      throw new ServerError("Internal failure");
    });
    await expect(action()).rejects.toThrow("process.exit called");
    expect(stderrSpy).toHaveBeenCalledWith("Internal failure\n");
    expect(exitSpy).toHaveBeenCalledWith(2);
  });

  it("exits with code 2 for UnavailableError", async () => {
    const action = wrapAction(async () => {
      throw new UnavailableError();
    });
    await expect(action()).rejects.toThrow("process.exit called");
    expect(stderrSpy).toHaveBeenCalledWith(
      "This feature is temporarily unavailable.\n"
    );
    expect(exitSpy).toHaveBeenCalledWith(2);
  });

  it("exits with code 1 for unknown errors", async () => {
    const action = wrapAction(async () => {
      throw new Error("something unexpected");
    });
    await expect(action()).rejects.toThrow("process.exit called");
    expect(stderrSpy).toHaveBeenCalledWith("something unexpected\n");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("does not exit when action succeeds", async () => {
    const action = wrapAction(async () => {
      return "ok";
    });
    await action();
    expect(exitSpy).not.toHaveBeenCalled();
  });
});

describe("health command registration", () => {
  it("registers health command on the program", () => {
    const healthCmd = program.commands.find((c) => c.name() === "health");
    expect(healthCmd).toBeDefined();
  });

  it("registers health status subcommand", () => {
    const healthCmd = program.commands.find((c) => c.name() === "health");
    const statusCmd = healthCmd?.commands.find((c) => c.name() === "status");
    expect(statusCmd).toBeDefined();
  });

  it("registers health acknowledge subcommand", () => {
    const healthCmd = program.commands.find((c) => c.name() === "health");
    const ackCmd = healthCmd?.commands.find((c) => c.name() === "acknowledge");
    expect(ackCmd).toBeDefined();
  });
});
