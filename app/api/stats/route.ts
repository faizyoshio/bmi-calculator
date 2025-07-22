import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Get statistics from users collection
    const totalUsers = await db.collection("users").countDocuments()
    const namedUsers = await db.collection("users").countDocuments({ name: { $ne: null } })
    const anonymousUsers = await db.collection("users").countDocuments({ isAnonymous: true })

    // Get BMI category distribution
    const categoryStats = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "$currentCategory",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Get total calculations
    const totalCalculations = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$calculationCount" },
          },
        },
      ])
      .toArray()

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = await db.collection("users").countDocuments({
      lastCalculation: { $gte: sevenDaysAgo },
    })

    // Get average BMI by category
    const avgBMIStats = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "$currentCategory",
            avgBMI: { $avg: "$currentBMI" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      totalUsers,
      namedUsers,
      anonymousUsers,
      totalCalculations: totalCalculations[0]?.total || 0,
      recentActivity,
      categoryDistribution: categoryStats.reduce((acc: any, stat: any) => {
        acc[stat._id] = stat.count
        return acc
      }, {}),
      averageBMIByCategory: avgBMIStats.reduce((acc: any, stat: any) => {
        acc[stat._id] = {
          avgBMI: Math.round(stat.avgBMI * 100) / 100,
          count: stat.count,
        }
        return acc
      }, {}),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database stats error:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
