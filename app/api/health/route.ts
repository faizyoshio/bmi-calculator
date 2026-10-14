import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabase()
    let dbStatus = "not_configured"

    if (supabase) {
      const { error } = await supabase.from("bmi_records").select("id").limit(1)
      dbStatus = error ? `error: ${error.message}` : "connected"
    }

    return NextResponse.json({
      status: "healthy",
      service: "bmi-calculator",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

