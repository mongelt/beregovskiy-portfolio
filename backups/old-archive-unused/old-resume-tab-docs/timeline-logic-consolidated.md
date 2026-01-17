# Resume Timeline Logic - Consolidated Analysis

## ⚠️ IMPORTANT: THIS DOCUMENT IS NOW OUTDATED AND ARCHIVED, STOP READING IT UNLESS THE USER SPECIFICALLY DIRECTED AI TO READ IT

**All timeline logic has been consolidated into a single source of truth:**
**📋 `docs\resume-timeline-logic.md`**

## Overview

## Timeline Core Logic

### Timeline Boundaries
- **Start**: January 1, 2010 (hidden marker, for calculation only)
- **End**: "Now" (current date, changes daily)
- **Birth Caption**: "Born in Moscow, Russia, July 1, 1994" (always at bottom, not on timeline)

### Dynamic Spacing System - CRITICAL LOGIC
- **Standard Height**: Minimum pixels required to fit the longest entry (Entry 5: 4 years in example)
- **Dynamic Expansion**: Month markers expand to accommodate entry cards
- **Collapsed State**: Markers expand to fit collapsed cards
- **Expanded State**: Markers expand further to fit expanded cards
- **Center Entry Override**: Side entries ignore center entries when expanded, overlap over them
- **Equal Expansion**: All markers in a range expand equally when an entry expands
- **Month Markers**: 25px height + 10px padding = 35px per month (base)

### Overlapping Entry Logic - CRITICAL FOR TIMELINE HEIGHT
- **Same Side Overlap Rule**: When two entries on the same side (left or right) overlap in their date ranges, the entry that ended LAST should be positioned FIRST (higher on timeline)
- **Timeline Expansion**: The timeline must expand to accommodate ALL overlapping entries simultaneously
- **Card Positioning**: Entry cards are positioned at their END dates, but the timeline must provide space for the entire duration of each entry
- **Example**: Entry 1 (Dec 2023 → Jan 2025) and Entry 2 (May 2024 → Oct 2024) both on right side:
  - Entry 1 ends later (Jan 2025) → positioned first (higher)
  - Entry 2 ends earlier (Oct 2024) → positioned second (lower)
  - Timeline expands to fit both entries in their overlapping period
  - Entry 2's card must end before its start date (May 2024)
  - Entry 1's card must end before Entry 2's end date (Oct 2024)
  - The period between Jan 2025 and Oct 2024 must expand to fit Entry 1's full duration

### Spacing Calculations - DETAILED LOGIC

#### Standard Height Calculation
- **Base Standard**: Minimum pixels required to fit the longest entry
- **Example**: Entry 5 (September 2010 to June 2014) = 4 years = standard height
- **Gap Minimization**: Gaps between entries use minimum possible spacing

#### Dynamic Expansion Examples
**Example 1**: Entry lasts 4 months, collapsed card needs 8 months space
- **Solution**: Month markers expand 2x to accommodate card

**Example 2**: Same entry expands, card becomes 2x longer
- **Solution**: Month markers expand 2x more (4x total) to accommodate expanded card

**Example 3**: Test Entries Behavior
- Entry 1: April 2025 to present → Now to April 2025: expanded to fit Entry 1
- Entry 2: December 2023 to January 2025 → April 2025 to January 2025: standard height
- Entry 3: May 2024 to July 2024 (center) → January 2025 to July 2024: expanded to fit Entry 2
- Entry 4: September 2017 to December 2017 → December 2017 to September 2017: expanded to fit Entry 4
- Entry 5: September 2010 to June 2014 → September 2017 to June 2014: standard height

#### Center Entry Override Logic
- **Collapsed State**: Side entries respect center entry spacing
- **Expanded State**: Side entries ignore center entries, expand to full duration, overlap center entries
- **Visual Result**: Entry 2 expanded goes from January 2025 to December 2023, overlapping Entry 3

### Marker System
- **Now Marker**: Always at top, current date
- **Month Markers**: First day of each month (e.g., "October 2025" = October 1, 2025)
- **Year Markers**: January 1st of each year (ALWAYS present, decorative design elements)
- **Birth Caption**: Always at bottom, not positioned on timeline

### Chronological Order (top to bottom)
```
Now (October 22, 2025)
  ↓
October 2025 (October 1, 2025)
  ↓
September 2025 (September 1, 2025)
  ↓
... (all months from 2010 to Now if debug enabled)
  ↓
January 2010 (January 1, 2010)
  ↓
Born in Moscow, Russia, July 1, 1994 (caption, not on timeline)
```

**Key Rules:**
- Timeline flows from NEWEST (top) to OLDEST (bottom)
- Year markers use `new Date(year, 0, 1)` (January 1st)
- "Now" marker uses actual current date, not first of month
- Birth caption always at bottom, not positioned on timeline

## Entry Positioning Logic

### Entry Positioning on Timeline
**CRITICAL: Entries start at their END DATE, not start date**

- Entry cards should be positioned at `date_end` on the timeline
- If `date_end` is null, treat as "Present" and position at current date
- Add 20px offset below the date marker to prevent overlap with marker text
- Entry spans visually from `date_start` to `date_end` but card appears at end

**Positioning Calculation:**
```typescript
// For timeline markers (Now, months, years)
const getDatePosition = (date: Date): number => {
  const now = new Date() // Use actual current date
  const monthHeight = 35 // 25px marker + 10px padding
  // Calculate months from now to target date
  // Past dates (positive months) go below "Now"
  // Future dates (negative months) go above "Now"
  const monthsFromNow = (now.getFullYear() - date.getFullYear()) * 12 + 
                        (now.getMonth() - date.getMonth())
  return 50 + (monthsFromNow * monthHeight) // 50px top padding
}

// For entry cards (positioned at END dates)
const getEntryDatePosition = (date: Date): number => {
  const now = new Date() // Use actual current date
  const monthHeight = 35 // 25px marker + 10px padding
  // Calculate months from now to target date (same as markers)
  const monthsFromNow = (now.getFullYear() - date.getFullYear()) * 12 + 
                        (now.getMonth() - date.getMonth())
  return 50 + (monthsFromNow * monthHeight) // 50px top padding
}

// Entry positioning
top: entry.date_end ? `${getEntryDatePosition(new Date(entry.date_end)) + 20}px` : ...
```

**⚠️ CRITICAL BUG FIXED (December 2024):**
The original calculation was incorrect, causing timeline markers and entries to be positioned in wrong chronological order. The corrected calculation ensures:
- **Timeline markers**: Past dates appear below "Now", future dates appear above "Now"
- **Entry cards**: Positioned at their END dates using same logic as markers
- **Timeline flow**: Correctly flows from newest (top) to oldest (bottom)

### Entry Card Positioning (Left/Right/Center)

#### Left Side Entries
- Position: `calc(50% - 700px)` from viewport center
- Width: `560px` (w-[560px])
- Text alignment: **RIGHT** (`text-right`)
- Assets alignment: **RIGHT** (`justify-end`)
- Samples button: **RIGHT** aligned

#### Right Side Entries
- Position: `calc(50% + 48px)` from viewport center
- Width: `560px` (w-[560px])
- Text alignment: **LEFT** (default)
- Assets alignment: **LEFT** (default)
- Samples button: **LEFT** aligned

#### Center Entries (Captions)
- Position: `50%` with `translateX(-50%)`
- Width: `384px` (w-[384px]) - **CONFIRMED from current implementation**
- Text alignment: **CENTER** (`text-center`)
- Layout order: date_start → title → short_description → date_end
- No assets, no samples button
- **Background Cards**: Center entries DO have background cards (same color as page background)
- **Expansion**: Center entries expand and show short_description

## Debugging Modes

### Debug Window (Informational Only)
- **Purpose**: Display debugging information about the timeline state
- **Behavior**: Does NOT affect timeline logic or marker generation
- **Information Displayed**:
  - Number of featured entries loaded
  - Calculated timeline height
  - Expanded entries count and IDs
  - Measured heights for expanded entries
  - Total number of markers
  - Current debug mode status

### Show All Markers Mode
- **Purpose**: Display all month markers for visibility/debugging
- **Behavior**: Does NOT change timeline logic or spacing calculations
- **Normal Mode**: Only shows markers for months that have entries (hasEntry = true)
- **Show All Markers Mode**: Shows ALL month markers from 2010 to now, regardless of entries
- **Key Point**: Marker visibility is purely cosmetic for debugging; it does not affect:
  - Timeline height calculations
  - Entry positioning
  - Spacing between entries
  - Any other timeline logic

## Timeline Visual Elements

### Central Timeline Line
```typescript
<div 
  className="absolute left-1/2 top-0 w-0.5 bg-gradient-to-b from-emerald-400 via-emerald-400/50 to-emerald-400/20 transform -translate-x-0.5" 
  style={{ height: `${timelineHeight}px` }}
/>
```

### Timeline Height Calculation - MEASUREMENT-BASED LOGIC

**Key Principle**: We measure the actual rendered height of expanded entry descriptions rather than estimating from content length. This ensures accurate height for any content type (paragraphs, lists, images, mixed content).

**Implementation Approach**:
1. Use React refs to reference expanded description DOM elements
2. Measure actual height using `element.scrollHeight` when entries expand
3. Store measured heights in a state Map (entryId → height)
4. Use measured heights in timeline height calculation

```typescript
const calculateTimelineHeight = (): number => {
  if (resumeEntries.length === 0) {
    // Empty timeline: 300px minimum
    const yearsFrom2010 = new Date().getFullYear() - 2010 + 1
    return Math.max(300, yearsFrom2010 * 420) // 420px per year (12 months × 35px)
  }
  
  // NEW LOGIC: Calculate standard height based on longest entry
  const now = new Date()
  const entryDurations = resumeEntries.map(entry => {
    const startDate = entry.date_start ? new Date(entry.date_start) : new Date(2010, 0, 1)
    const endDate = entry.date_end ? new Date(entry.date_end) : now
    return Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30) // months
  })
  
  const longestEntryMonths = Math.max(...entryDurations)
  const standardMonthHeight = 35 // Base height for longest entry
  const baseHeight = longestEntryMonths * standardMonthHeight
  
  // DYNAMIC EXPANSION: Use actual measured DOM heights for expanded entries
  // Instead of estimating from content length, we measure the actual rendered height
  // This ensures accurate height for paragraphs, lists, images, or any content type
  let expandedHeight = 0
  expandedEntries.forEach(entryId => {
    const measuredHeight = expandedEntryHeights.get(entryId) || 0
    expandedHeight += measuredHeight
  })
  
  return Math.max(baseHeight + expandedHeight, 300)
}

// Helper function to measure and store expanded entry height
const measureExpandedHeight = (entryId: string, element: HTMLElement | null) => {
  if (element) {
    const height = element.scrollHeight // Actual rendered height of the content
    setExpandedEntryHeights(prev => {
      const next = new Map(prev)
      next.set(entryId, height)
      return next
    })
  }
}
```

### Overlapping Entry Height Calculation
```typescript
const calculateOverlappingEntryHeight = (entries: ResumeEntry[]): number => {
  // Group entries by side (left/right)
  const leftEntries = entries.filter(e => getEntryPosition(e) === 'left')
  const rightEntries = entries.filter(e => getEntryPosition(e) === 'right')
  
  // Calculate height needed for each side
  const leftHeight = calculateSideHeight(leftEntries)
  const rightHeight = calculateSideHeight(rightEntries)
  
  return Math.max(leftHeight, rightHeight)
}

const calculateSideHeight = (entries: ResumeEntry[]): number => {
  if (entries.length === 0) return 0
  
  // Sort by end date (latest first)
  const sortedEntries = entries.sort((a, b) => {
    const aEnd = a.date_end ? new Date(a.date_end) : new Date()
    const bEnd = b.date_end ? new Date(b.date_end) : new Date()
    return bEnd.getTime() - aEnd.getTime()
  })
  
  // Calculate total height needed for all overlapping entries
  let totalHeight = 0
  sortedEntries.forEach((entry, index) => {
    const baseCardHeight = 200 // Base collapsed card height
    // Use actual measured height instead of fixed value
    const expandedHeight = expandedEntryHeights.get(entry.id) || 0
    const spacing = index * 20 // 20px spacing between overlapping cards
    totalHeight += baseCardHeight + expandedHeight + spacing
  })
  
  return totalHeight
}
```

## Entry Card Structure

### Regular Entry (Left/Right) - w-[560px]
```
┌─────────────────────────────────────┐
│ March 2024 → December 2024          │ ← Date range
│                                     │
│ Liberty City Blatt                  │ ← Title (company, h3)
│ Investigative Reporter              │ ← Subtitle (job title)
│                                     │
│ Investigated corruption in city...  │ ← Short description
│                                     │
│ [📄 Article 1] [🔗 External Link]  │ ← Assets row
│                                     │
│ [Expand ▼]                         │ ← Expand button (if description exists)
│                                     │
│ [Samples →]                        │ ← If collection_id exists
└─────────────────────────────────────┘
```

### Center Entry (Caption) - w-[384px]
```
    ┌───────────┐
    │ Mar 2024  │ ← date_start
    │           │
    │ Caption   │ ← title (bold)
    │ Text      │
    │           │
    │ Short     │ ← short_description
    │ desc      │
    │           │
    │ Dec 2024  │ ← date_end
    │           │
    │   [▼]     │ ← Expand (currently not functional)
    └───────────┘
```

## Entry Card Design Details

### Regular Entry (Left/Right)

**Visual Elements:**
1. Date range at top (e.g., "March 2024 → December 2024" or "March 2024 → Present")
2. Title (Company name, bold, text-xl)
3. Subtitle (Job title, text-gray-400)
4. Short description (text-gray-300, always visible)
5. Assets row (if exists):
   - Content items: Link to `/content/${content_id}`
   - Custom links: External link with `target="_blank"`
   - Display with icon + title
6. Expand button (if description exists):
   - Shows "Expand ▼" when collapsed
   - Shows "Collapse ▲" when expanded
   - Reveals full EditorJS description below
7. Samples button (if collection_id exists):
   - Text: "Samples →"
   - Links to collection tab
   - Styled with emerald-400 accent

**Featured Entries:**
- Add `border-emerald-400` instead of `border-gray-800`
- Add shadow: `shadow-lg shadow-emerald-900/20`
- Visual distinction for important entries

**Left Entry Specific:**
- All text right-aligned
- Assets row right-aligned
- Samples button right-aligned

### Center Entry (Caption)

**Visual Elements:**
1. Compact vertical layout
2. date_start at top (small text)
3. Title (caption text, bold, centered)
4. Short description (if exists, small text)
5. date_end at bottom (small text)
6. Small expand button (currently shows but doesn't expand content)

**Restrictions:**
- No subtitle field
- No assets
- No samples button
- No full description expansion (keep simple)

## Timeline Marker Display

**Styling:**
- Current/Now marker: `text-lg` - Display as "Now"
- Year markers: `text-2xl` - Display as "2025", "2024", etc.
- Month markers: `text-sm` - Display as "December 2024", "March 2024", etc.
- All markers: `text-emerald-400 font-bold bg-[#0f1419] px-2`
- Position: `absolute left-1/2 transform -translate-x-1/2`

## Center Entry Special Logic

### Month Marker Colors for Center Entries
- Center entry month markers use RGB `#88b6e3` instead of emerald-400
- Regular entry month markers still use emerald-400
- Both start and end date markers for center entries use RGB 88b6e3

### Timeline Spacing Override for Center Entries
- Center entries override standard spacing ONLY between their start and end dates
- Custom spacing logic for center entry ranges
- Maintain standard spacing for non-center entry sections

### Center Entry Expansion
- Expands to show `short_description` plain text
- Uses line-based height estimation: 24px per line (1-2 lines max)
- Calculation: text length ≤60 characters = 1 line (24px), >60 characters = 2 lines (48px)
- Simple text content uses estimation rather than DOM measurement
- Arrow only appears if short_description exists
- Background height adjusts based on arrow presence

### Center Entry Markers
- Center entries have blue date markers within their cards (start/end dates)
- These blue markers are NOT added to the main timeline (no green markers)
- Blue markers are counted separately in the debug window using `centerEntryDates` computed with `useMemo`
- Timeline markers only show regular entry dates, not center entry dates
- This keeps center entries as visual captions without cluttering the timeline
- Implementation: `centerEntryDates` is computed outside `generateTimelineMarkers()` and used in both marker generation and debug display

## Styling Requirements

- **Background:** `#0f1419` (dark)
- **Card Background:** `bg-gray-900`
- **Borders:** `border-gray-800` (normal), `border-emerald-400` (featured)
- **Timeline Line:** `bg-gradient-to-b from-emerald-400 via-emerald-400/50 to-emerald-400/20`
- **Accent Color:** `emerald-400` (green) for interactive elements
- **Year Markers:** Positioned at midpoint between January and December markers (decorative only)
- **Month Markers:** 25px height + 10px padding = 35px per month
- **Text Colors:**
  - Headings: `text-white`
  - Body: `text-gray-300`
  - Subtle: `text-gray-400`, `text-gray-500`

## Database Schema

### Key Tables:
1. **profile** - Contains `executive_summary` (EditorJS format)
2. **resume_entries** - Main entries with dates, descriptions, positioning
3. **resume_entry_types** - Position types: 'Left Side', 'Right Side', 'Center'
4. **resume_assets** - Links content items or custom URLs to entries
5. **collections** - Referenced for "Samples" button
6. **custom_pdfs** - Downloadable resume PDFs

### Important Fields:

**resume_entries:**
- `entry_type_id` → references position type (left/right/center)
- `title` → Company name (left/right) or Caption text (center)
- `subtitle` → Job title (left/right only)
- `short_description` → Plain text, always visible
- `description` → EditorJS JSON, shown when expanded
- `date_start`, `date_end` → Timeline date range
- `collection_id` → Optional link to collection for "Samples" button
- `is_featured` → Highlights entry with special border

## Critical Issues Resolved

### Issues Fixed (December 2024):
1. ✅ **Missing "Now" marker** - Now appears at top of timeline
2. ✅ **Year marker positioning** - Year markers now large background elements with 10% opacity
3. ✅ **Chronological errors** - Markers now in correct order
4. ✅ **Timeline height mismatch** - Height calculation now matches positioning logic
5. ✅ **Debug mode broken** - Debug mode now works with identical logic to normal mode
6. ✅ **Entry positioning logic reversed** - Fixed fundamental bug where future dates appeared above "Now" marker

### Fixes Applied:
- ✅ **Fixed year positioning** - Year markers now large background elements at midpoint
- ✅ **Restored "Now" marker** - Always appears at top
- ✅ **Fixed height calculation** - Month-based positioning implemented
- ✅ **Simplified debug mode** - Uses identical logic, only differs in text visibility
- ✅ **Removed maximum height constraints** - Long timelines now acceptable
- ✅ **Fixed entry positioning calculation** - Reversed month calculation to ensure timeline flows correctly from newest (top) to oldest (bottom)

## Development Notes

- Current date: October 24, 2025
- Timeline should start with "Now" at top
- Timeline flows chronologically from newest to oldest
- The timeline is dynamic and it stretches as needed to fit resume entries
- Entry cards positioned at END dates for logical flow
- Keep it simple first, add polish later
- Test with real resume data as you build
- There must be no scroll on the page itself, only scrollable by the browser
- Timeline starts at 2010, ends at current date
- Birth caption always at bottom, not on timeline
- Dynamic spacing based on content
- Minimum height: 300px
- No maximum height constraint (long timelines are acceptable)
