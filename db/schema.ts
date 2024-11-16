import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  emailVerified: boolean('email_verified').default(false),
  verificationToken: text('verification_token'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  stripeCustomerId: text('stripe_customer_id'),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);

// Custom schemas for API requests
export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const verifyEmailSchema = z.object({
  token: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type SelectSubscription = z.infer<typeof selectSubscriptionSchema>;
