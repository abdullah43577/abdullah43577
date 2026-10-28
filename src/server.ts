import "dotenv/config";

import express from "express";
import { configureApp } from "./config";
import { registerRoutes } from "./routes/index";

const { PORT, GITHUB_TOKEN, GITHUB_USERNAME } = process.env;

if (!PORT || !GITHUB_TOKEN || !GITHUB_USERNAME) {
  console.error("❌ PORT, GITHUB_TOKEN and GITHUB_USERNAME must all be set!");
  process.exit(1);
}

const app = express();

configureApp(app);
registerRoutes(app);

const server = app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});

const shutdown = (signal: string) => {
  console.log(`🛑 ${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
