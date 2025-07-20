import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const { db } = await connectToDatabase()
    const name = params.name

    if (!name) {
      return NextResponse.json({ error: "Name parameter is required" }, { status: 400 })
    }

    const user = await db.collection("users").findOne(
      { name: { $regex: new RegExp(`^${name}$`, "i") } },
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Database fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const { db } = await connectToDatabase()
    const name = params.name

    if (!name) {
      return NextResponse.json({ error: "Name parameter is required" }, { status: 400 })
    }

    const result = await db.collection("users").deleteOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Database delete error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
