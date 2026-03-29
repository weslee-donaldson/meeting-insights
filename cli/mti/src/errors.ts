export class AuthError extends Error {
  constructor() {
    super(
      "Token invalid or expired. Run `mti config set token <token>` to update."
    );
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("You don't have access to this resource.");
  }
}

export class NotFoundError extends Error {
  constructor() {
    super("Resource not found.");
  }
}

export class ServerError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UnavailableError extends Error {
  constructor() {
    super("This feature is temporarily unavailable.");
  }
}
