-- Add category column to complaints table
ALTER TABLE complaints 
ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'General';

-- Update existing complaints to have a default category
UPDATE complaints SET category = 'General' WHERE category IS NULL OR category = '';

SELECT 'Category column added successfully!' AS message;
