import mysql from "mysql2/promise"

// MySQL Connection Pool Configuration
// Using connection pooling for better performance and resource management
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections in pool
  queueLimit: 0, // No limit on queued connection requests
  acquireTimeout: 60000, // 60 seconds timeout for acquiring connection
  timeout: 60000, // 60 seconds timeout for queries
  reconnect: true, // Automatically reconnect on connection loss
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

/**
 * Get a database connection from the pool
 * This is the primary function for database operations
 */
export async function connectToDatabase() {
  try {
    const connection = await pool.getConnection()
    console.log("Successfully connected to MySQL database")
    return { connection, pool }
  } catch (error) {
    console.error("Failed to connect to MySQL database:", error)
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Health check function to verify database connectivity
 * Useful for monitoring and debugging
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log("Database health check passed")
    return true
  } catch (error) {
    console.error("MySQL health check failed:", error)
    return false
  }
}

/**
 * Initialize database tables with proper schema
 * This function creates tables if they don't exist
 */
export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection()

    // Create users table with optimized schema
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        gender ENUM('male', 'female') NOT NULL,
        age INT NOT NULL CHECK (age > 0 AND age < 150),
        height DECIMAL(5,2) NOT NULL CHECK (height > 0),
        weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
        current_bmi DECIMAL(4,2) NOT NULL,
        current_category VARCHAR(50) NOT NULL,
        last_calculation TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_anonymous BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Indexes for performance optimization
        INDEX idx_name (name),
        INDEX idx_email (email),
        INDEX idx_gender (gender),
        INDEX idx_category (current_category),
        INDEX idx_last_calculation (last_calculation),
        INDEX idx_is_anonymous (is_anonymous),
        INDEX idx_created_at (created_at),
        
        -- Composite indexes for common queries
        INDEX idx_gender_category (gender, current_category),
        INDEX idx_anonymous_last_calc (is_anonymous, last_calculation)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create bmi_history table for tracking calculation history
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bmi_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        bmi DECIMAL(4,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        height DECIMAL(5,2) NOT NULL,
        weight DECIMAL(5,2) NOT NULL,
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Foreign key constraint
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        
        -- Indexes for performance
        INDEX idx_user_id (user_id),
        INDEX idx_calculated_at (calculated_at),
        INDEX idx_category (category),
        
        -- Composite index for user history queries
        INDEX idx_user_calculated (user_id, calculated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create analytics table for dashboard metrics
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(10,2) NOT NULL,
        metric_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Indexes for analytics queries
        INDEX idx_metric_name (metric_name),
        INDEX idx_metric_date (metric_date),
        INDEX idx_name_date (metric_name, metric_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    connection.release()
    console.log("Database tables initialized successfully")
  } catch (error) {
    console.error("Failed to initialize database:", error)
    throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Execute a query with proper error handling and connection management
 * This is a utility function for safe query execution
 */
export async function executeQuery(query: string, params: any[] = []) {
  let connection
  try {
    connection = await pool.getConnection()
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error("Query execution error:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

/**
 * Get database statistics for monitoring
 */
export async function getDatabaseStats() {
  try {
    const connection = await pool.getConnection()

    const [userCount] = await connection.execute("SELECT COUNT(*) as count FROM users WHERE is_anonymous = FALSE")
    const [historyCount] = await connection.execute("SELECT COUNT(*) as count FROM bmi_history")
    const [recentActivity] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE last_calculation >= DATE_SUB(NOW(), INTERVAL 24 HOUR)",
    )

    connection.release()

    return {
      totalUsers: (userCount as any)[0].count,
      totalCalculations: (historyCount as any)[0].count,
      recentActivity: (recentActivity as any)[0].count,
    }
  } catch (error) {
    console.error("Failed to get database stats:", error)
    return { totalUsers: 0, totalCalculations: 0, recentActivity: 0 }
  }
}

export default pool
