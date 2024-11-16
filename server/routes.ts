import type { Express } from "express";
import { createUser, verifyEmail, generateToken } from "./auth";
import { signUpSchema, verifyEmailSchema } from "../db/schema";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Authentication status endpoint
  app.get("/api/auth/status", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.json({ authenticated: false });
    }

    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, token),
      });
      res.json({ authenticated: !!user, emailVerified: user?.emailVerified });
    } catch (error) {
      res.json({ authenticated: false });
    }
  });

  // Sign up endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = signUpSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Create new user
      const { id, verificationToken } = await createUser(email, password);
      const token = generateToken(id);

      res.json({ token, message: "Verification email sent" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Email verification endpoint
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = verifyEmailSchema.parse(req.body);
      const verified = await verifyEmail(token);

      if (!verified) {
        return res.status(400).json({ error: "Invalid verification token" });
      }

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
}
