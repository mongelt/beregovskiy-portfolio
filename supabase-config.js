// Supabase Configuration
// Replace these with your actual Supabase credentials

const SUPABASE_URL = 'https://isdrnrovlfhfromoohbj.supabase.co';  // Replace with your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHJucm92bGZoZnJvbW9vaGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTUwNzcsImV4cCI6MjA3NDk5MTA3N30.t1itS8JqKYGtFdPK-sMXUBC5ZLek6pFfDnQrb3zLI6w';  // Replace with your anon/public key

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);