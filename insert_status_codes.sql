-- Ensure complaint status codes exist
USE resolveit;

-- Insert status codes if they don't exist
INSERT IGNORE INTO complaint_status (code, display) VALUES
('NEW','New'),
('UNDER_REVIEW','Under Review'),
('IN_PROGRESS','In Progress'),
('RESOLVED','Resolved'),
('ESCALATED','Escalated');

-- Show all status codes
SELECT * FROM complaint_status;