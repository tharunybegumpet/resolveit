-- Fix user roles by adding a role column to users table
USE resolveit;

-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'USER';

-- Update existing users with their roles based on user_roles table
UPDATE users u 
SET role = 'ADMIN' 
WHERE u.id IN (
    SELECT ur.user_id 
    FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE r.name = 'ROLE_ADMIN'
);

UPDATE users u 
SET role = 'USER' 
WHERE u.id IN (
    SELECT ur.user_id 
    FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE r.name = 'ROLE_USER'
);

-- Show the updated users table
SELECT id, username, email, full_name, role FROM users;