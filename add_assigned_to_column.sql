-- Add assigned_to_id column if it doesn't exist
USE resolveit;

-- Check if column exists and add if missing
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = 'resolveit' 
AND table_name = 'complaints' 
AND column_name = 'assigned_to_id';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE complaints ADD COLUMN assigned_to_id INT NULL, ADD FOREIGN KEY (assigned_to_id) REFERENCES users(id)',
    'SELECT "Column assigned_to_id already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show table structure
DESCRIBE complaints;