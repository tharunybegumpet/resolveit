-- Create test complaints with RESOLVED and CLOSED status for testing
-- This script creates sample resolved complaints to test the resolved complaints feature

-- First, let's check current status codes
SELECT 'Current Status Codes:' as info;
SELECT id, code, display FROM complaint_status ORDER BY id;

-- Get RESOLVED and CLOSED status IDs
SET @resolved_status_id = (SELECT id FROM complaint_status WHERE code = 'RESOLVED' LIMIT 1);
SET @closed_status_id = (SELECT id FROM complaint_status WHERE code = 'CLOSED' LIMIT 1);

-- Insert test resolved complaints
INSERT INTO complaints (title, description, user_id, status_id, anonymous, created_at, updated_at) VALUES
('Resolved: Email Notification Issue', 'Email notifications were not working properly. Issue has been fixed by updating SMTP configuration.', 1, @resolved_status_id, false, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
('Resolved: Database Connection Problem', 'Database connection was timing out. Resolved by optimizing connection pool settings.', 2, @resolved_status_id, false, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
('Closed: Duplicate Account Request', 'User requested duplicate account creation. Closed as user already has an active account.', 1, @closed_status_id, false, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
('Resolved: File Upload Size Limit', 'Users unable to upload large files. Resolved by increasing file size limit to 10MB.', 3, @resolved_status_id, false, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('Closed: Spam Report', 'Report about spam content. Closed after investigation - content was legitimate.', 2, @closed_status_id, false, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- Assign some complaints to staff members (if staff exists)
UPDATE complaints 
SET assigned_to = (SELECT id FROM users WHERE role = 'STAFF' LIMIT 1)
WHERE title LIKE 'Resolved:%' OR title LIKE 'Closed:%';

-- Show the created resolved complaints
SELECT 'Created Resolved/Closed Complaints:' as info;
SELECT 
    c.id,
    c.title,
    c.description,
    u.full_name as raised_by,
    cs.display as status,
    cs.code as status_code,
    staff.full_name as assigned_to,
    c.created_at,
    c.updated_at
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN complaint_status cs ON c.status_id = cs.id
LEFT JOIN users staff ON c.assigned_to = staff.id
WHERE cs.code IN ('RESOLVED', 'CLOSED')
ORDER BY c.updated_at DESC;

-- Show total count
SELECT 
    cs.display as status,
    COUNT(*) as count
FROM complaints c
JOIN complaint_status cs ON c.status_id = cs.id
WHERE cs.code IN ('RESOLVED', 'CLOSED')
GROUP BY cs.display;