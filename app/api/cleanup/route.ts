import { NextResponse } from "next/server"
import { cleanupSensitiveData } from "@/lib/mongodb"

export async function POST() {
  try {
    await cleanupSensitiveData()
    return NextResponse.json({ message: "Sensitive data cleanup completed successfully" })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: "Failed to cleanup sensitive data" }, { status: 500 })
  }
}
