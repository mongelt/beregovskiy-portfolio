-- Create custom_pdfs table for storing uploaded PDF files
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

-- Allow public read access (so users can download PDFs)
CREATE POLICY "Allow public read access to custom_pdfs" 
ON custom_pdfs FOR SELECT 
USING (true);

-- Allow authenticated users to insert custom_pdfs
CREATE POLICY "Allow authenticated insert on custom_pdfs" 
ON custom_pdfs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update custom_pdfs
CREATE POLICY "Allow authenticated update on custom_pdfs" 
ON custom_pdfs FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete custom_pdfs
CREATE POLICY "Allow authenticated delete on custom_pdfs" 
ON custom_pdfs FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_pdfs_order ON custom_pdfs(order_index);
CREATE INDEX IF NOT EXISTS idx_custom_pdfs_category ON custom_pdfs(category);
CREATE INDEX IF NOT EXISTS idx_custom_pdfs_created ON custom_pdfs(created_at DESC);

-- Add a comment to the table
COMMENT ON TABLE custom_pdfs IS 'Stores custom PDF files for downloads, resumes, and other documents';

