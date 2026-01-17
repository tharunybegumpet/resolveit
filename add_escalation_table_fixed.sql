-- Fixed escalation table script for MySQL compatibility
-- Run this script to add escalation functionality to your existing database

-- Create escalations table
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

-- Check if created_at column exists before adding it
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'complaints' 
     AND COLUMN_NAME = 'created_at') = 0,
    'ALTER TABLE complaints ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT "created_at column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if updated_at column exists before adding it
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'complaints' 
     AND COLUMN_NAME = 'updated_at') = 0,
    'ALTER TABLE complaints ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT "updated_at column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure ESCALATED status exists in complaint_status table
INSERT IGNORE INTO complaint_status (code, display) VALUES ('ESCALATED', 'Escalated');

-- Show the structure of the new table
DESCRIBE escalations;

-- Show confirmation message
SELECT 'Escalation module database setup completed successfully!' as status;