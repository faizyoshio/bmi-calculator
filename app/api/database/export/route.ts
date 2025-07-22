import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const format = searchParams.get("format") || "json"
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const gender = searchParams.get("gender") || ""

    // Validate format
    if (!["json", "csv"].includes(format)) {
      return NextResponse.json({ error: "Invalid export format" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection("users")

    // Build filter query
    const filter: any = {}

    // Search filter (name contains search term)
    if (search) {
      filter.name = { $regex: search, $options: "i" }
    }

    // Category filter
    if (category) {
      filter.currentCategory = category
    }

    // Gender filter - ensure exact match
    if (gender && (gender === "male" || gender === "female")) {
      filter.gender = gender
    }

    // Exclude anonymous users from export
    filter.isAnonymous = { $ne: true }

    // Fetch all matching data (no pagination for export)
    const data = await collection
      .find(filter)
      .sort({ lastCalculation: -1 })
      .project({
        name: 1,
        gender: 1,
        age: 1,
        height: 1,
        weight: 1,
        currentBmi: 1,
        currentCategory: 1,
        lastCalculation: 1,
        bmiHistory: { $size: "$bmiHistory" },
      })
      .toArray()

    // Format data for export
    const formattedData = data.map((user) => ({
      id: user._id.toString(),
      name: user.name || "Anonymous",
      gender: user.gender,
      age: user.age || "N/A",
      height: user.height,
      weight: user.weight,
      currentBmi: user.currentBmi ? Number.parseFloat(user.currentBmi.toFixed(2)) : null,
      currentCategory: user.currentCategory,
      lastCalculation: user.lastCalculation,
      calculationCount: user.bmiHistory || 0,
    }))

    if (format === "csv") {
      // Convert to CSV format
      const headers = [
        "ID",
        "Name",
        "Gender",
        "Age",
        "Height (cm)",
        "Weight (kg)",
        "BMI",
        "Category",
        "Last Calculation",
        "Total Calculations",
      ]

      const csvRows = [
        headers.join(","),
        ...formattedData.map((user) =>
          [
            user.id,
            `"${user.name}"`,
            user.gender,
            user.age,
            user.height,
            user.weight,
            user.currentBmi || "N/A",
            `"${user.currentCategory}"`,
            new Date(user.lastCalculation).toLocaleDateString(),
            user.calculationCount,
          ].join(","),
        ),
      ]

      const csvContent = csvRows.join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="bmi-database-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Return JSON format
    return NextResponse.json({
      exportDate: new Date().toISOString(),
      totalRecords: formattedData.length,
      filters: {
        search: search || null,
        category: category || null,
        gender: gender || null,
      },
      data: formattedData,
    })
  } catch (error) {
    console.error("Database export error:", error)
    return NextResponse.json({ error: "Failed to export database content" }, { status: 500 })
  }
}
