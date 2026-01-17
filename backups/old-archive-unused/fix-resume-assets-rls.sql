-- Fix RLS policies for resume_assets table
-- Run this if you're getting 401 errors when trying to insert/delete resume_assets

-- First, drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage resume_assets" ON resume_assets;
DROP POLICY IF EXISTS "Allow public read access to resume_assets" ON resume_assets;
DROP POLICY IF EXISTS "Allow authenticated insert on resume_assets" ON resume_assets;
DROP POLICY IF EXISTS "Allow authenticated update on resume_assets" ON resume_assets;
DROP POLICY IF EXISTS "Allow authenticated delete on resume_assets" ON resume_assets;
DROP POLICY IF EXISTS "Allow all operations on resume_assets" ON resume_assets;

-- For Development: Allow all operations (no authentication required)
-- Use this to test the asset functionality
CREATE POLICY "Allow all operations on resume_assets" 
ON resume_assets FOR ALL 
USING (true)
WITH CHECK (true);

-- After testing, you can replace the above with these production policies:
-- 
-- -- Allow public read access
-- DROP POLICY IF EXISTS "Allow all operations on resume_assets" ON resume_assets;
-- 
-- CREATE POLICY "Allow public read access to resume_assets" 
-- ON resume_assets FOR SELECT 
-- USING (true);
-- 
-- CREATE POLICY "Allow authenticated insert on resume_assets" 
-- ON resume_assets FOR INSERT 
-- WITH CHECK (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow authenticated update on resume_assets" 
-- ON resume_assets FOR UPDATE 
-- USING (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow authenticated delete on resume_assets" 
-- ON resume_assets FOR DELETE 
-- USING (auth.role() = 'authenticated');
