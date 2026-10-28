import { NextFunction, Request, Response } from "express";

// In-memory sliding window, per IP. Single-instance server; GitHub's image proxy
// caches cards, so real traffic stays far below this.
export const rateLimitByIp = function (maxRequests: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  return function (req: Request, res: Response, next: NextFunction) {
    const key = req.ip ?? "anonymous";
    const now = Date.now();

    const recent = (hits.get(key) ?? []).filter(timestamp => now - timestamp < windowMs);
    if (recent.length >= maxRequests) {
      return res.status(429).json({ message: "Too many requests — please slow down a little." });
    }

    recent.push(now);
    hits.set(key, recent);

    if (hits.size > 10_000) {
      for (const [entryKey, timestamps] of hits) {
        if (timestamps.every(timestamp => now - timestamp >= windowMs)) hits.delete(entryKey);
      }
    }

    next();
  };
};
