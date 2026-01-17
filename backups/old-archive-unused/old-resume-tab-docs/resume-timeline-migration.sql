-- Resume Timeline Database Migration
-- Adds new fields and tables for the redesigned resume timeline

-- 1. Add new columns to resume_entries table
ALTER TABLE resume_entries ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE resume_entries ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id);

-- 2. Create resume_assets table for linking assets to resume entries
CREATE TABLE IF NOT EXISTS resume_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_entry_id UUID NOT NULL REFERENCES resume_entries(id) ON DELETE CASCADE,
  asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('content', 'link')),
  content_id UUID REFERENCES content(id),
  link_url TEXT,
  link_title TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resume_assets_entry_id ON resume_assets(resume_entry_id);
CREATE INDEX IF NOT EXISTS idx_resume_assets_order ON resume_assets(resume_entry_id, order_index);

-- 4. Clear existing resume_entry_types and seed with position types
DELETE FROM resume_entry_types;

INSERT INTO resume_entry_types (id, name, icon, order_index) VALUES
  (uuid_generate_v4(), 'Left Side', '←', 0),
  (uuid_generate_v4(), 'Right Side', '→', 1),
  (uuid_generate_v4(), 'Center', '•', 2);

-- 5. Add RLS policies for resume_assets table
ALTER TABLE resume_assets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage resume assets
CREATE POLICY "Users can manage resume assets" ON resume_assets
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow public read access to resume assets
CREATE POLICY "Public can read resume assets" ON resume_assets
  FOR SELECT USING (true);
