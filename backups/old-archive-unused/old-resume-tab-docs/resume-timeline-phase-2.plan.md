<!-- cf90ff5d-bd05-435c-adfc-1383603a0c42 8800c1bd-b631-4c0f-8538-f7348340c9e4 -->
# Resume Timeline Phase 2: Entry Card Implementation

## ⚠️ IMPORTANT: THIS DOCUMENT IS NOW OUTDATED AND ARCHIVED, STOP READING IT UNLESS THE USER SPECIFICALLY DIRECTED AI TO READ IT

**All timeline logic has been consolidated into a single source of truth:**
**📋 `docs\resume-timeline-logic.md`**

This document contains the complete, up-to-date timeline logic including:
- Dynamic spacing system and expansion logic
- Entry positioning and card structure
- Center entry special logic
- Timeline height calculations
- All implementation details

**Please refer to the consolidated document for all timeline logic questions.**

---

## Overview

Build entry cards that position at their end dates on the timeline with proper left/right/center alignment, expandable descriptions, asset links, and collection navigation.

## Current State ⚠️ PARTIALLY COMPLETE

- Phase 1 complete: Timeline structure with markers working
- Data loading working: `resumeEntries` loaded with types, assets, collections
- Timeline height calculation working
- Date position calculator working (`getDatePosition`)
- ✅ **Entry expansion state and toggle functionality implemented**
- ✅ **Entry positioning helper functions implemented**
- ✅ **Entry date range formatting working**
- ✅ **Left/right entry card rendering implemented**
- ❌ **Center entry card rendering NOT implemented**
- ❌ **Entry cards rendering loop NOT implemented**
- ❌ **Timeline height adjustment for expanded entries NOT implemented**
- ❌ **Collection handler NOT wired from parent**
- ❌ **Text alignment fixes NOT implemented**
- ❌ **Asset links NOT implemented**
- ❌ **Samples buttons NOT implemented**
- ❌ **Featured entries styling NOT implemented**

## Implementation Steps

### Step 1: Add Entry Expansion State ✅ COMPLETE

Add state to track which entries are expanded for the description toggle.

**File:** `components/tabs/ResumeTab.tsx`

Add after line 73 (after `showAllMarkers` state):

```typescript
const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
```

Add toggle function:

```typescript
const toggleEntryExpansion = (entryId: string) => {
  setExpandedEntries(prev => {
    const next = new Set(prev)
    if (next.has(entryId)) {
      next.delete(entryId)
    } else {
      next.add(entryId)
    }
    return next
  })
}
```

**Status:** ✅ Implemented and working correctly

---

### Step 2: Create Entry Position Helper ✅ COMPLETE

Add function to determine if entry is left, right, or center based on type.

**File:** `components/tabs/ResumeTab.tsx`

Add helper function after `formatDateLabel`:

```typescript
const getEntryPosition = (entry: ResumeEntry): 'left' | 'right' | 'center' => {
  const typeName = entry.resume_entry_types?.name
  if (typeName === 'Left Side') return 'left'
  if (typeName === 'Right Side') return 'right'
  if (typeName === 'Center') return 'center'
  return 'left' // default
}
```

**Status:** ✅ Implemented and working correctly

---

### Step 3: Format Entry Date Ranges ✅ COMPLETE

Add helper to format date ranges for entry cards (e.g., "March 2024 → December 2024").

**File:** `components/tabs/ResumeTab.tsx`

Add function:

```typescript
const formatEntryDateRange = (start: string | null, end: string | null): string => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  
  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-').map(Number)
    return `${monthNames[month - 1]} ${year}`
  }
  
  if (!start && !end) return ''
  if (!start) return end ? formatDate(end) : ''
  if (!end) return `${formatDate(start)} → Present`
  return `${formatDate(start)} → ${formatDate(end)}`
}
```

**Status:** ✅ Implemented and working correctly

---

### Step 4: Build Left/Right Entry Card Component

**Goal**: Create the regular entry card structure for left and right positioned entries

**Test**: Render one entry card, verify positioning and styling

---

### Step 5: Build Center Entry Card Component ❌ NOT IMPLEMENTED

**Goal**: Create compact centered caption cards

**Status:** ❌ Not implemented yet - needs to be added

---

### Step 6: Render All Entry Cards in Timeline ❌ NOT IMPLEMENTED

**Goal**: Add entry rendering loop after timeline markers

**Status:** ❌ Not implemented yet - needs to be added

### Step 7: Fix Timeline Height for Expanded Entries ❌ NOT IMPLEMENTED

**Goal**: Update height calculation to account for expanded entry content dynamically

**Status:** ❌ Not implemented yet - needs to be added

### Step 8: Pass Collection Handler from Parent ❌ NOT IMPLEMENTED

**Goal**: Update component props to receive `onOpenCollection` from parent page

**Status:** ❌ Not implemented yet - needs to be added

### Step 9: Wire Collection Handler in Parent ❌ NOT IMPLEMENTED

**Goal**: Update parent page to pass handler to ResumeTab

**Status:** ❌ Not implemented yet - needs to be added

### Step 10: Fix Text Alignment for Left Entries ❌ NOT IMPLEMENTED

**Goal**: Ensure all elements in left entries are right-aligned

**Status:** ❌ Not implemented yet - needs to be added

### Step 11: Polish Entry Card Spacing ❌ NOT IMPLEMENTED

**Goal**: Fine-tune spacing and transitions for expand/collapse

**Status:** ❌ Not implemented yet - needs to be added

### Step 12: Test with All Entry Types ❌ NOT IMPLEMENTED

**Goal**: Create comprehensive test with mixed left/right/center entries

**Testing:**
1. Verify left entries: right-aligned, correct position
2. Verify right entries: left-aligned, correct position
3. Verify center entries: centered, compact layout
4. Verify expand/collapse works
5. Verify assets links work (content and external)
6. Verify Samples buttons open collection tabs
7. Verify featured entries have emerald border
8. Verify timeline height adjusts with expansions

**Status:** ❌ Not implemented yet - needs to be added

---

## Success Criteria

- Entry cards render at their end dates with 20px offset
- Left entries positioned at `calc(50% - 700px)`, right-aligned
- Right entries positioned at `calc(50% + 48px)`, left-aligned
- Center entries centered, compact layout
- Expand/collapse reveals EditorJS description
- Asset links work for both content items and external URLs
- Samples buttons open collection tabs dynamically
- Featured entries have emerald border and shadow
- Timeline height adjusts when entries expand
- No overlapping between entries and markers

## Files Modified

1. `components/tabs/ResumeTab.tsx` - Add entry rendering logic
2. `app/page.tsx` - Pass collection handler to ResumeTab

## Notes

- Freeze and test after each small step
- Debug positioning issues immediately when they appear
- Keep expand/collapse simple (no complex animations yet)
- Collection tab opening uses existing `handleOpenCollection` functionality

### To-dos ⚠️ PARTIALLY COMPLETE

- [x] Add expansion state and toggle function for entry descriptions
- [x] Create helper functions: getEntryPosition, formatEntryDateRange
- [x] Build renderRegularEntry function for left/right cards
- [ ] Build renderCenterEntry function for caption cards
- [ ] Add entry cards rendering loop in timeline
- [ ] Update timeline height calculation for expanded entries
- [ ] Wire collection handler from parent through props
- [ ] Verify and polish text alignment for left/right entries
- [ ] Test all entry types, expand/collapse, links, and collection navigation

## ⚠️ PHASE 2 PARTIALLY COMPLETE

**What's Working:**
✅ **Entry Expansion State:** State management and toggle functions implemented  
✅ **Helper Functions:** Entry positioning and date formatting working  
✅ **Basic Entry Cards:** Left/right entry card structure implemented  

**What Still Needs to be Done:**
❌ **Center Entry Cards:** Not implemented yet  
❌ **Entry Rendering Loop:** Not implemented yet  
❌ **Timeline Height Adjustment:** Not implemented yet  
❌ **Collection Handler:** Not wired from parent  
❌ **Asset Links:** Not implemented in cards  
❌ **Samples Buttons:** Not implemented  
❌ **Text Alignment:** Not properly implemented  
❌ **Featured Entry Styling:** Not implemented  

## Session Summary (December 2024)

### Major Accomplishments
1. **Partially Implemented Phase 2:** Basic entry card structure and state management working
2. **Resolved Critical Admin Panel Issues:** Fixed data persistence problems
3. **Fixed Development Server Issues:** Resolved Next.js cache corruption and compilation errors
4. **Implemented Core Entry Card Foundation:** Basic structure, positioning helpers, and state management

### Key Technical Fixes
- **EditorJS Issues:** Temporarily replaced with reliable textarea solution to ensure data persistence
- **Supabase RLS:** Fixed Row Level Security policies for `resume_assets` table
- **Next.js Cache:** Cleared corrupted build cache and resolved ChunkLoadError issues
- **TypeScript Errors:** Fixed missing state variables and type mismatches

### Current Status
- ⚠️ **Frontend:** Phase 2 partially complete - foundation implemented, but most features still missing
- ✅ **Admin Panel:** Data persistence working correctly
- ⚠️ **EditorJS:** Needs restoration for full rich text editing capabilities

## Next Steps

**CRITICAL:** Restore EditorJS integration in admin panel for Full description before final testing.

**Phase 3:** Advanced timeline features (entry duration lines, animations, polish)