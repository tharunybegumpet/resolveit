-- Insert test complaints for user tracking verification
-- Make sure you have users and status codes first

-- Insert some test complaints
INSERT INTO complaints (title, description, user_id, status_id, anonymous, created_at) VALUES
('Website Login Issue', 'Unable to login to the website. Getting error message "Invalid credentials" even with correct password.', 1, 1, false, NOW()),
('Payment Processing Problem', 'Payment failed during checkout process. Money was deducted but order was not confirmed.', 2, 1, false, NOW()),
('Account Verification Delay', 'Account verification email not received after 24 hours of registration.', 1, 2, false, NOW()),
('Mobile App Crash', 'Mobile application crashes when trying to upload documents.', 3, 2, false, NOW()),
('Data Export Feature', 'Unable to export data in CSV format. Download button is not working.', 2, 3, false, NOW());

-- Check what we inserted
SELECT 
    c.id,
    c.title,
    c.description,
    u.full_name as raised_by,
    cs.display as status,
    c.created_at
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN complaint_status cs ON c.status_id = cs.id
ORDER BY c.id;

-- Also check available users and status codes
SELECT 'USERS:' as info;
SELECT id, full_name, email, role FROM users ORDER BY id;

SELECT 'STATUS CODES:' as info;
SELECT id, code, display FROM complaint_status ORDER BY id;