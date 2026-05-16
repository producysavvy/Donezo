export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}

export const badRequest = (message: string) =>
  new AppError(message, 400, "BAD_REQUEST");

export const unauthorized = (message = "Authentication required") =>
  new AppError(message, 401, "UNAUTHORIZED");

export const forbidden = (message = "You do not have access to this resource") =>
  new AppError(message, 403, "FORBIDDEN");

export const notFound = (message = "Resource not found") =>
  new AppError(message, 404, "NOT_FOUND");

export const conflict = (message: string) =>
  new AppError(message, 409, "CONFLICT");
