# Portfolio Tab — Technical Reference Materials

## ⚠️ DOCUMENT STATUS: LOCKED AFTER STEP 0.1 COMPLETION

**Master Documentation**: Always read `docs\portfolio-tab-dev-docs\portfolio-logic.md` before this document
**Purpose**: Technical reference materials for Portfolio tab development (TypeScript types, mock data, component architecture, state machine logic, testing strategy)
**Created During**: Step 0.1 (Phase 0: Preliminary Research & Testing)
**Usage**: Reference by line numbers throughout planning document; never edit after lock
**Lock Date**: November 13, 2025 (Step 0.1 Complete - Document Now Locked)

---

## Table of Contents

### Stage Sections
- **Stage 1: Dependency Analysis & Overview** — Lines 27-560
  - Database Schema Dependencies — Lines 57-85
  - Admin Panel Dependencies — Lines 88-122
  - State Machine Dependencies — Lines 125-161
  - Component Hierarchy Dependencies — Lines 163-226
  - Data Flow Dependencies — Lines 229-257
  - Shared Component Dependencies — Lines 260-295
  - Styling Dependencies — Lines 298-325
  - Content Type Dependencies — Lines 327-352
  - Critical Constraints & Rules — Lines 355-385
  - Component Relationships Map — Lines 388-472
  - Critical Requirements Checklist — Lines 475-544

- **Stage 2: TypeScript Type Definitions** — Lines 563-1260
  - Content Item Types — Lines 573-679
  - Category and Subcategory Types — Lines 682-708
  - Collection Types — Lines 711-740
  - Dropdown Option Types — Lines 743-769
  - Page State Types — Lines 772-815
  - Main Menu Types — Lines 818-850
  - Collections Menu Types — Lines 853-884
  - Content Reader Types — Lines 887-917
  - Info Menu Types — Lines 920-960
  - Component Props Types — Lines 963-1007
  - State Machine Types — Lines 1019-1047
  - Utility Types — Lines 1050-1082
  - Query Filter Types — Lines 1085-1117
  - Visual Reordering Types — Lines 1120-1142
  - Empty State Types — Lines 1145-1166
  - Collection Tab State Types — Lines 1169-1192
  - BottomTabBar Integration Types — Lines 1195-1222
  - Data Transformation Pipeline Types — Lines 1225-1248

- **Stage 3: Mock Data Samples** — Lines 1264-2082
  - Test Set 1: Basic Featured Content — Lines 1274-1471
  - Test Set 2: Categories & Subcategories — Lines 1474-1508
  - Test Set 3: Collections — Lines 1511-1577
  - Test Set 4: Edge Cases — Lines 1580-1694
  - Test Set 5: Dropdown Options — Lines 1697-1721
  - Test Set 6: State Testing Scenarios — Lines 1724-1824
  - Test Set 7: Featured Filter — Lines 1827-1883
  - Test Set 8: Column Width Testing — Lines 1886-1908
  - Test Set 9: Empty Database States — Lines 1911-1955
  - Test Set 10: Multiple Collections — Lines 1958-2017
  - Mock Data Usage Guide — Lines 2020-2049
  - Validation Checklist — Lines 2052-2070

- **Stage 4: Component Architecture & Structure** — Lines 2086-3222
  - PortfolioTab Component (Root) — Lines 2096-2276
  - MainMenu Component — Lines 2279-2467
  - CollectionsMenu Component — Lines 2470-2555
  - ContentReader Component — Lines 2558-2660
  - InfoMenu Component — Lines 2663-2731
  - BottomTabBar Integration Pattern — Lines 2734-2806
  - Component Dependency Graph — Lines 2809-2873
  - State Management Patterns — Lines 2876-2940
  - Event Handler Patterns — Lines 2944-3007
  - Integration Points Documentation — Lines 3010-3050
  - Memoization Strategy — Lines 3053-3078
  - Component Lifecycle Patterns — Lines 3081-3108
  - State Update Flow Diagrams — Lines 3111-3207

- **Stage 5: State Machine & Transition Logic** — Lines 3226-3920
  - State Definitions — Lines 3236-3260
  - State Transition Rules (9 Rules) — Lines 3263-3385
  - Component Visibility Matrix — Lines 3388-3429
  - Selection Color Coding Rules — Lines 3433-3483
  - Main Menu Filtering Logic — Lines 3486-3564
  - Collections Menu Visibility Rules — Lines 3567-3607
  - Visual Reordering Logic — Lines 3610-3673
  - State Persistence Patterns — Lines 3676-3726
  - Edge Cases & Error Handling — Lines 3729-3775
  - State Machine Diagram — Lines 3778-3831
  - State Machine Implementation Code — Lines 3835-3899

- **Stage 6: Data Loading & Transformation** — Lines 3924-4767
  - Loading Sequence & Dependencies — Lines 3934-3960
  - Supabase Query Specifications (6 Queries) — Lines 3963-4136
  - Data Transformation Pipeline — Lines 4139-4229
  - Auto-Selection Logic — Lines 4232-4288
  - Complete Data Loading Implementation — Lines 4291-4372
  - Collection Content Filtering — Lines 4375-4470
  - Data Refresh Strategy — Lines 4473-4514
  - Query Optimization Considerations — Lines 4517-4543
  - Error Recovery Patterns — Lines 4546-4596
  - Database Schema Summary — Lines 4599-4663
  - Data Flow Summary Diagram — Lines 4666-4720

---

## Step Reference Guide

**How to Use**: When starting any step, read the line ranges listed below to get complete context for that step. Includes types, mock data, architecture patterns, state machine rules, and queries relevant to each step.

### Phase 0 Steps ✅ COMPLETE

**Step 0.1: Technical Planning & Reference Materials** ✅ COMPLETE
- Lines 1-4767 (entire document) — This step created the entire technical reference document

**Step 0.2: EditorJS Plugin Updates** ✅ COMPLETE
- Lines 281-289 (Stage 1: EditorRenderer shared component dependency) — Documents current 5 plugins, required 8 additional plugins
- Lines 2587-2588 (Stage 4: ContentReader article rendering) — EditorRenderer integration in ContentReader component
- Lines 3048-3049 (Stage 4: Shared components integration) — EditorRenderer import with SSR prevention
- Lines 4052-4088 (Stage 6: Content query with joins) — Content loading includes content_body for articles
- Lines 1274-1471 (Stage 3: Test Set 1 content samples) — Article type mock data with EditorJS blocks for testing
- Lines 327-352 (Stage 1: Content type dependencies) — Article type uses content_body field, EditorJS display requirements

**Step 0.3: ContentViewer.tsx Evaluation** ✅ COMPLETE
- Lines 289-295 (Stage 1: ContentViewer shared component dependency) — ContentViewer analysis, reuse vs custom decision needed
- Lines 2558-2660 (Stage 4: ContentReader component) — Complete ContentReader blueprint, may adapt ContentViewer.tsx
- Lines 2656-2659 (Stage 4: ContentReader integration note) — Step 0.3 decision: Build custom ContentReader component
- Lines 887-917 (Stage 2: Content Reader types) — ContentReaderState, positioning, type renderer interfaces
- Lines 327-352 (Stage 1: Content type dependencies) — All 4 content types display requirements
- Lines 1274-1471 (Stage 3: Test Set 1 all content types) — Mock data for article, image, video, audio testing

### Phase 1 Steps

**Step 1.1: Database Schema Changes**
- Lines 57-85 (Stage 1: Database schema dependencies) — Complete list of existing tables, new tables needed (byline_options, link_options), new fields (featured, byline_style, link_style)
- Lines 4599-4663 (Stage 6: Database schema summary) — Complete 7-table schema with all field specifications, data types, constraints
- Lines 573-679 (Stage 2: Content Item types) — ContentItemRaw shows database structure with all fields and joins
- Lines 711-740 (Stage 2: Collection types) — Collection schema with featured field, slug for tabs
- Lines 743-769 (Stage 2: Dropdown option types) — BylineOption and LinkOption table structures
- Lines 1085-1117 (Stage 2: Query filter types) — Query filtering requirements for featured/byline/link validation

**Step 1.2: Admin - Categories & Subcategories order_index UI**
- Lines 88-122 (Stage 1: Admin panel dependencies) — Complete admin UI pattern [ORDER_INDEX] [EDIT] [DELETE], validation requirements
- Lines 98-101 (Stage 1: Step 1.2 specific requirements) — Inline editable order_index, save on blur/enter
- Lines 682-708 (Stage 2: Category and Subcategory types) — Category and Subcategory data structures with order_index field
- Lines 1479-1497 (Stage 3: Test Set 2 categories/subcategories) — Mock categories and subcategories with order_index values for testing

**Step 1.3: Admin - Collections order_index & featured checkbox**
- Lines 88-122 (Stage 1: Admin panel dependencies) — Admin UI patterns, featured checkbox positioning after Description
- Lines 103-106 (Stage 1: Step 1.3 specific requirements) — Inline order_index editing, featured checkbox, empty collection validation
- Lines 711-740 (Stage 2: Collection types) — Collection structure with featured boolean, empty validation note
- Lines 1516-1577 (Stage 3: Test Set 3 collections) — Mock collections with featured true/false, empty collection testing

**Step 1.4: Admin - Byline/Link Style Dropdown System**
- Lines 88-122 (Stage 1: Admin panel dependencies) — Dropdown management modal UI with two buttons, add-only design
- Lines 108-113 (Stage 1: Step 1.4 specific requirements) — Modal structure, "Create as Byline"/"Create as Link" buttons, validation
- Lines 743-769 (Stage 2: Dropdown option types) — BylineOption and LinkOption structures with option_text field
- Lines 1702-1721 (Stage 3: Test Set 5 dropdown options) — Mock byline options and link options for testing add functionality

**Step 1.5: Admin - Content Tab New Fields**
- Lines 88-122 (Stage 1: Admin panel dependencies) — Field positioning (featured below Download Settings, byline_style above Author Name, link_style above Link to Original Source)
- Lines 115-120 (Stage 1: Step 1.5 specific requirements) — Featured checkbox, byline_style dropdown required, link_style dropdown required, validation
- Lines 573-679 (Stage 2: Content Item types) — Complete ContentItem structure showing all fields including featured, byline_style, link_style
- Lines 1274-1471 (Stage 3: Test Set 1 basic content) — Mock content with all fields populated for testing form functionality

### Phase 2 Steps

**Step 2.1: PortfolioTab Component Foundation**
- Lines 2096-2276 (Stage 4: PortfolioTab root component) — Complete component structure with 13 state variables, event handlers, render logic
- Lines 772-815 (Stage 2: Page state types) — PageState union, PortfolioState interface, SelectionState
- Lines 3236-3260 (Stage 5: State definitions) — Three active states, initial state specification
- Lines 2876-2940 (Stage 4: State management patterns) — useState, useMemo, useCallback patterns for root component
- Lines 125-161 (Stage 1: State machine dependencies) — State management requirements, activeCollections array structure

**Step 2.2: Data Fetching - Categories & Subcategories**
- Lines 3965-4004 (Stage 6: Queries 1-2 categories/subcategories) — Complete loadCategories and loadSubcategories query specifications
- Lines 682-708 (Stage 2: Category and Subcategory types) — Return types for queries
- Lines 1479-1497 (Stage 3: Test Set 2 categories/subcategories) — Mock data for validating query results
- Lines 4302-4306 (Stage 6: Loading sequence step 1) — Parallel loading of categories and subcategories
- Lines 229-257 (Stage 1: Data flow dependencies) — Categories/subcategories loading sequence

**Step 2.3: Data Fetching - Content Items**
- Lines 4049-4105 (Stage 6: Query 5 content with joins) — Complete loadContent query with all nested joins and filters
- Lines 4139-4229 (Stage 6: Data transformation pipeline) — extractPublicationYear, transformContentItem, loadAndTransformContent functions
- Lines 573-679 (Stage 2: Content Item types) — ContentItemRaw and ContentItem with transformation notes
- Lines 1274-1471 (Stage 3: Test Set 1 basic content) — Mock content items for all 4 types for testing queries
- Lines 1832-1883 (Stage 3: Test Set 7 featured filter) — Mock data for testing featured filter logic
- Lines 4314-4316 (Stage 6: Loading sequence step 3) — Content loading with transformation

**Step 2.4: Data Fetching - Collections**
- Lines 4109-4136 (Stage 6: Query 6 collections) — Complete loadCollections query specification
- Lines 711-740 (Stage 2: Collection types) — Collection interface with all fields
- Lines 1516-1577 (Stage 3: Test Set 3 collections) — Mock collections with featured/non-featured for testing
- Lines 2144-2147 (Stage 4: PortfolioTab featuredCollections computed state) — Featured collections filtering with useMemo
- Lines 4318-4319 (Stage 6: Loading sequence step 4) — Collections loading parallel with content

**Step 2.5: Loading State Implementation**
- Lines 4232-4288 (Stage 6: Auto-selection logic) — Complete autoSelectInitialContent function with 3-step sequence
- Lines 4291-4372 (Stage 6: Complete data loading implementation) — Full useEffect pattern with 7-step loading, error handling
- Lines 3236-3260 (Stage 5: State definitions) — Initial state expanded-reader with first items selected
- Lines 1729-1743 (Stage 3: Test Set 6 Scenario 1 loading state) — Expected behavior for loading state testing
- Lines 4321-4341 (Stage 6: Auto-select and set state) — Steps 5-7 of loading sequence

**Step 2.6: Integration with Profile & BottomTabBar**
- Lines 260-295 (Stage 1: Shared component dependencies) — Profile and BottomTabBar reuse specifications
- Lines 2734-2806 (Stage 4: BottomTabBar integration pattern) — Complete integration code with activeCollections, activeTab, callbacks
- Lines 1195-1222 (Stage 2: BottomTabBar integration types) — BottomTabBarProps, TabIndicatorStyle
- Lines 3046-3050 (Stage 4: Integration Point 6 shared components) — Profile reuse, BottomTabBar collection tabs functionality
- Lines 2209-2209 (Stage 4: PortfolioTab render Profile) — Profile component integration in render

### Phase 3 Steps

**Step 3.1: Main Menu - Basic Three-Column Layout**
- Lines 2279-2467 (Stage 4: MainMenu component) — Complete component blueprint with three-column grid structure
- Lines 2382-2446 (Stage 4: MainMenu expanded render) — Three-column grid layout code with gap-[3rem]
- Lines 818-850 (Stage 2: Main Menu types) — MainMenuState, MainMenuCallbacks interfaces
- Lines 298-325 (Stage 1: Styling dependencies) — Color system, spacing requirements (3rem gap)
- Lines 963-984 (Stage 2: MainMenuProps) — Complete props interface for MainMenu component

**Step 3.2: Main Menu - Hierarchical Filtering**
- Lines 3486-3564 (Stage 5: Main Menu filtering logic) — Column 2 filter (subcategories by category), Column 3 filter (content by subcategory), collection tab filtering
- Lines 2299-2315 (Stage 4: MainMenu computed state) — displayedSubcategories and displayedContent useMemo implementations
- Lines 1145-1166 (Stage 2: Empty state types) — EmptyStateMessage definitions for "No categories/subcategories/content"
- Lines 1911-1955 (Stage 3: Test Set 9 empty states) — Mock data for testing empty state messages
- Lines 375-379 (Stage 1: UI constraints) — Main menu never shows unfiltered subcategories or content

**Step 3.3: Main Menu - Selection & Color Coding**
- Lines 3433-3483 (Stage 5: Selection color coding rules) — Hierarchy rule implementation, getSelectionColor function, color values
- Lines 2327-2365 (Stage 4: MainMenu helper functions) — getSelectionColor and handleItemClick implementations with re-selection behavior
- Lines 3263-3385 (Stage 5: State transition rules 1-3) — Category/subcategory/content click behaviors
- Lines 1724-1824 (Stage 3: Test Set 6 state scenarios) — Mock scenarios for testing selection hierarchy and state transitions
- Lines 320-324 (Stage 1: Selection color coding) — Selected #00ff88, unselected #6b7280, hover #e5e7eb

**Step 3.4: Main Menu - Content Item Display**
- Lines 2420-2446 (Stage 4: MainMenu column 3 content render) — Content item display with title, subtitle formatting
- Lines 2431-2440 (Stage 4: Subtitle display logic) — sidebar_subtitle / year format with null handling
- Lines 573-679 (Stage 2: Content Item types) — sidebar_title, sidebar_subtitle, publication_year fields
- Lines 1580-1694 (Stage 3: Test Set 4 edge cases) — Mock data for null sidebar_title, null sidebar_subtitle, null publication_date testing
- Lines 4141-4156 (Stage 6: extractPublicationYear function) — Year extraction from publication_date for subtitle display

**Step 3.5: Main Menu - Column Width Constraints**
- Lines 375-378 (Stage 1: UI constraints column widths) — Categories/subcategories max 25 chars, content unlimited
- Lines 1063-1068 (Stage 2: ColumnWidthConstraint type) — maxCharacters 25, maxPixels to calculate, overflow hidden
- Lines 1886-1908 (Stage 3: Test Set 8 column width testing) — Mock data with short, exactly 25, and exceeds 25 character names
- Lines 2394, 2412 (Stage 4: MainMenu column 1-2 styling) — maxWidth: '25ch' with overflow: 'hidden' implementation

**Step 3.6: Main Menu - Expand/Collapse Behavior**
- Lines 3308-3320 (Stage 5: Transition Rule 4 main menu click) — Collapsed menu click expands to expanded-reader without selection change
- Lines 3294-3306 (Stage 5: Transition Rule 3 content click) — Content click collapses menu to collapsed-reader
- Lines 2369-2379 (Stage 4: MainMenu collapsed render) — Collapsed state breadcrumb display with onClick expansion
- Lines 2179-2183 (Stage 4: handleMainMenuClick callback) — Handler for collapsed menu expansion
- Lines 3388-3429 (Stage 5: Component visibility matrix) — Main Menu visibility and layout per state

### Phase 4 Steps

**Step 4.1: Content Reader - Basic Structure**
- Lines 2558-2660 (Stage 4: ContentReader component) — Complete component blueprint with positioning, visibility, scrolling
- Lines 2572-2580 (Stage 4: Computed positioning) — marginLeft and marginRight calculations for expanded/collapsed
- Lines 2624-2641 (Stage 4: ContentReader render) — overflow-y auto, marginTop/maxHeight vertical constraints
- Lines 887-917 (Stage 2: Content Reader types) — ContentReaderState, ContentReaderPositioning specifications
- Lines 3397-3398 (Stage 5: Visibility matrix Content Reader row) — Hidden in expanded-empty, visible with positioning in reader states
- Lines 995-1000 (Stage 2: ContentReaderProps) — Props interface for component

**Step 4.2: Content Reader - Title & Subtitle Display**
- Lines 2633-2636 (Stage 4: ContentReader title/subtitle render) — h1 for title, h2 for subtitle with styling
- Lines 573-679 (Stage 2: Content Item types) — title and subtitle fields in ContentItem
- Lines 636-640 (Stage 2: ContentItem display fields note) — title for Content reader, subtitle for Content reader
- Lines 1274-1471 (Stage 3: Test Set 1 content samples) — Mock content with various title/subtitle combinations

**Step 4.3: Content Reader - Article Type Rendering (EditorJS)**
- Lines 2584-2588 (Stage 4: ContentReader article case) — EditorRenderer import and usage for article type
- Lines 281-289 (Stage 1: EditorRenderer dependency) — Prerequisite: EditorRenderer must have 13 plugins
- Lines 641-642 (Stage 2: content_body field usage) — content_body for article type only, EditorJS JSON
- Lines 1279-1319, 1420-1458 (Stage 3: Article type mock data) — Two article samples with EditorJS blocks for testing
- Lines 3048-3049 (Stage 4: EditorRenderer integration note) — Dynamic import with ssr: false required

**Step 4.4: Content Reader - Image/Video/Audio Types**
- Lines 2584-2619 (Stage 4: ContentReader renderContentByType) — Switch statement for all 4 types with complete rendering code
- Lines 2590-2614 (Stage 4: Image/video/audio cases) — img tag, iframe YouTube detection, HTML5 video/audio players
- Lines 643-645 (Stage 2: Type-specific URL fields) — image_url, video_url, audio_url field usage
- Lines 1320-1418 (Stage 3: Image/video/audio mock data) — Mock data for image (Cloudinary), video (YouTube), audio (mp3)
- Lines 327-352 (Stage 1: Content type dependencies) — Display requirements per type, content-agnostic pattern
- Lines 2645-2648 (Stage 4: Content-agnostic pattern note) — Positioning/state identical, only rendering varies

**Step 4.5: Info Menu - Component Structure**
- Lines 2663-2731 (Stage 4: InfoMenu component) — Complete component blueprint with fixed positioning, color coding
- Lines 2678-2713 (Stage 4: InfoMenu render) — Fixed positioning top 50% left 2.5%, three metadata lines
- Lines 920-960 (Stage 2: Info Menu types) — InfoMenuState, ContentMetadata, InfoMenuPositioning, InfoMenuColors
- Lines 3398-3399 (Stage 5: Visibility matrix Info Menu row) — Hidden in expanded-empty, visible fixed position in reader states
- Lines 1002-1006 (Stage 2: InfoMenuProps) — Props interface with metadata and isVisible

**Step 4.6: Info Menu - Metadata Display**
- Lines 2687-2711 (Stage 4: InfoMenu three metadata lines) — Line 1 publication/date, Line 2 byline:author, Line 3 link:source
- Lines 928-940 (Stage 2: ContentMetadata type) — Three-line metadata structure with all fields
- Lines 658-662 (Stage 2: Dropdown option texts in ContentItem) — byline_style_text and link_style_text computed from joins
- Lines 1702-1721 (Stage 3: Test Set 5 dropdown options) — Mock dropdown options for testing label display
- Lines 2722-2725 (Stage 4: InfoMenu color coding) — Labels green #00ff88, values gray #9ca3af, hover #e5e7eb

### Phase 5 Steps

**Step 5.1: Collections Menu - Basic Structure**
- Lines 2470-2555 (Stage 4: CollectionsMenu component) — Complete component blueprint with dual layout (vertical/horizontal)
- Lines 2503-2540 (Stage 4: CollectionsMenu render) — Vertical flex-col and horizontal flex-row-reverse layouts
- Lines 853-884 (Stage 2: Collections Menu types) — CollectionsMenuState with isVertical flag, layout switching
- Lines 986-993 (Stage 2: CollectionsMenuProps) — Props interface for component
- Lines 3567-3607 (Stage 5: Collections Menu visibility rules) — Vertical/horizontal layout rules with code

**Step 5.2: Collections Menu - Visibility Rules**
- Lines 3567-3607 (Stage 5: Collections Menu visibility rules) — Featured collections in expanded (vertical), linked collections in collapsed (horizontal)
- Lines 2488-2499 (Stage 4: CollectionsMenu displayedCollections) — useMemo with featured filter or linked filter based on isVertical
- Lines 2524-2525 (Stage 4: Horizontal order reversal) — Smallest right → larger left ordering for collapsed state
- Lines 1516-1577 (Stage 3: Test Set 3 collections) — Mock collections for testing featured vs linked visibility
- Lines 856-865 (Stage 2: CollectionsMenuState) — expandedCollections vs collapsedCollections arrays

**Step 5.3: Collections Menu - Collection Click Behavior**
- Lines 3322-3344 (Stage 5: Transition Rules 5-6 collection click) — Collection click from expanded/collapsed to expanded-reader collection tab
- Lines 2185-2191, 2747-2760 (Stage 4: handleCollectionClick implementation) — Append to activeCollections array, switch activeTab
- Lines 2254-2259 (Stage 4: BottomTabBar render in PortfolioTab) — Pass activeTab and activeCollections to BottomTabBar
- Lines 1958-2017 (Stage 3: Test Set 10 multiple collections) — Mock click sequence for testing tab opening
- Lines 125-161 (Stage 1: State machine collection tab state) — activeCollections array append not replace, activeTab tracking

**Step 5.4: Collection Tab - Filtering Logic**
- Lines 4375-4470 (Stage 6: Collection content filtering) — filterContentByCollection, filterCategoriesByCollection, filterSubcategoriesByCollection functions
- Lines 3531-3564 (Stage 5: Categories in collection tabs filter) — Cascading filter showing only categories with collection content
- Lines 4429-4469 (Stage 6: Usage in state useMemo) — displayedCategories/Subcategories/Content with collection filtering
- Lines 871-876 (Stage 2: CollectionFilteringResult type) — Filtered content, categories, subcategories structure
- Lines 1516-1577 (Stage 3: Test Set 3 collection-content links) — Mock data for testing collection filtering

**Step 5.5: Collection Tab - Content Selection & Display**
- Lines 3322-3337 (Stage 5: Rule 5 edge case) — If current content in collection keep selection, else select first by order_index
- Lines 4232-4288 (Stage 6: Auto-selection logic reusable) — autoSelectInitialContent pattern applicable to collection tabs
- Lines 1169-1192 (Stage 2: Collection tab state types) — CollectionTabState, CollectionTabLoadBehavior for selection logic
- Lines 1787-1802 (Stage 3: Test Set 6 Scenario 4 collection tab) — Expected auto-selection behavior when opening collection
- Lines 3689-3725 (Stage 5: State persistence patterns) — collectionSelections Record tracking last content per collection

**Step 5.6: Collection Tab - Close/Return Mechanism**
- Lines 3372-3384 (Stage 5: Transition Rule 9 collection tab close) — Close removes from activeCollections, switches to portfolio tab
- Lines 2199-2203, 2762-2774 (Stage 4: handleCollectionClose implementation) — Remove from array, switch activeTab if closing current
- Lines 1988-2006 (Stage 3: Test Set 10 close sequence) — Mock close behavior for testing tab removal
- Lines 3181-3207 (Stage 4: Flow 3 collection tab close) — Complete state update flow diagram

**Step 5.7: Multiple Collections Support**
- Lines 1958-2017 (Stage 3: Test Set 10 multiple collections complete) — Full click sequence with 2 collections open, closing one, closing last
- Lines 2747-2760 (Stage 4: handleCollectionClick check if already open) — Prevent duplicates, append if new
- Lines 3346-3358 (Stage 5: Transition Rule 7 tab switching) — Switch between multiple collection tabs
- Lines 731-732 (Stage 2: ActiveCollections array type) — Array of CollectionTab objects
- Lines 2776-2787, 2193-2197 (Stage 4: handleTabChange) — Switch between portfolio/collection tabs with filtering

### Phase 7 Steps

**Step 7.1: Entry Visual Reordering - Main Menu**
- Lines 3610-3673 (Stage 5: Visual reordering logic) — Complete reordering behavior, reorderColumn function, animation considerations
- Lines 2317-2320 (Stage 4: MainMenu visual reordering state) — categoriesOrder, subcategoriesOrder, contentOrder useState arrays
- Lines 1120-1142 (Stage 2: Visual reordering types) — EntryReorderState with isAnimating flag for race condition prevention
- Lines 3632-3666 (Stage 5: reorderColumn implementation) — Complete function code with selected to top logic
- Lines 3668-3673 (Stage 5: Animation considerations) — Race condition prevention with isAnimating flag

**Step 7.2: Transition Animations**
- Lines 3668-3673 (Stage 5: Animation considerations for reordering) — Animation timing, race condition prevention
- Lines 270-277 (Stage 1: BottomTabBar animations) — Framer Motion entry/exit animations (scale, opacity, 200ms)
- Lines 1130-1135 (Stage 2: ReorderAnimation type) — Animation duration, easing, waitForPrevious flag
- Lines 3759-3774 (Stage 5: Edge Case 6 rapid clicks) — isAnimating flag implementation for animation handling
- All state transition rules (lines 3263-3385) — All transitions that need animation

**Step 7.3: Edge Case Handling**
- Lines 3729-3775 (Stage 5: Edge cases & error handling) — All 6 edge cases with handling strategies
- Lines 1580-1694 (Stage 3: Test Set 4 edge cases) — Mock data for null field handling
- Lines 1911-1955 (Stage 3: Test Set 9 empty states) — Mock data for empty database testing
- Lines 355-385 (Stage 1: Critical constraints complete) — All constraints that define edge case boundaries
- Lines 4546-4596 (Stage 6: Error recovery patterns) — Partial data load, retry on failure, stale data fallback

**Step 7.4: Final Styling & Polish**
- Lines 298-325 (Stage 1: Styling dependencies complete section) — All 8 colors, layout requirements, spacing specifications
- Lines 300-308 (Stage 1: Color system) — Complete color palette with hex values
- Lines 310-315 (Stage 1: Layout requirements) — Profile 33vh, content flexible, BottomTabBar 10vh, max-width 1280px
- Lines 316-319 (Stage 1: Spacing requirements) — Main menu columns 3rem gap, element spacing by state
- Lines 2052-2070 (Stage 3: Validation checklist) — 14 verification points for overall completeness

---

## Quick Navigation by Topic

**When you need information about...**

**Database Schema**: Lines 57-85 (Stage 1), 4599-4663 (Stage 6 summary)
**TypeScript Types**: Lines 563-1260 (entire Stage 2)
**Mock Data for Testing**: Lines 1264-2082 (entire Stage 3)
**Component Architecture**: Lines 2086-3222 (entire Stage 4)
**State Machine Logic**: Lines 3226-3920 (entire Stage 5)
**Data Loading & Queries**: Lines 3924-4767 (entire Stage 6)
**Admin Requirements**: Lines 88-122 (Stage 1)
**Styling Specifications**: Lines 298-325 (Stage 1)
**Content Types**: Lines 327-352 (Stage 1), 573-679 (Stage 2)
**Collections System**: Lines 711-740 (Stage 2 types), 1516-1577 (Stage 3 mock), 2470-2555 (Stage 4 component), 3567-3607 (Stage 5 rules)

---

## STAGE 1: DEPENDENCY ANALYSIS & OVERVIEW

### Document Purpose

This document provides technical foundation for Portfolio tab development. Created during Step 0.1 and locked upon completion, it serves as permanent reference throughout development phases.

**What's Included**:
- TypeScript type definitions for all data structures
- Mock data samples for testing and validation
- Component architecture blueprints with state management patterns
- State machine documentation with transition rules
- Testing strategy with comprehensive checklists

**What's NOT Included**:
- Implementation code (belongs in component files)
- Architecture decisions (documented in planning doc Step 0.3)
- Risk assessment (deferred to implementation; less algorithmically complex than Resume tab)
- Step-by-step instructions (belongs in planning doc)

**How Planning Doc Uses This**:
- Each step references specific line ranges from this document
- Example: "Reference tech-ref lines 500-650 for ContentItem types during Step 2.3"
- Prevents duplication and maintains single source of technical truth

---

### Comprehensive Dependency Analysis

**Critical Dependencies from portfolio-logic.md:**

#### 1. Database Schema Dependencies (Logic Doc Lines 43-62)

**Existing Tables** (confirmed in admin code):
- **categories**: id, name, order_index
- **subcategories**: id, category_id (FK), name, order_index  
- **collections**: id, name, description (JSONB), slug, order_index, featured (NEEDS ADDING)
- **content**: id, type, category_id (FK), subcategory_id (FK), title, subtitle, sidebar_title, sidebar_subtitle, content_body (JSONB), image_url, video_url, audio_url, author_name, publication_name, publication_date, source_link, copyright_notice, download_enabled, external_download_url, order_index, featured (NEEDS ADDING), byline_style (FK - NEEDS ADDING), link_style (FK - NEEDS ADDING), created_at
- **content_collections**: content_id (FK), collection_id (FK), order_index

**New Tables Required** (Phase 1, Step 1.1):
- **byline_options**: id, option_text, created_at
- **link_options**: id, option_text, created_at

**New Fields Required** (Phase 1, Step 1.1):
- collections.featured (boolean, default false)
- content.featured (boolean, default false)
- content.byline_style (UUID FK to byline_options, non-nullable)
- content.link_style (UUID FK to link_options, non-nullable)

**Query Filtering Requirements** (Logic Doc Line 185):
- Main menu content: `WHERE featured = true AND byline_style IS NOT NULL AND link_style IS NOT NULL`
- Collection filtering: Join content_collections, filter by collection_id, apply same validation
- Categories: Order by order_index ASC
- Subcategories: Filter by category_id, order by order_index ASC
- Content: Filter by subcategory_id, order by order_index ASC
- Collections: Featured filter for menu display, order by order_index ASC

**Critical Constraint**: byline_style and link_style are required/non-nullable; content without these cannot display on Portfolio tab front-end

---

#### 2. Admin Panel Dependencies (Logic Doc Lines 445-515)

**Phase 1 Requirements** (must complete before Phase 2):

**Step 1.1: Database Changes**
- Create byline_options and link_options tables
- Add featured fields to collections and content tables
- Add byline_style and link_style fields to content table with FK constraints

**Step 1.2: Categories/Subcategories Admin**
- Add inline editable order_index display
- Pattern: `[ORDER_INDEX] [EDIT] [DELETE]`
- Save on blur/enter
- Field exists in DB, only UI implementation needed

**Step 1.3: Collections Admin**
- Add inline editable order_index (same pattern as 1.2)
- Add featured checkbox in create/edit window (after Description field)
- Add validation: empty collections (0 content items) cannot be featured

**Step 1.4: Dropdown Options Management**
- Create modal/window with text input + two buttons
- "Create as Byline" button → inserts into byline_options table
- "Create as Link" button → inserts into link_options table
- Add-only (no edit/delete functionality by design)
- Validation: non-empty text required

**Step 1.5: Content Form New Fields**
- Featured checkbox: below Download Settings section, default false
- byline_style dropdown: above Author Name field, required, populates from byline_options
- link_style dropdown: above Link to Original Source field, required, populates from link_options
- Validation enforces dropdown selections before save

**Dependency Chain**: 1.1 → 1.2 → 1.3 → 1.4 → 1.5 (each step depends on previous)

---

#### 3. State Machine Dependencies (Logic Doc Lines 64-94, 113-165)

**Three Active States**:
1. **expanded-empty**: Menu expanded, category/subcategory selected (green), children gray, no content selected, Content reader hidden
2. **expanded-reader**: Menu expanded, full path selected (category + subcategory + content green), Content reader visible
3. **collapsed-reader**: Menu collapsed, content selected (green), category/subcategory gray, Content reader visible

**Initial State** (Logic Doc Lines 113-125):
- Page loads in expanded-reader
- First category selected (by order_index)
- First subcategory selected (of first category)
- First content item selected (of first subcategory)
- Full hierarchy green, Content reader shows first item

**Nine Transition Rules** (Logic Doc Lines 85-94):
1. Initial load → expanded-reader
2. expanded-reader + click different content → collapsed-reader
3. expanded-reader + click category → expanded-empty
4. expanded-reader + click subcategory → expanded-empty
5. expanded-empty + click content → collapsed-reader
6. collapsed-reader + click Main menu anywhere → expanded-reader
7. Any state + click Collections menu → Opens collection tab
8. Any state + click already-selected entry → NO CHANGE
9. Any state + click non-selected entry → follows Selection Logic rules

**Collection Tab State** (Logic Doc Lines 98-111):
- Adds to activeCollections array (append, don't replace)
- Switches activeTab to collection.slug
- Loads in expanded-reader state
- If current content in collection: keep selected
- If current content NOT in collection: select first by order_index
- Filters Main menu to collection content only
- Close button (✕) removes from array, returns to 'portfolio' tab

**Critical State Management**: activeTab string ('portfolio' | 'resume' | 'downloads' | collection.slug), activeCollections array of {slug, name} objects

---

#### 4. Component Hierarchy Dependencies

**Six Core Components** (identified from Logic Doc):

1. **PortfolioTab** (root component)
   - State: activeTab, activeCollections, selectedCategory, selectedSubcategory, selectedContent, pageState
   - Data loading: categories, subcategories, content, collections
   - Integration: Profile, BottomTabBar
   - Child components: MainMenu, CollectionsMenu, ContentReader, InfoMenu

2. **MainMenu** (Logic Doc Lines 167-230)
   - Three-column layout (categories → subcategories → content)
   - Hierarchical filtering: category selects → filters subcategories, subcategory selects → filters content
   - Selection logic: hierarchy selection, color coding, reordering
   - State-dependent display: expanded vs collapsed
   - Width constraints: columns 1-2 max 25 chars, column 3 unlimited

3. **CollectionsMenu** (Logic Doc Lines 249-270)
   - Dual layout: vertical (expanded states) vs horizontal (collapsed state)
   - Visibility rules: featured only (expanded) vs linked to content (collapsed)
   - Order: order_index ASC (expanded), order_index with smallest right/larger left (collapsed)
   - Click behavior: opens collection tab via BottomTabBar

4. **ContentReader** (Logic Doc Lines 272-312)
   - Visibility: only in reader states (collapsed-reader, expanded-reader)
   - Positioning: dynamic based on state (expanded: +80px right, collapsed: -15% right extend)
   - Content types: article (EditorJS), image (img tag), video (iframe/HTML5), audio (HTML5)
   - Scrolling: overflow-y auto, constrained between Profile and BottomTabBar

5. **InfoMenu** (Logic Doc Lines 314-351)
   - Visibility: only in reader states
   - Positioning: absolute (top: 50%, left: 2.5%), fixed during Content Reader scroll
   - Three metadata lines: Publication/Date, Byline: Author, Link: Source
   - Dropdown integration: fetches byline_style and link_style option texts
   - Color coding: labels green, values gray

6. **BottomTabBar Integration** (Logic Doc Lines 390-421)
   - Reuses existing component
   - Main tabs: PORTFOLIO, RESUME, DOWNLOADS
   - Dynamic collection tabs: added via activeCollections array
   - Close mechanism: onCollectionClose callback
   - State tracking: activeTab indicates current view

**Component Dependencies**:
```
PortfolioTab (root)
├── Profile (shared, reuse as-is)
├── MainMenu
│   ├── Categories Column
│   ├── Subcategories Column (filtered by selected category)
│   └── Content Items Column (filtered by selected subcategory)
├── CollectionsMenu
│   └── Layout switches: vertical/horizontal based on pageState
├── ContentReader
│   ├── Title/Subtitle display
│   ├── EditorRenderer (for article type)
│   └── Image/Video/Audio players (for other types)
├── InfoMenu
│   └── Metadata lines with dropdown option text
└── BottomTabBar (shared, reuse with collection tabs)
    ├── Main tabs: PORTFOLIO/RESUME/DOWNLOADS
    └── Collection tabs: dynamic, closeable
```

---

#### 5. Data Flow Dependencies

**Data Loading Sequence** (Phase 2):
1. Categories → load all, order by order_index
2. Subcategories → load all, store with category_id relationships
3. Content → load featured only with query filter, include all metadata
4. Collections → load all, separate featured array

**Data Transformation Requirements**:
- Extract year from publication_date (format: "January 2024" → extract "2024")
- Lookup byline_style and link_style option texts from respective tables
- Join content_collections for collection relationships
- Calculate visibility (featured validation + byline_style/link_style NOT NULL)

**Data Relationships**:
- Categories (1) → (N) Subcategories
- Subcategories (1) → (N) Content Items
- Content Items (N) ← (M) Collections (via content_collections join table)
- Content Items (1) → (1) Category (via category_id FK)
- Content Items (1) → (1) Subcategory (via subcategory_id FK)
- Content Items (1) → (1) Byline Option (via byline_style FK)
- Content Items (1) → (1) Link Option (via link_style FK)

**Critical Query Requirements**:
- Main menu content must filter by: featured = true AND byline_style IS NOT NULL AND link_style IS NOT NULL
- Collection filtering must join content_collections and still apply featured validation
- Categories/subcategories must filter dynamically based on content availability
- Empty collections (0 content items) cannot be featured

---

#### 6. Shared Component Dependencies

**Reused Components** (no modifications needed):

**Profile Component** (Logic Doc Lines 384-388):
- Reuse existing Profile.tsx
- Behavior: expansion pushes content down
- Integration: Portfolio content moves down when Profile expands
- No modifications required

**BottomTabBar Component** (Logic Doc Lines 390-421):
- Reuse existing BottomTabBar.tsx
- Main tabs: PORTFOLIO, RESUME, DOWNLOADS (emerald green underline for active)
- Collection tabs: dynamic via collections prop array {slug, name}[]
- Tab label format: "COLLECTION {NAME}" (uppercase)
- Active indicator: purple background for collections
- Close button: ✕ on each collection tab, triggers onCollectionClose(slug)
- Animations: Framer Motion entry/exit (scale 0.8 ↔ 1, opacity 0 ↔ 1, 200ms)
- No modifications needed to component itself
- Portfolio tab manages: activeCollections array, activeTab state, callbacks

**EditorRenderer Component** (Logic Doc Lines 353-382):
- Exists at components/EditorRenderer.tsx
- Used for article type content only (content_body field)
- Current support: 5 basic plugins (Header, List, Paragraph, Quote, Code)
- Required update (Step 0.2): Add 8 missing plugins (Link, Table, Marker, InlineCode, Underline, Warning, Delimiter, Raw)
- SSR prevention: dynamic import with ssr: false
- Read-only mode: display only, no editing

**ContentViewer Component** (Logic Doc Lines 369-377):
- Exists at components/ContentViewer.tsx
- Complete content display component already in use
- Handles all 4 types: article, image, video, audio
- Displays metadata: title, subtitle, author, publication name/date, source link
- Architecture decision (Step 0.3): Reuse vs build custom for Portfolio

---

#### 7. Styling Dependencies (Logic Doc Lines 423-443)

**Color System** (must match exactly):
- Background: #1a1d23 (dark blue-gray)
- Profile header border: #374151 (gray-700)
- Text primary: #e5e7eb (gray-200)
- Text secondary: #d1d5db (gray-300)
- Text muted: #9ca3af (gray-400)
- Text inactive: #6b7280 (gray-500)
- Active/Accent: #00ff88 (emerald green)
- BottomTabBar bg: #0f1419 (darker)

**Layout Requirements**:
- Profile header: 33vh height
- Content area: flexible (middle section)
- BottomTabBar: 10vh height
- Max content width: 1280px centered

**Spacing Requirements**:
- Main menu columns: 3rem gap
- Menu bar elements: varies by state (horizontal vs vertical)

**Selection Color Coding** (Logic Doc Lines 205-208):
- Selected entries: emerald green #00ff88
- Unselected entries: gray #6b7280
- Hover: lighter gray #e5e7eb

---

#### 8. Content Type Dependencies (Logic Doc Lines 52-58, 284-290)

**Four Content Types** (field usage):
- **article**: content_body populated (JSONB EditorJS), others null
- **image**: image_url populated (text, Cloudinary or direct URL), others null
- **video**: video_url populated (text, YouTube embed or Cloudinary), others null
- **audio**: audio_url populated (text, Cloudinary upload), others null

**Shared Metadata** (all types):
- title, subtitle, sidebar_title, sidebar_subtitle
- author_name, publication_name, publication_date, source_link
- byline_style (FK), link_style (FK)
- category_id (FK), subcategory_id (FK)
- featured (boolean), order_index (integer)

**Content-Agnostic Development** (Logic Doc Line 294):
- Core logic (navigation, state management, filtering) works identically for all 4 types
- Only Content Reader display varies by type
- Main Menu, Collections Menu, Info Menu: type-independent

**Display Requirements per Type**:
- Article: EditorRenderer component (all 13 plugins)
- Image: img tag with rounded corners, responsive sizing
- Video: YouTube iframe detection or HTML5 video player (<10MB Cloudinary, >10MB YouTube unlisted)
- Audio: HTML5 audio player with controls

---

#### 9. Critical Constraints & Rules

**Database Constraints**:
- byline_style and link_style are required/non-nullable in content table
- Content without valid byline_style or link_style cannot display on Portfolio tab
- Empty collections (0 content items) cannot be marked as featured
- order_index must exist for categories, subcategories, collections, content

**Query Constraints**:
- Featured filter always applies: featured = true
- Byline/link validation always applies: byline_style IS NOT NULL AND link_style IS NOT NULL
- Collection filtering maintains featured validation
- Categories/subcategories show only if contain at least one valid content item

**State Constraints**:
- Only 3 active states (collapsed-empty not used)
- expanded-empty only reachable via category/subcategory click (never on initial load)
- Collection tabs load in expanded-reader state always
- Re-clicking already-selected entry does nothing (except collapsed state Main menu click expands)

**UI Constraints**:
- Categories column: max 25 characters, text cut off beyond
- Subcategories column: max 25 characters, text cut off beyond
- Content items column: no character limit, grows to fit
- Main menu never shows unfiltered subcategories or content (always filtered by parent)

**Uniqueness Constraints** (Logic Doc Line 247):
- Each entry appears exactly once in its column (no duplicates)
- Collections menu items never repeat (each collection appears once)
- Critical for preventing bugs

---

### Component Relationships Map

**Hierarchical Structure**:
```
PortfolioTab (state management hub)
│
├── [State] activeTab: string
├── [State] activeCollections: {slug, name}[]
├── [State] selectedCategory: Category | null
├── [State] selectedSubcategory: Subcategory | null
├── [State] selectedContent: ContentItem | null
├── [State] pageState: 'expanded-empty' | 'expanded-reader' | 'collapsed-reader'
│
├── [Data] categories: Category[]
├── [Data] subcategories: Subcategory[]
├── [Data] content: ContentItem[]
├── [Data] collections: Collection[]
├── [Data] featuredCollections: Collection[]
│
├── Profile (shared component, reuse)
│   └── Expansion behavior: pushes content down
│
├── MainMenu
│   ├── Props: categories, subcategories, content, selectedCategory, selectedSubcategory, selectedContent, pageState
│   ├── Callbacks: onCategorySelect, onSubcategorySelect, onContentSelect
│   ├── Column 1: Categories (all, ordered by order_index)
│   ├── Column 2: Subcategories (filtered by selectedCategory, ordered by order_index)
│   └── Column 3: Content Items (filtered by selectedSubcategory, ordered by order_index)
│
├── CollectionsMenu
│   ├── Props: collections, featuredCollections, selectedContent, pageState
│   ├── Callbacks: onCollectionClick
│   ├── Display Logic: featured (expanded) vs linked to content (collapsed)
│   └── Layout: vertical (expanded) vs horizontal (collapsed)
│
├── ContentReader (conditional: only in reader states)
│   ├── Props: selectedContent, pageState
│   ├── Positioning: dynamic based on pageState
│   ├── Content Type Rendering:
│   │   ├── article → EditorRenderer
│   │   ├── image → img tag
│   │   ├── video → iframe/HTML5 video
│   │   └── audio → HTML5 audio
│   └── Scrolling: overflow-y auto
│
├── InfoMenu (conditional: only in reader states)
│   ├── Props: selectedContent (includes byline_style and link_style option texts)
│   ├── Positioning: absolute, fixed during scroll
│   └── Metadata Display: 3 lines with color coding
│
└── BottomTabBar (shared component, reuse)
    ├── Props: activeTab, collections (activeCollections array), onTabChange, onCollectionClose
    ├── Main Tabs: PORTFOLIO | RESUME | DOWNLOADS
    └── Collection Tabs: dynamic, closeable with ✕
```

**Data Flow**:
```
Supabase Database
    ↓
PortfolioTab useEffect (data loading)
    ↓
State Updates (categories, subcategories, content, collections)
    ↓
Props Distribution to Child Components
    ↓
User Interactions (clicks, selections)
    ↓
Callbacks to PortfolioTab
    ↓
State Updates (selection changes, tab switches)
    ↓
Re-render with New Props
```

**Callback Flow**:
```
MainMenu: onCategorySelect(category) → PortfolioTab updates selectedCategory → state: expanded-empty
MainMenu: onSubcategorySelect(subcategory) → PortfolioTab updates selectedSubcategory → state: expanded-empty
MainMenu: onContentSelect(content) → PortfolioTab updates selectedContent → state: collapsed-reader
CollectionsMenu: onCollectionClick(collection) → PortfolioTab adds to activeCollections, switches activeTab
BottomTabBar: onTabChange(tabId) → PortfolioTab updates activeTab
BottomTabBar: onCollectionClose(slug) → PortfolioTab removes from activeCollections, switches to 'portfolio'
```

---

### Critical Requirements Checklist

**Phase 0 (Research & Testing) - Before Development Begins** ✅ COMPLETE:
- [x] Step 0.1: Technical reference materials created (this document)
- [x] Step 0.2: EditorRenderer supports all 13 plugins
- [x] Step 0.3: ContentViewer reuse vs custom decision documented

**Phase 1 (Admin Foundation) - Must Complete Before Phase 2**:
- [ ] Step 1.1: byline_options and link_options tables created
- [ ] Step 1.1: featured field added to collections table
- [ ] Step 1.1: featured field added to content table
- [ ] Step 1.1: byline_style field added to content table (FK, non-nullable)
- [ ] Step 1.1: link_style field added to content table (FK, non-nullable)
- [ ] Step 1.2: Categories admin has inline order_index editing
- [ ] Step 1.2: Subcategories admin has inline order_index editing
- [ ] Step 1.3: Collections admin has inline order_index editing
- [ ] Step 1.3: Collections admin has featured checkbox
- [ ] Step 1.3: Empty collection validation implemented
- [ ] Step 1.4: Dropdown options management UI created
- [ ] Step 1.4: "Create as Byline" button functional
- [ ] Step 1.4: "Create as Link" button functional
- [ ] Step 1.5: Content form has featured checkbox
- [ ] Step 1.5: Content form has byline_style dropdown (required)
- [ ] Step 1.5: Content form has link_style dropdown (required)
- [ ] Step 1.5: Validation enforces dropdown selections

**Phase 2 (Core Structure) - Foundation for All Subsequent Phases**:
- [ ] Step 2.1: PortfolioTab component created with state management
- [ ] Step 2.2: Categories and subcategories data loading functional
- [ ] Step 2.3: Content items data loading with query filter
- [ ] Step 2.4: Collections data loading with featured separation
- [ ] Step 2.5: Initial loading state with first item auto-selected
- [ ] Step 2.6: Profile integration functional
- [ ] Step 2.6: BottomTabBar integration with main tabs functional

**Phase 3 (Main Menu) - Most Complex UI Element**:
- [ ] Step 3.1: Three-column layout displayed
- [ ] Step 3.2: Hierarchical filtering functional (category → subcategory → content)
- [ ] Step 3.3: Selection logic with hierarchy selection working
- [ ] Step 3.3: Color coding correct (green/gray/hover)
- [ ] Step 3.4: Content item display with title and subtitle
- [ ] Step 3.5: Column width constraints applied (25 char limit for columns 1-2)
- [ ] Step 3.6: Expand/collapse behavior functional

**Phase 4 (Content Display) - Core User Feature**:
- [ ] Step 4.1: Content Reader structure with positioning
- [ ] Step 4.2: Title and subtitle display functional
- [ ] Step 4.3: Article type rendering with EditorJS (all 13 plugins)
- [ ] Step 4.4: Image type rendering
- [ ] Step 4.4: Video type rendering (YouTube detection + HTML5)
- [ ] Step 4.4: Audio type rendering (HTML5 player)
- [ ] Step 4.5: Info Menu structure with positioning
- [ ] Step 4.6: Metadata display with dropdown option texts
- [ ] Step 4.6: Color coding correct (labels green, values gray)

**Phase 5 (Collections System) - Major Feature Layer**:
- [ ] Step 5.1: Collections Menu structure with dual layout
- [ ] Step 5.2: Visibility rules functional (featured vs linked)
- [ ] Step 5.3: Collection click opens tab in BottomTabBar
- [ ] Step 5.4: Collection filtering for Main menu functional
- [ ] Step 5.5: Content selection logic in collection tabs
- [ ] Step 5.6: Close mechanism returns to main Portfolio view
- [ ] Step 5.7: Multiple collections support functional

**Phase 7 (Polish) - Final Enhancements**:
- [ ] Step 7.1: Visual entry reordering functional
- [ ] Step 7.2: Transition animations implemented
- [ ] Step 7.3: All edge cases handled gracefully
- [ ] Step 7.4: Final styling verified matching specifications

---

### Stage 1 Summary

**Dependencies Identified**: 9 major categories
**Components Mapped**: 6 core components with relationships
**Critical Requirements**: 60+ checklist items across 7 phases
**Data Flow**: Documented from database to UI and back
**Constraints**: Database, query, state, UI, and uniqueness rules documented

**Next Stage**: TypeScript Type Definitions (Stage 2) will define exact data structures for all identified dependencies

---

*End of Stage 1*

---

## STAGE 2: TYPESCRIPT TYPE DEFINITIONS

### Purpose

Define TypeScript interfaces and types for all data structures used in Portfolio tab development. These types ensure type safety, enable autocomplete in IDE, document data contracts between components, and prevent runtime errors.

**Usage**: Reference these types when implementing data loading (Phase 2), component creation (Phases 3-5), and state management throughout development.

---

### 1. Content Item Types

**Base type from Supabase query** (raw database response with joins):
```typescript
type ContentItemRaw = {
  id: string
  type: 'article' | 'image' | 'video' | 'audio'
  category_id: string
  subcategory_id: string
  title: string
  subtitle: string | null
  sidebar_title: string | null
  sidebar_subtitle: string | null
  content_body: any // EditorJS OutputData JSON (article type only)
  image_url: string | null // Image type only
  video_url: string | null // Video type only
  audio_url: string | null // Audio type only
  author_name: string
  publication_name: string
  publication_date: string // Format: "January 2024" (month name + year)
  source_link: string
  copyright_notice: string | null
  download_enabled: boolean
  external_download_url: string | null
  order_index: number
  featured: boolean
  byline_style: string // UUID foreign key to byline_options table
  link_style: string // UUID foreign key to link_options table
  created_at: string
  categories: {
    id: string
    name: string
  }
  subcategories: {
    id: string
    name: string
  }
  byline_options: {
    id: string
    option_text: string
  }
  link_options: {
    id: string
    option_text: string
  }
  content_collections: Array<{
    collection_id: string
    collections: {
      id: string
      name: string
      slug: string
    }
  }>
}
```

**Transformed type for frontend use** (with computed fields and year extraction):
```typescript
type ContentItem = {
  id: string
  type: 'article' | 'image' | 'video' | 'audio'
  category_id: string
  subcategory_id: string
  // Display fields
  title: string // Used in Content reader
  subtitle: string | null // Used in Content reader
  sidebar_title: string | null // Used in Main menu (fallback to title if null)
  sidebar_subtitle: string | null // Used in Main menu subtitle
  // Content fields (only one populated based on type)
  content_body: any // EditorJS JSON (article type only)
  image_url: string | null // Image type only
  video_url: string | null // Video type only
  audio_url: string | null // Audio type only
  // Metadata
  author_name: string
  publication_name: string
  publication_date: string // Original format "January 2024"
  publication_year: string // Computed: extracted year "2024"
  source_link: string
  copyright_notice: string | null
  // Admin fields
  download_enabled: boolean
  external_download_url: string | null
  order_index: number
  featured: boolean
  // Dropdown option texts (computed from joins)
  byline_style_id: string // UUID
  byline_style_text: string // Option text from byline_options table
  link_style_id: string // UUID
  link_style_text: string // Option text from link_options table
  // Relationships (computed)
  category_name: string
  subcategory_name: string
  collection_slugs: string[] // Array of collection slugs for this content
  collection_names: string[] // Array of collection names
  created_at: string
}
```

**Usage Notes**:
- ContentItemRaw represents database response structure with nested joins
- ContentItem is transformed for component consumption with flattened fields
- Only ONE content field (content_body/image_url/video_url/audio_url) populated per item based on type field
- publication_year extracted from publication_date during transformation
- byline_style_text and link_style_text joined from respective option tables
- collection_slugs array extracted from content_collections join for filtering logic

---

### 2. Category and Subcategory Types

```typescript
type Category = {
  id: string
  name: string
  order_index: number
  created_at?: string
}

type Subcategory = {
  id: string
  category_id: string // Foreign key to categories table
  name: string
  order_index: number
  created_at?: string
  // Computed (optional)
  category_name?: string // From join with categories table
}
```

**Usage Notes**:
- order_index determines display order (lower numbers first)
- Increment by 10 for easy reordering (Logic Doc line 235)
- category_id links subcategories to parent categories
- Both types simple (no complex transformations needed)

---

### 3. Collection Types

```typescript
type Collection = {
  id: string
  name: string
  description: any // EditorJS OutputData JSON
  slug: string // Used for collection tab identification in BottomTabBar
  order_index: number
  featured: boolean // Determines visibility in Collections Menu expanded state
  created_at?: string
  // Computed (optional)
  content_count?: number // Number of content items in collection (for empty validation)
}

type CollectionTab = {
  slug: string // Unique identifier for tab
  name: string // Display name for tab label "COLLECTION {NAME}"
}

type ActiveCollections = CollectionTab[] // Array of currently open collection tabs
```

**Usage Notes**:
- slug used for activeTab state tracking ('portfolio' | 'resume' | 'downloads' | collection.slug)
- featured determines visibility (expanded states show only featured collections)
- Empty collections (content_count = 0) cannot be featured (Logic Doc line 261)
- ActiveCollections array appends on click, removes on close (Logic Doc line 414)
- CollectionTab simplified structure for BottomTabBar integration

---

### 4. Dropdown Option Types

```typescript
type BylineOption = {
  id: string
  option_text: string // Display text (e.g., "Written by", "Authored by")
  created_at: string
}

type LinkOption = {
  id: string
  option_text: string // Display text (e.g., "Read original", "View source")
  created_at: string
}

type DropdownManagement = {
  bylineOptions: BylineOption[]
  linkOptions: LinkOption[]
}
```

**Usage Notes**:
- option_text displayed in Info Menu as label (in emerald green color)
- Add-only management (no edit/delete by design, Logic Doc line 343)
- Both types identical structure (separate tables for logical separation)
- Used in content creation/edit forms as required dropdowns

---

### 5. Page State Types

```typescript
type PageState = 'expanded-empty' | 'expanded-reader' | 'collapsed-reader'

type PortfolioState = {
  // Current state
  pageState: PageState
  activeTab: 'portfolio' | 'resume' | 'downloads' | string // string for collection.slug
  
  // Selection state
  selectedCategory: Category | null
  selectedSubcategory: Subcategory | null
  selectedContent: ContentItem | null
  
  // Collection tabs
  activeCollections: ActiveCollections // Array of open collection tabs
  
  // Data loaded
  categories: Category[]
  subcategories: Subcategory[]
  content: ContentItem[]
  collections: Collection[]
  featuredCollections: Collection[] // Subset where featured = true
  
  // UI state
  isLoading: boolean
  error: string | null
}

type SelectionState = {
  categoryId: string | null
  subcategoryId: string | null
  contentId: string | null
}
```

**Usage Notes**:
- PageState union type enforces only valid states (collapsed-empty not included, Logic Doc line 66)
- activeTab string allows both fixed tabs and dynamic collection slugs
- activeCollections manages multiple open collection tabs (Logic Doc lines 412-419)
- selectedCategory/Subcategory/Content track current selection for hierarchy
- featuredCollections separated for Collections Menu visibility rules

---

### 6. Main Menu Types

```typescript
type MainMenuState = {
  // Display data (filtered)
  displayedCategories: Category[]
  displayedSubcategories: Subcategory[] // Filtered by selectedCategory
  displayedContent: ContentItem[] // Filtered by selectedSubcategory
  
  // Visual reordering state (Logic Doc lines 239-245)
  categoriesDisplayOrder: string[] // Array of category IDs in visual order
  subcategoriesDisplayOrder: string[] // Array of subcategory IDs in visual order
  contentDisplayOrder: string[] // Array of content IDs in visual order
  
  // State
  isExpanded: boolean // True for expanded states, false for collapsed
}

type MainMenuCallbacks = {
  onCategorySelect: (category: Category) => void
  onSubcategorySelect: (subcategory: Subcategory) => void
  onContentSelect: (content: ContentItem) => void
  onMenuClick: () => void // Collapsed state: click anywhere expands
}
```

**Usage Notes**:
- displayedSubcategories filtered by selectedCategory (never unfiltered, Logic Doc line 171)
- displayedContent filtered by selectedSubcategory (never unfiltered, Logic Doc line 172)
- Display order arrays track visual reordering (selected moves to position 1)
- Reordering visual only, doesn't persist to database (Logic Doc line 244)
- isExpanded derived from pageState for menu rendering

---

### 7. Collections Menu Types

```typescript
type CollectionsMenuState = {
  // Expanded states: featured collections only
  expandedCollections: Collection[] // Where featured = true, ordered by order_index
  
  // Collapsed state: linked to current content
  collapsedCollections: Collection[] // Linked to selectedContent, ordered by order_index
  
  // Layout
  isVertical: boolean // True for expanded states, false for collapsed
}

type CollectionsMenuCallbacks = {
  onCollectionClick: (collection: Collection) => void // Opens collection tab
}

type CollectionFilteringResult = {
  filteredContent: ContentItem[] // Content items in collection
  filteredCategories: Category[] // Categories with at least one content in collection
  filteredSubcategories: Subcategory[] // Subcategories with at least one content in collection
}
```

**Usage Notes**:
- expandedCollections: only featured, vertical list (Logic Doc line 258)
- collapsedCollections: linked to content, horizontal row, order_index smallest right → larger left (Logic Doc line 259)
- Empty collections (0 content) cannot be featured (Logic Doc line 261)
- CollectionFilteringResult used for collection tab Main menu filtering
- Categories/subcategories show only if contain collection content (Logic Doc lines 219-220)

---

### 8. Content Reader Types

```typescript
type ContentReaderState = {
  isVisible: boolean // Only true in reader states (collapsed-reader, expanded-reader)
  currentContent: ContentItem | null
  positioning: 'expanded' | 'collapsed' // Affects margin-left calculation
}

type ContentReaderPositioning = {
  baseMarginLeft: string // "-2%"
  baseMarginRight: string // "2%"
  expandedMarginLeft: string // "calc(-2% + 80px)" - shifts right for Main menu
  collapsedMarginRight: string // "-15%" - extends toward page edge
  marginTop: string // "calc(45vh - 33vh - 3rem + 25px)" - below Profile header
}

type ContentTypeRenderer = {
  renderArticle: (contentBody: any) => JSX.Element // EditorRenderer component
  renderImage: (imageUrl: string) => JSX.Element // img tag
  renderVideo: (videoUrl: string) => JSX.Element // iframe or HTML5 video
  renderAudio: (audioUrl: string) => JSX.Element // HTML5 audio player
}
```

**Usage Notes**:
- isVisible derived from pageState (reader states only, Logic Doc line 278)
- positioning determines margin-left (expanded vs collapsed, Logic Doc lines 306-310)
- ContentTypeRenderer functions handle 4 content types (Logic Doc lines 284-290)
- Scrolling enabled via overflow-y: auto (Logic Doc line 312)

---

### 9. Info Menu Types

```typescript
type InfoMenuState = {
  isVisible: boolean // Only true in reader states
  currentMetadata: ContentMetadata | null
}

type ContentMetadata = {
  // Line 1: Publication Name / Publication Date
  publication_name: string
  publication_date: string // "January 2024" format
  
  // Line 2: <byline style>: Author Name
  byline_style_text: string // From byline_options table (green label)
  author_name: string // Gray value
  
  // Line 3: <link style>: Link to Original Source
  link_style_text: string // From link_options table (green label)
  source_link: string // URL (gray value)
}

type InfoMenuPositioning = {
  position: 'absolute'
  top: '50%' // Fixed while Content Reader scrolls
  left: '2.5%'
}

type InfoMenuColors = {
  labelColor: string // "#00ff88" emerald green for labels
  valueColor: string // "#9ca3af" gray for values
}
```

**Usage Notes**:
- ContentMetadata flattened from ContentItem for display
- Three lines of metadata (Logic Doc lines 322-325)
- Absolute positioning fixed during scroll (Logic Doc line 320)
- Color coding: labels green, values gray (Logic Doc lines 347-349)
- byline_style_text and link_style_text from joined tables

---

### 10. Component Props Types

```typescript
// PortfolioTab (root component)
type PortfolioTabProps = {
  // No props - root component loads own data
}

// MainMenu component
type MainMenuProps = {
  categories: Category[]
  subcategories: Subcategory[]
  content: ContentItem[]
  selectedCategory: Category | null
  selectedSubcategory: Subcategory | null
  selectedContent: ContentItem | null
  pageState: PageState
  onCategorySelect: (category: Category) => void
  onSubcategorySelect: (subcategory: Subcategory) => void
  onContentSelect: (content: ContentItem) => void
  onMenuClick: () => void // Collapsed state expansion
}

// CollectionsMenu component
type CollectionsMenuProps = {
  collections: Collection[] // All collections for filtering logic
  featuredCollections: Collection[] // For expanded state display
  selectedContent: ContentItem | null // For collapsed state filtering
  pageState: PageState
  onCollectionClick: (collection: Collection) => void
}

// ContentReader component
type ContentReaderProps = {
  content: ContentItem | null
  isVisible: boolean
  positioning: 'expanded' | 'collapsed'
}

// InfoMenu component
type InfoMenuProps = {
  metadata: ContentMetadata | null
  isVisible: boolean
}
```

**Usage Notes**:
- Props define component interfaces and data flow
- Callbacks enable parent-child communication
- pageState prop enables state-dependent rendering
- selectedContent drives collapsed Collections Menu filtering

---

### 11. State Machine Types

```typescript
type StateTransition = {
  from: PageState
  trigger: 'categoryClick' | 'subcategoryClick' | 'contentClick' | 'mainMenuClick' | 'collectionClick' | 'alreadySelected'
  to: PageState | 'collectionTab' | 'noChange'
}

type TransitionRules = StateTransition[] // All 9 transition rules from Logic Doc lines 85-94

type StateVisibility = {
  mainMenuExpanded: boolean
  collectionsMenuVertical: boolean
  contentReaderVisible: boolean
  infoMenuVisible: boolean
}

type StateSelectionColors = {
  category: 'green' | 'gray'
  subcategory: 'green' | 'gray'
  content: 'green' | 'gray'
}
```

**Usage Notes**:
- StateTransition documents valid state machine transitions
- TransitionRules array can validate transitions during development
- StateVisibility maps pageState to UI element visibility
- StateSelectionColors maps pageState to hierarchy color coding

---

### 12. Utility Types

```typescript
// Month and year extraction from publication_date
type MonthYearExtraction = {
  original: string // "January 2024"
  month: string // "January"
  year: string // "2024"
}

// Content type union for type guards
type ContentType = 'article' | 'image' | 'video' | 'audio'

// Column width constraints
type ColumnWidthConstraint = {
  maxCharacters: number // 25 for columns 1-2
  maxPixels: number // Calculated during implementation
  overflow: 'hidden' | 'visible'
}

// Selection hierarchy
type SelectionHierarchy = {
  contentSelected: boolean // If true, subcategory and category also green
  subcategorySelected: boolean // If true, category also green
  categorySelected: boolean // Category green regardless
}
```

**Usage Notes**:
- MonthYearExtraction for publication_date parsing (extract year for Main menu subtitle)
- ColumnWidthConstraint for 25-character limit (Logic Doc lines 199-203)
- SelectionHierarchy enforces hierarchy selection rules (Logic Doc lines 129-132)

---

### 13. Query Filter Types

```typescript
type ContentQueryFilter = {
  featured: true // Always filter featured only
  byline_style_not_null: true // Required for display
  link_style_not_null: true // Required for display
  // For collection tabs
  collection_id?: string // Filter by collection when in collection tab
}

type CollectionContentQuery = {
  collection_id: string
  featured: true // Still applies in collection tabs
  byline_style_not_null: true
  link_style_not_null: true
}

type CategorySubcategoryFilter = {
  // For Main menu filtering
  category_id?: string // Filter subcategories by category
  subcategory_id?: string // Filter content by subcategory
  
  // For collection tab filtering
  has_content_in_collection?: boolean // Show only if contains collection content
}
```

**Usage Notes**:
- ContentQueryFilter enforces Logic Doc line 185 query requirements
- Collection filtering maintains featured validation (Logic Doc line 218)
- Categories/subcategories filter based on content availability in collections

---

### 14. Visual Reordering Types

```typescript
type EntryReorderState = {
  originalOrder: string[] // IDs in database order_index sequence
  visualOrder: string[] // IDs in current display order (selected first)
  lastSelectedId: string | null
  isAnimating: boolean // Prevents race conditions (Logic Doc line 245)
}

type ReorderAnimation = {
  duration: number // Animation duration in ms
  easing: string // CSS easing function
  waitForPrevious: boolean // True to prevent race conditions
}
```

**Usage Notes**:
- EntryReorderState tracks both original and visual order
- isAnimating flag prevents race conditions during rapid selection (Logic Doc line 245)
- Applies to all three Main menu columns independently
- Visual order doesn't persist to database (Logic Doc line 244)

---

### 15. Empty State Types

```typescript
type EmptyStateMessage = {
  column: 'categories' | 'subcategories' | 'content'
  message: 'No categories' | 'No subcategories' | 'No content'
  shouldDisplay: boolean
}

type EmptyStates = {
  categoriesEmpty: boolean
  subcategoriesEmpty: boolean
  contentEmpty: boolean
  collectionsEmpty: boolean // For collapsed state empty space
}
```

**Usage Notes**:
- EmptyStateMessage defines messages for each column (Logic Doc lines 176-179)
- EmptyStates boolean flags determine when to show messages
- collectionsEmpty for collapsed state empty space (Logic Doc line 260)

---

### 16. Collection Tab State Types

```typescript
type CollectionTabState = {
  slug: string // Collection identifier
  name: string // Collection name
  loadState: 'expanded-reader' // Always loads in this state (Logic Doc line 103)
  selectedContent: ContentItem | null // Auto-selected on load
  filteredData: CollectionFilteringResult
}

type CollectionTabLoadBehavior = {
  currentContentInCollection: boolean // If true, keep current selection
  currentContentId: string | null
  firstContentId: string | null // By order_index, selected if current not in collection
}
```

**Usage Notes**:
- CollectionTabState manages state for each open collection tab
- loadState always 'expanded-reader' per specification
- CollectionTabLoadBehavior implements Logic Doc lines 104-105 selection logic
- If current content not in collection, selects first by order_index

---

### 17. BottomTabBar Integration Types

```typescript
type BottomTabBarProps = {
  activeTab: string // 'portfolio' | 'resume' | 'downloads' | collection.slug
  collections: CollectionTab[] // ActiveCollections array from Portfolio state
  onTabChange: (tabId: string) => void
  onCollectionClose: (slug: string) => void
}

type TabIndicatorStyle = {
  mainTabs: {
    active: string // Emerald green underline "#00ff88"
    inactive: string
  }
  collectionTabs: {
    active: string // Purple background "purple-600"
    inactive: string
  }
}
```

**Usage Notes**:
- BottomTabBarProps matches existing component interface (Logic Doc lines 390-421)
- collections array provides dynamic collection tabs
- onCollectionClose removes from activeCollections, switches to 'portfolio'
- TabIndicatorStyle documents color differentiation (main vs collection tabs)

---

### 18. Data Transformation Pipeline Types

```typescript
type TransformationStep = {
  input: ContentItemRaw
  output: ContentItem
}

type DataTransformations = {
  extractYear: (publicationDate: string) => string // "January 2024" → "2024"
  joinBylineText: (bylineStyleId: string, options: BylineOption[]) => string
  joinLinkText: (linkStyleId: string, options: LinkOption[]) => string
  extractCollectionSlugs: (contentCollections: any[]) => string[]
  flattenCategoryName: (categories: any) => string
  flattenSubcategoryName: (subcategories: any) => string
}
```

**Usage Notes**:
- TransformationStep documents input/output contract
- DataTransformations utility functions for raw → transformed conversion
- extractYear critical for Main menu subtitle (sidebar_subtitle / year format)
- Join functions lookup option_text from dropdown tables

---

### Stage 2 Summary

**Types Created**: 18 major type categories covering all data structures
**Total Definitions**: ~50+ individual types and interfaces
**Coverage**: Database entities, UI state, component props, transformations, callbacks, filtering, reordering
**Next Stage**: Mock Data Samples (Stage 3) will use these types for test data

---

*End of Stage 2*

---

## STAGE 3: MOCK DATA SAMPLES

### Purpose

Create comprehensive test data sets for validating Portfolio tab logic during development. Mock data enables testing before database is fully populated, validates transformation logic, and provides predictable test scenarios for all features.

**Usage**: Reference specific test sets during implementation steps to test filtering, state transitions, collection tabs, and edge cases.

---

### Test Set 1: Basic Featured Content (All 4 Types)

**Purpose**: Test basic content display with all 4 content types (article, image, video, audio)

```typescript
const testSet1_BasicContent: ContentItem[] = [
  {
    id: 'content-1',
    type: 'article',
    category_id: 'cat-1',
    subcategory_id: 'subcat-1-1',
    title: 'The Future of Digital Marketing',
    subtitle: 'How AI is transforming the industry',
    sidebar_title: 'Digital Marketing AI',
    sidebar_subtitle: 'Industry transformation analysis',
    content_body: {
      time: 1701234567890,
      blocks: [
        { type: 'header', data: { text: 'Introduction', level: 2 } },
        { type: 'paragraph', data: { text: 'This article explores the impact of artificial intelligence...' } }
      ],
      version: '2.28.2'
    },
    image_url: null,
    video_url: null,
    audio_url: null,
    author_name: 'John Smith',
    publication_name: 'Tech Review',
    publication_date: 'January 2024',
    publication_year: '2024', // Computed
    source_link: 'https://example.com/article-1',
    copyright_notice: 'Copyright © 2024 Tech Review. All rights reserved.',
    download_enabled: true,
    external_download_url: null,
    order_index: 10,
    featured: true,
    byline_style_id: 'byline-1',
    byline_style_text: 'Written by', // Computed from join
    link_style_id: 'link-1',
    link_style_text: 'Read original', // Computed from join
    category_name: 'Marketing', // Computed
    subcategory_name: 'Digital Strategy', // Computed
    collection_slugs: ['featured-work', 'marketing-articles'], // Computed
    collection_names: ['Featured Work', 'Marketing Articles'], // Computed
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'content-2',
    type: 'image',
    category_id: 'cat-2',
    subcategory_id: 'subcat-2-1',
    title: 'Brand Identity Redesign',
    subtitle: 'Complete visual overhaul for tech startup',
    sidebar_title: null, // Test fallback to title
    sidebar_subtitle: 'Visual brand identity',
    content_body: null,
    image_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    video_url: null,
    audio_url: null,
    author_name: 'Jane Designer',
    publication_name: 'Design Portfolio',
    publication_date: 'March 2023',
    publication_year: '2023',
    source_link: 'https://example.com/design-1',
    copyright_notice: null,
    download_enabled: false,
    external_download_url: null,
    order_index: 20,
    featured: true,
    byline_style_id: 'byline-2',
    byline_style_text: 'Designed by',
    link_style_id: 'link-2',
    link_style_text: 'View project',
    category_name: 'Design',
    subcategory_name: 'Brand Identity',
    collection_slugs: [],
    collection_names: [],
    created_at: '2023-03-20T14:30:00Z'
  },
  {
    id: 'content-3',
    type: 'video',
    category_id: 'cat-1',
    subcategory_id: 'subcat-1-2',
    title: 'Marketing Campaign Behind the Scenes',
    subtitle: 'How we achieved 300% ROI',
    sidebar_title: 'Campaign BTS',
    sidebar_subtitle: '300% ROI achievement',
    content_body: null,
    image_url: null,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    audio_url: null,
    author_name: 'Marketing Team',
    publication_name: 'Company Blog',
    publication_date: 'November 2023',
    publication_year: '2023',
    source_link: 'https://example.com/video-1',
    copyright_notice: 'Internal use only',
    download_enabled: false,
    external_download_url: 'https://example.com/download-video',
    order_index: 30,
    featured: true,
    byline_style_id: 'byline-3',
    byline_style_text: 'Produced by',
    link_style_id: 'link-1',
    link_style_text: 'Read original',
    category_name: 'Marketing',
    subcategory_name: 'Case Studies',
    collection_slugs: ['featured-work'],
    collection_names: ['Featured Work'],
    created_at: '2023-11-10T09:15:00Z'
  },
  {
    id: 'content-4',
    type: 'audio',
    category_id: 'cat-3',
    subcategory_id: 'subcat-3-1',
    title: 'Podcast: Content Marketing Trends',
    subtitle: 'Interview with industry leaders',
    sidebar_title: 'Content Trends Podcast',
    sidebar_subtitle: null, // Test null sidebar_subtitle
    content_body: null,
    image_url: null,
    video_url: null,
    audio_url: 'https://res.cloudinary.com/demo/video/upload/sample-audio.mp3',
    author_name: 'Podcast Host',
    publication_name: 'Marketing Podcast Network',
    publication_date: 'December 2023',
    publication_year: '2023',
    source_link: 'https://example.com/podcast-1',
    copyright_notice: 'All rights reserved',
    download_enabled: true,
    external_download_url: null,
    order_index: 40,
    featured: true,
    byline_style_id: 'byline-4',
    byline_style_text: 'Hosted by',
    link_style_id: 'link-3',
    link_style_text: 'Listen on platform',
    category_name: 'Media',
    subcategory_name: 'Podcasts',
    collection_slugs: ['marketing-articles'],
    collection_names: ['Marketing Articles'],
    created_at: '2023-12-05T16:45:00Z'
  },
  {
    id: 'content-5',
    type: 'article',
    category_id: 'cat-1',
    subcategory_id: 'subcat-1-1',
    title: 'SEO Best Practices 2024',
    subtitle: 'Comprehensive guide to search optimization',
    sidebar_title: 'SEO Guide 2024',
    sidebar_subtitle: 'Search optimization',
    content_body: {
      time: 1701234567890,
      blocks: [
        { type: 'header', data: { text: 'Key Strategies', level: 2 } },
        { type: 'list', data: { items: ['Keyword research', 'On-page optimization', 'Link building'] } }
      ],
      version: '2.28.2'
    },
    image_url: null,
    video_url: null,
    audio_url: null,
    author_name: 'Sarah Johnson',
    publication_name: 'SEO Journal',
    publication_date: 'February 2024',
    publication_year: '2024',
    source_link: 'https://example.com/seo-guide',
    copyright_notice: null,
    download_enabled: true,
    external_download_url: null,
    order_index: 50,
    featured: true,
    byline_style_id: 'byline-1',
    byline_style_text: 'Written by',
    link_style_id: 'link-2',
    link_style_text: 'View project',
    category_name: 'Marketing',
    subcategory_name: 'Digital Strategy',
    collection_slugs: ['featured-work', 'marketing-articles'],
    collection_names: ['Featured Work', 'Marketing Articles'],
    created_at: '2024-02-12T11:20:00Z'
  }
]
```

**Expected Behavior**:
- 5 content items across all 4 types
- Article types render via EditorRenderer
- Image type displays img tag
- Video type embeds YouTube iframe
- Audio type displays HTML5 player
- sidebar_title fallback to title for content-2
- sidebar_subtitle null for content-4 shows only year "2023"
- collection_slugs enables collection filtering logic testing

---

### Test Set 2: Categories and Subcategories Hierarchy

**Purpose**: Test hierarchical filtering (category → subcategory → content)

```typescript
const testSet2_Categories: Category[] = [
  { id: 'cat-1', name: 'Marketing', order_index: 10, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-2', name: 'Design', order_index: 20, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-3', name: 'Media', order_index: 30, created_at: '2024-01-01T00:00:00Z' }
]

const testSet2_Subcategories: Subcategory[] = [
  // Category 1: Marketing (2 subcategories)
  { id: 'subcat-1-1', category_id: 'cat-1', name: 'Digital Strategy', order_index: 10, created_at: '2024-01-01T00:00:00Z', category_name: 'Marketing' },
  { id: 'subcat-1-2', category_id: 'cat-1', name: 'Case Studies', order_index: 20, created_at: '2024-01-01T00:00:00Z', category_name: 'Marketing' },
  
  // Category 2: Design (2 subcategories)
  { id: 'subcat-2-1', category_id: 'cat-2', name: 'Brand Identity', order_index: 10, created_at: '2024-01-01T00:00:00Z', category_name: 'Design' },
  { id: 'subcat-2-2', category_id: 'cat-2', name: 'UI/UX', order_index: 20, created_at: '2024-01-01T00:00:00Z', category_name: 'Design' },
  
  // Category 3: Media (1 subcategory)
  { id: 'subcat-3-1', category_id: 'cat-3', name: 'Podcasts', order_index: 10, created_at: '2024-01-01T00:00:00Z', category_name: 'Media' }
]
```

**Expected Behavior**:
- Select cat-1 → shows subcat-1-1, subcat-1-2 only
- Select cat-2 → shows subcat-2-1, subcat-2-2 only
- Select cat-3 → shows subcat-3-1 only
- Select subcat-1-1 → shows content-1, content-5 (both have subcat-1-1)
- Select subcat-1-2 → shows content-3 only
- Select subcat-2-1 → shows content-2 only
- Select subcat-3-1 → shows content-4 only
- order_index determines display order (lower first)

---

### Test Set 3: Collections (Featured and Linked)

**Purpose**: Test featured collections visibility and collection tab filtering

```typescript
const testSet3_Collections: Collection[] = [
  {
    id: 'coll-1',
    name: 'Featured Work',
    description: { blocks: [{ type: 'paragraph', data: { text: 'Best portfolio pieces' } }] },
    slug: 'featured-work',
    order_index: 10,
    featured: true, // Shows in expanded Collections Menu
    created_at: '2024-01-01T00:00:00Z',
    content_count: 3 // content-1, content-3, content-5 linked
  },
  {
    id: 'coll-2',
    name: 'Marketing Articles',
    description: { blocks: [{ type: 'paragraph', data: { text: 'Marketing content' } }] },
    slug: 'marketing-articles',
    order_index: 20,
    featured: true,
    created_at: '2024-01-01T00:00:00Z',
    content_count: 3 // content-1, content-4, content-5 linked
  },
  {
    id: 'coll-3',
    name: 'Design Portfolio',
    description: { blocks: [{ type: 'paragraph', data: { text: 'Design projects' } }] },
    slug: 'design-portfolio',
    order_index: 30,
    featured: false, // Does NOT show in expanded Collections Menu
    created_at: '2024-01-01T00:00:00Z',
    content_count: 1 // content-2 only
  },
  {
    id: 'coll-4',
    name: 'Empty Collection',
    description: { blocks: [{ type: 'paragraph', data: { text: 'No content yet' } }] },
    slug: 'empty-collection',
    order_index: 40,
    featured: false, // Empty collections cannot be featured (Logic Doc line 261)
    created_at: '2024-01-01T00:00:00Z',
    content_count: 0 // Empty collection
  }
]

// Collection-Content relationships (for content_collections join table)
const testSet3_CollectionLinks = {
  'content-1': ['featured-work', 'marketing-articles'], // 2 collections
  'content-2': ['design-portfolio'], // 1 collection (not featured)
  'content-3': ['featured-work'], // 1 collection
  'content-4': ['marketing-articles'], // 1 collection
  'content-5': ['featured-work', 'marketing-articles'], // 2 collections
}
```

**Expected Behavior**:
- **Expanded state Collections Menu**: Shows coll-1, coll-2 only (featured = true)
- **Collapsed state** (content-1 selected): Shows coll-1, coll-2 (linked to content-1)
- **Collapsed state** (content-2 selected): Shows coll-3 (linked, even though not featured)
- **Collapsed state** (content-3 selected): Shows coll-1 only
- **Collection tab "featured-work"**: Filters Main menu to content-1, content-3, content-5
- **Collection tab "marketing-articles"**: Filters to content-1, content-4, content-5
- **Empty collection coll-4**: Cannot be featured, not displayed

---

### Test Set 4: Edge Cases (Null Fields and Missing Data)

**Purpose**: Test null handling, missing fields, and edge case scenarios

```typescript
const testSet4_EdgeCases: ContentItem[] = [
  {
    id: 'edge-1',
    type: 'article',
    category_id: 'cat-1',
    subcategory_id: 'subcat-1-1',
    title: 'Article Title Only',
    subtitle: null, // Test null subtitle
    sidebar_title: null, // Test fallback to title
    sidebar_subtitle: null, // Test null sidebar_subtitle (show only year)
    content_body: { blocks: [], version: '2.28.2' },
    image_url: null,
    video_url: null,
    audio_url: null,
    author_name: 'Anonymous',
    publication_name: 'Unknown Publication',
    publication_date: 'June 2023',
    publication_year: '2023',
    source_link: 'https://example.com/edge-1',
    copyright_notice: null,
    download_enabled: false,
    external_download_url: null,
    order_index: 60,
    featured: true,
    byline_style_id: 'byline-1',
    byline_style_text: 'Written by',
    link_style_id: 'link-1',
    link_style_text: 'Read original',
    category_name: 'Marketing',
    subcategory_name: 'Digital Strategy',
    collection_slugs: [],
    collection_names: [],
    created_at: '2023-06-15T10:00:00Z'
  },
  {
    id: 'edge-2',
    type: 'article',
    category_id: 'cat-1',
    subcategory_id: 'subcat-1-1',
    title: 'No Publication Date Article',
    subtitle: 'Testing null publication_date',
    sidebar_title: 'No Date Article',
    sidebar_subtitle: 'Testing edge case', // Has subtitle but no publication_date
    content_body: { blocks: [], version: '2.28.2' },
    image_url: null,
    video_url: null,
    audio_url: null,
    author_name: 'Test Author',
    publication_name: 'Test Publication',
    publication_date: null as any, // Test null publication_date (no year to extract)
    publication_year: '', // Empty when extraction fails
    source_link: 'https://example.com/edge-2',
    copyright_notice: null,
    download_enabled: false,
    external_download_url: null,
    order_index: 70,
    featured: true,
    byline_style_id: 'byline-1',
    byline_style_text: 'Written by',
    link_style_id: 'link-1',
    link_style_text: 'Read original',
    category_name: 'Marketing',
    subcategory_name: 'Digital Strategy',
    collection_slugs: [],
    collection_names: [],
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'edge-3',
    type: 'article',
    category_id: 'cat-1',
    subcategory_id: 'subcat-1-1',
    title: 'All Nulls Subtitle Test',
    subtitle: 'Has content subtitle',
    sidebar_title: 'Nulls Test',
    sidebar_subtitle: null, // Both null: no subtitle displayed
    content_body: { blocks: [], version: '2.28.2' },
    image_url: null,
    video_url: null,
    audio_url: null,
    author_name: 'Test Author 2',
    publication_name: 'Test Pub 2',
    publication_date: null as any, // Both null: no subtitle displayed
    publication_year: '',
    source_link: 'https://example.com/edge-3',
    copyright_notice: null,
    download_enabled: false,
    external_download_url: null,
    order_index: 80,
    featured: true,
    byline_style_id: 'byline-1',
    byline_style_text: 'Written by',
    link_style_id: 'link-1',
    link_style_text: 'Read original',
    category_name: 'Marketing',
    subcategory_name: 'Digital Strategy',
    collection_slugs: [],
    collection_names: [],
    created_at: '2023-01-01T00:00:00Z'
  }
]
```

**Expected Behavior**:
- **edge-1**: sidebar_title null → falls back to title "Article Title Only"
- **edge-1**: sidebar_subtitle null → shows only year "2023" from publication_date
- **edge-2**: sidebar_subtitle exists but publication_date null → don't display subtitle at all
- **edge-3**: both sidebar_subtitle and publication_date null → no subtitle displayed
- All should display in Main menu (featured = true, have byline/link styles)

---

### Test Set 5: Dropdown Options

**Purpose**: Test byline and link style options management

```typescript
const testSet5_BylineOptions: BylineOption[] = [
  { id: 'byline-1', option_text: 'Written by', created_at: '2024-01-01T00:00:00Z' },
  { id: 'byline-2', option_text: 'Designed by', created_at: '2024-01-01T00:00:00Z' },
  { id: 'byline-3', option_text: 'Produced by', created_at: '2024-01-01T00:00:00Z' },
  { id: 'byline-4', option_text: 'Hosted by', created_at: '2024-01-01T00:00:00Z' }
]

const testSet5_LinkOptions: LinkOption[] = [
  { id: 'link-1', option_text: 'Read original', created_at: '2024-01-01T00:00:00Z' },
  { id: 'link-2', option_text: 'View project', created_at: '2024-01-01T00:00:00Z' },
  { id: 'link-3', option_text: 'Listen on platform', created_at: '2024-01-01T00:00:00Z' }
]
```

**Expected Behavior**:
- Info Menu line 2: Shows option_text in green (e.g., "Written by: John Smith")
- Info Menu line 3: Shows option_text in green (e.g., "Read original: https://...")
- Dropdown management UI: Can create new options via "Create as Byline"/"Create as Link"
- Add-only (no edit/delete functionality)

---

### Test Set 6: State Testing Scenarios

**Purpose**: Test state transitions and selection hierarchy

```typescript
// Scenario 1: Loading State (expanded-reader)
const scenario1_LoadingState = {
  pageState: 'expanded-reader' as PageState,
  selectedCategory: testSet2_Categories[0], // First category "Marketing"
  selectedSubcategory: testSet2_Subcategories[0], // First subcategory "Digital Strategy"
  selectedContent: testSet1_BasicContent[0], // First content "Digital Marketing AI"
  expectation: {
    mainMenuExpanded: true,
    collectionsMenuVertical: true,
    contentReaderVisible: true,
    infoMenuVisible: true,
    selectedHierarchy: ['cat-1', 'subcat-1-1', 'content-1'], // All green
    collectionsDisplay: ['featured-work', 'marketing-articles'] // Featured collections
  }
}

// Scenario 2: Category Click (expanded-empty)
const scenario2_CategoryClick = {
  from: 'expanded-reader' as PageState,
  trigger: 'categoryClick',
  to: 'expanded-empty' as PageState,
  selectedCategory: testSet2_Categories[1], // Click "Design"
  selectedSubcategory: null,
  selectedContent: null,
  expectation: {
    mainMenuExpanded: true,
    collectionsMenuVertical: true,
    contentReaderVisible: false, // Closed
    infoMenuVisible: false,
    column2Display: ['subcat-2-1', 'subcat-2-2'], // Design subcategories
    column3Display: [], // No content (no subcategory selected)
    selectedColors: { category: 'green', subcategory: 'gray', content: 'gray' }
  }
}

// Scenario 3: Content Selection (collapsed-reader)
const scenario3_ContentSelect = {
  from: 'expanded-reader' as PageState,
  trigger: 'contentClick',
  to: 'collapsed-reader' as PageState,
  selectedCategory: testSet2_Categories[0],
  selectedSubcategory: testSet2_Subcategories[0],
  selectedContent: testSet1_BasicContent[4], // Select "SEO Guide 2024"
  expectation: {
    mainMenuExpanded: false, // Collapsed
    collectionsMenuHorizontal: true,
    contentReaderVisible: true,
    infoMenuVisible: true,
    mainMenuDisplay: {
      category: 'Marketing', // Gray
      subcategory: 'Digital Strategy', // Gray
      content: 'SEO Guide 2024' // Green, no subtitle in collapsed
    },
    collectionsDisplay: ['featured-work', 'marketing-articles'], // Linked to content-5
    selectedColors: { category: 'gray', subcategory: 'gray', content: 'green' }
  }
}

// Scenario 4: Collection Tab Open
const scenario4_CollectionTab = {
  from: 'expanded-reader' as PageState,
  trigger: 'collectionClick',
  collection: testSet3_Collections[0], // Click "Featured Work"
  expectation: {
    activeCollections: [{ slug: 'featured-work', name: 'Featured Work' }],
    activeTab: 'featured-work',
    pageState: 'expanded-reader', // Collection tab loads expanded
    filteredContent: ['content-1', 'content-3', 'content-5'], // Only items in collection
    filteredCategories: ['cat-1'], // Only categories with collection content
    filteredSubcategories: ['subcat-1-1', 'subcat-1-2'], // Only subcats with collection content
    selectedContent: 'content-1', // First by order_index (10 < 30 < 50)
    bottomTabBar: ['PORTFOLIO', 'RESUME', 'DOWNLOADS', 'COLLECTION FEATURED WORK']
  }
}

// Scenario 5: Re-selection Behavior
const scenario5_ReselectionBehavior = {
  expandedState: {
    clickSelectedContent: 'noChange', // Logic Doc line 93
    clickSelectedCategory: 'noChange',
    clickSelectedSubcategory: 'noChange'
  },
  collapsedState: {
    clickMainMenuAnywhere: 'expandToExpandedReader', // Logic Doc line 91
    selectionUnchanged: true
  }
}
```

**Expected Behavior**:
- Scenario 1: Tests loading state auto-selection (first category/subcategory/content)
- Scenario 2: Tests category click transitions to expanded-empty with Content reader hidden
- Scenario 3: Tests content click transitions to collapsed-reader with menu collapsed
- Scenario 4: Tests collection tab opening with filtering and auto-selection
- Scenario 5: Tests re-selection behavior (no change in expanded, expand in collapsed)

---

### Test Set 7: Featured vs Non-Featured Content

**Purpose**: Test featured filter (only featured content displays in Main menu)

```typescript
const testSet7_FeaturedFilter: ContentItem[] = [
  // Featured content (displays in Main menu)
  {
    id: 'featured-1',
    type: 'article',
    category_id: 'cat-1',
    subcategory_id: 'subcat-1-1',
    title: 'Featured Article',
    featured: true, // DISPLAYS
    byline_style_id: 'byline-1',
    link_style_id: 'link-1',
    byline_style_text: 'Written by',
    link_style_text: 'Read original',
    // ... other required fields
  },
  // Non-featured content (excluded from Main menu)
  {
    id: 'not-featured-1',
    type: 'article',
    category_id: 'cat-1',
    subcategory_id: 'subcat-1-1',
    title: 'Non-Featured Article',
    featured: false, // DOES NOT DISPLAY
    byline_style_id: 'byline-1',
    link_style_id: 'link-1',
    byline_style_text: 'Written by',
    link_style_text: 'Read original',
    // ... other required fields
  },
  // Featured but missing byline_style (excluded)
  {
    id: 'no-byline-1',
    type: 'article',
    category_id: 'cat-1',
    subcategory_id: 'subcat-1-1',
    title: 'Missing Byline Style',
    featured: true,
    byline_style_id: null as any, // Missing required field
    link_style_id: 'link-1',
    byline_style_text: null as any,
    link_style_text: 'Read original',
    // ... other required fields
  }
]
```

**Expected Behavior**:
- Query filters: `WHERE featured = true AND byline_style IS NOT NULL AND link_style IS NOT NULL`
- Main menu displays: featured-1 only
- Excluded: not-featured-1 (featured = false), no-byline-1 (byline_style null)
- Both filters must pass for content to display

---

### Test Set 8: Column Width Testing

**Purpose**: Test 25-character limit for categories and subcategories

```typescript
const testSet8_ColumnWidths: Category[] = [
  { id: 'short-cat', name: 'Short', order_index: 10 }, // 5 chars - displays fully
  { id: 'exact-cat', name: 'Exactly 25 Characters!!', order_index: 20 }, // 25 chars - displays fully
  { id: 'long-cat', name: 'This Category Name Exceeds Twenty-Five Characters', order_index: 30 } // 51 chars - cuts at 25
]

const testSet8_ColumnWidths_Subcategories: Subcategory[] = [
  { id: 'short-sub', category_id: 'short-cat', name: 'Brief', order_index: 10 }, // 5 chars
  { id: 'long-sub', category_id: 'short-cat', name: 'A Very Long Subcategory Name That Exceeds Limit', order_index: 20 } // 48 chars - cuts at 25
]
```

**Expected Behavior**:
- Column 1 (categories): "Short", "Exactly 25 Characters!!", "This Category Name Excee" (cut at 25)
- Column 2 (subcategories): "Brief", "A Very Long Subcategory " (cut at 25)
- Column 3 (content): No character limit, displays full text
- Calculate pixel width for 25 chars during implementation (Logic Doc line 203)

---

### Test Set 9: Empty Database States

**Purpose**: Test empty state messages

```typescript
const testSet9_EmptyStates = {
  noCategoriesScenario: {
    categories: [],
    subcategories: [],
    content: [],
    expectation: {
      column1Message: 'No categories',
      column2Message: 'No subcategories',
      column3Message: 'No content'
    }
  },
  noSubcategoriesScenario: {
    categories: [{ id: 'cat-1', name: 'Marketing', order_index: 10 }],
    subcategories: [], // Empty for selected category
    content: [],
    expectation: {
      column1Display: ['Marketing'],
      column2Message: 'No subcategories',
      column3Message: 'No content'
    }
  },
  noContentScenario: {
    categories: [{ id: 'cat-1', name: 'Marketing', order_index: 10 }],
    subcategories: [{ id: 'sub-1', category_id: 'cat-1', name: 'Digital', order_index: 10 }],
    content: [], // Empty for selected subcategory
    expectation: {
      column1Display: ['Marketing'],
      column2Display: ['Digital'],
      column3Message: 'No content'
    }
  }
}
```

**Expected Behavior**:
- Empty categories: Display "No categories" in column 1 (Logic Doc line 177)
- Empty subcategories: Display "No subcategories" in column 2 (Logic Doc line 178)
- Empty content: Display "No content" in column 3 (Logic Doc line 179)
- Empty collections in collapsed: Show empty space (Logic Doc line 260)

---

### Test Set 10: Multiple Collections Open

**Purpose**: Test multiple simultaneous collection tabs

```typescript
const testSet10_MultipleCollections = {
  initialState: {
    activeCollections: [] as ActiveCollections,
    activeTab: 'portfolio' as string
  },
  clickSequence: [
    {
      action: 'Click "Featured Work"',
      result: {
        activeCollections: [{ slug: 'featured-work', name: 'Featured Work' }],
        activeTab: 'featured-work',
        bottomTabBar: ['PORTFOLIO', 'RESUME', 'DOWNLOADS', 'COLLECTION FEATURED WORK']
      }
    },
    {
      action: 'Click "Marketing Articles"',
      result: {
        activeCollections: [
          { slug: 'featured-work', name: 'Featured Work' },
          { slug: 'marketing-articles', name: 'Marketing Articles' }
        ], // Appended, not replaced
        activeTab: 'marketing-articles',
        bottomTabBar: ['PORTFOLIO', 'RESUME', 'DOWNLOADS', 'COLLECTION FEATURED WORK', 'COLLECTION MARKETING ARTICLES']
      }
    },
    {
      action: 'Close "Featured Work" tab (✕)',
      result: {
        activeCollections: [
          { slug: 'marketing-articles', name: 'Marketing Articles' }
        ], // Removed from array
        activeTab: 'marketing-articles', // Stays on remaining collection
        bottomTabBar: ['PORTFOLIO', 'RESUME', 'DOWNLOADS', 'COLLECTION MARKETING ARTICLES']
      }
    },
    {
      action: 'Close "Marketing Articles" tab (✕)',
      result: {
        activeCollections: [],
        activeTab: 'portfolio', // Returns to main Portfolio view
        bottomTabBar: ['PORTFOLIO', 'RESUME', 'DOWNLOADS']
      }
    }
  ]
}
```

**Expected Behavior**:
- Click collection while one open: appends to array (Logic Doc line 415)
- Each click adds tab to BottomTabBar
- Close button removes from array
- Last close returns to 'portfolio' tab (Logic Doc line 418)
- activeTab tracks currently displayed collection

---

### Mock Data Usage Guide

**When to Use Each Test Set**:

**Phase 2 (Data Loading)**:
- **Test Set 1**: Validate content query with all joins
- **Test Set 2**: Validate categories/subcategories loading
- **Test Set 3**: Validate collections loading with featured filter
- **Test Set 5**: Validate dropdown options loading

**Phase 3 (Main Menu)**:
- **Test Set 1 + 2**: Test three-column layout with filtered display
- **Test Set 4**: Test null handling in content display
- **Test Set 7**: Test featured filter excluding non-featured
- **Test Set 8**: Test 25-character column width constraints
- **Test Set 9**: Test empty state messages

**Phase 4 (Content Display)**:
- **Test Set 1**: Test all 4 content types rendering (article/image/video/audio)
- **Test Set 4**: Test null subtitle handling in Content reader
- **Test Set 5**: Test dropdown option texts in Info Menu

**Phase 5 (Collections)**:
- **Test Set 3**: Test featured vs linked visibility rules
- **Test Set 10**: Test multiple collection tabs opening/closing
- **Scenario 4**: Test collection filtering logic

**Phase 7 (Visual Enhancements)**:
- **Test Set 6**: Test all state transition scenarios
- **Scenario 5**: Test re-selection behavior (no change vs expand)

---

### Validation Checklist

**Use this checklist to verify mock data matches requirements**:

- [ ] All content types represented (article, image, video, audio)
- [ ] Featured and non-featured content for filter testing
- [ ] Null fields for edge case testing (sidebar_title, sidebar_subtitle, publication_date)
- [ ] Categories with multiple subcategories (3 categories, 5 total subcategories)
- [ ] Subcategories with multiple content items (testing filtering)
- [ ] Collections with featured/non-featured mix (3 featured, 1 not, 1 empty)
- [ ] Collection-content relationships for filtering logic
- [ ] Dropdown options for all styles used in test content
- [ ] order_index values enable sorting verification (increments of 10)
- [ ] State transition scenarios cover all 9 transition rules
- [ ] Empty state scenarios for all three columns
- [ ] Column width testing (short, exact 25, exceeds 25)
- [ ] Multiple collection tabs scenario
- [ ] Re-selection behavior scenarios

---

### Stage 3 Summary

**Test Sets Created**: 10 comprehensive test data sets
**Scenarios Covered**: State transitions, filtering, edge cases, empty states, collections
**Total Mock Items**: 40+ mock data objects (content, categories, subcategories, collections, options)
**Next Stage**: Component Architecture & Structure (Stage 4) will define how components consume this data

---

*End of Stage 3*

---

## STAGE 4: COMPONENT ARCHITECTURE & STRUCTURE

### Purpose

Define component architecture, state management patterns, event handlers, and integration points for all Portfolio tab components. Establishes blueprints for implementation in Phases 2-5.

**Usage**: Reference component blueprints when implementing each component during development, use state patterns for consistency, follow handler patterns for callback structure.

---

### 1. PortfolioTab Component (Root)

**Responsibility**: Root component managing all state, data loading, and orchestrating child components

**Component Structure**:
```typescript
'use client' // Client component for Supabase queries and state management

function PortfolioTab() {
  // === STATE MANAGEMENT ===
  
  // Page state
  const [pageState, setPageState] = useState<PageState>('expanded-reader')
  const [activeTab, setActiveTab] = useState<string>('portfolio')
  const [activeCollections, setActiveCollections] = useState<ActiveCollections>([])
  
  // Selection state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  
  // Data state
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [bylineOptions, setBylineOptions] = useState<BylineOption[]>([])
  const [linkOptions, setLinkOptions] = useState<LinkOption[]>([])
  
  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // === DATA LOADING (Phase 2) ===
  
  useEffect(() => {
    async function loadData() {
      // Step 2.2: Load categories and subcategories
      // Step 2.3: Load content with featured filter
      // Step 2.4: Load collections (all + featured)
      // Step 2.5: Auto-select first category/subcategory/content
      // Set pageState to 'expanded-reader'
    }
    loadData()
  }, [])
  
  // === COMPUTED STATE (useMemo for performance) ===
  
  const featuredCollections = useMemo(
    () => collections.filter(c => c.featured),
    [collections]
  )
  
  const linkedCollections = useMemo(
    () => {
      if (!selectedContent) return []
      return collections.filter(c => 
        selectedContent.collection_slugs.includes(c.slug)
      )
    },
    [collections, selectedContent]
  )
  
  // === EVENT HANDLERS (useCallback to prevent re-creation) ===
  
  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory(category)
    setSelectedSubcategory(null)
    setSelectedContent(null)
    setPageState('expanded-empty')
  }, [])
  
  const handleSubcategorySelect = useCallback((subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory)
    setSelectedContent(null)
    setPageState('expanded-empty')
  }, [])
  
  const handleContentSelect = useCallback((content: ContentItem) => {
    setSelectedContent(content)
    setPageState('collapsed-reader')
  }, [])
  
  const handleMainMenuClick = useCallback(() => {
    if (pageState === 'collapsed-reader') {
      setPageState('expanded-reader')
    }
  }, [pageState])
  
  const handleCollectionClick = useCallback((collection: Collection) => {
    // Add to activeCollections array (append, don't replace)
    setActiveCollections(prev => [...prev, { slug: collection.slug, name: collection.name }])
    setActiveTab(collection.slug)
    setPageState('expanded-reader')
    // Load filtered content for collection
  }, [])
  
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
    // If switching to collection tab, filter data
    // If switching to main tabs, clear filters
  }, [])
  
  const handleCollectionClose = useCallback((slug: string) => {
    setActiveCollections(prev => prev.filter(c => c.slug !== slug))
    setActiveTab('portfolio')
    // Restore main Portfolio view
  }, [])
  
  // === RENDER ===
  
  return (
    <div>
      <Profile /> {/* Shared component, reuse as-is */}
      
      <MainMenu
        categories={categories}
        subcategories={subcategories}
        content={content}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        selectedContent={selectedContent}
        pageState={pageState}
        onCategorySelect={handleCategorySelect}
        onSubcategorySelect={handleSubcategorySelect}
        onContentSelect={handleContentSelect}
        onMenuClick={handleMainMenuClick}
      />
      
      <CollectionsMenu
        collections={collections}
        featuredCollections={featuredCollections}
        selectedContent={selectedContent}
        pageState={pageState}
        onCollectionClick={handleCollectionClick}
      />
      
      {(pageState === 'collapsed-reader' || pageState === 'expanded-reader') && (
        <>
          <ContentReader
            content={selectedContent}
            isVisible={true}
            positioning={pageState === 'expanded-reader' ? 'expanded' : 'collapsed'}
          />
          <InfoMenu
            metadata={selectedContent ? {
              publication_name: selectedContent.publication_name,
              publication_date: selectedContent.publication_date,
              byline_style_text: selectedContent.byline_style_text,
              author_name: selectedContent.author_name,
              link_style_text: selectedContent.link_style_text,
              source_link: selectedContent.source_link
            } : null}
            isVisible={true}
          />
        </>
      )}
      
      <BottomTabBar
        activeTab={activeTab}
        collections={activeCollections}
        onTabChange={handleTabChange}
        onCollectionClose={handleCollectionClose}
      />
    </div>
  )
}
```

**State Management Patterns**:
- **useState**: All state variables for immediate updates
- **useMemo**: Computed state (featuredCollections, linkedCollections) prevents recalculation
- **useCallback**: All handlers prevent function re-creation on re-renders
- **useEffect**: Data loading on mount, handles async Supabase queries

**Key Decisions**:
- Root component owns all state (centralized state management)
- Child components stateless (receive data via props, communicate via callbacks)
- Computed state with useMemo for filtered/derived data
- Handlers with useCallback for performance (prevents child re-renders)

---

### 2. MainMenu Component

**Responsibility**: Display three-column hierarchical navigation, handle selection, manage filtering and visual reordering

**Component Structure**:
```typescript
function MainMenu({
  categories,
  subcategories,
  content,
  selectedCategory,
  selectedSubcategory,
  selectedContent,
  pageState,
  onCategorySelect,
  onSubcategorySelect,
  onContentSelect,
  onMenuClick
}: MainMenuProps) {
  
  // === COMPUTED STATE ===
  
  // Filter subcategories by selected category
  const displayedSubcategories = useMemo(
    () => selectedCategory 
      ? subcategories.filter(s => s.category_id === selectedCategory.id)
      : [],
    [subcategories, selectedCategory]
  )
  
  // Filter content by selected subcategory
  const displayedContent = useMemo(
    () => selectedSubcategory
      ? content.filter(c => c.subcategory_id === selectedSubcategory.id)
      : [],
    [content, selectedSubcategory]
  )
  
  // Visual reordering state (Phase 7 Step 7.1)
  const [categoriesOrder, setCategoriesOrder] = useState<string[]>([])
  const [subcategoriesOrder, setSubcategoriesOrder] = useState<string[]>([])
  const [contentOrder, setContentOrder] = useState<string[]>([])
  
  // Derive if expanded
  const isExpanded = pageState !== 'collapsed-reader'
  
  // === HELPER FUNCTIONS ===
  
  function getSelectionColor(
    itemId: string,
    itemType: 'category' | 'subcategory' | 'content'
  ): 'green' | 'gray' {
    if (itemType === 'category' && selectedCategory?.id === itemId) return 'green'
    if (itemType === 'subcategory' && selectedSubcategory?.id === itemId) return 'green'
    if (itemType === 'content' && selectedContent?.id === itemId) return 'green'
    
    // Hierarchy selection (Logic Doc lines 129-132)
    if (itemType === 'category' && selectedSubcategory?.id) {
      const subcat = subcategories.find(s => s.id === selectedSubcategory.id)
      if (subcat?.category_id === itemId) return 'green'
    }
    if (itemType === 'subcategory' && selectedContent) {
      if (selectedContent.subcategory_id === itemId) return 'green'
    }
    
    return 'gray'
  }
  
  function handleItemClick(
    item: Category | Subcategory | ContentItem,
    itemType: 'category' | 'subcategory' | 'content'
  ) {
    // Re-selection behavior (Logic Doc line 152)
    if (pageState !== 'collapsed-reader') {
      const isAlreadySelected = 
        (itemType === 'category' && selectedCategory?.id === item.id) ||
        (itemType === 'subcategory' && selectedSubcategory?.id === item.id) ||
        (itemType === 'content' && selectedContent?.id === item.id)
      
      if (isAlreadySelected) return // No change
    }
    
    // Call appropriate handler
    if (itemType === 'category') onCategorySelect(item as Category)
    if (itemType === 'subcategory') onSubcategorySelect(item as Subcategory)
    if (itemType === 'content') onContentSelect(item as ContentItem)
  }
  
  // === RENDER ===
  
  if (!isExpanded && pageState === 'collapsed-reader') {
    // Collapsed state: show only selected items
    return (
      <div onClick={onMenuClick} className="cursor-pointer">
        {/* Category gray, subcategory gray, content green (no subtitle) */}
        {selectedCategory && <div className="text-gray-500">{selectedCategory.name}</div>}
        {selectedSubcategory && <div className="text-gray-500">{selectedSubcategory.name}</div>}
        {selectedContent && <div className="text-[#00ff88]">{selectedContent.sidebar_title || selectedContent.title}</div>}
      </div>
    )
  }
  
  // Expanded state: show all columns
  return (
    <div className="grid grid-cols-3 gap-[3rem]">
      {/* Column 1: Categories */}
      <div>
        {categories.length === 0 ? (
          <div className="text-gray-400">No categories</div>
        ) : (
          categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => handleItemClick(cat, 'category')}
              className={`cursor-pointer ${getSelectionColor(cat.id, 'category') === 'green' ? 'text-[#00ff88]' : 'text-[#6b7280]'} hover:text-[#e5e7eb]`}
              style={{ maxWidth: '25ch' /* Calculate pixels in implementation */, overflow: 'hidden' }}
            >
              {cat.name}
            </div>
          ))
        )}
      </div>
      
      {/* Column 2: Subcategories (filtered) */}
      <div>
        {displayedSubcategories.length === 0 ? (
          <div className="text-gray-400">No subcategories</div>
        ) : (
          displayedSubcategories.map(sub => (
            <div
              key={sub.id}
              onClick={() => handleItemClick(sub, 'subcategory')}
              className={`cursor-pointer ${getSelectionColor(sub.id, 'subcategory') === 'green' ? 'text-[#00ff88]' : 'text-[#6b7280]'} hover:text-[#e5e7eb]`}
              style={{ maxWidth: '25ch', overflow: 'hidden' }}
            >
              {sub.name}
            </div>
          ))
        )}
      </div>
      
      {/* Column 3: Content (filtered) */}
      <div>
        {displayedContent.length === 0 ? (
          <div className="text-gray-400">No content</div>
        ) : (
          displayedContent.map(item => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item, 'content')}
              className={`cursor-pointer ${getSelectionColor(item.id, 'content') === 'green' ? 'text-[#00ff88]' : 'text-[#6b7280]'} hover:text-[#e5e7eb]`}
            >
              <div>{item.sidebar_title || item.title}</div>
              {/* Subtitle: sidebar_subtitle / year (Logic Doc lines 192-195) */}
              {(item.sidebar_subtitle || item.publication_year) && (
                <div className="text-gray-400 text-sm">
                  {item.sidebar_subtitle && item.publication_year 
                    ? `${item.sidebar_subtitle} / ${item.publication_year}`
                    : item.publication_year || ''
                  }
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

**State Patterns**:
- **pageState**: Drives UI visibility across all components
- **Selection trio**: selectedCategory/Subcategory/Content track hierarchy
- **activeCollections**: Array manages multiple open collection tabs
- **activeTab**: String tracks current view ('portfolio' | collection.slug)

**Handler Patterns**:
- **Category select**: Clear subcategory/content, set expanded-empty
- **Subcategory select**: Clear content, set expanded-empty
- **Content select**: Set collapsed-reader
- **Main menu click** (collapsed): Expand to expanded-reader

**Integration Points**:
- **To MainMenu**: Passes all data + selection + callbacks
- **To CollectionsMenu**: Passes collections + selected content + callback
- **To ContentReader/InfoMenu**: Conditional rendering based on pageState
- **To BottomTabBar**: Passes activeTab + activeCollections + callbacks

---

### 3. CollectionsMenu Component

**Responsibility**: Display collections with visibility rules (featured vs linked), handle collection clicks, switch layout (vertical vs horizontal)

**Component Structure**:
```typescript
function CollectionsMenu({
  collections,
  featuredCollections,
  selectedContent,
  pageState,
  onCollectionClick
}: CollectionsMenuProps) {
  
  // === COMPUTED STATE ===
  
  const isVertical = pageState !== 'collapsed-reader'
  
  const displayedCollections = useMemo(() => {
    if (isVertical) {
      // Expanded states: show only featured collections
      return featuredCollections.sort((a, b) => a.order_index - b.order_index)
    } else {
      // Collapsed state: show collections linked to current content
      if (!selectedContent) return []
      return collections
        .filter(c => selectedContent.collection_slugs.includes(c.slug))
        .sort((a, b) => a.order_index - b.order_index)
    }
  }, [isVertical, featuredCollections, collections, selectedContent])
  
  // === RENDER ===
  
  if (isVertical) {
    // Vertical list (expanded states)
    return (
      <div className="flex flex-col space-y-2">
        {displayedCollections.map(coll => (
          <div
            key={coll.id}
            onClick={() => onCollectionClick(coll)}
            className="cursor-pointer text-[#6b7280] hover:text-[#e5e7eb]"
          >
            {coll.name}
          </div>
        ))}
      </div>
    )
  } else {
    // Horizontal row (collapsed state)
    if (displayedCollections.length === 0) {
      return <div className="h-4" /> // Empty space
    }
    
    // Order: smallest right → larger left (Logic Doc line 259)
    const reversedCollections = [...displayedCollections].reverse()
    
    return (
      <div className="flex flex-row-reverse space-x-reverse space-x-2">
        {reversedCollections.map(coll => (
          <div
            key={coll.id}
            onClick={() => onCollectionClick(coll)}
            className="cursor-pointer text-[#6b7280] hover:text-[#e5e7eb]"
          >
            {coll.name}
          </div>
        ))}
      </div>
    )
  }
}
```

**State Patterns**:
- **isVertical**: Derived from pageState, no separate state needed
- **displayedCollections**: Computed with useMemo based on expanded vs collapsed rules

**Visibility Rules** (Logic Doc lines 257-262):
- **Expanded**: Featured collections only, ordered by order_index ascending
- **Collapsed**: Linked to current content, ordered smallest right → larger left

**Integration Points**:
- Receives: collections data, featured subset, selected content, page state
- Calls: onCollectionClick when collection clicked

---

### 4. ContentReader Component

**Responsibility**: Display selected content with type-specific rendering, handle positioning for expanded/collapsed states, enable scrolling

**Component Structure**:
```typescript
function ContentReader({
  content,
  isVisible,
  positioning
}: ContentReaderProps) {
  
  if (!isVisible || !content) return null
  
  // === COMPUTED POSITIONING ===
  
  const marginLeft = positioning === 'expanded' 
    ? 'calc(-2% + 80px)' // Shifts right for Main menu
    : '-2%'
  
  const marginRight = positioning === 'collapsed'
    ? '-15%' // Extends toward page edge
    : '2%'
  
  // === CONTENT TYPE RENDERING ===
  
  function renderContentByType() {
    switch (content.type) {
      case 'article':
        // Step 0.2 prerequisite: EditorRenderer with 13 plugins
        return <EditorRenderer data={content.content_body} />
        
      case 'image':
        return (
          <img
            src={content.image_url || ''}
            alt={content.title}
            className="rounded-lg max-w-full"
          />
        )
        
      case 'video':
        // YouTube detection or HTML5 video
        if (content.video_url?.includes('youtube.com') || content.video_url?.includes('youtu.be')) {
          return (
            <iframe
              src={content.video_url}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )
        }
        return <video src={content.video_url || ''} controls className="w-full" />
        
      case 'audio':
        return <audio src={content.audio_url || ''} controls className="w-full" />
        
      default:
        return null
    }
  }
  
  // === RENDER ===
  
  return (
    <div
      className="overflow-y-auto"
      style={{
        marginLeft,
        marginRight,
        marginTop: 'calc(45vh - 33vh - 3rem + 25px)', // Below Profile header
        maxHeight: 'calc(100vh - 33vh - 10vh - 6rem)' // Between Profile and BottomTabBar
      }}
    >
      <h1 className="text-3xl font-bold text-[#e5e7eb] mb-2">{content.title}</h1>
      {content.subtitle && (
        <h2 className="text-xl text-[#d1d5db] mb-6">{content.subtitle}</h2>
      )}
      <div className="text-[#e5e7eb]">
        {renderContentByType()}
      </div>
    </div>
  )
}
```

**Content-Agnostic Pattern** (Logic Doc line 294):
- Positioning logic identical for all types
- State management identical for all types
- Only content rendering varies by type

**Positioning Specifications** (Logic Doc lines 306-310):
- Base: marginLeft -2%, marginRight 2%
- Expanded: marginLeft calc(-2% + 80px)
- Collapsed: marginRight -15%
- Vertical: Below Profile header with max-height constraint

**Integration Points**:
- Receives: selected content, visibility flag, positioning mode
- Renders: Title, subtitle, type-specific content
- Step 0.3 decision: May adapt ContentViewer.tsx instead of building custom

---

### 5. InfoMenu Component

**Responsibility**: Display metadata for selected content, maintain fixed positioning during Content reader scroll

**Component Structure**:
```typescript
function InfoMenu({
  metadata,
  isVisible
}: InfoMenuProps) {
  
  if (!isVisible || !metadata) return null
  
  // === RENDER ===
  
  return (
    <div
      className="fixed z-10"
      style={{
        top: '50%',
        left: '2.5%',
        transform: 'translateY(-50%)' // Center vertically
      }}
    >
      {/* Line 1: Publication Name / Publication Date */}
      <div className="text-sm mb-2">
        <span className="text-[#00ff88]">{metadata.publication_name}</span>
        <span className="text-[#9ca3af]"> / {metadata.publication_date}</span>
      </div>
      
      {/* Line 2: <byline style>: Author Name */}
      <div className="text-sm mb-2">
        <span className="text-[#00ff88]">{metadata.byline_style_text}</span>
        <span className="text-[#9ca3af]">: {metadata.author_name}</span>
      </div>
      
      {/* Line 3: <link style>: Link to Original Source */}
      <div className="text-sm">
        <span className="text-[#00ff88]">{metadata.link_style_text}</span>
        <span className="text-[#9ca3af]">: </span>
        <a 
          href={metadata.source_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#9ca3af] hover:text-[#e5e7eb] underline"
        >
          {metadata.source_link}
        </a>
      </div>
    </div>
  )
}
```

**Positioning Pattern**:
- **Absolute**: Fixed at top 50%, left 2.5%
- **Independent scrolling**: Remains fixed while Content reader scrolls
- **Z-index**: Above content but below modals

**Color Coding** (Logic Doc lines 347-349):
- Labels (publication_name, byline_style_text, link_style_text): Emerald green #00ff88
- Values (dates, author, URL): Gray #9ca3af
- Hover: Lighter gray #e5e7eb for links

**Integration Points**:
- Receives: ContentMetadata extracted from selected content
- Displays: Three lines of formatted metadata
- Conditional rendering based on isVisible flag

---

### 6. BottomTabBar Integration Pattern

**Responsibility**: Manage collection tabs alongside main tabs, handle tab switching and collection closing

**Integration Code** (in PortfolioTab):
```typescript
// In PortfolioTab component

// State for collection tabs
const [activeCollections, setActiveCollections] = useState<ActiveCollections>([])
const [activeTab, setActiveTab] = useState<string>('portfolio')

// Add collection handler
const handleCollectionClick = useCallback((collection: Collection) => {
  setActiveCollections(prev => {
    // Check if already open
    if (prev.some(c => c.slug === collection.slug)) {
      // Just switch to it
      setActiveTab(collection.slug)
      return prev
    }
    // Append new collection
    const newCollections = [...prev, { slug: collection.slug, name: collection.name }]
    setActiveTab(collection.slug)
    return newCollections
  })
}, [])

// Close collection handler
const handleCollectionClose = useCallback((slug: string) => {
  setActiveCollections(prev => {
    const filtered = prev.filter(c => c.slug !== slug)
    
    // If closing current tab, switch to portfolio
    if (activeTab === slug) {
      setActiveTab('portfolio')
    }
    
    return filtered
  })
}, [activeTab])

// Tab change handler
const handleTabChange = useCallback((tabId: string) => {
  setActiveTab(tabId)
  
  // If switching to collection, filter data
  if (tabId !== 'portfolio' && tabId !== 'resume' && tabId !== 'downloads') {
    // Collection tab: filter content by collection
    // Update Main menu to show only collection content
  } else {
    // Main tabs: show all featured content
  }
}, [])

// Pass to BottomTabBar
<BottomTabBar
  activeTab={activeTab}
  collections={activeCollections}
  onTabChange={handleTabChange}
  onCollectionClose={handleCollectionClose}
/>
```

**State Management** (Logic Doc lines 412-419):
- activeCollections array: Appends on click, removes on close
- activeTab string: Tracks current view
- Callbacks: onTabChange switches view, onCollectionClose removes + switches

**No Modifications Needed to BottomTabBar** (Logic Doc line 421):
- Component already implements collection tabs functionality
- PortfolioTab only manages state and responds to callbacks

---

### Component Dependency Graph

```
Data Flow (Top → Down):
======================

Supabase Database
    ↓
PortfolioTab (Data Loading useEffect)
    ↓
State Updates (categories, subcategories, content, collections)
    ↓
Computed State (useMemo: featuredCollections, linkedCollections)
    ↓
Props Distribution
    ├→ MainMenu (all data + selection + handlers)
    ├→ CollectionsMenu (collections + selection + handler)
    ├→ ContentReader (selected content + positioning)
    ├→ InfoMenu (metadata + visibility)
    └→ BottomTabBar (activeTab + collections + handlers)


Callback Flow (Bottom → Up):
============================

User Click on Category
    ↓
MainMenu: onCategorySelect(category)
    ↓
PortfolioTab: handleCategorySelect
    ↓
State Updates: setSelectedCategory, clear subcategory/content, set expanded-empty
    ↓
Re-render: All children receive new props


User Click on Collection
    ↓
CollectionsMenu: onCollectionClick(collection)
    ↓
PortfolioTab: handleCollectionClick
    ↓
State Updates: Add to activeCollections array, set activeTab to slug
    ↓
Re-render: BottomTabBar shows new tab, Main menu filters


User Click ✕ on Collection Tab
    ↓
BottomTabBar: onCollectionClose(slug)
    ↓
PortfolioTab: handleCollectionClose
    ↓
State Updates: Remove from activeCollections, switch activeTab to 'portfolio'
    ↓
Re-render: Tab removed, Main menu shows all content
```

**Critical Dependencies**:
- MainMenu depends on: categories, subcategories, content, selection state
- CollectionsMenu depends on: collections, selectedContent (for linked filter)
- ContentReader depends on: selectedContent, pageState (for positioning)
- InfoMenu depends on: selectedContent (for metadata extraction)
- BottomTabBar depends on: activeTab, activeCollections

---

### State Management Patterns

**Pattern 1: Centralized State in Root**
```typescript
// PortfolioTab owns all state
// Child components receive via props
// No prop drilling issues (max 1 level deep)

// Example:
const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

<MainMenu 
  selectedCategory={selectedCategory} // Pass down
  onCategorySelect={handleCategorySelect} // Update via callback
/>
```

**Pattern 2: Computed State with useMemo**
```typescript
// Derive state instead of duplicating
// Prevents stale data
// Recalculates only when dependencies change

const featuredCollections = useMemo(
  () => collections.filter(c => c.featured),
  [collections] // Recalculates only when collections changes
)

const displayedSubcategories = useMemo(
  () => selectedCategory 
    ? subcategories.filter(s => s.category_id === selectedCategory.id)
    : [],
  [subcategories, selectedCategory]
)
```

**Pattern 3: Event Handlers with useCallback**
```typescript
// Prevent function re-creation on every render
// Prevents unnecessary child re-renders
// Stable function reference

const handleCategorySelect = useCallback((category: Category) => {
  setSelectedCategory(category)
  setSelectedSubcategory(null)
  setSelectedContent(null)
  setPageState('expanded-empty')
}, []) // Empty deps: function logic doesn't depend on props/state
```

**Pattern 4: Conditional Rendering Based on State**
```typescript
// Use pageState to control visibility
// Single source of truth

{(pageState === 'collapsed-reader' || pageState === 'expanded-reader') && (
  <>
    <ContentReader ... />
    <InfoMenu ... />
  </>
)}

// Not: separate isContentReaderVisible state
// Derive from pageState instead
```

---

### Event Handler Patterns

**Handler 1: Selection with State Transitions**
```typescript
const handleContentSelect = useCallback((content: ContentItem) => {
  // Update selection
  setSelectedContent(content)
  
  // Trigger state transition
  setPageState('collapsed-reader') // Logic Doc line 87
  
  // Hierarchy automatically maintained (content → subcategory → category)
  // Already set from previous selections
}, [])
```

**Handler 2: Collection Tab Management**
```typescript
const handleCollectionClick = useCallback((collection: Collection) => {
  setActiveCollections(prev => {
    // Check if already open
    if (prev.some(c => c.slug === collection.slug)) {
      setActiveTab(collection.slug)
      return prev // Don't duplicate
    }
    
    // Append to array (Logic Doc line 414: append, don't replace)
    return [...prev, { slug: collection.slug, name: collection.name }]
  })
  
  setActiveTab(collection.slug)
  setPageState('expanded-reader') // Collection tabs load expanded
  
  // Filter logic will be implemented in Phase 5
}, [])
```

**Handler 3: Re-selection Behavior**
```typescript
function handleItemClick(item: any, itemType: string) {
  // Check if already selected (Logic Doc lines 93, 152)
  if (pageState !== 'collapsed-reader') {
    const isAlreadySelected = /* check if item === selected */
    if (isAlreadySelected) return // No change in expanded states
  }
  
  // Exception: collapsed state Main menu click expands (Logic Doc line 91)
  // Handled by onMenuClick prop instead
  
  // Call appropriate selection handler
  onCategorySelect(item)
}
```

**Handler 4: Main Menu Collapsed Click**
```typescript
const handleMainMenuClick = useCallback(() => {
  // Only triggered when pageState === 'collapsed-reader'
  if (pageState === 'collapsed-reader') {
    setPageState('expanded-reader') // Expand menu (Logic Doc line 91)
    // Selection unchanged
  }
}, [pageState])
```

---

### Integration Points Documentation

**Integration Point 1: PortfolioTab ↔ MainMenu**
- **Data flow**: categories, subcategories, content arrays
- **Selection flow**: selectedCategory/Subcategory/Content
- **Callback flow**: onCategorySelect, onSubcategorySelect, onContentSelect, onMenuClick
- **Filtering**: MainMenu computes displayedSubcategories/Content using useMemo
- **State dependency**: pageState determines expanded vs collapsed rendering

**Integration Point 2: PortfolioTab ↔ CollectionsMenu**
- **Data flow**: collections array, featuredCollections computed
- **Selection dependency**: selectedContent for linked collections in collapsed state
- **Callback flow**: onCollectionClick triggers activeCollections update
- **Visibility**: pageState determines vertical vs horizontal layout
- **Order**: order_index sorting, reversed for horizontal (smallest right)

**Integration Point 3: PortfolioTab ↔ ContentReader**
- **Data flow**: selectedContent (ContentItem or null)
- **Visibility**: Conditional rendering based on pageState (reader states only)
- **Positioning**: pageState determines expanded vs collapsed margins
- **Content type**: ContentReader handles all 4 types internally
- **Architecture decision**: Step 0.3 determines reuse ContentViewer.tsx vs custom

**Integration Point 4: PortfolioTab ↔ InfoMenu**
- **Data flow**: ContentMetadata extracted from selectedContent
- **Visibility**: Conditional rendering (same as ContentReader)
- **Dropdown texts**: byline_style_text and link_style_text from joins
- **Color coding**: Labels green, values gray (component applies colors)

**Integration Point 5: PortfolioTab ↔ BottomTabBar**
- **Data flow**: activeTab string, activeCollections array
- **Callback flow**: onTabChange switches tab, onCollectionClose removes collection
- **State updates**: Callbacks update activeTab and activeCollections state
- **No component modifications**: BottomTabBar reused as-is

**Integration Point 6: Shared Components**
- **Profile**: Reused as-is, no props needed, expansion handled automatically
- **EditorRenderer**: Imported with dynamic import (ssr: false) for article content
- **Step 0.2 prerequisite**: EditorRenderer must have 13 plugins before use

---

### Memoization Strategy

**What to Memoize**:
1. **featuredCollections**: Filter operation on collections array
2. **linkedCollections**: Filter operation based on selectedContent
3. **displayedSubcategories**: Filter operation by category_id
4. **displayedContent**: Filter operation by subcategory_id

**Why Memoize**:
- Prevents expensive filter operations on every render
- Stable array references prevent child re-renders
- Dependencies clearly documented

**Dependency Arrays**:
```typescript
featuredCollections → [collections]
linkedCollections → [collections, selectedContent]
displayedSubcategories → [subcategories, selectedCategory]
displayedContent → [content, selectedSubcategory]
```

**When NOT to Memoize**:
- Simple boolean derivations (isExpanded = pageState !== 'collapsed-reader')
- Single property accesses (selectedContent?.title)
- Static functions (renderContentByType switch statement)

---

### Component Lifecycle Patterns

**PortfolioTab Lifecycle**:
1. **Mount**: Load all data via useEffect, auto-select first items
2. **Update**: State changes trigger re-renders, computed state recalculates
3. **Unmount**: No cleanup needed (no subscriptions or timers)

**MainMenu Lifecycle**:
1. **Mount**: Initialize with passed props
2. **Update**: Props change → recompute filtered data → re-render
3. **Click handling**: Call parent callbacks, no local state updates

**CollectionsMenu Lifecycle**:
1. **Mount**: Compute displayed collections from props
2. **Update**: pageState change → switch layout, selectedContent change → refilter
3. **Layout switch**: Vertical ↔ horizontal based on pageState

**ContentReader Lifecycle**:
1. **Mount**: Render selected content
2. **Update**: content prop change → re-render new content
3. **Type switching**: Switch statement handles different content types
4. **EditorJS**: Dynamic import on first article render (cached after)

**InfoMenu Lifecycle**:
1. **Mount**: Display metadata
2. **Update**: metadata prop change → update display
3. **Scroll independence**: Fixed positioning maintains visibility

---

### State Update Flow Diagrams

**Flow 1: Category Selection**
```
User clicks category "Design"
    ↓
MainMenu: onCategorySelect(category)
    ↓
PortfolioTab: handleCategorySelect
    ↓
setSelectedCategory(category)
setSelectedSubcategory(null)
setSelectedContent(null)
setPageState('expanded-empty')
    ↓
PortfolioTab re-renders
    ↓
MainMenu receives new props:
  - selectedCategory: Design
  - selectedSubcategory: null
  - selectedContent: null
  - pageState: 'expanded-empty'
    ↓
MainMenu recomputes:
  - displayedSubcategories (filtered to Design subcats)
  - displayedContent (empty, no subcategory selected)
    ↓
MainMenu re-renders:
  - Column 1: Design green, others gray
  - Column 2: Design subcategories gray
  - Column 3: Empty (no subcategory selected)
    ↓
ContentReader conditional: pageState === 'expanded-empty' → NOT rendered
InfoMenu conditional: pageState === 'expanded-empty' → NOT rendered
CollectionsMenu: featuredCollections displayed (expanded state)
```

**Flow 2: Collection Tab Open**
```
User clicks collection "Featured Work" in Collections Menu
    ↓
CollectionsMenu: onCollectionClick(collection)
    ↓
PortfolioTab: handleCollectionClick
    ↓
setActiveCollections(prev => [...prev, { slug: 'featured-work', name: 'Featured Work' }])
setActiveTab('featured-work')
setPageState('expanded-reader')
    ↓
PortfolioTab re-renders
    ↓
BottomTabBar receives:
  - activeTab: 'featured-work'
  - collections: [{ slug: 'featured-work', name: 'Featured Work' }]
    ↓
BottomTabBar renders:
  - PORTFOLIO (inactive)
  - RESUME (inactive)
  - DOWNLOADS (inactive)
  - COLLECTION FEATURED WORK (active, purple background, ✕ button)
    ↓
MainMenu receives filtered data:
  - content: only items with 'featured-work' in collection_slugs
  - categories: only if contains filtered content
  - subcategories: only if contains filtered content
    ↓
First content item in collection auto-selected
ContentReader displays filtered content
```

**Flow 3: Collection Tab Close**
```
User clicks ✕ on "Featured Work" tab
    ↓
BottomTabBar: onCollectionClose('featured-work')
    ↓
PortfolioTab: handleCollectionClose
    ↓
setActiveCollections(prev => prev.filter(c => c.slug !== 'featured-work'))
if (activeTab === 'featured-work') setActiveTab('portfolio')
    ↓
PortfolioTab re-renders
    ↓
BottomTabBar receives:
  - activeTab: 'portfolio'
  - collections: [] (empty if last collection)
    ↓
BottomTabBar renders:
  - PORTFOLIO (active, green underline)
  - RESUME (inactive)
  - DOWNLOADS (inactive)
  - No collection tabs
    ↓
MainMenu receives unfiltered data:
  - All featured content displayed
  - All categories/subcategories available
```

---

### Stage 4 Summary

**Components Documented**: 6 core components with complete blueprints
**Patterns Established**: State management (useState/useMemo/useCallback), event handlers, conditional rendering
**Integration Points**: 6 documented integration points between components
**State Flows**: 3 complete state update flow diagrams
**Architecture**: Centralized state in PortfolioTab, stateless children with callbacks
**Next Stage**: State Machine & Transition Logic (Stage 5) will document state machine implementation

---

*End of Stage 4*

---

## STAGE 5: STATE MACHINE & TRANSITION LOGIC

### Purpose

Document the complete state machine implementation with all transitions, visibility rules, and UI behaviors. Establishes the precise logic for when each component appears/disappears and how user interactions trigger state changes.

**Usage**: Reference during state management implementation, use transition rules for handler logic, follow visibility matrix for conditional rendering.

---

### 1. State Definitions

**Three Active States** (Logic Doc lines 33-36):

```typescript
type PageState = 'expanded-empty' | 'expanded-reader' | 'collapsed-reader'
```

**State Descriptions**:
- **`expanded-empty`**: Main menu expanded, Content reader closed, category/subcategory selected but no content selected
- **`expanded-reader`**: Main menu expanded, Content reader visible, content item selected
- **`collapsed-reader`**: Main menu collapsed (shows only breadcrumb), Content reader visible, content item selected

**Initial State** (Logic Doc lines 235-239):
- State: `expanded-reader`
- Selection: First category by order_index → first subcategory of that category → first content item of that subcategory
- All three selections made automatically on page load
- Content reader displays first item immediately
- Rationale: User immediately sees content on arrival

**No Loading State** (Logic Doc line 235):
- Page loads directly into `expanded-reader` with selections
- No intermediate loading screen with spinner
- Hierarchy (category → subcategory → content) populated before render

---

### 2. State Transition Rules

**Rule 1: Category Click** (Logic Doc lines 240, 157)
- **Trigger**: User clicks category in Main menu column 1
- **From**: Any state
- **To**: `expanded-empty`
- **State changes**:
  - `setSelectedCategory(clickedCategory)`
  - `setSelectedSubcategory(null)`
  - `setSelectedContent(null)`
  - `setPageState('expanded-empty')`
- **UI changes**:
  - Main menu expands (if collapsed)
  - Content reader closes
  - Column 2 shows subcategories of clicked category (all gray, none selected)
  - Column 3 empty (no subcategory selected yet)
- **Exception**: Clicking already-selected category in expanded state does nothing (Logic Doc line 152)

**Rule 2: Subcategory Click** (Logic Doc lines 241, 158)
- **Trigger**: User clicks subcategory in Main menu column 2
- **From**: `expanded-empty` (after category selected)
- **To**: `expanded-empty`
- **State changes**:
  - `setSelectedSubcategory(clickedSubcategory)`
  - `setSelectedContent(null)`
  - `setPageState('expanded-empty')`
- **UI changes**:
  - Content reader remains closed
  - Column 3 shows content items of clicked subcategory (all gray, none selected)
- **Exception**: Clicking already-selected subcategory in expanded state does nothing (Logic Doc line 152)

**Rule 3: Content Click** (Logic Doc lines 87, 159-161)
- **Trigger**: User clicks content item in Main menu column 3
- **From**: `expanded-empty` or `expanded-reader`
- **To**: `collapsed-reader`
- **State changes**:
  - `setSelectedContent(clickedContent)`
  - `setPageState('collapsed-reader')`
- **UI changes**:
  - Main menu collapses to breadcrumb (category gray / subcategory gray / content green)
  - Content reader displays selected content (visible, collapsed positioning)
  - Collections menu switches to horizontal (linked collections only)
  - Info menu appears with metadata
- **Exception**: Clicking already-selected content in expanded state does nothing (Logic Doc line 152)

**Rule 4: Main Menu Click (Collapsed State)** (Logic Doc lines 91, 276)
- **Trigger**: User clicks anywhere on collapsed Main menu breadcrumb
- **From**: `collapsed-reader` only
- **To**: `expanded-reader`
- **State changes**:
  - `setPageState('expanded-reader')`
  - Selection unchanged (category/subcategory/content remain same)
- **UI changes**:
  - Main menu expands to 3-column view
  - Content reader remains visible with expanded positioning
  - Collections menu switches to vertical (featured collections)
  - Info menu remains visible
- **Exception**: This is the ONLY case where clicking already-selected items changes state (Logic Doc line 276)

**Rule 5: Collection Click (Expanded State)** (Logic Doc lines 243-249, 400-405)
- **Trigger**: User clicks collection in Collections menu (vertical layout)
- **From**: `expanded-empty` or `expanded-reader`
- **To**: `expanded-reader` (collection tab)
- **State changes**:
  - `setActiveCollections(prev => [...prev, {slug, name}])` (append if not already open)
  - `setActiveTab(collection.slug)`
  - `setPageState('expanded-reader')`
  - Auto-select first content in collection by order_index
  - Filter categories/subcategories to show only those with content in collection
- **UI changes**:
  - BottomTabBar adds new collection tab with ✕ button
  - Main menu filters to collection content
  - Content reader displays first item in collection
  - Collections menu shows featured collections (same as main Portfolio view)
- **Edge case**: If same content item already selected and in collection, keep selection; if not in collection, select first item

**Rule 6: Collection Click (Collapsed State)** (Logic Doc lines 401-403)
- **Trigger**: User clicks collection in Collections menu (horizontal layout)
- **From**: `collapsed-reader`
- **To**: `expanded-reader` (collection tab)
- **State changes**: Same as Rule 5
- **UI changes**: Main menu expands + filters, same as Rule 5

**Rule 7: Tab Change (Switch to Collection)** (Logic Doc line 408)
- **Trigger**: User clicks collection tab in BottomTabBar
- **From**: Any state, any tab (portfolio, resume, downloads, or another collection)
- **To**: `expanded-reader` (target collection tab)
- **State changes**:
  - `setActiveTab(collection.slug)`
  - `setPageState('expanded-reader')`
  - Filter data to collection
- **UI changes**:
  - Main menu filters to collection content
  - Content reader displays last-selected content in that collection (or first if never visited)
  - Collections menu shows featured collections
- **Note**: Tab already in activeCollections, just switching to it

**Rule 8: Tab Change (Switch to Main Tabs)** (Logic Doc line 410)
- **Trigger**: User clicks Portfolio/Resume/Downloads tab in BottomTabBar
- **From**: Collection tab
- **To**: Depends on target tab (Portfolio → `expanded-reader`, Resume/Downloads → their own states)
- **State changes**:
  - `setActiveTab('portfolio' | 'resume' | 'downloads')`
  - For Portfolio: restore main view with all featured content
  - For Resume/Downloads: switch to those tabs entirely
- **UI changes**:
  - Portfolio: Main menu shows all featured content (unfiltered)
  - Resume/Downloads: Different tab components render

**Rule 9: Collection Tab Close** (Logic Doc lines 417-418)
- **Trigger**: User clicks ✕ on collection tab in BottomTabBar
- **From**: Any state (usually `expanded-reader` on that collection tab)
- **To**: `expanded-reader` (switches to Portfolio tab)
- **State changes**:
  - `setActiveCollections(prev => prev.filter(c => c.slug !== closedSlug))`
  - `setActiveTab('portfolio')` (if closing current tab)
  - Restore main Portfolio view
- **UI changes**:
  - BottomTabBar removes tab
  - Main menu shows all featured content
  - Content reader displays last-selected content from main view
- **Edge case**: If closing non-active tab, activeTab unchanged (Logic Doc line 418)

---

### 3. Component Visibility Matrix

**Matrix Format**: State → Component → Visibility + Layout

| Component | expanded-empty | expanded-reader | collapsed-reader |
|-----------|----------------|-----------------|------------------|
| **Profile** | Visible (33vh) | Visible (33vh) | Visible (33vh) |
| **Main Menu** | Visible (3-column, selected category/subcategory green, content gray if any) | Visible (3-column, all selections green per hierarchy) | Visible (1-line breadcrumb, category/subcategory gray, content green) |
| **Collections Menu** | Visible (vertical, featured only) | Visible (vertical, featured only) | Visible (horizontal, linked to content only) |
| **Content Reader** | **Hidden** | Visible (expanded positioning: marginLeft calc(-2% + 80px), marginRight 2%) | Visible (collapsed positioning: marginLeft -2%, marginRight -15%) |
| **Info Menu** | **Hidden** | Visible (fixed left 2.5%, top 50%) | Visible (fixed left 2.5%, top 50%) |
| **BottomTabBar** | Visible (main tabs + collection tabs) | Visible (main tabs + collection tabs) | Visible (main tabs + collection tabs) |

**Visibility Logic in Code**:
```typescript
// Content Reader and Info Menu visibility
{(pageState === 'collapsed-reader' || pageState === 'expanded-reader') && (
  <>
    <ContentReader
      content={selectedContent}
      isVisible={true}
      positioning={pageState === 'expanded-reader' ? 'expanded' : 'collapsed'}
    />
    <InfoMenu
      metadata={selectedContent ? extractMetadata(selectedContent) : null}
      isVisible={true}
    />
  </>
)}

// Main Menu layout
<MainMenu
  {...props}
  pageState={pageState} // Component uses this to render collapsed vs expanded
/>

// Collections Menu layout
<CollectionsMenu
  {...props}
  pageState={pageState} // Component uses this to render vertical vs horizontal
/>
```

---

### 4. Selection Color Coding Rules

**Rule Set** (Logic Doc lines 112-132):

**Hierarchy Rule**:
- When content selected → content green, subcategory green (parent), category green (grandparent)
- When subcategory selected (no content) → subcategory green, category green (parent)
- When category selected (no subcategory/content) → category green only

**Implementation**:
```typescript
function getSelectionColor(
  itemId: string,
  itemType: 'category' | 'subcategory' | 'content'
): 'green' | 'gray' {
  // Direct selection
  if (itemType === 'category' && selectedCategory?.id === itemId) return 'green'
  if (itemType === 'subcategory' && selectedSubcategory?.id === itemId) return 'green'
  if (itemType === 'content' && selectedContent?.id === itemId) return 'green'
  
  // Hierarchy selection
  if (itemType === 'category') {
    // Category green if its subcategory is selected
    if (selectedSubcategory) {
      const subcat = subcategories.find(s => s.id === selectedSubcategory.id)
      if (subcat?.category_id === itemId) return 'green'
    }
  }
  
  if (itemType === 'subcategory') {
    // Subcategory green if its content is selected
    if (selectedContent) {
      if (selectedContent.subcategory_id === itemId) return 'green'
    }
  }
  
  return 'gray'
}
```

**Color Values**:
- Green (selected): `#00ff88`
- Gray (unselected): `#6b7280`
- Hover (all): `#e5e7eb`

**Collapsed State Exception** (Logic Doc lines 94-106):
- Category: Gray `#6b7280` (not green, even though in hierarchy)
- Subcategory: Gray `#6b7280` (not green, even though in hierarchy)
- Content: Green `#00ff88` (only content is green in collapsed)
- Rationale: Visual hierarchy emphasis on current content

---

### 5. Main Menu Filtering Logic

**Column 2 Filter** (Logic Doc line 169):
```typescript
const displayedSubcategories = useMemo(
  () => {
    if (!selectedCategory) return []
    return subcategories.filter(s => s.category_id === selectedCategory.id)
  },
  [subcategories, selectedCategory]
)
```
- **Rule**: Only show subcategories of selected category
- **Never**: Show all subcategories unfiltered

**Column 3 Filter** (Logic Doc line 170):
```typescript
const displayedContent = useMemo(
  () => {
    if (!selectedSubcategory) return []
    
    // Main Portfolio view: featured filter
    if (activeTab === 'portfolio') {
      return content.filter(c => 
        c.subcategory_id === selectedSubcategory.id &&
        c.featured === true &&
        c.byline_style !== null &&
        c.link_style !== null
      )
    }
    
    // Collection tab view: collection filter
    return content.filter(c => 
      c.subcategory_id === selectedSubcategory.id &&
      c.collection_slugs.includes(activeTab)
    )
  },
  [content, selectedSubcategory, activeTab]
)
```
- **Rule**: Only show content of selected subcategory
- **Main tab**: Apply featured filter (+ byline/link non-null)
- **Collection tab**: Apply collection membership filter
- **Never**: Show all content unfiltered

**Categories in Collection Tabs** (Logic Doc lines 164-166):
```typescript
const displayedCategories = useMemo(
  () => {
    if (activeTab === 'portfolio') {
      // Main view: all categories
      return categories
    }
    
    // Collection view: only categories with content in collection
    const collectionContentIds = content
      .filter(c => c.collection_slugs.includes(activeTab))
      .map(c => c.id)
    
    const collectionSubcategoryIds = new Set(
      content
        .filter(c => collectionContentIds.includes(c.id))
        .map(c => c.subcategory_id)
    )
    
    const collectionCategoryIds = new Set(
      subcategories
        .filter(s => collectionSubcategoryIds.has(s.id))
        .map(s => s.category_id)
    )
    
    return categories.filter(cat => collectionCategoryIds.has(cat.id))
  },
  [categories, subcategories, content, activeTab]
)
```
- **Rule**: Collection tabs only show categories that have content in that collection
- **Cascading**: Categories → subcategories → content all filtered by collection

---

### 6. Collections Menu Visibility Rules

**Vertical Layout (Expanded States)** (Logic Doc lines 257-258):
```typescript
const displayedCollections = useMemo(() => {
  if (pageState !== 'collapsed-reader') {
    // Expanded: show only featured collections
    return collections
      .filter(c => c.featured === true)
      .sort((a, b) => a.order_index - b.order_index)
  }
  // ... collapsed logic
}, [collections, pageState, selectedContent])
```
- **Trigger**: `expanded-empty` or `expanded-reader`
- **Rule**: Show only collections where `featured = true`
- **Order**: Ascending by `order_index` (10, 20, 30...)
- **Layout**: Vertical list (flex-col)

**Horizontal Layout (Collapsed State)** (Logic Doc lines 260-262):
```typescript
const displayedCollections = useMemo(() => {
  // ... expanded logic
  
  if (pageState === 'collapsed-reader') {
    // Collapsed: show collections linked to current content
    if (!selectedContent) return []
    
    return collections
      .filter(c => selectedContent.collection_slugs.includes(c.slug))
      .sort((a, b) => a.order_index - b.order_index)
      .reverse() // Smallest on right, larger on left
  }
}, [collections, pageState, selectedContent])
```
- **Trigger**: `collapsed-reader`
- **Rule**: Show only collections linked to `selectedContent`
- **Order**: Reversed (smallest order_index on right, larger on left)
- **Layout**: Horizontal row (flex-row-reverse)
- **Empty case**: If no collections linked, display empty space (no message)

---

### 7. Visual Reordering Logic

**Reordering Behavior** (Logic Doc lines 138-150):

**When Selection Changes**:
1. Selected item moves to top of its column
2. Items that were above selected item move below it
3. Items that were below selected item maintain relative order
4. Original `order_index` preserved in database (no writes)
5. Visual order only (frontend state)

**Example Transformation**:
```
Initial order: 1, 2, 3, 4, 5
User selects: 3
New visual order: 3, 4, 5, 1, 2

User then selects: 5
New visual order: 5, 1, 2, 3, 4
```

**Implementation**:
```typescript
const [categoriesOrder, setCategoriesOrder] = useState<string[]>([])
const [subcategoriesOrder, setSubcategoriesOrder] = useState<string[]>([])
const [contentOrder, setContentOrder] = useState<string[]>([])

function reorderColumn(
  items: any[],
  selectedId: string,
  currentOrder: string[]
): string[] {
  // If no order yet, use database order
  const ordered = currentOrder.length === 0 
    ? items.map(i => i.id)
    : currentOrder
  
  // Find selected item index
  const selectedIndex = ordered.indexOf(selectedId)
  if (selectedIndex === -1) return ordered // Not found, no change
  
  // Move selected to top, others maintain order
  const reordered = [
    selectedId, // Selected item first
    ...ordered.slice(selectedIndex + 1), // Items after selected
    ...ordered.slice(0, selectedIndex) // Items before selected
  ]
  
  return reordered
}

// Usage in handlers
function handleCategorySelect(category: Category) {
  setCategoriesOrder(reorderColumn(categories, category.id, categoriesOrder))
  // ... other state changes
}
```

**Animation Considerations** (Logic Doc line 149):
- Reordering triggers before state transition completes
- Must wait for reordering animation before selecting content
- Race condition: User rapidly clicks → animations overlap → state inconsistent
- Solution: Disable clicks during animation with `isAnimating` flag

---

### 8. State Persistence Patterns

**No Persistence Between Page Loads**:
- State resets to initial (`expanded-reader` with first items) on refresh
- No localStorage/sessionStorage for state
- No URL query params for state
- Rationale: Simplicity, users can navigate via Main menu

**Within-Session Persistence**:
- `activeCollections` array persists until tabs closed
- Last-selected content per collection persists (for tab switching)
- Visual reordering persists until page reload

**Implementation**:
```typescript
// Track last selection per collection
const [collectionSelections, setCollectionSelections] = useState<Record<string, string>>({})

function handleTabChange(tabId: string) {
  if (tabId === 'portfolio') {
    // Restore main Portfolio last selection
    // (already in selectedContent state)
  } else {
    // Restore collection's last selection
    const lastContentId = collectionSelections[tabId]
    if (lastContentId) {
      const content = contentArray.find(c => c.id === lastContentId)
      if (content) setSelectedContent(content)
    } else {
      // First visit to collection: select first item
      const firstItem = contentArray
        .filter(c => c.collection_slugs.includes(tabId))
        .sort((a, b) => a.order_index - b.order_index)[0]
      setSelectedContent(firstItem)
    }
  }
}

function handleContentSelect(content: ContentItem) {
  setSelectedContent(content)
  
  // Save to collection history if on collection tab
  if (activeTab !== 'portfolio' && activeTab !== 'resume' && activeTab !== 'downloads') {
    setCollectionSelections(prev => ({
      ...prev,
      [activeTab]: content.id
    }))
  }
}
```

---

### 9. Edge Cases & Error Handling

**Edge Case 1: Empty Database** (Logic Doc lines 176-179)
- **Scenario**: No categories in database
- **UI**: Display "No categories" in column 1, "No subcategories" in column 2, "No content" in column 3
- **State**: `expanded-empty` (cannot reach `expanded-reader` without content)

**Edge Case 2: Empty Subcategories** (Logic Doc line 178)
- **Scenario**: Category has no subcategories
- **UI**: Display "No subcategories" in column 2, column 3 empty
- **State**: `expanded-empty` (category selected, no subcategory to select)

**Edge Case 3: Empty Content** (Logic Doc line 179)
- **Scenario**: Subcategory has no content (or all content non-featured)
- **UI**: Display "No content" in column 3
- **State**: `expanded-empty` (subcategory selected, no content to select)

**Edge Case 4: Collection Becomes Empty** (Logic Doc line 253)
- **Scenario**: All content removed from collection after tab opened
- **Handling**: TBD during development
- **Options**:
  1. Close tab automatically and show message
  2. Display "Collection is now empty" in Main menu
  3. Keep tab open with empty state

**Edge Case 5: Content Deleted While Selected**
- **Scenario**: User has content selected, admin deletes it
- **Handling**: Next data refresh detects missing content
- **Action**: Auto-select next content in subcategory (or first if last deleted)

**Edge Case 6: Rapid Clicks During Animation**
- **Scenario**: User clicks multiple items quickly during reorder animation
- **Problem**: Animations overlap, state updates conflict
- **Solution**:
  ```typescript
  const [isAnimating, setIsAnimating] = useState(false)
  
  function handleItemClick(item: any) {
    if (isAnimating) return // Ignore clicks during animation
    
    setIsAnimating(true)
    // ... state updates and reordering ...
    
    setTimeout(() => setIsAnimating(false), 300) // Match animation duration
  }
  ```

---

### 10. State Machine Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        PAGE LOAD                            │
│                            ↓                                │
│                   expanded-reader                           │
│          (first category/subcategory/content selected)      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   Category Click      Content Click     Main Menu Click
   (Rule 1)            (Rule 3)          (if collapsed, Rule 4)
        │                   │                   │
        ↓                   ↓                   ↓
 ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
 │ expanded-    │    │ collapsed-   │    │ expanded-    │
 │ empty        │←───│ reader       │───→│ reader       │
 │              │    │              │    │              │
 └──────────────┘    └──────────────┘    └──────────────┘
        │                   ↑                   │
        │                   │                   │
 Subcategory Click    Content Click      Content Click
 (Rule 2)             (Rule 3)           (Rule 3)
        │                   │                   │
        ↓                   │                   ↓
 ┌──────────────┐           │            ┌──────────────┐
 │ expanded-    │           │            │ collapsed-   │
 │ empty        │           └────────────│ reader       │
 │ (subcat now  │                        │              │
 │  selected)   │                        └──────────────┘
 └──────────────┘
        │
 Content Click
 (Rule 3)
        │
        ↓
 ┌──────────────┐
 │ collapsed-   │
 │ reader       │
 │              │
 └──────────────┘

Collection Click (Rules 5-6):
  From any state → expanded-reader (collection tab)
  
Tab Change (Rules 7-8):
  Collection tab → expanded-reader (filtered)
  Main tabs → expanded-reader (unfiltered)
  
Tab Close (Rule 9):
  Collection tab → expanded-reader (portfolio tab)
```

---

### 11. State Machine Implementation Code

**Complete State Transition Handler**:
```typescript
function handleStateTransition(
  trigger: 'category' | 'subcategory' | 'content' | 'menu' | 'collection' | 'tab',
  data: any
) {
  switch (trigger) {
    case 'category':
      if (pageState !== 'collapsed-reader' && selectedCategory?.id === data.id) {
        return // No change if already selected in expanded state
      }
      setSelectedCategory(data)
      setSelectedSubcategory(null)
      setSelectedContent(null)
      setPageState('expanded-empty')
      setCategoriesOrder(reorderColumn(categories, data.id, categoriesOrder))
      break
      
    case 'subcategory':
      if (pageState !== 'collapsed-reader' && selectedSubcategory?.id === data.id) {
        return // No change if already selected in expanded state
      }
      setSelectedSubcategory(data)
      setSelectedContent(null)
      setPageState('expanded-empty')
      setSubcategoriesOrder(reorderColumn(subcategories, data.id, subcategoriesOrder))
      break
      
    case 'content':
      if (pageState !== 'collapsed-reader' && selectedContent?.id === data.id) {
        return // No change if already selected in expanded state
      }
      setSelectedContent(data)
      setPageState('collapsed-reader')
      setContentOrder(reorderColumn(content, data.id, contentOrder))
      break
      
    case 'menu':
      if (pageState === 'collapsed-reader') {
        setPageState('expanded-reader') // Expand without changing selection
      }
      break
      
    case 'collection':
      // Add to activeCollections if not already there
      if (!activeCollections.some(c => c.slug === data.slug)) {
        setActiveCollections(prev => [...prev, { slug: data.slug, name: data.name }])
      }
      setActiveTab(data.slug)
      setPageState('expanded-reader')
      // Auto-select first content in collection (handled by useEffect)
      break
      
    case 'tab':
      setActiveTab(data.tabId)
      if (data.tabId === 'portfolio' || data.tabId.startsWith('collection-')) {
        setPageState('expanded-reader')
      }
      // Restore selection for tab (handled by useEffect)
      break
  }
}
```

---

### Stage 5 Summary

**State Machine Documented**: 3 states with complete definitions
**Transition Rules**: 9 rules with triggers, state changes, UI changes
**Visibility Matrix**: Complete matrix for 6 components across 3 states
**Selection Logic**: Hierarchy color coding with 3 rules
**Filtering Logic**: Main menu columns 2-3, collection tab filtering
**Collections Menu**: Vertical vs horizontal visibility rules
**Visual Reordering**: Selection-triggered reordering with animation handling
**Edge Cases**: 6 documented with handling strategies
**State Persistence**: Within-session persistence for collections and selections
**Implementation**: Complete code examples for all handlers

**Next Stage**: Data Loading & Transformation (Stage 6) will document Supabase queries, data transformation pipeline, and loading sequence.

---

*End of Stage 5*

---

## STAGE 6: DATA LOADING & TRANSFORMATION

### Purpose

Document complete Supabase query strategy, data transformation pipeline, and loading sequence. Establishes how raw database data becomes frontend-ready state with all joins, filters, and computed fields.

**Usage**: Reference during Phase 2 (Data Loading) implementation, use query patterns for Supabase calls, follow transformation pipeline for data processing.

---

### 1. Loading Sequence & Dependencies

**Load Order** (Phase 2 Step 2.2-2.5):

```
1. Categories & Subcategories (parallel, no dependencies)
   ↓
2. Dropdown Options (parallel: byline_options + link_options)
   ↓
3. Content (depends on categories/subcategories/options for joins)
   ↓
4. Collections (parallel with content, uses content for empty validation)
   ↓
5. Auto-Selection (first category → subcategory → content)
   ↓
6. Set pageState to 'expanded-reader'
   ↓
7. Render
```

**Rationale for Order**:
- Categories/subcategories first: needed for content filtering
- Dropdown options before content: needed for joins to get text labels
- Content after options: requires joins to byline_options and link_options
- Collections parallel with content: independent, can load simultaneously
- Auto-selection last: requires all data loaded to find first items

---

### 2. Supabase Query Specifications

**Query 1: Load Categories** (Phase 2 Step 2.2)

```typescript
async function loadCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, order_index')
    .order('order_index', { ascending: true })
  
  if (error) throw new Error(`Failed to load categories: ${error.message}`)
  return data || []
}
```

**Fields**: `id`, `name`, `order_index`
**Filter**: None (load all)
**Order**: `order_index` ascending
**Return**: `Category[]`

---

**Query 2: Load Subcategories** (Phase 2 Step 2.2)

```typescript
async function loadSubcategories(): Promise<Subcategory[]> {
  const { data, error } = await supabase
    .from('subcategories')
    .select('id, name, order_index, category_id')
    .order('order_index', { ascending: true })
  
  if (error) throw new Error(`Failed to load subcategories: ${error.message}`)
  return data || []
}
```

**Fields**: `id`, `name`, `order_index`, `category_id` (FK)
**Filter**: None (load all, filtering done frontend)
**Order**: `order_index` ascending
**Return**: `Subcategory[]`

---

**Query 3: Load Byline Options** (Phase 2 Step 2.3)

```typescript
async function loadBylineOptions(): Promise<BylineOption[]> {
  const { data, error } = await supabase
    .from('byline_options')
    .select('id, option_text, created_at')
    .order('created_at', { ascending: true })
  
  if (error) throw new Error(`Failed to load byline options: ${error.message}`)
  return data || []
}
```

**Fields**: `id`, `option_text`, `created_at`
**Filter**: None (load all)
**Order**: `created_at` ascending (chronological for admin UI)
**Return**: `BylineOption[]`

---

**Query 4: Load Link Options** (Phase 2 Step 2.3)

```typescript
async function loadLinkOptions(): Promise<LinkOption[]> {
  const { data, error } = await supabase
    .from('link_options')
    .select('id, option_text, created_at')
    .order('created_at', { ascending: true })
  
  if (error) throw new Error(`Failed to load link options: ${error.message}`)
  return data || []
}
```

**Fields**: `id`, `option_text`, `created_at`
**Filter**: None (load all)
**Order**: `created_at` ascending
**Return**: `LinkOption[]`

---

**Query 5: Load Content with Joins** (Phase 2 Step 2.3)

```typescript
async function loadContent(): Promise<ContentItemRaw[]> {
  const { data, error } = await supabase
    .from('content')
    .select(`
      id,
      title,
      subtitle,
      sidebar_title,
      sidebar_subtitle,
      type,
      content_body,
      image_url,
      video_url,
      audio_url,
      publication_name,
      publication_date,
      author_name,
      source_link,
      featured,
      order_index,
      subcategory_id,
      byline_style,
      link_style,
      categories(id, name),
      subcategories(id, name, category_id),
      byline_options(id, option_text),
      link_options(id, option_text),
      content_collections(collection_id, collections(slug, name))
    `)
    .eq('featured', true) // Only featured content
    .not('byline_style', 'is', null) // Byline required
    .not('link_style', 'is', null) // Link required
    .order('order_index', { ascending: true })
  
  if (error) throw new Error(`Failed to load content: ${error.message}`)
  return data || []
}
```

**Fields**: All content fields + nested joins
**Joins**:
- `categories` via subcategory → category relationship
- `subcategories` direct FK
- `byline_options` via `byline_style` FK
- `link_options` via `link_style` FK
- `content_collections` join table → `collections` for linked collections

**Filters** (Logic Doc lines 381-386):
- `featured = true`
- `byline_style IS NOT NULL`
- `link_style IS NOT NULL`

**Order**: `order_index` ascending
**Return**: `ContentItemRaw[]` (needs transformation)

---

**Query 6: Load All Collections** (Phase 2 Step 2.4)

```typescript
async function loadCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      id,
      name,
      description,
      slug,
      order_index,
      featured
    `)
    .order('order_index', { ascending: true })
  
  if (error) throw new Error(`Failed to load collections: ${error.message}`)
  return data || []
}
```

**Fields**: `id`, `name`, `description` (JSONB), `slug`, `order_index`, `featured`
**Filter**: None (load all, filtering for display done frontend)
**Order**: `order_index` ascending
**Return**: `Collection[]`

**Note**: Featured filter applied frontend, not in query (need all collections for collection tabs)

---

### 3. Data Transformation Pipeline

**Transformation Step 1: Extract Publication Year**

```typescript
function extractPublicationYear(publication_date: string | null): number | null {
  if (!publication_date) return null
  
  // publication_date format: "YYYY-MM-DD" or "Month YYYY"
  const yearMatch = publication_date.match(/\d{4}/)
  return yearMatch ? parseInt(yearMatch[0], 10) : null
}
```

**Usage**: Computed field for `ContentItem.publication_year`
**Input**: `publication_date` string
**Output**: 4-digit year number or null

---

**Transformation Step 2: Flatten Nested Joins**

```typescript
function transformContentItem(raw: ContentItemRaw): ContentItem {
  return {
    // Direct fields (pass through)
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle,
    sidebar_title: raw.sidebar_title,
    sidebar_subtitle: raw.sidebar_subtitle,
    type: raw.type,
    content_body: raw.content_body,
    image_url: raw.image_url,
    video_url: raw.video_url,
    audio_url: raw.audio_url,
    publication_name: raw.publication_name,
    publication_date: raw.publication_date,
    author_name: raw.author_name,
    source_link: raw.source_link,
    featured: raw.featured,
    order_index: raw.order_index,
    subcategory_id: raw.subcategory_id,
    byline_style: raw.byline_style,
    link_style: raw.link_style,
    
    // Computed: publication year
    publication_year: extractPublicationYear(raw.publication_date),
    
    // Flattened: dropdown option texts
    byline_style_text: raw.byline_options?.option_text || '',
    link_style_text: raw.link_options?.option_text || '',
    
    // Flattened: category/subcategory names
    category_name: raw.categories?.name || '',
    subcategory_name: raw.subcategories?.name || '',
    
    // Transformed: collection arrays
    collection_slugs: raw.content_collections?.map(cc => cc.collections.slug) || [],
    collection_names: raw.content_collections?.map(cc => cc.collections.name) || []
  }
}
```

**Input**: `ContentItemRaw` with nested joins
**Output**: `ContentItem` with flattened structure
**Transformations**:
1. Pass through all direct fields
2. Extract year from `publication_date`
3. Flatten `byline_options.option_text` to `byline_style_text`
4. Flatten `link_options.option_text` to `link_style_text`
5. Flatten `categories.name` to `category_name`
6. Flatten `subcategories.name` to `subcategory_name`
7. Map `content_collections` array to `collection_slugs` and `collection_names` arrays

---

**Transformation Step 3: Process All Content**

```typescript
async function loadAndTransformContent(): Promise<ContentItem[]> {
  const rawContent = await loadContent()
  return rawContent.map(transformContentItem)
}
```

**Pipeline**:
1. Fetch raw data with joins from Supabase
2. Transform each item individually
3. Return array of frontend-ready `ContentItem` objects

---

### 4. Auto-Selection Logic

**Auto-Selection Sequence** (Phase 2 Step 2.5):

```typescript
async function autoSelectInitialContent(
  categories: Category[],
  subcategories: Subcategory[],
  content: ContentItem[]
): Promise<{
  selectedCategory: Category | null
  selectedSubcategory: Subcategory | null
  selectedContent: ContentItem | null
}> {
  // Step 1: Select first category by order_index
  const firstCategory = categories.sort((a, b) => a.order_index - b.order_index)[0]
  if (!firstCategory) {
    return { selectedCategory: null, selectedSubcategory: null, selectedContent: null }
  }
  
  // Step 2: Select first subcategory of that category
  const firstSubcategory = subcategories
    .filter(s => s.category_id === firstCategory.id)
    .sort((a, b) => a.order_index - b.order_index)[0]
  if (!firstSubcategory) {
    return { selectedCategory: firstCategory, selectedSubcategory: null, selectedContent: null }
  }
  
  // Step 3: Select first content of that subcategory
  const firstContent = content
    .filter(c => c.subcategory_id === firstSubcategory.id)
    .sort((a, b) => a.order_index - b.order_index)[0]
  if (!firstContent) {
    return { selectedCategory: firstCategory, selectedSubcategory: firstSubcategory, selectedContent: null }
  }
  
  // All selections made
  return {
    selectedCategory: firstCategory,
    selectedSubcategory: firstSubcategory,
    selectedContent: firstContent
  }
}
```

**Logic** (Logic Doc lines 235-239):
1. Sort categories by `order_index` ascending, take first
2. Filter subcategories by `category_id`, sort by `order_index`, take first
3. Filter content by `subcategory_id`, sort by `order_index`, take first
4. If any step fails (empty array), return null for that level and below

**Initial State**:
- If all selections made: `pageState = 'expanded-reader'`
- If content missing: `pageState = 'expanded-empty'` (Edge Case 3)
- If subcategory missing: `pageState = 'expanded-empty'` (Edge Case 2)
- If category missing: `pageState = 'expanded-empty'` (Edge Case 1)

---

### 5. Complete Data Loading Implementation

**Full useEffect Pattern** (Phase 2):

```typescript
useEffect(() => {
  async function loadAllData() {
    try {
      setIsLoading(true)
      setError(null)
      
      // Step 1: Load categories and subcategories in parallel
      const [categoriesData, subcategoriesData] = await Promise.all([
        loadCategories(),
        loadSubcategories()
      ])
      
      // Step 2: Load dropdown options in parallel
      const [bylineOptionsData, linkOptionsData] = await Promise.all([
        loadBylineOptions(),
        loadLinkOptions()
      ])
      
      // Step 3: Load content (depends on options for joins)
      const rawContent = await loadContent()
      const contentData = rawContent.map(transformContentItem)
      
      // Step 4: Load collections (parallel, independent)
      const collectionsData = await loadCollections()
      
      // Step 5: Auto-select first items
      const { selectedCategory, selectedSubcategory, selectedContent } = 
        await autoSelectInitialContent(categoriesData, subcategoriesData, contentData)
      
      // Step 6: Update all state
      setCategories(categoriesData)
      setSubcategories(subcategoriesData)
      setContent(contentData)
      setCollections(collectionsData)
      setBylineOptions(bylineOptionsData)
      setLinkOptions(linkOptionsData)
      setSelectedCategory(selectedCategory)
      setSelectedSubcategory(selectedSubcategory)
      setSelectedContent(selectedContent)
      
      // Step 7: Set page state based on selections
      if (selectedContent) {
        setPageState('expanded-reader') // Normal: content selected
      } else {
        setPageState('expanded-empty') // Edge case: no content
      }
      
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      setIsLoading(false)
    }
  }
  
  loadAllData()
}, []) // Empty deps: run once on mount
```

**Error Handling**:
- Try-catch wraps entire loading sequence
- Error state set if any query fails
- Loading state cleared on success or error
- Component should render error UI if `error !== null`

**Loading State UI** (while `isLoading === true`):
```typescript
if (isLoading) {
  return <div className="flex items-center justify-center h-screen">Loading...</div>
}

if (error) {
  return <div className="flex items-center justify-center h-screen text-red-500">
    Error: {error}
  </div>
}
```

---

### 6. Collection Content Filtering

**Filter for Collection Tabs** (Phase 5 Step 5.1):

```typescript
function filterContentByCollection(
  content: ContentItem[],
  collectionSlug: string
): ContentItem[] {
  return content.filter(c => c.collection_slugs.includes(collectionSlug))
}

function filterCategoriesByCollection(
  categories: Category[],
  subcategories: Subcategory[],
  content: ContentItem[],
  collectionSlug: string
): Category[] {
  // Get content in collection
  const collectionContent = filterContentByCollection(content, collectionSlug)
  
  // Get subcategories that have content in collection
  const subcategoryIds = new Set(collectionContent.map(c => c.subcategory_id))
  
  // Get categories that have those subcategories
  const categoryIds = new Set(
    subcategories
      .filter(s => subcategoryIds.has(s.id))
      .map(s => s.category_id)
  )
  
  return categories.filter(cat => categoryIds.has(cat.id))
}

function filterSubcategoriesByCollection(
  subcategories: Subcategory[],
  content: ContentItem[],
  collectionSlug: string,
  categoryId: string
): Subcategory[] {
  // Get content in collection
  const collectionContent = filterContentByCollection(content, collectionSlug)
  
  // Get subcategories in this category that have content
  const subcategoryIds = new Set(collectionContent.map(c => c.subcategory_id))
  
  return subcategories.filter(s => 
    s.category_id === categoryId && subcategoryIds.has(s.id)
  )
}
```

**Usage in State**:
```typescript
const displayedCategories = useMemo(() => {
  if (activeTab === 'portfolio') {
    return categories // All categories
  }
  return filterCategoriesByCollection(categories, subcategories, content, activeTab)
}, [categories, subcategories, content, activeTab])

const displayedSubcategories = useMemo(() => {
  if (!selectedCategory) return []
  
  if (activeTab === 'portfolio') {
    // Main view: all subcategories of category
    return subcategories.filter(s => s.category_id === selectedCategory.id)
  }
  
  // Collection view: filtered subcategories
  return filterSubcategoriesByCollection(
    subcategories,
    content,
    activeTab,
    selectedCategory.id
  )
}, [subcategories, content, activeTab, selectedCategory])

const displayedContent = useMemo(() => {
  if (!selectedSubcategory) return []
  
  if (activeTab === 'portfolio') {
    // Main view: featured filter
    return content.filter(c => 
      c.subcategory_id === selectedSubcategory.id &&
      c.featured === true
    )
  }
  
  // Collection view: collection filter
  return content.filter(c =>
    c.subcategory_id === selectedSubcategory.id &&
    c.collection_slugs.includes(activeTab)
  )
}, [content, selectedSubcategory, activeTab])
```

---

### 7. Data Refresh Strategy

**When to Refresh** (Future Enhancement):
- Initial page load (implemented in Phase 2)
- Manual refresh button (optional, Phase 7+)
- Real-time subscriptions (optional, Phase 7+)

**Supabase Real-Time Subscriptions** (Optional):
```typescript
useEffect(() => {
  // Subscribe to content changes
  const contentSubscription = supabase
    .channel('content-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'content' },
      (payload) => {
        // Reload content when changes detected
        loadAndTransformContent().then(setContent)
      }
    )
    .subscribe()
  
  // Subscribe to categories changes
  const categoriesSubscription = supabase
    .channel('categories-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'categories' },
      () => loadCategories().then(setCategories)
    )
    .subscribe()
  
  // Cleanup on unmount
  return () => {
    contentSubscription.unsubscribe()
    categoriesSubscription.unsubscribe()
  }
}, [])
```

**Note**: Real-time subscriptions optional, not required for MVP

---

### 8. Query Optimization Considerations

**Optimization 1: Single Query vs Multiple**
- **Current**: 6 separate queries (categories, subcategories, options x2, content, collections)
- **Alternative**: Single query with all joins
- **Decision**: Keep separate for clarity and error isolation
- **Rationale**: Queries are fast, complexity not worth performance gain

**Optimization 2: Frontend Filtering vs Backend**
- **Subcategories**: Load all, filter frontend (simple FK filter)
- **Content**: Backend filter for featured (reduces payload significantly)
- **Collections**: Load all, filter frontend (need all for collection tabs)
- **Rationale**: Backend filtering only for expensive operations

**Optimization 3: Caching**
- **Categories/Subcategories**: Rarely change, could cache in localStorage
- **Content**: Frequently updated, no cache
- **Collections**: Infrequently changed, could cache
- **Decision**: No caching in MVP, add if performance issues

**Optimization 4: Pagination**
- **Current**: Load all content at once
- **Alternative**: Paginate content items
- **Decision**: No pagination in MVP
- **Threshold**: Consider pagination if >100 content items
- **Rationale**: Featured filter + subcategory filtering keeps counts low

---

### 9. Error Recovery Patterns

**Pattern 1: Partial Data Load**
```typescript
// If some queries fail, still render with available data
const [categoriesData, subcategoriesData] = await Promise.allSettled([
  loadCategories(),
  loadSubcategories()
])

const categories = categoriesData.status === 'fulfilled' ? categoriesData.value : []
const subcategories = subcategoriesData.status === 'fulfilled' ? subcategoriesData.value : []

// Continue with available data, show warnings for failed queries
```

**Pattern 2: Retry on Failure**
```typescript
async function loadWithRetry<T>(
  loadFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await loadFn()
    } catch (err) {
      if (attempt === maxRetries) throw err
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded')
}

// Usage
const categories = await loadWithRetry(loadCategories)
```

**Pattern 3: Stale Data Fallback**
```typescript
// Keep previous data in state if refresh fails
try {
  const newData = await loadContent()
  setContent(newData)
} catch (err) {
  // Keep existing content, show error toast
  showToast('Failed to refresh content, showing cached data')
}
```

**Decision for MVP**: Use Pattern 1 (allSettled for partial loads), skip retry/fallback complexity

---

### 10. Database Schema Summary

**Required Tables** (from Stage 1):

1. **`categories`**:
   - `id` (UUID, PK)
   - `name` (TEXT, NOT NULL)
   - `order_index` (INTEGER, NOT NULL)
   - `created_at`, `updated_at` (timestamps)

2. **`subcategories`**:
   - `id` (UUID, PK)
   - `name` (TEXT, NOT NULL)
   - `order_index` (INTEGER, NOT NULL)
   - `category_id` (UUID, FK → categories.id)
   - `created_at`, `updated_at` (timestamps)

3. **`content`**:
   - `id` (UUID, PK)
   - `title` (TEXT, NOT NULL)
   - `subtitle` (TEXT, NULL)
   - `sidebar_title` (TEXT, NULL)
   - `sidebar_subtitle` (TEXT, NULL)
   - `type` (TEXT, NOT NULL, CHECK IN ('article', 'image', 'video', 'audio'))
   - `content_body` (JSONB, NULL) -- EditorJS for article
   - `image_url` (TEXT, NULL) -- Cloudinary for image
   - `video_url` (TEXT, NULL) -- YouTube or video URL
   - `audio_url` (TEXT, NULL) -- mp3/audio URL
   - `publication_name` (TEXT, NULL)
   - `publication_date` (TEXT, NULL)
   - `author_name` (TEXT, NULL)
   - `source_link` (TEXT, NULL)
   - `featured` (BOOLEAN, NOT NULL, DEFAULT false)
   - `order_index` (INTEGER, NOT NULL)
   - `subcategory_id` (UUID, FK → subcategories.id)
   - `byline_style` (UUID, FK → byline_options.id, NOT NULL)
   - `link_style` (UUID, FK → link_options.id, NOT NULL)
   - `created_at`, `updated_at` (timestamps)

4. **`collections`**:
   - `id` (UUID, PK)
   - `name` (TEXT, NOT NULL)
   - `description` (JSONB, NULL)
   - `slug` (TEXT, NOT NULL, UNIQUE) -- For tab IDs
   - `order_index` (INTEGER, NOT NULL)
   - `featured` (BOOLEAN, NOT NULL, DEFAULT false)
   - `created_at`, `updated_at` (timestamps)

5. **`content_collections`** (Join Table):
   - `content_id` (UUID, FK → content.id)
   - `collection_id` (UUID, FK → collections.id)
   - PRIMARY KEY (`content_id`, `collection_id`)

6. **`byline_options`**:
   - `id` (UUID, PK)
   - `option_text` (TEXT, NOT NULL)
   - `created_at` (timestamp)

7. **`link_options`**:
   - `id` (UUID, PK)
   - `option_text` (TEXT, NOT NULL)
   - `created_at` (timestamp)

**SQL Creation Scripts**: Available in Phase 1 implementation (Step 1.1)

---

### 11. Data Flow Summary Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                        │
├─────────────────────────────────────────────────────────────┤
│ categories │ subcategories │ content │ collections │ ...    │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   Query Categories   Query Options      Query Content
   Query Subcategories  (byline/link)   (with joins)
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ↓
              ┌─────────────────────────┐
              │  Data Transformation    │
              │  - Extract year         │
              │  - Flatten joins        │
              │  - Map collections      │
              └─────────────────────────┘
                            ↓
              ┌─────────────────────────┐
              │   Auto-Selection Logic  │
              │   - First category      │
              │   - First subcategory   │
              │   - First content       │
              └─────────────────────────┘
                            ↓
              ┌─────────────────────────┐
              │   State Updates         │
              │   - setCategories       │
              │   - setContent          │
              │   - setSelected...      │
              │   - setPageState        │
              └─────────────────────────┘
                            ↓
              ┌─────────────────────────┐
              │   Computed State        │
              │   (useMemo)             │
              │   - featuredCollections │
              │   - displayedSubcats    │
              │   - displayedContent    │
              └─────────────────────────┘
                            ↓
              ┌─────────────────────────┐
              │   Props to Children     │
              │   - MainMenu            │
              │   - CollectionsMenu     │
              │   - ContentReader       │
              └─────────────────────────┘
                            ↓
                      RENDER UI
```

---

### Stage 6 Summary

**Loading Sequence**: 7-step sequential/parallel load strategy
**Supabase Queries**: 6 complete query specifications with filters and joins
**Data Transformation**: 3-step pipeline (year extraction, join flattening, collection mapping)
**Auto-Selection**: Complete logic for initial category/subcategory/content selection
**Complete Implementation**: Full useEffect pattern with error handling and loading states
**Collection Filtering**: Complete filtering functions for collection tabs
**Data Refresh**: Strategy documented (real-time optional, manual refresh future)
**Query Optimization**: 4 optimization considerations with decisions
**Error Recovery**: 3 patterns documented (allSettled chosen for MVP)
**Database Schema**: Complete 7-table schema summary with field specifications
**Data Flow**: Complete diagram from Supabase to render

**Step 0.1 Complete**: All 6 stages finished. Technical reference document is now locked and ready for implementation reference during Phases 1-6.

---

*End of Stage 6*

---

## TECHNICAL REFERENCE DOCUMENT COMPLETE

This document (`portfolio-tech-ref.md`) contains complete technical specifications for Portfolio tab development across 6 stages:

1. **Stage 1**: Dependency Analysis & Overview (~290 lines)
2. **Stage 2**: TypeScript Type Definitions (~700 lines)
3. **Stage 3**: Mock Data Samples (~820 lines)
4. **Stage 4**: Component Architecture & Structure (~1140 lines)
5. **Stage 5**: State Machine & Transition Logic (~695 lines)
6. **Stage 6**: Data Loading & Transformation (~700 lines)

**Total**: ~4345 lines of comprehensive technical documentation

**Status**: LOCKED for reference
**Usage**: Reference by line numbers throughout Phases 0-6
**Updates**: No further updates planned (frozen reference)

**Next Step**: Step 0.2 (EditorJS Plugin Updates) in Phase 0

---

*End of Technical Reference Document*