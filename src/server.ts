import "dotenv/config";

import express from "express";
import { configureApp } from "./config";
import { cacheTtlMs } from "./helper/cache";
import { registerRoutes } from "./routes/index";
import { CardService } from "./services/card.service";
import { getCardsConfig } from "./utils/cardsConfig";

const { PORT, GITHUB_TOKEN, GITHUB_USERNAME } = process.env;

if (!PORT || !GITHUB_TOKEN || !GITHUB_USERNAME) {
  console.error("❌ PORT, GITHUB_TOKEN and GITHUB_USERNAME must all be set!");
  process.exit(1);
}

const app = express();

configureApp(app);
registerRoutes(app);

try {
  const { projects } = getCardsConfig();
  console.log(`✅ Cards config loaded with ${projects.length} project(s)`);
} catch (error) {
  console.error(`❌ ${error instanceof Error ? error.message : error}`);
}

const cardService = new CardService();

// GitHub's image proxy times out on slow images, so cards must always be answered from a warm cache.
const server = app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
  void cardService.warmCache();
  setInterval(() => void cardService.warmCache(), cacheTtlMs() + 1_000);
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
