-- Simple escalation table script (no ALTER commands)
-- Run this script to add escalation functionality

-- Create escalations table
CREATE TABLE escalations (
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
    FOREIGN KEY (escalated_to_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add ESCALATED status
INSERT IGNORE INTO complaint_status (code, display) VALUES ('ESCALATED', 'Escalated');

-- Show success message
SELECT 'Escalation table created successfully!' as message;