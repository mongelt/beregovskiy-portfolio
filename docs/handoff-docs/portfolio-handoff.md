# Portfolio Development - Future Phases Dependencies

**Purpose**: This document lists all components, functions, data structures, patterns, and infrastructure from Portfolio tab development that will be needed or useful in future phases of website development.

**Source**: Analysis of Portfolio tab implementation (`components/tabs/PortfolioTab.tsx`, `MainMenu.tsx`, `CollectionsMenu.tsx`, `ContentReader.tsx`, `InfoMenu.tsx`) and website planning document (`docs/website-planning.md`)

---

## Phase: Adding Editor.js Functionality/Plugins

### What Portfolio Provides:

1. **EditorRenderer Integration Pattern**
   - Location: `ContentReader.tsx` lines 7-9, 98-99
   - Dynamic import with SSR prevention: `dynamic(() => import('@/components/EditorRenderer'), { ssr: false })`
   - Usage pattern for article content rendering
   - **Needed for**: Adding new plugins to EditorRenderer used in Portfolio Content Reader

2. **Content Type Handling**
   - Location: `ContentReader.tsx` lines 98-99
   - Pattern for checking content type (`content.type === 'article'`) before rendering EditorJS
   - **Needed for**: Ensuring new plugins work with article-type content in Portfolio

3. **Content Body Data Structure**
   - Location: `PortfolioTab.tsx` ContentItem interface (line 68-101)
   - Field: `content_body: any` (EditorJS JSONB format)
   - **Needed for**: Testing new plugins with Portfolio content data

---

## Phase: One-Item Tab Functionality and Bottom Nav Revamp

### What Portfolio Provides:

1. **Collection Tab System**
   - Location: `PortfolioTab.tsx` lines 102-108, 124-125, 412-420
   - State management: `activeCollections: CollectionTab[]`, `activeTab: string`
   - Collection tab structure: `{ slug: string, name: string }`
   - **Needed for**: Creating individual content item tabs (similar pattern to collection tabs)

2. **BottomTabBar Integration**
   - Location: `PortfolioTab.tsx` lines 829-852, 1000-1006
   - Callbacks: `handleTabChange`, `handleCollectionClose`
   - Collection tab rendering and management
   - **Needed for**: Adding content item tabs to BottomTabBar, removing Downloads tab

3. **Content Item Data Structure**
   - Location: `PortfolioTab.tsx` lines 68-101
   - Complete ContentItem interface with all fields (id, title, type, metadata, etc.)
   - **Needed for**: Creating direct links to specific content items

4. **URL/Slug Generation Pattern**
   - Location: Collections use `slug` field (line 29-36)
   - Pattern for generating unique identifiers for tabs
   - **Needed for**: Creating slugs/URLs for individual content item tabs

5. **Tab Switching Logic**
   - Location: `PortfolioTab.tsx` lines 832-838
   - `handleTabChange` function that switches between tabs
   - Filtering logic that responds to tab changes (lines 150-186)
   - **Needed for**: Implementing content item tab switching

---

## Phase: Finishing Resume Tab

### What Portfolio Provides:

1. **Collection System Infrastructure**
   - Location: `PortfolioTab.tsx` lines 29-36, 137, 144, 291-307
   - Collection data loading: `loadCollections()` function
   - Collection filtering: `filterContentByCollection()` (lines 567-577)
   - Collection state management
   - **Needed for**: Resume tab collections feature (website-planning.md line 9)

2. **Collection-Content Relationship**
   - Location: `PortfolioTab.tsx` lines 356-369, 411-412
   - `content_collections` join table handling
   - `collection_slugs` and `collection_names` arrays in ContentItem
   - **Needed for**: Linking resume entries to collections

3. **Order Index System**
   - Location: Throughout PortfolioTab (order_index fields in all entities)
   - Sorting patterns: `.sort((a, b) => a.order_index - b.order_index)`
   - **Needed for**: Resume entry ordering and positioning

4. **Featured Content Pattern**
   - Location: `PortfolioTab.tsx` lines 144, 260
   - Featured filtering: `.eq('featured', true)`
   - **Needed for**: Featured resume entries/assets

---

## Phase: Core Functionality and Existing Core Code Review

### What Portfolio Provides:

1. **Complex State Management Pattern**
   - Location: `PortfolioTab.tsx` lines 113-138
   - Multiple interdependent state variables
   - State synchronization patterns (useMemo, useEffect)
   - **Needed for**: Code review, identifying state management best practices and potential issues

2. **Data Loading Pipeline**
   - Location: `PortfolioTab.tsx` lines 206-307, 618-697
   - Parallel loading: `Promise.all()` pattern (lines 629-632)
   - Loading state management (lines 198-200)
   - Error handling patterns
   - **Needed for**: Auditing data fetching efficiency, identifying bottlenecks

3. **Data Transformation Functions**
   - Location: `PortfolioTab.tsx` lines 309-420
   - `transformContentItem()` - complex nested join flattening
   - `extractPublicationYear()` - data parsing utility
   - **Needed for**: Reviewing data transformation efficiency and correctness

4. **Filtering Logic**
   - Location: `PortfolioTab.tsx` lines 150-186, 549-616
   - Collection-based filtering (cascading: content → subcategories → categories)
   - useMemo optimization for filtered data
   - **Needed for**: Edge case testing, performance optimization

5. **Auto-Selection Algorithms**
   - Location: `PortfolioTab.tsx` lines 422-460, 481-547
   - `autoSelectInitialContent()` - hierarchy selection
   - `autoSelectCollectionContent()` - collection tab selection
   - **Needed for**: Testing edge cases (empty data, missing relationships)

6. **Type Safety Patterns**
   - Location: Throughout PortfolioTab.tsx
   - Comprehensive TypeScript interfaces (Category, Subcategory, ContentItem, Collection)
   - Type guards and null checks
   - **Needed for**: Type safety audit, identifying potential runtime errors

7. **Callback Optimization**
   - Location: `PortfolioTab.tsx` lines 856-952
   - `useCallback` usage for event handlers
   - Dependency array management
   - **Needed for**: Performance review, preventing unnecessary re-renders

---

## Phase: Bottom Nav Features

### What Portfolio Provides:

1. **Share Button Target Data**
   - Location: `PortfolioTab.tsx` ContentItem interface (lines 68-101)
   - Complete content item data structure (id, title, type, URLs, metadata)
   - **Needed for**: Share button for individual content items (website-planning.md line 20)

2. **Collection Share Data**
   - Location: `PortfolioTab.tsx` Collection interface (lines 29-36)
   - Collection data: id, slug, name, description
   - **Needed for**: Share button for collections (website-planning.md line 20)

3. **Content URL Generation**
   - Location: ContentItem has `id` field (line 68)
   - Pattern for generating shareable URLs
   - **Needed for**: Creating shareable links to content items

4. **Collection URL Generation**
   - Location: Collection has `slug` field (line 32)
   - Pattern for generating shareable collection URLs
   - **Needed for**: Creating shareable links to collections

5. **BottomTabBar Component Integration**
   - Location: `PortfolioTab.tsx` lines 1000-1006
   - Props passing pattern: `activeTab`, `collections`, callbacks
   - **Needed for**: Adding share buttons to BottomTabBar or content areas

---

## Phase: Profile Tab Rehaul

### What Portfolio Provides:

1. **Profile Component Integration**
   - Location: `PortfolioTab.tsx` lines 5, 970-978
   - Profile height measurement: `onHeightChange` callback pattern
   - `profileHeight` state management (line 131)
   - **Needed for**: Understanding current Profile integration, planning rehaul

2. **Profile Height Reporting Pattern**
   - Location: `Profile.tsx` lines 46-70
   - ResizeObserver pattern for dynamic height measurement
   - Callback to parent component
   - **Needed for**: Maintaining height reporting in Profile rehaul

---

## Phase: Handoff for Redesign

### What Portfolio Provides:

1. **Complete State Machine Documentation**
   - Location: `portfolio-logic.md` lines 64-95, `portfolio-layout-reset.md`
   - Page states: `expanded-empty`, `expanded-reader`, `collapsed-reader`
   - State transition rules
   - **Needed for**: Creating handoff document that preserves core logic (website-planning.md line 25)

2. **Layout Specifications**
   - Location: `portfolio-layout-reset.md`
   - Complete layout specifications (positions, margins, spacing)
   - Fixed vs sticky positioning patterns
   - **Needed for**: Redesign without breaking layout logic

3. **Component Structure**
   - Location: All Portfolio components
   - Clear component boundaries (MainMenu, CollectionsMenu, ContentReader, InfoMenu)
   - Props interfaces and data flow
   - **Needed for**: Redesigning visuals without changing component logic

4. **Color System**
   - Location: `portfolio-logic.md` lines 425-433, component implementations
   - Color values: emerald green (`#00ff88`), grays, background colors
   - **Needed for**: Maintaining color consistency during redesign

5. **Type Definitions**
   - Location: `PortfolioTab.tsx` lines 12-108
   - All TypeScript interfaces (Category, Subcategory, ContentItem, Collection, PageState)
   - **Needed for**: Ensuring redesign doesn't break type contracts

---

## Phase: Complete Visual Redesign

### What Portfolio Provides:

1. **Animation Library Integration**
   - Location: `BottomTabBar.tsx` lines 3, 37-40, 56-65, 72-79
   - Framer Motion usage: `motion.div`, `AnimatePresence`, `layoutId`, `whileTap`
   - Animation patterns: scale, opacity, spring transitions
   - **Needed for**: Adding animation libraries, understanding current animation patterns (website-planning.md line 30)

2. **Layout System**
   - Location: `portfolio-layout-reset.md`, component positioning
   - Fixed positioning: Menu Bar, Profile, BottomTabBar
   - Calculated positioning: Info Menu (CSS calc)
   - Margin-based layout: Content Reader
   - **Needed for**: Making layout and color decisions (website-planning.md line 31)

3. **Responsive Design Patterns**
   - Location: Component implementations
   - Collapsed/expanded state patterns
   - Dynamic sizing based on state
   - **Needed for**: Planning responsive redesign

4. **Visual State Management**
   - Location: `MainMenu.tsx` lines 94-97, 142-190
   - Visual reordering state (`categoriesOrder`, `subcategoriesOrder`, `contentOrder`)
   - Animation state (`isAnimating`)
   - **Needed for**: Enhancing animations during redesign

5. **Color Coding System**
   - Location: `MainMenu.tsx` lines 192-230, `portfolio-logic.md` lines 425-433
   - Selection color logic (green for selected, gray for unselected)
   - Hover states
   - **Needed for**: Redesigning color system while maintaining selection logic

---

## Phase: Mobile Version

### What Portfolio Provides:

1. **Responsive Layout Patterns**
   - Location: `portfolio-layout-reset.md`, component implementations
   - Fixed positioning patterns that need mobile adaptation
   - Collapsed/expanded state system
   - **Needed for**: Adapting layout for mobile screens

2. **Touch Interaction Patterns**
   - Location: `MainMenu.tsx`, `CollectionsMenu.tsx`
   - Click handlers for menu items
   - **Needed for**: Converting to touch-friendly mobile interactions

3. **State Management for Mobile**
   - Location: `PortfolioTab.tsx` state machine
   - Page state system (expanded/collapsed)
   - **Needed for**: Adapting state transitions for mobile UX

4. **Component Sizing Logic**
   - Location: `ContentReader.tsx`, `InfoMenu.tsx`
   - Margin and positioning calculations
   - **Needed for**: Responsive sizing for mobile screens

---

## Phase: Code Audit and Optimization, SEO

### What Portfolio Provides:

1. **Database Query Patterns**
   - Location: `PortfolioTab.tsx` lines 208-307
   - Supabase query patterns with joins
   - Filtering: `.eq()`, `.not()`, `.order()`
   - **Needed for**: Query optimization, performance enhancement (website-planning.md line 42)

2. **Data Loading Optimization**
   - Location: `PortfolioTab.tsx` lines 618-697
   - Parallel loading with `Promise.all()`
   - Loading state management
   - **Needed for**: Performance optimization

3. **Memoization Patterns**
   - Location: `PortfolioTab.tsx` lines 144-186
   - `useMemo` for filtered data
   - `useCallback` for event handlers
   - **Needed for**: Performance audit, identifying optimization opportunities

4. **SEO Considerations**
   - Location: ContentItem data structure
   - Metadata fields: title, subtitle, publication_name, publication_date
   - **Needed for**: SEO implementation (website-planning.md line 43: "do not index content")

5. **Sitemap Data Source**
   - Location: Content, Categories, Subcategories, Collections data
   - All content items with IDs and metadata
   - **Needed for**: Generating sitemap (website-planning.md line 42)

---

## Phase: Google Analytics Pre-Setup

### What Portfolio Provides:

1. **Event Tracking Points**
   - Location: All click handlers in PortfolioTab
   - Content selection, category selection, collection clicks, tab switches
   - **Needed for**: Setting up analytics event tracking

2. **Content Identification**
   - Location: ContentItem interface (id, title, type, category, subcategory)
   - Complete content metadata
   - **Needed for**: Content tracking and analytics

3. **User Journey Data**
   - Location: State transitions, tab switching, collection opening
   - User navigation patterns
   - **Needed for**: Understanding user behavior analytics

---

## Phase 7: Code Review and Mobile Preparation

### What Portfolio Provides:

1. **Code Structure for Mobile Refactoring**
   - Location: All Portfolio components (`PortfolioTab.tsx`, `MainMenu.tsx`, `CollectionsMenu.tsx`, `ContentReader.tsx`, `InfoMenu.tsx`)
   - Component modularity: Components need review for mobile-hidden vs mobile-visible element separation
   - Layout hardcoding: Fixed widths/positions (e.g., `w-[560px]`, `calc(50% + 70px)`) need mobile flexibility
   - Fixed positioning: InfoMenu fixed positioning needs to become scrollable in mobile
   - **Needed for**: Phase 7 mobile preparation refactoring, Phase 8 mobile implementation

2. **State Management for Mobile Features**
   - Location: `PortfolioTab.tsx` state machine (lines 113-138)
   - Current state structure needs extension for mobile states (menu collapsed/expanded mode)
   - Mobile state tracking: menu mode, content auto-selection from Resume tab
   - **Needed for**: Adding mobile state management without breaking desktop logic

3. **Asset Click Behavior for Mobile**
   - Location: Content selection logic in `PortfolioTab.tsx` (lines 422-460, 481-547)
   - Auto-selection algorithms: `autoSelectInitialContent()`, `autoSelectCollectionContent()`
   - Content data structure: Full ContentItem data needed for instant mobile tab switching
   - **Needed for**: Mobile Resume asset clicks that switch to Portfolio and auto-select content

4. **Desktop vs Mobile Logic Separation**
   - Location: All Portfolio components mixing logic and presentation
   - Logic tightly coupled with desktop visuals needs separation
   - Conditional rendering patterns needed without duplicating logic
   - **Needed for**: Phase 7 refactoring to separate reusable logic from desktop-specific presentation

5. **Performance Optimization Points**
   - Location: `PortfolioTab.tsx` data loading (lines 206-307, 618-697)
   - Database queries: Supabase query patterns with joins need optimization review
   - Memoization: `useMemo` and `useCallback` patterns (lines 144-186, 856-952)
   - Parallel loading: `Promise.all()` pattern (lines 629-632)
   - **Needed for**: Phase 7 code optimization, Phase 11 pre-loading implementation

6. **Helper Utilities Needed**
   - Breakpoint detection: Below 768px width AND portrait orientation
   - Mobile detection: Initial page load detection (not resize-based)
   - Responsive layout helpers: For conditional rendering
   - **Needed for**: Phase 7 utility creation, Phase 8 mobile implementation

---

## Phase 8: Mobile Version Implementation

### What Portfolio Provides:

1. **Mobile Main Menu Implementation**
   - Location: `MainMenu.tsx` three-column layout
   - Desktop pattern: Categories → Subcategories → Content (three columns)
   - Mobile requirement: Same logic, one column at a time (collapsed/expanded modes)
   - Collapsed mode: Shows active content sidebar title only (Line 1)
   - Expanded mode: Full screen width, vertical list, one column selection at a time
   - Selection flow: Category → Subcategories → Content items → collapse menu
   - **CRITICAL**: Same programming logic as desktop, only visual difference
   - **Needed for**: Mobile Portfolio tab main menu implementation

2. **Mobile Content Reader**
   - Location: `ContentReader.tsx` margin-based layout system
   - Desktop: Margin-based positioning
   - Mobile: Full width with 15px margins on sides, fills space between menu and Bottom Nav
   - Title/subtitle: Same font sizes as desktop (Phase 10 may adjust)
   - **Needed for**: Mobile content display

3. **Mobile Info Menu**
   - Location: `InfoMenu.tsx` absolute positioning with CSS calc
   - Desktop: Fixed positioning, vertically centered
   - Mobile: Positioned at top of content reader (below collapsed main menu), full width with margins, scrolls with content (NO LONGER FIXED)
   - **Needed for**: Mobile InfoMenu positioning change

4. **Mobile Collections Menu**
   - Location: `CollectionsMenu.tsx` dual layout patterns
   - Mobile requirement: Fully hidden (no collections access on mobile)
   - Featured collections menu: Also hidden
   - **Needed for**: Mobile collections hiding implementation

5. **Mobile Content Auto-Selection**
   - Location: `PortfolioTab.tsx` auto-selection algorithms (lines 422-460, 481-547)
   - Mobile behavior: Clicking content asset in Resume switches to Portfolio instantly, opens in collapsed mode showing selected content immediately
   - Menu stays collapsed when content auto-selected from Resume
   - **Needed for**: Mobile Resume → Portfolio content switching

6. **Mobile Loading Screen**
   - Location: `PortfolioTab.tsx` initial state (lines 198-200)
   - Mobile requirement: Initial Portfolio tab state with main menu expanded and content reader hidden
   - Menu state on tab switch: When menu expanded and user switches to Resume, menu resets to loading screen (expanded) when returning to Portfolio
   - **Needed for**: Mobile Portfolio initial state and tab switching behavior

---

## Phase 9: Handoff for Redesign

### What Portfolio Provides:

1. **Current Design Inventory**
   - Location: All Portfolio components, `portfolio-logic.md` lines 425-433
   - Colors: Emerald green (`#00ff88`), grays, background colors
   - Typography: Current font sizes/weights in MainMenu, ContentReader, InfoMenu
   - Spacing: Margins, padding, gaps between elements
   - **Needed for**: Phase 9 design inventory documentation, Phase 10 redesign reference

2. **Design Constraints (What Cannot Change)**
   - Component structure: MainMenu, CollectionsMenu, ContentReader, InfoMenu boundaries
   - Element positioning: Left side elements stay left, right side stay right (minor tweaks allowed - few pixels)
   - Functionality: All interactions work exactly the same
   - Logic: No changes to programming logic or component architecture
   - **Needed for**: Phase 9 constraints definition, Phase 10 redesign boundaries

3. **Design Opportunities (What Can Change)**
   - Colors: All colors can change (background, text, borders, accents, selection colors)
   - Fonts: Font families, sizes, weights can change
   - Visual effects: Shadows, borders, gradients, opacity can change
   - Animations: Can add/modify animations (currently Framer Motion in BottomTabBar)
   - Spacing: Minor adjustments (few pixels) acceptable
   - **Needed for**: Phase 9 opportunities documentation, Phase 10 redesign scope

4. **Component-by-Component Redesign Guide**
   - MainMenu: Colors (green/gray selection), typography, spacing, visual reordering animations
   - CollectionsMenu: Colors, layout styling, featured vs regular collection styling
   - ContentReader: Content display styling, EditorJS rendering styling, media player styling
   - InfoMenu: Metadata display styling, positioning (minor tweaks only)
   - **Needed for**: Phase 9 component guide, Phase 10 systematic redesign

---

## Phase 10: Complete Visual Redesign

### What Portfolio Provides:

1. **Animation Integration Points**
   - Location: `BottomTabBar.tsx` Framer Motion usage (lines 3, 37-40, 56-65, 72-79)
   - Current patterns: `motion.div`, `AnimatePresence`, `layoutId`, `whileTap`, scale, opacity, spring transitions
   - Portfolio needs: Page/tab transitions, element hover effects, content loading animations, menu collapse/expand animations
   - **Needed for**: Phase 10 animation implementation across Portfolio components

2. **Design System Integration**
   - Location: All Portfolio components
   - Color palette: Needs complete rewrite with all shades and usage guidelines
   - Typography scale: All sizes and weights for Portfolio elements
   - Spacing system: Margins, padding, gaps
   - Component patterns: MainMenu, CollectionsMenu, ContentReader, InfoMenu styling patterns
   - **Needed for**: Phase 10 design system rewrite (`docs/design-system.md`)

3. **Desktop Redesign Order**
   - Order: Profile → Bottom Nav including Downloads → Portfolio tab → Active Content/Collection (same design as Portfolio) → Resume tab
   - Portfolio components: MainMenu → CollectionsMenu → ContentReader → InfoMenu
   - **Needed for**: Phase 10 systematic redesign workflow

4. **Mobile Redesign Requirements**
   - Same components as desktop but different visual design potentially
   - Mobile-specific styling: Collapsed/expanded menu states, full-width layouts, touch-friendly sizing
   - **Needed for**: Phase 10 mobile redesign alongside desktop

5. **Final Layout Tweaks**
   - Minor positioning adjustments: Few pixels movement acceptable
   - Constraints from Phase 9: Elements stay in same general areas
   - **Needed for**: Phase 10 final positioning refinements

---

## Phase 11: Code Audit, Optimization, and SEO

### What Portfolio Provides:

1. **Pre-Loading Implementation Points**
   - Location: `PortfolioTab.tsx` data loading (lines 206-307, 618-697)
   - Current loading: Portfolio tab loads on initial page load
   - Phase 11 requirement: Pre-load all tabs data (Portfolio, Resume, Downloads) for instant loading
   - Portfolio should pre-load immediately after initial load
   - **Needed for**: Phase 11 pre-loading optimization

2. **SEO Data Sources**
   - Location: ContentItem data structure (lines 68-101), Collections (lines 29-36), Categories/Subcategories
   - Sitemap includes: All featured content items, collections, categories/subcategories
   - Metadata fields: title, subtitle, publication_name, publication_date, description
   - **Needed for**: Phase 11 sitemap generation

3. **No-Index Functionality**
   - Location: ContentItem data structure
   - Phase 11 requirement: No-index checkbox in admin, flag content as no-index
   - Content flagged as no-index blocked from search engine crawlers
   - **Needed for**: Phase 11 no-index implementation

4. **Error Handling Points**
   - Location: `PortfolioTab.tsx` data loading and error handling patterns
   - Network errors: Retry automatically, use cached data, show error message
   - Empty collections: Hide from menu, show "No Items" message if directly accessed
   - Content load failures: Show error message in content area
   - **Needed for**: Phase 11 error handling implementation

5. **Performance Optimization Areas**
   - Database queries: Review Supabase query patterns (lines 208-307)
   - Data transformation: Review `transformContentItem()` efficiency (lines 311-414)
   - Filtering logic: Review `useMemo` optimization (lines 144-186)
   - Callback optimization: Review `useCallback` usage (lines 856-952)
   - **Needed for**: Phase 11 performance optimization

---

## Cross-Phase Utilities and Patterns

### Reusable Functions:

1. **Data Transformation**
   - `transformContentItem()` - Flattening nested Supabase joins
   - `extractPublicationYear()` - Date parsing utility
   - **Location**: `PortfolioTab.tsx` lines 311-414

2. **Filtering Utilities**
   - `filterContentByCollection()` - Collection-based content filtering
   - `filterSubcategoriesByCollection()` - Cascading subcategory filter
   - `filterCategoriesByCollection()` - Cascading category filter
   - **Location**: `PortfolioTab.tsx` lines 567-616

3. **Selection Helpers**
   - `autoSelectInitialContent()` - Hierarchy auto-selection
   - `autoSelectCollectionContent()` - Collection tab selection
   - `findCategorySubcategoryForContent()` - Relationship lookup
   - **Location**: `PortfolioTab.tsx` lines 422-547

4. **Tab Management**
   - `isCollectionTab()` - Tab type detection
   - `getCurrentCollectionSlug()` - Active collection extraction
   - **Location**: `PortfolioTab.tsx` lines 551-565

5. **Visual Reordering**
   - `reorderColumn()` - Entry reordering algorithm
   - **Location**: `MainMenu.tsx` lines 142-190

### Reusable Type Definitions:

1. **ContentItem Interface** - Complete content data structure
2. **Category/Subcategory Interfaces** - Navigation hierarchy
3. **Collection Interface** - Collection data structure
4. **PageState Type** - State machine type
5. **CollectionTab Interface** - Tab management structure

### Reusable Components:

1. **MainMenu** - Three-column navigation (could be adapted for other uses)
2. **CollectionsMenu** - Collection display (used in Resume tab)
3. **ContentReader** - Content display (reference implementation)
4. **InfoMenu** - Metadata display (reference implementation)

### Database Schema Patterns:

1. **Order Index System** - Used in categories, subcategories, content, collections
2. **Featured Flag System** - Used in content and collections
3. **Join Table Pattern** - `content_collections` for many-to-many relationships
4. **Foreign Key Relationships** - Category → Subcategory → Content hierarchy

---

## Summary by Component File

### `PortfolioTab.tsx` (Main Orchestrator)
- **State Management**: All page state, selections, collections, tabs
- **Data Loading**: All database queries and transformations
- **Event Handlers**: All user interaction callbacks
- **Filtering Logic**: Collection-based content filtering
- **Auto-Selection**: Initial and collection tab selection algorithms

### `MainMenu.tsx`
- **Visual Reordering**: Entry reordering algorithm and state
- **Selection Color Logic**: Green/gray color coding
- **Three-Column Layout**: Categories → Subcategories → Content pattern

### `CollectionsMenu.tsx`
- **Dual Layout**: Expanded (vertical) and collapsed (horizontal) patterns
- **Collection Filtering**: Featured vs. content-linked collections

### `ContentReader.tsx`
- **Content Type Rendering**: Article (EditorJS), Image, Video, Audio patterns
- **Dynamic Positioning**: Margin-based layout system
- **EditorRenderer Integration**: SSR-safe dynamic import pattern

### `InfoMenu.tsx`
- **Metadata Display**: Publication info, byline, link patterns
- **Positioning**: Absolute positioning with CSS calc

---

## Notes for Future Development

1. **State Machine**: Portfolio uses a 3-state system (`expanded-empty`, `expanded-reader`, `collapsed-reader`). This pattern could be reused for other complex UI states.

2. **Collection System**: The collection tab system is a reusable pattern for creating filtered views of content. Could be adapted for other content types.

3. **Visual Reordering**: The reordering algorithm in MainMenu is a generic pattern that could be applied to any ordered list.

4. **Data Loading Pipeline**: The 7-step data loading sequence (categories → subcategories → content → collections → auto-select → update state → set page state) is a pattern for complex data dependencies.

5. **Type Safety**: Comprehensive TypeScript interfaces ensure type safety across components. This pattern should be maintained in future development.

6. **Performance Patterns**: useMemo and useCallback usage throughout Portfolio provides performance optimization patterns to follow.

---

**Last Updated**: After completing `docs\portfolio-planning.md`
**Status**: Portfolio tab core functionality complete, ready for future phase integration

