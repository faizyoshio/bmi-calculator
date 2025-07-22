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
    const minAge = searchParams.get("minAge") ? Number.parseInt(searchParams.get("minAge")!) : null
    const maxAge = searchParams.get("maxAge") ? Number.parseInt(searchParams.get("maxAge")!) : null
    const minBmi = searchParams.get("minBmi") ? Number.parseFloat(searchParams.get("minBmi")!) : null
    const maxBmi = searchParams.get("maxBmi") ? Number.parseFloat(searchParams.get("maxBmi")!) : null

    // Validate format
    if (!["json", "csv"].includes(format)) {
      return NextResponse.json({ error: "Invalid format. Use 'json' or 'csv'" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection("users")

    // Build filter query (same as main database API)
    const filter: any = {}

    if (search) {
      filter.name = { $regex: search, $options: "i" }
    }

    if (category) {
      filter.currentCategory = category
    }

    if (gender) {
      filter.gender = gender
    }

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

    // Exclude anonymous users
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

    // Format data
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

    if (format === "json") {
      return NextResponse.json({
        data: formattedData,
        exportedAt: new Date().toISOString(),
        totalRecords: formattedData.length,
        filters: {
          search,
          category,
          gender,
          minAge,
          maxAge,
          minBmi,
          maxBmi,
        },
      })
    }

    // CSV format
    if (formattedData.length === 0) {
      return new NextResponse("No data to export", {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="bmi-database-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Generate CSV headers
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

    // Generate CSV rows
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
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bmi-database-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Database export error:", error)
    return NextResponse.json({ error: "Failed to export database content" }, { status: 500 })
  }
}
