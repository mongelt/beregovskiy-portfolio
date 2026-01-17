# Custom PDFs Database Setup

## Create Custom PDFs Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create custom_pdfs table
CREATE TABLE custom_pdfs (
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

-- Add RLS policies
ALTER TABLE custom_pdfs ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to custom_pdfs" ON custom_pdfs
  FOR SELECT USING (true);

-- Allow authenticated users to manage custom_pdfs (for admin panel)
CREATE POLICY "Allow authenticated users to manage custom_pdfs" ON custom_pdfs
  FOR ALL USING (auth.role() = 'authenticated');

-- Create index for ordering
CREATE INDEX idx_custom_pdfs_order ON custom_pdfs(order_index);

-- Create index for category filtering
CREATE INDEX idx_custom_pdfs_category ON custom_pdfs(category);
```

## Categories for Custom PDFs

Suggested categories:
- `resume` - Resume documents
- `portfolio` - Portfolio documents  
- `certificates` - Certificates and credentials
- `reports` - Reports and whitepapers
- `general` - General documents

## Usage

This table will store custom PDF files that are separate from content items, allowing you to:
- Upload resume PDFs
- Upload portfolio PDFs
- Upload certificates
- Upload any other custom documents
- Display them on the Downloads page
- Add download buttons to the Resume page
