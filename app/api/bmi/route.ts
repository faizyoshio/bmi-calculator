import { type NextRequest, NextResponse } from "next/server"
import { UserRepository } from "@/lib/mysql"

export async function POST(request: NextRequest) {
  try {
    const { name, gender, height, weight, age } = await request.json()

    // Validate input
    if (!height || !weight) {
      return NextResponse.json({ error: "Height and weight are required" }, { status: 400 })
    }

    // Validate name if provided
    if (name && (typeof name !== "string" || name.length < 2 || name.length > 50)) {
      return NextResponse.json({ error: "Name must be between 2-50 characters" }, { status: 400 })
    }

    if (name && !/^[a-zA-Z\s]+$/.test(name)) {
      return NextResponse.json({ error: "Name can only contain letters and spaces" }, { status: 400 })
    }

    const heightNum = Number.parseFloat(height)
    const weightNum = Number.parseFloat(weight)
    const ageNum = age ? Number.parseFloat(age) : undefined

    if (heightNum <= 0 || weightNum <= 0) {
      return NextResponse.json({ error: "Height and weight must be positive numbers" }, { status: 400 })
    }

    // Calculate BMI
    const heightInMeters = heightNum / 100
    const bmi = weightNum / (heightInMeters * heightInMeters)

    // Determine BMI category
    let category = ""
    let healthTip = ""
    let color = ""

    if (bmi < 18.5) {
      category = "underweight"
      healthTip =
        "Consider consulting a nutritionist to develop a healthy weight gain plan. Focus on nutrient-dense foods and regular exercise to build muscle mass."
      color = "blue"
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "normal"
      healthTip =
        "Great job! Maintain your healthy weight through balanced nutrition and regular physical activity. Keep up the good work!"
      color = "green"
    } else if (bmi >= 25 && bmi < 30) {
      category = "overweight"
      healthTip =
        "Consider adopting a balanced diet and increasing physical activity. Small lifestyle changes can make a big difference in your health."
      color = "yellow"
    } else {
      category = "obese"
      healthTip =
        "We recommend consulting with a healthcare professional to develop a comprehensive weight management plan. Focus on gradual, sustainable changes."
      color = "red"
    }

    // Save to MySQL database
    try {
      const result = await UserRepository.createOrUpdateUser({
        name: name?.trim() || undefined,
        gender,
        height: heightNum,
        weight: weightNum,
        age: ageNum,
        bmi: Number.parseFloat(bmi.toFixed(2)),
        category,
      })

      console.log(`User record ${result.is_new_user ? "created" : "updated"} successfully`)

      return NextResponse.json({
        bmi: Number.parseFloat(bmi.toFixed(2)),
        category,
        gender,
        height: heightNum,
        weight: weightNum,
        age: ageNum,
        name: name || null,
        healthTip,
        color,
        saved: true,
        userId: result.user_id,
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Continue without failing the request if database save fails
      return NextResponse.json(
        {
          bmi: Number.parseFloat(bmi.toFixed(2)),
          category,
          gender,
          height: heightNum,
          weight: weightNum,
          age: ageNum,
          name: name || null,
          healthTip,
          color,
          warning: "Data calculated successfully but not saved to database",
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("BMI calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate BMI" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")

    if (name) {
      // Get specific user with history
      const result = await UserRepository.getUserWithHistory(name)
      if (!result.user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Transform history to match previous API format
      const records = result.history.map((calculation: any) => ({
        ...calculation,
        name: result.user.name,
        userId: result.user.id,
      }))

      return NextResponse.json({ records, count: records.length })
    } else {
      // Get recent calculations from all users
      const records = await UserRepository.getRecentUsers(10)
      return NextResponse.json({ records, count: records.length })
    }
  } catch (error) {
    console.error("Database fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}
