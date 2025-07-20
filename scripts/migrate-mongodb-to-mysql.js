// MongoDB to MySQL Migration Script
// Run this with: node scripts/migrate-mongodb-to-mysql.js

const { MongoClient } = require("mongodb")
const mysql = require("mysql2/promise")

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || "your-mongodb-connection-string"
const MYSQL_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bmi_calculator",
  port: process.env.DB_PORT || 3306,
}

async function migrateMongoDB() {
  let mongoClient
  let mysqlConnection

  try {
    console.log("🚀 Starting MongoDB to MySQL migration...")

    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...")
    mongoClient = new MongoClient(MONGODB_URI)
    await mongoClient.connect()
    const mongoDb = mongoClient.db("bmi_calculator")

    // Connect to MySQL
    console.log("🐬 Connecting to MySQL...")
    mysqlConnection = await mysql.createConnection(MYSQL_CONFIG)

    // Get MongoDB collections
    const usersCollection = mongoDb.collection("users")
    const users = await usersCollection.find({}).toArray()

    console.log(`📊 Found ${users.length} users to migrate`)

    let migratedUsers = 0
    let migratedHistoryRecords = 0

    // Migrate each user
    for (const user of users) {
      try {
        // Insert user into MySQL
        const [userResult] = await mysqlConnection.execute(
          `
          INSERT INTO users (
            name, is_anonymous, created_at, last_calculation,
            current_bmi, current_category, current_height, current_weight,
            current_age, current_gender, calculation_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            user.name || null,
            user.isAnonymous || false,
            user.createdAt || new Date(),
            user.lastCalculation || new Date(),
            user.currentBMI || null,
            user.currentCategory || null,
            user.currentHeight || null,
            user.currentWeight || null,
            user.currentAge || null,
            user.currentGender || null,
            user.calculationCount || 1,
          ],
        )

        const mysqlUserId = userResult.insertId
        migratedUsers++

        // Migrate BMI history if exists
        if (user.bmiHistory && Array.isArray(user.bmiHistory)) {
          for (const history of user.bmiHistory) {
            await mysqlConnection.execute(
              `
              INSERT INTO bmi_history (
                user_id, gender, height, weight, age, bmi, category, timestamp
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
              [
                mysqlUserId,
                history.gender,
                history.height,
                history.weight,
                history.age || null,
                history.bmi,
                history.category,
                history.timestamp || new Date(),
              ],
            )
            migratedHistoryRecords++
          }
        }

        console.log(`✅ Migrated user: ${user.name || "Anonymous"} (${migratedUsers}/${users.length})`)
      } catch (userError) {
        console.error(`❌ Error migrating user ${user.name || "Anonymous"}:`, userError.message)
      }
    }

    // Update statistics
    await mysqlConnection.execute(
      `
      INSERT INTO app_statistics (metric_name, metric_value) VALUES (?, ?)
    `,
      [
        "migration_completed",
        JSON.stringify({
          migrated_users: migratedUsers,
          migrated_history_records: migratedHistoryRecords,
          completed_at: new Date(),
          source: "mongodb",
        }),
      ],
    )

    console.log("🎉 Migration completed successfully!")
    console.log(`📈 Statistics:`)
    console.log(`   - Users migrated: ${migratedUsers}`)
    console.log(`   - History records migrated: ${migratedHistoryRecords}`)
  } catch (error) {
    console.error("💥 Migration failed:", error)
    throw error
  } finally {
    // Close connections
    if (mongoClient) {
      await mongoClient.close()
      console.log("📡 MongoDB connection closed")
    }
    if (mysqlConnection) {
      await mysqlConnection.end()
      console.log("🐬 MySQL connection closed")
    }
  }
}

// Run migration
if (require.main === module) {
  migrateMongoDB()
    .then(() => {
      console.log("✨ Migration process completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Migration process failed:", error)
      process.exit(1)
    })
}

module.exports = { migrateMongoDB }
