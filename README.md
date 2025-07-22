# BMI Calculator Application

A comprehensive Body Mass Index (BMI) calculator built with Next.js, TypeScript, and MongoDB. This application provides multilingual support (Indonesian and English), personalized health recommendations, and a complete database management system.

## 🌟 Features

### Core BMI Calculator
- **Accurate BMI Calculation**: Calculate BMI using height and weight inputs
- **BMI Categories**: Automatic categorization (Underweight, Normal Weight, Overweight, Obese)
- **Multilingual Support**: Available in Indonesian and English
- **Personalized Tips**: Health recommendations based on BMI category
- **User Profiles**: Save and track BMI calculations with user names

### Database Content Viewer
- **Interactive Database Table**: View all BMI calculation records at `/database`
- **Advanced Filtering**: Search by name, filter by BMI category and gender
- **Column Sorting**: Sort by any column (name, gender, age, BMI, etc.)
- **Flexible Pagination**: Choose from 5, 10, 25, 50, or 100 records per page
- **Data Export**: Download database content as JSON or CSV files
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Technical Features
- **MongoDB Integration**: Persistent data storage with user profiles and BMI history
- **Real-time Updates**: Automatic data refresh and loading states
- **Error Handling**: Comprehensive error messages and retry functionality
- **Performance Optimized**: Efficient database queries with proper indexing
- **Type Safety**: Full TypeScript implementation

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (for database)
- **Git** (for cloning the repository)

### Installation

1. **Clone the repository**
   \`\`\`
   git clone https://github.com/your-username/bmi-calculator.git
   cd bmi-calculator
   \`\`\`

2. **Install dependencies**
   \`\`\`
   npm install
   \`\`\`

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   \`\`\`
   MONGODB_URI=your_mongodb_connection_string_here
   \`\`\`

   Replace `your_mongodb_connection_string_here` with your actual MongoDB connection string.

4. **Run the development server**
   \`\`\`
   npm run dev
   \`\`\`

5. **Open your browser**
   
   Navigate to `http://localhost:3000` to see the application.

## 📊 Database Content Viewer

Access the database content viewer at `/database` to:

- **View Records**: Browse all BMI calculation records in a structured table
- **Filter Data**: Use search and category filters to find specific records
- **Sort Columns**: Click column headers to sort data ascending or descending
- **Export Data**: Download filtered data as JSON or CSV files
- **Manage Pagination**: Navigate through large datasets efficiently

### Database Filtering Options

- **Search by Name**: Find users by searching their names
- **BMI Category Filter**: Filter by Underweight, Normal Weight, Overweight, or Obese
- **Gender Filter**: Filter by Male or Female

## 🔧 API Endpoints

### BMI Calculation
- **POST** `/api/bmi` - Calculate BMI and save user data
  \`\`\`json
  {
    "name": "John Doe",
    "gender": "male",
    "age": 30,
    "height": 175,
    "weight": 70
  }
  \`\`\`

### Database Content Management
- **GET** `/api/database` - Retrieve database records with filtering and pagination
  - Query Parameters:
    - `page` (number): Page number (default: 1)
    - `limit` (number): Records per page (default: 10, max: 100)
    - `sortBy` (string): Sort field (name, gender, age, height, weight, currentBmi, currentCategory, lastCalculation)
    - `sortOrder` (string): Sort direction (asc, desc)
    - `search` (string): Search by name
    - `category` (string): Filter by BMI category
    - `gender` (string): Filter by gender (male, female)

- **GET** `/api/database/export` - Export database content
  - Query Parameters:
    - `format` (string): Export format (json, csv)
    - `search` (string): Search filter
    - `category` (string): Category filter
    - `gender` (string): Gender filter

### System Health
- **GET** `/api/health` - Check database connection and system status

## 🗄️ Database Schema

### Users Collection (`bmi_calculator.users`)

\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  gender: "male" | "female",
  age: Number,
  height: Number, // in centimeters
  weight: Number, // in kilograms
  currentBmi: Number,
  currentCategory: String,
  lastCalculation: Date,
  bmiHistory: [
    {
      bmi: Number,
      category: String,
      calculatedAt: Date,
      height: Number,
      weight: Number
    }
  ],
  isAnonymous: Boolean
}
\`\`\`

## 🌐 Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bmi_calculator?retryWrites=true&w=majority

# Optional: Application Settings
NEXT_PUBLIC_APP_NAME=BMI Calculator
NEXT_PUBLIC_APP_VERSION=1.0.0
\`\`\`

## 📱 Usage Examples

### Basic BMI Calculation
1. Navigate to the home page (`/`)
2. Enter your name, select gender, and input age
3. Enter height (in cm) and weight (in kg)
4. Click "Calculate BMI"
5. View results with personalized health tips

### Database Content Management
1. Navigate to `/database`
2. Use filters to search and filter records:
   - Search by name in the search box
   - Select BMI category from dropdown
   - Select gender from dropdown
3. Click column headers to sort data
4. Use pagination controls to navigate through records
5. Export filtered data using JSON or CSV buttons

### API Usage Examples

**Calculate BMI:**
\`\`\`javascript
const response = await fetch('/api/bmi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    gender: 'male',
    age: 30,
    height: 175,
    weight: 70
  })
});
const result = await response.json();
\`\`\`

**Fetch Database Records:**
\`\`\`javascript
const response = await fetch('/api/database?page=1&limit=10&sortBy=lastCalculation&sortOrder=desc');
const data = await response.json();
\`\`\`

**Export Database Content:**
\`\`\`javascript
const response = await fetch('/api/database/export?format=csv&category=overweight');
const blob = await response.blob();
\`\`\`

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   \`\`\`
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard

3. **Set Environment Variables**
   - Add `MONGODB_URI` in Vercel project settings
   - Deploy the application

4. **Access Your Application**
   - BMI Calculator: `https://your-app.vercel.app/`
   - Database Viewer: `https://your-app.vercel.app/database`

## 🔍 Troubleshooting

### Common Issues

**Database Connection Issues**
- Verify MongoDB connection string in `.env.local`
- Check MongoDB Atlas network access (whitelist 0.0.0.0/0 for Vercel)
- Ensure database user has proper permissions
- Test connection using `/api/health` endpoint

**Build Errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

**Performance Issues**
- Implement database indexing for large datasets
- Use pagination for large result sets
- Monitor API response times
- Consider implementing caching strategies

### Database Health Check

Visit `/api/health` to verify:
- Database connection status
- MongoDB cluster connectivity
- System health metrics

Expected response:
\`\`\`json
{
  "status": "healthy",
  "database": "connected",
  "type": "mongodb",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`

## 🛠️ Development

### Project Structure

\`\`\`
bmi-calculator/
├── app/
│   ├── api/
│   │   ├── bmi/route.ts
│   │   ├── database/
│   │   │   ├── route.ts
│   │   │   └── export/route.ts
│   │   └── health/route.ts
│   ├── database/page.tsx
│   ├── results/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── database-table.tsx
│   ├── language-switcher.tsx
│   └── ui/
├── lib/
│   ├── mongodb.ts
│   ├── language-context.tsx
│   └── utils.ts
├── types/
│   └── database-table.ts
└── README.md
\`\`\`

### Available Scripts

\`\`\`
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
\`\`\`

### Database Optimization

For optimal performance with large datasets:

1. **Create Indexes**
   \`\`\`javascript
   // In MongoDB Atlas or MongoDB Compass
   db.users.createIndex({ "name": "text" })
   db.users.createIndex({ "currentCategory": 1 })
   db.users.createIndex({ "gender": 1 })
   db.users.createIndex({ "lastCalculation": -1 })
   db.users.createIndex({ "currentBmi": 1 })
   \`\`\`

2. **Monitor Performance**
   - Use MongoDB Atlas Performance Advisor
   - Monitor slow queries
   - Implement query optimization

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   \`\`\`
   git checkout -b feature/amazing-feature
   \`\`\`
3. **Make your changes**
4. **Add tests if applicable**
5. **Commit your changes**
   \`\`\`
   git commit -m "Add amazing feature"
   \`\`\`
6. **Push to your branch**
   \`\`\`
   git push origin feature/amazing-feature
   \`\`\`
7. **Open a Pull Request**

### Contribution Guidelines

- Follow TypeScript best practices
- Add proper error handling
- Include comprehensive tests
- Update documentation as needed
- Follow the existing code style
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework for production
- **MongoDB** - Database for data persistence
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **Lucide React** - Icon library

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search existing [GitHub issues](https://github.com/your-username/bmi-calculator/issues)
3. Create a new issue with detailed information
4. Contact the development team

---

**Happy calculating! 🎯**
