-- Update complaint_files table to support enhanced file management
-- Run this SQL to add new columns for file type, category, size, and admin-only access

ALTER TABLE complaint_files 
ADD COLUMN original_file_name VARCHAR(255) AFTER file_name,
ADD COLUMN file_type VARCHAR(100) AFTER file_path,
ADD COLUMN file_category VARCHAR(50) AFTER file_type,
ADD COLUMN file_size BIGINT AFTER file_category,
ADD COLUMN admin_only BOOLEAN DEFAULT FALSE AFTER file_size,
ADD COLUMN uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER admin_only;

-- Update existing records to have default values
UPDATE complaint_files 
SET original_file_name = file_name,
    file_type = 'application/octet-stream',
    file_category = 'OTHER',
    file_size = 0,
    admin_only = FALSE
WHERE original_file_name IS NULL;

-- Show the updated table structure
DESCRIBE complaint_files;