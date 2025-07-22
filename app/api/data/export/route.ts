import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"

    // Build the same filter as the main data endpoint
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const gender = searchParams.get("gender") || ""
    const minAge = searchParams.get("minAge") ? Number.parseInt(searchParams.get("minAge")!) : null
    const maxAge = searchParams.get("maxAge") ? Number.parseInt(searchParams.get("maxAge")!) : null
    const minBmi = searchParams.get("minBmi") ? Number.parseFloat(searchParams.get("minBmi")!) : null
    const maxBmi = searchParams.get("maxBmi") ? Number.parseFloat(searchParams.get("maxBmi")!) : null

    const { db } = await connectToDatabase()
    const collection = db.collection("users")

    // Build filter query
    const filter: any = { isAnonymous: { $ne: true } }

    if (search) filter.name = { $regex: search, $options: "i" }
    if (category) filter.currentCategory = category
    if (gender) filter.gender = gender
    if (minAge !== null || maxAge !== null) {
      filter.age = {}
      if (minAge !== null) filter.age.$gte = minAge
      if (maxAge !== null) filter.age.$lte = maxAge
    }
    if (minBmi !== null || maxBmi !== null) {
      filter.currentBmi = {}
      if (minBmi !== null) filter.currentBmi.$gte = minBmi
      if (maxBmi !== null) filter.currentBmi.$lte = maxBmi
    }

    // Get all matching data (no pagination for export)
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

    const formattedData = data.map((user) => ({
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
      // Convert to CSV
      const headers = [
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
        ...formattedData.map((row) =>
          [
            `"${row.name}"`,
            row.gender,
            row.age,
            row.height,
            row.weight,
            row.currentBmi,
            `"${row.currentCategory}"`,
            new Date(row.lastCalculation).toISOString(),
            row.calculationCount,
          ].join(","),
        ),
      ]

      const csvContent = csvRows.join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="bmi-data-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Default to JSON
    return NextResponse.json({
      data: formattedData,
      exportedAt: new Date().toISOString(),
      totalRecords: formattedData.length,
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
