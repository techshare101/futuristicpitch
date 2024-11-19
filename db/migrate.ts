import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from 'pg';
const { Pool } = pkg;

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable must be set');
}

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 30000; // 30 seconds

// Create a PostgreSQL connection pool with improved configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: process.env.SSL_REJECT_UNAUTHORIZED === 'true'
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  application_name: 'product-pitch-generator',
});

// Add event listeners for pool events
pool.on('error', (err) => {
  console.error('[Migrate] Unexpected error on idle client:', err);
});

pool.on('connect', () => {
  console.log('[Migrate] New client connected to the pool');
});

const db = drizzle(pool);

// Enhanced migration function with exponential backoff
async function runMigrations(retryCount = 0): Promise<boolean> {
  const retryDelay = Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
    MAX_RETRY_DELAY
  );

  try {
    console.log(`[Migrate] Attempting database migration (attempt ${retryCount + 1}/${MAX_RETRIES})`);
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("[Migrate] Database migrations completed successfully!");
    return true;
  } catch (error) {
    console.error(`[Migrate] Migration attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`[Migrate] Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return runMigrations(retryCount + 1);
    }
    
    throw new Error(`Failed to complete migrations after ${MAX_RETRIES} attempts: ${error}`);
  }
}

// Run migrations with enhanced error handling and cleanup
async function main() {
  console.log("[Migrate] Starting database migration process...");
  let client;
  
  try {
    // Test database connection before migrations
    client = await pool.connect();
    await client.query('SELECT version()');
    console.log("[Migrate] Database connection test successful");
    client.release();
    
    await runMigrations();
  } catch (error) {
    console.error("[Migrate] Critical migration error:", error);
    if (client) {
      client.release(true); // Release with error
    }
    process.exit(1);
  } finally {
    try {
      // Ensure all connections are properly closed
      await pool.end();
      console.log("[Migrate] Database pool closed successfully");
    } catch (error) {
      console.error("[Migrate] Error closing database pool:", error);
      process.exit(1);
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log("[Migrate] Database pool closed due to application termination");
    process.exit(0);
  } catch (error) {
    console.error("[Migrate] Error during graceful shutdown:", error);
    process.exit(1);
  }
});

main().catch((err) => {
  console.error("[Migrate] Fatal error during migration process:", err);
  process.exit(1);
});
