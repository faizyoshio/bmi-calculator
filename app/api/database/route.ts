import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const sortBy = searchParams.get("sortBy") || "lastCalculation"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const gender = searchParams.get("gender") || ""

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 })
    }

    const validSortFields = [
      "name",
      "gender",
      "age",
      "height",
      "weight",
      "currentBmi",
      "currentCategory",
      "lastCalculation",
    ]
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json({ error: "Invalid sort field" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection("users")

    // Build filter query
    const filter: any = {}

    // Exclude anonymous users from the table view first
    filter.isAnonymous = { $ne: true }

    // Search filter (name contains search term)
    if (search.trim()) {
      filter.name = { $regex: search.trim(), $options: "i" }
    }

    // Category filter
    if (category.trim()) {
      filter.currentCategory = category.trim()
    }

    // Gender filter - ensure exact match and handle case sensitivity
    // Store gender as lowercase to ensure consistent filtering
    if (gender.trim() && (gender.toLowerCase() === "male" || gender.toLowerCase() === "female")) {
      filter.gender = gender.toLowerCase()
    }

    console.log("Database filter query:", JSON.stringify(filter, null, 2))

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Calculate skip value for pagination
    const skip = (page - 1) * limit

    // Execute queries
    const [data, totalCount] = await Promise.all([
      collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .project({
          name: 1,
          gender: 1,
          age: 1,
          height: 1,
          weight: 1,
          currentBmi: 1,
          currentCategory: 1,
          lastCalculation: 1,
          bmiHistory: { $size: { $ifNull: ["$bmiHistory", []] } },
        })
        .toArray(),
      collection.countDocuments(filter),
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Format data for response
    const formattedData = data.map((user) => ({
      id: user._id.toString(),
      name: user.name || "Anonymous",
      // Ensure gender is consistently lowercase for internal logic, but can be capitalized for display
      gender: user.gender ? user.gender.toLowerCase() : "unknown",
      age: user.age || "N/A", // Use "N/A" for missing age
      height: user.height || 0, // Use 0 for missing height
      weight: user.weight || 0, // Use 0 for missing weight
      currentBmi: user.currentBmi ? Number.parseFloat(user.currentBmi.toFixed(2)) : null,
      currentCategory: user.currentCategory || "Unknown",
      lastCalculation: user.lastCalculation || new Date().toISOString(),
      calculationCount: user.bmiHistory || 0,
    }))

    // Get category statistics for filters - exclude anonymous users
    const categoryStats = await collection
      .aggregate([
        { $match: { isAnonymous: { $ne: true }, currentCategory: { $exists: true, $ne: null } } },
        { $group: { _id: "$currentCategory", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    // Get gender statistics for filters - exclude anonymous users and ensure gender exists
    const genderStats = await collection
      .aggregate([
        {
          $match: {
            isAnonymous: { $ne: true },
            gender: { $exists: true, $ne: null, $ne: "" },
            $or: [{ gender: "male" }, { gender: "female" }],
          },
        },
        { $group: { _id: "$gender", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    console.log("Gender statistics from database:", genderStats)

    // Ensure both male and female options are always available, even with 0 counts
    const allGenders = [
      { value: "male", label: "Male", count: 0 },
      { value: "female", label: "Female", count: 0 },
    ]

    // Update counts from database results
    genderStats.forEach((stat) => {
      const genderOption = allGenders.find((g) => g.value === stat._id)
      if (genderOption) {
        genderOption.count = stat.count
      }
    })

    const response = {
      data: formattedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        categories: categoryStats.map((stat) => ({
          value: stat._id,
          count: stat.count,
        })),
        genders: allGenders,
      },
      sort: {
        sortBy,
        sortOrder,
      },
      debug: {
        appliedFilters: filter,
        genderStatsRaw: genderStats,
        totalRecords: await collection.countDocuments({ isAnonymous: { $ne: true } }),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Database query error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch database content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
