-- Check total number of users
SELECT COUNT(*) AS total_users FROM users;

-- Count users by role
SELECT role, COUNT(*) AS count 
FROM users 
GROUP BY role;

-- List all users
SELECT id, full_name, email, role, username 
FROM users 
ORDER BY id;
