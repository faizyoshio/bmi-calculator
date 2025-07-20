import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  family: 4, // Use IPv4, skip trying IPv6
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db("bmi_calculator")

    // Test the connection
    await db.admin().ping()
    console.log("Successfully connected to MongoDB")

    return { client, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

// Utility function to check database health
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    await db.admin().ping()
    return true
  } catch (error) {
    console.error("Database health check failed:", error)
    return false
  }
}

// Utility function to create indexes for better performance
export async function createIndexes(): Promise<void> {
  try {
    const { db } = await connectToDatabase()

    // Create indexes on users collection
    await db.collection("users").createIndex({ name: 1 })
    await db.collection("users").createIndex({ lastCalculation: -1 })
    await db.collection("users").createIndex({ currentCategory: 1 })
    await db.collection("users").createIndex({ isAnonymous: 1 })

    console.log("Database indexes created successfully")
  } catch (error) {
    console.error("Failed to create database indexes:", error)
  }
}

export default clientPromise
