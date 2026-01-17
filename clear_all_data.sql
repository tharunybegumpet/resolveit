-- Clear all existing data from ResolveIT database
-- This will remove all users, complaints, staff applications, and related data
-- USE WITH CAUTION - This will delete ALL data!

USE resolveit;

-- Disable foreign key checks temporarily to avoid constraint issues
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all data from tables (in order to respect foreign key constraints)
DELETE FROM escalations;
DELETE FROM complaint_status_history;
DELETE FROM complaint_files;
DELETE FROM staff_applications;
DELETE FROM complaints;
DELETE FROM users;
DELETE FROM complaint_status;

-- Reset auto-increment counters
ALTER TABLE escalations AUTO_INCREMENT = 1;
ALTER TABLE complaint_status_history AUTO_INCREMENT = 1;
ALTER TABLE complaint_files AUTO_INCREMENT = 1;
ALTER TABLE staff_applications AUTO_INCREMENT = 1;
ALTER TABLE complaints AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE complaint_status AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Re-insert essential complaint status codes
INSERT INTO complaint_status (code, display, description) VALUES
('NEW', 'New', 'Newly submitted complaint'),
('IN_PROGRESS', 'In Progress', 'Complaint is being worked on'),
('RESOLVED', 'Resolved', 'Complaint has been resolved'),
('CLOSED', 'Closed', 'Complaint is closed'),
('ESCALATED', 'Escalated', 'Complaint has been escalated');

-- Verify all tables are empty
SELECT 'USERS COUNT:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'COMPLAINTS COUNT:', COUNT(*) FROM complaints
UNION ALL
SELECT 'STAFF APPLICATIONS COUNT:', COUNT(*) FROM staff_applications
UNION ALL
SELECT 'ESCALATIONS COUNT:', COUNT(*) FROM escalations
UNION ALL
SELECT 'STATUS CODES COUNT:', COUNT(*) FROM complaint_status;

SELECT 'DATABASE CLEARED SUCCESSFULLY - All user data, complaints, and staff applications have been removed!' as status;