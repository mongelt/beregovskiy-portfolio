<!-- 9f841a81-64be-4bd8-b7d9-50805651ff76 76bdbfbe-8f52-468c-844c-432c5dd902e6 -->
# Resume Timeline Phase 1: Timeline Structure 

## ⚠️ IMPORTANT: Timeline Logic Reference

**All timeline logic has been consolidated into a single source of truth:**
**📋 `docs/timeline-logic-consolidated.md`**

This document contains the complete, up-to-date timeline logic including:
- Dynamic spacing system and expansion logic
- Entry positioning and card structure
- Center entry special logic
- Timeline height calculations
- All implementation details

**Please refer to the consolidated document for all timeline logic questions. This document is now outdated.**

---

## Overview

Implement the central vertical timeline with date markers (Now, months, years) and proper chronological ordering, laying the foundation for entry cards to be added in Phase 2.

## Current State - PHASE 1 COMPLETE ✅

- `components/tabs/ResumeTab.tsx` has a clean slate with working data loading
- Professional summary and PDF downloads are functional
- Resume entries are loaded from database with all related data
- Timeline structure fully implemented with markers and background years
- Single continuous timeline line with proper scrolling
- Debug mode working with identical logic to normal mode

## Phase 1 Scope

Focus exclusively on:

1. Central green vertical timeline line
2. Date marker system (Now, months, years)
3. Chronological ordering (newest → oldest)
4. Dynamic timeline height calculation
5. Proper date positioning calculations

**NOT in Phase 1:**

- Entry cards (Phase 2)
- Assets and links (Phase 4)
- Colored accent lines alongside timeline (later phase)
- Expand/collapse for entries (Phase 3)

## Implementation Steps

### 1. Create Timeline Container

Replace the placeholder div in `ResumeTab.tsx` (lines 199-216) with a proper timeline container:

- Relative positioning for absolute-positioned markers and entries
- Remove max-width constraint to allow full-width positioning
- No fixed height - timeline should grow dynamically
- Background stays `#0f1419`

### 2. Implement Date Position Calculator

Create helper function to calculate pixel position from date:

```typescript
const getDatePosition = (date: Date): number => {
  const now = new Date() // Actual current date
  const monthHeight = 35 // 25px marker + 10px padding
  const monthsFromNow = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
  return 50 + (monthsFromNow * monthHeight) // 50px top padding
}
```

### 3. Build Timeline Markers Collection

Create function to generate all timeline markers:

**Marker Types:**

- **Now marker**: Current date using `new Date()` (NOT first of month)
- **Month markers**: Extract unique months from all `date_start` and `date_end` values
- **Year markers**: January 1st for each year (ALWAYS present, decorative design elements) 

**Sort chronologically**: Newest first (top) to oldest last (bottom)

**Key Rules:**

- Year marker = START of year (January 1st): `new Date(year, 0, 1)`
- Year markers positioned at midpoint between January and December markers
- Remove duplicate dates
- Example order: "Now (Oct 22, 2025)" → "April 2025" → "2025 (Jan 1)" → "December 2024" → ...

### 4. Render Central Timeline Line

Add single vertical green line at center:

```typescript
<div 
  className="absolute left-1/2 top-0 w-0.5 bg-gradient-to-b from-emerald-400 via-emerald-400/50 to-emerald-400/20 transform -translate-x-0.5" 
  style={{ height: `${timelineHeight}px` }}
/>
```

### 5. Render Timeline Markers

For each marker in sorted array:

```typescript
<div
  key={marker.id}
  className="absolute left-1/2 transform -translate-x-1/2 text-emerald-400 font-bold bg-[#0f1419] px-2 z-10"
  style={{ top: `${getDatePosition(marker.date)}px` }}
>
  {marker.label}
</div>
```

**Marker styling:**

- Now marker: `text-lg` - Display as "Now"
- Year markers: `text-2xl` - Display as "2025", "2024"
- Month markers: `text-sm` - Display as "December 2024", "March 2024"
- All have emerald-400 text with dark background for visibility

### 6. Calculate Timeline Height

```typescript
const calculateTimelineHeight = (): number => {
  if (resumeEntries.length === 0) return 300 // Minimum height
  
  const now = new Date()
  const dates = resumeEntries.flatMap(e => [
    e.date_start ? new Date(e.date_start) : null,
    e.date_end ? new Date(e.date_end) : now
  ]).filter(Boolean) as Date[]
  
  const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())))
  
  // Calculate months between earliest and latest dates
  const monthsDiff = (now.getFullYear() - earliestDate.getFullYear()) * 12 + 
                    (now.getMonth() - earliestDate.getMonth())
  const monthHeight = 35 // 25px marker + 10px padding
  const calculatedHeight = monthsDiff * monthHeight + 200 // 100px top + 100px bottom padding
  
  return Math.max(calculatedHeight, 300) // No maximum height constraint
}
```

### 7. Format Date Display Strings

Helper functions for marker labels:

- Now: "Now"
- Months: "October 2025", "December 2024" (full month name + year)
- Years: "2025", "2024" (just the year number)

## Files to Modify

### `components/tabs/ResumeTab.tsx`

Lines to change:

- **Lines 199-216**: Replace placeholder with timeline implementation
- Add helper functions before component or as internal functions
- Keep all existing data loading (lines 65-119)
- Keep professional summary (lines 164-197)
- Keep PDF downloads (lines 148-161)

## Testing Checklist - COMPLETED ✅

- [x] Timeline line renders at center of viewport
- [x] "Now" marker appears at top with actual current date
- [x] Month markers appear for all entry dates
- [x] Year markers appear as large background elements
- [x] Markers are in correct chronological order (newest → oldest)
- [x] Timeline height adjusts based on date range
- [x] No overlap between markers
- [x] Timeline scrolls properly with browser scrollbar

## Success Criteria - ACHIEVED ✅

✅ Central green timeline line visible and properly positioned

✅ All date markers display in correct chronological order

✅ Timeline starts with "Now" at top

✅ Timeline height matches date range span

✅ No entry cards visible yet (saved for Phase 2)

✅ Existing features (summary, PDFs) still work

✅ Large background year numbers with 10% opacity

✅ Single continuous timeline line without breaks

✅ Single browser scrollbar (no container scrollbars)

✅ Debug mode working with identical logic

## Notes

- Keep it simple - no animations yet
- Use `Math.floor()` for pixel calculations to avoid sub-pixel rendering
- The "Now" marker should use the actual date (October 22, 2025 per docs), not rounded to month start
- Timeline should be contained within the scrollable content area (67% width on right side of page)

## CRITICAL BUGS INTRODUCED - RESOLVED ✅

### Issues Fixed:
1. ✅ **Missing "Now" marker** - Now appears at top of timeline
2. ✅ **Year marker overlap** - Year markers now large background elements
3. ✅ **Chronological errors** - Markers now in correct order
4. ✅ **Height mismatch** - Timeline height now matches positioning
5. ✅ **Debug mode broken** - Debug mode now works with identical logic

### Fixes Applied:
- ✅ **CRITICAL**: Fixed "Now" marker positioning at top
- ✅ **CRITICAL**: Fixed year marker positioning as background elements
- ✅ **CRITICAL**: Fixed timeline height calculation to match positioning (month-based)
- ✅ **CRITICAL**: Made debug mode usable (identical logic, text visibility differs)
- ✅ **CRITICAL**: Fixed chronological ordering of markers
- ✅ **CRITICAL**: Removed maximum height constraints (long timelines are acceptable)

### To-dos - COMPLETED ✅

- [x] Replace placeholder with timeline container structure
- [x] Create date position calculator and formatting helpers (month-based)
- [x] Build timeline markers collection from resume entries
- [x] Render central vertical green timeline line
- [x] Render all timeline markers with proper styling
- [x] Position year markers as large background elements
- [x] Verify chronological ordering and marker positioning
- [x] Fix all critical bugs introduced by debugging implementation
- [x] Remove maximum height constraints
- [x] Ensure debug mode uses identical logic to normal mode