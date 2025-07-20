import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    const users = await db
      .collection("users")
      .find(
        { isAnonymous: { $ne: true } }, // Exclude anonymous users
        {
          projection: {
            // Exclude sensitive information
            lastIpAddress: 0,
            lastUserAgent: 0,
            "bmiHistory.ipAddress": 0,
            "bmiHistory.userAgent": 0,
          },
        },
      )
      .sort({ lastCalculation: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const totalUsers = await db.collection("users").countDocuments({ isAnonymous: { $ne: true } })

    return NextResponse.json({
      users,
      total: totalUsers,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(totalUsers / limit),
    })
  } catch (error) {
    console.error("Database fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
