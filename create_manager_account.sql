-- Create a manager account
-- Password: manager123 (BCrypt hash)

INSERT INTO users (email, password, full_name, role, created_at)
VALUES (
    'manager1@yopmail.com',
    '$2a$10$rZ3qLgs5CxGhKJLqLqLqLOXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXu',
    'Manager One',
    'MANAGER',
    NOW()
);

-- Verify the manager was created
SELECT id, email, full_name, role FROM users WHERE role = 'MANAGER';
