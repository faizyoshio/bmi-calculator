import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mysql"

export async function GET() {
  try {
    const { pool } = await connectToDatabase()
    const connection = await pool.getConnection()

    try {
      // Get comprehensive statistics
      const [userStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_users,
          COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_users,
          AVG(age) as avg_age,
          AVG(current_bmi) as avg_bmi,
          MIN(created_at) as first_user_date,
          MAX(last_calculation) as last_activity
        FROM users 
        WHERE is_anonymous = FALSE
      `)

      const [categoryStats] = await connection.execute(`
        SELECT 
          current_category,
          COUNT(*) as count,
          AVG(current_bmi) as avg_bmi,
          AVG(age) as avg_age
        FROM users 
        WHERE is_anonymous = FALSE 
        GROUP BY current_category
        ORDER BY count DESC
      `)

      const [activityStats] = await connection.execute(`
        SELECT 
          DATE(calculated_at) as date,
          COUNT(*) as calculations
        FROM bmi_history 
        WHERE calculated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(calculated_at)
        ORDER BY date DESC
        LIMIT 30
      `)

      const [recentUsers] = await connection.execute(`
        SELECT name, gender, current_bmi, current_category, created_at
        FROM users 
        WHERE is_anonymous = FALSE 
        ORDER BY created_at DESC 
        LIMIT 10
      `)

      const stats = (userStats as any[])[0]

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalUsers: stats.total_users || 0,
            maleUsers: stats.male_users || 0,
            femaleUsers: stats.female_users || 0,
            averageAge: stats.avg_age ? Number.parseFloat(stats.avg_age.toFixed(1)) : 0,
            averageBmi: stats.avg_bmi ? Number.parseFloat(stats.avg_bmi.toFixed(2)) : 0,
            firstUserDate: stats.first_user_date,
            lastActivity: stats.last_activity,
          },
          categoryBreakdown: (categoryStats as any[]).map((cat) => ({
            category: cat.current_category,
            count: cat.count,
            percentage: stats.total_users > 0 ? ((cat.count / stats.total_users) * 100).toFixed(1) : "0",
            averageBmi: cat.avg_bmi ? Number.parseFloat(cat.avg_bmi.toFixed(2)) : 0,
            averageAge: cat.avg_age ? Number.parseFloat(cat.avg_age.toFixed(1)) : 0,
          })),
          activityTrend: (activityStats as any[]).map((activity) => ({
            date: activity.date,
            calculations: activity.calculations,
          })),
          recentUsers: (recentUsers as any[]).map((user) => ({
            name: user.name,
            gender: user.gender,
            bmi: user.current_bmi ? Number.parseFloat(user.current_bmi.toFixed(2)) : null,
            category: user.current_category,
            joinedAt: user.created_at,
          })),
        },
        generatedAt: new Date().toISOString(),
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Stats generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
