-- Create admin user for ResolveIT system
-- This script creates a default admin user for the system
-- Admin registration has been removed from the frontend for security

USE resolveit;

-- Insert admin user with hashed password (password: admin123)
INSERT INTO users (full_name, username, email, password_hash, role) 
VALUES (
    'System Administrator',
    'admin',
    'tharuny.begumpet@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    'ADMIN'
) ON DUPLICATE KEY UPDATE 
    email = 'tharuny.begumpet@gmail.com',
    password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role = 'ADMIN';

-- Create additional admin users (optional - uncomment if needed)
/*
INSERT INTO users (full_name, username, email, password_hash, role) VALUES
('John Admin', 'johnadmin', 'john.admin@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('Jane Manager', 'janemanager', 'jane.manager@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');
*/

-- Verify the admin users were created
SELECT 'ADMIN USERS CREATED:' as info;
SELECT id, full_name, username, email, role FROM users WHERE role = 'ADMIN';

-- Show login credentials
SELECT 'LOGIN CREDENTIALS:' as info;
SELECT 
    'Email: tharuny.begumpet@gmail.com' as credential_1,
    'Password: admin123' as credential_2,
    'Role: ADMIN' as credential_3;

SELECT 'Admin user creation completed successfully!' as status;