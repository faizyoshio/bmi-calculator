import { type NextRequest, NextResponse } from "next/server"
import { UserRepository } from "@/lib/mysql"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const name = params.name

    if (!name) {
      return NextResponse.json({ error: "Name parameter is required" }, { status: 400 })
    }

    const result = await UserRepository.getUserWithHistory(name)

    if (!result.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...result.user,
        bmiHistory: result.history,
      },
    })
  } catch (error) {
    console.error("Database fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const name = params.name

    if (!name) {
      return NextResponse.json({ error: "Name parameter is required" }, { status: 400 })
    }

    const deleted = await UserRepository.deleteUser(name)

    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Database delete error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
