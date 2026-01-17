-- Add SUPERADMIN user for escalation
-- This user will receive all escalated complaints

-- Insert SUPERADMIN user
INSERT INTO users (full_name, email, password, role, created_at) VALUES
('Super Administrator', 'superadmin@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SUPERADMIN', NOW());

-- Check if the user was created
SELECT 
    id,
    full_name,
    email,
    role,
    created_at
FROM users 
WHERE role = 'SUPERADMIN'
ORDER BY id;

-- Also show all admin-level users
SELECT 
    id,
    full_name,
    email,
    role,
    created_at
FROM users 
WHERE role IN ('ADMIN', 'SUPERADMIN')
ORDER BY role, id;