import { Response } from "express";
import { ZodError } from "zod";
import { AppError } from "./errors";

interface IHandleErrors {
  res: Response;
  error: unknown;
}

export const handleErrors = function ({ res, error }: IHandleErrors) {
  if (error instanceof ZodError) {
    const errors = error.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ message: "Validation error", errors });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("Unhandled error:", error);
  return res.status(500).json({
    message: typeof error === "string" ? error : "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? error : undefined,
  });
};
