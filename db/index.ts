import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "./schema";

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable must be set');
}

// Create a PostgreSQL connection pool using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: process.env.SSL_REJECT_UNAUTHORIZED === 'true'
  } : false
});

// Create drizzle database instance
export const db = drizzle(pool, { schema });

// Function to test database connection
export const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// Function to close database connection
export const closeConnection = async () => {
  await pool.end();
  console.log('Database connection closed');
};
