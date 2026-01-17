-- Create custom_pdfs table for storing uploaded PDF files
-- DEVELOPMENT VERSION: More permissive RLS policies for testing
CREATE TABLE IF NOT EXISTS custom_pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE custom_pdfs ENABLE ROW LEVEL SECURITY;

-- TEMPORARY: Allow all operations for development
-- Replace these with proper policies in production
CREATE POLICY "Allow all operations on custom_pdfs" 
ON custom_pdfs FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_pdfs_order ON custom_pdfs(order_index);
CREATE INDEX IF NOT EXISTS idx_custom_pdfs_category ON custom_pdfs(category);
CREATE INDEX IF NOT EXISTS idx_custom_pdfs_created ON custom_pdfs(created_at DESC);

-- Add a comment to the table
COMMENT ON TABLE custom_pdfs IS 'Stores custom PDF files for downloads, resumes, and other documents';

-- NOTE: This development version allows ALL operations without authentication.
-- Before deploying to production, drop this policy and use the production policies from create-custom-pdfs-table.sql

