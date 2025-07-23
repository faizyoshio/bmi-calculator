import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
const dbName = process.env.DB_NAME

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

if (!dbName) {
  throw new Error("Please define the DB_NAME environment variable inside .env.local")
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the client is not recreated on every hot reload
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri)
    ;(global as any)._mongoClientPromise = client.connect()
  }
  clientPromise = (global as any)._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function connectToDatabase() {
  const client = await clientPromise
  const db = client.db(dbName)
  return { client, db }
}

export async function checkDatabaseHealth() {
  try {
    const { db } = await connectToDatabase()
    // Attempt a simple operation to check connectivity
    await db.command({ ping: 1 })
    return { isConnected: true, message: "Successfully connected to MongoDB." }
  } catch (error) {
    console.error("Database health check failed:", error)
    return { isConnected: false, message: "Failed to connect to MongoDB." }
  }
}

export default clientPromise
