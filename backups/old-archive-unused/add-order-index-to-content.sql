-- Add order_index column to content table for manual ordering

ALTER TABLE content ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_content_order ON content(order_index);

-- Update existing content with sequential order based on created_at
UPDATE content SET order_index = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY subcategory_id ORDER BY created_at DESC) - 1 as row_num
  FROM content
) AS subquery
WHERE content.id = subquery.id;

-- Note: This allows you to manually reorder content items
-- Lower order_index = appears first in lists
-- You can update order_index manually in the admin panel


