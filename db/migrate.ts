import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from 'pg';
const { Pool } = pkg;

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable must be set');
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Create a PostgreSQL connection pool with improved configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: process.env.SSL_REJECT_UNAUTHORIZED === 'true'
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const db = drizzle(pool);

// Enhanced migration function with retries
async function runMigrations(retryCount = 0) {
  try {
    console.log(`[Migrate] Attempting database migration (attempt ${retryCount + 1}/${MAX_RETRIES})`);
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("[Migrate] Database migrations completed successfully!");
    return true;
  } catch (error) {
    console.error(`[Migrate] Migration attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`[Migrate] Retrying in ${RETRY_DELAY/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return runMigrations(retryCount + 1);
    }
    
    throw new Error(`Failed to complete migrations after ${MAX_RETRIES} attempts`);
  }
}

// Run migrations with enhanced error handling
async function main() {
  console.log("[Migrate] Starting database migration process...");
  
  try {
    // Test database connection before migrations
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log("[Migrate] Database connection test successful");
    
    await runMigrations();
  } catch (error) {
    console.error("[Migrate] Critical migration error:", error);
    process.exit(1);
  } finally {
    try {
      await pool.end();
      console.log("[Migrate] Database pool closed successfully");
    } catch (error) {
      console.error("[Migrate] Error closing database pool:", error);
    }
  }
}

main().catch((err) => {
  console.error("[Migrate] Fatal error during migration process:", err);
  process.exit(1);
});
