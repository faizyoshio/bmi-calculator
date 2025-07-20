import mysql from "mysql2/promise"

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bmi_calculator",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: "utf8mb4",
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Database connection interface
export interface DatabaseConnection {
  query: (sql: string, params?: any[]) => Promise<any>
  execute: (sql: string, params?: any[]) => Promise<any>
  beginTransaction: () => Promise<void>
  commit: () => Promise<void>
  rollback: () => Promise<void>
  release: () => void
}

// Get database connection
export async function getConnection(): Promise<DatabaseConnection> {
  try {
    const connection = await pool.getConnection()

    return {
      query: async (sql: string, params?: any[]) => {
        const [rows] = await connection.query(sql, params)
        return rows
      },
      execute: async (sql: string, params?: any[]) => {
        const [result] = await connection.execute(sql, params)
        return result
      },
      beginTransaction: async () => {
        await connection.beginTransaction()
      },
      commit: async () => {
        await connection.commit()
      },
      rollback: async () => {
        await connection.rollback()
      },
      release: () => {
        connection.release()
      },
    }
  } catch (error) {
    console.error("Database connection error:", error)
    throw new Error("Failed to connect to database")
  }
}

// Execute query with automatic connection management
export async function executeQuery(sql: string, params?: any[]): Promise<any> {
  const connection = await getConnection()
  try {
    return await connection.query(sql, params)
  } finally {
    connection.release()
  }
}

// Execute prepared statement with automatic connection management
export async function executeStatement(sql: string, params?: any[]): Promise<any> {
  const connection = await getConnection()
  try {
    return await connection.execute(sql, params)
  } finally {
    connection.release()
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const connection = await getConnection()
    await connection.query("SELECT 1")
    connection.release()
    return true
  } catch (error) {
    console.error("Database health check failed:", error)
    return false
  }
}

// User-related database operations
export class UserRepository {
  static async findByName(name: string) {
    const sql = "SELECT * FROM users WHERE LOWER(name) = LOWER(?) LIMIT 1"
    const users = await executeQuery(sql, [name])
    return users[0] || null
  }

  static async findById(id: number) {
    const sql = "SELECT * FROM users WHERE id = ? LIMIT 1"
    const users = await executeQuery(sql, [id])
    return users[0] || null
  }

  static async createOrUpdateUser(userData: {
    name?: string
    gender: string
    height: number
    weight: number
    age?: number
    bmi: number
    category: string
  }) {
    const connection = await getConnection()

    try {
      await connection.beginTransaction()

      const result = await connection.execute("CALL UpdateUserBMI(?, ?, ?, ?, ?, ?, ?)", [
        userData.name || null,
        userData.gender,
        userData.height,
        userData.weight,
        userData.age || null,
        userData.bmi,
        userData.category,
      ])

      await connection.commit()
      return result[0][0] // Return the user_id and is_new_user from stored procedure
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static async getUserWithHistory(name: string) {
    const connection = await getConnection()

    try {
      const [userResult, historyResult] = await connection.execute("CALL GetUserWithHistory(?)", [name])

      return {
        user: userResult[0] || null,
        history: historyResult || [],
      }
    } finally {
      connection.release()
    }
  }

  static async deleteUser(name: string) {
    const sql = "DELETE FROM users WHERE LOWER(name) = LOWER(?)"
    const result = await executeStatement(sql, [name])
    return result.affectedRows > 0
  }

  static async getRecentUsers(limit = 10, offset = 0) {
    const sql = `
      SELECT * FROM user_summary 
      WHERE is_anonymous = FALSE 
      ORDER BY last_calculation DESC 
      LIMIT ? OFFSET ?
    `
    return await executeQuery(sql, [limit, offset])
  }

  static async getUserCount() {
    const sql = "SELECT COUNT(*) as total FROM users WHERE is_anonymous = FALSE"
    const result = await executeQuery(sql)
    return result[0].total
  }
}

// BMI History operations
export class BMIHistoryRepository {
  static async getHistoryByUserId(userId: number, limit = 10) {
    const sql = `
      SELECT * FROM bmi_history 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `
    return await executeQuery(sql, [userId, limit])
  }

  static async getRecentHistory(limit = 10) {
    const sql = `
      SELECT bh.*, u.name 
      FROM bmi_history bh
      LEFT JOIN users u ON bh.user_id = u.id
      WHERE u.is_anonymous = FALSE
      ORDER BY bh.timestamp DESC 
      LIMIT ?
    `
    return await executeQuery(sql, [limit])
  }
}

// Statistics operations
export class StatsRepository {
  static async getAppStatistics() {
    const queries = {
      totalUsers: "SELECT COUNT(*) as count FROM users",
      namedUsers: "SELECT COUNT(*) as count FROM users WHERE name IS NOT NULL",
      anonymousUsers: "SELECT COUNT(*) as count FROM users WHERE is_anonymous = TRUE",
      totalCalculations: "SELECT SUM(calculation_count) as total FROM users",
      recentActivity: `
        SELECT COUNT(*) as count FROM users 
        WHERE last_calculation >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `,
      categoryDistribution: `
        SELECT current_category, COUNT(*) as count 
        FROM users 
        WHERE current_category IS NOT NULL 
        GROUP BY current_category
      `,
      avgBMIByCategory: `
        SELECT 
          current_category,
          AVG(current_bmi) as avg_bmi,
          COUNT(*) as count
        FROM users 
        WHERE current_category IS NOT NULL AND current_bmi IS NOT NULL
        GROUP BY current_category
      `,
    }

    const results: any = {}

    for (const [key, sql] of Object.entries(queries)) {
      try {
        const result = await executeQuery(sql)

        if (key === "categoryDistribution" || key === "avgBMIByCategory") {
          results[key] = result.reduce((acc: any, row: any) => {
            if (key === "avgBMIByCategory") {
              acc[row.current_category] = {
                avgBMI: Math.round(row.avg_bmi * 100) / 100,
                count: row.count,
              }
            } else {
              acc[row.current_category] = row.count
            }
            return acc
          }, {})
        } else {
          results[key] = result[0]?.count || result[0]?.total || 0
        }
      } catch (error) {
        console.error(`Error executing query ${key}:`, error)
        results[key] = key.includes("Distribution") || key.includes("ByCategory") ? {} : 0
      }
    }

    return results
  }
}

// User preferences operations
export class UserPreferencesRepository {
  static async getPreferences(userId: number) {
    const sql = "SELECT * FROM user_preferences WHERE user_id = ? LIMIT 1"
    const result = await executeQuery(sql, [userId])
    return result[0] || null
  }

  static async updatePreferences(
    userId: number,
    preferences: {
      language?: string
      completedTips?: string[]
    },
  ) {
    const sql = `
      INSERT INTO user_preferences (user_id, language, completed_tips)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      language = COALESCE(VALUES(language), language),
      completed_tips = COALESCE(VALUES(completed_tips), completed_tips),
      updated_at = CURRENT_TIMESTAMP
    `

    return await executeStatement(sql, [
      userId,
      preferences.language || "en",
      preferences.completedTips ? JSON.stringify(preferences.completedTips) : null,
    ])
  }
}

export default pool
