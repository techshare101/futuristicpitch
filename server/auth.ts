import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || uuidv4();

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(' ')[1];
    const { userId } = verifyToken(token);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export async function createUser(email: string, password: string): Promise<{ id: string }> {
  const hashedPassword = await hashPassword(password);
  const userId = uuidv4();

  await db.insert(users).values({
    id: userId,
    email,
    hashedPassword,
    emailVerified: true // For simplicity, marking as verified by default
  });

  return { id: userId };
}