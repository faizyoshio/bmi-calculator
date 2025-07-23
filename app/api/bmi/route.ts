import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    const { name, gender, height, weight, age } = await req.json()

    if (!name || !height || !weight || !age) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)

    let category = ""
    if (bmi < 18.5) {
      category = "Underweight"
    } else if (bmi >= 18.5 && bmi < 24.9) {
      category = "Normal Weight"
    } else if (bmi >= 25 && bmi < 29.9) {
      category = "Overweight"
    } else {
      category = "Obese"
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    // Find if a user with this name already exists
    const existingUser = await usersCollection.findOne({ name })

    if (existingUser) {
      // Update existing user's data
      await usersCollection.updateOne(
        { _id: existingUser._id },
        {
          $set: {
            gender: gender || "unknown", // Default to 'unknown' if not provided
            height: height,
            weight: weight,
            age: age,
            currentBmi: bmi,
            currentCategory: category,
            lastCalculation: new Date(),
          },
          $inc: { calculationCount: 1 },
        },
      )
    } else {
      // Create new user
      await usersCollection.insertOne({
        name,
        gender: gender || "unknown", // Default to 'unknown' if not provided
        height,
        weight,
        age,
        currentBmi: bmi,
        currentCategory: category,
        lastCalculation: new Date(),
        calculationCount: 1,
      })
    }

    return NextResponse.json({ bmi, category, message: "BMI calculated and saved successfully!" })
  } catch (error) {
    console.error("BMI API Error:", error)
    return NextResponse.json({ message: "Failed to calculate BMI. Please try again." }, { status: 500 })
  }
}
