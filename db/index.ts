import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "./schema";

// Create a PostgreSQL connection pool using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some deployment platforms
  }
});

// Create drizzle database instance
export const db = drizzle(pool, { schema });

// Function to test database connection
export const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};
