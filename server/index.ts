import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add error handling for database connection
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable must be set');
}

const getSslConfig = () => {
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }
  return {
    rejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED === 'false' ? false : true,
    ca: process.env.POSTGRES_SSL_CA,
    cert: process.env.POSTGRES_SSL_CERT,
    key: process.env.POSTGRES_SSL_KEY,
  };
};

// Create a PostgreSQL connection pool with improved configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(),
  max: process.env.NODE_ENV === 'production' ? 20 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  application_name: 'product-pitch-generator',
});

// Maximum number of connection retries
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds
const MAX_TIMEOUT = 30000; // 30 seconds total timeout

// Function to test database connection with improved retry logic
const testDatabaseConnection = async (retries = MAX_RETRIES): Promise<void> => {
  const startTime = Date.now();
  
  const attemptConnection = async (attempt: number): Promise<void> => {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1'); // Test query
      client.release();
      console.log('Database connected successfully');
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${MAX_RETRIES} failed:`, error);
      
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime >= MAX_TIMEOUT) {
        throw new Error(`Database connection attempts timed out after ${MAX_TIMEOUT}ms`);
      }
      
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        await attemptConnection(attempt + 1);
      } else {
        throw new Error(`Failed to connect to database after ${MAX_RETRIES} attempts`);
      }
    }
  };

  await attemptConnection(1);
};

export const db = drizzle(pool);

// Enhanced graceful shutdown function
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Set a timeout for the shutdown process
    const shutdownTimeout = setTimeout(() => {
      console.error('Shutdown timed out, forcing exit');
      process.exit(1);
    }, 10000);

    // Close the database pool
    await pool.end();
    console.log('Database connections closed successfully');
    
    // Clear the timeout as shutdown was successful
    clearTimeout(shutdownTimeout);
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Setup cleanup handlers with error handling
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(1);
});

(async () => {
  try {
    // Test database connection before starting the server
    await testDatabaseConnection();
    
    registerRoutes(app);
    const server = createServer(app);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      console.log(`${formattedTime} [express] serving on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
