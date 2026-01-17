-- Create Manager user for ResolveIT system
-- Manager can handle escalated complaints from staff

USE resolveit;

-- Insert manager user with hashed password (password: manager123)
INSERT INTO users (full_name, email, password, role, created_at) 
VALUES (
    'Manager One',
    'manager1@yopmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: manager123
    'MANAGER',
    NOW()
);

-- Verify the manager user was created
SELECT 'MANAGER USER CREATED:' as info;
SELECT id, full_name, email, role FROM users WHERE role = 'MANAGER';

-- Show login credentials
SELECT 'LOGIN CREDENTIALS:' as info;
SELECT 
    'Email: manager1@yopmail.com' as credential_1,
    'Password: manager123' as credential_2,
    'Role: MANAGER' as credential_3;

SELECT 'Manager user creation completed successfully!' as status;
