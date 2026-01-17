# Resume Timeline Center Entries Implementation Plan

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

Implement center entry cards for the resume timeline with custom spacing logic, RGB 88b6e3 month markers, and proper expansion functionality. Center entries override standard month spacing only between their start and end dates, while maintaining standard spacing for other timeline sections.

## Current State Analysis

### Existing Implementation
- ✅ Timeline structure with markers working
- ✅ Left/right entry cards implemented
- ✅ Entry expansion state management working
- ✅ Month marker generation and positioning
- ✅ Timeline height calculation
- ❌ Center entry cards NOT implemented
- ❌ Custom spacing logic NOT implemented
- ❌ RGB 88b6e3 month markers NOT implemented

### Key Requirements from User Clarifications

1. **Background Cards**: Center entries DO have background cards (same color as page background)
2. **Timeline Spacing Override**: Center entries override standard spacing ONLY between their start and end dates
3. **Month Marker Colors**: Both start and end date markers for center entries use RGB 88b6e3
4. **Expansion Behavior**: Expands in both directions from center
5. **Conditional Arrow**: Only shows if short_description exists, affects background height
6. **Timeline Integration**: Center entries participate in timeline expansion and visual positioning

## Implementation Plan

### Phase 1: Basic Center Entry Structure (Test 1)

**Goal**: Get basic center entries rendering with correct layout and positioning

**Implementation Steps**:

1. **Create `renderCenterEntry` Function**
   - Position at END date (+20px offset)
   - Centered positioning with `w-[384px]`
   - Background card with page background color
   - Collapsed state layout: End date → Title → Start date → Arrow (if short_description exists)

2. **Add Center Entry Rendering to Entry Loop**
   - Update entry rendering logic to call `renderCenterEntry` for center entries
   - Ensure center entries are positioned correctly

3. **Test Basic Rendering**
   - Create one center entry in admin panel
   - Verify positioning matches END date + 20px offset
   - Check background card styling
   - Verify green timeline line passes underneath

**Test Criteria**:
- ✅ Center entry appears at correct position
- ✅ Layout matches collapsed state from draft
- ✅ Background card renders with correct styling
- ✅ Green timeline line passes underneath
- ✅ No TypeScript errors

### Phase 2: Month Marker Color Logic (Test 2)

**Goal**: Implement RGB 88b6e3 color for center entry month markers

**Implementation Steps**:

1. **Track Center Entry Dates in Marker Generation**
   - Add center entry date tracking to `generateTimelineMarkers()`
   - Create `centerEntryDates` Set to track center entry month markers
   - Apply different color logic for center entry markers

2. **Update Marker Rendering Logic**
   - Modify marker rendering to use RGB 88b6e3 for center entry markers
   - Ensure regular entry markers still use emerald-400
   - Test color consistency across all markers

3. **Test Month Marker Colors**
   - Verify center entry month markers use RGB 88b6e3
   - Verify regular entry month markers still use emerald-400
   - Test with mixed entry types

**Test Criteria**:
- ✅ Center entry month markers use RGB 88b6e3
- ✅ Regular entry month markers still use emerald-400
- ✅ Colors are consistent across all markers
- ✅ No visual conflicts between marker types

### Phase 3: Expansion Functionality (Test 3)

**Goal**: Add expand/collapse functionality for center entries

**Implementation Steps**:

1. **Add Expansion State Management**
   - Reuse existing `expandedEntries` state for center entries
   - Ensure expansion state works consistently across entry types

2. **Implement Expand/Collapse Button**
   - Only show button if `short_description` exists
   - Use existing `toggleEntryExpansion` function
   - Style button to match draft (green arrow)

3. **Add Expanded Content Rendering**
   - Show short_description when expanded
   - Ensure content expands in both directions from center
   - Adjust background height based on content

4. **Test Expansion Behavior**
   - Test expansion with short_description
   - Test no expansion without short_description
   - Verify arrow behavior
   - Test background height adjustment

**Test Criteria**:
- ✅ Expansion works correctly (both directions from center)
- ✅ Arrow only appears when short_description exists
- ✅ Background height adjusts based on arrow presence
- ✅ Expansion state persists correctly
- ✅ No overlapping with other elements

### Phase 4: Timeline Spacing Override Logic (Test 4)

**Goal**: Implement custom spacing for center entry month markers

**Implementation Steps**:

1. **Create Center Entry Spacing Calculation Function**
   - Identify center entry date ranges
   - Calculate custom spacing for center entry sections
   - Maintain standard spacing for non-center entry sections

2. **Override Standard Month Spacing for Center Entries**
   - Modify `getDatePosition` function to handle center entry spacing
   - Ensure center entry markers appear as close/far as in drafts
   - Preserve standard spacing for side entries

3. **Test Mixed Scenarios**
   - Test with center entries only
   - Test with side entries only
   - Test with mixed entry types
   - Verify spacing logic works correctly

**Test Criteria**:
- ✅ Center entry month markers positioned exactly as in drafts
- ✅ Side entry spacing unaffected
- ✅ Mixed scenarios work correctly
- ✅ Timeline height adjusts properly
- ✅ No spacing conflicts between entry types

### Phase 5: Integration Testing (Test 5)

**Goal**: Test complete functionality with real data

**Implementation Steps**:

1. **Test with Multiple Center Entries**
   - Create multiple center entries with different date ranges
   - Verify spacing between center entries
   - Test expansion with multiple entries

2. **Test with Mixed Entry Types**
   - Test left/right/center entries together
   - Verify no overlapping or positioning issues
   - Test timeline height calculation

3. **Test All Interactions**
   - Test expansion/collapse with multiple entries
   - Test month marker colors with mixed types
   - Test timeline scrolling and positioning

4. **Performance Testing**
   - Test with large number of entries
   - Verify smooth scrolling
   - Check for any performance issues

**Test Criteria**:
- ✅ All entry types render correctly
- ✅ No overlapping or positioning issues
- ✅ Timeline height adjusts dynamically
- ✅ All interactions work smoothly
- ✅ Performance is acceptable

## Technical Implementation Details

### Center Entry Function Structure

```typescript
const renderCenterEntry = (entry: ResumeEntry) => {
  const isExpanded = expandedEntries.has(entry.id)
  const hasShortDescription = entry.short_description && entry.short_description.trim() !== ''
  
  // Position at END date (+20px offset)
  const endDate = entry.date_end 
    ? new Date(entry.date_end.split('-').map(Number).map((n, i) => i === 1 ? n - 1 : n) as [number, number, number])
    : new Date()
  const topPosition = getDatePosition(endDate) + 20
  
  return (
    <div
      key={entry.id}
      className="absolute left-1/2 transform -translate-x-1/2 w-[384px] text-center"
      style={{
        top: `${topPosition}px`,
        zIndex: 20
      }}
    >
      {/* Background Card - same color as page background */}
      <div className="bg-[#0f1419] rounded-lg p-4 border border-gray-800">
        {/* End Date */}
        {entry.date_end && (
          <div className="text-xs text-[#88b6e3] mb-2">
            {formatEntryDateRange(null, entry.date_end)}
          </div>
        )}
        
        {/* Title */}
        <h4 className="text-lg font-bold text-white mb-2">
          {entry.title}
        </h4>
        
        {/* Short Description (only when expanded) */}
        {isExpanded && hasShortDescription && (
          <div className="text-sm text-gray-300 mb-2">
            {entry.short_description}
          </div>
        )}
        
        {/* Start Date */}
        {entry.date_start && (
          <div className="text-xs text-[#88b6e3] mt-2">
            {formatEntryDateRange(entry.date_start, null).split(' →')[0]}
          </div>
        )}
        
        {/* Expand/Collapse Button (only if short description exists) */}
        {hasShortDescription && (
          <button
            onClick={() => toggleEntryExpansion(entry.id)}
            className="mt-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        )}
      </div>
    </div>
  )
}
```

### Month Marker Color Logic

```typescript
// In generateTimelineMarkers function, add center entry tracking:
const centerEntryDates = new Set<string>()
resumeEntries.forEach(entry => {
  if (getEntryPosition(entry) === 'center') {
    if (entry.date_start) {
      const [year, month, day] = entry.date_start.split('-').map(Number)
      const startDate = new Date(year, month - 1, day)
      centerEntryDates.add(`${startDate.getFullYear()}-${startDate.getMonth()}`)
    }
    if (entry.date_end) {
      const [year, month, day] = entry.date_end.split('-').map(Number)
      const endDate = new Date(year, month - 1, day)
      centerEntryDates.add(`${endDate.getFullYear()}-${endDate.getMonth()}`)
    }
  }
})

// Then in marker rendering:
const isCenterEntry = centerEntryDates.has(dateKey)
const markerColor = isCenterEntry ? 'text-[#88b6e3]' : 'text-emerald-400'
```

### Timeline Spacing Override Logic

```typescript
// Modify getDatePosition to handle center entry spacing
const getDatePosition = (date: Date): number => {
  const now = new Date()
  const monthHeight = 35 // 25px marker + 10px padding
  
  // Check if date falls within center entry range
  const isInCenterEntryRange = resumeEntries.some(entry => {
    if (getEntryPosition(entry) !== 'center') return false
    
    const startDate = entry.date_start ? new Date(entry.date_start) : null
    const endDate = entry.date_end ? new Date(entry.date_end) : now
    
    return startDate && endDate && date >= startDate && date <= endDate
  })
  
  // Use custom spacing for center entry ranges
  if (isInCenterEntryRange) {
    // Custom spacing logic for center entries
    // This will be refined based on draft positioning
    const customMonthHeight = 20 // Smaller spacing for center entries
    const monthsFromNow = (now.getFullYear() - date.getFullYear()) * 12 + 
                          (now.getMonth() - date.getMonth())
    return 50 + (monthsFromNow * customMonthHeight)
  }
  
  // Standard spacing for non-center entry ranges
  const monthsFromNow = (now.getFullYear() - date.getFullYear()) * 12 + 
                        (now.getMonth() - date.getMonth())
  return 50 + (monthsFromNow * monthHeight)
}
```

## Testing Strategy

### Test 1: Basic Rendering
- Create one center entry in admin panel
- Verify it renders at correct position
- Check background card styling
- Verify green line passes underneath

### Test 2: Month Marker Colors
- Verify center entry month markers use RGB 88b6e3
- Verify regular entry markers still use emerald-400
- Test with mixed entry types

### Test 3: Expansion Functionality
- Test expansion with short_description
- Test no expansion without short_description
- Verify arrow behavior
- Test background height adjustment

### Test 4: Timeline Spacing
- Test center entry month marker positioning
- Compare with draft images
- Test mixed scenarios
- Verify timeline height calculation

### Test 5: Integration
- Test with multiple entries
- Test all interactions
- Verify no overlapping
- Test performance

## Success Criteria

- ✅ Center entries render with correct layout and positioning
- ✅ Month markers use RGB 88b6e3 for center entries
- ✅ Expansion functionality works correctly
- ✅ Timeline spacing override works for center entry ranges
- ✅ Mixed entry types work together without conflicts
- ✅ Timeline height adjusts dynamically
- ✅ No overlapping or positioning issues
- ✅ All interactions work smoothly

## Files to Modify

1. **`components/tabs/ResumeTab.tsx`** - Add center entry rendering logic
2. **`docs/resume-timeline-phase-2.plan.md`** - Update with center entry implementation status

## Notes

- Keep it simple first, add polish later
- Test with real resume data as you build
- Center entries override standard spacing only between their start and end dates
- Expansion grows in both directions from center
- Arrow only appears if short_description exists
- Background cards use page background color
- Green timeline line passes underneath center entries

## Next Steps

1. **Phase 1**: Implement basic center entry structure
2. **Phase 2**: Add month marker color logic
3. **Phase 3**: Implement expansion functionality
4. **Phase 4**: Add timeline spacing override logic
5. **Phase 5**: Complete integration testing

This plan ensures we test frequently and catch issues early, building a robust center entry implementation that integrates seamlessly with the existing timeline logic.
