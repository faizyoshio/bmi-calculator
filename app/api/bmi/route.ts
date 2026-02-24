import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, gender, height, weight, age } = await req.json()

    // Basic validation
    if (!height || !weight) {
      return NextResponse.json({ error: "Height and weight are required." }, { status: 400 })
    }

    const parsedHeight = Number.parseFloat(height)
    const parsedWeight = Number.parseFloat(weight)
    const parsedAge = age ? Number.parseInt(age, 10) : null

    if (isNaN(parsedHeight) || isNaN(parsedWeight) || parsedHeight <= 0 || parsedWeight <= 0) {
      return NextResponse.json({ error: "Invalid height or weight provided." }, { status: 400 })
    }
    if (parsedAge !== null && (isNaN(parsedAge) || parsedAge <= 0)) {
      return NextResponse.json({ error: "Invalid age provided." }, { status: 400 })
    }

    // Calculate BMI
    const bmi = parsedWeight / ((parsedHeight / 100) * (parsedHeight / 100)) // Height in cm, convert to meters

    let category = ""
    if (bmi < 18.5) {
      category = "Underweight"
    } else if (bmi >= 18.5 && bmi < 24.9) {
      category = "Normal"
    } else if (bmi >= 25 && bmi < 29.9) {
      category = "Overweight"
    } else {
      category = "Obese"
    }

    // Determine health tip based on category
    let healthTip = ""
    switch (category) {
      case "Underweight":
        healthTip =
          "Consider consulting a nutritionist to develop a healthy weight gain plan. Focus on nutrient-dense foods and regular exercise to build muscle mass."
        break
      case "Normal":
        healthTip =
          "Great job! Maintain your healthy weight through balanced nutrition and regular physical activity. Keep up the good work!"
        break
      case "Overweight":
        healthTip =
          "Consider adopting a balanced diet and increasing physical activity. Small lifestyle changes can make a big difference in your health."
        break
      case "Obese":
        healthTip =
          "We recommend consulting with a healthcare professional to develop a comprehensive weight management plan. Focus on gradual, sustainable changes."
        break
      default:
        healthTip = "No specific health tip available for this category."
    }

    return NextResponse.json(
      {
        bmi,
        category,
        healthTip,
        gender: gender || "unknown",
        height: parsedHeight,
        weight: parsedWeight,
        age: parsedAge,
        name: name || "Anonymous",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("BMI API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
