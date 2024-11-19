import type { Express } from "express";
import { createUser, verifyEmail, generateToken, authenticateUser, comparePasswords } from "./auth";
import { signUpSchema, verifyEmailSchema, projectSchema } from "../db/schema";
import { db } from "../db";
import { users, projects } from "../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { ZodError } from "zod";

export function registerRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Authentication status endpoint
  app.get("/api/auth/status", authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      res.json({
        authenticated: true,
        emailVerified: user.emailVerified,
        userId: user.id,
        email: user.email
      });
    } catch (error) {
      console.error("[Routes] Auth status error:", error);
      res.status(401).json({
        authenticated: false,
        error: "Authentication required"
      });
    }
  });

  // Projects CRUD endpoints
  app.get("/api/projects", authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      console.log("[Routes] Fetching projects for user:", user.id);
      
      const userProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, user.id));
      
      console.log(`[Routes] Successfully fetched ${userProjects.length} projects`);
      res.json(userProjects);
    } catch (error) {
      console.error("[Routes] Error fetching projects:", error);
      res.status(500).json({ 
        error: "Failed to fetch projects",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  app.post("/api/projects", authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      console.log("[Routes] Creating new project for user:", user.id);
      
      const projectData = projectSchema.parse(req.body);
      
      const newProject = await db.insert(projects).values({
        id: uuidv4(),
        userId: user.id,
        ...projectData,
      }).returning();

      console.log("[Routes] Project created successfully:", newProject[0].id);
      res.json(newProject[0]);
    } catch (error) {
      console.error("[Routes] Error creating project:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Invalid project data",
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: "Failed to create project",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  app.put("/api/projects/:id", authenticateUser, async (req, res) => {
    const { id } = req.params;
    try {
      const user = (req as any).user;
      console.log(`[Routes] Updating project: ${id} for user: ${user.id}`);
      
      const projectData = projectSchema.parse(req.body);
      
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
      });

      if (!project) {
        console.log(`[Routes] Project not found: ${id}`);
        return res.status(404).json({ error: "Project not found" });
      }

      if (project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized to update this project" });
      }

      const updatedProject = await db.update(projects)
        .set({ ...projectData, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();

      console.log(`[Routes] Project updated successfully: ${id}`);
      res.json(updatedProject[0]);
    } catch (error) {
      console.error(`[Routes] Error updating project ${id}:`, error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Invalid project data",
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: "Failed to update project",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  app.delete("/api/projects/:id", authenticateUser, async (req, res) => {
    const { id } = req.params;
    try {
      const user = (req as any).user;
      console.log(`[Routes] Deleting project: ${id} for user: ${user.id}`);
      
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
      });

      if (!project) {
        console.log(`[Routes] Project not found: ${id}`);
        return res.status(404).json({ error: "Project not found" });
      }

      if (project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized to delete this project" });
      }

      await db.delete(projects).where(eq(projects.id, id));
      console.log(`[Routes] Project deleted successfully: ${id}`);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error(`[Routes] Error deleting project ${id}:`, error);
      res.status(500).json({ 
        error: "Failed to delete project",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  // Auth endpoints
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = signUpSchema.parse(req.body);
      
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const { id, verificationToken } = await createUser(email, password);
      const token = generateToken(id);

      res.json({ token, message: "Verification email sent" });
    } catch (error) {
      console.error("[Routes] Signup error:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = verifyEmailSchema.parse(req.body);
      const verified = await verifyEmail(token);

      if (!verified) {
        return res.status(400).json({ error: "Invalid verification token" });
      }

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("[Routes] Email verification error:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Update login endpoint with password comparison and better error handling
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = signUpSchema.parse(req.body);
      
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        console.log("[Routes] Login failed: User not found");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await comparePasswords(password, user.hashedPassword);
      if (!isValidPassword) {
        console.log("[Routes] Login failed: Invalid password");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user.id);
      console.log("[Routes] Login successful for user:", user.id);
      res.json({ token, userId: user.id });
    } catch (error) {
      console.error("[Routes] Login error:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Login failed",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });
}
