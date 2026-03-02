import { describe, it, expect } from "vitest";
import { createLogger } from "../core/logger.js";

describe("createLogger", () => {
  it("returns a debug logger namespaced under mtninsights:", () => {
    const logger = createLogger("parser");
    expect(logger.namespace).toBe("mtninsights:parser");
  });

  it("child loggers inherit parent namespace", () => {
    const logger = createLogger("parser:dir");
    expect(logger.namespace).toBe("mtninsights:parser:dir");
  });
});
