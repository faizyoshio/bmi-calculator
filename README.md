# BMI Calculator Application

A comprehensive Body Mass Index (BMI) calculator built with Next.js, TypeScript, and MongoDB. This application provides BMI calculations with personalized health recommendations, multi-language support (English and Indonesian), and a complete data management system.

## Features

- 🧮 **BMI Calculation**: Accurate BMI calculation with WHO standard categories
- 👥 **User Management**: Named user profiles with calculation history
- 🌐 **Multi-language Support**: English and Indonesian language options
- 💡 **Personalized Tips**: Health recommendations based on BMI category, age, and gender
- 📊 **Data Analytics**: Comprehensive data table with filtering, sorting, and export capabilities
- 📱 **Responsive Design**: Mobile-friendly interface
- 🔒 **Data Security**: Secure MongoDB integration with proper validation
- 📈 **Health Tracking**: BMI history and progress tracking
- 📋 **Export Features**: Data export in JSON and CSV formats

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** (for cloning the repository) - [Download here](https://git-scm.com/)
- **MongoDB Atlas Account** (for database) - [Sign up here](https://cloud.mongodb.com/)
- **VS Code** (recommended code editor) - [Download here](https://code.visualstudio.com/)

## Installation

### Method 1: Clone from Repository

1. **Clone the Repository**:
   Open your terminal or VS Code integrated terminal and run:
   \`\`\`bash
   git clone <your-repository-url>
   cd bmi-calculator
   \`\`\`

### Method 2: Download from v0

1. **Download the Project**:
   If you downloaded the project from v0, extract the ZIP file to your desired directory.

2. **Open in VS Code**:
   Open VS Code and use `File > Open Folder` to open the project directory.
   Alternatively, if you downloaded a `.zip` file from v0, extract it to your desired directory and open the folder in VS Code.

3. **Install Dependencies**:
   Open the integrated terminal in VS Code (`Ctrl+`` or `View > Terminal`) and navigate into the project directory. Then, install the necessary Node.js packages:

   \`\`\`bash
   npm install
   \`\`\`

4. **Set Up Environment Variables**:
   Create a file named `.env.local` in the root of your project. You can do this directly in VS Code's Explorer panel. This file will store your sensitive environment variables, such as your MongoDB connection string.

   ```plaintext
   # MongoDB Connection String (replace with your actual connection string)
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority&appName=<appName>

   # Optional: Database name (defaults to 'bmi_calculator' if not set)
   DB_NAME=bmi_calculator

   # Optional: Environment
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   \`\`\`
   **Important**: Make sure to replace the placeholders (`<username>`, `<password>`, `<cluster-url>`, and `<appName>`) with your actual MongoDB Atlas credentials and cluster details. The `DB_NAME` should match the database you intend to use (e.g., `bmi_calculator`).

## Database Setup (MongoDB Atlas)

If you don't have a MongoDB Atlas cluster set up, follow these steps:

1. **Create a Cluster**:
   - Sign up or log in to [MongoDB Atlas](https://cloud.mongodb.com/).
   - Create a new "Shared Cluster" (M0 is free).
   - Choose your preferred cloud provider and region.

2. **Create a Database User**:
   - In your Atlas project, go to "Database Access" under "Security".
   - Click "Add New Database User".
   - Choose a strong username and password. Remember these, as they will be part of your `MONGODB_URI`.
   - Grant "Read and write to any database" privileges for simplicity, or more granular access if preferred.

3. **Configure Network Access**:
   - Go to "Network Access" under "Security".
   - Click "Add IP Address".
   - For local development, add your current IP address.
   - **For Vercel deployment**, it is highly recommended to add `0.0.0.0/0` (Allow Access from Anywhere). This allows Vercel's dynamic IP addresses to connect to your database. You can restrict this later if needed.

4. **Get Connection String**:
   - Go to "Databases" in the left navigation.
   - Click "Connect" on your cluster.
   - Select "Connect your application".
   - Choose "Node.js" and the latest version.
   - Copy the provided connection string. This is your `MONGODB_URI`.

## Usage

### Running the Application Locally

Once you have installed the dependencies and configured your environment variables, you can run the development server from your VS Code integrated terminal:

\`\`\`bash
npm run dev
\`\`\`

The application will be accessible at `http://localhost:3000`.

### Using the BMI Calculator

1. **Input Details**: On the main page, enter your name (optional), select your gender, and input your height (in cm), weight (in kg), and age (optional).
2. **Calculate BMI**: Click the "Calculate BMI" button.
3. **View Results**: You will be redirected to the results page, displaying your BMI score, category, and personalized health tips.
4. **Language Switch**: Use the globe icon button in the top right corner to toggle between English and Indonesian.
5. **Mark Tips Complete**: On the results page, you can mark personalized tips as "Complete" to track your progress.

### Data Management

Access the comprehensive data table at `/data` to:
- View all BMI calculations in a sortable, filterable table
- Export data in JSON or CSV format
- Filter by BMI category, gender, age range, and more
- Search users by name
- Monitor application statistics

## API Endpoints

The application exposes the following API endpoints:

### BMI Calculation APIs

- **`POST /api/bmi`**: Calculates BMI and saves user data to the database.
  - **Body**: `{ name?: string, gender: string, height: number, weight: number, age?: number }`
  - **Response**: `{ bmi: number, category: string, tips: string[], user: object }`

- **`GET /api/bmi`**: Fetches recent BMI calculation records (primarily for named users).
  - **Query Params**: `name` (optional, to search for specific user records)
  - **Response**: `{ records: [], count: number }`

### User Management APIs

- **`GET /api/user/[name]`**: Fetches a specific user's profile and BMI history by name.
  - **Response**: `{ user: { name, gender, age, height, weight, currentBmi, currentCategory, bmiHistory, lastCalculation } }`

- **`DELETE /api/user/[name]`**: Deletes a user's record by name.
  - **Response**: `{ message: string }`

- **`GET /api/users`**: Fetches a list of all named users with pagination.
  - **Query Params**: 
    - `limit` (optional, default 10, max 100)
    - `skip` (optional, default 0)
  - **Response**: `{ users: [], total: number, page: number, totalPages: number }`

### Data Analytics APIs

- **`GET /api/data`**: Comprehensive data retrieval with advanced filtering, sorting, and pagination.
  - **Query Parameters**:
    - `page` (number, default 1): Page number for pagination
    - `limit` (number, default 10, max 100): Number of records per page
    - `sortBy` (string, default "lastCalculation"): Field to sort by (name, gender, age, height, weight, currentBmi, currentCategory, lastCalculation)
    - `sortOrder` (string, default "desc"): Sort order ("asc" or "desc")
    - `search` (string): Search users by name (case-insensitive)
    - `category` (string): Filter by BMI category (underweight, normal weight, overweight, obese)
    - `gender` (string): Filter by gender (male, female)
    - `minAge` (number): Minimum age filter
    - `maxAge` (number): Maximum age filter
    - `minBmi` (number): Minimum BMI filter
    - `maxBmi` (number): Maximum BMI filter
  - **Response**: 
    \`\`\`json
    {
      "data": [
        {
          "id": "string",
          "name": "string",
          "gender": "male|female",
          "age": "number|string",
          "height": "number",
          "weight": "number",
          "currentBmi": "number|null",
          "currentCategory": "string",
          "lastCalculation": "string",
          "calculationCount": "number"
        }
      ],
      "pagination": {
        "currentPage": "number",
        "totalPages": "number",
        "totalCount": "number",
        "limit": "number",
        "hasNextPage": "boolean",
        "hasPrevPage": "boolean"
      },
      "filters": {
        "categories": [{"value": "string", "count": "number"}],
        "genders": [{"value": "string", "label": "string"}]
      },
      "sort": {
        "sortBy": "string",
        "sortOrder": "asc|desc"
      }
    }
    \`\`\`

- **`GET /api/data/export`**: Export filtered data in JSON or CSV format.
  - **Query Parameters**:
    - `format` (string, required): Export format ("json" or "csv")
    - All filtering parameters from `/api/data` are supported
  - **Response**: 
    - JSON format: Returns structured data with metadata
    - CSV format: Returns downloadable CSV file

### System APIs

- **`GET /api/stats`**: Provides application statistics and analytics.
  - **Response**: 
    \`\`\`json
    {
      "totalUsers": "number",
      "totalCalculations": "number",
      "categoryDistribution": {
        "underweight": "number",
        "normal weight": "number",
        "overweight": "number",
        "obese": "number"
      },
      "genderDistribution": {
        "male": "number",
        "female": "number"
      },
      "averageBmi": "number",
      "recentActivity": "number"
    }
    \`\`\`

- **`GET /api/health`**: Checks the database connection health and system status.
  - **Response**: 
    \`\`\`json
    {
      "status": "healthy|unhealthy",
      "database": "connected|disconnected",
      "type": "mongodb",
      "timestamp": "string",
      "uptime": "number",
      "version": "string"
    }
    \`\`\`

- **`POST /api/cleanup`**: Triggers a cleanup of sensitive data (e.g., old IP/User Agent fields).
  - **Response**: `{ message: string, cleanedRecords: number }`

## Data Table Features

The `/data` page provides a comprehensive data management interface with:

### 🔍 **Advanced Filtering**
- **Text Search**: Search users by name with real-time filtering
- **Category Filter**: Filter by BMI categories with record counts
- **Gender Filter**: Filter by male/female
- **Age Range**: Set minimum and maximum age filters
- **BMI Range**: Filter by BMI value ranges
- **Combined Filters**: Use multiple filters simultaneously

### 📊 **Interactive Table**
- **Column Sorting**: Click any column header to sort (ascending/descending)
- **Visual Indicators**: Color-coded BMI categories and sort direction arrows
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Loading States**: Skeleton loaders during data fetching
- **Empty States**: Helpful messages when no data is found

### 📄 **Pagination & Display**
- **Configurable Page Sizes**: 5, 10, 25, 50, or 100 records per page
- **Navigation Controls**: First, previous, next, last page buttons
- **Page Information**: Current page and total pages display
- **Record Counts**: Shows current records and total count

### 📤 **Export Capabilities**
- **JSON Export**: Structured data export with metadata
- **CSV Export**: Spreadsheet-compatible format
- **Filtered Exports**: Export only the filtered data
- **Automatic Downloads**: Browser-initiated file downloads

### 🔄 **Real-time Features**
- **Auto-refresh**: Manual refresh button to update data
- **Filter Persistence**: Maintains filter state during navigation
- **Error Handling**: Graceful error recovery with retry options
- **Toast Notifications**: User feedback for actions and errors

## Troubleshooting

- **"Database disconnected" or "Failed to connect to MongoDB"**:
  - **Check `MONGODB_URI`**: Ensure it's correctly formatted and includes your username and password.
  - **MongoDB Atlas Network Access**: Make sure `0.0.0.0/0` (Allow Access from Anywhere) is added to your IP Whitelist in MongoDB Atlas.
  - **Database User Credentials**: Verify the username and password for your database user in MongoDB Atlas.
  - **Vercel Environment Variables**: If deployed, ensure the `MONGODB_URI` is correctly set in your Vercel project's environment variables. Redeploy after any changes.

- **Validation Errors on Input**:
  - Ensure height is between 50-300 cm and weight is between 20-500 kg.
  - Name should be 2-50 characters and contain only letters and spaces.
  - Age should be between 1-120 years.

- **"Failed to calculate BMI"**:
  - Check your network connection.
  - Ensure both height and weight fields are filled with positive numbers.
  - Review your server logs (if running locally or on Vercel) for more specific error messages from the API.

- **Data Table Loading Issues**:
  - Check the `/api/health` endpoint to verify database connectivity.
  - Clear browser cache and cookies if experiencing persistent issues.
  - Verify that your MongoDB user has proper read permissions.

- **Export Functionality Problems**:
  - Ensure your browser allows file downloads.
  - Check that the data exists and matches your filter criteria.
  - Try exporting smaller datasets if experiencing timeout issues.

## Performance Optimization

### Database Indexes
The application uses optimized MongoDB indexes for better query performance:

\`\`\`javascript
// Recommended indexes for optimal performance
db.users.createIndex({ "name": 1 })
db.users.createIndex({ "currentCategory": 1 })
db.users.createIndex({ "gender": 1 })
db.users.createIndex({ "lastCalculation": -1 })
db.users.createIndex({ "currentBmi": 1 })
db.users.createIndex({ "age": 1 })
db.users.createIndex({ "isAnonymous": 1 })

// Compound indexes for common filter combinations
db.users.createIndex({ "gender": 1, "currentCategory": 1 })
db.users.createIndex({ "isAnonymous": 1, "lastCalculation": -1 })
\`\`\`

### Large Dataset Handling
- **Pagination**: Efficient pagination prevents memory issues with large datasets
- **Selective Projection**: Only necessary fields are retrieved from the database
- **Query Optimization**: Optimized MongoDB aggregation pipelines
- **Connection Pooling**: Proper database connection management

## Deployment

### Vercel Deployment

1. **Push to GitHub**: Ensure your code is in a GitHub repository.

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project" and import your GitHub repository.

3. **Set Environment Variables**:
   - In your Vercel project settings, add the `MONGODB_URI` environment variable.
   - Set it for both "Production" and "Preview" environments.

4. **Deploy**: Vercel will automatically deploy your application.

5. **Test**: Visit your deployed URL and test all functionality.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request.

Please ensure your code adheres to the existing style and includes relevant tests if applicable.

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the API documentation for proper usage
3. Ensure your MongoDB Atlas configuration is correct
4. Check the `/api/health` endpoint for system status

For additional support, please open an issue in the project repository.
