import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mysql"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract and validate query parameters
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") || "10")))
    const sortBy = searchParams.get("sortBy") || "last_calculation"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const gender = searchParams.get("gender") || ""

    // Validate sort parameters
    const validSortFields = [
      "name",
      "gender",
      "age",
      "height",
      "weight",
      "current_bmi",
      "current_category",
      "last_calculation",
      "created_at",
    ]

    // Convert camelCase to snake_case for database compatibility
    const dbSortBy =
      sortBy === "currentBmi"
        ? "current_bmi"
        : sortBy === "currentCategory"
          ? "current_category"
          : sortBy === "lastCalculation"
            ? "last_calculation"
            : sortBy === "createdAt"
              ? "created_at"
              : sortBy

    if (!validSortFields.includes(dbSortBy)) {
      return NextResponse.json({ error: "Invalid sort field" }, { status: 400 })
    }

    if (!["asc", "desc"].includes(sortOrder.toLowerCase())) {
      return NextResponse.json({ error: "Sort order must be 'asc' or 'desc'" }, { status: 400 })
    }

    const { pool } = await connectToDatabase()
    const connection = await pool.getConnection()

    try {
      // Build dynamic WHERE clause with parameterized queries
      let whereClause = "WHERE u.is_anonymous = FALSE"
      const queryParams: any[] = []

      // Search filter - search in name
      if (search.trim()) {
        whereClause += " AND u.name LIKE ?"
        queryParams.push(`%${search.trim()}%`)
      }

      // Category filter
      if (category.trim()) {
        whereClause += " AND u.current_category = ?"
        queryParams.push(category.trim())
      }

      // Gender filter with validation
      if (gender.trim() && ["male", "female"].includes(gender.toLowerCase())) {
        whereClause += " AND u.gender = ?"
        queryParams.push(gender.toLowerCase())
      }

      console.log("Database query WHERE clause:", whereClause)
      console.log("Query parameters:", queryParams)

      // Calculate offset for pagination
      const offset = (page - 1) * limit

      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`
      const [countResult] = await connection.execute(countQuery, queryParams)
      const totalCount = (countResult as any)[0].total

      // Main query with JOIN to get calculation count
      const dataQuery = `
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
        ORDER BY u.${dbSortBy} ${sortOrder.toUpperCase()}
        LIMIT ? OFFSET ?
      `

      const [users] = await connection.execute(dataQuery, [...queryParams, limit, offset])

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      // Format data for response
      const formattedData = (users as any[]).map((user) => ({
        id: user.id.toString(),
        name: user.name || "Anonymous",
        gender: user.gender || "unknown",
        age: user.age || "N/A",
        height: Number.parseFloat(user.height?.toString() || "0"),
        weight: Number.parseFloat(user.weight?.toString() || "0"),
        currentBmi: user.current_bmi ? Number.parseFloat(user.current_bmi.toString()) : null,
        currentCategory: user.current_category || "Unknown",
        lastCalculation: user.last_calculation ? user.last_calculation.toISOString() : new Date().toISOString(),
        createdAt: user.created_at ? user.created_at.toISOString() : new Date().toISOString(),
        calculationCount: Number.parseInt(user.calculation_count?.toString() || "0"),
      }))

      // Get filter options for UI
      // Category statistics
      const [categoryStats] = await connection.execute(`
        SELECT current_category as category, COUNT(*) as count 
        FROM users 
        WHERE is_anonymous = FALSE AND current_category IS NOT NULL 
        GROUP BY current_category 
        ORDER BY current_category
      `)

      // Gender statistics
      const [genderStatsRaw] = await connection.execute(`
        SELECT gender, COUNT(*) as count 
        FROM users 
        WHERE is_anonymous = FALSE AND gender IS NOT NULL 
        GROUP BY gender 
        ORDER BY gender
      `)

      // Ensure both gender options are available
      const allGenders = [
        { value: "male", label: "Male", count: 0 },
        { value: "female", label: "Female", count: 0 },
      ]

      // Update counts from database results
      ;(genderStatsRaw as any[]).forEach((stat) => {
        const genderOption = allGenders.find((g) => g.value === stat.gender)
        if (genderOption) {
          genderOption.count = stat.count
        }
      })

      // Prepare response
      const response = {
        success: true,
        data: formattedData,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
          offset,
        },
        filters: {
          categories: (categoryStats as any[]).map((stat) => ({
            value: stat.category,
            label: stat.category,
            count: stat.count,
          })),
          genders: allGenders,
        },
        sort: {
          sortBy,
          sortOrder,
        },
        metadata: {
          queryExecutionTime: Date.now(),
          appliedFilters: { search, category, gender },
          totalRecordsInDatabase: totalCount,
        },
      }

      return NextResponse.json(response)
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Database query error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch database content",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// POST endpoint for bulk operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (action === "bulk_delete" && Array.isArray(data.ids)) {
      const { pool } = await connectToDatabase()
      const connection = await pool.getConnection()

      try {
        await connection.beginTransaction()

        // Delete from bmi_history first (foreign key constraint)
        await connection.execute(
          `DELETE FROM bmi_history WHERE user_id IN (${data.ids.map(() => "?").join(",")})`,
          data.ids,
        )

        // Delete from users
        const [result] = await connection.execute(
          `DELETE FROM users WHERE id IN (${data.ids.map(() => "?").join(",")}) AND is_anonymous = FALSE`,
          data.ids,
        )

        await connection.commit()

        return NextResponse.json({
          success: true,
          message: `Successfully deleted ${(result as any).affectedRows} records`,
          deletedCount: (result as any).affectedRows,
        })
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    }

    return NextResponse.json({ error: "Invalid action or data" }, { status: 400 })
  } catch (error) {
    console.error("Bulk operation error:", error)
    return NextResponse.json(
      {
        error: "Failed to perform bulk operation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
