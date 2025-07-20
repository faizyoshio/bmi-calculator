import { type NextRequest, NextResponse } from "next/server"
import { StatsRepository } from "@/lib/mysql"

export async function GET(request: NextRequest) {
  try {
    const stats = await StatsRepository.getAppStatistics()

    return NextResponse.json({
      totalUsers: stats.totalUsers,
      namedUsers: stats.namedUsers,
      anonymousUsers: stats.anonymousUsers,
      totalCalculations: stats.totalCalculations,
      recentActivity: stats.recentActivity,
      categoryDistribution: stats.categoryDistribution,
      averageBMIByCategory: stats.avgBMIByCategory,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database stats error:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
