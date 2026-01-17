-- Check user1 details
SELECT id, email, full_name, role, password 
FROM users 
WHERE email = 'user1@yopmail.com';

-- If user1 doesn't exist, show all users
SELECT id, email, full_name, role 
FROM users 
ORDER BY role, id;
