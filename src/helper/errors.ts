export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

export class ConfigError extends AppError {
  constructor(message = "Server configuration is invalid") {
    super(message, 500);
  }
}

export class UpstreamError extends AppError {
  constructor(message = "GitHub did not answer as expected") {
    super(message, 502);
  }
}
