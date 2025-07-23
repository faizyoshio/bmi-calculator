import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mysql"

// BMI calculation function
function calculateBMI(weight: number, height: number): { bmi: number; category: string } {
  const bmi = weight / (height / 100) ** 2

  let category: string
  if (bmi < 18.5) {
    category = "Underweight"
  } else if (bmi < 25) {
    category = "Normal weight"
  } else if (bmi < 30) {
    category = "Overweight"
  } else {
    category = "Obese"
  }

  return { bmi: Number.parseFloat(bmi.toFixed(2)), category }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, gender, age, height, weight } = body

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required and must be a non-empty string" }, { status: 400 })
    }

    if (!gender || !["male", "female"].includes(gender.toLowerCase())) {
      return NextResponse.json({ error: "Gender must be either 'male' or 'female'" }, { status: 400 })
    }

    if (!age || typeof age !== "number" || age <= 0 || age > 150) {
      return NextResponse.json({ error: "Age must be a number between 1 and 150" }, { status: 400 })
    }

    if (!height || typeof height !== "number" || height <= 0 || height > 300) {
      return NextResponse.json({ error: "Height must be a number between 1 and 300 cm" }, { status: 400 })
    }

    if (!weight || typeof weight !== "number" || weight <= 0 || weight > 1000) {
      return NextResponse.json({ error: "Weight must be a number between 1 and 1000 kg" }, { status: 400 })
    }

    // Calculate BMI
    const { bmi, category } = calculateBMI(weight, height)

    // Connect to database
    const { pool } = await connectToDatabase()
    const connection = await pool.getConnection()

    try {
      // Start transaction for data consistency
      await connection.beginTransaction()

      // Check if user exists (by name for simplicity)
      const [existingUsers] = await connection.execute("SELECT id FROM users WHERE name = ? AND gender = ? LIMIT 1", [
        name.trim(),
        gender.toLowerCase(),
      ])

      let userId: number

      if ((existingUsers as any[]).length > 0) {
        // Update existing user
        userId = (existingUsers as any)[0].id
        await connection.execute(
          `UPDATE users SET 
           age = ?, height = ?, weight = ?, current_bmi = ?, 
           current_category = ?, last_calculation = NOW(), updated_at = NOW()
           WHERE id = ?`,
          [age, height, weight, bmi, category, userId],
        )
      } else {
        // Create new user
        const [result] = await connection.execute(
          `INSERT INTO users (name, gender, age, height, weight, current_bmi, current_category, is_anonymous)
           VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
          [name.trim(), gender.toLowerCase(), age, height, weight, bmi, category],
        )
        userId = (result as any).insertId
      }

      // Add to BMI history
      await connection.execute(
        "INSERT INTO bmi_history (user_id, bmi, category, height, weight) VALUES (?, ?, ?, ?, ?)",
        [userId, bmi, category, height, weight],
      )

      // Commit transaction
      await connection.commit()

      // Return success response
      return NextResponse.json({
        success: true,
        data: {
          userId,
          name: name.trim(),
          gender: gender.toLowerCase(),
          age,
          height,
          weight,
          bmi,
          category,
          calculatedAt: new Date().toISOString(),
        },
        message: "BMI calculated and saved successfully",
      })
    } catch (dbError) {
      // Rollback transaction on error
      await connection.rollback()
      throw dbError
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("BMI calculation error:", error)
    return NextResponse.json(
      {
        error: "Failed to calculate and save BMI",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { pool } = await connectToDatabase()
    const connection = await pool.getConnection()

    try {
      // Get user data with calculation history
      const [userData] = await connection.execute(
        `SELECT u.*, 
         (SELECT COUNT(*) FROM bmi_history bh WHERE bh.user_id = u.id) as total_calculations
         FROM users u WHERE u.id = ?`,
        [userId],
      )

      if ((userData as any[]).length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const user = (userData as any)[0]

      // Get BMI history
      const [history] = await connection.execute(
        `SELECT bmi, category, height, weight, calculated_at 
         FROM bmi_history 
         WHERE user_id = ? 
         ORDER BY calculated_at DESC 
         LIMIT 10`,
        [userId],
      )

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            gender: user.gender,
            age: user.age,
            currentBmi: user.current_bmi,
            currentCategory: user.current_category,
            lastCalculation: user.last_calculation,
            totalCalculations: user.total_calculations,
          },
          history: history,
        },
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Failed to fetch BMI data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch BMI data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
