-- Reset user1 password to 'password123'
-- The BCrypt hash below is for 'password123'

UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'user1@yopmail.com';

-- If user1 doesn't exist, create it
INSERT INTO users (email, password, full_name, role, created_at)
SELECT 'user1@yopmail.com', 
       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
       'User One',
       'USER',
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user1@yopmail.com');

-- Verify
SELECT id, email, full_name, role FROM users WHERE email = 'user1@yopmail.com';
