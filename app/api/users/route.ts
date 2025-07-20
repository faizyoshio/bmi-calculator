import { type NextRequest, NextResponse } from "next/server"
import { UserRepository } from "@/lib/mysql"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    const users = await UserRepository.getRecentUsers(limit, skip)
    const totalUsers = await UserRepository.getUserCount()

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
