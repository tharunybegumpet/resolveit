-- Create staff_applications table for the staff application system
-- This table stores user applications to become staff members

CREATE TABLE IF NOT EXISTS staff_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    categories TEXT,
    experience TEXT,
    skills TEXT,
    availability VARCHAR(255),
    motivation TEXT,
    previous_experience TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    admin_notes TEXT,
    reviewed_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_status (user_id, status),
    INDEX idx_status_created (status, created_at),
    INDEX idx_reviewed_by (reviewed_by)
);

-- Insert some sample data for testing (optional)
-- You can uncomment these lines if you want test data

/*
-- Sample staff application (assuming user with ID 2 exists)
INSERT INTO staff_applications (
    user_id, 
    categories, 
    experience, 
    skills, 
    availability, 
    motivation, 
    previous_experience,
    status
) VALUES (
    2,
    '["Technical Issues", "Website/App Issues", "Account Management"]',
    '3-5 years',
    'Problem-solving, Technical troubleshooting, Communication, Customer service',
    'Full-time (40+ hours/week)',
    'I want to help users resolve their technical issues quickly and efficiently. I have experience in customer support and enjoy problem-solving.',
    'Worked as technical support representative for 4 years at XYZ Company. Handled customer inquiries, troubleshooting, and escalations.',
    'PENDING'
);
*/

-- Verify table creation
SELECT 'staff_applications table created successfully' as status;