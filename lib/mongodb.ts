import { MongoClient, type Db } from "mongodb"

// -----------------------------------------------------------------------------
//  MongoDB connection utility
//  ‣ Uses a singleton pattern in development to avoid creating multiple clients
//  ‣ Exposes helper functions connectToDatabase() & checkDatabaseHealth()
// -----------------------------------------------------------------------------

const uri = process.env.MONGODB_URI
const dbName = process.env.DB_NAME || "bmi_calculator"

if (!uri) {
  throw new Error("Missing `MONGODB_URI`.\nAdd it to your environment variables (.env.local).")
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // Re-use the same client in development (Next.js hot-reload friendly)
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
  }

  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // Always create a new client in production
  client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  })
  clientPromise = client.connect()
}

/**
 * Establish (or re-use) a connection and return the client & db handles.
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const client = await clientPromise
  const db = client.db(dbName)

  return { client, db }
}

/**
 * Ping the database once to make sure the connection is healthy.
 * Returns `true` if successful, otherwise logs the error and returns `false`.
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    await db.command({ ping: 1 })
    return true
  } catch (error) {
    console.error("MongoDB health check failed:", error)
    return false
  }
}

// Default export kept for any legacy imports
export default clientPromise
