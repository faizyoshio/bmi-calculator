import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

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

    // Save to users collection only
    try {
      const { db } = await connectToDatabase()

      const currentCalculation = {
        gender,
        height: heightNum,
        weight: weightNum,
        age: ageNum,
        bmi: Number.parseFloat(bmi.toFixed(2)),
        category,
        timestamp: new Date(),
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      }

      if (name) {
        // If name is provided, update or create user record
        const result = await db.collection("users").updateOne(
          { name: name.trim().toLowerCase() },
          {
            $set: {
              name: name.trim(),
              lastCalculation: new Date(),
              currentBMI: Number.parseFloat(bmi.toFixed(2)),
              currentCategory: category,
              currentHeight: heightNum,
              currentWeight: weightNum,
              currentAge: ageNum,
              currentGender: gender,
              lastIpAddress: currentCalculation.ipAddress,
              lastUserAgent: currentCalculation.userAgent,
            },
            $inc: { calculationCount: 1 },
            $push: {
              bmiHistory: {
                $each: [currentCalculation],
                $slice: -10, // Keep only last 10 calculations
              },
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true },
        )

        console.log(`User record updated successfully for: ${name}`)
      } else {
        // If no name provided, create anonymous user record
        const anonymousUser = {
          name: null,
          isAnonymous: true,
          createdAt: new Date(),
          lastCalculation: new Date(),
          currentBMI: Number.parseFloat(bmi.toFixed(2)),
          currentCategory: category,
          currentHeight: heightNum,
          currentWeight: weightNum,
          currentAge: ageNum,
          currentGender: gender,
          calculationCount: 1,
          bmiHistory: [currentCalculation],
          lastIpAddress: currentCalculation.ipAddress,
          lastUserAgent: currentCalculation.userAgent,
        }

        await db.collection("users").insertOne(anonymousUser)
        console.log("Anonymous user record created successfully")
      }
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
    })
  } catch (error) {
    console.error("BMI calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate BMI" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")

    let query = {}
    if (name) {
      query = { name: { $regex: name, $options: "i" } }
    } else {
      // If no name specified, get recent calculations from all users
      query = { isAnonymous: { $ne: true } } // Exclude anonymous users for privacy
    }

    const users = await db
      .collection("users")
      .find(query)
      .sort({ lastCalculation: -1 })
      .limit(10)
      .project({
        // Exclude sensitive information from public API
        lastIpAddress: 0,
        lastUserAgent: 0,
        "bmiHistory.ipAddress": 0,
        "bmiHistory.userAgent": 0,
      })
      .toArray()

    // Transform data to match previous API format
    const records = users
      .flatMap(
        (user) =>
          user.bmiHistory?.map((calculation: any) => ({
            ...calculation,
            name: user.name,
            userId: user._id,
          })) || [],
      )
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ records: records.slice(0, 10), count: records.length })
  } catch (error) {
    console.error("Database fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}
