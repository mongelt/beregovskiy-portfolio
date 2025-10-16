# Database Setup Instructions

## 🗄️ Supabase Database Schema

**IMPORTANT:** Run these SQL commands in your Supabase SQL Editor to create all tables.

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your project: `isdrnrovlfhfromoohbj`
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Delete Old Tables (if any exist)
```sql
-- Run this first to clean up old schema
DROP TABLE IF EXISTS content_collections CASCADE;
DROP TABLE IF EXISTS resume_entries CASCADE;
DROP TABLE IF EXISTS resume_entry_types CASCADE;
DROP TABLE IF EXISTS downloadable_files CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profile CASCADE;
```

### Step 3: Create New Schema
Copy and paste this entire block:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profile Table
CREATE TABLE profile (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT,
  location TEXT,
  job_title_1 TEXT,
  job_title_2 TEXT,
  job_title_3 TEXT,
  job_title_4 TEXT,
  profile_image TEXT,
  short_bio TEXT,
  full_bio TEXT,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_social_media BOOLEAN DEFAULT false,
  skills TEXT[],
  languages TEXT[],
  education TEXT,
  executive_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Categories Table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Subcategories Table
CREATE TABLE subcategories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(category_id, name)
);

-- 4. Content Table
CREATE TABLE content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('article', 'image', 'video', 'audio')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  sidebar_title TEXT,
  sidebar_subtitle TEXT,
  content_body JSONB,
  image_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  author_name TEXT,
  publication_name TEXT,
  publication_date TEXT,
  source_link TEXT,
  copyright_notice TEXT,
  download_enabled BOOLEAN DEFAULT false,
  external_download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Collections Table
CREATE TABLE collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Content-Collections Junction Table
CREATE TABLE content_collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(content_id, collection_id)
);

-- 7. Resume Entry Types Table
CREATE TABLE resume_entry_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8. Resume Entries Table
CREATE TABLE resume_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entry_type_id UUID REFERENCES resume_entry_types(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  date_start DATE,
  date_end DATE,
  description JSONB,
  media_urls TEXT[],
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 9. Downloadable Files Table
CREATE TABLE downloadable_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_type TEXT NOT NULL CHECK (file_type IN ('resume_full', 'resume_condensed', 'portfolio', 'content_item')),
  related_id UUID,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_content_category ON content(category_id);
CREATE INDEX idx_content_subcategory ON content(subcategory_id);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);
CREATE INDEX idx_content_collections_content ON content_collections(content_id);
CREATE INDEX idx_content_collections_collection ON content_collections(collection_id);
CREATE INDEX idx_resume_entries_type ON resume_entries(entry_type_id);
CREATE INDEX idx_resume_entries_featured ON resume_entries(is_featured);

-- Insert default profile (you can update this later)
INSERT INTO profile (full_name, location, short_bio)
VALUES ('Your Name', 'Your Location', 'Your professional summary here...');

-- Insert some default resume entry types
INSERT INTO resume_entry_types (name, icon, order_index) VALUES
('Jobs', '💼', 1),
('Education', '🎓', 2),
('Projects', '🚀', 3),
('Awards', '🏆', 4);
```

### Step 4: Enable Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_entry_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloadable_files ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Public read access" ON profile FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON content FOR SELECT USING (true);
CREATE POLICY "Public read access" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read access" ON content_collections FOR SELECT USING (true);
CREATE POLICY "Public read access" ON resume_entry_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON resume_entries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON downloadable_files FOR SELECT USING (true);

-- For now, allow all operations (we'll add authentication later)
CREATE POLICY "Allow all operations" ON profile FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON subcategories FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON content FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON collections FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON content_collections FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON resume_entry_types FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON resume_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON downloadable_files FOR ALL USING (true);
```

### Step 5: Verify
Run this to check all tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 9 tables:
- profile
- categories
- subcategories
- content
- collections
- content_collections
- resume_entry_types
- resume_entries
- downloadable_files

---

## ✅ Once Complete
Reply in chat: "Database setup complete!"
