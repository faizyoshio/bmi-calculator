import { NextResponse } from "next/server"
import { checkDatabaseHealth } from "@/lib/mongodb"

export async function GET() {
  try {
    const isHealthy = await checkDatabaseHealth()

    if (isHealthy) {
      return NextResponse.json({
        status: "healthy",
        database: "connected",
        type: "mongodb", // Changed type to mongodb
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "disconnected",
          type: "mongodb", // Changed type to mongodb
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "error",
        type: "mongodb", // Changed type to mongodb
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
