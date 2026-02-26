import { describe, it, expect } from "vitest";
import { createLogger } from "../src/logger.js";

describe("createLogger", () => {
  it("returns a debug logger namespaced under mtninsights:", () => {
    const logger = createLogger("parser");
    expect(logger.namespace).toBe("mtninsights:parser");
  });
});
