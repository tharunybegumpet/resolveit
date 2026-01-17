-- Create test staff members for complaint assignment
-- Make sure to run this after creating admin users

-- Insert staff member 1
INSERT INTO users (full_name, email, password, role, created_at) 
VALUES ('John Smith', 'john.staff@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STAFF', NOW())
ON DUPLICATE KEY UPDATE role = 'STAFF';

-- Insert staff member 2  
INSERT INTO users (full_name, email, password, role, created_at)
VALUES ('Sarah Johnson', 'sarah.staff@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STAFF', NOW())
ON DUPLICATE KEY UPDATE role = 'STAFF';

-- Insert staff member 3
INSERT INTO users (full_name, email, password, role, created_at)
VALUES ('Mike Wilson', 'mike.staff@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STAFF', NOW())
ON DUPLICATE KEY UPDATE role = 'STAFF';

-- Verify staff members were created
SELECT id, full_name, email, role FROM users WHERE role = 'STAFF';