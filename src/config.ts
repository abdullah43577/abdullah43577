import express, { Application } from "express";
import helmet from "helmet";
import morgan from "morgan";

export const configureApp = (app: Application) => {
  app.set("trust proxy", 1);
  app.use(morgan("dev"));
  app.use(express.json({ limit: "10kb" }));
  // GitHub's image proxy and any page embedding a card load it cross-origin.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
};
