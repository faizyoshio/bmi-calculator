# BMI Calculator Application

A comprehensive Body Mass Index (BMI) calculator built with Next.js, TypeScript, and MongoDB. This application provides multilingual support (English and Indonesian), personalized health recommendations, and a complete database management system.

## 🌟 Features

### Core Functionality
- **BMI Calculation**: Accurate BMI calculation with height and weight inputs
- **Multilingual Support**: English and Indonesian language options
- **Personalized Tips**: Health recommendations based on BMI category
- **User Profiles**: Save and track user information and calculation history
- **Database Management**: Comprehensive database viewer with filtering and export capabilities

### Database Content Viewer
- **Interactive Table**: View all BMI calculation records in a sortable, filterable table
- **Advanced Filtering**: Search by name, filter by BMI category and gender
- **Data Export**: Export database content as JSON or CSV files
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Refresh data and apply filters instantly

### Technical Features
- **MongoDB Integration**: Secure data storage with proper indexing
- **API Endpoints**: RESTful API for data management and health monitoring
- **Performance Optimization**: Efficient database queries with pagination
- **Error Handling**: Comprehensive error management and user feedback
- **Type Safety**: Full TypeScript implementation

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (for cloud database) or local MongoDB installation
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
   MONGODB_URI=mongodb+srv://mardonbleu28:lEL6F4v7IVnJFPSa@cluster0.qsj25c7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   \`\`\`

4. **Run the development server**
   \`\`\`
   npm run dev
   \`\`\`

5. **Open your browser**
   
   Navigate to `http://localhost:3000` to see the application.

## 📊 Database Content Viewer

Access the comprehensive database management interface at `/database` to:

### Features
- **View Records**: Browse all BMI calculation records in a professional table format
- **Filter Data**: Use advanced filters to find specific records:
  - Search by user name
  - Filter by BMI category (Underweight, Normal Weight, Overweight, Obese)
  - Filter by gender (Male, Female)
- **Sort Columns**: Click any column header to sort data ascending or descending
- **Export Data**: Download filtered results as JSON or CSV files
- **Pagination**: Navigate through large datasets with configurable page sizes

### Usage
1. Navigate to `/database` in your application
2. Use the "Show Filters" button to access filtering options
3. Apply filters to narrow down the data
4. Click column headers to sort the data
5. Use export buttons to download the filtered data
6. Navigate through pages using pagination controls

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

### Database Management
- **GET** `/api/database` - Retrieve database records with filtering and pagination
  - Query parameters:
    - `page`: Page number (default: 1)
    - `limit`: Records per page (default: 10, max: 100)
    - `sortBy`: Sort field (name, gender, age, height, weight, currentBmi, currentCategory, lastCalculation)
    - `sortOrder`: Sort direction (asc, desc)
    - `search`: Search by name (case-insensitive)
    - `category`: Filter by BMI category
    - `gender`: Filter by gender (male, female)

- **GET** `/api/database/export` - Export database records
  - Query parameters:
    - `format`: Export format (json, csv)
    - `search`: Filter by name
    - `category`: Filter by BMI category
    - `gender`: Filter by gender

### Health Monitoring
- **GET** `/api/health` - Check database connection and system health
  \`\`\`json
  {
    "status": "healthy",
    "database": "connected",
    "type": "mongodb",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
  \`\`\`

## 🗄️ Database Schema

### Users Collection
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
  bmiHistory: Array,
  isAnonymous: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## 🌐 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**
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
   - Ensure the MongoDB connection string is correct

4. **Deploy**
   - Vercel will automatically deploy your application
   - Access your live application at the provided URL

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a new cluster

2. **Configure Network Access**
   - Add `0.0.0.0/0` to IP whitelist for Vercel deployment
   - Create database user with read/write permissions

3. **Get Connection String**
   - Copy the connection string from Atlas
   - Replace `<password>` with your database user password
   - Add to environment variables

## 🔍 Usage Examples

### Basic BMI Calculation
1. Enter your name, select gender, and input age
2. Enter height in centimeters and weight in kilograms
3. Click "Calculate BMI" to get results
4. View personalized health recommendations

### Database Management
1. Navigate to `/database`
2. Use filters to find specific records:
   \`\`\`
   Search: "John"
   Category: "Normal Weight"
   Gender: "Male"
   \`\`\`
3. Export filtered results as CSV or JSON
4. Sort by any column (BMI, date, etc.)

### API Usage
\`\`\`javascript
// Calculate BMI
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

// Get database records
const data = await fetch('/api/database?page=1&limit=10&gender=male');
\`\`\`

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MongoDB connection string in `.env.local`
   - Check MongoDB Atlas network access settings
   - Ensure database user has proper permissions

2. **Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

3. **API Endpoints Not Working**
   - Verify environment variables are set correctly
   - Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
   - Monitor network requests in browser developer tools

4. **Gender Filter Not Working**
   - Ensure database contains records with proper gender values
   - Check that gender field is stored as lowercase ("male", "female")
   - Verify filter logic in API endpoint

### Performance Optimization

1. **Database Indexing**
   \`\`\`javascript
   // Recommended indexes for optimal performance
   db.users.createIndex({ "name": "text" })
   db.users.createIndex({ "gender": 1 })
   db.users.createIndex({ "currentCategory": 1 })
   db.users.createIndex({ "lastCalculation": -1 })
   db.users.createIndex({ "isAnonymous": 1 })
   \`\`\`

2. **Large Datasets**
   - Use pagination with reasonable page sizes (10-50 records)
   - Implement proper database indexes
   - Consider data archiving for very old records

## 🤝 Contributing

We welcome contributions to improve the BMI Calculator application!

### How to Contribute

1. **Fork the repository**
   \`\`\`
   git fork https://github.com/your-username/bmi-calculator.git
   \`\`\`

2. **Create a feature branch**
   \`\`\`
   git checkout -b feature/your-feature-name
   \`\`\`

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   \`\`\`
   npm run test
   npm run build
   \`\`\`

5. **Submit a pull request**
   - Provide a clear description of your changes
   - Include screenshots for UI changes
   - Reference any related issues

### Development Guidelines

- **Code Style**: Follow TypeScript and React best practices
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update README.md for significant changes
- **Performance**: Consider performance impact of database queries
- **Accessibility**: Ensure UI components are accessible

### Areas for Contribution

- **New Features**: Additional health metrics, charts, user authentication
- **Internationalization**: Support for more languages
- **Performance**: Database query optimization, caching
- **UI/UX**: Design improvements, mobile responsiveness
- **Testing**: Unit tests, integration tests, end-to-end tests

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework for production
- **MongoDB** - Database for storing user data
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **Vercel** - Deployment platform

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
