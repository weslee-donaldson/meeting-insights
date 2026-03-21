export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
    this.name = "AppError";
  }
}

export class ExtractionError extends AppError {
  constructor(code: string, message: string, options?: ErrorOptions) {
    super(code, message, options);
    this.name = "ExtractionError";
  }
}

export class LlmError extends AppError {
  constructor(code: string, message: string, options?: ErrorOptions) {
    super(code, message, options);
    this.name = "LlmError";
  }
}

export class ValidationError extends AppError {
  constructor(code: string, message: string, options?: ErrorOptions) {
    super(code, message, options);
    this.name = "ValidationError";
  }
}

export class PipelineError extends AppError {
  constructor(code: string, message: string, options?: ErrorOptions) {
    super(code, message, options);
    this.name = "PipelineError";
  }
}
