#!/bin/bash

echo "🚀 Setting up database access for BMI Calculator"

# Check if MySQL is running
if ! systemctl is-active --quiet mysql; then
    echo "❌ MySQL is not running. Starting MySQL..."
    sudo systemctl start mysql
    sudo systemctl enable mysql
fi

# Check if phpMyAdmin is installed
if [ ! -d "/usr/share/phpmyadmin" ] && [ ! -d "/var/www/html/phpmyadmin" ]; then
    echo "📦 Installing phpMyAdmin..."
    sudo apt update
    sudo apt install -y phpmyadmin
    
    # Create symlink for Apache
    sudo ln -sf /usr/share/phpmyadmin /var/www/html/phpmyadmin
    
    # Restart Apache
    sudo systemctl restart apache2
fi

# Test database connection
echo "🔍 Testing database connection..."
mysql -u root -p"Faizyw2006" -e "USE bmi_calculator; SHOW TABLES;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
    echo "📊 Database access methods:"
    echo "   - phpMyAdmin: http://localhost/phpmyadmin"
    echo "   - MySQL CLI: mysql -u root -p"
    echo "   - API Health: http://localhost:3000/api/health"
else
    echo "❌ Database connection failed. Please check your credentials."
fi

echo "🔐 Database Credentials:"
echo "   Host: localhost"
echo "   User: root"
echo "   Password: Faizyw2006"
echo "   Database: bmi_calculator"
echo "   Port: 3306"
