// Database Explorer Script
// Run with: node scripts/database-explorer.js

const mysql = require("mysql2/promise")

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Faizyw2006",
  database: "bmi_calculator",
  port: 3306,
}

async function exploreDatabase() {
  let connection

  try {
    console.log("🔍 Connecting to BMI Calculator database...")
    connection = await mysql.createConnection(dbConfig)

    // Test connection
    await connection.ping()
    console.log("✅ Database connection successful!\n")

    // Show database info
    const [dbInfo] = await connection.execute("SELECT DATABASE() as current_db, VERSION() as mysql_version")
    console.log("📊 Database Information:")
    console.log(`   Current Database: ${dbInfo[0].current_db}`)
    console.log(`   MySQL Version: ${dbInfo[0].mysql_version}\n`)

    // Show tables
    const [tables] = await connection.execute("SHOW TABLES")
    console.log("📋 Available Tables:")
    tables.forEach((table) => {
      console.log(`   - ${Object.values(table)[0]}`)
    })
    console.log("")

    // Show users count
    const [userCount] = await connection.execute("SELECT COUNT(*) as count FROM users")
    console.log(`👥 Total Users: ${userCount[0].count}`)

    // Show recent users
    const [recentUsers] = await connection.execute(`
      SELECT name, current_bmi, current_category, last_calculation 
      FROM users 
      WHERE name IS NOT NULL 
      ORDER BY last_calculation DESC 
      LIMIT 5
    `)

    if (recentUsers.length > 0) {
      console.log("\n🕒 Recent Users:")
      recentUsers.forEach((user) => {
        console.log(`   - ${user.name}: BMI ${user.current_bmi} (${user.current_category})`)
      })
    }

    // Show BMI statistics
    const [stats] = await connection.execute(`
      SELECT 
        current_category,
        COUNT(*) as count,
        AVG(current_bmi) as avg_bmi
      FROM users 
      WHERE current_category IS NOT NULL 
      GROUP BY current_category
    `)

    if (stats.length > 0) {
      console.log("\n📈 BMI Category Statistics:")
      stats.forEach((stat) => {
        console.log(`   - ${stat.current_category}: ${stat.count} users (avg BMI: ${stat.avg_bmi.toFixed(1)})`)
      })
    }

    console.log("\n🌐 Access Methods:")
    console.log("   - phpMyAdmin: http://localhost/phpmyadmin")
    console.log("   - MySQL CLI: mysql -u root -p")
    console.log("   - This script: node scripts/database-explorer.js")
    console.log("   - API Health: http://localhost:3000/api/health")
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    console.log("\n🔧 Troubleshooting:")
    console.log("   1. Check if MySQL is running: sudo systemctl status mysql")
    console.log("   2. Verify credentials in .env.local file")
    console.log('   3. Ensure database exists: mysql -u root -p -e "SHOW DATABASES;"')
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Run the explorer
exploreDatabase()
