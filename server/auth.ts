import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// Email transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): { userId: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: SMTP_USER,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ff00ff; text-align: center;">Welcome to Futuristic Product Pitch Generator!</h1>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: linear-gradient(to right, #ff00ff, #00ffff);
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser: ${verificationUrl}</p>
      </div>
    `,
  });
}

export async function createUser(email: string, password: string): Promise<{ id: string, verificationToken: string }> {
  const hashedPassword = await hashPassword(password);
  const verificationToken = uuidv4();
  const userId = uuidv4();

  await db.insert(users).values({
    id: userId,
    email,
    hashedPassword,
    verificationToken,
    emailVerified: false,
  });

  return { id: userId, verificationToken };
}

export async function verifyEmail(token: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.verificationToken, token),
  });

  if (!user) {
    return false;
  }

  await db
    .update(users)
    .set({ emailVerified: true, verificationToken: null })
    .where(eq(users.id, user.id));

  return true;
}
