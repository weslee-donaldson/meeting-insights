import { describe, it, expect } from "vitest";
import { AppError, ExtractionError, LlmError, ValidationError, PipelineError } from "../core/errors.js";

describe("AppError", () => {
  it("creates error with code and message", () => {
    const err = new AppError("test_error", "Something went wrong");
    expect(err.code).toBe("test_error");
    expect(err.message).toBe("Something went wrong");
    expect(err.name).toBe("AppError");
    expect(err).toBeInstanceOf(Error);
  });

  it("preserves cause when provided", () => {
    const cause = new Error("root cause");
    const err = new AppError("test_error", "Wrapped", { cause });
    expect(err.cause).toBe(cause);
  });
});

describe("ExtractionError", () => {
  it("creates error with extraction-specific code", () => {
    const err = new ExtractionError("parse_failed", "Could not parse artifact");
    expect(err.code).toBe("parse_failed");
    expect(err.name).toBe("ExtractionError");
    expect(err).toBeInstanceOf(AppError);
  });
});

describe("LlmError", () => {
  it("creates error with LLM-specific code", () => {
    const err = new LlmError("rate_limit", "Rate limited");
    expect(err.code).toBe("rate_limit");
    expect(err.name).toBe("LlmError");
    expect(err).toBeInstanceOf(AppError);
  });
});

describe("ValidationError", () => {
  it("creates error with validation-specific code", () => {
    const err = new ValidationError("invalid_input", "Bad request body");
    expect(err.code).toBe("invalid_input");
    expect(err.name).toBe("ValidationError");
    expect(err).toBeInstanceOf(AppError);
  });
});

describe("PipelineError", () => {
  it("creates error with pipeline-specific code", () => {
    const err = new PipelineError("ingest_failed", "Could not ingest meeting");
    expect(err.code).toBe("ingest_failed");
    expect(err.name).toBe("PipelineError");
    expect(err).toBeInstanceOf(AppError);
  });
});
