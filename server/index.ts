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

// Create a PostgreSQL connection pool with optimized configuration and connection timeout
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Increased timeout for better reliability
  allowExitOnIdle: true // Allow clean shutdown
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

    // Enhanced error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error('Server error:', {
        status,
        message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      
      res.status(status).json({ 
        message,
        error: app.get('env') === 'development' ? err.stack : undefined
      });
    });

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
