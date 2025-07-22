# MongoDB Database Operations Guide

This guide provides detailed instructions for creating and managing MongoDB collections, with specific examples from the BMI Calculator application.

## Table of Contents

1. [Database Connection](#database-connection)
2. [Creating Collections](#creating-collections)
3. [Data Structure Design](#data-structure-design)
4. [CRUD Operations](#crud-operations)
5. [Data Types](#data-types)
6. [Indexing](#indexing)
7. [Relationships](#relationships)
8. [Data Integrity](#data-integrity)
9. [Performance Optimization](#performance-optimization)
10. [Large Dataset Considerations](#large-dataset-considerations)

## Database Connection

### 1. Setting Up Connection

First, establish a connection to your MongoDB database:

\`\`\`javascript
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://username:password@cluster.mongodb.net/";
const client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  family: 4
});

async function connectToDatabase() {
  try {
    await client.connect();
    const db = client.db("bmi_calculator");
    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("Connection failed:", error);
    throw error;
  }
}
\`\`\`

### 2. Connection Best Practices

- Use connection pooling to manage multiple connections efficiently
- Implement proper error handling and retry logic
- Set appropriate timeout values
- Use environment variables for sensitive connection strings

## Creating Collections

### 1. Implicit Collection Creation

MongoDB creates collections automatically when you first insert data:

\`\`\`javascript
async function createUserCollection() {
  const db = await connectToDatabase();
  
  // Collection is created automatically on first insert
  const result = await db.collection("users").insertOne({
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date()
  });
  
  console.log("Collection created and document inserted:", result.insertedId);
}
\`\`\`

### 2. Explicit Collection Creation

For more control, create collections explicitly:

\`\`\`javascript
async function createCollectionExplicitly() {
  const db = await connectToDatabase();
  
  // Create collection with options
  await db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "email"],
        properties: {
          name: {
            bsonType: "string",
            description: "must be a string and is required"
          },
          email: {
            bsonType: "string",
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
            description: "must be a valid email and is required"
          }
        }
      }
    }
  });
  
  console.log("Collection created with validation rules");
}
\`\`\`

## Data Structure Design

### 1. BMI Calculator User Schema

Here's the structure for our users collection:

\`\`\`javascript
const userSchema = {
  _id: ObjectId,                    // Auto-generated unique identifier
  name: String,                     // User's name (2-50 characters)
  email: String,                    // User's email (optional)
  isAnonymous: Boolean,             // Whether user is anonymous
  createdAt: Date,                  // Account creation timestamp
  lastCalculation: Date,            // Last BMI calculation timestamp
  
  // Current BMI data
  currentBMI: Number,               // Latest BMI value
  currentCategory: String,          // Latest BMI category
  currentHeight: Number,            // Latest height in cm
  currentWeight: Number,            // Latest weight in kg
  currentAge: Number,               // Latest age
  currentGender: String,            // Latest gender
  
  // Statistics
  calculationCount: Number,         // Total number of calculations
  
  // History array (embedded documents)
  bmiHistory: [{
    bmi: Number,
    category: String,
    height: Number,
    weight: Number,
    age: Number,
    gender: String,
    timestamp: Date
  }],
  
  // Metadata
  preferences: {
    language: String,               // User's preferred language
    units: String                   // Metric or Imperial
  }
};
\`\`\`

### 2. Collection Naming Conventions

- Use lowercase names
- Use plural nouns (users, not user)
- Use underscores for multi-word names
- Keep names descriptive but concise

## CRUD Operations

### 1. Create (Insert) Operations

#### Insert Single Document

\`\`\`javascript
async function insertUser(userData) {
  const db = await connectToDatabase();
  
  const user = {
    name: userData.name,
    email: userData.email,
    isAnonymous: false,
    createdAt: new Date(),
    lastCalculation: new Date(),
    currentBMI: userData.bmi,
    currentCategory: userData.category,
    currentHeight: userData.height,
    currentWeight: userData.weight,
    currentAge: userData.age,
    currentGender: userData.gender,
    calculationCount: 1,
    bmiHistory: [{
      bmi: userData.bmi,
      category: userData.category,
      height: userData.height,
      weight: userData.weight,
      age: userData.age,
      gender: userData.gender,
      timestamp: new Date()
    }],
    preferences: {
      language: "en",
      units: "metric"
    }
  };
  
  try {
    const result = await db.collection("users").insertOne(user);
    console.log("User inserted with ID:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
}
\`\`\`

#### Insert Multiple Documents

\`\`\`javascript
async function insertMultipleUsers(usersArray) {
  const db = await connectToDatabase();
  
  try {
    const result = await db.collection("users").insertMany(usersArray);
    console.log(`${result.insertedCount} users inserted`);
    return result.insertedIds;
  } catch (error) {
    console.error("Bulk insert failed:", error);
    throw error;
  }
}
\`\`\`

### 2. Read (Query) Operations

#### Find Single Document

\`\`\`javascript
async function findUserByName(name) {
  const db = await connectToDatabase();
  
  try {
    const user = await db.collection("users").findOne({
      name: { $regex: name, $options: "i" } // Case-insensitive search
    });
    
    return user;
  } catch (error) {
    console.error("Find failed:", error);
    throw error;
  }
}
\`\`\`

#### Find Multiple Documents with Filtering

\`\`\`javascript
async function findUsersByCategory(category, limit = 10) {
  const db = await connectToDatabase();
  
  try {
    const users = await db.collection("users")
      .find({
        currentCategory: category,
        isAnonymous: { $ne: true }
      })
      .sort({ lastCalculation: -1 })
      .limit(limit)
      .project({
        name: 1,
        currentBMI: 1,
        currentCategory: 1,
        lastCalculation: 1
      })
      .toArray();
    
    return users;
  } catch (error) {
    console.error("Query failed:", error);
    throw error;
  }
}
\`\`\`

#### Advanced Queries with Aggregation

\`\`\`javascript
async function getBMIStatistics() {
  const db = await connectToDatabase();
  
  try {
    const stats = await db.collection("users").aggregate([
      // Match non-anonymous users
      { $match: { isAnonymous: { $ne: true } } },
      
      // Group by BMI category
      {
        $group: {
          _id: "$currentCategory",
          count: { $sum: 1 },
          avgBMI: { $avg: "$currentBMI" },
          avgAge: { $avg: "$currentAge" }
        }
      },
      
      // Sort by count descending
      { $sort: { count: -1 } },
      
      // Add percentage calculation
      {
        $group: {
          _id: null,
          categories: { $push: "$$ROOT" },
          total: { $sum: "$count" }
        }
      },
      
      // Calculate percentages
      {
        $project: {
          _id: 0,
          categories: {
            $map: {
              input: "$categories",
              as: "category",
              in: {
                category: "$$category._id",
                count: "$$category.count",
                avgBMI: { $round: ["$$category.avgBMI", 2] },
                avgAge: { $round: ["$$category.avgAge", 1] },
                percentage: {
                  $round: [
                    { $multiply: [{ $divide: ["$$category.count", "$total"] }, 100] },
                    2
                  ]
                }
              }
            }
          },
          totalUsers: "$total"
        }
      }
    ]).toArray();
    
    return stats[0] || { categories: [], totalUsers: 0 };
  } catch (error) {
    console.error("Aggregation failed:", error);
    throw error;
  }
}
\`\`\`

### 3. Update Operations

#### Update Single Document

\`\`\`javascript
async function updateUserBMI(name, newBMIData) {
  const db = await connectToDatabase();
  
  const currentCalculation = {
    bmi: newBMIData.bmi,
    category: newBMIData.category,
    height: newBMIData.height,
    weight: newBMIData.weight,
    age: newBMIData.age,
    gender: newBMIData.gender,
    timestamp: new Date()
  };
  
  try {
    const result = await db.collection("users").updateOne(
      { name: name.toLowerCase() },
      {
        $set: {
          lastCalculation: new Date(),
          currentBMI: newBMIData.bmi,
          currentCategory: newBMIData.category,
          currentHeight: newBMIData.height,
          currentWeight: newBMIData.weight,
          currentAge: newBMIData.age,
          currentGender: newBMIData.gender
        },
        $inc: { calculationCount: 1 },
        $push: {
          bmiHistory: {
            $each: [currentCalculation],
            $slice: -10 // Keep only last 10 calculations
          }
        }
      },
      { upsert: true } // Create if doesn't exist
    );
    
    console.log(`Modified ${result.modifiedCount} document(s)`);
    return result;
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
}
\`\`\`

#### Update Multiple Documents

\`\`\`javascript
async function updateUserPreferences(language) {
  const db = await connectToDatabase();
  
  try {
    const result = await db.collection("users").updateMany(
      { "preferences.language": { $exists: false } },
      { $set: { "preferences.language": language } }
    );
    
    console.log(`Updated ${result.modifiedCount} documents`);
    return result;
  } catch (error) {
    console.error("Bulk update failed:", error);
    throw error;
  }
}
\`\`\`

### 4. Delete Operations

#### Delete Single Document

\`\`\`javascript
async function deleteUser(name) {
  const db = await connectToDatabase();
  
  try {
    const result = await db.collection("users").deleteOne({
      name: name.toLowerCase()
    });
    
    console.log(`Deleted ${result.deletedCount} document(s)`);
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
}
\`\`\`

#### Delete Multiple Documents

\`\`\`javascript
async function deleteOldAnonymousUsers(daysOld = 30) {
  const db = await connectToDatabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  try {
    const result = await db.collection("users").deleteMany({
      isAnonymous: true,
      createdAt: { $lt: cutoffDate }
    });
    
    console.log(`Deleted ${result.deletedCount} old anonymous users`);
    return result.deletedCount;
  } catch (error) {
    console.error("Bulk delete failed:", error);
    throw error;
  }
}
\`\`\`

## Data Types

### 1. MongoDB Data Types

MongoDB supports various BSON data types:

\`\`\`javascript
const dataTypeExamples = {
  // String
  name: "John Doe",
  
  // Number (Integer and Float)
  age: 30,
  bmi: 24.5,
  
  // Boolean
  isActive: true,
  
  // Date
  createdAt: new Date(),
  
  // ObjectId
  _id: new ObjectId(),
  
  // Array
  tags: ["health", "fitness", "bmi"],
  
  // Embedded Document
  address: {
    street: "123 Main St",
    city: "New York",
    zipCode: "10001"
  },
  
  // Array of Embedded Documents
  bmiHistory: [
    {
      bmi: 24.5,
      date: new Date(),
      category: "normal"
    }
  ],
  
  // Null
  middleName: null,
  
  // Binary Data
  profileImage: new Binary(buffer),
  
  // Decimal128 (for precise decimal calculations)
  preciseWeight: Decimal128.fromString("70.123456789")
};
\`\`\`

### 2. Data Type Validation

\`\`\`javascript
async function createCollectionWithValidation() {
  const db = await connectToDatabase();
  
  await db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "createdAt"],
        properties: {
          name: {
            bsonType: "string",
            minLength: 2,
            maxLength: 50,
            description: "Name must be 2-50 characters"
          },
          age: {
            bsonType: "int",
            minimum: 1,
            maximum: 120,
            description: "Age must be between 1 and 120"
          },
          bmi: {
            bsonType: "double",
            minimum: 10.0,
            maximum: 100.0,
            description: "BMI must be between 10 and 100"
          },
          email: {
            bsonType: "string",
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
            description: "Must be a valid email format"
          },
          createdAt: {
            bsonType: "date",
            description: "Creation date is required"
          }
        }
      }
    }
  });
}
\`\`\`

## Indexing

### 1. Creating Indexes

\`\`\`javascript
async function createIndexes() {
  const db = await connectToDatabase();
  const collection = db.collection("users");
  
  try {
    // Single field index
    await collection.createIndex({ name: 1 }); // Ascending
    await collection.createIndex({ lastCalculation: -1 }); // Descending
    
    // Compound index
    await collection.createIndex({ 
      currentCategory: 1, 
      lastCalculation: -1 
    });
    
    // Text index for search
    await collection.createIndex({ 
      name: "text", 
      email: "text" 
    });
    
    // Unique index
    await collection.createIndex({ 
      email: 1 
    }, { 
      unique: true, 
      sparse: true // Ignore documents without email field
    });
    
    // TTL index (Time To Live) for automatic deletion
    await collection.createIndex({ 
      createdAt: 1 
    }, { 
      expireAfterSeconds: 2592000 // 30 days for anonymous users
    });
    
    // Partial index (only index documents matching condition)
    await collection.createIndex({ 
      currentBMI: 1 
    }, { 
      partialFilterExpression: { 
        isAnonymous: { $ne: true } 
      }
    });
    
    console.log("All indexes created successfully");
  } catch (error) {
    console.error("Index creation failed:", error);
    throw error;
  }
}
\`\`\`

### 2. Index Management

\`\`\`javascript
async function manageIndexes() {
  const db = await connectToDatabase();
  const collection = db.collection("users");
  
  // List all indexes
  const indexes = await collection.listIndexes().toArray();
  console.log("Current indexes:", indexes);
  
  // Get index statistics
  const stats = await db.runCommand({ collStats: "users", indexDetails: true });
  console.log("Collection stats:", stats);
  
  // Drop an index
  await collection.dropIndex("email_1");
  
  // Rebuild indexes
  await collection.reIndex();
}
\`\`\`

## Relationships

### 1. Embedded Documents (One-to-Few)

Best for data that belongs together and is accessed together:

\`\`\`javascript
// User with embedded BMI history
const userWithHistory = {
  _id: ObjectId(),
  name: "John Doe",
  bmiHistory: [
    {
      bmi: 24.5,
      category: "normal",
      timestamp: new Date("2024-01-01")
    },
    {
      bmi: 25.1,
      category: "overweight", 
      timestamp: new Date("2024-02-01")
    }
  ]
};
\`\`\`

### 2. References (One-to-Many, Many-to-Many)

For larger datasets or when data is accessed independently:

\`\`\`javascript
// Separate collections with references
const user = {
  _id: ObjectId("user123"),
  name: "John Doe",
  email: "john@example.com"
};

const bmiRecord = {
  _id: ObjectId(),
  userId: ObjectId("user123"), // Reference to user
  bmi: 24.5,
  category: "normal",
  timestamp: new Date()
};

// Query with population
async function getUserWithBMIRecords(userId) {
  const db = await connectToDatabase();
  
  const user = await db.collection("users").findOne({ _id: ObjectId(userId) });
  const bmiRecords = await db.collection("bmi_records")
    .find({ userId: ObjectId(userId) })
    .sort({ timestamp: -1 })
    .toArray();
  
  return { ...user, bmiRecords };
}
\`\`\`

### 3. Using Aggregation for Joins

\`\`\`javascript
async function getUsersWithRecentBMI() {
  const db = await connectToDatabase();
  
  const result = await db.collection("users").aggregate([
    // Lookup BMI records
    {
      $lookup: {
        from: "bmi_records",
        localField: "_id",
        foreignField: "userId",
        as: "bmiRecords"
      }
    },
    
    // Add most recent BMI
    {
      $addFields: {
        mostRecentBMI: {
          $arrayElemAt: [
            {
              $sortArray: {
                input: "$bmiRecords",
                sortBy: { timestamp: -1 }
              }
            },
            0
          ]
        }
      }
    },
    
    // Project desired fields
    {
      $project: {
        name: 1,
        email: 1,
        currentBMI: "$mostRecentBMI.bmi",
        currentCategory: "$mostRecentBMI.category",
        lastCalculation: "$mostRecentBMI.timestamp"
      }
    }
  ]).toArray();
  
  return result;
}
\`\`\`

## Data Integrity

### 1. Schema Validation

\`\`\`javascript
async function setupValidation() {
  const db = await connectToDatabase();
  
  // Add validation to existing collection
  await db.runCommand({
    collMod: "users",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "createdAt"],
        properties: {
          name: {
            bsonType: "string",
            minLength: 2,
            maxLength: 50
          },
          bmi: {
            bsonType: "double",
            minimum: 10.0,
            maximum: 100.0
          },
          bmiHistory: {
            bsonType: "array",
            maxItems: 10,
            items: {
              bsonType: "object",
              required: ["bmi", "timestamp"],
              properties: {
                bmi: { bsonType: "double" },
                timestamp: { bsonType: "date" }
              }
            }
          }
        }
      }
    },
    validationLevel: "strict", // or "moderate"
    validationAction: "error"   // or "warn"
  });
}
\`\`\`

### 2. Transactions for Data Consistency

\`\`\`javascript
async function transferUserData(fromUserId, toUserId) {
  const client = new MongoClient(uri);
  const session = client.startSession();
  
  try {
    await session.withTransaction(async () => {
      const db = client.db("bmi_calculator");
      
      // Get source user data
      const sourceUser = await db.collection("users")
        .findOne({ _id: ObjectId(fromUserId) }, { session });
      
      if (!sourceUser) {
        throw new Error("Source user not found");
      }
      
      // Update target user
      await db.collection("users").updateOne(
        { _id: ObjectId(toUserId) },
        {
          $push: {
            bmiHistory: { $each: sourceUser.bmiHistory }
          },
          $inc: {
            calculationCount: sourceUser.calculationCount
          }
        },
        { session }
      );
      
      // Delete source user
      await db.collection("users").deleteOne(
        { _id: ObjectId(fromUserId) },
        { session }
      );
    });
    
    console.log("Transaction completed successfully");
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  } finally {
    await session.endSession();
    await client.close();
  }
}
\`\`\`

### 3. Data Sanitization

\`\`\`javascript
function sanitizeUserInput(userData) {
  return {
    name: userData.name?.toString().trim().substring(0, 50),
    email: userData.email?.toString().toLowerCase().trim(),
    age: Math.max(1, Math.min(120, parseInt(userData.age) || 0)),
    height: Math.max(50, Math.min(300, parseFloat(userData.height) || 0)),
    weight: Math.max(20, Math.min(500, parseFloat(userData.weight) || 0)),
    gender: ['male', 'female', 'other'].includes(userData.gender) 
      ? userData.gender 
      : 'other'
  };
}
\`\`\`

## Performance Optimization

### 1. Query Optimization

\`\`\`javascript
// Use explain() to analyze query performance
async function analyzeQuery() {
  const db = await connectToDatabase();
  
  const explanation = await db.collection("users")
    .find({ currentCategory: "normal" })
    .sort({ lastCalculation: -1 })
    .explain("executionStats");
  
  console.log("Query execution stats:", explanation.executionStats);
  
  // Look for:
  // - totalDocsExamined vs totalDocsReturned
  // - executionTimeMillis
  // - indexesUsed
}

// Optimize with proper indexing
async function optimizedQuery() {
  const db = await connectToDatabase();
  
  // Create compound index for this query pattern
  await db.collection("users").createIndex({
    currentCategory: 1,
    lastCalculation: -1
  });
  
  // Query will now use the index efficiently
  const users = await db.collection("users")
    .find({ currentCategory: "normal" })
    .sort({ lastCalculation: -1 })
    .limit(10)
    .toArray();
  
  return users;
}
\`\`\`

### 2. Aggregation Optimization

\`\`\`javascript
async function optimizedAggregation() {
  const db = await connectToDatabase();
  
  // Use $match early to reduce documents processed
  const pipeline = [
    // Filter first (uses index)
    { 
      $match: { 
        isAnonymous: { $ne: true },
        lastCalculation: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      } 
    },
    
    // Project only needed fields early
    {
      $project: {
        currentCategory: 1,
        currentBMI: 1,
        calculationCount: 1
      }
    },
    
    // Group and calculate
    {
      $group: {
        _id: "$currentCategory",
        count: { $sum: 1 },
        avgBMI: { $avg: "$currentBMI" },
        totalCalculations: { $sum: "$calculationCount" }
      }
    },
    
    // Sort at the end
    { $sort: { count: -1 } }
  ];
  
  return await db.collection("users").aggregate(pipeline).toArray();
}
\`\`\`

### 3. Connection Pooling

\`\`\`javascript
class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
  }
  
  async connect() {
    if (!this.client) {
      this.client = new MongoClient(uri, {
        maxPoolSize: 10,        // Maximum connections in pool
        minPoolSize: 2,         // Minimum connections in pool
        maxIdleTimeMS: 30000,   // Close connections after 30s idle
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        retryReads: true
      });
      
      await this.client.connect();
      this.db = this.client.db("bmi_calculator");
    }
    
    return this.db;
  }
  
  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

// Singleton instance
const dbManager = new DatabaseManager();
export default dbManager;
\`\`\`

## Large Dataset Considerations

### 1. Pagination

\`\`\`javascript
async function getPaginatedUsers(page = 1, limit = 20) {
  const db = await connectToDatabase();
  const skip = (page - 1) * limit;
  
  // Use cursor-based pagination for better performance
  const users = await db.collection("users")
    .find({ isAnonymous: { $ne: true } })
    .sort({ _id: 1 }) // Use _id for consistent ordering
    .skip(skip)
    .limit(limit)
    .toArray();
  
  const total = await db.collection("users").countDocuments({ 
    isAnonymous: { $ne: true } 
  });
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: skip + limit < total,
      hasPrev: page > 1
    }
  };
}

// Cursor-based pagination (more efficient for large datasets)
async function getCursorPaginatedUsers(lastId = null, limit = 20) {
  const db = await connectToDatabase();
  
  const query = { isAnonymous: { $ne: true } };
  if (lastId) {
    query._id = { $gt: ObjectId(lastId) };
  }
  
  const users = await db.collection("users")
    .find(query)
    .sort({ _id: 1 })
    .limit(limit + 1) // Get one extra to check if there's more
    .toArray();
  
  const hasMore = users.length > limit;
  if (hasMore) users.pop(); // Remove the extra document
  
  return {
    users,
    hasMore,
    nextCursor: users.length > 0 ? users[users.length - 1]._id : null
  };
}
\`\`\`

### 2. Bulk Operations

\`\`\`javascript
async function bulkUpdateUsers(updates) {
  const db = await connectToDatabase();
  
  // Prepare bulk operations
  const bulkOps = updates.map(update => ({
    updateOne: {
      filter: { _id: ObjectId(update.id) },
      update: { $set: update.data },
      upsert: false
    }
  }));
  
  // Execute in batches
  const batchSize = 1000;
  const results = [];
  
  for (let i = 0; i < bulkOps.length; i += batchSize) {
    const batch = bulkOps.slice(i, i + batchSize);
    const result = await db.collection("users").bulkWrite(batch, {
      ordered: false // Continue on errors
    });
    results.push(result);
  }
  
  return results;
}
\`\`\`

### 3. Data Archiving

\`\`\`javascript
async function archiveOldData() {
  const db = await connectToDatabase();
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 1); // 1 year old
  
  // Move old data to archive collection
  const oldUsers = await db.collection("users")
    .find({ 
      lastCalculation: { $lt: cutoffDate },
      isAnonymous: { $ne: true }
    })
    .toArray();
  
  if (oldUsers.length > 0) {
    // Insert into archive
    await db.collection("users_archive").insertMany(oldUsers);
    
    // Remove from main collection
    const userIds = oldUsers.map(user => user._id);
    await db.collection("users").deleteMany({
      _id: { $in: userIds }
    });
    
    console.log(`Archived ${oldUsers.length} old user records`);
  }
}
\`\`\`

### 4. Monitoring and Alerting

\`\`\`javascript
async function monitorDatabaseHealth() {
  const db = await connectToDatabase();
  
  // Check collection sizes
  const stats = await db.collection("users").stats();
  console.log("Collection stats:", {
    documents: stats.count,
    avgDocSize: stats.avgObjSize,
    totalSize: stats.size,
    indexSize: stats.totalIndexSize
  });
  
  // Check slow queries
  const slowQueries = await db.admin().command({
    currentOp: true,
    "secs_running": { $gte: 5 }
  });
  
  if (slowQueries.inprog.length > 0) {
    console.warn("Slow queries detected:", slowQueries.inprog);
  }
  
  // Check index usage
  const indexStats = await db.collection("users").aggregate([
    { $indexStats: {} }
  ]).toArray();
  
  console.log("Index usage:", indexStats);
}
\`\`\`

## Best Practices Summary

1. **Design Schema Carefully**: Consider access patterns and relationships
2. **Use Appropriate Indexes**: Create indexes for frequently queried fields
3. **Validate Data**: Implement schema validation and input sanitization
4. **Handle Errors Gracefully**: Implement proper error handling and logging
5. **Monitor Performance**: Regularly analyze query performance and optimize
6. **Plan for Scale**: Use pagination, bulk operations, and archiving strategies
7. **Secure Your Database**: Implement proper authentication and authorization
8. **Backup Regularly**: Set up automated backups and test recovery procedures
9. **Use Transactions When Needed**: Ensure data consistency for critical operations
10. **Keep Documents Reasonable Size**: Avoid documents larger than 16MB

This guide provides a comprehensive foundation for working with MongoDB in production applications. Remember to always test thoroughly and monitor your database performance in production environments.
