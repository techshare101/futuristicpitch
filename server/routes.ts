import type { Express } from "express";
import { createUser, verifyEmail, generateToken } from "./auth";
import { signUpSchema, verifyEmailSchema, projectSchema } from "../db/schema";
import { db } from "../db";
import { users, projects } from "../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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

  // Projects CRUD endpoints
  app.get("/api/projects", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userProjects = await db.select().from(projects).where(eq(projects.userId, token));
      res.json(userProjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const projectData = projectSchema.parse(req.body);
      const newProject = await db.insert(projects).values({
        id: uuidv4(),
        userId: token,
        ...projectData,
      }).returning();

      res.json(newProject[0]);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    try {
      const projectData = projectSchema.parse(req.body);
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (project.userId !== token) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updatedProject = await db.update(projects)
        .set({ ...projectData, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();

      res.json(updatedProject[0]);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    try {
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (project.userId !== token) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await db.delete(projects).where(eq(projects.id, id));
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });
}
