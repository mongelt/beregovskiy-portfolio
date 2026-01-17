# Phase 6 - Admin Authentication and RLS (Planning)
Source: `docs/website-development/website-roadmap.md` lines 185-205.

### Notes (confirmed)
- Authentication method: Google SSO.
- Whitelisted Google accounts: andrey.beregovskiy@gmail.com, mongelt@gmail.com.
- RLS: all data tables must be protected.

### Gaps / open items
- RLS scope confirmed: all `public` tables listed below.

### Plan – steps only (Phase 6)
#### Step 1: Confirm access list and scope
- Confirm Google SSO is the final choice.
- Confirm the two allowed Google accounts.
- Confirm the exact list of tables that need RLS.
- **Decision**: Apply RLS to all `public` tables only (do not touch `auth`, `storage`, `realtime`, `vault`).
Full list of tables: 
| table_schema | table_name                 |
| ------------ | -------------------------- |
| public       | byline_options             |
| public       | categories                 |
| public       | collections                |
| public       | content                    |
| public       | content_collections        |
| public       | custom_pdfs                |
| public       | downloadable_files         |
| public       | link_options               |
| public       | profile                    |
| public       | profile_skills             |
| public       | resume_asset_icons         |
| public       | resume_assets              |
| public       | resume_entries             |
| public       | resume_entry_types         |
| public       | subcategories              |

#### Step 2: Google SSO setup in Supabase
- Enable Google provider in Supabase Auth.
- Configure redirect URL and credentials.
- **Redirect URL (confirmed)**: https://isdrnrovlfhfromoohbj.supabase.co/auth/v1/callback
- **Status**: Google OAuth Client ID + Client Secret created and added in Supabase.
- **Note**: Credentials are configured in Supabase only (not stored in this repo).

##### Google OAuth setup instructions (short)
1) Open Google Cloud Console.
2) Create a new project (or use an existing one).
3) Go to “APIs & Services” → “OAuth consent screen”.
4) Choose “External”, fill in the required fields, and save.
5) Go to “Credentials” → “Create Credentials” → “OAuth client ID”.
6) Choose “Web application”.
7) Add the Supabase redirect URL as an “Authorized redirect URI”.
8) Create the client.
9) Copy the Client ID and Client Secret and paste them here.

#### Step 3: Frontend auth wiring + persistent session
- Add auth flow to the frontend.
- Keep the admin user logged in across browser sessions.

#### Step 4: Create `/admin/login` page
- Build the login page and connect it to Google SSO.
- Status: Login page created with Google sign-in button (needs testing).

#### Step 5: Protect all `/admin/*` routes
- Redirect unauthenticated users to the front page.
- Status: Route guard added (needs testing).

#### Step 6: Add RLS to all required tables
- Enable RLS on each listed table.
- Add policies that allow only the admin user to read/write.
- Status: Ready to apply RLS to all `public` tables.

##### RLS SQL (run in Supabase SQL editor)
```sql
-- Enable RLS on all public tables
alter table public.byline_options enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.content enable row level security;
alter table public.content_collections enable row level security;
alter table public.custom_pdfs enable row level security;
alter table public.downloadable_files enable row level security;
alter table public.link_options enable row level security;
alter table public.profile enable row level security;
alter table public.profile_skills enable row level security;
alter table public.resume_asset_icons enable row level security;
alter table public.resume_assets enable row level security;
alter table public.resume_entries enable row level security;
alter table public.resume_entry_types enable row level security;
alter table public.subcategories enable row level security;

-- Policy: allow read/write only for authenticated users
create policy "admin_read_write" on public.byline_options
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.collections
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.content
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.content_collections
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.custom_pdfs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.downloadable_files
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.link_options
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.profile
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.profile_skills
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.resume_asset_icons
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.resume_assets
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.resume_entries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.resume_entry_types
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_read_write" on public.subcategories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

#### Step 7: Phase 6 testing
- Test login flow.
- Test protected routes redirect.
- Test session persistence after browser restart.
- Test RLS access control.
- Status: Ready for user testing.

##### Testing checklist (Step 7)
1) Login page loads at `/admin/login`.
2) Google login succeeds and returns to `/admin`.
3) Unauthenticated access to `/admin` redirects to `/`.
4) Logged-in access to `/admin` works.
5) Session persists after closing and reopening the browser.
6) RLS blocks unauthenticated reads from `public` tables.