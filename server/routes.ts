import type { Express } from "express";

// Basic health check endpoint
export function registerRoutes(app: Express) {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
}