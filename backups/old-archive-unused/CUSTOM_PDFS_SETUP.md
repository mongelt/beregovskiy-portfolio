# Custom PDFs Setup Instructions

## Step 1: Create the Database Table

You need to run the SQL script to create the `custom_pdfs` table in your Supabase database.

### Instructions:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Choose Your SQL Script**
   
   **Option A: Development (Recommended for Testing)**
   - Use `create-custom-pdfs-table-dev.sql`
   - This allows ALL operations without authentication
   - Perfect for testing the upload feature
   - **Note:** Switch to production policies before going live
   
   **Option B: Production (Secure)**
   - Use `create-custom-pdfs-table.sql`
   - Requires proper authentication
   - More secure but may need auth configuration

4. **Copy and Run the SQL Script**
   - Open your chosen file
   - Copy all the contents
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter / Cmd+Enter)

5. **Verify Success**
   - You should see "Success. No rows returned"
   - Navigate to "Table Editor" → "custom_pdfs" to verify the table exists

### If You Get RLS (Row Level Security) Errors

If you see: `"new row violates row-level security policy"`

**Quick Fix:**
1. Open `fix-custom-pdfs-rls.sql`
2. Copy and run it in Supabase SQL Editor
3. This will update the policies to allow all operations
4. Try uploading again

## Step 2: Upload PDFs

Once the table is created:

1. Go to your app's admin panel: `http://localhost:3000/admin`
2. Click on "Custom PDFs" in the navigation
3. Select a PDF file
4. Choose a category:
   - **resume** - Will appear as download buttons on Resume page
   - **portfolio** - Portfolio documents
   - **certificates** - Certificates and credentials
   - **reports** - Reports and whitepapers
   - **general** - General documents
5. Click "Choose File" to upload

## Table Structure

The `custom_pdfs` table has the following columns:

- `id` - UUID (auto-generated)
- `title` - PDF title (extracted from filename)
- `description` - Optional description
- `file_url` - File storage URL (data URL for now)
- `file_name` - Original filename
- `category` - Category (resume, portfolio, etc.)
- `order_index` - Display order
- `is_featured` - Featured flag
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

## Where PDFs Appear

- **All PDFs**: Downloads page (`/` → Downloads tab)
- **Resume PDFs**: Resume page (`/` → Resume tab, top-right corner)
- **Categories**: Filter by category on Downloads page

## Troubleshooting

### Error: "Table does not exist"

**Solution**: Run the SQL script in `create-custom-pdfs-table.sql`

### Error: "Failed to upload PDF"

**Possible causes**:
1. Table doesn't exist - run SQL script
2. RLS policies not set - SQL script includes policies
3. Not authenticated - make sure you're logged in to admin panel
4. File size too large - data URLs have size limits (consider using Supabase Storage for production)

### Large PDF Files

The current implementation uses data URLs (base64 encoding) which can make the database large for big PDFs.

**For production**, consider:
1. Using Supabase Storage
2. Using Cloudinary
3. Using AWS S3
4. Other file storage services

The admin panel can be updated to use proper file storage instead of data URLs.

## Security Notes

- Public read access is enabled (users can download PDFs)
- Only authenticated users can upload/manage PDFs
- RLS policies are enforced
- Admin panel requires authentication

## Next Steps

After setting up custom PDFs, you can:
1. Upload your resume PDF
2. Upload portfolio documents
3. Upload certificates
4. Create downloadable content in the admin panel
5. Enable downloads for existing content items

