const mysql = require('mysql2');

// Create a connection pool with MySQL2 options
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // Default to localhost if environment variable is missing
  user: process.env.DB_USER || 'root',     // Default to 'root' if environment variable is missing
  password: process.env.DB_PASSWORD || '', // Default to an empty password
  database: process.env.DB_NAME || 'test', // Default to 'test' database if environment variable is missing
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0,       // No limit for queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // Keep-alive interval in milliseconds
  connectTimeout: 10000         // Timeout for connection attempts
});

// Get promise-based wrapper for the pool
const promisePool = pool.promise();

/**
 * Execute a database query with optional parameters.
 * Includes retry logic for transient errors.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params] - Optional parameters for the query.
 * @returns {Promise<*>} - Resolves with query results or rejects with an error.
 */
async function executeQuery(query, params = []) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const [results] = await promisePool.execute(query, params);
      return results; // Return results on success
    } catch (error) {
      lastError = error;

      // Log detailed error information
      console.error(`Query attempt ${attempt} failed:`, error.message);

      // Retry if more attempts are available
      if (attempt < maxRetries) {
        const delay = 1000 * attempt; // Exponential backoff
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Throw error after all retries fail
  throw new Error(`Failed to execute query after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

/**
 * Perform a health check on the database connection.
 * @returns {Promise<boolean>} - Resolves `true` if the database is healthy, otherwise `false`.
 */
async function checkDatabaseConnection() {
  try {
    await executeQuery('SELECT 1'); // Simple query for testing
    console.log('Database health check passed.');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return false;
  }
}

// Export the pool and utility functions for external use
module.exports = {
  executeQuery,
  checkDatabaseConnection,
  pool,
  promisePool
};
