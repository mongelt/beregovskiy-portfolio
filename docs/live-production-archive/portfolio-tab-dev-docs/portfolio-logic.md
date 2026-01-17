# Portfolio Tab Logic - Consolidated Description (THIS DOCUMENT IS NOW LOCKED, NO EDITS ARE ALLOWED IN THIS DOCUMENT)

## Overview
**Purpose**: This document describes the Portfolio tab on the front page (tab and page used interchangeably)
**Single source of truth**: This document is the single source of truth on the Portfolio tab, overrides any other document
**Portfolio tab**: Part of the front page, not standalone; shares elements with other tabs (Resume, Downloads)
**Elements in the tab**: Portfolio tab consists of: shared elements (Profile header expandable section, Bottom tab bar with PORTFOLIO/RESUME/DOWNLOADS), and Portfolio-specific elements (Main menu, Collections menu, Content reader, Info menu) described in this document
**Elements described**: This document describes Main menu, Collections menu, Info menu, Content reader, page states, state transitions, and basic layout
**Limitations**: This document doesn't describe: final design, backend implementation, admin side details
**Current status**: Mockup created, real implementation not started; current status in `docs\portfolio-tab-dev-docs\portfolio-planning.md`
**Edits to this document**: THIS DOCUMENT IS NOW LOCKED, NO EDITS ARE ALLOWED IN THIS DOCUMENT, THE DEVELOPMENT HAS FINISHED
**Natural language**: AI communicates only in natural language a beginner can understand
**Planning vs. Programming Logic**: This document for programming logic only; detailed planning in `docs\portfolio-tab-dev-docs\portfolio-planning.md`

## Files for more information
**Mockup HTML**: `docs\portfolio-tab-dev-docs\portfolio-mockup.html` (visual reference for element placement and basic state logic)
**Additional documents**: Planning and implementation: `docs\portfolio-tab-dev-docs\portfolio-planning.md` (detailed development plan, updated continuously); Technical reference materials: docs\portfolio-tab-dev-docs\portfolio-tech-ref.md
**Code**: `components\tabs\PortfolioTab.tsx` (implementation file); `components\tabs\MainMenu.tsx` (main menu implementation)
**Existing components**: 
- `components\Profile.tsx` (reuse as-is)
- `components\BottomTabBar.tsx` (reuse as-is)
- `components\ContentViewer.tsx` (existing content display component, evaluate for reuse)
- `components\EditorRenderer.tsx` (EditorJS renderer, needs plugin updates)
**EditorJS documentation**: `docs\editorjs-plugins-installed.md` (lists all 13 installed plugins)

## Definitions
**Portfolio page / Portfolio tab**: The tab of the front page this document describes
**Main menu**: Three-column navigation menu (categories → subcategories → content items) on left side of content area
**Collections menu**: Single-column menu on right side showing available collections
**Menu bar**: Abstract concept for area where Main menu and Collections menu are positioned; when collapsed, menus occupy this area
**Content reader**: Center area displaying selected content item (title, subtitle, article text)
**Info menu**: Small metadata panel on left showing publication info (Publication/Written for/Original)
**Featured content**: Content items featured via admin panel checkbox (content table `featured` field = true); only featured items appear in Main menu; query filters with `WHERE featured = true`
**Content item**: Individual article/media piece managed in admin Content tab, displayed when selected from Main menu
**Category**: Top-level organizational entity (separate database table); contains subcategories; managed in Categories admin tab
**Subcategory**: Second-level organizational entity (separate database table); nested within category; contains content items; managed in Categories admin tab
**Collection tab**: Filtered view of Portfolio tab showing only content linked to selected collection; same as "filtered Portfolio tab"; state change within same tab (not URL change); uses same Portfolio tab structure with Main menu filtered to collection content; **closing/return mechanism**: implemented in BottomTabBar component with close button (✕) on each collection tab
**Entry**: Can refer to category (column 1), subcategory (column 2), or content item (column 3) in Main menu
**Collapsed and expanded states**: Menu bar can be collapsed or expanded
**Collapsed state**: Menu bar shows category and subcategory of selected content item in gray, selected content item in green (no subtitle/year), and collections linked to selected content item (dynamic: 0 to many, featured or not)
**Expanded state**: All items in all columns displayed; selected entries green, unselected entries gray

## Database Schema

**Existing tables** (confirmed from admin code):
- **categories**: id (UUID), name (text), order_index (integer)
- **subcategories**: id (UUID), category_id (UUID FK), name (text), order_index (integer)
- **collections**: id (UUID), name (text), description (JSONB EditorJS), slug (text, for BottomTabBar collection tabs), order_index (integer), featured (boolean - NEEDS TO BE ADDED)
- **content**: id (UUID), type (text: 'article'|'image'|'video'|'audio'), category_id (UUID FK), subcategory_id (UUID FK), title (text, for Content reader), subtitle (text, for Content reader), sidebar_title (text, for Main menu display, nullable), sidebar_subtitle (text, for Main menu subtitle, nullable), content_body (JSONB EditorJS, for article type only), image_url (text, for image type, Cloudinary or direct URL), video_url (text, for video type, YouTube embed or Cloudinary), audio_url (text, for audio type, Cloudinary upload), author_name (text), publication_name (text, for Info menu), publication_date (text, year extracted for Main menu), source_link (text), copyright_notice (text), download_enabled (boolean), external_download_url (text), order_index (integer), featured (boolean - NEEDS TO BE ADDED), byline_style (UUID FK - NEEDS TO BE ADDED, non-nullable), link_style (UUID FK - NEEDS TO BE ADDED, non-nullable), created_at (timestamp)
- **content_collections**: content_id (UUID FK), collection_id (UUID FK), order_index (integer)

**Content type field usage** (confirmed from admin insert logic):
- Only ONE content field populated per record based on `type` value
- Article: `content_body` has data, others null
- Image: `image_url` has data, others null
- Video: `video_url` has data, others null
- Audio: `audio_url` has data, others null
- All metadata fields (title, subtitle, author, etc.) shared across all types

**New tables needed**:
- **byline_options**: id (UUID), option_text (text), created_at (timestamp)
- **link_options**: id (UUID), option_text (text), created_at (timestamp)

## Page States

Portfolio tab has **3 active states** (collapsed-empty not used):

**State Matrix**:
```
                    │ Content Reader Hidden │ Content Reader Visible
────────────────────┼──────────────────────┼──────────────────────
Menus Expanded      │   expanded-empty     │   expanded-reader
Menus Collapsed     │        N/A           │   collapsed-reader
```

**Initial state**: `expanded-reader` (loading state with first item selected and visible)

**State descriptions**:
- `expanded-empty`: Main menu expanded showing all items, selected category/subcategory green with their children gray (no content item selected); Collections menu shows all featured; Content reader hidden
- `expanded-reader`: Main menu expanded showing all items, full selection path green (category + subcategory + content item); Collections menu shows all featured; Content reader visible
- `collapsed-reader`: Main menu collapsed showing only selected content item green (category/subcategory gray); Collections menu shows items linked to current content (dynamic 0-N items); Content reader visible

## State Transitions

**Transition Rules**:
1. **Initial**: Page loads in `expanded-reader` (first category + subcategory + content item selected, Content reader visible)
2. **expanded-reader** → (click different content item) → **collapsed-reader** (new content loads)
3. **expanded-reader** → (click category) → **expanded-empty** (category selected, all subcategories gray, Content reader closes)
4. **expanded-reader** → (click subcategory) → **expanded-empty** (subcategory selected, all content items gray, Content reader closes)
5. **expanded-empty** → (click content item) → **collapsed-reader** (content item selected, Content reader opens)
6. **collapsed-reader** → (click anywhere in Main menu) → **expanded-reader** (menu expands, selection unchanged)
7. **Any state** → (click Collections menu item) → **Opens collection tab** (filtered Portfolio view)
8. **Any state** → (click already-selected entry) → NO CHANGE
9. **Any state** → (click non-selected entry) → follows Selection and Navigation Logic section below

**Main menu collapsed behavior**: When collapsed, entire Main menu acts as single clickable area; clicking anywhere expands menu without changing selection

**Collection tab behavior**: 
- Clicking any Collections menu item opens collection tab (any state, expanded or collapsed)
- Collection tab: filtered Portfolio tab showing only content linked to that collection
- **Tab system integration**: Adds new tab to BottomTabBar; collection added to activeCollections array; activeTab switches to collection slug
- Tab label format: "COLLECTION {NAME}" with close button (✕)
- Loads in `expanded-reader` state
- If current content item is in collection: keeps it selected and displayed in Content reader
- If current content item NOT in collection: selects first content item in collection (by order_index) and displays it
- Main menu filtered: categories and subcategories show only if they contain at least one content item in collection
- Same categories/subcategories reused (not separate entities for collections)
- **Closing collection tab**: User clicks ✕ button → triggers `onCollectionClose(slug)` → removes collection from activeCollections array → switches activeTab to 'portfolio' → returns to main Portfolio view
- **Multiple collections**: Each click adds collection to activeCollections array; all open collections shown in BottomTabBar; user can switch between collection tabs; each switch filters Main menu to that collection's content
- **State tracking**: activeTab indicates which collection currently displayed (portfolio | resume | downloads | collection.slug)
- **Edge case consideration**: Collection could become empty between click and load if admin removes content simultaneously; error handling strategy to be determined during development

## Loading State

**Initial page load**: Page loads in `expanded-reader` state with first content item selected and displayed
**Auto-selection**: First category (by order_index) selected green, shows its first subcategory selected green, shows its first content item selected green
**Empty database handling**:
- No categories: Display "No categories" message in column 1
- No subcategories in first category: Display "No subcategories" message in column 2
- No content in first subcategory: Display "No content" message in column 3
**Visual state**: Selected path (category + subcategory + content item) green; all other entries gray
**Menu state**: Main menu and Collections menu both expanded
**Content reader**: Visible, showing first content item
**Content displayed**: First content item's title, subtitle, and article content rendered in Content reader
**Info menu**: Visible, showing metadata for first content item

## Selection and Navigation Logic

**Hierarchy selection** (applies to all states):
- Content item selected → its subcategory and category also green
- Subcategory selected → its category also green
- Category selected → only category green (children show but gray until selected)

**Category selection**:
- New category clicked → state becomes `expanded-empty`
- Selected category green, all its subcategories show in gray (none selected)
- All content items hidden (no subcategory selected yet)
- Content reader closes

**Subcategory selection**:
- New subcategory clicked → state becomes `expanded-empty`
- Selected subcategory green (parent category also green per hierarchy)
- All its content items show in gray (none selected)
- Content reader closes

**Content item selection**:
- Content item clicked → state becomes `collapsed-reader` (if different from current)
- Selected content item green (parent subcategory and category also green per hierarchy)
- Content reader opens/updates with new content
- Menus collapse to make room for Content reader (if coming from expanded state)

**Re-selection behavior**: Clicking already-selected entry does nothing (in expanded states); exception: in collapsed state, any Main menu click expands per line 91

**All items clickable**: When Main menu expanded, all displayed entries (categories, subcategories, content items) can be clicked

**State transition behavior clarification**:
- `expanded-empty` state: Category or subcategory selected (one or both), but NO content item selected
- Only reachable via category/subcategory click, never on initial load
- As soon as content item selected, menu collapses to `collapsed-reader`

**Loading and animation behavior**:
- Loading indicators: To be defined during initial development exploration
- Skeleton states: To be designed when implementing data fetching
- Transition animations: To be determined after core logic implementation (much later in development)
- **Note**: Animation/transition specifications deferred until logic fully implemented

## Main Menu

**Structure**: Three-column hierarchical navigation system
- **Column 1 (Categories)**: Top-level categories from Categories admin tab
- **Column 2 (Subcategories)**: Subcategories within selected category only (filtered to selected category, never unfiltered)
- **Column 3 (Content Items)**: Individual content items within selected subcategory only (filtered to selected subcategory, never unfiltered)

**Three-column nesting**: Categories contain subcategories, subcategories contain content items (nesting doll structure)

**Empty states**:
- No categories in database: Display "No categories" message in column 1
- No subcategories in selected category: Display "No subcategories" message in column 2
- No content items in selected subcategory: Display "No content" message in column 3

**Data source**: Pulled from Supabase database
- Categories: `categories` table (id, name, order_index) - managed in Categories tab of admin panel
- Subcategories: `subcategories` table (id, category_id, name, order_index) - managed in Categories tab of admin panel
- Content items: `content` table - managed in Content tab of admin panel
- **Query filtering**: Main menu query filters content with `WHERE featured = true AND byline_style IS NOT NULL AND link_style IS NOT NULL`
- **Empty featured content**: If no content matches featured criteria, displays "No content" in column 3 (per lines 176-179)

**Content item display**:
- Title: Uses `sidebar_title` field; if null, falls back to `title` field (no character limit for display)
- Subtitle: "Sidebar Subtitle / Year" format in gray, smaller font
- Subtitle data: `sidebar_subtitle` field and year extracted from `publication_date` field (month ignored, year only)
- Subtitle display rules:
  - If `sidebar_subtitle` null: Show only year from `publication_date`
  - If `publication_date` null: Don't display subtitle at all
  - If both null: No subtitle displayed
- Subtitle visibility: Shows in expanded states for all content items (selected green items and unselected gray items)
- **Note**: `title` and `subtitle` fields used in Content reader; `sidebar_title` and `sidebar_subtitle` used in Main menu

**Column widths**:
- **Categories** (Column 1): Max 25 characters, text beyond 25 characters is cut off (not displayed)
- **Subcategories** (Column 2): Max 25 characters, text beyond 25 characters is cut off (not displayed)
- **Content items** (Column 3): No character limit, width grows to fit content
- **Implementation note**: Calculate pixel width for 25 characters during initial development stages (planning document)

**Color coding**:
- Selected entries: emerald green (`#00ff88`)
- Unselected entries: gray (`#6b7280`)
- Hover: lighter gray (`#e5e7eb`)

**Selection behavior per state**:
- **expanded-reader** (loading state): First category + subcategory + content item green; all others gray
- **expanded-reader** (after navigation): Selected category + subcategory + content item green; all others gray
- **expanded-empty**: Selected category/subcategory green; their children gray (no content item selected)
- **collapsed-reader**: Only content item green; category/subcategory gray

**Collection tab filtering**: 
- Main menu filters to show only content items linked to collection (managed in admin panel)
- **Query logic**: Join content_collections table, filter by collection_id, still apply featured/byline_style/link_style validation
- Categories show only if they contain at least one content item in collection
- Subcategories show only if they contain at least one content item in collection
- **Filtering logic**: Category with 5 subcategories where only 1 has collection content → shows only that 1 subcategory (others hidden)
- Categories and subcategories reused from main database (not separate per collection)
- Items without collection content are hidden from filtered view

**Always present**: Main menu always visible in some form (expanded or collapsed)

**Expansion behavior**: 
- Collapses when content item selected from expanded state (makes room for Content reader)
- Expands on click anywhere in Main menu when collapsed (click Collections menu opens collection tab instead)

## Entries Placement and Selection Logic

**Display order system**:
- All entities have `order_index` field in database (categories, subcategories, collections, content)
- Lower numbers appear first, increment by 10 for easy reordering
- All entries positioned according to display order when tab loads
- Admin UI for inline editing order_index needs to be added for categories, subcategories, and collections

**Selection reordering (all three columns)**:
- When entry selected in any column, it moves to top of that column
- Selected entry becomes position 1
- Entries that were after selected entry keep relative order, stay below selected entry
- Entries that were before selected entry keep relative order, move to bottom of column
- Reordering is only visual for every user and doesn't persist in databases
- **Animation handling**: Wait for previous reorder animation to complete before processing next selection (prevents race conditions)

**Uniqueness constraint**: Each entry appears exactly once in its column (no duplicates); Collections menu items also never repeat (each collection appears once); critical for preventing bugs

## Collections Menu

**Purpose**: Displays available collections managed in Collections admin tab

**Data source**: Supabase database
- Collections: `collections` table (id, name, description, slug, order_index, featured)
- Relationships: `content_collections` join table (content_id, collection_id, order_index)

**Visibility rules**:
- **Expanded states**: Shows only collections featured in admin panel (vertical list, ordered by order_index)
- **Collapsed state**: Shows collections linked to current content item (horizontal row, ordered by order_index: smallest number on right, growing larger to left)
- **Empty state**: If content item has 0 collections linked, collapsed state shows empty space
- **Featured requirement**: Empty collections (0 content items) cannot be featured; only collections with at least one content item can be featured
- **Order display**: Collections ordered by `order_index` field (lower numbers appear first in expanded; in collapsed horizontal row: smallest on right, larger to left)

**Interaction**:
- Click on collection item: Opens collection tab (any state, expanded or collapsed)
- Does NOT expand/collapse with Main menu (Collections menu has independent click behavior)

**Layout**:
- Expanded: Vertical list
- Collapsed: Horizontal row (dynamic item count)

## Content Reader

**Purpose**: Displays selected content item from Main menu

**Data source**: Content tab of admin panel

**Visibility**: Only shown in "reader" states (collapsed-reader, expanded-reader)

**Content display**:
- Content Title: `title` field (large, bold)
- Content Subtitle: `subtitle` field
- Article Content: `content_body` field (EditorJS format JSON for article type only)
- **Content types**: Content table has `type` field (article, image, video, audio)
  - **Article**: Renders `content_body` via EditorJS (JSONB field)
  - **Image**: Displays `image_url` (text field, from Cloudinary or direct URL)
  - **Video**: Embeds `video_url` (text field, YouTube embed or Cloudinary video; admin note: <10MB upload, >10MB use YouTube unlisted)
  - **Audio**: Embeds `audio_url` player (text field, from Cloudinary upload)
- **Database field usage**: Only one content field populated per item based on type; others are null (confirmed in admin insert logic)
- **Note**: Main menu subtitle uses `sidebar_subtitle` / Year format; Content reader subtitle uses `subtitle` field (different fields for different purposes)

**EditorJS rendering**: Only used for article type; must render EditorJS content using EditorRenderer component (see EditorJS Integration section)

**Content-agnostic development**: Portfolio tab core logic (navigation, state management, filtering) works identically for all 4 content types; only Content reader display varies by type

**Download functionality**: Suppressed for initial development; no download buttons or PDF generation (too early in development)

**Reference implementation**: `ContentViewer.tsx` handles all 4 content types (article/image/video/audio) with appropriate rendering logic:
- Article: EditorRenderer integration (line 208)
- Image: Simple img tag with rounded corners (lines 211-218)
- Video: YouTube iframe detection or HTML5 video player (lines 221-238)
- Audio: HTML5 audio player (lines 241-248)
- Download functionality to be implemented later
- Can be used as reference or adapted for Portfolio Content reader

**Positioning**:
- Base: `margin-left: -2%`, `margin-right: 2%`
- Vertical: `margin-top: calc(45vh - 33vh - 3rem + 25px)` (positions below Profile header)
- expanded-reader: `margin-left: calc(-2% + 80px)` (shifts right for expanded Main menu)
- collapsed-reader: `margin-right: -15%` (extends toward page edge, sidebars minimal)

**Scrolling**: Content reader scrollable (`overflow-y: auto`), max-height constrains between Profile header and Bottom tab bar

## Info Menu

**Purpose**: Displays metadata for content item currently shown in Content reader

**Visibility**: Only shown in "reader" states (collapsed-reader, expanded-reader)

**Position**: Absolute positioned at `top: 50%`, `left: 2.5%` (fixed while Content reader scrolls); positioning verified in mockup (portfolio-mockup.html lines 401-412)

**Structure**: Three lines of metadata
1. **Publication Name** / Publication Date
2. **<byline style>**: Author Name  
3. **<link style>**: Link to Original Source

**Admin fields** (content table):
- `publication_name`: text field (exists, displays in Info menu)
- `publication_date`: text field (exists, e.g., "January 2024"; year extracted for Main menu subtitle)
- `author_name`: text field (exists)
- `source_link`: URL field (exists)
- `byline_style`: NEW FIELD - dropdown (foreign key to byline_options table, required/non-nullable)
- `link_style`: NEW FIELD - dropdown (foreign key to link_options table, required/non-nullable)

**Validation requirements**:
- `byline_style` and `link_style` are required fields (non-nullable in database)
- Admin panel enforces selection before content can be saved
- Content items without valid `byline_style` or `link_style` are not displayed on Portfolio tab front-end
- Database query filters content to exclude items with null byline_style or link_style values

**Dropdown options management**:
- Managed in Content tab of admin panel
- Options can be added only (no edit/delete)
- Both byline_style and link_style use same management pattern
- Both display in emerald green on front page

**Color coding**:
- Labels (Publication Name, byline_style, link_style): emerald green (`#00ff88`)
- Values (dates, author, URL): gray (`#9ca3af`)

**Reference implementation**: `ContentViewer.tsx` displays author_name, publication_name, publication_date, and source_link metadata (lines 152-177); styling and layout can be adapted for Portfolio Info menu

## EditorJS Integration

**Current implementation**: 
- EditorRenderer component exists at `components/EditorRenderer.tsx`
- Used by Resume tab and ContentViewer component (verified working)
- Handles `content_body` field format (JSONB EditorJS OutputData)
- Rendering: Client-side only (SSR prevented via dynamic import)
- Mode: Read-only display (not editing)

**Plugin support status**:
- EditorRenderer: 5 basic plugins (Header, List, Paragraph, Quote, Code)
- Admin editor: 13 plugins installed (see `docs/editorjs-plugins-installed.md`)
- **Missing in EditorRenderer**: Link, Table, Marker, InlineCode, Underline, Warning, Delimiter, Raw (8 plugins)
- **Impact**: Content using advanced plugins will not render correctly on Portfolio tab
- **Usage scope**: EditorJS only applies to article type content; image/video/audio types use URL fields and HTML5 players (no EditorJS involved)

**ContentViewer component** (`components/ContentViewer.tsx`):
- Complete content display component already in use on site
- Integrates EditorRenderer for article rendering
- Handles all content types: article, image, video, audio
- Displays metadata: title, subtitle, author, publication name, publication date, source link, copyright notice
- Includes download functionality (PDF generation + external links)
- Framer Motion animations and skeleton loading states
- **Evaluation needed**: Reuse ContentViewer vs build custom display for Portfolio tab

**Required updates**:
- Add 8 missing plugins to EditorRenderer for full compatibility
- Test rendering performance with Portfolio content in scrollable Content reader
- Decide on ContentViewer reuse or custom implementation
- **Implementation note**: EditorRenderer plugin updates to be completed during initial development stages (planning document)

## Profile Integration

**Shared component**: Reuses `Profile.tsx` component from existing codebase
**Behavior**: When Profile expands down, Portfolio tab content moves down accordingly (same as Resume tab behavior)
**No modifications needed**: Profile component works as-is

## Bottom Tab Bar Integration

**Shared component**: Reuses `BottomTabBar.tsx` component from existing codebase

**Main tabs**: PORTFOLIO, RESUME, DOWNLOADS
- Active indicator: Emerald green underline (`#00ff88`)
- Tab switching via `onTabChange(tab.id)` callback

**Collection tabs** (dynamic):
- Props required: `collections` array with `{ slug: string, name: string }[]`
- Tab label format: "COLLECTION {NAME}" (uppercase)
- Active indicator: Purple background (`purple-600`)
- Each collection tab has close button (✕) on right side
- Close mechanism: `onCollectionClose(slug)` callback
- Animations: Framer Motion entry/exit (scale 0.8 ↔ 1, opacity 0 ↔ 1, 200ms duration)

**Integration requirements**:
- Pass active collections array to BottomTabBar
- Handle collection tab switching (changes Portfolio tab to filtered view)
- Handle collection close (returns to main Portfolio view, removes from collections array)
- Maintain collections array state (open collection tabs persist until closed)

**Active collections state management**:
- Portfolio tab maintains state: `activeCollections: { slug: string, name: string }[]` array
- When collection clicked in Collections menu: Add to activeCollections array (append, don't replace)
- Multiple collection tabs supported: Each click adds new collection to array
- Active tab tracking: `activeTab: string` state (values: 'portfolio' | 'resume' | 'downloads' | collection.slug)
- When collection tab clicked in BottomTabBar: Switch activeTab to that collection's slug, filter Main menu
- When close button (✕) clicked: Remove collection from activeCollections array, switch activeTab to 'portfolio'
- **Data structure example**: `[{ slug: 'featured-work', name: 'Featured Work' }, { slug: 'b2b-marketing', name: 'B2B Marketing' }]`

**No modifications needed to BottomTabBar**: Component already implements all collection tab functionality; Portfolio tab only needs to manage collections state and respond to callbacks

## Styling Requirements

**Color System**:
- Background: `#1a1d23` (dark blue-gray, shared with other tabs)
- Profile header border: `#374151` (gray-700)
- Text primary: `#e5e7eb` (gray-200)
- Text secondary: `#d1d5db` (gray-300)
- Text muted: `#9ca3af` (gray-400)
- Text inactive: `#6b7280` (gray-500)
- Active/Accent: `#00ff88` (emerald green)
- Bottom tab bar bg: `#0f1419` (darker)

**Layout**:
- Profile header: 33vh height
- Content area: flexible (middle section)
- Bottom tab bar: 10vh height
- Max content width: 1280px centered

**Spacing**:
- Main menu columns: 3rem gap between columns
- Menu bar elements: varies by state (horizontal vs vertical)

## Admin Panel Changes Required

**Database changes**:
- Add `featured` field to collections table (boolean, default false)
- Add `featured` field to content table (boolean, default false)
- Create `byline_options` table (id UUID, option_text text, created_at timestamp)
- Create `link_options` table (id UUID, option_text text, created_at timestamp)
- Add `byline_style` field to content table (UUID foreign key to byline_options, non-nullable/required)
- Add `link_style` field to content table (UUID foreign key to link_options, non-nullable/required)

**Admin UI changes**:
- Categories tab: Add inline editable order_index display (field exists in DB, UI needed)
- Subcategories tab: Add inline editable order_index display (field exists in DB, UI needed)
- Collections tab: Add inline editable order_index display (field exists in DB, UI needed)
- Collections tab: Add featured checkbox to create/edit forms (positioned after Description field)
- Collections tab: Add validation preventing empty collections from being featured
- Content tab: Add featured checkbox to create/edit forms (positioned right under Download Settings section)
- Content tab: Add UI for creating byline/link style options (small window, add-only)
- Content tab: Add byline_style dropdown in content create/edit (above Author Name field, required)
- Content tab: Add link_style dropdown in content create/edit (above Link to Original Source field, required)

## Admin UI Implementation Details

**Current status**: Admin panel exists with basic CRUD operations; modifications needed below

**Categories tab**:
- Current: Shows category name with `[EDIT] [DELETE]` buttons
- Needed: Add inline editable order_index field left of Edit button
- Target pattern: `[ORDER_INDEX] [EDIT] [DELETE]`
- order_index: Manual number input field, saves on blur/enter
- Note: order_index field exists in database, only UI implementation needed

**Subcategories tab**:
- Current: Shows subcategory name with `[EDIT] [DELETE]` buttons, grouped by parent category
- Needed: Add inline editable order_index field left of Edit button (same as Categories)
- Note: order_index field exists in database, only UI implementation needed

**Collections tab**:
- Current: Shows collection name, description preview, slug, with `[EDIT] [DELETE]` buttons
- Needed: 
  - Add inline editable order_index field left of Edit button (same as Categories/Subcategories)
  - Add featured checkbox inside create/edit window, positioned after Description field
  - Add validation preventing empty collections (0 content items) from being featured
- Note: order_index exists in database; featured flag needs to be added to database and UI

**Content tab - Dropdown options management** (NEW FEATURE):
- UI: New small modal/window with plain text input field
- Layout: Single text input + two action buttons
- Buttons: "Create as Byline" and "Create as Link" (separate buttons, each creates entry in respective table)
- Behavior: Inserts new row into byline_options or link_options table
- Validation: Non-empty text required
- No edit/delete UI (add-only design requirement)
- Access: Button/link in Content tab to open this management window

**Content tab - Content create/edit forms** (MODIFICATIONS NEEDED):
- Current fields: Category, Subcategory, Title, Subtitle, Sidebar Title, Sidebar Subtitle, Author Name, Publication Name, Publication Date, Link to Original Source, Copyright Notice, Content Body, Collections checkboxes, Display Order, Download settings
- **New field 1**: Featured checkbox
  - Position: Right under Download Settings section (after download type selection)
  - Boolean field, default false
- **New field 2**: byline_style dropdown
  - Position: Above "Author Name" field in Publication Metadata section
  - Populates from byline_options table
  - **Required field** (non-nullable)
  - Validation: Must select an option
- **New field 3**: link_style dropdown
  - Position: Above "Link to the Original Source" field in Publication Metadata section
  - Populates from link_options table
  - **Required field** (non-nullable)
  - Validation: Must select an option

**Implementation notes**: Admin UI changes straightforward (no wireframes needed); field positioning specified above; inline order_index editing: number input saves on blur/enter; dropdown management: modal with text input + "Create as Byline"/"Create as Link" buttons

## Work Style

**User and AI**: Document written by user for AI engine
**Limitations**: AI cannot do anything contrary to this document or not outlined in this document
**User**: Complete beginner in coding with little to no knowledge of code or programming

### Division of Labor

**User's part**: Acts as brain, defines goals/scope in natural language, outlines phases/steps/results, directs AI actions, confirms testing, approves changes

**AI's part**: Acts as hands, writes code, provides advice, uses only natural language (beginner-friendly), stays concise, never acts without explicit direction, always cites documentation lines, searches for inconsistencies/contradictions/gaps and asks for clarification immediately

### Instructions for AI

**Edit markers**: AI Notes section in planning document only (not this document)
**Natural language only**: No code snippets in messages to user
**No edits without approval**: User must explicitly approve all changes

## Development Plan

**Full planning document**: Stored at `docs\portfolio-tab-dev-docs\portfolio-planning.md`
**Structure**: Development split into Phases → Steps → Stages; each stage must be planned to be completed in one message assuming there are no bugs
**Step format**: Prerequisites (optional), Purpose, Result, Limits (optional), Output (optional)
**Default Output**: Updated planning document reflecting completion; documentation updated with limitations or useful information
**Testing**: Every step ends with testing; ideally 3 messages per step (Planning, Execution, Testing)
**Order of operations**: AI must not proceed to subsequent steps until previous step testing complete and user-verified

---

## Implementation Changes Log

**Purpose**: This section documents all changes made during implementation that differ from the original logic document specifications above. These changes were made based on user requests and feature modifications during development.

**Note**: The logic document above (lines 1-543) remains the original specification. This section documents deviations from that specification.

---

### 1. Initial State Change (Logic Doc Line 76)

**Original Specification**: Page loads in `expanded-reader` (first category + subcategory + content item selected, Content reader visible)

**Implementation**: Page loads in `expanded-empty` (no content selected, Content Reader hidden)

**Code Location**: 
- `PortfolioTab.tsx` line 113: `useState<PageState>('expanded-empty')`
- `PortfolioTab.tsx` line 662: `setPageState('expanded-empty')` on data load

**Reason**: Stage 2 of "Content Reader Visibility - Feature Change" — page loads without content displayed, menu bar starts in expanded state

**Documentation**: `portfolio-layout-reset.md` Stage 2 Implementation section

---

### 2. Content Reader Visibility Change (Logic Doc Line 278)

**Original Specification**: Content Reader visible in "reader" states (`collapsed-reader`, `expanded-reader`)

**Implementation**: Content Reader visible only in `collapsed-reader` state (never in `expanded-reader`)

**Code Location**: 
- `PortfolioTab.tsx` line 1008: `{pageState === 'collapsed-reader' && (`
- `ContentReader.tsx` line 55: Early return if not visible

**Reason**: Stage 1 of "Content Reader Visibility - Feature Change" — `expanded-reader` state no longer shows Content Reader

**Documentation**: `portfolio-layout-reset.md` Stage 1 Implementation section

---

### 3. State Transition Rule 4 Change (Logic Doc Line 91)

**Original Specification**: `collapsed-reader` → (click anywhere in Main menu) → `expanded-reader` (menu expands, selection unchanged)

**Implementation**: `collapsed-reader` → (click anywhere in Main menu) → `expanded-empty` (menu expands, Content Reader hides)

**Code Location**: `PortfolioTab.tsx` line 929: `setPageState('expanded-empty')`

**Reason**: Stage 3 of "Content Reader Visibility - Feature Change" — menu expansion hides Content Reader

**Documentation**: `portfolio-layout-reset.md` Stage 3 Implementation section

---

### 4. State Transition Rule 8 Change (Logic Doc Line 93)

**Original Specification**: **Any state** → (click already-selected entry) → NO CHANGE

**Implementation**: 
- In `collapsed-reader`: Click already-selected entry → `expanded-empty` (menu expands, Content Reader hides)
- In `expanded-empty` or `expanded-reader`: Click already-selected entry → `collapsed-reader` (menu collapses, Content Reader shows with same content)

**Code Location**: `PortfolioTab.tsx` lines 856-922 (handleCategorySelect, handleSubcategorySelect, handleContentSelect)

**Reason**: Stage 6 — "Already-Selected Entry Click Behavior - Expand/Collapse Menu" — clicking already-selected entry toggles menu state instead of doing nothing

**Documentation**: `portfolio-layout-reset.md` Stage 6 Implementation section

---

### 5. Collection Tab Opening State Change (Logic Doc Line 103)

**Original Specification**: Collection tab loads in `expanded-reader` state

**Implementation**: Collection tab loads in `expanded-empty` state (Content Reader hidden)

**Code Location**: `PortfolioTab.tsx` line 942, 952: `setPageState('expanded-empty')`

**Reason**: Stage 4 of "Content Reader Visibility - Feature Change" — collection click always expands menu bar and hides content, regardless of current state

**Documentation**: `portfolio-layout-reset.md` Stage 4 Implementation section

---

### 6. Collection Tab Behavior - Content Display (Logic Doc Lines 103-105)

**Original Specification**: 
- If current content item is in collection: keeps it selected and displayed in Content reader
- If current content item NOT in collection: selects first content item in collection and displays it

**Implementation**: 
- Content may be auto-selected, but Content Reader is hidden because state is `expanded-empty`
- Content Reader only shows when state is `collapsed-reader`

**Code Location**: `PortfolioTab.tsx` lines 745-748: Comment notes state is already set in handleCollectionClick

**Reason**: Stage 4 change — collection opens in `expanded-empty`, so Content Reader doesn't show even if content is selected

**Documentation**: `portfolio-layout-reset.md` Stage 4 Implementation section

---

### 7. Content Reader Positioning Simplification (Logic Doc Lines 306-310)

**Original Specification**: 
- `expanded-reader`: `margin-left: calc(-2% + 80px)` (shifts right for expanded Main menu)
- `collapsed-reader`: `margin-right: -15%` (extends toward page edge)

**Implementation**: 
- Content Reader only visible in `collapsed-reader` state
- Positioning always uses collapsed state values: `marginLeft: '295px'`, `marginRight: '50px'`, `marginTop: '105px'`
- `positioning` prop always `'collapsed'` (simplified in Stage 5)

**Code Location**: `ContentReader.tsx` lines 62-66: Fixed margins for collapsed state only

**Reason**: Stage 1 & 5 — Content Reader only visible in collapsed state, positioning prop simplified but kept for future flexibility

**Documentation**: `portfolio-layout-reset.md` Stage 1 and Stage 5 Implementation sections

---

### 8. Info Menu Visibility Change (Logic Doc Line 318)

**Original Specification**: Info Menu visible in "reader" states (`collapsed-reader`, `expanded-reader`)

**Implementation**: Info Menu visible only in `collapsed-reader` state (matches Content Reader visibility)

**Code Location**: 
- `PortfolioTab.tsx` line 1017: `{pageState === 'collapsed-reader' && (`
- `InfoMenu.tsx` line 31: Early return if not visible

**Reason**: Stage 1 change — Info Menu only shows when Content Reader is visible (collapsed-reader state only)

**Documentation**: `portfolio-layout-reset.md` Stage 1 Implementation section

---

### 9. Visual Reordering Implementation (Logic Doc Lines 239-245)

**Original Specification**: When entry selected in any column, it moves to top of that column (visual reordering)

**Implementation**: Visual reordering implemented and working as specified

**Code Location**: `MainMenu.tsx` lines 94-97 (state), 142-191 (reorderColumn function), 235-252 (integration)

**Reason**: Step 7.1 — Entry Visual Reordering implemented per specification

**Documentation**: `portfolio-planning.md` Step 7.1 Implementation

---

### Summary of Major Changes

1. **Initial State**: Changed from `expanded-reader` to `expanded-empty` (page loads without content displayed)
2. **Content Reader Visibility**: Removed from `expanded-reader` state (only visible in `collapsed-reader`)
3. **Rule 4**: Changed from `expanded-reader` to `expanded-empty` on menu click (menu expansion hides Content Reader)
4. **Rule 8**: Changed from NO CHANGE to Toggle menu state on already-selected entry click
5. **Collection Tab Opening**: Changed from `expanded-reader` to `expanded-empty` (collection click always expands menu and hides content)
6. **Content Reader Positioning**: Simplified to collapsed-only positioning (expanded positioning removed)
7. **Info Menu Visibility**: Changed to only show in `collapsed-reader` state (matches Content Reader)
8. **Visual Reordering**: Implemented as specified (no change from logic doc)

**All changes were documented in `portfolio-layout-reset.md` and `portfolio-planning.md` development logs.**