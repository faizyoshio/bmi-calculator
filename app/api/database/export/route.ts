import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mysql"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const gender = searchParams.get("gender") || ""

    // Validate format
    if (!["json", "csv"].includes(format)) {
      return NextResponse.json({ error: "Format must be 'json' or 'csv'" }, { status: 400 })
    }

    const { pool } = await connectToDatabase()
    const connection = await pool.getConnection()

    try {
      // Build WHERE clause (same as main query)
      let whereClause = "WHERE u.is_anonymous = FALSE"
      const queryParams: any[] = []

      if (search.trim()) {
        whereClause += " AND u.name LIKE ?"
        queryParams.push(`%${search.trim()}%`)
      }

      if (category.trim()) {
        whereClause += " AND u.current_category = ?"
        queryParams.push(category.trim())
      }

      if (gender.trim() && ["male", "female"].includes(gender.toLowerCase())) {
        whereClause += " AND u.gender = ?"
        queryParams.push(gender.toLowerCase())
      }

      // Export query - get all matching records
      const exportQuery = `
        SELECT 
          u.id,
          u.name,
          u.gender,
          u.age,
          u.height,
          u.weight,
          u.current_bmi,
          u.current_category,
          u.last_calculation,
          u.created_at,
          COUNT(bh.id) as calculation_count
        FROM users u
        LEFT JOIN bmi_history bh ON u.id = bh.user_id
        ${whereClause}
        GROUP BY u.id, u.name, u.gender, u.age, u.height, u.weight, 
                 u.current_bmi, u.current_category, u.last_calculation, u.created_at
        ORDER BY u.last_calculation DESC
      `

      const [results] = await connection.execute(exportQuery, queryParams)
      const data = results as any[]

      if (format === "csv") {
        // Generate CSV format
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
          "Created At",
          "Total Calculations",
        ]

        const csvRows = [
          headers.join(","),
          ...data.map((row) =>
            [
              row.id,
              `"${row.name}"`, // Wrap in quotes to handle commas in names
              row.gender,
              row.age,
              row.height,
              row.weight,
              row.current_bmi,
              `"${row.current_category}"`,
              row.last_calculation ? new Date(row.last_calculation).toISOString() : "",
              row.created_at ? new Date(row.created_at).toISOString() : "",
              row.calculation_count,
            ].join(","),
          ),
        ]

        const csvContent = csvRows.join("\n")

        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="bmi-database-export-${new Date().toISOString().split("T")[0]}.csv"`,
          },
        })
      } else {
        // JSON format
        const formattedData = data.map((row) => ({
          id: row.id,
          name: row.name,
          gender: row.gender,
          age: row.age,
          height: Number.parseFloat(row.height?.toString() || "0"),
          weight: Number.parseFloat(row.weight?.toString() || "0"),
          currentBmi: row.current_bmi ? Number.parseFloat(row.current_bmi.toString()) : null,
          currentCategory: row.current_category,
          lastCalculation: row.last_calculation ? row.last_calculation.toISOString() : null,
          createdAt: row.created_at ? row.created_at.toISOString() : null,
          calculationCount: Number.parseInt(row.calculation_count?.toString() || "0"),
        }))

        return NextResponse.json({
          success: true,
          data: formattedData,
          metadata: {
            exportedAt: new Date().toISOString(),
            totalRecords: formattedData.length,
            appliedFilters: { search, category, gender },
            format: "json",
          },
        })
      }
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      {
        error: "Failed to export database content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
