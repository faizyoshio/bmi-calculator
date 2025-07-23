import { NextResponse } from "next/server"
import { checkDatabaseHealth, getDatabaseStats, initializeDatabase } from "@/lib/mysql"

export async function GET() {
  try {
    // Check database connectivity
    const isHealthy = await checkDatabaseHealth()

    if (!isHealthy) {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "disconnected",
          timestamp: new Date().toISOString(),
          error: "Database connection failed",
        },
        { status: 503 },
      )
    }

    // Get database statistics
    const stats = await getDatabaseStats()

    // Initialize database if needed (safe operation)
    try {
      await initializeDatabase()
    } catch (initError) {
      console.warn("Database initialization warning:", initError)
      // Don't fail health check if tables already exist
    }

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      statistics: stats,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbConfig: !!(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE),
      },
      uptime: process.uptime(),
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        database: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
