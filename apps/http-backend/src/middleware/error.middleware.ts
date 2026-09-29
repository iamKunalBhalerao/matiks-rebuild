import type { ErrorRequestHandler } from "express";

export class ErrorHandler {
  middleware: ErrorRequestHandler = (error: unknown, _req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    const candidate = error as {
      message?: unknown;
      status?: unknown;
      statusCode?: unknown;
    };
    const requestedStatus = candidate?.statusCode ?? candidate?.status;
    const statusCode =
      typeof requestedStatus === "number" &&
      requestedStatus >= 400 &&
      requestedStatus <= 599
        ? requestedStatus
        : 500;
    const message =
      statusCode === 500 && process.env.NODE_ENV === "production"
        ? "Internal server error"
        : typeof candidate?.message === "string"
          ? candidate.message
          : "Internal server error";

    res.status(statusCode).json({ success: false, message });
  };
}

export default new ErrorHandler().middleware;

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
