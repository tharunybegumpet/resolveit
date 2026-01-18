-- Quick fix: Add test staff applications to see them in admin dashboard
-- Run this in your MySQL resolveit database

-- Add test users if they don't exist
INSERT IGNORE INTO users (username, email, password, full_name, role) VALUES
('testuser1', 'testuser1@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Smith', 'USER'),
('testuser2', 'testuser2@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah Johnson', 'USER'),
('testuser3', 'testuser3@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike Davis', 'USER');

-- Add test staff applications
INSERT INTO staff_applications (user_id, categories, experience, skills, availability, motivation, previous_experience, status, created_at) VALUES
((SELECT id FROM users WHERE email = 'testuser1@resolveit.com'), '["Technical Issues", "Website/App Issues"]', '3-5 years', 'Problem-solving, Java, Spring Boot, Customer service', 'Full-time (40+ hours/week)', 'I want to help users resolve technical issues efficiently', 'Technical support representative for 4 years at XYZ Company', 'PENDING', NOW()),
((SELECT id FROM users WHERE email = 'testuser2@resolveit.com'), '["General Inquiries", "Services"]', '1-3 years', 'Communication, Customer service, Organization', 'Part-time (20-30 hours/week)', 'I enjoy helping people and have excellent communication skills', 'Customer service representative for 2 years at ABC Corp', 'PENDING', DATE_SUB(NOW(), INTERVAL 1 DAY)),
((SELECT id FROM users WHERE email = 'testuser3@resolveit.com'), '["Technical Issues", "Infrastructure"]', '5+ years', 'System administration, Network troubleshooting, Linux', 'Full-time (40+ hours/week)', 'I have extensive technical background and want to help resolve complex issues', 'System Administrator for 6 years at DEF Technologies', 'PENDING', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Verify the data
SELECT 'Staff applications added successfully!' as message;
SELECT COUNT(*) as pending_applications FROM staff_applications WHERE status = 'PENDING';