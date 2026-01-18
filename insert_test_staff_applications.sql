-- Insert test staff applications for demo purposes
-- Run this script to add sample staff applications that will show in admin dashboard

-- First, let's make sure we have some test users (if they don't exist)
INSERT IGNORE INTO users (username, email, password, full_name, role) VALUES
('testuser1', 'testuser1@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Smith', 'USER'),
('testuser2', 'testuser2@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah Johnson', 'USER'),
('testuser3', 'testuser3@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike Davis', 'USER');

-- Insert test staff applications
INSERT INTO staff_applications (
    user_id, 
    categories, 
    experience, 
    skills, 
    availability, 
    motivation, 
    previous_experience,
    status,
    created_at
) VALUES 
-- Application 1: John Smith
((SELECT id FROM users WHERE email = 'testuser1@resolveit.com'),
 '["Technical Issues", "Website/App Issues", "Account Management"]',
 '3-5 years',
 'Problem-solving, Technical troubleshooting, Communication, Customer service, Java, Spring Boot',
 'Full-time (40+ hours/week)',
 'I want to help users resolve their technical issues quickly and efficiently. I have experience in customer support and enjoy problem-solving.',
 'Worked as technical support representative for 4 years at XYZ Company. Handled customer inquiries, troubleshooting, and escalations. Also have experience with Java development.',
 'PENDING',
 NOW()),

-- Application 2: Sarah Johnson  
((SELECT id FROM users WHERE email = 'testuser2@resolveit.com'),
 '["General Inquiries", "Services", "Infrastructure"]',
 '1-3 years',
 'Communication, Customer service, Organization, Time management, Microsoft Office',
 'Part-time (20-30 hours/week)',
 'I enjoy helping people and have excellent communication skills. I want to contribute to improving user experience.',
 'Customer service representative at ABC Corp for 2 years. Handled phone and email support, maintained customer satisfaction ratings above 95%.',
 'PENDING',
 DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Application 3: Mike Davis
((SELECT id FROM users WHERE email = 'testuser3@resolveit.com'),
 '["Technical Issues", "Infrastructure", "Account Management"]',
 '5+ years',
 'System administration, Network troubleshooting, Database management, Linux, Windows Server',
 'Full-time (40+ hours/week)',
 'I have extensive technical background and want to help resolve complex technical issues. I believe in providing excellent customer service.',
 'System Administrator for 6 years at DEF Technologies. Managed servers, databases, and provided technical support to internal teams. Also handled customer escalations.',
 'PENDING',
 DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Verify the insertions
SELECT 
    sa.id,
    u.full_name,
    u.email,
    sa.experience,
    sa.availability,
    sa.status,
    sa.created_at
FROM staff_applications sa
JOIN users u ON sa.user_id = u.id
WHERE sa.status = 'PENDING'
ORDER BY sa.created_at DESC;

SELECT 'Test staff applications inserted successfully!' as message;