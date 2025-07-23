# BMI Calculator Application

A comprehensive Body Mass Index (BMI) calculator built with Next.js, TypeScript, and MySQL. This application provides multilingual support (English and Indonesian), personalized health recommendations, and a complete database management system.

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
- **MySQL Integration**: Secure data storage with proper indexing and relationships
- **API Endpoints**: RESTful API for data management and health monitoring
- **Performance Optimization**: Efficient database queries with pagination
- **Error Handling**: Comprehensive error management and user feedback
- **Type Safety**: Full TypeScript implementation

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following:
- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **MySQL Database** (see database options below)
- **Git** (for cloning the repository)

### Database Options for Vercel Hosting

#### 1. PlanetScale (Recommended)
- **Free tier available**
- **Serverless MySQL platform**
- **Built for scale and performance**
- **Easy Vercel integration**

#### 2. Railway
- **Simple setup and deployment**
- **Free tier with MySQL support**
- **Good for development and small projects**

#### 3. Aiven
- **Managed MySQL service**
- **Multiple cloud providers**
- **Professional features**

#### 4. AWS RDS
- **Enterprise-grade MySQL**
- **Highly scalable**
- **Requires AWS account**

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

3. **Set up your MySQL database**
   
   Choose one of the database providers above and create a MySQL database.

4. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   \`\`\`
   # MySQL Database Configuration
   MYSQL_HOST=your-mysql-host.com
   MYSQL_PORT=3306
   MYSQL_USER=your-username
   MYSQL_PASSWORD=your-password
   MYSQL_DATABASE=bmi_calculator
   \`\`\`

5. **Initialize the database**
   
   The application will automatically create the necessary tables when you first run it.

6. **Run the development server**
   \`\`\`
   npm run dev
   \`\`\`

7. **Open your browser**
   
   Navigate to `http://localhost:3000` to see the application.

## 🗄️ Database Schema

### Users Table
\`\`\`sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  age INT NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  current_bmi DECIMAL(4,2) NOT NULL,
  current_category VARCHAR(50) NOT NULL,
  last_calculation TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### BMI History Table
\`\`\`sql
CREATE TABLE bmi_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bmi DECIMAL(4,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
\`\`\`

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
    "type": "mysql",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
  \`\`\`

### Statistics
- **GET** `/api/stats` - Get application statistics
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

## 🌐 Deployment to Vercel

### Step 1: Prepare Your Database

#### Option A: PlanetScale (Recommended)
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get your connection details from the dashboard
4. Use the connection string format:
   \`\`\`
   MYSQL_HOST=aws.connect.psdb.cloud
   MYSQL_USER=your-username
   MYSQL_PASSWORD=your-password
   MYSQL_DATABASE=your-database-name
   \`\`\`

#### Option B: Railway
1. Sign up at [railway.app](https://railway.app)
2. Create a new MySQL database
3. Get connection details from the Railway dashboard
4. Use the connection string format:
   \`\`\`
   MYSQL_HOST=containers-us-west-xxx.railway.app
   MYSQL_PORT=6543
   MYSQL_USER=root
   MYSQL_PASSWORD=your-password
   MYSQL_DATABASE=railway
   \`\`\`

### Step 2: Deploy to Vercel

1. **Push your code to GitHub**
   \`\`\`
   git add .
   git commit -m "Add MySQL integration"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard

3. **Set Environment Variables in Vercel**
   - Go to your project settings in Vercel
   - Add the following environment variables:
     \`\`\`
     MYSQL_HOST=your-mysql-host
     MYSQL_PORT=3306
     MYSQL_USER=your-username
     MYSQL_PASSWORD=your-password
     MYSQL_DATABASE=your-database-name
     \`\`\`

4. **Deploy**
   - Vercel will automatically deploy your application
   - The database tables will be created automatically on first run
   - Access your live application at the provided URL

### Step 3: Verify Deployment

1. **Check Health Endpoint**
   Visit `https://your-app.vercel.app/api/health` to verify database connection

2. **Test BMI Calculation**
   Use the main application to calculate BMI and verify data is saved

3. **Check Database Viewer**
   Visit `https://your-app.vercel.app/database` to view stored data

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

// Export data
const exportData = await fetch('/api/database/export?format=csv&category=overweight');
\`\`\`

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MySQL connection details in `.env.local`
   - Check if your database service is running
   - Ensure firewall allows connections from Vercel IPs
   - Test connection using `/api/health` endpoint

2. **Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

3. **API Endpoints Not Working**
   - Verify environment variables are set correctly in Vercel
   - Check database user permissions
   - Monitor network requests in browser developer tools

4. **Performance Issues**
   - Ensure database indexes are created (done automatically)
   - Use pagination for large result sets
   - Monitor database query performance
   - Consider connection pooling optimization

### Database-Specific Troubleshooting

#### PlanetScale Issues
- Ensure you're using the correct branch (main/production)
- Check connection limits in PlanetScale dashboard
- Verify SSL is enabled for production connections

#### Railway Issues
- Check if your Railway project is sleeping (free tier limitation)
- Verify database is not at storage limit
- Monitor Railway logs for connection issues

#### General MySQL Issues
- Check MySQL version compatibility (8.0+ recommended)
- Verify character set is UTF-8
- Ensure timezone settings are correct

## 🚀 Performance Optimization

### Database Optimization
The application automatically creates the following indexes for optimal performance:

\`\`\`sql
-- User table indexes
CREATE INDEX idx_name ON users(name);
CREATE INDEX idx_gender ON users(gender);
CREATE INDEX idx_category ON users(current_category);
CREATE INDEX idx_last_calculation ON users(last_calculation);
CREATE INDEX idx_is_anonymous ON users(is_anonymous);

-- BMI history table indexes
CREATE INDEX idx_user_id ON bmi_history(user_id);
CREATE INDEX idx_calculated_at ON bmi_history(calculated_at);
\`\`\`

### Application Optimization
- **Connection Pooling**: Uses mysql2 connection pool for efficient database connections
- **Pagination**: Implements proper pagination for large datasets
- **Query Optimization**: Uses efficient SQL queries with proper WHERE clauses
- **Data Validation**: Server-side validation prevents invalid data storage

## 🤝 Contributing

We welcome contributions to improve the BMI Calculator application!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   \`\`\`
   git checkout -b feature/your-feature-name
   \`\`\`
3. **Make your changes**
4. **Test your changes**
   \`\`\`
   npm run test
   npm run build
   \`\`\`
5. **Submit a pull request**

### Development Guidelines

- **Database Changes**: Update both the schema and migration scripts
- **API Changes**: Update API documentation and types
- **UI Changes**: Ensure responsive design and accessibility
- **Testing**: Add tests for new features and bug fixes

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework for production
- **MySQL** - Reliable relational database
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

**Built with ❤️ using Next.js, TypeScript, and MySQL**
