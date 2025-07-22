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
    const minAge = searchParams.get("minAge") ? Number.parseInt(searchParams.get("minAge")!) : null
    const maxAge = searchParams.get("maxAge") ? Number.parseInt(searchParams.get("maxAge")!) : null
    const minBmi = searchParams.get("minBmi") ? Number.parseFloat(searchParams.get("minBmi")!) : null
    const maxBmi = searchParams.get("maxBmi") ? Number.parseFloat(searchParams.get("maxBmi")!) : null

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

    // Search filter (name contains search term)
    if (search) {
      filter.name = { $regex: search, $options: "i" }
    }

    // Category filter
    if (category) {
      filter.currentCategory = category
    }

    // Gender filter
    if (gender) {
      filter.gender = gender
    }

    // Age range filter
    if (minAge !== null || maxAge !== null) {
      filter.age = {}
      if (minAge !== null) filter.age.$gte = minAge
      if (maxAge !== null) filter.age.$lte = maxAge
    }

    // BMI range filter
    if (minBmi !== null || maxBmi !== null) {
      filter.currentBmi = {}
      if (minBmi !== null) filter.currentBmi.$gte = minBmi
      if (maxBmi !== null) filter.currentBmi.$lte = maxBmi
    }

    // Exclude anonymous users from the table view
    filter.isAnonymous = { $ne: true }

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
          bmiHistory: { $size: "$bmiHistory" },
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
      gender: user.gender,
      age: user.age || "N/A",
      height: user.height,
      weight: user.weight,
      currentBmi: user.currentBmi ? Number.parseFloat(user.currentBmi.toFixed(2)) : null,
      currentCategory: user.currentCategory,
      lastCalculation: user.lastCalculation,
      calculationCount: user.bmiHistory || 0,
    }))

    // Get category statistics for filters
    const categoryStats = await collection
      .aggregate([
        { $match: { isAnonymous: { $ne: true } } },
        { $group: { _id: "$currentCategory", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray()

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
        genders: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ],
      },
      sort: {
        sortBy,
        sortOrder,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Database query error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
