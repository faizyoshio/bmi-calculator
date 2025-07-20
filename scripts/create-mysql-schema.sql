-- BMI Calculator MySQL Database Schema
-- Run this script in phpMyAdmin to create the database structure

-- Create database
CREATE DATABASE IF NOT EXISTS bmi_calculator 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE bmi_calculator;

-- Users table - Main user information
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_calculation TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    current_bmi DECIMAL(5,2) NULL,
    current_category ENUM('underweight', 'normal', 'overweight', 'obese') NULL,
    current_height DECIMAL(5,1) NULL,
    current_weight DECIMAL(5,1) NULL,
    current_age INT NULL,
    current_gender ENUM('male', 'female') NULL,
    calculation_count INT DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_last_calculation (last_calculation),
    INDEX idx_current_category (current_category),
    INDEX idx_is_anonymous (is_anonymous)
) ENGINE=InnoDB;

-- BMI History table - Store calculation history
CREATE TABLE bmi_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    height DECIMAL(5,1) NOT NULL,
    weight DECIMAL(5,1) NOT NULL,
    age INT NULL,
    bmi DECIMAL(5,2) NOT NULL,
    category ENUM('underweight', 'normal', 'overweight', 'obese') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- User preferences table - Store user settings
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    language ENUM('en', 'id') DEFAULT 'en',
    completed_tips JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
) ENGINE=InnoDB;

-- Application statistics table - Store app metrics
CREATE TABLE app_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value JSON NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB;

-- Create views for easier data access
CREATE VIEW user_summary AS
SELECT 
    u.id,
    u.name,
    u.is_anonymous,
    u.created_at,
    u.last_calculation,
    u.current_bmi,
    u.current_category,
    u.current_height,
    u.current_weight,
    u.current_age,
    u.current_gender,
    u.calculation_count,
    COUNT(bh.id) as history_count
FROM users u
LEFT JOIN bmi_history bh ON u.id = bh.user_id
GROUP BY u.id;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE GetUserWithHistory(IN user_name VARCHAR(100))
BEGIN
    DECLARE user_id_var INT;
    
    -- Get user ID
    SELECT id INTO user_id_var 
    FROM users 
    WHERE LOWER(name) = LOWER(user_name) 
    LIMIT 1;
    
    -- Return user info
    SELECT * FROM users WHERE id = user_id_var;
    
    -- Return user history (last 10 records)
    SELECT * FROM bmi_history 
    WHERE user_id = user_id_var 
    ORDER BY timestamp DESC 
    LIMIT 10;
END //

CREATE PROCEDURE UpdateUserBMI(
    IN p_name VARCHAR(100),
    IN p_gender ENUM('male', 'female'),
    IN p_height DECIMAL(5,1),
    IN p_weight DECIMAL(5,1),
    IN p_age INT,
    IN p_bmi DECIMAL(5,2),
    IN p_category ENUM('underweight', 'normal', 'overweight', 'obese')
)
BEGIN
    DECLARE user_id_var INT DEFAULT NULL;
    DECLARE is_new_user BOOLEAN DEFAULT FALSE;
    
    START TRANSACTION;
    
    -- Check if user exists
    IF p_name IS NOT NULL THEN
        SELECT id INTO user_id_var 
        FROM users 
        WHERE LOWER(name) = LOWER(p_name) 
        LIMIT 1;
        
        IF user_id_var IS NULL THEN
            -- Create new user
            INSERT INTO users (
                name, is_anonymous, current_bmi, current_category, 
                current_height, current_weight, current_age, current_gender
            ) VALUES (
                p_name, FALSE, p_bmi, p_category, 
                p_height, p_weight, p_age, p_gender
            );
            SET user_id_var = LAST_INSERT_ID();
            SET is_new_user = TRUE;
        ELSE
            -- Update existing user
            UPDATE users SET
                current_bmi = p_bmi,
                current_category = p_category,
                current_height = p_height,
                current_weight = p_weight,
                current_age = p_age,
                current_gender = p_gender,
                calculation_count = calculation_count + 1,
                last_calculation = CURRENT_TIMESTAMP
            WHERE id = user_id_var;
        END IF;
    ELSE
        -- Create anonymous user
        INSERT INTO users (
            name, is_anonymous, current_bmi, current_category,
            current_height, current_weight, current_age, current_gender
        ) VALUES (
            NULL, TRUE, p_bmi, p_category,
            p_height, p_weight, p_age, p_gender
        );
        SET user_id_var = LAST_INSERT_ID();
        SET is_new_user = TRUE;
    END IF;
    
    -- Add to history
    INSERT INTO bmi_history (user_id, gender, height, weight, age, bmi, category)
    VALUES (user_id_var, p_gender, p_height, p_weight, p_age, p_bmi, p_category);
    
    -- Clean up old history (keep only last 10 records per user)
    DELETE FROM bmi_history 
    WHERE user_id = user_id_var 
    AND id NOT IN (
        SELECT id FROM (
            SELECT id FROM bmi_history 
            WHERE user_id = user_id_var 
            ORDER BY timestamp DESC 
            LIMIT 10
        ) AS recent_history
    );
    
    COMMIT;
    
    -- Return the user ID
    SELECT user_id_var as user_id, is_new_user;
END //

DELIMITER ;

-- Insert initial statistics
INSERT INTO app_statistics (metric_name, metric_value) VALUES
('database_version', JSON_OBJECT('version', '1.0', 'created_at', NOW())),
('migration_status', JSON_OBJECT('from', 'mongodb', 'to', 'mysql', 'completed_at', NOW()));
