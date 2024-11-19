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
const MAX_POOL_SIZE = process.env.NODE_ENV === 'production' ? 20 : 10;
const IDLE_TIMEOUT = 30000; // 30 seconds
const CONNECTION_TIMEOUT = 10000; // 10 seconds

// Enhanced SSL configuration based on environment
const getSslConfig = () => {
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }

  return {
    rejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED === 'false' ? false : true,
    ca: process.env.POSTGRES_SSL_CA,
    key: process.env.POSTGRES_SSL_KEY,
    cert: process.env.POSTGRES_SSL_CERT,
  };
};

// Create a PostgreSQL connection pool with improved configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(),
  max: MAX_POOL_SIZE,
  idleTimeoutMillis: IDLE_TIMEOUT,
  connectionTimeoutMillis: CONNECTION_TIMEOUT,
  application_name: 'product-pitch-generator',
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Add event listeners for pool events
pool.on('error', (err) => {
  console.error('[Migrate] Unexpected error on idle client:', err);
});

pool.on('connect', () => {
  console.log('[Migrate] New client connected to the pool');
});

pool.on('acquire', () => {
  console.log('[Migrate] Client acquired from pool');
});

pool.on('remove', () => {
  console.log('[Migrate] Client removed from pool');
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

// Enhanced health check function
async function checkDatabaseHealth(): Promise<boolean> {
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('[Migrate] Database health check failed:', error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Run migrations with enhanced error handling and cleanup
async function main() {
  console.log("[Migrate] Starting database migration process...");
  let client;
  
  try {
    // Test database connection before migrations
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }
    
    console.log("[Migrate] Database health check passed");
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

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error("[Migrate] Uncaught exception:", error);
  try {
    await pool.end();
    console.log("[Migrate] Database pool closed due to uncaught exception");
  } catch (err) {
    console.error("[Migrate] Error closing pool after uncaught exception:", err);
  }
  process.exit(1);
});

main().catch((err) => {
  console.error("[Migrate] Fatal error during migration process:", err);
  process.exit(1);
});
