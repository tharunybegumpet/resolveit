-- Add escalation table for the escalation module
-- Run this script to add escalation functionality to your existing database

CREATE TABLE IF NOT EXISTS escalations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    escalated_by_id BIGINT,
    escalated_to_id BIGINT NOT NULL,
    escalation_reason TEXT,
    escalation_type ENUM('MANUAL', 'AUTOMATIC', 'PRIORITY') NOT NULL DEFAULT 'MANUAL',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Foreign key constraints
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (escalated_by_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (escalated_to_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_complaint_id (complaint_id),
    INDEX idx_escalated_to (escalated_to_id),
    INDEX idx_escalated_by (escalated_by_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Add created_at and updated_at columns to complaints table if they don't exist
-- This helps with auto-escalation timing
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Ensure ESCALATED status exists in complaint_status table
INSERT IGNORE INTO complaint_status (code, display) VALUES ('ESCALATED', 'Escalated');

-- Sample data for testing (optional)
-- Uncomment the lines below if you want to add some test escalations

/*
-- Insert a sample escalation (make sure the IDs exist in your database)
INSERT INTO escalations (complaint_id, escalated_by_id, escalated_to_id, escalation_reason, escalation_type) 
VALUES (1, 2, 1, 'Complaint requires immediate attention from higher authority', 'MANUAL');

-- Update the complaint status to escalated
UPDATE complaints SET status_id = (SELECT id FROM complaint_status WHERE code = 'ESCALATED') WHERE id = 1;
*/

-- Show the structure of the new table
DESCRIBE escalations;