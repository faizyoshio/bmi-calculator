# BMI Calculator Application

A modern, user-friendly Body Mass Index (BMI) Calculator application built with Next.js, TypeScript, and MongoDB. This application allows users to calculate their BMI, receive personalized health insights and tips, and supports both English and Indonesian languages.

## Features

*   **BMI Calculation**: Accurately calculates BMI based on height and weight.
*   **Personalized Insights**: Provides health insights and tips based on BMI category, gender, and age.
*   **User Data Storage**: Stores user calculation data (name, gender, height, weight, age, BMI, category, timestamp) in a MongoDB database.
*   **Multi-language Support**: Supports English and Indonesian languages with a seamless switcher.
*   **Responsive Design**: Optimized for various screen sizes using Tailwind CSS and Shadcn/ui components.
*   **Input Validation**: Real-time validation for input fields to ensure data quality.
*   **Loading Indicators**: Enhanced loading states for a better user experience.
*   **Toast Notifications**: Provides feedback to the user for actions and errors.
*   **API Endpoints**: RESTful API for BMI calculation, user management, and statistics.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: Version 18.x or higher.
*   **npm** or **Yarn**: Package manager (npm comes with Node.js).
*   **MongoDB Atlas Account**: A free tier account is sufficient for development and testing.

## Installation

To get the project up and running on your local machine, follow these steps:

1.  **Clone the Repository (or Download)**:
    If you have access to the Git repository, clone it:
    \`\`\`bash
    git clone <repository-url>
    cd bmi-calculator
    \`\`\`
    Alternatively, if you downloaded a `.zip` file from v0, extract it to your desired directory.

2.  **Install Dependencies**:
    Navigate into the project directory and install the necessary Node.js packages using npm or Yarn:

    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`

3.  **Set Up Environment Variables**:
    Create a file named `.env.local` in the root of your project. This file will store your sensitive environment variables, such as your MongoDB connection string.

    \`\`\`plaintext
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

1.  **Create a Cluster**:
    *   Sign up or log in to [MongoDB Atlas](https://cloud.mongodb.com/).
    *   Create a new "Shared Cluster" (M0 is free).
    *   Choose your preferred cloud provider and region.

2.  **Create a Database User**:
    *   In your Atlas project, go to "Database Access" under "Security".
    *   Click "Add New Database User".
    *   Choose a strong username and password. Remember these, as they will be part of your `MONGODB_URI`.
    *   Grant "Read and write to any database" privileges for simplicity, or more granular access if preferred.

3.  **Configure Network Access**:
    *   Go to "Network Access" under "Security".
    *   Click "Add IP Address".
    *   For local development, add your current IP address.
    *   **For Vercel deployment**, it is highly recommended to add `0.0.0.0/0` (Allow Access from Anywhere). This allows Vercel's dynamic IP addresses to connect to your database. You can restrict this later if needed.

4.  **Get Connection String**:
    *   Go to "Databases" in the left navigation.
    *   Click "Connect" on your cluster.
    *   Select "Connect your application".
    *   Choose "Node.js" and the latest version.
    *   Copy the provided connection string. This is your `MONGODB_URI`.

## Usage

### Running the Application Locally

Once you have installed the dependencies and configured your environment variables, you can run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

The application will be accessible at `http://localhost:3000`.

### Using the BMI Calculator

1.  **Input Details**: On the main page, enter your name (optional), select your gender, and input your height (in cm), weight (in kg), and age (optional).
2.  **Calculate BMI**: Click the "Calculate BMI" button.
3.  **View Results**: You will be redirected to the results page, displaying your BMI score, category, and personalized health tips.
4.  **Language Switch**: Use the globe icon button in the top right corner to toggle between English and Indonesian.
5.  **Mark Tips Complete**: On the results page, you can mark personalized tips as "Complete" to track your progress.

### API Endpoints

The application exposes the following API endpoints:

*   **`POST /api/bmi`**: Calculates BMI and saves user data to the database.
    *   **Body**: `{ name?: string, gender: string, height: number, weight: number, age?: number }`
    *   **Response**: `{ bmi: number, category: string, ... }`
*   **`GET /api/bmi`**: Fetches recent BMI calculation records (primarily for named users).
    *   **Query Params**: `name` (optional, to search for specific user records)
    *   **Response**: `{ records: [], count: number }`
*   **`GET /api/user/[name]`**: Fetches a specific user's profile and BMI history by name.
    *   **Response**: `{ user: {} }`
*   **`DELETE /api/user/[name]`**: Deletes a user's record by name.
    *   **Response**: `{ message: string }`
*   **`GET /api/users`**: Fetches a list of all named users.
    *   **Query Params**: `limit` (optional, default 10), `skip` (optional, default 0)
    *   **Response**: `{ users: [], total: number, page: number, totalPages: number }`
*   **`GET /api/stats`**: Provides application statistics (total users, category distribution, etc.).
    *   **Response**: `{ totalUsers: number, categoryDistribution: {}, ... }`
*   **`GET /api/health`**: Checks the database connection health.
    *   **Response**: `{ status: "healthy" | "unhealthy", database: "connected" | "disconnected", ... }`
*   **`POST /api/cleanup`**: Triggers a cleanup of sensitive data (e.g., old IP/User Agent fields).
    *   **Response**: `{ message: string }`

## Troubleshooting

*   **"Database disconnected" or "Failed to connect to MongoDB"**:
    *   **Check `MONGODB_URI`**: Ensure it's correctly formatted and includes your username and password.
    *   **MongoDB Atlas Network Access**: Make sure `0.0.0.0/0` (Allow Access from Anywhere) is added to your IP Whitelist in MongoDB Atlas.
    *   **Database User Credentials**: Verify the username and password for your database user in MongoDB Atlas.
    *   **Vercel Environment Variables**: If deployed, ensure the `MONGODB_URI` is correctly set in your Vercel project's environment variables. Redeploy after any changes.
*   **Validation Errors on Input**:
    *   Ensure height is between 50-300 cm and weight is between 20-500 kg.
    *   Name should be 2-50 characters and contain only letters and spaces.
    *   Age should be between 1-120 years.
*   **"Failed to calculate BMI"**:
    *   Check your network connection.
    *   Ensure both height and weight fields are filled with positive numbers.
    *   Review your server logs (if running locally or on Vercel) for more specific error messages from the API.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -m 'Add new feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a Pull Request.

Please ensure your code adheres to the existing style and includes relevant tests if applicable.

## License

This project is licensed under the MIT License.
