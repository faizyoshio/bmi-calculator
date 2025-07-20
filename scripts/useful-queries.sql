-- Useful SQL Queries for BMI Calculator Database

-- 1. View all users with their latest BMI data
SELECT 
    id,
    name,
    CASE WHEN is_anonymous THEN 'Anonymous' ELSE 'Named' END as user_type,
    current_bmi,
    current_category,
    current_height,
    current_weight,
    current_age,
    current_gender,
    calculation_count,
    last_calculation
FROM users 
ORDER BY last_calculation DESC;

-- 2. Get BMI history for a specific user
SELECT 
    bh.*,
    u.name
FROM bmi_history bh
JOIN users u ON bh.user_id = u.id
WHERE u.name = 'John Doe'  -- Replace with actual name
ORDER BY bh.timestamp DESC;

-- 3. BMI category distribution
SELECT 
    current_category,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE current_category IS NOT NULL), 2) as percentage
FROM users 
WHERE current_category IS NOT NULL
GROUP BY current_category
ORDER BY user_count DESC;

-- 4. Average BMI by gender
SELECT 
    current_gender,
    COUNT(*) as count,
    ROUND(AVG(current_bmi), 2) as avg_bmi,
    ROUND(MIN(current_bmi), 2) as min_bmi,
    ROUND(MAX(current_bmi), 2) as max_bmi
FROM users 
WHERE current_bmi IS NOT NULL AND current_gender IS NOT NULL
GROUP BY current_gender;

-- 5. Recent activity (last 7 days)
SELECT 
    DATE(last_calculation) as date,
    COUNT(*) as calculations
FROM users 
WHERE last_calculation >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(last_calculation)
ORDER BY date DESC;

-- 6. Users with multiple calculations
SELECT 
    name,
    calculation_count,
    current_bmi,
    current_category,
    last_calculation
FROM users 
WHERE calculation_count > 1 AND name IS NOT NULL
ORDER BY calculation_count DESC;

-- 7. BMI trends for a user (requires history)
SELECT 
    bh.timestamp,
    bh.bmi,
    bh.category,
    bh.weight,
    LAG(bh.bmi) OVER (ORDER BY bh.timestamp) as previous_bmi,
    bh.bmi - LAG(bh.bmi) OVER (ORDER BY bh.timestamp) as bmi_change
FROM bmi_history bh
JOIN users u ON bh.user_id = u.id
WHERE u.name = 'John Doe'  -- Replace with actual name
ORDER BY bh.timestamp;

-- 8. Database health check
SELECT 
    'Total Users' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Named Users' as metric,
    COUNT(*) as value
FROM users WHERE name IS NOT NULL
UNION ALL
SELECT 
    'Anonymous Users' as metric,
    COUNT(*) as value
FROM users WHERE is_anonymous = TRUE
UNION ALL
SELECT 
    'Total Calculations' as metric,
    SUM(calculation_count) as value
FROM users
UNION ALL
SELECT 
    'History Records' as metric,
    COUNT(*) as value
FROM bmi_history;

-- 9. Find users by BMI range
SELECT 
    name,
    current_bmi,
    current_category,
    current_height,
    current_weight
FROM users 
WHERE current_bmi BETWEEN 18.5 AND 24.9  -- Normal range
AND name IS NOT NULL
ORDER BY current_bmi;

-- 10. Clean up old anonymous users (older than 30 days)
-- DELETE FROM users 
-- WHERE is_anonymous = TRUE 
-- AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
-- (Uncomment to execute - be careful!)
