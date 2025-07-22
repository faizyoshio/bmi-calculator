# BMI Calculator Application

A comprehensive Body Mass Index (BMI) calculator built with Next.js, TypeScript, and MongoDB. This application provides multilingual support (Indonesian and English), data persistence, personalized health recommendations, and an advanced data management interface.

## 🌟 Features

### Core Features
- **BMI Calculation**: Accurate BMI calculation with metric and imperial units
- **Multilingual Support**: Indonesian and English language options
- **Data Persistence**: MongoDB integration for storing user data and calculations
- **Personalized Tips**: Health recommendations based on BMI category
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Mode**: Theme switching capability

### Advanced Features
- **Interactive Data Table**: Comprehensive data management interface at `/data`
- **Advanced Filtering**: Search, category, gender, age, and BMI range filters
- **Data Export**: Export data in JSON and CSV formats
- **Real-time Analytics**: Live statistics and health monitoring
- **API Integration**: RESTful API endpoints for data management

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas account** (for database)
- **Git** (for version control)
- **VS Code** (recommended editor)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/bmi-calculator.git
   cd bmi-calculator
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   \`\`\`bash
   # In VS Code, right-click in Explorer and select "New File"
   # Name it: .env.local
   \`\`\`
   
   Add the following content:
   \`\`\`env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### MongoDB Atlas Configuration

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster

2. **Configure Network Access**
   - Go to "Network Access" in your Atlas dashboard
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - This is required for Vercel deployments

3. **Create Database User**
   - Go to "Database Access"
   - Create a new database user
   - Set username and password
   - Grant "Read and write to any database" permissions

4. **Get Connection String**
   - Go to "Databases" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### Database Structure

The application automatically creates the following collections:

#### `users` Collection
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  gender: "male" | "female",
  age: Number,
  height: Number,
  weight: Number,
  currentBmi: Number,
  currentCategory: String,
  lastCalculation: Date,
  bmiHistory: Array,
  isAnonymous: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## 📡 API Documentation

### Core BMI API

#### `POST /api/bmi`
Calculate BMI and store user data.

**Request Body:**
\`\`\`json
{
  "name": "John Doe",
  "gender": "male",
  "age": 30,
  "height": 175,
  "weight": 70
}
\`\`\`

**Response:**
\`\`\`json
{
  "bmi": 22.86,
  "category": "Normal weight",
  "tips": ["Maintain your current weight...", "..."],
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "calculationCount": 1
  }
}
\`\`\`

### Data Management API

#### `GET /api/data`
Retrieve paginated user data with advanced filtering and sorting.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `sortBy` (string): Sort field (name, gender, age, height, weight, currentBmi, currentCategory, lastCalculation)
- `sortOrder` (string): Sort direction (asc, desc)
- `search` (string): Search by name
- `category` (string): Filter by BMI category
- `gender` (string): Filter by gender (male, female)
- `minAge` (number): Minimum age filter
- `maxAge` (number): Maximum age filter
- `minBmi` (number): Minimum BMI filter
- `maxBmi` (number): Maximum BMI filter

**Example Request:**
\`\`\`
GET /api/data?page=1&limit=25&sortBy=lastCalculation&sortOrder=desc&category=Normal weight&gender=male&minAge=25&maxAge=45
\`\`\`

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": "user_id",
      "name": "John Doe",
      "gender": "male",
      "age": 30,
      "height": 175,
      "weight": 70,
      "currentBmi": 22.86,
      "currentCategory": "Normal weight",
      "lastCalculation": "2024-01-15T10:30:00Z",
      "calculationCount": 5
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 250,
    "limit": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "categories": [
      { "value": "Normal weight", "count": 120 },
      { "value": "Overweight", "count": 80 }
    ],
    "genders": [
      { "value": "male", "label": "Male" },
      { "value": "female", "label": "Female" }
    ]
  },
  "sort": {
    "sortBy": "lastCalculation",
    "sortOrder": "desc"
  }
}
\`\`\`

#### `GET /api/data/export`
Export filtered data in JSON or CSV format.

**Query Parameters:**
- `format` (string): Export format (json, csv)
- All filtering parameters from `/api/data` endpoint

**Example Requests:**
\`\`\`
GET /api/data/export?format=csv&category=Overweight
GET /api/data/export?format=json&gender=female&minAge=30
\`\`\`

**CSV Response:**
\`\`\`csv
ID,Name,Gender,Age,Height (cm),Weight (kg),BMI,Category,Last Calculation,Total Calculations
user_id,"John Doe",male,30,175,70,22.86,"Normal weight",1/15/2024,5
\`\`\`

### Health & Analytics API

#### `GET /api/health`
Check database connection and system health.

**Response:**
\`\`\`json
{
  "status": "healthy",
  "database": "connected",
  "type": "mongodb",
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

#### `GET /api/stats`
Get application statistics and analytics.

**Response:**
\`\`\`json
{
  "totalUsers": 1250,
  "totalCalculations": 3500,
  "averageBmi": 24.2,
  "categoryDistribution": {
    "Underweight": 125,
    "Normal weight": 625,
    "Overweight": 375,
    "Obese": 125
  },
  "genderDistribution": {
    "male": 650,
    "female": 600
  },
  "recentActivity": {
    "last24Hours": 45,
    "last7Days": 280,
    "last30Days": 890
  }
}
\`\`\`

## 🎯 Interactive Data Table

### Accessing the Data Table

Navigate to `/data` in your application to access the comprehensive data management interface.

### Features

#### 🔍 **Advanced Filtering**
- **Text Search**: Search users by name
- **Category Filter**: Filter by BMI categories (Underweight, Normal weight, Overweight, Obese)
- **Gender Filter**: Filter by male/female
- **Age Range**: Set minimum and maximum age filters
- **BMI Range**: Set minimum and maximum BMI filters

#### 📊 **Sorting & Pagination**
- **Column Sorting**: Click any column header to sort (ascending/descending)
- **Flexible Pagination**: Choose page sizes (5, 10, 25, 50, 100 items)
- **Navigation Controls**: First, previous, next, last page buttons

#### 📤 **Data Export**
- **JSON Export**: Download filtered data as JSON file
- **CSV Export**: Download filtered data as CSV file
- **Filtered Exports**: Export respects all active filters

#### 🎨 **UI/UX Features**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Skeleton loaders during data fetching
- **Error Handling**: Comprehensive error messages with retry options
- **Visual Indicators**: Color-coded BMI categories, sort direction arrows
- **Real-time Updates**: Refresh button for latest data

### Usage Examples

1. **Search for specific users:**
   - Enter name in search field
   - Results update automatically

2. **Filter by BMI category:**
   - Select category from dropdown
   - View count of users in each category

3. **Export filtered data:**
   - Apply desired filters
   - Click "Export CSV" or "Export JSON"
   - File downloads automatically

4. **Sort by any column:**
   - Click column header to sort
   - Click again to reverse order
   - Visual indicators show sort direction

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. **Login to Vercel**
   \`\`\`bash
   vercel login
   \`\`\`

3. **Deploy the application**
   \`\`\`bash
   vercel
   \`\`\`

4. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add `MONGODB_URI` with your connection string

5. **Redeploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

### Environment Variables for Production

\`\`\`env
MONGODB_URI=your_mongodb_connection_string
\`\`\`

## 🔧 Development

### Project Structure

\`\`\`
bmi-calculator/
├── app/
│   ├── api/
│   │   ├── bmi/route.ts          # BMI calculation API
│   │   ├── data/
│   │   │   ├── route.ts          # Data retrieval API
│   │   │   └── export/route.ts   # Data export API
│   │   ├── health/route.ts       # Health check API
│   │   └── stats/route.ts        # Statistics API
│   ├── data/page.tsx             # Data table page
│   ├── results/page.tsx          # BMI results page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Reusable UI components
│   ├── data-table.tsx           # Interactive data table
│   └── language-switcher.tsx    # Language toggle
├── lib/
│   ├── mongodb.ts               # Database connection
│   ├── language-context.tsx    # Language context
│   └── utils.ts                 # Utility functions
├── types/
│   └── data-table.ts           # TypeScript types
└── public/                     # Static assets
\`\`\`

### Available Scripts

\`\`\`bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:seed      # Seed database with sample data
npm run db:migrate   # Run database migrations
\`\`\`

### Adding New Features

1. **Create API endpoint**
   \`\`\`typescript
   // app/api/your-endpoint/route.ts
   import { NextRequest, NextResponse } from "next/server"
   
   export async function GET(request: NextRequest) {
     // Your logic here
     return NextResponse.json({ data: "response" })
   }
   \`\`\`

2. **Create UI component**
   \`\`\`typescript
   // components/your-component.tsx
   "use client"
   
   export function YourComponent() {
     return <div>Your component</div>
   }
   \`\`\`

3. **Add to navigation**
   Update `app/layout.tsx` to include your new page.

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Issues

**Problem**: `{"status":"unhealthy","database":"disconnected"}`

**Solutions:**
1. **Check MongoDB Atlas Network Access**
   - Ensure `0.0.0.0/0` is in IP whitelist
   - Verify cluster is running

2. **Verify Connection String**
   - Check username and password
   - Ensure special characters are URL-encoded
   - Verify cluster URL is correct

3. **Check Environment Variables**
   - Ensure `MONGODB_URI` is set correctly
   - Redeploy after changing environment variables

#### Build/Deployment Issues

**Problem**: Build fails on Vercel

**Solutions:**
1. **Check TypeScript errors**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Verify all dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Check environment variables**
   - Ensure all required variables are set in Vercel

#### Performance Issues

**Problem**: Slow data table loading

**Solutions:**
1. **Add database indexes**
   \`\`\`javascript
   // In MongoDB Atlas or MongoDB Compass
   db.users.createIndex({ "lastCalculation": -1 })
   db.users.createIndex({ "currentCategory": 1 })
   db.users.createIndex({ "name": "text" })
   \`\`\`

2. **Optimize queries**
   - Use pagination
   - Limit returned fields
   - Add appropriate filters

3. **Enable caching**
   - Implement Redis caching
   - Use Next.js caching strategies

### Performance Optimization

#### Database Optimization

1. **Create Indexes**
   \`\`\`javascript
   // Recommended indexes for optimal performance
   db.users.createIndex({ "lastCalculation": -1 })
   db.users.createIndex({ "currentCategory": 1 })
   db.users.createIndex({ "gender": 1 })
   db.users.createIndex({ "age": 1 })
   db.users.createIndex({ "currentBmi": 1 })
   db.users.createIndex({ "name": "text" })
   
   // Compound indexes for common filter combinations
   db.users.createIndex({ "currentCategory": 1, "gender": 1 })
   db.users.createIndex({ "age": 1, "currentBmi": 1 })
   \`\`\`

2. **Query Optimization**
   - Use projection to limit returned fields
   - Implement proper pagination
   - Use aggregation pipelines for complex queries

#### Frontend Optimization

1. **Implement Caching**
   \`\`\`typescript
   // Use React Query or SWR for data caching
   import { useQuery } from 'react-query'
   
   const { data, isLoading } = useQuery(
     ['data', filters, pagination],
     () => fetchData(filters, pagination),
     { staleTime: 5 * 60 * 1000 } // 5 minutes
   )
   \`\`\`

2. **Debounce Search Input**
   \`\`\`typescript
   import { useDebouncedCallback } from 'use-debounce'
   
   const debouncedSearch = useDebouncedCallback(
     (value) => setFilters(prev => ({ ...prev, search: value })),
     300
   )
   \`\`\`

#### Large Dataset Handling

1. **Implement Virtual Scrolling**
   - For tables with thousands of rows
   - Use libraries like `react-window`

2. **Server-Side Processing**
   - Keep filtering and sorting on server
   - Implement cursor-based pagination for very large datasets

3. **Data Archiving**
   - Archive old records to separate collections
   - Implement data retention policies

## 🤝 Contributing

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

3. **Make your changes**
4. **Test your changes**
   \`\`\`bash
   npm run test
   npm run build
   \`\`\`

5. **Commit your changes**
   \`\`\`bash
   git commit -m "Add: your feature description"
   \`\`\`

6. **Push to your fork**
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

7. **Create a Pull Request**

### Development Guidelines

#### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

#### Testing
- Write unit tests for new functions
- Test API endpoints with different scenarios
- Ensure responsive design works on all devices

#### Documentation
- Update README.md for new features
- Add JSDoc comments for complex functions
- Update API documentation

### Reporting Issues

When reporting issues, please include:
- **Environment details** (Node.js version, browser, OS)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Error messages** from console/logs

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **MongoDB** - Database solution
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - UI component library
- **Vercel** - Deployment platform

## 📞 Support

For support and questions:
- **GitHub Issues**: [Create an issue](https://github.com/your-username/bmi-calculator/issues)
- **Documentation**: This README file
- **API Reference**: See API Documentation section above

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
