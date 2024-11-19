import type { Express } from "express";
import { createUser, verifyEmail, generateToken } from "./auth";
import { signUpSchema, verifyEmailSchema, projectSchema } from "../db/schema";
import { db } from "../db";
import { users, projects } from "../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { ZodError } from "zod";

async function ensurePublicUser() {
  const publicUser = await db.query.users.findFirst({
    where: eq(users.id, 'public')
  });
  
  if (!publicUser) {
    await db.insert(users).values({
      id: 'public',
      email: 'public@example.com',
      hashedPassword: 'none',
      emailVerified: true
    });
  }
}

export function registerRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Authentication status endpoint - temporarily disabled
  app.get("/api/auth/status", (_req, res) => {
    res.json({
      authenticated: true,
      emailVerified: true,
      userId: 'public',
      email: 'public@example.com'
    });
  });

  // Projects CRUD endpoints - No authentication required
  app.get("/api/projects", async (_req, res) => {
    try {
      console.log("[Routes] Fetching all projects");
      
      const allProjects = await db
        .select()
        .from(projects);
      
      console.log(`[Routes] Successfully fetched ${allProjects.length} projects`);
      res.json(allProjects);
    } catch (error) {
      console.error("[Routes] Error fetching projects:", error);
      res.status(500).json({ 
        error: "Failed to fetch projects",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      console.log("[Routes] Creating new project");
      
      // Ensure public user exists
      await ensurePublicUser();
      
      const projectData = projectSchema.parse(req.body);
      
      const newProject = await db.insert(projects).values({
        id: uuidv4(),
        userId: 'public',
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

  app.put("/api/projects/:id", async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`[Routes] Updating project: ${id}`);
      
      const projectData = projectSchema.parse(req.body);
      
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
      });

      if (!project) {
        console.log(`[Routes] Project not found: ${id}`);
        return res.status(404).json({ error: "Project not found" });
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

  app.delete("/api/projects/:id", async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`[Routes] Deleting project: ${id}`);
      
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
      });

      if (!project) {
        console.log(`[Routes] Project not found: ${id}`);
        return res.status(404).json({ error: "Project not found" });
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

  // Auth endpoints - temporarily simplified
  app.post("/api/auth/signup", async (req, res) => {
    res.json({ token: "mock-token", message: "Signup successful" });
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    res.json({ message: "Email verified successfully" });
  });

  app.post("/api/auth/login", async (req, res) => {
    res.json({ token: "mock-token", userId: "public" });
  });
}
