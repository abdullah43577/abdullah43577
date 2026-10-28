import { Application, NextFunction, Request, Response } from "express";
import { AppError } from "../helper/errors";
import { cardRouter } from "./cardRoutes";

export const registerRoutes = (app: Application) => {
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ message: "Server is healthy", data: { status: "ok" } });
  });

  app.use("/v1/cards", cardRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: "Not Found",
      message: "The requested endpoint does not exist!",
      explorableSolutions: {
        solution1: 'ensure the "METHOD" used to call the endpoint is correct!',
        solution2: "ensure the relative paths to the server url is defined correctly",
      },
    });
  });

  app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
    const statusCode = error instanceof AppError ? error.statusCode : 500;

    if (statusCode >= 500) console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, error);

    res.status(statusCode).json({ message: error.message || "Internal Server Error" });
  });
};
