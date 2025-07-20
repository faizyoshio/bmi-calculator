import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { gender, height, weight, age } = await request.json()

    // Validate input
    if (!height || !weight) {
      return NextResponse.json({ error: "Height and weight are required" }, { status: 400 })
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
      category = "Underweight"
      healthTip =
        "Consider consulting a nutritionist to develop a healthy weight gain plan. Focus on nutrient-dense foods and regular exercise to build muscle mass."
      color = "blue"
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Normal"
      healthTip =
        "Great job! Maintain your healthy weight through balanced nutrition and regular physical activity. Keep up the good work!"
      color = "green"
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight"
      healthTip =
        "Consider adopting a balanced diet and increasing physical activity. Small lifestyle changes can make a big difference in your health."
      color = "yellow"
    } else {
      category = "Obese"
      healthTip =
        "We recommend consulting with a healthcare professional to develop a comprehensive weight management plan. Focus on gradual, sustainable changes."
      color = "red"
    }

    // Save to database
    try {
      const { db } = await connectToDatabase()

      const bmiRecord = {
        gender,
        height: heightNum,
        weight: weightNum,
        age: ageNum,
        bmi: Number.parseFloat(bmi.toFixed(2)),
        category,
        timestamp: new Date(),
      }

      await db.collection("bmi_records").insertOne(bmiRecord)
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Continue without failing the request if database save fails
    }

    return NextResponse.json({
      bmi: Number.parseFloat(bmi.toFixed(2)),
      category,
      gender,
      height: heightNum,
      weight: weightNum,
      age: ageNum,
      healthTip,
      color,
    })
  } catch (error) {
    console.error("BMI calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate BMI" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const records = await db.collection("bmi_records").find({}).sort({ timestamp: -1 }).limit(10).toArray()

    return NextResponse.json({ records })
  } catch (error) {
    console.error("Database fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}
