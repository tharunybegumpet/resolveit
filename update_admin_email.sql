-- Update admin email address to tharuny.begumpet@gmail.com
-- First, check if the email is already in use by another user
SELECT 'Checking for existing email...' AS status;
SELECT id, full_name, email, role FROM users WHERE email = 'tharuny.begumpet@gmail.com';

-- Update the admin user's email (using ID or current email)
UPDATE users 
SET email = 'tharuny.begumpet@gmail.com' 
WHERE role = 'ADMIN' AND email = 'admin@resolveit.com';

-- If the above doesn't work, try updating by ID (usually ID 1 is admin)
-- UPDATE users SET email = 'tharuny.begumpet@gmail.com' WHERE id = 1 AND role = 'ADMIN';

-- Verify the update
SELECT 'Admin user updated:' AS status;
SELECT id, full_name, email, role FROM users WHERE role = 'ADMIN';
