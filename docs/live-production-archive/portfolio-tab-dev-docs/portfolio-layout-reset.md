# Portfolio Layout Reset – Phase 6 Guiding Document

This document is the **guiding document for Phase 6: Layout Frame**.  
We keep all backend work and core logic from Phases 0-5, and we reset the visual layout (what is on the screen and how it is positioned).

The goal is to escape the "whack‑a‑mole" of pixel tweaks and start again from a clean, simple description of how the page should be stacked and behave when scrolling.

**Status**: Phases 0-5 complete. All components built and functional. Ready for Phase 6 layout reset.

---

## 1. What We Are Keeping (Safe Foundations - Phases 0-5 Complete)

These parts of the existing system are considered **safe and valuable**; we will **not** throw them away.

### Phase 0-1: Database and Admin ✅ COMPLETE
  - New tables: `byline_options`, `link_options`.
  - New fields: `featured`, `byline_style`, `link_style` on `content`; `featured` on `collections`.
  - Admin UI changes for categories, subcategories, collections, and dropdown management.
  - Result: backend can already store everything the Portfolio needs.

### Phase 2: Core Data Model and Queries ✅ COMPLETE
  - Types for `Category`, `Subcategory`, `ContentItem`, `Collection`, dropdown options, etc.
  - Supabase queries:
    - Load categories and subcategories.
    - Load featured content with `byline_style` and `link_style` not null.
    - Load collections.
  - Transformation pipeline: turning raw records with joins into `ContentItem` objects (flattened names, year extraction, collection slugs, etc.).
- State management: `pageState`, `selectedCategory`, `selectedSubcategory`, `selectedContent`, `activeCollections`, `activeTab`.

### Phase 3: Main Menu Navigation ✅ COMPLETE
- **MainMenu component** (`components/tabs/MainMenu.tsx`): Three-column layout (categories → subcategories → content), filtered by selection.
- Hierarchical filtering: `displayedSubcategories` and `displayedContent` useMemo hooks.
- Selection and color coding: Green for selected, gray for unselected, hierarchy logic.
- Expand/collapse behavior: Collapsed state shows breadcrumb row, expanded shows three columns.
- Column width constraints: 25-character limit on columns 1-2, unlimited on column 3.

### Phase 4: Content Display ✅ COMPLETE
- **ContentReader component** (`components/ContentReader.tsx`): Displays selected content (article/image/video/audio).
  - All 4 content types rendering: Article (EditorRenderer), Image (img tag), Video (YouTube iframe or HTML5 video), Audio (HTML5 audio player).
  - Title and subtitle display working.
  - Visibility logic: Only shown in reader states (`expanded-reader`, `collapsed-reader`).
- **InfoMenu component** (`components/InfoMenu.tsx`): Displays metadata for selected content.
  - Three-line structure: Publication/Date, Byline/Author, Link/Source.
  - Color coding: Labels emerald green (#00ff88), values gray (#9ca3af).
  - Fixed positioning: `top: 75%`, `left: 2.5%` (adjusted to prevent Main Menu overlap).
  - Database field extraction: `byline_style_text` and `link_style_text` from dropdown options.

### Phase 5: Collections System ✅ COMPLETE
- **CollectionsMenu component** (`components/tabs/CollectionsMenu.tsx`): Displays collections list.
  - Visibility rules: Featured collections in expanded states, linked collections in collapsed state.
  - Layout switching: Vertical list (expanded) ↔ horizontal row (collapsed).
  - Collection click handler: Opens collection tabs, appends to `activeCollections` array.
- **Collection tab filtering**: Main menu filters by active collection tab.
  - `filteredContent`, `filteredSubcategories`, `filteredCategories` useMemo hooks.
  - Cascading filters: Content → Subcategories → Categories.
- **Collection tab content selection**: Auto-selects content when collection tab opens.
- **Collection tab closing**: Removes from `activeCollections`, switches to 'portfolio' if closing active tab.
- **Multiple collections support**: Multiple tabs can be open simultaneously, switching works correctly.

### High-Level Page Logic (State Machine) ✅ COMPLETE
- Three states: `expanded-empty`, `expanded-reader`, `collapsed-reader`.
  - Rules (in plain language):
    - Click category/subcategory → menus expanded, Content Reader closed.
    - Click content → menus collapsed, Content Reader visible.
    - Click collapsed menu bar → menus expand again, same selection.
  - Collections open in their own "collection tab" and filter the Main menu.

All of this stays. We are **not** undoing the database work, query/filter rules, state machine, or component functionality.

---

## 2. What We Are Treating as "Bad / Outdated Layout"

These parts are where the scrolling and stickiness bugs live. They will be **replaced** by a new layout design.

### Current Layout Problems (Documented in `portfolio-4.1fix.md`)

- **All vh‑based layout math** in the current plan and code:
  - `top: calc(33vh + 3rem)` for the Main menu (PortfolioTab.tsx line 549).
  - `marginTop: calc(45vh - 33vh - 3rem ± …)` for the Content Reader (ContentReader.tsx line 67).
  - Any logic that tries to "hard‑code" the mockup using `vh` and large `calc()` formulas.
  - **Problem**: Menu position changes with window height, feels "crooked" on different screens.

- **Content Reader positioning issues**:
  - Initial placement too low (Bug #1 - fixed by adjusting marginTop).
  - Content scrolls under sticky Main menu (Bug #2 - multiple failed fix attempts).
  - Failed solutions: paddingTop approach (padding scrolls with content), position:fixed wrapper (breaks container height), clip-path (container-relative vs viewport-relative conflict).

- **All "masking / clipping / overlay" experiments**:
  - Fixed overlay divs placed between Profile and Main menu.
  - Dynamic `clipPath` or CSS masks inside `ContentReader` or around it.
  - Extra background veils intended to hide text under the menu.
  - **Result**: All failed - cannot prevent viewport-relative content from scrolling under viewport-relative sticky menu using container-relative clipping.

- **Any coupling of layout to specific measured pixels**:
  - The "566.44px" and similar numbers from earlier debugging.
  - Detailed Bug #1 / Bug #2 padding + margin compensation formulas.
  - Complex calculations trying to align container-relative elements with viewport-relative boundaries.

### Root Cause Analysis

**The fundamental conflict** (from `portfolio-4.1fix.md`):
- **Menu**: Viewport-relative (sticky at `calc(33vh + 3rem)`) - stays in place during scroll.
- **ContentReader**: Container-relative (normal flow) - scrolls with page.
- **Requirement**: Clip content at viewport-relative position without breaking container height.
- **Why this is difficult**: CSS clipping/masking is typically container-relative. Viewport-relative positioning (`position: fixed`) breaks container height. Need viewport-relative clipping that maintains container height.

**Solution**: Reset to simple vertical stacking - Profile sticky at top, Main Menu sticky directly under Profile (using Profile height measurement, not vh), Content Reader in normal flow below Main Menu, browser scrollbar handles scrolling.

We will still **reference** these experiments in `portfolio-planning.md` and `portfolio-4.1fix.md` as history, but we will **not reuse their layout rules**.

---

## 3. Frontend Pieces to Remove / Reset in the Page

This section describes, in simple terms, which visible pieces of the current page we plan to **tear down** and rebuild, and which ones we will keep.

### 3.1. Elements to Remove or Consider "Wiped" (for Layout)

These items are not safe in their current form on the **front page**; they will be removed or rebuilt as part of a new layout frame:

- **Main menu layout in `PortfolioTab.tsx`** (lines 546-564):
  - The current sticky wrapper around `MainMenu` with `top: calc(33vh + 3rem)` (line 549).
  - The way it is embedded inside nested flex containers (`max-w-[1280px]`, `flex`, `items-start`, etc.).
  - The dynamic `profileHeight` measurement approach (lines 128-130, 914, 956) that still uses vh-based positioning.
  - In the reset, we will treat MainMenu as a **pure menu component** and decide fresh **where and how** to place it on the page.
  - **New approach**: Main Menu sticky directly under Profile using Profile height measurement (not vh).

- **Current Content Reader layout** (`ContentReader.tsx`):
  - The current combination of:
    - Large `marginTop` formulas tied to `vh` (line 67: `calc(45vh - 33vh - 3rem - 257px)`).
    - The fixed `0px` top padding (line 89, changed from 295px after failed fixes).
    - Overlays and masks experiments (all removed after failures).
  - In the reset, we will keep the **ContentReader component** and all its type‑handling logic, but we will rebuild **where it lives** on the page and how it scrolls.
  - **New approach**: Content Reader in normal flow below Main Menu, browser scrollbar handles scrolling.

- **Info menu positioning** (`InfoMenu.tsx`):
  - The current fixed `top: 75%, left: 2.5%` implementation (adjusted from 50% to prevent Main Menu overlap).
  - In the reset, we will keep the InfoMenu component, but we will decide its position after we define the new vertical stack.
  - **New approach**: Position Info Menu relative to Content Reader area, stays fixed while Content Reader scrolls.

- **Collections Menu positioning** (`CollectionsMenu.tsx`):
  - Current positioning in PortfolioTab (lines 669-681): Right side with sticky positioning.
  - In the reset, we will keep the CollectionsMenu component, but we will decide its position after we define the new vertical stack.
  - **New approach**: Position Collections Menu on right side with proper spacing from Content Reader.

- **All layout glue in `PortfolioTab` that depends on the old mockup math**:
  - Any wrappers whose only purpose is to realize the original Figma pixel positioning (using `vh` and complex `calc()`).
  - The nested flex containers and max-width constraints that create the current layout structure.
  - These wrappers will be replaced with a simpler "header region + sticky menu bar + scrollable content region" approach.

In other words: **the entire visual frame of the Portfolio tab (header + menu + reader stacking) is assumed to be replaced**, even though the underlying logic and components are kept.

### 3.2. Elements We Intend to Keep (But Re‑slot)

You explicitly asked: “Do we need to remove Profile and BottomNav too?”  
Here is the plan:

- **Profile (`components/Profile.tsx`)**:
  - We **keep** the component and its behavior (sticky header with EXPAND).
  - It already works well on the rest of the site and should remain the top bar of the front page.
  - In the new layout, we will still place Profile at the **very top of the page**, but we will rethink **what sits directly under it**.

- **BottomTabBar (`components/BottomTabBar.tsx`)**:
  - We **keep** this as the fixed bottom bar for PORTFOLIO / RESUME / DOWNLOADS and collection tabs.
  - It already behaves correctly (fixed at the bottom, with tab animations).
  - In the new layout, we will again treat it as a separate, fixed bottom region.

So:

- We are **not deleting Profile or BottomTabBar**.
- We are **resetting the middle**: the region between Profile and BottomTabBar (Main menu, Collections menu layout, Content Reader, Info menu, and their positioning).

---

## 4. New Layout Reset Scope (High-Level)

This document defines the scope of the reset as:

- **Backend and logic layer**: **kept** (database, queries, types, state machine concept) - Phases 0-5 complete.
- **Visual frame between Profile and Bottom tab bar**: **re‑designed from scratch** - Phase 6.

### 4.1. New Vertical Stack Description (Target Layout)

A minimal, clear description of the new vertical stack:

1. **Profile sticky at top**:
   - Position: `sticky top-0` (already working correctly).
   - Height: Dynamic (measured and reported via `onHeightChange` callback).
   - Behavior: Stays at top when scrolling.

2. **Main menu bar sticky directly under Profile**:
   - Position: `sticky` with `top: profileHeight` (not `calc(33vh + 3rem)`).
   - Height: Auto (based on content).
   - Behavior: Stays directly under Profile bottom when scrolling.
   - **Key change**: Uses Profile height measurement, not viewport height percentage.

3. **Content Reader area below Main Menu**:
   - Position: Normal document flow (not fixed/absolute).
   - Spacing: Proper margin from Main Menu bottom.
   - Behavior: Scrolls with browser scrollbar.
   - **Key change**: No complex marginTop calculations, no internal scrollbar, no clipping/masking.

4. **Info Menu positioned relative to Content Reader**:
   - Position: Fixed/absolute on left side.
   - Behavior: Stays in place while Content Reader scrolls.
   - **Key change**: Positioned relative to Content Reader area, not viewport percentages.

5. **Collections Menu positioned on right side**:
   - Position: Sticky or fixed on right side.
   - Behavior: Stays in place during scroll.
   - Layout: Vertical list (expanded) ↔ horizontal row (collapsed).
   - **Key change**: Proper spacing from Content Reader, no overlap.

6. **Bottom Tab Bar fixed at bottom**:
   - Position: `fixed bottom-0` (already working correctly).
   - Height: 64px (`h-16`).
   - Behavior: Stays at bottom when scrolling.

### 4.2. Phase 6 Implementation Steps (From Planning Doc)

The planning document (`portfolio-planning.md` lines 2561-2665) defines 8 steps for Phase 6:

1. **Step 6.1**: Page Frame Structure - Create basic page structure with separate areas.
2. **Step 6.2**: Profile Positioning - Make Profile stick to top, measure height.
3. **Step 6.3**: Main Menu Positioning - Position Main Menu directly under Profile using height measurement.
4. **Step 6.4**: Content Reader Positioning - Position Content Reader below Main Menu with proper spacing.
5. **Step 6.5**: Info Menu Positioning - Position Info Menu on left side relative to Content Reader.
6. **Step 6.6**: Collections Menu Positioning - Position Collections Menu on right side with proper spacing.
7. **Step 6.7**: Scrolling & Overlap Prevention - Ensure nothing overlaps, scrolling works correctly.
8. **Step 6.8**: Window Size Testing - Test and fix layout on different window sizes.

### 4.3. Key Principles for Phase 6

- **No vh-based positioning**: Use Profile height measurement, not viewport percentages.
- **Simple vertical stacking**: One thing above another, no complex calculations.
- **Browser scrollbar**: Content Reader scrolls with page, no internal scrollbar.
- **No clipping/masking**: Prevent overlap through proper spacing and positioning, not CSS tricks.
- **Profile height as anchor**: Profile bottom becomes the "zero line" for Main Menu positioning.

### 4.4. Current Component Status

**Working correctly (keep as-is)**:
- Profile component: Sticky at top, height measurement working.
- BottomTabBar component: Fixed at bottom, 64px height.
- All component logic: MainMenu, ContentReader, InfoMenu, CollectionsMenu functionality complete.

**Needs layout reset**:
- MainMenu positioning: Remove `calc(33vh + 3rem)`, use Profile height.
- ContentReader positioning: Remove `calc(45vh - 33vh - 3rem - 257px)`, use simple margin from Main Menu.
- InfoMenu positioning: Reposition relative to Content Reader area.
- CollectionsMenu positioning: Reposition with proper spacing.
- PortfolioTab layout structure: Simplify nested containers, remove vh-based calculations.

For now, this file is our **guiding document for Phase 6**: it records what we are keeping, what we are discarding, and where the reset begins.

## 5. LAYOUT SPECIFICATION FOR PHASE 6
================================

### 5.1. Core Layout Concept

**Menu Bar**: Main Menu and Collections Menu are both part of one "Menu Bar" (per logic doc lines 30, 40). They share the same horizontal plane directly under Profile.

**Content Reader as Basis**: Content Reader is the foundation of the page layout. Other elements (menus) are positioned on top of it, not relative to each other.

**State-Dependent Layout**: Layout changes significantly between collapsed and expanded states, especially for Content Reader positioning.

---

COMPONENT POSITIONS:
-------------------

### 1. Profile (Business Card) ✅ DEFINED
- **Position**: Fixed at top (`sticky top-0`)
- **Height**: Auto, follows Resume and Downloads tabs, no changes
- **Width**: Full width
- **Z-index**: Highest (on top of all other elements)
- **Sticky behavior**: Always visible when scrolling
- **IMPORTANT**: No changes to Profile component

### 2. Menu Bar (Main Menu + Collections Menu) ✅ DEFINED

**Concept**: Main Menu and Collections Menu are both part of one Menu Bar on the same horizontal plane.

**Position**: Directly below Profile
- **Vertical spacing**: 0px gap - Menu Bar positioned directly at Profile bottom edge (including border)
- **Border alignment**: Menu Bar sticks with Profile border - moves when Profile height changes
- **Sticky behavior**: Stays visible under Profile, never scrolls

**Main Menu (Left side of Menu Bar)**:
- **Horizontal position**: Starts ~60px from left edge of page, grows right
- **Width**: Dynamic, changes with length of text (categories, subcategories, content item titles)
- **Height (collapsed)**: 64px
- **Height (expanded)**: Dynamic to fit all required categories, subcategories, content items
- **Grows**: Rightward and downward when expanded

**Collections Menu (Right side of Menu Bar)**:
- **Horizontal position**: Starts ~60px from right edge of page, grows left
- **Width**: As required to fit featured elements (collapsed or expanded states)
- **Height (collapsed)**: Part of Menu Bar (same height as Main Menu collapsed)
- **Height (expanded)**: Dynamic to fit all featured collections
- **Grows**: Leftward and downward when expanded
- **No max-width**: Should not have max-width constraint

**Natural Gap**: 
- Gap between Main Menu (right edge) and Collections Menu (left edge) in the middle
- Gap widens and shrinks as window dimensions change
- This gap is the space where Content Reader sits in expanded state

**When visible**: Always (both menus always visible)

### 3. Content Reader ⚠️ PARTIALLY DEFINED (Most Complex)

**Concept**: Content Reader is the basis of the page. Other layout elements (menus) are positioned on top of it.

**Positioning Strategy**: 
- Content Reader positioning is state-dependent (collapsed vs expanded)
- Content Reader does NOT position relative to Collections Menu in collapsed state
- Content Reader DOES position relative to Menu Bar elements in expanded state

**Collapsed State**:
- **Horizontal position**: Fills remaining space between Info Menu (right edge) and right edge of page
- **Gap from right edge**: ~50px gap from right edge of page
- **Vertical position**: Below Menu Bar
- **Relationship**: NOT related to Collections Menu (disconnected in logic)
- **Width**: Calculated as: `page width - Info Menu width - 50px gap - left positioning`

**Expanded State**:
- **Horizontal position**: Fills remaining space between:
  - Right border of expanded Main Menu (left boundary)
  - Left border of expanded Collections Menu (right boundary)
- **Vertical position**: Below Menu Bar
- **Relationship**: Adjusts according to Menu Bar elements (Main Menu and Collections Menu)
- **Width**: Calculated as: `Collections Menu left edge - Main Menu right edge`

**Vertical spacing**: 
- **Top margin**: 35px gap between Menu Bar bottom and Content Reader top
- **Bottom margin**: [TBD - needs definition]

**Scrolling**: 
- **Scrolls**: Yes, the only part of the portfolio tab that scrolls
- **Scroll container**: Content Reader itself (browser scrollbar)
- **Max height**: Constrained between Menu Bar bottom and Bottom Tab Bar top

**Margins** (TBD - to be refined):
- Left: [Depends on state - TBD]
- Right: [Depends on state - TBD]
- Top: 35px (from Menu Bar)
- Bottom: [TBD - distance from Bottom Tab Bar]

### 4. Info Menu ✅ DEFINED

**Position**:
- **Horizontal**: Left side, 25px from left edge of page
- **Vertical**: Middle of center plane (excluding Profile and Bottom Tab Bar)
  - Lower than top border of Content Reader
  - Vertically centered in available space between Menu Bar and Bottom Tab Bar

**Width**: As required to fit featured metadata elements

**Visibility**:
- **Collapsed state**: Visible, stays in place while Content Reader scrolls
- **Expanded state**: Hidden (IMPORTANT CHANGE from original logic)

**Alignment**: Text aligned to the left

**Sticky behavior**: Stays visible when main menu is collapsed; hidden when main menu is expanded

### 5. Bottom Tab Bar ✅ DEFINED
- **Position**: Fixed at bottom, never scrolls
- **Height**: 64px 
- **Width**: Full width
- **Z-index**: Highest (on top of all elements)
- **IMPORTANT**: No changes to Bottom Tab Bar component

---

SCROLLING BEHAVIOR:
------------------
- **Which components scroll**: Content Reader only
- **Which components stay fixed**: Profile, Menu Bar (Main Menu + Collections Menu), Info Menu (when visible), Bottom Tab Bar
- **Scroll container**: Content Reader (browser scrollbar, not internal scrollbar)

---

SPACING & MARGINS:
-----------------
- **Space between Profile and Menu Bar**: 0px ✅ DEFINED (Menu Bar positioned directly at Profile bottom edge, sticks with border)
- **Space between Menu Bar and Content Reader (vertical)**: 35px ✅ DEFINED
- **Content Reader gap from right edge (collapsed)**: ~50px ✅ DEFINED
- **Info Menu from left edge**: 25px ✅ DEFINED
- **Overall page padding**: [TBD - cannot define yet]
- **Content Reader margins**: [TBD - depends on state, to be refined during implementation]

---

RESPONSIVE BEHAVIOR:
-------------------
- **Mobile layout**: Likely requires separate layout design (not ready to define specifics)
- **Narrow screens**: [TBD - cannot define specifics yet]
- **Wide screens**: [TBD - cannot define specifics yet]
- **Breakpoints**: [TBD - to be determined during implementation]
- **Note**: Collections Menu has no max-width. Mobile layout will likely be redesigned separately.

---

OVERLAP RULES:
-------------
- **Components must never overlap**: All components must have clear boundaries
- **Z-index order** (lowest to highest):
  1. Bottom Tab Bar
  2. Profile
  3. Main Menu (expanded)
  4. Collections Menu (expanded)
  5. Main Menu (collapsed)
  6. Collections Menu (collapsed)
  7. Content Reader
  8. Info Menu (when visible)

---

### 5.2. Layout States Summary

**Collapsed State**:
- Menu Bar: Main Menu (collapsed) + Collections Menu (collapsed) on same horizontal plane
- Content Reader: Fills space between Info Menu and right edge (~50px gap)
- Info Menu: Visible, vertically centered
- Collections Menu and Content Reader: NOT related (disconnected in logic)

**Expanded State**:
- Menu Bar: Main Menu (expanded, grows right/down) + Collections Menu (expanded, grows left/down)
- Content Reader: Fills space between Main Menu right edge and Collections Menu left edge
- Info Menu: Hidden
- Content Reader adjusts to Menu Bar elements

---

### 5.3. Implementation Notes

**Key Principles**:
1. Menu Bar concept: Main Menu and Collections Menu are one unit on same horizontal plane
2. Content Reader is basis: Other elements positioned on top of it
3. State-dependent positioning: Collapsed and expanded states have different layout rules
4. Natural gap: Space between Main Menu and Collections Menu widens/shrinks with window size
5. Disconnect Collections Menu from Content Reader in collapsed state

**TBD Items** (to be refined during implementation):
- Content Reader exact margins (left/right depend on state)
- Content Reader bottom margin
- Overall page padding
- Responsive breakpoints and behavior
- Mobile layout design

**Next Steps**:
1. Implement basic Menu Bar structure (Main Menu + Collections Menu on same plane)
2. Implement Content Reader positioning for collapsed state first
3. Implement Content Reader positioning for expanded state
4. Refine margins and spacing through testing
5. Define responsive behavior based on implementation results

---

## COMPLEX LAYOUT POSITIONING STAGES

This section documents complex positioning issues that require detailed investigation and staged fixes.

---

### Sticky Menu Bar - Step 6.3 Stage 3

**Date**: Phase 6, Step 6.3 Stage 3 (Menu Bar - Collapsed State)

**Problem Statement**: Menu Bar is not sticky - it scrolls with Content Reader instead of staying fixed under the Profile header when scrolling.

---

#### Current State Analysis

**What We Have Now (Step 6.1, 6.3 Stages 1-2)**:

1. **Menu Bar Container** (`components/tabs/PortfolioTab.tsx` lines 914-920):
   ```tsx
   <div 
     className="z-10 bg-[#1a1d23] flex justify-between items-center h-16 px-[60px]" 
     style={{ 
       position: 'sticky',
       top: profileHeight ? `${profileHeight + 25}px` : '0px'
     }}
   >
   ```
   - Has `position: 'sticky'` in inline style (not Tailwind class)
   - Has `top` value using Profile height measurement: `profileHeight + 25px`
   - Has `z-index: 10` (via `z-10` class)
   - Has background color `bg-[#1a1d23]` to prevent content showing through
   - Has flex layout for horizontal positioning
   - Has fixed height `h-16` (64px)

2. **Parent Container** (`components/tabs/PortfolioTab.tsx` line 903):
   ```tsx
   return (
     <div>
       {/* Profile */}
       {/* Menu Bar Container */}
       {/* Content Area */}
       {/* Bottom Tab Bar */}
     </div>
   )
   ```
   - Simple `<div>` with no classes or styles
   - No `overflow` properties
   - No height constraints
   - No positioning properties

3. **Profile Component** (`components/Profile.tsx`):
   - Sticky at top: `className="... sticky top-0 ..."`
   - Measures its own height via `getBoundingClientRect().height`
   - Reports height to PortfolioTab via `onHeightChange` callback
   - Height updates on expand/collapse and window resize

4. **Content Reader** (`components/ContentReader.tsx`):
   - Normal document flow (not fixed/absolute)
   - Has `marginTop: '35px'` for spacing from Menu Bar
   - Has `marginRight: '50px'` in collapsed state
   - Scrolls with browser scrollbar

---

#### Historical Context - Previous Attempts

**From `portfolio-4.1fix.md`** (Phase 4 debugging):

1. **Original Problem (Phase 4)**:
   - Menu used `top: calc(33vh + 3rem)` - viewport-relative positioning
   - Menu position changed based on window height
   - Menu felt "crooked" on different screen sizes
   - In portrait orientation, menu lost stickiness
   - User described as "whack-a-mole" - fixing one thing broke another

2. **Option B Implementation (Dynamic Measurement)**:
   - Implemented Profile height measurement (current approach)
   - Profile measures height via `getBoundingClientRect()`
   - PortfolioTab receives height via callback
   - Menu uses `top: profileHeight` (without 25px gap in Phase 4)
   - **Result**: Profile stayed sticky, but menu "now moves away" instead of staying fixed
   - User observation: "Profile OK, menu moves" (portfolio-4.1fix.md lines 208-211)

3. **Status at End of Phase 4**:
   - Option B "partially in place" but "does not yet deliver desired behavior"
   - Menu did not stay "visually glued to bottom of Profile while scrolling"
   - Issue described as more complex than expected with nested flex containers
   - User requested pause on further changes (portfolio-4.1fix.md lines 232-239)

4. **Phase 6 Reset**:
   - Layout reset removed nested flex containers
   - Simplified to vertical stack: Profile → Menu Bar Container → Content Area → Bottom Tab Bar
   - Menu Bar Container given `position: 'sticky'` with `top: profileHeight + 25px`
   - Expected this simpler structure would fix sticky behavior
   - **Current problem**: Sticky still not working despite simpler structure

---

#### Why Sticky Might Not Be Working

**CSS `position: sticky` Requirements**:

1. **Must have a `top` value**: ✅ Has `top: profileHeight + 25px`

2. **Parent must establish scrolling context**:
   - Parent with overflow (scroll/auto/hidden) creates its own scrolling container
   - If parent has overflow, sticky works within that parent
   - If parent has NO overflow, sticky works within the viewport (window scroll)
   - **Current state**: Parent `<div>` has no overflow - should work with viewport scroll
   - **Possible issue**: Something preventing viewport scroll context

3. **Element must cross threshold**:
   - Sticky only "sticks" when scrolling would move it past the `top` value
   - If there's no scrollable content, sticky has nothing to stick to
   - **Current state**: Content Reader has content, should create scrollable area
   - **Possible issue**: Not enough content to trigger scroll?

4. **Parent must not have `overflow: hidden`**:
   - If parent or ancestor has `overflow: hidden`, sticky may not work
   - **Current state**: Parent `<div>` has no overflow property
   - **Possible issue**: Check if any ancestor has overflow hidden

5. **Must have space to stick within parent**:
   - Sticky element can only stick while scrolling within its parent container
   - If parent height = element height, no room to stick
   - **Current state**: Parent is full page height, should have room
   - **Possible issue**: Parent height not established?

6. **Parent must not have height constraints that prevent sticking**:
   - Parent with fixed height may limit sticky behavior
   - **Current state**: Parent has no height property
   - **Possible issue**: Parent might need explicit height?

---

#### Specific Issues to Investigate

**Issue 1: Parent Scrolling Context**

**Hypothesis**: Parent `<div>` might not be establishing correct scrolling context.

**Evidence**:
- Parent is simple `<div>` with no properties
- In Phase 4, issue was "nested flex containers" interfering
- In Phase 6, simplified to basic div, but sticky still not working
- Sticky works within "scrolling container" - might need explicit setup

**Investigation needed**:
- Check if parent div needs `height: 100vh` or `min-height: 100vh`
- Check if parent needs `overflow-y: auto` or `overflow-y: scroll`
- Check if sticky works better with parent having explicit scrolling container
- Check DevTools computed styles on parent and Menu Bar Container

**Potential fixes**:
- Option A: Add `overflow-y: auto` to parent div
- Option B: Add `min-height: 100vh` to parent div
- Option C: Wrap content in scrolling container

---

**Issue 2: Not Enough Scrollable Content**

**Hypothesis**: There might not be enough content below Menu Bar to create scrolling.

**Evidence**:
- Sticky only "sticks" when there's content to scroll
- If viewport tall enough to show all content, no scroll = no sticky
- User reported Menu Bar "scrolls with Content Reader"

**Investigation needed**:
- Check actual viewport height vs content height
- Check if Content Reader creates enough scrollable content
- Test with very long content to ensure scrolling exists

**Potential fixes**:
- Ensure Content Reader has sufficient content for testing
- Add minimum height to Content Reader area
- Verify scrolling exists before testing sticky

---

**Issue 3: Z-Index Stacking Context**

**Hypothesis**: Z-index might not be creating proper stacking order.

**Evidence**:
- Menu Bar has `z-10` (z-index: 10)
- Profile has sticky positioning (creates stacking context)
- Content Reader in normal flow

**Investigation needed**:
- Check DevTools stacking context
- Verify Menu Bar appears "on top" of Content Reader when scrolling
- Check if z-index needs adjustment

**Potential fixes**:
- Increase z-index if needed
- Add `position: relative` to parent to create stacking context
- Verify z-index cascade

---

**Issue 4: Sticky + Flex Interaction**

**Hypothesis**: Flex layout on Menu Bar Container might interfere with sticky.

**Evidence**:
- Menu Bar Container has `flex justify-between items-center`
- In Phase 4, "nested flex containers" were problematic
- Current simplified structure still uses flex

**Investigation needed**:
- Test if removing flex classes allows sticky to work
- Check if flex parent needs specific properties
- Verify flex doesn't prevent sticky positioning

**Potential fixes**:
- Move flex layout to inner wrapper div
- Keep Menu Bar Container simple for sticky positioning
- Separate sticky positioning from flex layout

---

**Issue 5: Profile Height Measurement Timing**

**Hypothesis**: `profileHeight` might not be available when Menu Bar first renders.

**Evidence**:
- Profile measures height in `useEffect`
- Menu Bar uses `profileHeight + 25px`
- Has fallback: `profileHeight ? ... : '0px'`
- Initial render might have `top: '0px'`

**Investigation needed**:
- Check if `profileHeight` state is populated on first render
- Verify fallback behavior
- Check console.log for profileHeight value

**Potential fixes**:
- Ensure Profile height available before Menu Bar renders
- Add loading state if needed
- Verify measurement timing

---

**Issue 6: CSS Specificity / Tailwind Conflict**

**Hypothesis**: Tailwind classes might conflict with inline `position: sticky`.

**Evidence**:
- Previously used Tailwind `sticky` class (Step 6.2 failed attempt)
- Now using inline `position: 'sticky'`
- Has Tailwind `z-10` class alongside inline style

**Investigation needed**:
- Check DevTools computed styles - is `position: sticky` applied?
- Verify no conflicting Tailwind utilities
- Check if Tailwind reset affects sticky

**Potential fixes**:
- Verify position: sticky in computed styles
- Remove conflicting classes if any
- Ensure inline style has priority

---

#### Comparison: Working vs Not Working

**Profile (WORKING - Sticky at Top)**:
```tsx
<header className="... sticky top-0 ...">
```
- Uses Tailwind `sticky` class
- Simple `top-0` value
- Parent: `<div>` (same as Menu Bar parent)
- **Works correctly**

**Menu Bar Container (NOT WORKING - Not Sticky)**:
```tsx
<div className="z-10 bg-[#1a1d23] flex ..." style={{ position: 'sticky', top: ... }}>
```
- Uses inline `position: 'sticky'`
- Dynamic `top: profileHeight + 25px` value
- Parent: `<div>` (same as Profile parent)
- **Does not work**

**Key Difference**:
- Profile uses Tailwind `sticky top-0` - WORKS
- Menu Bar uses inline `position: 'sticky'` with dynamic top - DOESN'T WORK
- Both have same parent structure
- **Question**: Does Tailwind `sticky` class do something different than inline style?

---

#### Recommended Investigation Steps

**Step 1: Verify CSS is Applied**
1. Open browser DevTools
2. Inspect Menu Bar Container element
3. Check Computed styles tab
4. Verify `position: sticky` is present (not overridden)
5. Verify `top` value is calculated correctly
6. Check if any conflicts or overrides

**Step 2: Test Tailwind vs Inline**
1. Try changing from inline `position: 'sticky'` to Tailwind `sticky` class
2. Move `top` value to Tailwind utility if possible
3. Compare behavior

**Step 3: Check Scrolling Context**
1. Verify page has scrollable content (Content Reader creates scroll)
2. Check parent div height in DevTools
3. Test if adding `min-height: 100vh` to parent helps
4. Test if adding `overflow-y: auto` to parent helps

**Step 4: Test Simplified Structure**
1. Temporarily remove flex classes from Menu Bar Container
2. Test if sticky works with simple div
3. Re-add flex classes one by one to identify conflict

**Step 5: Verify Profile Height**
1. Add console.log to check profileHeight value
2. Verify fallback `'0px'` not being used
3. Test with hardcoded value like `top: '200px'` to isolate dynamic value issue

---

#### Potential Fix Strategies

**Strategy A: Use Tailwind Sticky Class** (Simplest)
- Change from inline `position: 'sticky'` to Tailwind `sticky` class
- Keep dynamic `top` in inline style
- Profile uses this approach and works

**Strategy B: Simplify Menu Bar Container** (Structure)
- Remove flex layout from Menu Bar Container
- Create inner wrapper div for flex layout
- Keep Menu Bar Container simple for sticky positioning

**Strategy C: Explicit Parent Scrolling** (Context)
- Add `min-height: 100vh` to parent div
- Or add `overflow-y: auto` if needed
- Establish clear scrolling context

**Strategy D: JavaScript Scroll Listener** (Last Resort)
- If CSS sticky fails, use JavaScript
- Listen to scroll events
- Manually position Menu Bar via `position: fixed`
- Update `top` value on scroll to maintain position below Profile

---

#### Success Criteria

**Menu Bar sticky positioning working correctly when**:
1. ✅ Menu Bar stays fixed at `profileHeight + 25px` from top when scrolling
2. ✅ Menu Bar doesn't move when Content Reader scrolls
3. ✅ Menu Bar stays directly under Profile at all times
4. ✅ Menu Bar appears "on top" of Content Reader (z-index working)
5. ✅ Background color prevents content showing through
6. ✅ Works on all window sizes and orientations
7. ✅ Works when Profile expands/collapses (height measurement working)

---

#### Next Actions (When Ready to Fix)

1. **Investigate** (no code changes):
   - Check DevTools computed styles
   - Verify position: sticky is applied
   - Check scrolling context
   - Verify profileHeight value

2. **Test Strategy A** (Try Tailwind class):
   - Change to Tailwind `sticky` class
   - Keep dynamic top in style
   - Test if sticky works

3. **Test Strategy B** (Simplify structure):
   - Create inner wrapper for flex layout
   - Keep Menu Bar Container simple
   - Test if sticky works

4. **Test Strategy C** (Fix parent context):
   - Add min-height or overflow to parent
   - Test if sticky works

5. **Document results**:
   - Record what worked
   - Update this section
   - Mark Stage 3 complete when fixed

---

#### Implementation Attempts and Results

**Attempt 1: Strategy A - Use Tailwind Sticky Class**

**Date/Time**: Step 6.3 Stage 3, First Fix Attempt

**Rationale**:
- Profile component uses Tailwind `sticky top-0` and works correctly
- Menu Bar was using inline `position: 'sticky'` and not working
- Hypothesis: Tailwind `sticky` class might handle something differently than inline style
- This is the simplest fix to try first

**Code Changes**:

File: `components/tabs/PortfolioTab.tsx`

Location: Lines 915-918 (Menu Bar Container)

**Before**:
```tsx
<div
  className="z-10 bg-[#1a1d23] flex justify-between items-center h-16 px-[60px]"
  style={{
    position: 'sticky',
    top: profileHeight ? `${profileHeight + 25}px` : '0px'
  }}
>
```

**After**:
```tsx
<div
  className="sticky z-10 bg-[#1a1d23] flex justify-between items-center h-16 px-[60px]"
  style={{
    top: profileHeight ? `${profileHeight + 25}px` : '0px'
  }}
>
```

**Changes**:
- Added `sticky` to className (before `z-10`)
- Removed `position: 'sticky'` from inline style
- Kept dynamic `top` value in inline style (cannot use Tailwind for dynamic values)
- Kept all other classes unchanged (z-index, background, flex layout, height, padding)

**Linting**: ✅ No errors

**Browser Verification**:
- Navigated to `localhost:3000/portfolio-test/`
- Page loaded successfully
- Menu Bar visible with Main Menu on left, Collections Menu on right
- Menu Bar has dark background (`bg-[#1a1d23]`)
- Menu Bar positioned below Profile with ~25px gap
- Scrolled down to observe behavior
- Content Reader content visible and scrollable

**Observation**: [Awaiting detailed verification]
- Need to confirm if Menu Bar stays in place during scroll
- Need to confirm if Menu Bar maintains position below Profile
- Need to verify sticky behavior is now working

**Next**: Awaiting user feedback on whether sticky behavior is now working correctly.

**Browser Verification Results**:

*Navigation*:
- Navigated to `localhost:3000/portfolio-test/`
- Page loaded successfully

*Visual Inspection* (Full-page screenshot):
- Profile visible at top
- Menu Bar visible with Main Menu (left) and Collections Menu (right)
- Dark background color (`bg-[#1a1d23]`) is displayed correctly
- Bottom Tab Bar visible with navigation buttons
- Overall layout structure appears correct

*Initial State*:
- Menu Bar positioned below Profile with visible gap
- Main Menu showing categories on left side
- Collections Menu showing on right side
- Flex layout creating responsive gap between menus
- Z-index appears correct (Menu Bar on top of content)

*Sticky Behavior Testing*:
- Need to verify if Menu Bar maintains position during scroll
- User reported Menu Bar still scrolling with content (not sticky)
- This indicates Strategy A (Tailwind `sticky` class) may not have resolved the issue

**Current Assessment**:
- Code changes implemented successfully (no lint errors)
- Visual structure correct (dark background, flex layout working)
- **Sticky positioning still not functioning as expected**
- Menu Bar continues to scroll with Content Reader despite `sticky` class

**User Feedback**:
- User confirmed: "Menu bar still scrolls with the page, it's not sticky"
- Strategy A has **FAILED** to resolve the sticky positioning issue

**Conclusion**:
- ❌ **Strategy A: FAILED**
- Using Tailwind `sticky` class instead of inline `position: 'sticky'` did not fix the issue
- Menu Bar still scrolls with page content instead of staying fixed
- Root cause investigation needs to continue
- Next strategy (Strategy B, C, or D) should be attempted

---

**Attempt 2: Strategy 2 - Fix Dynamic Top Value Fallback**

**Date/Time**: Step 6.3 Stage 3, Second Fix Attempt

**Root Cause Identified**:
- User investigation in DevTools revealed: `position: sticky` ✅ (correctly applied)
- User investigation revealed: `top: 0px` ❌ (WRONG - should be `225px` or similar)
- **Problem**: `profileHeight` is `0` or not set, causing fallback `'0px'` to be used
- **Result**: Menu Bar tries to stick at `top: 0px`, same position as Profile (`sticky top-0`)
- **Conflict**: Both elements trying to stick at same position causes Menu Bar to fail

**Rationale**:
- Profile component uses `sticky top-0` and works correctly
- Menu Bar needs to stick BELOW Profile, not at the same position
- Current code: `top: profileHeight ? `${profileHeight + 25}px` : '0px'`
- If `profileHeight` is 0 or undefined, fallback `'0px'` creates conflict with Profile
- **Solution**: Use better fallback value (`'200px'`) that approximates Profile height
- This ensures Menu Bar sticks below Profile even if `profileHeight` measurement is delayed

**Code Changes**:

File: `components/tabs/PortfolioTab.tsx`

Location 1: Lines 915-918 (Menu Bar Container - fallback value)

**Before**:
```tsx
<div 
  className="sticky z-10 bg-[#1a1d23] flex justify-between items-center h-16 px-[60px]" 
  style={{ 
    top: profileHeight ? `${profileHeight + 25}px` : '0px'  // ❌ Fallback conflicts with Profile
  }}
>
```

**After**:
```tsx
<div 
  className="sticky z-10 bg-[#1a1d23] flex justify-between items-center h-16 px-[60px]" 
  style={{ 
    top: profileHeight ? `${profileHeight + 25}px` : '200px'  // ✅ Better fallback (approximate Profile height)
  }}
>
```

**Changes**:
- Changed fallback from `'0px'` to `'200px'`
- `200px` is approximate Profile height (collapsed state typically ~150-200px)
- This prevents Menu Bar from conflicting with Profile at `top: 0px`
- Menu Bar will stick below Profile even if `profileHeight` measurement is delayed

Location 2: Lines 756-757 (Debug logging - added profileHeight tracking)

**Before**:
```tsx
console.log('=== PortfolioTab State ===')
console.log('Page State:', pageState)
```

**After**:
```tsx
console.log('=== PortfolioTab State ===')
console.log('Page State:', pageState)
console.log('Profile Height:', profileHeight, 'px') // Debug: Check if profileHeight is being set
console.log('Menu Bar Top Value:', profileHeight ? `${profileHeight + 25}px` : '200px (fallback)') // Debug: Show calculated top value
```

**Changes**:
- Added console.log for `profileHeight` value
- Added console.log for calculated Menu Bar `top` value
- Helps debug if `profileHeight` is being set correctly
- Shows whether fallback is being used

**Linting**: ✅ No errors

**Expected Behavior**:
- Menu Bar should stick at `top: 200px` (fallback) if `profileHeight` is not yet measured
- Menu Bar should stick at `top: profileHeight + 25px` once Profile height is measured
- Menu Bar should stay below Profile, not conflict at `top: 0px`
- Sticky positioning should work because Menu Bar is no longer trying to stick at same position as Profile

**Testing Instructions**:
1. Open browser console (F12 → Console tab)
2. Check console logs for:
   - `Profile Height: X px` - should show actual height (not 0)
   - `Menu Bar Top Value: Xpx` - should show calculated value
3. Inspect Menu Bar element in DevTools
4. Check Computed styles:
   - `position` should be `sticky` ✅
   - `top` should be `200px` (if profileHeight not set) or `225px+` (if profileHeight is set) ✅
5. Scroll page and verify:
   - Menu Bar stays fixed below Profile ✅
   - Menu Bar does not scroll with Content Reader ✅

**Next**: Awaiting user feedback on whether sticky behavior is now working correctly.

**User Feedback**:
- User confirmed: "It doesn't work"
- Strategy 2 has **FAILED** to resolve the sticky positioning issue

**Conclusion**:
- ❌ **Strategy 2: FAILED**
- Changing fallback from `'0px'` to `'200px'` did not fix the issue
- Menu Bar still scrolls with page content instead of staying fixed
- Root cause is deeper than just the fallback value
- The `top` value conflict was not the only issue preventing sticky from working
- Next strategy (Strategy B, C, or D from original investigation) should be attempted

**Key Learnings**:
- Even with correct `top` value (200px or profileHeight + 25px), sticky still doesn't work
- This suggests the problem is not just about positioning values
- May need to investigate parent container structure, scrolling context, or CSS conflicts
- Consider trying Strategy B (simplify Menu Bar Container structure) or Strategy C (explicit parent scrolling context)

---

**Attempt 3: Strategy - Change from Sticky to Fixed Positioning**

**Date/Time**: Step 6.3 Stage 3, Third Fix Attempt

**User Insight**:
- User observation: "Profile, bottom tab nav, and info menu all can stay sticky easily, but the menu bar is always the problem"
- User question: "Why is the menu bar still connected to the content reader?"
- **Key realization**: Menu Bar is in normal document flow, while other working elements use `fixed` positioning

**Root Cause Analysis**:

**Working Elements**:
- **Profile**: `sticky top-0` ✅ - Direct child, removed from flow
- **Bottom Tab Bar**: `fixed bottom-0` ✅ - Direct child, completely removed from flow
- **Info Menu**: `fixed` with `top: 75%` ✅ - Inside Content Area Container, but `fixed` removes it from flow

**Not Working Element**:
- **Menu Bar**: `sticky` with dynamic `top` ❌ - Direct child, but still in document flow

**The Problem**:
- Menu Bar uses `sticky` positioning, which keeps it in the normal document flow
- Menu Bar comes BEFORE the Content Area Container in DOM structure
- When Content Reader scrolls, Menu Bar scrolls with it because they're in the same flow
- Other working elements use `fixed` positioning, which completely removes them from document flow
- `fixed` positioning positions elements relative to viewport, not document flow

**Solution**:
- Change Menu Bar from `sticky` to `fixed` positioning
- This removes Menu Bar from document flow entirely
- Menu Bar will be positioned relative to viewport (like Info Menu and Bottom Tab Bar)
- Menu Bar will stay in place when Content Reader scrolls

**Rationale**:
- Profile uses `sticky top-0` and works, but it's at the very top
- Bottom Tab Bar uses `fixed bottom-0` and works perfectly
- Info Menu uses `fixed` and works perfectly
- Menu Bar should use `fixed` to match the pattern of other working elements
- `fixed` positioning is more reliable than `sticky` for elements that need to stay in place

**Code Changes**:

File: `components/tabs/PortfolioTab.tsx`

Location: Lines 916-921 (Menu Bar Container)

**Before**:
```tsx
<div 
  className="sticky z-10 bg-[#1a1d23] flex justify-between items-center h-16 px-[60px]" 
  style={{ 
    top: profileHeight ? `${profileHeight + 25}px` : '200px'
  }}
>
```

**After**:
```tsx
<div 
  className="fixed z-10 bg-[#1a1d23] flex justify-between items-center h-16 px-[60px]" 
  style={{ 
    top: profileHeight ? `${profileHeight + 25}px` : '200px',
    left: '0',
    right: '0'
  }}
>
```

**Changes**:
- Changed `className` from `sticky` to `fixed`
- Added `left: '0'` to make Menu Bar span full width (like Bottom Tab Bar)
- Added `right: '0'` to make Menu Bar span full width (like Bottom Tab Bar)
- Kept `top` calculation the same (profileHeight + 25px or 200px fallback)
- Kept all other classes unchanged (z-index, background, flex layout, height, padding)

**Why This Should Work**:
- `fixed` positioning removes element from document flow completely
- Menu Bar will be positioned relative to viewport, not document
- Menu Bar will not scroll with Content Reader (they're no longer connected)
- Matches the pattern used by Bottom Tab Bar and Info Menu (both use `fixed`)
- `fixed` is more reliable than `sticky` for elements that must stay in place

**Linting**: ✅ No errors

**Expected Behavior**:
- Menu Bar should stay fixed at `top: profileHeight + 25px` (or `200px` fallback)
- Menu Bar should span full width (`left: 0, right: 0`)
- Menu Bar should NOT scroll when Content Reader scrolls
- Menu Bar should stay directly below Profile at all times
- Menu Bar should appear "on top" of Content Reader (z-index working)
- Background color should prevent content showing through

**Testing Instructions**:
1. Open browser console (F12 → Console tab)
2. Check console logs for:
   - `Profile Height: X px` - should show actual height
   - `Menu Bar Top Value: Xpx` - should show calculated value
3. Inspect Menu Bar element in DevTools
4. Check Computed styles:
   - `position` should be `fixed` ✅ (changed from `sticky`)
   - `top` should be `200px` (if profileHeight not set) or `225px+` (if profileHeight is set) ✅
   - `left` should be `0px` ✅
   - `right` should be `0px` ✅
5. Scroll page and verify:
   - Menu Bar stays fixed below Profile ✅
   - Menu Bar does NOT scroll with Content Reader ✅
   - Menu Bar is completely disconnected from Content Reader flow ✅

**Next**: Awaiting user feedback on whether fixed positioning resolves the issue.

**User Feedback**:
- User confirmed: "Mark this fix as successful. The menu bar sticks to the page."
- Attempt 3 has **SUCCEEDED** in resolving the sticky positioning issue
- Menu Bar now stays fixed in place when scrolling ✅

**Conclusion**:
- ✅ **Attempt 3: SUCCESS**
- Changing from `sticky` to `fixed` positioning resolved the issue
- Menu Bar now stays fixed below Profile and does not scroll with Content Reader
- Menu Bar is completely disconnected from Content Reader flow
- Fixed positioning works correctly for Menu Bar

**New Issue Identified**:
- **Problem**: In loading/expanded state, Menu Bar is positioned too high and cannot be seen
- **Root Cause**: Expanded state menu bar layout has not been coded yet
- **Impact**: Testing capabilities are very limited until expanded menu bar layout is implemented
- **Status**: Known limitation - will be addressed when expanded state menu bar is implemented

**Key Learnings**:
- `fixed` positioning is the correct solution for Menu Bar (matches pattern of Bottom Tab Bar and Info Menu)
- Menu Bar must be removed from document flow to prevent scrolling with Content Reader
- Expanded state menu bar layout needs to be implemented to enable full testing

---

**Status**: Attempt 3 marked as **SUCCESS**. Menu Bar sticky/fixed positioning working correctly. Expanded state layout pending implementation.

---

### Menu Bar Expanded State - Top Categories Cut Off - Step 6.6 Stage 1

**Date**: Phase 6, Step 6.6 Stage 1 (Menu Bar - Expanded State)

**Problem Statement**: In expanded state, only the bottom two categories of Main Menu are visible. Top categories are cut off above the viewport, suggesting Menu Bar container is positioned too high.

---

#### Current State Analysis

**What We Have Now (Step 6.6 Stage 1)**:

1. **Menu Bar Container** (`components/tabs/PortfolioTab.tsx` lines 919-926):
   ```tsx
   <div 
     className="fixed z-10 bg-[#1a1d23] flex justify-between items-start min-h-16 px-[60px]" 
     style={{ 
       top: profileHeight ? `${profileHeight + 25}px` : '200px',
       left: '0',
       right: '0'
     }}
   >
   ```
   - Uses `fixed` positioning (successfully changed from `sticky` in Step 6.3 Stage 3)
   - Uses `items-start` alignment (changed from `items-center` in Step 6.6 Stage 1)
   - Uses `min-h-16` (changed from `h-16` in Step 6.6 Stage 1 to allow dynamic height)
   - Has `top` value using Profile height measurement: `profileHeight + 25px` (or `200px` fallback)
   - Has `left: '0'` and `right: '0'` to span full width
   - Contains MainMenu and CollectionsMenu components

2. **MainMenu Component** (`components/tabs/MainMenu.tsx` lines 198-220):
   - Uses `flex gap-[3rem] items-start` for container
   - Categories column uses `flex flex-col gap-3` (stacks vertically from top to bottom)
   - Categories render in order: sorted by `order_index` ascending
   - Each category is a clickable div with text
   - **Expected behavior**: Categories should stack from top to bottom, starting at the top of the Menu Bar Container

3. **Profile Component** (`components/Profile.tsx`):
   - Uses `sticky top-0` positioning
   - Measures height via `getBoundingClientRect().height`
   - Reports height to PortfolioTab via `onHeightChange` callback
   - Height updates on expand/collapse and window resize

4. **User Observation**:
   - User sees only the bottom two categories ("Photo" and "Writing") in the blue-grey Menu Bar block
   - Top categories are not visible (cut off above viewport)
   - Menu Bar block is visible and positioned correctly horizontally
   - This suggests Menu Bar container's `top` value is positioning it too high

---

#### Root Cause Hypothesis

**Primary Hypothesis**: Menu Bar Container's `top` value is too high, causing the top portion of the expanded Main Menu to be positioned above the viewport.

**Possible Causes**:

1. **Profile Height Measurement Issue**:
   - `profileHeight` might be incorrectly measured or reported
   - If `profileHeight` is larger than actual Profile height, Menu Bar would be positioned too low (not the issue)
   - If `profileHeight` is smaller than actual Profile height, Menu Bar would be positioned too high (possible issue)
   - If `profileHeight` is `0` or not set, fallback `200px` is used - might be too high if actual Profile is shorter

2. **Timing Issue**:
   - `profileHeight` might not be available when Menu Bar first renders
   - Menu Bar might render with fallback `200px` before Profile height is measured
   - If actual Profile height is less than 200px, Menu Bar would be positioned too high

3. **Expanded State Height Calculation**:
   - Menu Bar Container uses `min-h-16` (minimum 64px) but expands dynamically
   - When Main Menu expands, it grows downward (as expected with `items-start`)
   - If Menu Bar's `top` value is too high, the top of the expanded menu is above viewport
   - Only the bottom portion (last two categories) is visible

4. **Fixed Positioning Behavior**:
   - `fixed` positioning positions element relative to viewport
   - If `top` value is too high, element starts above viewport
   - Content that extends above the `top` value is cut off (not visible)

---

#### Evidence from Investigation

**Code Analysis**:

1. **Menu Bar Container Positioning**:
   - `top: profileHeight ? ${profileHeight + 25}px : '200px'`
   - If `profileHeight` is `0` or `undefined`, uses `200px` fallback
   - If actual Profile height is less than 200px, Menu Bar positioned too high

2. **MainMenu Structure**:
   - Categories render in order from top to bottom (line 207-220)
   - Uses `flex flex-col gap-3` which stacks items vertically
   - First category should be at the top of the column
   - If only bottom categories visible, top categories are above viewport

3. **Alignment**:
   - Menu Bar Container uses `items-start` (aligns children to top)
   - MainMenu uses `items-start` (aligns columns to top)
   - Both should align to top, but if container is too high, top is cut off

**Visual Evidence** (from user screenshot):
- Blue-grey Menu Bar block is visible
- Only "Photo" and "Writing" categories visible (bottom two)
- Top categories not visible (cut off above viewport)
- Menu Bar positioned correctly horizontally

---

#### Specific Issues to Investigate

**Issue 1: Profile Height Measurement Accuracy**

**Hypothesis**: `profileHeight` might not be accurately measured or reported.

**Investigation Needed**:
- Check console logs for `profileHeight` value (lines 758-759)
- Verify if `profileHeight` matches actual Profile height in DevTools
- Check if Profile height measurement happens before Menu Bar renders
- Verify ResizeObserver is working correctly in Profile component

**Potential Fixes**:
- Ensure Profile height is measured before Menu Bar renders
- Add loading state if Profile height not yet available
- Verify measurement accuracy (compare with DevTools computed height)
- Consider using a more accurate measurement method

---

**Issue 2: Fallback Value Too High**

**Hypothesis**: Fallback `200px` might be too high if actual Profile height is less.

**Investigation Needed**:
- Check actual Profile height in collapsed state (should be ~150-200px)
- Check if fallback `200px` is being used when it shouldn't
- Verify if `profileHeight` is `0` or `undefined` on initial render
- Test with different Profile heights (collapsed vs expanded)

**Potential Fixes**:
- Adjust fallback value to match typical Profile height
- Use a smaller fallback (e.g., `150px` or `175px`)
- Ensure `profileHeight` is set before Menu Bar renders
- Remove fallback if Profile height is always available

---

**Issue 3: Menu Bar Container Top Calculation**

**Hypothesis**: The `top` calculation (`profileHeight + 25px`) might be incorrect.

**Investigation Needed**:
- Verify `profileHeight` value is correct
- Check if `25px` gap is appropriate
- Test with hardcoded values to isolate calculation issue
- Compare calculated `top` with actual Menu Bar position in DevTools

**Potential Fixes**:
- Adjust gap value if needed (currently `25px`)
- Verify calculation is correct: `profileHeight + 25px`
- Test with different gap values
- Consider using CSS `calc()` for more reliable calculation

---

**Issue 4: Expanded State Height Not Accounted For**

**Hypothesis**: Menu Bar Container's `top` value doesn't account for expanded state height.

**Investigation Needed**:
- Check if Menu Bar expands upward or downward
- Verify `items-start` alignment is working correctly
- Test if Menu Bar needs additional spacing when expanded
- Check if expanded height affects positioning

**Potential Fixes**:
- Ensure Menu Bar expands downward (not upward)
- Verify `items-start` aligns content to top correctly
- Add padding or margin if needed for expanded state
- Consider dynamic `top` adjustment based on expanded height

---

#### Recommended Investigation Steps

**Step 1: Verify Profile Height Measurement**
1. Open browser console (F12 → Console tab)
2. Check console logs for:
   - `Profile Height: X px` - should show actual height
   - `Menu Bar Top Value: Xpx` - should show calculated value
3. Compare with DevTools:
   - Inspect Profile element
   - Check computed height in DevTools
   - Compare with logged `profileHeight` value
4. Verify if values match

**Step 2: Check Menu Bar Position**
1. Inspect Menu Bar Container element in DevTools
2. Check Computed styles:
   - `position` should be `fixed` ✅
   - `top` should show actual calculated value
   - Compare with expected value (`profileHeight + 25px`)
3. Check if `top` value is too high (above viewport)
4. Measure distance from viewport top to Menu Bar top

**Step 3: Test with Hardcoded Values**
1. Temporarily hardcode `top` value (e.g., `top: '250px'`)
2. Test if Menu Bar appears at correct position
3. Test if all categories are visible
4. Isolate if issue is with calculation or positioning

**Step 4: Verify Expanded State Behavior**
1. Check if Main Menu expands correctly
2. Verify categories stack from top to bottom
3. Test if `items-start` alignment is working
4. Check if expanded height affects visibility

---

#### Potential Fix Strategies

**Strategy A: Adjust Fallback Value** (Simplest)
- Change fallback from `200px` to a smaller value (e.g., `150px` or `175px`)
- Ensures Menu Bar doesn't start too high if `profileHeight` not yet measured
- Quick fix if fallback is the issue

**Strategy B: Ensure Profile Height Available Before Render** (Timing)
- Add loading state until `profileHeight` is measured
- Don't render Menu Bar until `profileHeight` is available
- Prevents fallback from being used incorrectly

**Strategy C: Adjust Top Calculation** (Positioning)
- Verify `profileHeight + 25px` calculation is correct
- Test with different gap values (e.g., `20px` or `30px`)
- Consider using CSS `calc()` for more reliable calculation

**Strategy D: Add Padding/Margin for Expanded State** (Spacing)
- Add top padding to Menu Bar Container when expanded
- Account for expanded height in positioning
- Ensure top categories have space above viewport

**Strategy E: Verify Profile Height Measurement** (Accuracy)
- Check if Profile height measurement is accurate
- Compare measured height with actual rendered height
- Fix measurement if inaccurate

---

#### Success Criteria

**Menu Bar expanded state working correctly when**:
1. ✅ All categories are visible (not just bottom two)
2. ✅ Top categories are not cut off above viewport
3. ✅ Menu Bar positioned correctly below Profile (25px gap)
4. ✅ Menu Bar expands downward (not upward)
5. ✅ Categories stack from top to bottom correctly
6. ✅ Menu Bar stays fixed when scrolling
7. ✅ Works in both collapsed and expanded states

---

#### Next Actions (When Ready to Fix)

1. **Investigate** (no code changes):
   - Check console logs for `profileHeight` value
   - Verify Profile height measurement accuracy
   - Check Menu Bar `top` value in DevTools
   - Compare calculated vs actual position

2. **Test Strategy A** (Adjust fallback):
   - Change fallback from `200px` to smaller value
   - Test if Menu Bar appears at correct position
   - Verify all categories are visible

3. **Test Strategy B** (Ensure height available):
   - Add loading state for Profile height
   - Don't render Menu Bar until height available
   - Test if this prevents fallback usage

4. **Test Strategy C** (Adjust calculation):
   - Verify `profileHeight + 25px` calculation
   - Test with different gap values
   - Use CSS `calc()` if needed

5. **Document results**:
   - Record what worked
   - Update this section
   - Mark issue resolved when fixed

---

**Status**: Investigation complete. Awaiting user feedback and approval to proceed with fixes.

---

#### User Investigation Results

**Date**: Step 6.6 Stage 1 - User DevTools Investigation

**Critical Finding 1: Profile Height is 0px**
- Console log shows: `profileHeight: 0px`
- **Root Cause Identified**: Profile component is not measuring or reporting its height correctly
- **Impact**: Menu Bar is using fallback `200px` value instead of actual Profile height
- **Result**: Menu Bar positioned incorrectly, causing top categories to be cut off

**Critical Finding 2: Top Value Not Visible in DevTools**
- User checked Elements panel (right side with parameters)
- Could not find `top` value for Menu Bar Container
- **Possible Reasons**:
  1. Inline style might not be applied correctly
  2. User might be looking in wrong section (should check "Styles" or "Computed" tab)
  3. CSS might be overriding inline style
  4. Element might not be selected correctly

**Analysis**:
- If `profileHeight` is `0px`, the code uses fallback: `top: '200px'`
- Menu Bar should be positioned at `200px` from top of viewport
- If actual Profile height is less than 200px, Menu Bar would be positioned too high
- This explains why top categories are cut off - Menu Bar starts above where it should

**Root Cause Confirmed**:
- Profile height measurement is failing (returning `0px`)
- Menu Bar falls back to `200px` positioning
- If actual Profile is shorter than 200px, Menu Bar is positioned too high
- Top portion of expanded Menu Bar is cut off above viewport

**Why Profile Height is 0px**:

Looking at `components/Profile.tsx`:
- Line 82: `if (!profile) return null` - Component returns null if profile data hasn't loaded
- Lines 47-70: Height measurement useEffect depends on `headerRef.current` being available
- **Timing Issue**: If Profile component returns `null` initially (before data loads), the `headerRef` is never attached to an element
- When profile data loads and component renders, the useEffect might not re-trigger measurement correctly
- Result: `profileHeight` stays at `0px` because measurement never happens or happens before element is rendered

---

#### Updated Fix Strategies (Based on Root Cause)

**Strategy A: Fix Profile Height Measurement Timing** (Primary Fix)
- **Problem**: Profile component returns `null` before data loads, preventing height measurement
- **Solution**: Ensure height measurement happens after Profile component fully renders
- **Changes Needed**:
  1. In `Profile.tsx`, add dependency on `profile` in the useEffect (line 70)
  2. Or add a separate useEffect that triggers when `profile` data loads
  3. Or ensure measurement happens after `headerRef.current` is definitely available
- **Expected Result**: `profileHeight` will be measured correctly, Menu Bar will use actual height instead of fallback

**Strategy B: Add Fallback Check in PortfolioTab** (Secondary Fix)
- **Problem**: Even if Profile height measurement is fixed, there might be initial render timing issues
- **Solution**: In `PortfolioTab.tsx`, add a check to wait for Profile height before positioning Menu Bar
- **Changes Needed**:
  1. Only render Menu Bar when `profileHeight > 0`
  2. Or show a loading state until Profile height is available
  3. Or use a more accurate fallback based on typical Profile height
- **Expected Result**: Menu Bar won't render with incorrect positioning

**Strategy C: Improve Profile Height Measurement** (Robustness)
- **Problem**: Current measurement might fail in edge cases
- **Solution**: Add error handling and retry logic to Profile height measurement
- **Changes Needed**:
  1. Add console.log to debug when measurement happens
  2. Add check to ensure `rect.height` is valid before calling `onHeightChange`
  3. Add retry mechanism if height is 0
- **Expected Result**: More reliable height measurement

**Strategy D: Use CSS for Initial Positioning** (Alternative)
- **Problem**: JavaScript measurement has timing issues
- **Solution**: Use CSS to position Menu Bar initially, then refine with JavaScript
- **Changes Needed**:
  1. Set initial `top` value in CSS (e.g., `top: 200px`)
  2. Use JavaScript to update `top` value once Profile height is measured
  3. This prevents Menu Bar from being positioned incorrectly during initial render
- **Expected Result**: Menu Bar starts at reasonable position, then adjusts when height is measured

---

#### Recommended Solution (Priority Order)

**1. Fix Profile Height Measurement (Strategy A)** - Most Important
- This is the root cause - Profile height is not being measured
- Fix the timing issue in Profile component's useEffect
- Ensure measurement happens after Profile component fully renders

**2. Add Safety Check in PortfolioTab (Strategy B)** - Important
- Even after fixing measurement, add safety check
- Prevent Menu Bar from rendering with `0px` height
- Use better fallback or wait for measurement

**3. Improve Measurement Robustness (Strategy C)** - Nice to Have
- Add error handling and debugging
- Make measurement more reliable

**4. CSS Initial Positioning (Strategy D)** - Alternative Approach
- If JavaScript measurement continues to have issues, use CSS fallback
- More complex but might be more reliable

---

#### Next Steps

1. **Fix Profile Height Measurement**:
   - Update `Profile.tsx` useEffect to depend on `profile` data
   - Ensure measurement happens after component renders
   - Add console.log to verify measurement is working

2. **Add Safety Check**:
   - Update `PortfolioTab.tsx` to check `profileHeight > 0` before using it
   - Or wait for Profile height before rendering Menu Bar

3. **Test and Verify**:
   - Check console logs - `profileHeight` should show actual height (not 0px)
   - Verify Menu Bar `top` value in DevTools Computed styles
   - Verify all categories are visible in expanded state

---

#### Implementation: Strategy A - Fix Profile Height Measurement Timing

**Date**: Step 6.6 Stage 1 - Strategy A Implementation

**Problem Fixed**:
- Profile height measurement was returning `0px` because the useEffect didn't re-run when profile data loaded
- Component returns `null` before profile data loads, so `headerRef` was never attached
- When profile data loaded, the useEffect didn't re-trigger because it only depended on `onHeightChange`

**Solution Implemented**:

**File 1: `components/Profile.tsx`** (Lines 46-70)

**Changes Made**:
1. **Added `profile` and `isExpanded` to dependency array**:
   - Changed from `[onHeightChange]` to `[onHeightChange, profile, isExpanded]`
   - Effect now re-runs when profile data loads
   - Effect re-runs when expanded state changes (height changes)

2. **Added early return check for profile data**:
   - Added `if (!profile) return` at start of effect
   - Prevents measurement attempt before profile data is available

3. **Added setTimeout for DOM rendering**:
   - Wrapped initial measurement in `setTimeout(..., 0)`
   - Ensures measurement happens after DOM is fully rendered
   - Important when profile data first loads

4. **Added console.log for debugging**:
   - Logs when `headerRef.current` is null (shouldn't happen)
   - Logs measured height value for verification

**Before**:
```tsx
useEffect(() => {
  if (!onHeightChange) return
  const element = headerRef.current
  if (!element) return
  // ... measurement code ...
}, [onHeightChange])
```

**After**:
```tsx
useEffect(() => {
  if (!onHeightChange) return
  if (!profile) return // Don't measure if profile hasn't loaded yet
  const element = headerRef.current
  if (!element) {
    console.log('[Profile] headerRef.current is null, cannot measure height')
    return
  }
  // ... measurement code with setTimeout ...
}, [onHeightChange, profile, isExpanded]) // Added dependencies
```

**File 2: `components/tabs/PortfolioTab.tsx`** (Lines 756-759)

**Changes Made**:
1. **Improved console logging**:
   - Added warning when `profileHeight === 0`
   - More descriptive fallback message
   - Helps identify when Profile height measurement is working

**Before**:
```tsx
console.log('Profile Height:', profileHeight, 'px')
console.log('Menu Bar Top Value:', profileHeight ? `${profileHeight + 25}px` : '200px (fallback)')
```

**After**:
```tsx
if (profileHeight === 0) {
  console.warn('[PortfolioTab] Profile Height is 0px - Profile component may not have measured height yet')
} else {
  console.log('Profile Height:', profileHeight, 'px')
}
console.log('Menu Bar Top Value:', profileHeight > 0 ? `${profileHeight + 25}px` : '200px (fallback - Profile height not yet measured)')
```

**Expected Behavior**:
1. ✅ Profile component measures height after profile data loads
2. ✅ Profile component measures height when expanded/collapsed state changes
3. ✅ `profileHeight` state in PortfolioTab updates with actual height (not 0px)
4. ✅ Menu Bar uses actual Profile height instead of fallback `200px`
5. ✅ Menu Bar positioned correctly below Profile (25px gap)
6. ✅ All categories visible in expanded state (not cut off)

**Testing Instructions**:
1. Open browser console (F12 → Console tab)
2. Navigate to portfolio page
3. Check console logs:
   - Should see `[Profile] Height measured: XXX px` (not 0px)
   - Should see `Profile Height: XXX px` in PortfolioTab logs (not 0px)
   - Should see `Menu Bar Top Value: XXXpx` (not fallback)
4. Inspect Menu Bar Container in DevTools:
   - Check Computed styles → `top` should show actual calculated value
   - Should be `profileHeight + 25px` (not 200px)
5. Verify expanded state:
   - Click to expand Main Menu
   - All categories should be visible (not just bottom two)
   - Top categories should not be cut off

**Status**: ✅ SUCCESS - Fix verified by user. Profile and Menu Bar working as expected.

**Result**: ✅ SUCCESS - Profile height measurement fixed. User confirmed Profile and Menu Bar work as expected. All categories visible in expanded state, Menu Bar positioned correctly below Profile.

---

---

#### User Investigation Results

**Date**: Step 6.6 Stage 1 - User DevTools Investigation

**Critical Finding 1: Profile Height is 0px**
- Console log shows: `profileHeight: 0px`
- **Root Cause Identified**: Profile component is not measuring or reporting its height correctly
- **Impact**: Menu Bar is using fallback `200px` value instead of actual Profile height
- **Result**: Menu Bar positioned incorrectly, causing top categories to be cut off

**Critical Finding 2: Top Value Not Visible in DevTools**
- User checked Elements panel (right side with parameters)
- Could not find `top` value for Menu Bar Container
- **Possible Reasons**:
  1. Inline style might not be applied correctly
  2. User might be looking in wrong section (should check "Styles" or "Computed" tab)
  3. CSS might be overriding inline style
  4. Element might not be selected correctly

**Analysis**:
- If `profileHeight` is `0px`, the code uses fallback: `top: '200px'`
- Menu Bar should be positioned at `200px` from top of viewport
- If actual Profile height is less than 200px, Menu Bar would be positioned too high
- This explains why top categories are cut off - Menu Bar starts above where it should

**Next Steps Needed**:
1. Fix Profile height measurement (why is it `0px`?) ✅ COMPLETE - Strategy A implemented
2. Verify Menu Bar `top` value is actually applied (check Computed styles tab) ✅ COMPLETE - User verified working
3. Compare expected vs actual Menu Bar position ✅ COMPLETE - User verified working

**Implementation Status**: ✅ Strategy A implemented and verified successful. User confirmed "Profile and Menu bar work as expected". Issue resolved. All categories visible in expanded state, Menu Bar positioned correctly below Profile.

---

### Menu Bar Positioning Gap Issue - Bug Investigation

**Date**: Current Investigation

**Problem Statement**: Menu bar is placed incorrectly. There is a visible gap between the Profile tab and the Menu bar of approximately 25px. The gap appears to be incorrectly positioned or should not exist.

---

#### Current State Analysis

**What We Have Now**:

1. **Menu Bar Container Positioning** (`components/tabs/PortfolioTab.tsx` lines 923-929):
   ```tsx
   <div 
     className="fixed z-10 bg-[#1a1d23] flex justify-between items-start min-h-16 px-[60px]" 
     style={{ 
       top: profileHeight ? `${profileHeight + 25}px` : '200px',
       left: '0',
       right: '0'
     }}
   >
   ```
   - Uses `fixed` positioning
   - `top` value calculated as: `profileHeight + 25px`
   - This creates a 25px gap between Profile bottom and Menu Bar top

2. **Profile Component** (`components/Profile.tsx` lines 96-99):
   ```tsx
   <header
     ref={headerRef}
     className="border-b border-gray-800 transition-all duration-300 sticky top-0 z-40 bg-[#0f1419]"
   >
   ```
   - Has `border-b border-gray-800` (bottom border, ~1px)
   - Uses `sticky top-0` positioning
   - `headerRef` is attached to the `<header>` element
   - Height measurement uses `getBoundingClientRect().height` which includes the border

3. **Profile Height Measurement** (`components/Profile.tsx` lines 58-62):
   ```tsx
   const updateHeight = () => {
     const rect = element.getBoundingClientRect()
     const height = rect.height
     console.log('[Profile] Height measured:', height, 'px')
     onHeightChange(height)
   }
   ```
   - Measures the full height of the `<header>` element including border
   - Reports this height to PortfolioTab via `onHeightChange` callback

4. **Layout Specification** (`portfolio-layout-reset.md` lines 287, 388):
   - Line 287: "**Vertical spacing**: 25px gap between Profile bottom and Menu Bar top"
   - Line 388: "**Space between Profile and Menu Bar**: 25px ✅ DEFINED"
   - Specification explicitly calls for a 25px gap

5. **Console Logs** (from browser investigation):
   - Profile Height: 293.8125 px
   - Menu Bar Top Value: 318.8125px (293.8125 + 25 = 318.8125)
   - Calculation is working correctly

---

#### Root Cause Analysis

**Possible Issues**:

1. **Profile Border Included in Measurement**:
   - Profile has `border-b border-gray-800` (bottom border)
   - `getBoundingClientRect().height` includes this border in the measurement
   - When Menu Bar is positioned at `profileHeight + 25px`, the 25px gap is added AFTER the border
   - **Result**: Visual gap appears to be 25px + border width (~26px total)

2. **Gap Should Be Zero**:
   - User reports gap is "incorrectly placed"
   - May indicate the gap should be 0px (Menu Bar should be directly against Profile bottom)
   - Current specification says 25px, but user feedback suggests this is wrong

3. **Visual Gap Appears Larger**:
   - Profile background: `bg-[#0f1419]` (dark)
   - Menu Bar background: `bg-[#1a1d23]` (slightly lighter dark)
   - Profile border: `border-gray-800` (dark gray)
   - Color contrast between Profile and Menu Bar might make gap more visible
   - Gap might appear larger than 25px due to visual perception

4. **Border Creates Double Gap Effect**:
   - Profile bottom border creates a visual separator
   - 25px gap adds additional space
   - Combined effect might look like a larger, incorrect gap

---

#### Investigation Findings

**Code Analysis**:
- Menu Bar positioning calculation: `profileHeight + 25px` ✅ Matches specification
- Profile height measurement: Includes border in measurement ✅ Technically correct
- Specification: Calls for 25px gap ✅ Matches implementation

**Visual Analysis** (from browser):
- Gap is visible between Profile and Menu Bar
- Gap appears to be approximately 25px as reported
- Profile has a bottom border that is part of the measured height
- Menu Bar background color differs slightly from Profile background

**Potential Problems**:
1. **Border + Gap = Visual Issue**: Profile border (~1px) + 25px gap = ~26px visual gap, which might look incorrect
2. **Specification vs. User Expectation**: Specification says 25px, but user reports it's "incorrectly placed"
3. **Measurement Includes Border**: Profile height includes border, so gap is added after border, not accounting for it

---

#### Suggested Fix Strategies

**Strategy A: Remove the 25px Gap (Set Gap to 0px)**
- **Change**: Set Menu Bar `top` to `profileHeight` (remove the `+ 25px`)
- **Rationale**: If user expects no gap, this would place Menu Bar directly against Profile bottom
- **Impact**: Menu Bar would be positioned at Profile bottom edge (including border)
- **Code Change**: `top: profileHeight ? `${profileHeight}px` : '200px'`
- **Note**: Would require updating specification if this is the correct behavior

**Strategy B: Account for Profile Border in Gap Calculation**
- **Change**: Subtract border width from gap, or measure Profile height without border
- **Rationale**: If 25px gap is intended, it should be 25px from Profile content (not including border)
- **Impact**: Gap would be exactly 25px from Profile content, border would be separate
- **Code Change**: 
  - Option 1: `top: profileHeight ? `${profileHeight + 25 - 1}px` : '200px'` (subtract border)
  - Option 2: Measure Profile height without border using `clientHeight` instead of `getBoundingClientRect().height`
- **Note**: Border width might vary, would need to measure it dynamically

**Strategy C: Remove Profile Bottom Border**
- **Change**: Remove `border-b border-gray-800` from Profile component
- **Rationale**: Border creates visual separation, removing it might make gap less noticeable
- **Impact**: Profile would have no bottom border, gap would be cleaner
- **Code Change**: Remove `border-b border-gray-800` from Profile className
- **Note**: Border might be intentional for visual design

**Strategy D: Adjust Gap Value Based on User Feedback**
- **Change**: Change gap from 25px to a different value (e.g., 0px, 10px, 20px)
- **Rationale**: 25px might be too large, user might prefer smaller or no gap
- **Impact**: Gap would be adjusted to user preference
- **Code Change**: `top: profileHeight ? `${profileHeight + NEW_VALUE}px` : '200px'`
- **Note**: Would need user confirmation on desired gap size

**Strategy E: Use CSS Gap Instead of Top Calculation**
- **Change**: Position Menu Bar at `profileHeight`, use CSS `margin-top` or `gap` for spacing
- **Rationale**: Separates positioning from spacing, might be more maintainable
- **Impact**: Same visual result, but different implementation approach
- **Code Change**: 
  - `top: profileHeight ? `${profileHeight}px` : '200px'`
  - Add `marginTop: '25px'` or use CSS gap
- **Note**: Would need to ensure this works with `fixed` positioning

---

#### Recommended Investigation Steps

1. **Clarify User Intent**:
   - Confirm if gap should be 0px (no gap) or a different value
   - Verify if gap is visually incorrect or just unwanted
   - Check if border should be part of the gap calculation

2. **Measure Actual Visual Gap**:
   - Use browser DevTools to measure exact pixel gap
   - Check if gap is exactly 25px or appears larger
   - Verify if border is creating additional visual space

3. **Test Border Impact**:
   - Temporarily remove Profile border to see if gap looks correct
   - Test with different border widths
   - Verify if border should be included in gap calculation

4. **Compare with Specification**:
   - Review if 25px gap specification is correct
   - Check if specification needs updating based on user feedback
   - Verify if "directly below Profile" means 0px gap

---

#### Success Criteria

**Menu Bar positioning fixed when**:
1. ✅ Gap between Profile and Menu Bar matches user expectation (0px or specified value)
2. ✅ Menu Bar positioned correctly relative to Profile bottom
3. ✅ No visual inconsistencies or incorrect spacing
4. ✅ Border (if present) is accounted for correctly
5. ✅ Specification updated if gap value changes

---

#### Next Actions (When Ready to Fix)

1. **Clarify with User**:
   - What is the desired gap size? (0px, 10px, 20px, 25px, other?)
   - Should Profile border be included in gap calculation?
   - Is the gap visually incorrect or just unwanted?

2. **Test Strategy A** (Remove gap):
   - Change `top` to `profileHeight` (remove `+ 25px`)
   - Test if Menu Bar appears correctly positioned
   - Verify if this matches user expectation

3. **Test Strategy B** (Account for border):
   - Measure border width dynamically
   - Adjust gap calculation to account for border
   - Test if gap appears as intended

4. **Test Strategy C** (Remove border):
   - Remove Profile bottom border
   - Test if gap looks correct without border
   - Verify if border removal affects design

5. **Update Specification**:
   - If gap value changes, update `portfolio-layout-reset.md`
   - Document the correct gap value and reasoning
   - Update any related documentation

---

**Status**: Investigation complete. Awaiting user clarification on desired gap size and border handling before proceeding with fixes.

---

#### Implementation: Strategy A - Remove 25px Gap (Set to 0px)

**Date**: Bug Fix Implementation

**User Request**:
- Set gap to 0px (gap is unwanted)
- Keep Profile measurement with border (border is ~1px and should stay)
- Menu bar should always stick with Profile tab border (if border moves up, menu bar moves up with it)

**Solution Implemented**:

**File 1: `components/tabs/PortfolioTab.tsx`** (Lines 925-929)

**Changes Made**:
1. **Removed 25px gap from Menu Bar positioning**:
   - Changed from `top: profileHeight + 25px` to `top: profileHeight`
   - Menu Bar now positioned directly at Profile bottom (including border)
   - Menu Bar will move with Profile border as Profile height changes

**Before**:
```tsx
style={{ 
  top: profileHeight ? `${profileHeight + 25}px` : '200px',
  left: '0',
  right: '0'
}}
```

**After**:
```tsx
style={{ 
  top: profileHeight ? `${profileHeight}px` : '200px',
  left: '0',
  right: '0'
}}
```

**File 2: `components/tabs/PortfolioTab.tsx`** (Line 763)

**Changes Made**:
1. **Updated console log to reflect new positioning**:
   - Changed from `${profileHeight + 25}px` to `${profileHeight}px`
   - Debug output now shows correct Menu Bar top value

**Before**:
```tsx
console.log('Menu Bar Top Value:', profileHeight > 0 ? `${profileHeight + 25}px` : '200px (fallback - Profile height not yet measured)')
```

**After**:
```tsx
console.log('Menu Bar Top Value:', profileHeight > 0 ? `${profileHeight}px` : '200px (fallback - Profile height not yet measured)')
```

**How It Works**:
- Profile component measures its full height including the ~1px bottom border via `getBoundingClientRect().height`
- This height is reported to PortfolioTab via `onHeightChange` callback
- Menu Bar is positioned at `top: profileHeight`, placing it directly at Profile bottom edge
- Since `profileHeight` includes the border, Menu Bar sticks with the border
- When Profile height changes (expand/collapse, window resize), `profileHeight` updates and Menu Bar moves accordingly
- Menu Bar always stays aligned with Profile border bottom edge

**Expected Behavior**:
1. ✅ No gap between Profile and Menu Bar (0px gap)
2. ✅ Menu Bar positioned directly at Profile bottom edge (including border)
3. ✅ Menu Bar sticks with Profile border (moves when Profile height changes)
4. ✅ Profile border (~1px) remains part of Profile measurement
5. ✅ Menu Bar follows Profile border position dynamically

**Testing Instructions**:
1. Open browser console (F12 → Console tab)
2. Check console logs:
   - `Profile Height: XXX px` - should show height including border
   - `Menu Bar Top Value: XXXpx` - should match Profile Height (no +25px)
3. Inspect Menu Bar Container in DevTools:
   - Check Computed styles → `top` should equal Profile height (not Profile height + 25px)
4. Visual verification:
   - Menu Bar should be directly against Profile bottom (no visible gap)
   - Menu Bar should align with Profile border bottom edge
5. Test Profile expand/collapse:
   - Expand Profile → Menu Bar should move down with Profile
   - Collapse Profile → Menu Bar should move up with Profile
   - Menu Bar should always stay aligned with Profile border

**Status**: ✅ SUCCESS - Fix verified by user. Gap removed (0px), Menu Bar sticks with Profile border.

**Result**: ✅ SUCCESS - Menu Bar positioning gap issue resolved. User confirmed fix is successful. Menu Bar now positioned directly at Profile bottom edge (0px gap) and sticks with Profile border. Menu Bar moves dynamically with Profile height changes, maintaining alignment with Profile border bottom edge.

**User Verification**: ✅ User confirmed "Mark this bug fix as successful" - Menu Bar positioning gap issue resolved, gap removed (0px), Menu Bar sticks with Profile border, Menu Bar moves with Profile height changes.

---

### Content Reader Positioning Too High - Collapsed Mode Bug Fix

**Date**: Current Bug Fix

**Problem Statement**: Content Reader is positioned too high in collapsed mode. The Content Reader needs to be moved down by 70px to correct its vertical positioning.

**Scope**: This fix applies ONLY to collapsed mode. Expanded mode positioning is not affected by this change.

---

#### Current State Analysis

**What We Have Now**:

1. **ContentReader Component** (`components/ContentReader.tsx` lines 57-66):
   ```tsx
   // Collapsed state positioning: 35px below Menu Bar, 50px gap from right edge
   const marginTop = '35px' // Spacing from Menu Bar bottom (layout-reset.md line 337)
   
   const marginRight = positioning === 'collapsed' ? '50px' : '0px'
   const marginLeft = positioning === 'collapsed' ? '295px' : '0px'
   ```
   - Uses `marginTop: '35px'` for spacing from Menu Bar bottom
   - This applies to both collapsed and expanded states
   - Current spacing is 35px below Menu Bar

2. **Layout Specification** (`portfolio-layout-reset.md` line 337):
   - Line 337: "**Top margin**: 35px gap between Menu Bar bottom and Content Reader top"
   - Specification calls for 35px gap

3. **User Observation**:
   - Content Reader appears too high in collapsed mode
   - Needs to be moved down by 70px
   - Only collapsed mode affected, expanded mode positioning remains unchanged

---

#### Root Cause Analysis

**Issue Identified**:
- Content Reader `marginTop` is currently `'35px'` for all states
- In collapsed mode, this 35px spacing is insufficient
- Content Reader needs additional 70px spacing in collapsed mode only
- New collapsed mode spacing should be: 35px + 70px = 105px

**Why Only Collapsed Mode**:
- User explicitly stated: "only limit yourself to collapsed mode, don't concern with expanded mode"
- Expanded mode positioning will be handled separately
- This fix is specific to collapsed state layout

---

#### Solution Implementation

**Strategy**: Make `marginTop` conditional based on `positioning` prop
- Collapsed state: `marginTop: '105px'` (35px original + 70px additional)
- Expanded state: `marginTop: '35px'` (unchanged)

**Code Changes**:

**File: `components/ContentReader.tsx`** (Lines 57-66)

**Before**:
```tsx
// Collapsed state positioning: 35px below Menu Bar, 50px gap from right edge (per layout-reset.md lines 323, 337)
// Content Reader is foundation of page - other elements positioned on top of it
// Simple margins, no vh-based calculations - browser scrollbar handles scrolling
const marginTop = '35px' // Spacing from Menu Bar bottom (layout-reset.md line 337)

// Collapsed state horizontal positioning
const marginRight = positioning === 'collapsed' ? '50px' : '0px' // Gap from right edge (layout-reset.md line 323)
// Left margin: Info Menu left (25px) + Info Menu width (estimated 250px) + gap (20px) = 295px
// Fills space between Info Menu right edge and right edge of page (per layout-reset.md line 322)
const marginLeft = positioning === 'collapsed' ? '295px' : '0px' // Collapsed: starts after Info Menu; Expanded: placeholder for Step 6.6
```

**After**:
```tsx
// Collapsed state positioning: 105px below Menu Bar (35px original + 70px additional), 50px gap from right edge (per layout-reset.md lines 323, 337)
// Content Reader is foundation of page - other elements positioned on top of it
// Simple margins, no vh-based calculations - browser scrollbar handles scrolling
const marginTop = positioning === 'collapsed' ? '105px' : '35px' // Collapsed: 105px spacing (35px + 70px fix); Expanded: 35px spacing unchanged

// Collapsed state horizontal positioning
const marginRight = positioning === 'collapsed' ? '50px' : '0px' // Gap from right edge (layout-reset.md line 323)
// Left margin: Info Menu left (25px) + Info Menu width (estimated 250px) + gap (20px) = 295px
// Fills space between Info Menu right edge and right edge of page (per layout-reset.md line 322)
const marginLeft = positioning === 'collapsed' ? '295px' : '0px' // Collapsed: starts after Info Menu; Expanded: placeholder for Step 6.6
```

**Changes Made**:
1. **Made `marginTop` conditional**: Changed from fixed `'35px'` to `positioning === 'collapsed' ? '105px' : '35px'`
2. **Updated comment**: Changed from "35px below Menu Bar" to "105px below Menu Bar (35px original + 70px additional)" for collapsed state
3. **Preserved expanded state**: Expanded state remains at `'35px'` as specified

**How It Works**:
- When `positioning === 'collapsed'`: Content Reader uses `marginTop: '105px'` (moved down 70px from original 35px)
- When `positioning === 'expanded'`: Content Reader uses `marginTop: '35px'` (unchanged)
- Only collapsed mode positioning is affected by this fix

---

#### Expected Behavior

1. ✅ Content Reader positioned 105px below Menu Bar in collapsed mode (moved down 70px)
2. ✅ Content Reader positioned 35px below Menu Bar in expanded mode (unchanged)
3. ✅ Fix applies only to collapsed mode as requested
4. ✅ Expanded mode positioning not affected

---

#### Testing Instructions

1. Navigate to portfolio page in browser
2. Select content to enter collapsed-reader state
3. Verify Content Reader position:
   - Should be 105px below Menu Bar (not 35px)
   - Should appear lower than before (70px additional spacing)
4. Verify expanded mode (if accessible):
   - Content Reader should remain at 35px spacing (unchanged)
5. Check browser DevTools:
   - Inspect ContentReader element
   - Check Computed styles → `margin-top` should be `105px` in collapsed mode
   - Check Computed styles → `margin-top` should be `35px` in expanded mode

---

#### Status

**Implementation**: ✅ Complete - Code changes made to make `marginTop` conditional based on `positioning` prop

**Result**: Content Reader moved down 70px in collapsed mode only. Collapsed state now uses `marginTop: '105px'` (35px original + 70px additional). Expanded state remains unchanged at `marginTop: '35px'`.

---

### Feature Change: Content Reader Disappears When Menu Bar is Expanded

**Date**: Current Investigation

**Problem Statement**: This is a big change from the original plan. The requirement is:
- **Expanded-reader state is fully turned off** - Content Reader should never be visible when menu bar is expanded
- **Page loads without Content Reader** - Initial load should not show Content Reader, even if content is auto-selected
- **Any click on Main Menu turns off Content Reader** - Clicking category, subcategory, or any Main Menu item should hide Content Reader
- **Content Reader only visible in collapsed-reader state** - Content Reader should only appear when menu bar is collapsed

**Scope**: This is a significant change from the original state machine design. Expanded-reader state functionality is being removed.

---

#### Current State Analysis

**What We Have Now**:

1. **State Machine** (`components/tabs/PortfolioTab.tsx` line 14):
   ```tsx
   type PageState = 'expanded-empty' | 'expanded-reader' | 'collapsed-reader'
   ```
   - Three states: `expanded-empty`, `expanded-reader`, `collapsed-reader`
   - All three states are part of the current implementation

2. **Initial State** (`components/tabs/PortfolioTab.tsx` line 112):
   ```tsx
   const [pageState, setPageState] = useState<PageState>('expanded-reader')
   ```
   - Page loads in `expanded-reader` state
   - This means Content Reader is visible on initial load (if content is selected)

3. **ContentReader Visibility** (`components/tabs/PortfolioTab.tsx` lines 956-963):
   ```tsx
   {/* ContentReader - visible in reader states (collapsed-reader, expanded-reader) */}
   {(pageState === 'collapsed-reader' || pageState === 'expanded-reader') && (
     <ContentReader
       content={selectedContent}
       isVisible={true}
       positioning={pageState === 'expanded-reader' ? 'expanded' : 'collapsed'}
     />
   )}
   ```
   - Content Reader is visible in BOTH `collapsed-reader` AND `expanded-reader` states
   - This is the current behavior that needs to change

4. **State Transition Rules** (`components/tabs/PortfolioTab.tsx` lines 856-883):
   - **Rule 1**: Category click → `expanded-empty` (line 861)
   - **Rule 2**: Subcategory click → `expanded-empty` (line 868)
   - **Rule 3**: Content click → `collapsed-reader` (line 874)
   - **Rule 4**: Main menu click (collapsed state) → `expanded-reader` (line 880)
   - **Current behavior**: Rule 4 expands menu and shows Content Reader in expanded state

5. **Auto-Selection on Load** (`components/tabs/PortfolioTab.tsx` lines 658-663):
   ```tsx
   // Step 7: Set page state based on selections
   if (selectedContent) {
     setPageState('expanded-reader') // Normal: content selected
   } else {
     setPageState('expanded-empty') // Edge case: no content
   }
   ```
   - If content is auto-selected on load, pageState is set to `expanded-reader`
   - This causes Content Reader to be visible on initial load

6. **Collection Tab Opening** (`components/tabs/PortfolioTab.tsx` lines 892, 901):
   ```tsx
   setPageState('expanded-reader') // Collection tab opens in expanded-reader state
   ```
   - Collection tabs also open in `expanded-reader` state
   - This would show Content Reader when collection tab opens

---

#### Original Plan vs. New Requirement

**Original Plan** (from `portfolio-layout-reset.md` lines 62-66):
- Three states: `expanded-empty`, `expanded-reader`, `collapsed-reader`
- Rules:
  - Click category/subcategory → menus expanded, Content Reader closed (`expanded-empty`)
  - Click content → menus collapsed, Content Reader visible (`collapsed-reader`)
  - Click collapsed menu bar → menus expand again, same selection (`expanded-reader`)
- **Content Reader visible in both `expanded-reader` and `collapsed-reader` states**

**New Requirement**:
- **Content Reader ONLY visible in `collapsed-reader` state**
- **Content Reader NEVER visible in `expanded-reader` state**
- **Page loads without Content Reader** (should load in `expanded-empty` state, not `expanded-reader`)
- **Any Main Menu click turns off Content Reader** (category/subcategory clicks already do this, but Rule 4 needs to change)

---

#### Impact Analysis

**What Needs to Change**:

1. **ContentReader Visibility Logic** (`components/tabs/PortfolioTab.tsx` lines 956-963):
   - **Current**: `(pageState === 'collapsed-reader' || pageState === 'expanded-reader')`
   - **New**: `pageState === 'collapsed-reader'` only
   - **Impact**: Content Reader will only render in collapsed-reader state

2. **Initial State** (`components/tabs/PortfolioTab.tsx` line 112):
   - **Current**: `useState<PageState>('expanded-reader')`
   - **New**: `useState<PageState>('expanded-empty')`
   - **Impact**: Page loads without Content Reader visible

3. **Auto-Selection State Setting** (`components/tabs/PortfolioTab.tsx` lines 658-663):
   - **Current**: If content selected → `setPageState('expanded-reader')`
   - **New**: If content selected → `setPageState('expanded-empty')` (or keep `expanded-reader` but Content Reader won't show)
   - **Impact**: Even if content is auto-selected, Content Reader won't be visible on load

4. **Rule 4: Main Menu Click** (`components/tabs/PortfolioTab.tsx` lines 878-883):
   - **Current**: `if (pageState === 'collapsed-reader') { setPageState('expanded-reader') }`
   - **New**: `if (pageState === 'collapsed-reader') { setPageState('expanded-empty') }`
   - **Impact**: Clicking collapsed menu bar will expand menu and hide Content Reader

5. **Collection Tab Opening** (`components/tabs/PortfolioTab.tsx` lines 892, 901):
   - **Current**: `setPageState('expanded-reader')`
   - **New**: Can remain `expanded-reader` (Content Reader won't show anyway) OR change to `expanded-empty`
   - **Impact**: Collection tabs won't show Content Reader on open

6. **ContentReader Positioning Prop** (`components/tabs/PortfolioTab.tsx` line 961):
   - **Current**: `positioning={pageState === 'expanded-reader' ? 'expanded' : 'collapsed'}`
   - **New**: Always `'collapsed'` (since Content Reader only visible in collapsed-reader state)
   - **Impact**: Positioning prop can be simplified

---

#### Code Locations Requiring Changes

**File 1: `components/tabs/PortfolioTab.tsx`**

1. **Line 112**: Initial state
   - Change from `'expanded-reader'` to `'expanded-empty'`

2. **Lines 658-663**: Auto-selection state setting
   - Change from `setPageState('expanded-reader')` to `setPageState('expanded-empty')` when content selected
   - OR keep `expanded-reader` but Content Reader won't render anyway

3. **Lines 878-883**: Rule 4 - Main Menu click handler
   - Change from `setPageState('expanded-reader')` to `setPageState('expanded-empty')`

4. **Lines 956-963**: ContentReader visibility
   - Change from `(pageState === 'collapsed-reader' || pageState === 'expanded-reader')` to `pageState === 'collapsed-reader'`

5. **Line 961**: ContentReader positioning prop
   - Change from conditional to always `'collapsed'` (since only visible in collapsed state)

6. **Lines 892, 901**: Collection tab opening
   - Consider changing from `'expanded-reader'` to `'expanded-empty'` for consistency
   - OR keep `expanded-reader` (Content Reader won't render anyway)

---

#### Questions to Clarify

1. **Should `expanded-reader` state be removed entirely?**
   - Option A: Remove `expanded-reader` from PageState type (only `expanded-empty` and `collapsed-reader`)
   - Option B: Keep `expanded-reader` state but never show Content Reader in it (state exists but Content Reader doesn't render)

2. **What should happen when content is auto-selected on load?**
   - Option A: Load in `expanded-empty` state (Content Reader hidden, menu expanded)
   - Option B: Load in `expanded-reader` state (Content Reader hidden, menu expanded, but state indicates content is selected)

3. **What should happen when user clicks collapsed menu bar?**
   - Option A: Go to `expanded-empty` state (menu expanded, Content Reader hidden)
   - Option B: Go to `expanded-reader` state (menu expanded, Content Reader hidden, but state indicates content is selected)

4. **Should collection tabs open in `expanded-empty` or `expanded-reader`?**
   - Option A: `expanded-empty` (consistent with new behavior)
   - Option B: `expanded-reader` (indicates content is selected, but Content Reader won't render)

5. **What about the `positioning` prop in ContentReader?**
   - Since Content Reader only visible in collapsed state, `positioning` will always be `'collapsed'`
   - Should we remove the prop or keep it for future use?

---

#### Implementation Stages

This feature change will be implemented in 5 stages. Each stage addresses a specific aspect of the new behavior.

---

**Stage 1: Keep `expanded-reader` State But Don't Show Content Reader**

**Description**: Keep the `expanded-reader` state in the PageState type, but remove Content Reader visibility from this state. Content Reader will only be visible in `collapsed-reader` state.

**Changes**:
- Update ContentReader visibility condition: Change from `(pageState === 'collapsed-reader' || pageState === 'expanded-reader')` to `pageState === 'collapsed-reader'` only
- Keep PageState type as is: `type PageState = 'expanded-empty' | 'expanded-reader' | 'collapsed-reader'`
- `expanded-reader` state will still exist but Content Reader won't render in it

**Result**: Content Reader only visible in collapsed-reader state. Expanded-reader state remains but doesn't show Content Reader.

---

#### Stage 1 Implementation

**Date**: Stage 1 Implementation

**Code Changes**:

**File: `components/tabs/PortfolioTab.tsx`** (Lines 956-963)

**Before**:
```tsx
{/* ContentReader - visible in reader states (collapsed-reader, expanded-reader) */}
{(pageState === 'collapsed-reader' || pageState === 'expanded-reader') && (
  <ContentReader
    content={selectedContent}
    isVisible={true}
    positioning={pageState === 'expanded-reader' ? 'expanded' : 'collapsed'}
  />
)}
```

**After**:
```tsx
{/* ContentReader - visible only in collapsed-reader state (Stage 1: expanded-reader state no longer shows Content Reader) */}
{pageState === 'collapsed-reader' && (
  <ContentReader
    content={selectedContent}
    isVisible={true}
    positioning="collapsed"
  />
)}
```

**Changes Made**:
1. **Updated visibility condition**: Changed from `(pageState === 'collapsed-reader' || pageState === 'expanded-reader')` to `pageState === 'collapsed-reader'` only
2. **Simplified positioning prop**: Changed from conditional `pageState === 'expanded-reader' ? 'expanded' : 'collapsed'` to always `"collapsed"` (since Content Reader only visible in collapsed state)
3. **Updated comment**: Changed comment to reflect that Content Reader is only visible in collapsed-reader state

**How It Works**:
- Content Reader now only renders when `pageState === 'collapsed-reader'`
- When `pageState === 'expanded-reader'` or `'expanded-empty'`, Content Reader does not render
- `expanded-reader` state still exists in PageState type but no longer shows Content Reader
- Positioning prop is always `'collapsed'` since Content Reader only appears in collapsed state

**Expected Behavior**:
1. ✅ Content Reader visible only when `pageState === 'collapsed-reader'`
2. ✅ Content Reader hidden when `pageState === 'expanded-reader'`
3. ✅ Content Reader hidden when `pageState === 'expanded-empty'`
4. ✅ `expanded-reader` state still exists but doesn't affect Content Reader visibility

**Testing Instructions**:
1. Navigate to portfolio page
2. Click content item to enter `collapsed-reader` state
3. Verify Content Reader is visible ✅
4. Click collapsed menu bar to expand (should go to `expanded-reader` or `expanded-empty`)
5. Verify Content Reader is hidden ✅
6. Click category/subcategory to enter `expanded-empty` state
7. Verify Content Reader is hidden ✅

**Status**: ✅ Stage 1 COMPLETE - Content Reader visibility updated to collapsed-reader state only. User verified testing successful.

---

**Stage 2: Remove Content Selection on Load - New State Logic**

**Description**: Remove auto-selection of content on page load. Implement new logic: whenever menu bar is expanded, content is not loaded/displayed; whenever menu bar is collapsed, content is displayed. This effectively removes `expanded-reader` and `collapsed-empty` states from practical use.

**Changes**:
- Update initial state: Change from `'expanded-reader'` to `'expanded-empty'`
- Update auto-selection logic: Remove content auto-selection on load, or set state to `'expanded-empty'` even if content would be selected
- New behavior: Menu bar expanded = no content displayed; Menu bar collapsed = content displayed

**Result**: Page loads without Content Reader. Content only appears when menu bar is collapsed. Expanded states never show content.

---

#### Stage 2 Implementation

**Date**: Stage 2 Implementation

**Code Changes**:

**File: `components/tabs/PortfolioTab.tsx`** (Lines 110-112)

**Before**:
```tsx
// ===== PAGE STATE MANAGEMENT =====
// Initial state is 'expanded-reader' per Logic Doc line 76
const [pageState, setPageState] = useState<PageState>('expanded-reader')
```

**After**:
```tsx
// ===== PAGE STATE MANAGEMENT =====
// Initial state is 'expanded-empty' per Stage 2: Remove content selection on load
// Page loads without content selected, menu bar starts in expanded state
const [pageState, setPageState] = useState<PageState>('expanded-empty')
```

**File: `components/tabs/PortfolioTab.tsx`** (Lines 649-663)

**Before**:
```tsx
// Step 6: Update all state arrays
setCategories(categoriesData)
setSubcategories(subcategoriesData)
setContent(contentData)
setCollections(collectionsData)
setSelectedCategory(selectedCategory)
setSelectedSubcategory(selectedSubcategory)
setSelectedContent(selectedContent)

// Step 7: Set page state based on selections
if (selectedContent) {
  setPageState('expanded-reader') // Normal: content selected
} else {
  setPageState('expanded-empty') // Edge case: no content
}
```

**After**:
```tsx
// Step 6: Update all state arrays
setCategories(categoriesData)
setSubcategories(subcategoriesData)
setContent(contentData)
setCollections(collectionsData)
setSelectedCategory(selectedCategory)
setSelectedSubcategory(selectedSubcategory)
setSelectedContent(selectedContent)

// Step 7: Set page state - Stage 2: Always start in expanded-empty state
// Menu bar expanded = no content displayed; Menu bar collapsed = content displayed
// Page loads with menu bar expanded, so state is always 'expanded-empty' on load
setPageState('expanded-empty')
```

**Changes Made**:
1. **Updated initial state**: Changed from `'expanded-reader'` to `'expanded-empty'` - page now loads without content selected
2. **Removed conditional state logic**: Changed from `if (selectedContent) setPageState('expanded-reader') else setPageState('expanded-empty')` to always `setPageState('expanded-empty')` on load
3. **Updated comments**: Added comments explaining Stage 2 logic - menu bar expanded = no content, menu bar collapsed = content displayed
4. **Note**: `autoSelectInitialContent` function still runs and selects content, but state is set to `'expanded-empty'` regardless, so Content Reader won't show (per Stage 1)

**How It Works**:
- Page loads with `pageState = 'expanded-empty'` (menu bar expanded, no content displayed)
- `autoSelectInitialContent` still runs and selects first category/subcategory/content (for potential future use)
- State is always set to `'expanded-empty'` on load, regardless of whether content was auto-selected
- Content Reader is hidden because `pageState !== 'collapsed-reader'` (per Stage 1)
- New logic: Menu bar expanded = no content displayed; Menu bar collapsed = content displayed

**Expected Behavior**:
1. ✅ Page loads in `'expanded-empty'` state (menu bar expanded)
2. ✅ Content Reader is hidden on page load (per Stage 1)
3. ✅ Menu bar is expanded on page load
4. ✅ No content is displayed on page load (even if auto-selected)
5. ✅ `autoSelectInitialContent` still runs but doesn't affect initial state

**Potential Issues**:
- ⚠️ **Auto-selection still happens**: `autoSelectInitialContent` function still runs and selects content, but state is set to `'expanded-empty'` so Content Reader won't show. This may cause confusion if selectedContent is set but not displayed. Consider removing auto-selection in future stage if not needed.
- ⚠️ **State consistency**: `selectedContent` may be set but `pageState` is `'expanded-empty'`, creating a state where content is selected but not displayed. This is intentional per Stage 2 specification but may need clarification in future stages.

**Testing Instructions**:
1. Navigate to portfolio page
2. Verify page loads with menu bar expanded ✅
3. Verify Content Reader is hidden on load ✅
4. Verify `pageState === 'expanded-empty'` in console ✅
5. Verify `selectedContent` may be set but Content Reader is still hidden ✅
6. Click collapsed menu bar to expand (if already expanded, this may not change state)
7. Verify Content Reader remains hidden ✅

**Status**: ✅ Stage 2 COMPLETE - Initial state changed to expanded-empty, page loads without content displayed. User verified testing successful.

---

**Stage 3: Main Menu Click Behavior - Hide Content Reader on Expand**

**Description**: When user clicks collapsed menu bar, menu expands (existing behavior unchanged). New addition: when menu bar expands after click, Content Reader must hide.

**Changes**:
- Update Rule 4 handler (`handleMainMenuClick`): When `pageState === 'collapsed-reader'`, set state to `'expanded-empty'` (or `'expanded-reader'` if content selected, but Content Reader won't show)
- Ensure Content Reader visibility condition from Stage 1 hides Content Reader when menu expands

**Result**: Clicking collapsed menu bar expands menu and hides Content Reader. Menu expansion always hides Content Reader.

---

#### Stage 3 Implementation

**Date**: Stage 3 Implementation

**Code Changes**:

**File: `components/tabs/PortfolioTab.tsx`** (Lines 877-882)

**Before**:
```tsx
const handleMainMenuClick = useCallback(() => {
  if (pageState === 'collapsed-reader') {
    setPageState('expanded-reader')
    // Selection unchanged (category/subcategory/content remain same)
  }
}, [pageState])
```

**After**:
```tsx
const handleMainMenuClick = useCallback(() => {
  if (pageState === 'collapsed-reader') {
    // Stage 3: When menu bar expands, hide Content Reader by setting state to expanded-empty
    // Menu bar expanded = no content displayed; Menu bar collapsed = content displayed
    setPageState('expanded-empty')
    // Selection unchanged (category/subcategory/content remain same, but Content Reader hidden)
  }
}, [pageState])
```

**Changes Made**:
1. **Updated state transition**: Changed from `setPageState('expanded-reader')` to `setPageState('expanded-empty')` when menu bar expands
2. **Updated comments**: Added comments explaining Stage 3 logic - menu bar expanded = no content displayed, menu bar collapsed = content displayed
3. **Content Reader visibility**: Content Reader automatically hides because `pageState !== 'collapsed-reader'` (per Stage 1)
4. **Selection preserved**: Category/subcategory/content selections remain unchanged, but Content Reader is hidden

**How It Works**:
- When user clicks collapsed menu bar (`pageState === 'collapsed-reader'`), menu expands
- State changes from `'collapsed-reader'` to `'expanded-empty'`
- Content Reader visibility condition (Stage 1) checks `pageState === 'collapsed-reader'`, which is now false
- Content Reader automatically hides because it only renders when `pageState === 'collapsed-reader'`
- Menu bar expands to show full menu (Main Menu and Collections Menu)
- Category/subcategory/content selections remain unchanged (user can still see what was selected in the menu)

**Expected Behavior**:
1. ✅ User clicks collapsed menu bar when `pageState === 'collapsed-reader'`
2. ✅ Menu bar expands (shows full Main Menu and Collections Menu)
3. ✅ State changes from `'collapsed-reader'` to `'expanded-empty'`
4. ✅ Content Reader hides automatically (per Stage 1 visibility condition)
5. ✅ Category/subcategory/content selections remain unchanged
6. ✅ User can see selected items in expanded menu but Content Reader is hidden

**Potential Issues**:
- ⚠️ **State transition**: Changed from `'expanded-reader'` to `'expanded-empty'` - this means `expanded-reader` state is no longer used when menu expands from collapsed state. This is intentional per Stage 3 specification but may affect other logic that checks for `expanded-reader` state.
- ⚠️ **Selection visibility**: Category/subcategory/content selections remain unchanged, but Content Reader is hidden. User can see selections in menu but not in Content Reader. This is intentional per Stage 3 specification.

**Testing Instructions**:
1. Navigate to portfolio page
2. Click a content item to enter `collapsed-reader` state (Content Reader visible)
3. Verify Content Reader is visible ✅
4. Click collapsed menu bar to expand
5. Verify menu bar expands (shows full Main Menu and Collections Menu) ✅
6. Verify Content Reader hides automatically ✅
7. Verify `pageState === 'expanded-empty'` in console ✅
8. Verify category/subcategory/content selections remain unchanged (visible in menu) ✅

**Status**: ✅ Stage 3 COMPLETE - Main menu click behavior updated to hide Content Reader on expand. User verified testing successful.

---

**Stage 4: Collection Tab Opening Logic - Always Expand Menu Bar**

**Description**: New logic for collection tab opening: clicking a collection always expands the menu bar and hides content, regardless of whether the menu bar is currently collapsed or expanded when the click happens.

**Changes**:
- Update collection tab opening handlers: Always set state to `'expanded-empty'` when collection is clicked
- Remove conditional logic based on current `pageState`
- Collection click always expands menu bar and hides Content Reader

**Result**: Collection clicks always expand menu bar and hide content. Menu bar state before click doesn't matter - collection always opens in expanded-empty state.

---

#### Stage 4 Implementation

**Date**: Stage 4 Implementation (Revised)

**Code Changes**:

**File: `components/tabs/PortfolioTab.tsx`** (Lines 886-915)

**Before**:
```tsx
// Collection click handler (Step 5.3 Stage 1)
// Collection tab opening: Add to activeCollections, switch activeTab, set state based on menu bar state (Stage 4)
const handleCollectionClick = useCallback((collection: Collection) => {
  // Check if collection is already open (duplicate prevention)
  if (activeCollections.find(c => c.slug === collection.slug)) {
    // Already open: just switch to it
    setActiveTab(collection.slug)
    // Stage 4: Set state based on current menu bar state
    // If menu bar is collapsed, keep it collapsed; if expanded, keep it expanded
    if (pageState === 'collapsed-reader') {
      setPageState('collapsed-reader') // Keep collapsed with content
    } else {
      setPageState('expanded-empty') // Keep expanded without content
    }
    return
  }
  
  // Not open: add to activeCollections array (append, don't replace) per logic doc line 414
  setActiveCollections(prev => [...prev, { slug: collection.slug, name: collection.name }])
  // Switch activeTab to collection.slug per logic doc line 416
  setActiveTab(collection.slug)
  // Stage 4: Set pageState based on current menu bar state
  // If menu bar is collapsed, collection opens in collapsed-reader (content remains selected)
  // If menu bar is expanded, collection opens in expanded-empty (no content displayed)
  if (pageState === 'collapsed-reader') {
    setPageState('collapsed-reader') // Collection opens collapsed with content
  } else {
    setPageState('expanded-empty') // Collection opens expanded without content
  }
}, [activeCollections, pageState])
```

**After**:
```tsx
// Collection click handler (Step 5.3 Stage 1)
// Collection tab opening: Add to activeCollections, switch activeTab, always expand menu bar (Stage 4)
const handleCollectionClick = useCallback((collection: Collection) => {
  // Check if collection is already open (duplicate prevention)
  if (activeCollections.find(c => c.slug === collection.slug)) {
    // Already open: just switch to it
    setActiveTab(collection.slug)
    // Stage 4: Always expand menu bar and hide content when collection is clicked
    setPageState('expanded-empty')
    return
  }
  
  // Not open: add to activeCollections array (append, don't replace) per logic doc line 414
  setActiveCollections(prev => [...prev, { slug: collection.slug, name: collection.name }])
  // Switch activeTab to collection.slug per logic doc line 416
  setActiveTab(collection.slug)
  // Stage 4: Always expand menu bar and hide content when collection is clicked
  // Collection click always expands menu bar and hides Content Reader, regardless of current state
  setPageState('expanded-empty')
}, [activeCollections])
```

**Changes Made**:
1. **Simplified `handleCollectionClick` state logic**: Changed from conditional based on current `pageState` to always `setPageState('expanded-empty')`
   - Removed conditional logic: No longer checks `pageState === 'collapsed-reader'`
   - Always sets state to `'expanded-empty'` when collection is clicked
   - Collection click always expands menu bar and hides Content Reader
2. **Removed `pageState` from dependency array**: Removed `pageState` from `useCallback` dependency array since we're not checking it anymore
3. **Updated comments**: Updated comments to explain Stage 4 logic - collection click always expands menu bar and hides content

**How It Works**:
- When user clicks a collection, `handleCollectionClick` always sets `pageState` to `'expanded-empty'`
- Menu bar expands (shows full Main Menu and Collections Menu)
- Content Reader hides automatically (per Stage 1: Content Reader only visible when `pageState === 'collapsed-reader'`)
- Current menu bar state before click doesn't matter - collection always opens in expanded-empty state
- Auto-selection still runs but Content Reader won't show because `pageState === 'expanded-empty'`

**Expected Behavior**:
1. ✅ User clicks collection when menu bar is collapsed (`pageState === 'collapsed-reader'`)
2. ✅ Collection opens in `'expanded-empty'` state
3. ✅ Menu bar expands (shows full Main Menu and Collections Menu)
4. ✅ Content Reader hides automatically
5. ✅ User clicks collection when menu bar is expanded (`pageState === 'expanded-empty'` or `'expanded-reader'`)
6. ✅ Collection opens in `'expanded-empty'` state
7. ✅ Menu bar stays expanded
8. ✅ Content Reader remains hidden

**Potential Issues**:
- ⚠️ **Content visibility**: When collection is clicked from collapsed state, Content Reader hides even if content was previously selected. This is intentional per Stage 4 specification but may surprise users who expect to see content.
- ⚠️ **Auto-selection behavior**: Auto-selection still runs and selects content, but Content Reader won't show because `pageState === 'expanded-empty'`. This is intentional per Stage 4 specification.

**Testing Instructions**:
1. Navigate to portfolio page (menu bar expanded, `pageState === 'expanded-empty'`)
2. Click a collection
3. Verify collection opens in `'expanded-empty'` state ✅
4. Verify Content Reader is hidden ✅
5. Verify menu bar stays expanded ✅
6. Click a content item to enter `'collapsed-reader'` state (Content Reader visible)
7. Verify Content Reader is visible ✅
8. Click a different collection
9. Verify collection opens in `'expanded-empty'` state ✅
10. Verify menu bar expands (if it was collapsed) ✅
11. Verify Content Reader hides automatically ✅
12. Verify `pageState === 'expanded-empty'` in console ✅

**Status**: ✅ Stage 4 COMPLETE - Collection click always expands menu bar and hides content, regardless of current state. User verified testing successful.

---

**Stage 5: ContentReader Positioning Prop**

**Description**: Review and update ContentReader `positioning` prop. Since Content Reader will only be visible in `collapsed-reader` state, the `positioning` prop will always be `'collapsed'`. Decision needed on whether to remove the prop or keep it for future use.

**Changes**:
- Review ContentReader component `positioning` prop usage
- Update positioning prop: Change from conditional `pageState === 'expanded-reader' ? 'expanded' : 'collapsed'` to always `'collapsed'`
- Consider removing prop entirely if no longer needed, or keep for future flexibility

**Result**: ContentReader positioning prop simplified or removed. Positioning logic updated to reflect collapsed-only visibility.

---

#### Stage 5 Implementation

**Date**: Stage 5 Implementation

**Decision**: Keep `positioning` prop for future flexibility, but simplify code since it's always `'collapsed'` now.

**Code Changes**:

**File: `components/ContentReader.tsx`** (Lines 57-69)

**Before**:
```tsx
// Collapsed state positioning: 105px below Menu Bar (35px original + 70px additional), 50px gap from right edge (per layout-reset.md lines 323, 337)
// Content Reader is foundation of page - other elements positioned on top of it
// Simple margins, no vh-based calculations - browser scrollbar handles scrolling
const marginTop = positioning === 'collapsed' ? '105px' : '35px' // Collapsed: 105px spacing (35px + 70px fix); Expanded: 35px spacing unchanged

// Collapsed state horizontal positioning
const marginRight = positioning === 'collapsed' ? '50px' : '0px' // Gap from right edge (layout-reset.md line 323)
// Left margin: Info Menu left (25px) + Info Menu width (estimated 250px) + gap (20px) = 295px
// Fills space between Info Menu right edge and right edge of page (per layout-reset.md line 322)
const marginLeft = positioning === 'collapsed' ? '295px' : '0px' // Collapsed: starts after Info Menu; Expanded: placeholder for Step 6.6

// Expanded state positioning: Placeholder for Step 6.4
// Will fill space between Main Menu right edge and Collections Menu left edge
```

**After**:
```tsx
// Stage 5: Positioning prop simplified - Content Reader only visible in collapsed-reader state
// Positioning prop kept for future flexibility, but always 'collapsed' now
// Collapsed state positioning: 105px below Menu Bar (35px original + 70px additional), 50px gap from right edge (per layout-reset.md lines 323, 337)
// Content Reader is foundation of page - other elements positioned on top of it
// Simple margins, no vh-based calculations - browser scrollbar handles scrolling
const marginTop = '105px' // Collapsed: 105px spacing (35px + 70px fix)

// Collapsed state horizontal positioning
const marginRight = '50px' // Gap from right edge (layout-reset.md line 323)
// Left margin: Info Menu left (25px) + Info Menu width (estimated 250px) + gap (20px) = 295px
// Fills space between Info Menu right edge and right edge of page (per layout-reset.md line 322)
const marginLeft = '295px' // Collapsed: starts after Info Menu

// Note: Expanded state positioning removed - Content Reader only visible in collapsed state (Stage 1)
// Positioning prop kept for future flexibility if expanded state positioning is needed again
```

**Changes Made**:
1. **Simplified margin calculations**: Removed conditional checks since `positioning` is always `'collapsed'` now
   - Changed `marginTop` from conditional to always `'105px'`
   - Changed `marginRight` from conditional to always `'50px'`
   - Changed `marginLeft` from conditional to always `'295px'`
2. **Removed expanded state positioning code**: Removed placeholder comments and conditional logic for expanded state
3. **Kept `positioning` prop**: Prop remains in interface and function signature for future flexibility
4. **Updated comments**: Added Stage 5 note explaining simplification and why prop is kept

**How It Works**:
- `positioning` prop is still passed to ContentReader component (always `'collapsed'` from PortfolioTab.tsx line 964)
- Prop is kept in the interface for future flexibility if expanded state positioning is needed again
- Code is simplified since conditional checks are no longer needed
- All margins are now fixed values for collapsed state positioning

**Expected Behavior**:
1. ✅ ContentReader receives `positioning="collapsed"` prop (unchanged from Stage 1)
2. ✅ Margins are set to collapsed state values (105px top, 50px right, 295px left)
3. ✅ No conditional logic needed since positioning is always collapsed
4. ✅ Prop remains available for future use if expanded positioning is needed

**Why Keep the Prop**:
- **Future flexibility**: If Content Reader needs to show in expanded states again, prop is already in place
- **Code clarity**: Prop documents that positioning can vary (even if currently always collapsed)
- **Minimal overhead**: Simple prop doesn't add complexity, easy to maintain

**Testing Instructions**:
1. Navigate to portfolio page
2. Click content item to enter `collapsed-reader` state
3. Verify Content Reader is visible ✅
4. Verify Content Reader positioning is correct (105px from top, 50px from right, 295px from left) ✅
5. Verify no console errors ✅
6. Verify `positioning="collapsed"` prop is passed correctly ✅

**Status**: ✅ Stage 5 Implementation Complete - Positioning prop code simplified, prop kept for future flexibility.

---

**Stage 6: Already-Selected Entry Click Behavior - Expand/Collapse Menu**

**Description**: Change the rule for clicking already-selected entries. Previously, clicking an already-selected entry did nothing (NO CHANGE). New behavior: clicking an already-selected entry toggles menu expansion/collapse.

**Changes**:
- Update click handlers for already-selected entries in Main Menu
- In collapsed state (`collapsed-reader`): Click on already-selected entry → expands menu to `expanded-empty` state (Content Reader hides, menu expands)
- In expanded state with Content Reader hidden (`expanded-empty` or `expanded-reader`): Click on already-selected entry → collapses menu to `collapsed-reader` state (Content Reader shows with same content item selected)
- Update logic doc line 93: Change from "NO CHANGE" to new expand/collapse behavior

**Result**: Clicking already-selected entry toggles menu state. Collapsed → expands menu. Expanded → collapses menu and shows Content Reader.

**Note**: This changes the rule in `portfolio-logic.md` line 93 from "**Any state** → (click already-selected entry) → NO CHANGE" to the new behavior described above.

---

#### Stage 6 Implementation

**Date**: Stage 6 Implementation

**Code Changes**:

**File: `components/tabs/PortfolioTab.tsx`** (Lines 856-874)

**Before**:
```tsx
const handleCategorySelect = useCallback((category: Category) => {
  setSelectedCategory(category)
  setSelectedSubcategory(null)
  setSelectedContent(null)
  setPageState('expanded-empty')
}, [])

// Rule 2: Subcategory click → expanded-empty (clear content, set subcategory)
const handleSubcategorySelect = useCallback((subcategory: Subcategory) => {
  setSelectedSubcategory(subcategory)
  setSelectedContent(null)
  setPageState('expanded-empty')
}, [])

// Rule 3: Content click → collapsed-reader (set content, collapse menu)
const handleContentSelect = useCallback((content: ContentItem) => {
  setSelectedContent(content)
  setPageState('collapsed-reader')
}, [])
```

**After**:
```tsx
const handleCategorySelect = useCallback((category: Category) => {
  // Stage 6: Check if already selected - toggle menu state
  if (selectedCategory?.id === category.id) {
    // Already selected: toggle menu state
    if (pageState === 'collapsed-reader') {
      // Collapsed → expand menu
      setPageState('expanded-empty')
    } else {
      // Expanded → collapse menu (only if content is selected, otherwise stay expanded)
      if (selectedContent) {
        setPageState('collapsed-reader')
      }
      // If no content selected, stay in expanded-empty (can't show Content Reader without content)
    }
    return
  }
  
  // New selection: normal behavior
  setSelectedCategory(category)
  setSelectedSubcategory(null)
  setSelectedContent(null)
  setPageState('expanded-empty')
}, [selectedCategory, selectedContent, pageState])

// Rule 2: Subcategory click → expanded-empty (clear content, set subcategory)
const handleSubcategorySelect = useCallback((subcategory: Subcategory) => {
  // Stage 6: Check if already selected - toggle menu state
  if (selectedSubcategory?.id === subcategory.id) {
    // Already selected: toggle menu state
    if (pageState === 'collapsed-reader') {
      // Collapsed → expand menu
      setPageState('expanded-empty')
    } else {
      // Expanded → collapse menu (only if content is selected, otherwise stay expanded)
      if (selectedContent) {
        setPageState('collapsed-reader')
      }
      // If no content selected, stay in expanded-empty (can't show Content Reader without content)
    }
    return
  }
  
  // New selection: normal behavior
  setSelectedSubcategory(subcategory)
  setSelectedContent(null)
  setPageState('expanded-empty')
}, [selectedSubcategory, selectedContent, pageState])

// Rule 3: Content click → collapsed-reader (set content, collapse menu)
const handleContentSelect = useCallback((content: ContentItem) => {
  // Stage 6: Check if already selected - toggle menu state
  if (selectedContent?.id === content.id) {
    // Already selected: toggle menu state
    if (pageState === 'collapsed-reader') {
      // Collapsed → expand menu (hide Content Reader)
      setPageState('expanded-empty')
    } else {
      // Expanded → collapse menu (show Content Reader with same content)
      setPageState('collapsed-reader')
    }
    return
  }
  
  // New selection: normal behavior
  setSelectedContent(content)
  setPageState('collapsed-reader')
}, [selectedContent, pageState])
```

**File: `components/tabs/MainMenu.tsx`** (Lines 140-165)

**Before**:
```tsx
const handleItemClick = (
  item: Category | Subcategory | ContentItem,
  itemType: 'category' | 'subcategory' | 'content'
) => {
  // Re-selection check (logic doc line 152, tech-ref lines 2721-2729)
  // In expanded states, clicking already selected item does nothing
  if (pageState !== 'collapsed-reader') {
    // Check if item already selected
    if (itemType === 'category' && selectedCategory?.id === (item as Category).id) {
      return // Already selected, no change
    }
    if (itemType === 'subcategory' && selectedSubcategory?.id === (item as Subcategory).id) {
      return // Already selected, no change
    }
    if (itemType === 'content' && selectedContent?.id === (item as ContentItem).id) {
      return // Already selected, no change
    }
  }

  // Call appropriate callback based on itemType
  if (itemType === 'category') {
    onCategorySelect(item as Category)
  } else if (itemType === 'subcategory') {
    onSubcategorySelect(item as Subcategory)
  } else if (itemType === 'content') {
    onContentSelect(item as ContentItem)
  }
}
```

**After**:
```tsx
const handleItemClick = (
  item: Category | Subcategory | ContentItem,
  itemType: 'category' | 'subcategory' | 'content'
) => {
  // Stage 6: Removed early return for already-selected items
  // Now clicking already-selected items toggles menu state (handled in PortfolioTab callbacks)
  // Call appropriate callback based on itemType (callbacks handle already-selected logic)
  if (itemType === 'category') {
    onCategorySelect(item as Category)
  } else if (itemType === 'subcategory') {
    onSubcategorySelect(item as Subcategory)
  } else if (itemType === 'content') {
    onContentSelect(item as ContentItem)
  }
}
```

**Changes Made**:
1. **Updated `handleCategorySelect`**: Added check for already-selected category
   - If already selected and collapsed: Expand to `expanded-empty`
   - If already selected and expanded: Collapse to `collapsed-reader` (only if content is selected)
   - Added dependencies to `useCallback`: `selectedCategory`, `selectedContent`, `pageState`
2. **Updated `handleSubcategorySelect`**: Added check for already-selected subcategory
   - Same toggle logic as category
   - Added dependencies to `useCallback`: `selectedSubcategory`, `selectedContent`, `pageState`
3. **Updated `handleContentSelect`**: Added check for already-selected content
   - If already selected and collapsed: Expand to `expanded-empty` (hide Content Reader)
   - If already selected and expanded: Collapse to `collapsed-reader` (show Content Reader)
   - Added dependencies to `useCallback`: `selectedContent`, `pageState`
4. **Removed early return in MainMenu**: Removed the check that prevented callbacks from being called for already-selected items
   - Now all clicks (including already-selected items) trigger callbacks
   - Callbacks handle the toggle logic in PortfolioTab

**How It Works**:
- **Collapsed state**: Clicking already-selected entry (shown in breadcrumb) expands menu via `onMenuClick` (existing behavior) or via individual callbacks if entry is clickable
- **Expanded state**: Clicking already-selected entry calls callback, which checks if item is already selected and toggles menu state
- **Content items**: Toggle between collapsed (Content Reader visible) and expanded (Content Reader hidden)
- **Category/Subcategory**: Toggle between collapsed and expanded, but only collapse if content is selected (can't show Content Reader without content)

**Expected Behavior**:
1. ✅ User clicks already-selected content item in collapsed state → Menu expands to `expanded-empty`, Content Reader hides
2. ✅ User clicks already-selected content item in expanded state → Menu collapses to `collapsed-reader`, Content Reader shows with same content
3. ✅ User clicks already-selected category/subcategory in collapsed state → Menu expands to `expanded-empty`
4. ✅ User clicks already-selected category/subcategory in expanded state → Menu collapses to `collapsed-reader` (only if content is selected)
5. ✅ User clicks already-selected category/subcategory in expanded state with no content → Stays in `expanded-empty` (can't show Content Reader without content)
6. ✅ User clicks new (not selected) entry → Normal selection behavior (unchanged)

**Potential Issues**:
- ⚠️ **Category/Subcategory collapse**: If user clicks already-selected category/subcategory in expanded state but no content is selected, menu stays expanded. This is intentional (can't show Content Reader without content) but may be unexpected.
- ⚠️ **Collapsed state clicks**: In collapsed state, the breadcrumb is clickable via `onMenuClick`, which already expands the menu. Individual entry clicks in collapsed state may not be easily accessible depending on UI layout.

**Testing Instructions**:
1. Navigate to portfolio page
2. Click a content item to enter `collapsed-reader` state (Content Reader visible)
3. Click the same content item again (already-selected)
4. Verify menu expands to `expanded-empty`, Content Reader hides ✅
5. Click the same content item again (already-selected in expanded state)
6. Verify menu collapses to `collapsed-reader`, Content Reader shows ✅
7. Click a category to select it (enters `expanded-empty`)
8. Click the same category again (already-selected)
9. Verify menu stays in `expanded-empty` (no content to show) ✅
10. Click a content item to select it (enters `collapsed-reader`)
11. Click the category again (already-selected in collapsed state)
12. Verify menu expands to `expanded-empty` ✅

**Status**: ✅ Stage 6 Implementation Complete - Already-selected entry click behavior updated to toggle menu state.

---


#### Documentation Updates Needed

1. **Update `portfolio-layout-reset.md`**:
   - Update state machine description (line 62-66)
   - Remove references to Content Reader being visible in expanded-reader state
   - Document new behavior: Content Reader only visible in collapsed-reader state

2. **Update `portfolio-planning.md`**:
   - Update state transition rules
   - Document that expanded-reader state no longer shows Content Reader
   - Update any test scenarios that assume Content Reader visibility in expanded-reader

---

**Status**: Investigation complete. Ready for implementation decision.

---