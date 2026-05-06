import type { Response } from "express";

interface SuccessResponse<T = any> {
  status: "success";
  message: string;
  data: T;
}

interface ErrorResponse {
  status: "error";
  message: string;
  errors?: any;
}

export function sendSuccess<T = any>(
  res: Response,
  data: T = null as any,
  message: string = "Success",
  status: number = 200
): Response<SuccessResponse<T>> {
  return res.status(status).json({
    status: "success",
    message,
    data,
  });
}

/**
 * Send an error response
 * @param res - Express Response object
 * @param error - Error message or Error object
 * @param status - HTTP status code (default: 500)
 */
export function sendError(
  res: Response,
  error: string | Error | any,
  status: number = 500
): Response<ErrorResponse> {
  const payload: ErrorResponse = {
    status: "error",
    message:
      typeof error === "string"
        ? error
        : error?.message || "Internal Server Error",
  };

  if (error && typeof error === "object" && error.errors) {
    payload.errors = error.errors;
  }

  return res.status(status).json(payload);
}
