# Complete MySQL Integration Guide for Vercel Applications

## 📋 Table of Contents
1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Connection Configuration](#connection-configuration)
4. [Schema Design](#schema-design)
5. [API Implementation](#api-implementation)
6. [Data Display](#data-display)
7. [Security Best Practices](#security-best-practices)
8. [Performance Optimization](#performance-optimization)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## 🎯 Overview

This guide demonstrates how to integrate MySQL databases with Vercel-hosted applications, focusing on efficient data retrieval and tabular display. We'll use a BMI Calculator as our example application.

### Key Features Covered:
- ✅ MySQL connection pooling
- ✅ Automated table creation
- ✅ Advanced filtering and sorting
- ✅ Pagination for large datasets
- ✅ Data export (JSON/CSV)
- ✅ Bulk operations
- ✅ Real-time health monitoring
- ✅ Production-ready error handling

## 🗄️ Database Setup

### 1. Choose a MySQL Provider

#### **PlanetScale (Recommended)**
- **Pros**: Serverless, free tier, excellent Vercel integration
- **Setup**: 
  \`\`\`bash
  # Install PlanetScale CLI
  npm install -g @planetscale/cli
  
  # Create database
  pscale database create bmi-calculator
  
  # Get connection string
  pscale connect bmi-calculator main --port 3309
  \`\`\`

#### **Railway**
- **Pros**: Simple setup, generous free tier
- **Setup**: Visit railway.app → New Project → MySQL

#### **Aiven**
- **Pros**: Managed service, multiple cloud providers
- **Setup**: Visit aiven.io → Create MySQL service

### 2. Database Schema Design

Our optimized schema includes:

\`\`\`sql
-- Users table with proper indexing
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  gender ENUM('male', 'female') NOT NULL,
  age INT NOT NULL CHECK (age > 0 AND age < 150),
  height DECIMAL(5,2) NOT NULL CHECK (height > 0),
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
  current_bmi DECIMAL(4,2) NOT NULL,
  current_category VARCHAR(50) NOT NULL,
  last_calculation TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Performance indexes
  INDEX idx_name (name),
  INDEX idx_gender (gender),
  INDEX idx_category (current_category),
  INDEX idx_last_calculation (last_calculation),
  INDEX idx_is_anonymous (is_anonymous),
  
  -- Composite indexes for common queries
  INDEX idx_gender_category (gender, current_category),
  INDEX idx_anonymous_last_calc (is_anonymous, last_calculation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- History table for tracking changes
CREATE TABLE bmi_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bmi DECIMAL(4,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_calculated_at (calculated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
\`\`\`

## 🔌 Connection Configuration

### 1. Environment Variables

Create `.env.local`:

\`\`\`env
# MySQL Configuration
MYSQL_HOST=your-host.com
MYSQL_PORT=3306
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=your-database

# For PlanetScale
MYSQL_HOST=aws.connect.psdb.cloud
MYSQL_USER=your-username
MYSQL_PASSWORD=pscale_pw_xxxxxxxxxx
MYSQL_DATABASE=your-database-name
\`\`\`

### 2. Connection Pool Setup

\`\`\`typescript
// lib/mysql.ts
import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export async function connectToDatabase() {
  try {
    const connection = await pool.getConnection()
    return { connection, pool }
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`)
  }
}
\`\`\`

## 🏗️ API Implementation

### 1. Data Retrieval API

\`\`\`typescript
// app/api/database/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract parameters with validation
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")))
    const sortBy = searchParams.get("sortBy") || "last_calculation"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    
    // Build dynamic query
    let whereClause = "WHERE is_anonymous = FALSE"
    const queryParams = []
    
    // Add filters
    if (search.trim()) {
      whereClause += " AND name LIKE ?"
      queryParams.push(`%${search.trim()}%`)
    }
    
    // Execute paginated query
    const offset = (page - 1) * limit
    const [users] = await connection.execute(`
      SELECT u.*, COUNT(bh.id) as calculation_count
      FROM users u
      LEFT JOIN bmi_history bh ON u.id = bh.user_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset])
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: { /* pagination info */ }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
\`\`\`

### 2. Health Check Endpoint

\`\`\`typescript
// app/api/health/route.ts
export async function GET() {
  try {
    const isHealthy = await checkDatabaseHealth()
    const stats = await getDatabaseStats()
    
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      statistics: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      error: error.message
    }, { status: 503 })
  }
}
\`\`\`

## 📊 Data Display Implementation

### 1. Advanced Table Component

\`\`\`typescript
// components/database-table.tsx
export function DatabaseTable() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  })
  
  // Fetch data with error handling
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...filters
      })
      
      const response = await fetch(`/api/database?${params}`)
      const result = await response.json()
      
      if (!result.success) throw new Error(result.error)
      
      setData(result.data)
      setPagination(result.pagination)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.limit, sortBy, sortOrder, filters])
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Input 
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
            <Select onValueChange={(value) => setFilters({...filters, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Data Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button onClick={() => handleSort("name")}>
                  Name {getSortIcon("name")}
                </Button>
              </TableHead>
              {/* More columns */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array.from({length: pagination.limit}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                </TableRow>
              ))
            ) : (
              data.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Badge className={getBmiCategoryColor(user.category)}>
                      {user.category}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="flex justify-between p-4">
          <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <Button 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <Button 
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
\`\`\`

## 🔒 Security Best Practices

### 1. SQL Injection Prevention
\`\`\`typescript
// ✅ Good: Parameterized queries
const [users] = await connection.execute(
  "SELECT * FROM users WHERE name = ? AND age > ?",
  [name, minAge]
)

// ❌ Bad: String concatenation
const query = `SELECT * FROM users WHERE name = '${name}'` // Vulnerable!
\`\`\`

### 2. Input Validation
\`\`\`typescript
// Validate all inputs
if (!name || typeof name !== "string" || name.trim().length === 0) {
  return NextResponse.json({ error: "Invalid name" }, { status: 400 })
}

if (!age || typeof age !== "number" || age <= 0 || age > 150) {
  return NextResponse.json({ error: "Invalid age" }, { status: 400 })
}
\`\`\`

### 3. Environment Variables
\`\`\`typescript
// Check required environment variables
const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
}
\`\`\`

## ⚡ Performance Optimization

### 1. Database Indexing
\`\`\`sql
-- Create indexes for common queries
CREATE INDEX idx_user_search ON users(name, gender, current_category);
CREATE INDEX idx_calculation_date ON bmi_history(calculated_at);
CREATE INDEX idx_user_activity ON users(last_calculation, is_anonymous);
\`\`\`

### 2. Connection Pooling
\`\`\`typescript
// Optimal pool configuration
const pool = mysql.createPool({
  connectionLimit: 10,        // Max connections
  acquireTimeout: 60000,      // Connection timeout
  timeout: 60000,             // Query timeout
  reconnect: true,            // Auto-reconnect
  queueLimit: 0              // No queue limit
})
\`\`\`

### 3. Query Optimization
\`\`\`typescript
// Use LIMIT for pagination
const query = `
  SELECT u.*, COUNT(bh.id) as calculation_count
  FROM users u
  LEFT JOIN bmi_history bh ON u.id = bh.user_id
  WHERE u.is_anonymous = FALSE
  GROUP BY u.id
  ORDER BY u.last_calculation DESC
  LIMIT ? OFFSET ?
`

// Use specific columns instead of SELECT *
const query = `
  SELECT id, name, gender, current_bmi, current_category
  FROM users
  WHERE is_anonymous = FALSE
`
\`\`\`

## 🚀 Deployment to Vercel

### 1. Environment Variables Setup
\`\`\`bash
# Add to Vercel dashboard or use CLI
vercel env add MYSQL_HOST
vercel env add MYSQL_USER
vercel env add MYSQL_PASSWORD
vercel env add MYSQL_DATABASE
\`\`\`

### 2. Build Configuration
\`\`\`json
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "db:init": "node scripts/init-db.js"
  }
}
\`\`\`

### 3. Deployment Steps
\`\`\`bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables
vercel env add MYSQL_HOST production
vercel env add MYSQL_USER production
vercel env add MYSQL_PASSWORD production
vercel env add MYSQL_DATABASE production

# 5. Redeploy with env vars
vercel --prod
\`\`\`

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Connection Timeout
\`\`\`typescript
// Increase timeout values
const pool = mysql.createPool({
  acquireTimeout: 120000,  // 2 minutes
  timeout: 120000,         // 2 minutes
  reconnect: true
})
\`\`\`

#### 2. SSL Certificate Issues
\`\`\`typescript
// For production with SSL
ssl: {
  rejectUnauthorized: false,
  ca: fs.readFileSync('path/to/ca-cert.pem'),
  key: fs.readFileSync('path/to/client-key.pem'),
  cert: fs.readFileSync('path/to/client-cert.pem')
}
\`\`\`

#### 3. Memory Issues with Large Datasets
\`\`\`typescript
// Use streaming for large results
const stream = connection.query('SELECT * FROM large_table').stream()
stream.on('data', (row) => {
  // Process row by row
})
\`\`\`

#### 4. Connection Pool Exhaustion
\`\`\`typescript
// Always release connections
const connection = await pool.getConnection()
try {
  const [results] = await connection.execute(query, params)
  return results
} finally {
  connection.release() // Important!
}
\`\`\`

### Health Check Implementation
\`\`\`typescript
// Monitor database health
export async function checkDatabaseHealth() {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}
\`\`\`

## 📈 Monitoring and Analytics

### 1. Query Performance Monitoring
\`\`\`typescript
// Log slow queries
const startTime = Date.now()
const [results] = await connection.execute(query, params)
const executionTime = Date.now() - startTime

if (executionTime > 1000) {
  console.warn(`Slow query detected: ${executionTime}ms`, { query, params })
}
\`\`\`

### 2. Connection Pool Monitoring
\`\`\`typescript
// Monitor pool status
setInterval(() => {
  console.log('Pool status:', {
    totalConnections: pool.pool._allConnections.length,
    freeConnections: pool.pool._freeConnections.length,
    acquiringConnections: pool.pool._acquiringConnections.length
  })
}, 30000)
\`\`\`

## 🎯 Best Practices Summary

1. **Always use parameterized queries** to prevent SQL injection
2. **Implement connection pooling** for better performance
3. **Add proper database indexes** for frequently queried columns
4. **Use transactions** for data consistency
5. **Implement proper error handling** with meaningful messages
6. **Monitor database performance** and connection health
7. **Use environment variables** for sensitive configuration
8. **Implement pagination** for large datasets
9. **Add input validation** on both client and server
10. **Use TypeScript** for better type safety

This comprehensive guide provides everything needed to successfully integrate MySQL with Vercel applications, ensuring scalable, secure, and performant database operations.
