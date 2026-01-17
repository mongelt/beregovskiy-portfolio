# Resume Timeline Database Schema

## Complete Database Information for Frontend Development

### Tables Overview

1. **profile** - User profile with executive summary
2. **resume_entries** - Main resume entries (jobs, projects, etc.)
3. **resume_entry_types** - Entry positioning types (Left Side, Right Side, Center)
4. **resume_assets** - Assets linked to resume entries (content items or custom links)
5. **collections** - Collection references for "Samples" buttons
6. **content** - Content items that can be linked as assets
7. **custom_pdfs** - Downloadable PDF files for the resume

---

## 1. Profile Table

**Table:** `profile`

**Columns:**
- `id` (UUID, Primary Key)
- `executive_summary` (JSONB) - EditorJS format for professional summary

**Frontend Usage:**
```typescript
const { data: profileData } = await supabase
  .from('profile')
  .select('executive_summary')
  .limit(1)
  .single()
```

---

## 2. Resume Entries Table

**Table:** `resume_entries`

**Columns:**
- `id` (UUID, Primary Key)
- `entry_type_id` (UUID, Foreign Key → resume_entry_types)
- `title` (TEXT) - Company name for left/right entries, Caption text for center entries
- `subtitle` (TEXT, nullable) - Job title for left/right entries, unused for center entries
- `date_start` (DATE, nullable) - Start date of the entry
- `date_end` (DATE, nullable) - End date of the entry (null = "Present")
- `short_description` (TEXT, nullable) - Plain text short description
- `description` (JSONB, nullable) - EditorJS format for full description
- `collection_id` (UUID, nullable, Foreign Key → collections) - Links to collection for "Samples" button
- `is_featured` (BOOLEAN, default: false) - Highlighted entries with special border
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Frontend Query:**
```typescript
const { data: entries } = await supabase
  .from('resume_entries')
  .select(`
    *,
    resume_entry_types(name, icon),
    collections(name, slug),
    resume_assets(
      id,
      asset_type,
      content_id,
      link_url,
      link_title,
      content(title, type)
    )
  `)
  .order('date_start', { ascending: false })
```

**TypeScript Type:**
```typescript
type ResumeEntry = {
  id: string
  title: string
  subtitle: string | null
  date_start: string | null
  date_end: string | null
  short_description: string | null
  description: any // EditorJS OutputData
  collection_id: string | null
  is_featured: boolean
  resume_entry_types: {
    name: string // 'Left Side' | 'Right Side' | 'Center'
    icon: string | null // '←' | '→' | '•'
  } | null
  collections?: {
    name: string
    slug: string
  } | null
  resume_assets?: ResumeAsset[]
}
```

---

## 3. Resume Entry Types Table

**Table:** `resume_entry_types`

**Purpose:** Controls positioning of entries on the timeline

**Columns:**
- `id` (UUID, Primary Key)
- `name` (VARCHAR) - 'Left Side', 'Right Side', or 'Center'
- `icon` (VARCHAR, nullable) - '←', '→', or '•'
- `order_index` (INTEGER, default: 0)

**Fixed Values:**
```sql
-- These should remain fixed:
('Left Side', '←', 0)   -- Entries positioned on left of timeline
('Right Side', '→', 1)  -- Entries positioned on right of timeline
('Center', '•', 2)      -- Entries positioned on center of timeline (captions)
```

**Frontend Usage:**
```typescript
// Determine entry position based on type name
const getEntryPosition = (entry: ResumeEntry): 'left' | 'right' | 'center' => {
  const typeName = entry.resume_entry_types?.name
  if (typeName === 'Left Side') return 'left'
  if (typeName === 'Right Side') return 'right'
  if (typeName === 'Center') return 'center'
  return 'left' // default
}
```

---

## 4. Resume Assets Table

**Table:** `resume_assets`

**Purpose:** Links content items or custom URLs to resume entries

**Columns:**
- `id` (UUID, Primary Key)
- `resume_entry_id` (UUID, Foreign Key → resume_entries, CASCADE DELETE)
- `asset_type` (VARCHAR) - 'content' or 'link'
- `content_id` (UUID, nullable, Foreign Key → content)
- `link_url` (TEXT, nullable) - For custom links
- `link_title` (TEXT, nullable) - Display text for custom links
- `order_index` (INTEGER, default: 0) - Display order
- `created_at` (TIMESTAMPTZ)

**Asset Types:**
1. **'content'** - Links to existing content item
   - `content_id` is set
   - `link_url` and `link_title` are null
   
2. **'link'** - Custom external link
   - `link_url` and `link_title` are set
   - `content_id` is null

**TypeScript Type:**
```typescript
type ResumeAsset = {
  id: string
  asset_type: 'content' | 'link'
  content_id: string | null
  link_url: string | null
  link_title: string | null
  content?: {
    title: string
    type: string
  } | null
}
```

**Frontend Display:**
```typescript
// In entry card:
{entry.resume_assets?.map((asset) => (
  <a
    key={asset.id}
    href={asset.asset_type === 'content' 
      ? `/content/${asset.content_id}` 
      : asset.link_url || '#'
    }
    target={asset.asset_type === 'link' ? '_blank' : undefined}
  >
    {asset.asset_type === 'content' 
      ? asset.content?.title 
      : asset.link_title
    }
  </a>
))}
```

---

## 5. Collections Table

**Table:** `collections`

**Purpose:** Referenced by resume entries for "Samples" button

**Relevant Columns:**
- `id` (UUID, Primary Key)
- `name` (TEXT) - Display name
- `slug` (TEXT) - URL slug

**Frontend Usage:**
```typescript
// Show "Samples" button if collection_id exists
{entry.collections && (
  <Button onClick={() => navigateToCollection(entry.collections.slug)}>
    Samples →
  </Button>
)}
```

---

## 6. Custom PDFs Table

**Table:** `custom_pdfs`

**Purpose:** Downloadable resume PDFs displayed at top of Resume tab

**Columns:**
- `id` (UUID, Primary Key)
- `title` (TEXT) - Button display text
- `description` (TEXT, nullable)
- `file_url` (TEXT) - URL to PDF file (Cloudinary or storage)
- `file_name` (TEXT) - Original filename
- `category` (TEXT) - Filter by 'resume' for Resume tab
- `is_featured` (BOOLEAN)
- `order_index` (INTEGER) - Display order
- `created_at` (TIMESTAMPTZ)

**Frontend Query:**
```typescript
const { data } = await supabase
  .from('custom_pdfs')
  .select('*')
  .eq('category', 'resume')
  .order('order_index', { ascending: true })
```

---

## Timeline Design Requirements

### Entry Positioning Rules

**Based on `resume_entry_types.name`:**

1. **Left Side Entries:**
   - Full-width cards on left of timeline
   - Show: title (company), subtitle (job title), dates, description, assets, samples button
   - Text should be right-aligned
   - Position: `calc(50% - 700px)` from center

2. **Right Side Entries:**
   - Full-width cards on right of timeline
   - Same structure as left side
   - Text should be left-aligned
   - Position: `calc(50% + 48px)` from center

3. **Center Entries (Captions):**
   - Compact cards centered on timeline
   - Show: date_start, title (caption), short_description, date_end
   - No subtitle, no assets, no samples button
   - Position: centered on timeline (`50%` with `translateX(-50%)`)

### Timeline Markers

**Required Markers:**
1. **"Now" marker** - Current date (use actual `new Date()`, not first of month)
2. **Month markers** - For each entry's `date_start` and `date_end`
3. **Year markers** - January 1st of each year (only if no month marker exists for January)

**Chronological Order (top to bottom):**
- Now (current date)
- April 2025
- 2025 (Jan 1)
- December 2024
- March 2024
- 2024 (Jan 1)
- etc.

**Key Rules:**
- Year markers represent START of year (January 1st)
- Timeline flows from newest (top) to oldest (bottom)
- No duplicate markers for the same date

### Date Positioning

**Entry Placement:**
- Entries should be positioned at their **END DATE** (`date_end`)
- If `date_end` is null, treat as "Present" and position at current date
- Add 20px offset below the date marker to prevent overlap

**Timeline Calculation:**
```typescript
const getDatePosition = (date: Date): number => {
  const now = new Date()
  const pixelsPerYear = 300
  const yearsFromNow = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return 100 + (yearsFromNow * pixelsPerYear)
}
```

---

## Color Scheme

- **Background:** `#0f1419` (dark)
- **Card Background:** `bg-gray-900`
- **Borders:** `border-gray-800`
- **Featured Entries:** `border-emerald-400` with glow
- **Timeline Line:** `bg-gradient-to-b from-emerald-400 via-emerald-400/50 to-emerald-400/20`
- **Accent Color:** `emerald-400` (green)
- **Text:** White/gray scales

---

## Important Notes for Frontend Development

1. **Date Handling:** All dates from database are in YYYY-MM-DD format, convert to Date objects for calculations
2. **EditorJS Data:** `description` and `executive_summary` are JSONB containing EditorJS OutputData format
3. **Cascade Deletes:** Deleting a resume entry automatically deletes its resume_assets
4. **RLS Policies:** All tables have public read access, authenticated write access
5. **Ordering:** Use `order('date_start', { ascending: false })` for chronological display
6. **Current User Check:** Today is October 21, 2025 - "Now" marker should reflect this

---

## Sample Data Structure

```json
{
  "id": "uuid",
  "title": "Liberty City Blatt",
  "subtitle": "Investigative Reporter",
  "date_start": "2024-03-01",
  "date_end": "2024-12-31",
  "short_description": "Investigated corruption in city government",
  "description": { /* EditorJS OutputData */ },
  "collection_id": "uuid-of-collection",
  "is_featured": true,
  "resume_entry_types": {
    "name": "Left Side",
    "icon": "←"
  },
  "collections": {
    "name": "Investigative Reports",
    "slug": "investigative-reports"
  },
  "resume_assets": [
    {
      "id": "uuid",
      "asset_type": "content",
      "content_id": "uuid",
      "content": {
        "title": "City Hall Corruption Exposé",
        "type": "article"
      }
    },
    {
      "id": "uuid",
      "asset_type": "link",
      "link_url": "https://example.com/external-article",
      "link_title": "External Coverage"
    }
  ]
}
```

