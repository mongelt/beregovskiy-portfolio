<!-- cb8af7cd-28bc-469a-900d-b5fa23d0ec6e c3c72de0-8b4a-46a5-a20a-2b61bffdfdad -->
# Frontend Page Consolidation & Download System

## Step 1: Consolidate Frontend Pages into Single Page

### Goal

Transform the current multi-page structure into a single-page application with bottom navigation tabs (PORTFOLIO, RESUME, DOWNLOADS, COLLECTION X). Only the content viewing area scrolls; the business card header, category sidebar, and bottom tab bar remain fixed.

### Implementation

#### 1.1 Create Bottom Tab Navigation Component

**File:** `components/BottomTabBar.tsx`

- Fixed bar at bottom of viewport (non-scrollable)
- Four button types: PORTFOLIO, RESUME, DOWNLOADS, COLLECTION (dynamic)
- Active tab styling with visual indicator
- Collections shown as "COLLECTION X" with close button (red X icon)
- Props: `activeTab`, `collections` (array of open collections), `onTabChange`, `onCollectionClose`

#### 1.2 Refactor Main Page Layout

**File:** `app/page.tsx`

- Convert from simple portfolio view to tab-based layout manager
- State management:
  - `activeTab`: 'portfolio' | 'resume' | 'downloads' | collection slug
  - `openCollections`: array of collection objects with name/slug
  - `selectedContentId`: currently selected content item
- Layout structure:
  - BusinessCard (fixed at top)
  - Flex container:
    - CategorySidebar (fixed left, filters content based on activeTab/collection)
    - ContentArea (scrollable right side)
  - BottomTabBar (fixed at bottom)
- Tab switching logic:
  - PORTFOLIO: shows all content in sidebar, no collection filter
  - RESUME: shows resume timeline in content area, hides sidebar
  - DOWNLOADS: shows downloads page in content area, hides sidebar  
  - COLLECTION X: filters sidebar to show only collection content

#### 1.3 Create Resume Tab Content Component

**File:** `components/tabs/ResumeTab.tsx`

- Extract content from `app/resume/page.tsx`
- Display executive summary at top
- Show timeline grouped by year
- Remove navigation elements (back button, etc.)
- Props: none (fetches data internally)

#### 1.4 Create Downloads Tab Content Component

**File:** `components/tabs/DownloadsTab.tsx`

- Show all content items where `download_enabled = true`
- Display as grid/list with:
  - Content title, type, publication info
  - Download button or external link
  - Option to generate PDF (for articles)
- Filter/search functionality
- Props: none (fetches data internally)

#### 1.5 Update CategorySidebar Component

**File:** `components/CategorySidebar.tsx`

- Add `collectionSlug` prop (optional)
- When collectionSlug provided: filter content to only show items in that collection
- When no collectionSlug: show all content
- Maintain existing 3-column hierarchy display
- Keep fixed positioning (non-scrollable)

#### 1.6 Remove Old Pages

**Delete:**

- `app/resume/page.tsx`
- `app/collections/[slug]/page.tsx`
- `components/CollectionHeader.tsx` (no longer needed)

---

## Step 2: Add Download Functionality

### Goal

Enable downloading of individual content items with admin control over download type (PDF generation or external link).

### Database Schema (Already Exists)

The following columns already exist in the `content` table:

- `download_enabled` (boolean)
- `external_download_url` (text)

### Implementation

#### 2.1 Update Admin Content Form

**Files:** `app/admin/content/new/page.tsx`, `app/admin/content/edit/[id]/page.tsx`

Current state: Download settings already exist with checkbox and external URL input.

Enhancement needed:

- Add radio button for download type:
  - "External Link" (existing): requires URL input
  - "Generate PDF" (new): auto-generates PDF from article content
- Show appropriate input based on selection:
  - External Link: show URL input field
  - Generate PDF: show preview/info text
- Validation: ensure external URL is provided if that option is selected

#### 2.2 Add PDF Generation for Articles

**File:** `lib/pdf-generator.ts` (new)

- Use library like `jsPDF` or `html2pdf.js`
- Convert article Editor.js content to PDF
- Include: title, subtitle, publication info, content body, copyright
- Styling: professional document layout with proper typography
- Function: `generateArticlePDF(contentId: string)` returns Blob

**File:** `components/ContentViewer.tsx`

- Update download button logic:
  - If `external_download_url` exists: link to external URL
  - If `download_enabled` but no external URL: generate PDF on click
- Add loading state during PDF generation
- Handle download errors gracefully

#### 2.3 Create Downloads Tab

**File:** `components/tabs/DownloadsTab.tsx`

- Fetch all content where `download_enabled = true`
- Display as cards/grid:
  - Content title, type badge, thumbnail (if image/video)
  - Publication metadata (author, date, publication)
  - Download button with appropriate action
- Group by content type (Articles, Images, Videos, Audio)
- Search/filter functionality
- Empty state: "No downloadable content available"

#### 2.4 Install PDF Generation Library

**Command:** `npm install jspdf` or `npm install html2pdf.js`

- Choose based on ease of use for Editor.js content
- Configure for TypeScript usage

---

## Step 3: Update Routing & Navigation

### 3.1 Remove Collection Routes

Since collections now open as tabs in the main page, remove the collection routing:

- Delete `app/collections/` directory

### 3.2 Add Collection Opening Logic

**File:** `components/CategorySidebar.tsx`

- Add handler for "View Collection" or collection name click
- Emit event to parent: `onOpenCollection(collectionSlug, collectionName)`
- Parent (page.tsx) adds collection to `openCollections` array and switches to that tab

### 3.3 Update Links Throughout App

- Admin panel: remove "View Collection" page links
- Business card: update any navigation references
- Ensure no broken links remain

---

## Technical Notes

### State Management

Main page manages all navigation state:

```typescript
const [activeTab, setActiveTab] = useState<string>('portfolio')
const [openCollections, setOpenCollections] = useState<{slug: string, name: string}[]>([])
const [selectedContentId, setSelectedContentId] = useState<string | null>(null)
```

### CSS Layout

```css
/* Fixed positioning */
.business-card { position: fixed; top: 0; z-index: 50; }
.sidebar { position: fixed; left: 0; top: [after header]; bottom: [tab-bar-height]; overflow-y: auto; }
.content-area { margin-left: [sidebar-width]; margin-top: [header-height]; margin-bottom: [tab-bar-height]; overflow-y: auto; }
.tab-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; }
```

### Collection Handling

- Collections open dynamically as tabs
- Multiple collections can be open simultaneously
- Each collection tab shows filtered sidebar content
- Closing collection tab removes it from `openCollections` array

---

## Success Criteria

- Single page consolidation complete with bottom tab navigation
- All tabs functional (Portfolio, Resume, Downloads, Collection X)
- Only content area scrolls; header, sidebar, and tab bar are fixed
- Collections open as dynamic tabs with filtered content
- Download button appears on content items when enabled
- Admin can configure download type (PDF or external link)
- PDF generation works for articles
- Downloads tab shows all downloadable content
- No navigation issues or broken links
- Responsive layout maintained (mobile optimization deferred)

---

## Files to Create

1. `components/BottomTabBar.tsx`
2. `components/tabs/ResumeTab.tsx`
3. `components/tabs/DownloadsTab.tsx`
4. `lib/pdf-generator.ts`

## Files to Modify

1. `app/page.tsx` (major refactor)
2. `components/CategorySidebar.tsx`
3. `components/ContentViewer.tsx`
4. `app/admin/content/new/page.tsx`
5. `app/admin/content/edit/[id]/page.tsx`
6. `app/globals.css` (for fixed layout)

## Files to Delete

1. `app/resume/page.tsx`
2. `app/collections/[slug]/page.tsx`
3. `components/CollectionHeader.tsx`
4. `app/collections/` directory (if exists)

## Dependencies to Install

- `jspdf` or `html2pdf.js` (for PDF generation)

### To-dos

- [ ] Create BottomTabBar component with fixed positioning at bottom
- [ ] Create ResumeTab component extracted from resume page
- [ ] Create DownloadsTab component showing all downloadable content
- [ ] Implement PDF generation library and utility functions
- [ ] Refactor main page.tsx to manage tab state and layout
- [ ] Update CategorySidebar to filter by collection when needed
- [ ] Update ContentViewer download button to support both PDF and external links
- [ ] Enhance admin content forms with download type selection
- [ ] Delete old resume and collection pages/routes
- [ ] Add CSS for fixed header/sidebar/tab-bar with scrollable content area