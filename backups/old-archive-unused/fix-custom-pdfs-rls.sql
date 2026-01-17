-- Fix RLS policies for custom_pdfs table
-- Run this if you already created the table and are getting RLS errors

-- First, drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage custom_pdfs" ON custom_pdfs;
DROP POLICY IF EXISTS "Allow public read access to custom_pdfs" ON custom_pdfs;
DROP POLICY IF EXISTS "Allow authenticated insert on custom_pdfs" ON custom_pdfs;
DROP POLICY IF EXISTS "Allow authenticated update on custom_pdfs" ON custom_pdfs;
DROP POLICY IF EXISTS "Allow authenticated delete on custom_pdfs" ON custom_pdfs;
DROP POLICY IF EXISTS "Allow all operations on custom_pdfs" ON custom_pdfs;

-- For Development: Allow all operations (no authentication required)
-- Use this to test the upload functionality
CREATE POLICY "Allow all operations on custom_pdfs" 
ON custom_pdfs FOR ALL 
USING (true)
WITH CHECK (true);

-- After testing, you can replace the above with these production policies:
-- 
-- -- Allow public read access
-- DROP POLICY IF EXISTS "Allow all operations on custom_pdfs" ON custom_pdfs;
-- 
-- CREATE POLICY "Allow public read access to custom_pdfs" 
-- ON custom_pdfs FOR SELECT 
-- USING (true);
-- 
-- CREATE POLICY "Allow authenticated insert on custom_pdfs" 
-- ON custom_pdfs FOR INSERT 
-- WITH CHECK (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow authenticated update on custom_pdfs" 
-- ON custom_pdfs FOR UPDATE 
-- USING (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow authenticated delete on custom_pdfs" 
-- ON custom_pdfs FOR DELETE 
-- USING (auth.role() = 'authenticated');

