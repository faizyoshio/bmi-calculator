# BMI Calculator - MongoDB to MySQL Migration Guide

## Overview
This guide provides step-by-step instructions for migrating the BMI Calculator application from MongoDB to MySQL with phpMyAdmin management.

## Prerequisites

### Software Requirements
- MySQL Server 8.0 or higher
- phpMyAdmin (latest version)
- Node.js 18+ with npm
- Access to existing MongoDB database

### System Requirements
- Minimum 2GB RAM
- 10GB free disk space
- Network access to both databases

## Migration Steps

### Step 1: Install MySQL and phpMyAdmin

#### On Ubuntu/Debian:
\`\`\`bash
# Install MySQL Server
sudo apt update
sudo apt install mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Install phpMyAdmin
sudo apt install phpmyadmin
\`\`\`

#### On Windows:
1. Download and install XAMPP or WAMP
2. Start Apache and MySQL services
3. Access phpMyAdmin at http://localhost/phpmyadmin

#### On macOS:
\`\`\`bash
# Using Homebrew
brew install mysql
brew services start mysql

# Install phpMyAdmin
brew install phpmyadmin
\`\`\`

### Step 2: Configure MySQL Database

1. **Access phpMyAdmin**
   - Open http://localhost/phpmyadmin
   - Login with root credentials

2. **Create Database**
   - Click "New" in the left sidebar
   - Enter database name: `bmi_calculator`
   - Select collation: `utf8mb4_unicode_ci`
   - Click "Create"

3. **Run Schema Script**
   - Select the `bmi_calculator` database
   - Click "SQL" tab
   - Copy and paste the contents of `scripts/create-mysql-schema.sql`
   - Click "Go" to execute

### Step 3: Update Environment Variables

Create or update `.env.local`:
\`\`\`env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bmi_calculator
DB_PORT=3306

# Legacy MongoDB URI (for migration only)
MONGODB_URI=your_mongodb_connection_string
\`\`\`

### Step 4: Install Dependencies

\`\`\`bash
# Install MySQL driver
npm install mysql2

# Install migration dependencies (temporary)
npm install mongodb --save-dev
\`\`\`

### Step 5: Run Migration Script

\`\`\`bash
# Make sure both databases are accessible
npm run migrate
\`\`\`

The migration script will:
- Connect to both MongoDB and MySQL
- Transfer all user data
- Migrate BMI calculation history
- Preserve data relationships
- Generate migration statistics

### Step 6: Verify Migration

1. **Check Data in phpMyAdmin**
   - Browse the `users` table
   - Verify `bmi_history` records
   - Check `user_preferences` if applicable

2. **Test Application**
   \`\`\`bash
   npm run dev
   \`\`\`
   - Test BMI calculations
   - Verify user data persistence
   - Check statistics endpoint

3. **Run Health Check**
   - Visit http://localhost:3000/api/health
   - Should return "healthy" status with MySQL type

### Step 7: Security Configuration

#### MySQL Security Settings
\`\`\`sql
-- Create dedicated application user
CREATE USER 'bmi_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON bmi_calculator.* TO 'bmi_app'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

#### phpMyAdmin Security
1. **Change default URL**
   - Rename phpMyAdmin directory
   - Update web server configuration

2. **Enable HTTPS**
   - Configure SSL certificate
   - Force HTTPS redirects

3. **IP Restrictions**
   ```apache
   # In .htaccess or virtual host
   <RequireAll>
       Require ip 127.0.0.1
       Require ip 192.168.1.0/24
   </RequireAll>
   \`\`\`

4. **Authentication Settings**
   - Enable two-factor authentication
   - Set session timeout
   - Configure login attempts limit

### Step 8: Performance Optimization

#### MySQL Configuration
\`\`\`ini
# In my.cnf or my.ini
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_size = 64M
max_connections = 100
\`\`\`

#### Database Indexes
The schema includes optimized indexes:
- User name lookup
- Timestamp-based queries
- Category filtering
- Anonymous user filtering

### Step 9: Backup Strategy

#### Automated Backups
\`\`\`bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p bmi_calculator > backup_$DATE.sql
\`\`\`

#### phpMyAdmin Export
1. Select `bmi_calculator` database
2. Click "Export" tab
3. Choose "Custom" method
4. Select all tables
5. Choose SQL format
6. Click "Go"

### Step 10: Monitoring and Maintenance

#### Performance Monitoring
\`\`\`sql
-- Check slow queries
SHOW PROCESSLIST;

-- Analyze table performance
ANALYZE TABLE users, bmi_history;

-- Check index usage
SHOW INDEX FROM users;
\`\`\`

#### Regular Maintenance
\`\`\`sql
-- Optimize tables monthly
OPTIMIZE TABLE users, bmi_history, user_preferences;

-- Check table integrity
CHECK TABLE users, bmi_history;
\`\`\`

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify MySQL service is running
   - Check firewall settings
   - Validate credentials

2. **Migration Failures**
   - Check MongoDB connectivity
   - Verify sufficient disk space
   - Review error logs

3. **Performance Issues**
   - Analyze slow query log
   - Check index usage
   - Monitor memory usage

### Support Resources
- MySQL Documentation: https://dev.mysql.com/doc/
- phpMyAdmin Documentation: https://docs.phpmyadmin.net/
- Application logs: Check console output and error logs

## Post-Migration Checklist

- [ ] All user data migrated successfully
- [ ] BMI calculations working correctly
- [ ] Statistics API returning accurate data
- [ ] User authentication functioning
- [ ] Database backups configured
- [ ] Security measures implemented
- [ ] Performance monitoring active
- [ ] Documentation updated

## Rollback Plan

If migration fails:
1. Stop the application
2. Restore MongoDB connection
3. Revert code changes
4. Investigate and fix issues
5. Retry migration

Keep MongoDB data until migration is fully verified and stable.
