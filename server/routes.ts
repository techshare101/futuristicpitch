import type { Express, Request, Response, NextFunction } from "express";
import { createUser, verifyEmail, generateToken } from "./auth";
import { signUpSchema, verifyEmailSchema, projectSchema } from "../db/schema";
import { db } from "../db";
import { users, projects } from "../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { ZodError } from "zod";
import { desc } from "drizzle-orm";

// Enhanced error logging function
function logError(context: string, error: unknown, additionalInfo: Record<string, any> = {}) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  console.error(`[Routes] Error in ${context}:`, {
    message: errorObj.message,
    stack: errorObj.stack,
    ...additionalInfo,
    timestamp: new Date().toISOString()
  });
}

async function ensurePublicUser() {
  try {
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
      console.log("[Routes] Public user created successfully");
    }
  } catch (error) {
    logError("ensurePublicUser", error);
    throw new Error("Failed to setup public user");
  }
}

async function validateDatabaseConnection() {
  try {
    await db.query.users.findFirst().catch(error => {
      logError("validateDatabaseConnection", error);
      throw new Error("Database connection failed");
    });
    return true;
  } catch (error) {
    logError("validateDatabaseConnection", error);
    return false;
  }
}

export function registerRoutes(app: Express) {
  // Auth endpoints - temporarily simplified
  app.post("/api/auth/signup", async (req, res) => {
    res.json({ token: "mock-token", message: "Signup successful" });
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    res.json({ message: "Email verified successfully" });
  });

  app.post("/api/auth/login", async (req, res) => {
    console.log("[Routes] Login attempt");
    res.json({ token: "mock-token", userId: "public" });
  });

  // Projects CRUD endpoints
  app.get("/api/projects", async (_req, res) => {
    try {
      console.log("[Routes] Fetching all projects");
      
      if (!await validateDatabaseConnection()) {
        throw new Error("Database connection is not available");
      }
      
      await ensurePublicUser();
      
      const allProjects = await db
        .select()
        .from(projects)
        .orderBy(desc(projects.createdAt));
      
      console.log(`[Routes] Successfully fetched ${allProjects.length} projects`);
      res.json(allProjects);
    } catch (error) {
      logError("fetchProjects", error);
      res.status(500).json({ 
        error: "Failed to fetch projects",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      console.log("[Routes] Creating new project");
      
      if (!await validateDatabaseConnection()) {
        throw new Error("Database connection is not available");
      }
      
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
      logError("createProject", error, { requestBody: req.body });
      
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

  // Add dedicated endpoint for updating project notes
  app.put("/api/projects/:id/notes", async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    
    try {
      console.log(`[Routes] Updating notes for project: ${id}`);
      
      if (!await validateDatabaseConnection()) {
        throw new Error("Database connection is not available");
      }
      
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
      });

      if (!project) {
        console.log(`[Routes] Project not found: ${id}`);
        return res.status(404).json({ error: "Project not found" });
      }

      const updatedProject = await db
        .update(projects)
        .set({
          notes,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      console.log(`[Routes] Project notes updated successfully: ${id}`);
      res.json(updatedProject[0]);
    } catch (error) {
      logError("updateProjectNotes", error, { projectId: id, notes });
      res.status(500).json({ 
        error: "Failed to update project notes",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`[Routes] Updating project: ${id}`);
      
      if (!await validateDatabaseConnection()) {
        throw new Error("Database connection is not available");
      }
      
      const projectData = projectSchema.parse(req.body);
      
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
      });

      if (!project) {
        console.log(`[Routes] Project not found: ${id}`);
        return res.status(404).json({ error: "Project not found" });
      }

      const updatedProject = await db
        .update(projects)
        .set({
          ...projectData,
          updatedAt: new Date(),
          userId: 'public'
        })
        .where(eq(projects.id, id))
        .returning();

      console.log(`[Routes] Project updated successfully: ${id}`);
      res.json(updatedProject[0]);
    } catch (error) {
      logError("updateProject", error, { projectId: id, requestBody: req.body });
      
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
      
      if (!await validateDatabaseConnection()) {
        throw new Error("Database connection is not available");
      }
      
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
      logError("deleteProject", error, { projectId: id });
      res.status(500).json({ 
        error: "Failed to delete project",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  // Project backup endpoints
  app.get("/api/projects/export", async (_req, res) => {
    try {
      console.log("[Routes] Exporting all projects");
      
      if (!await validateDatabaseConnection()) {
        throw new Error("Database connection is not available");
      }
      
      const allProjects = await db
        .select()
        .from(projects)
        .orderBy(desc(projects.createdAt));
      
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        projects: allProjects
      };
      
      res.json(exportData);
    } catch (error) {
      logError("exportProjects", error);
      res.status(500).json({ 
        error: "Failed to export projects",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  app.post("/api/projects/import", async (req, res) => {
    try {
      console.log("[Routes] Importing projects");
      
      if (!await validateDatabaseConnection()) {
        throw new Error("Database connection is not available");
      }
      
      const importData = req.body;
      
      if (!Array.isArray(importData.projects)) {
        throw new Error("Invalid import data format");
      }
      
      const results = await Promise.allSettled(
        importData.projects.map(async (project) => {
          const projectData = projectSchema.parse(project);
          return db.insert(projects).values({
            ...projectData,
            id: uuidv4(), // Generate new ID to avoid conflicts
            userId: 'public',
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();
        })
      );
      
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`[Routes] Import completed: ${succeeded} succeeded, ${failed} failed`);
      res.json({ 
        message: "Import completed",
        results: {
          total: results.length,
          succeeded,
          failed
        }
      });
    } catch (error) {
      logError("importProjects", error, { requestBody: req.body });
      res.status(500).json({ 
        error: "Failed to import projects",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  // Health check endpoint with DB validation
  app.get("/api/health", async (_req, res) => {
    try {
      const isDbConnected = await validateDatabaseConnection();
      res.json({ 
        status: isDbConnected ? "ok" : "degraded",
        database: isDbConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logError("healthCheck", error);
      res.status(503).json({ status: "error", error: "Service unavailable" });
    }
  });

  // Global error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Routes] Error:', err);
    res.status(500).json({
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    });
  });
}