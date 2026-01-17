<!-- 5bac5b68-a912-4ed0-bd22-92d301bc8e70 f8ea6fdc-01f3-4a66-b892-b275a43bed18 -->
# Timeline Logic Implementation Corrections

## Critical Changes Required in `components/tabs/ResumeTab.tsx`

### 1. Unify `getDatePosition()` Function (Lines 76-125)

**Problem:** Different logic for debug vs normal mode

**Fix:** Use single month-based calculation for both modes

```typescript
const getDatePosition = (date: Date): number => {
  const now = new Date()
  const monthHeight = 35 // 25px marker + 10px padding
  const monthsFromNow = (now.getFullYear() - date.getFullYear()) * 12 + 
                        (now.getMonth() - date.getMonth())
  return 50 + (monthsFromNow * monthHeight) // 50px top padding
}
```

**Remove:**

- Lines 79-119: Entire debug mode branch with year offset calculations
- Lines 121-124: Year-based normal mode calculation
- All references to `pixelsPerYear = 300`

### 2. Add Year Marker Positioning Helper Function

**Add new function after `getDatePosition()`:**

```typescript
const getYearMarkerPosition = (year: number): number => {
  // Position year marker at midpoint between January and December
  const januaryDate = new Date(year, 0, 1)
  const decemberDate = new Date(year, 11, 1)
  const januaryPos = getDatePosition(januaryDate)
  const decemberPos = getDatePosition(decemberDate)
  return (januaryPos + decemberPos) / 2
}
```

### 3. Fix `calculateTimelineHeight()` Function (Lines 139-204)

**Problem:** Different logic for debug/normal, uses year-based calculations, has maximum height constraint

**Fix for Debug Mode (Lines 142-166):**

- Remove lines 154-165 (year marker height calculations)
- Change to:
```typescript
if (showAllMarkers) {
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  
  // Count total months from 2010 to current month
  const monthsDiff = (currentYear - 2010) * 12 + currentMonth
  const monthHeight = 35 // 25px marker + 10px padding
  const topPadding = 50
  const bottomPadding = 100
  
  const calculatedHeight = topPadding + (monthsDiff * monthHeight) + bottomPadding
  return Math.max(calculatedHeight, 300) // No maximum constraint
}
```


**Fix for Normal Mode (Lines 168-204):**

- Replace lines 199-203 with:
```typescript
// Calculate months between earliest and latest dates
const monthsDiff = (now.getFullYear() - earliestDate.getFullYear()) * 12 + 
                  (now.getMonth() - earliestDate.getMonth())
const monthHeight = 35 // 25px marker + 10px padding
const calculatedHeight = monthsDiff * monthHeight + 200 // 100px top + 100px bottom

return Math.max(calculatedHeight, 300) // No maximum constraint
```


**Remove:**

- Line 165: `Math.min(..., 10000)` cap
- Line 203: `Math.min(..., 3000)` cap
- Lines 199-200: `pixelsPerYear` calculations

### 4. Update Marker Rendering (Lines 443-452)

**Problem:** Year markers positioned using date logic, should use midpoint

**Fix:**

```typescript
{generateTimelineMarkers().map((marker) => (
  <div
    key={marker.id}
    className={`absolute left-1/2 transform -translate-x-1/2 text-emerald-400 font-bold bg-[#0f1419] px-2 z-10 ${
      marker.type === 'now' ? 'text-lg' : marker.type === 'year' ? 'text-2xl' : 'text-sm'
    }`}
    style={{ 
      top: marker.type === 'year' 
        ? `${getYearMarkerPosition(marker.date.getFullYear())}px`
        : `${getDatePosition(marker.date)}px` 
    }}
  >
    {marker.label}
  </div>
))}
```

### 5. Update Debug Window Text (Line 475)

**Change:**

```typescript
<p>Timeline height: {calculateTimelineHeight()}px (min: 300px)</p>
```

**Remove:** "max: 3000px" reference

### 6. Conditional Marker Visibility for Normal Mode

**Problem:** Debug mode should only differ in text visibility, not logic

**Fix:** Add visibility logic in marker rendering (Lines 443-452)

```typescript
{generateTimelineMarkers().map((marker) => {
  // Hide month marker text in normal mode if no corresponding entry
  const shouldShowText = showAllMarkers || 
                        marker.type === 'now' || 
                        marker.type === 'year' ||
                        (marker.type === 'month' && /* has corresponding entry */)
  
  return (
    <div
      key={marker.id}
      className={`absolute left-1/2 transform -translate-x-1/2 text-emerald-400 font-bold bg-[#0f1419] px-2 z-10 ${
        marker.type === 'now' ? 'text-lg' : marker.type === 'year' ? 'text-2xl' : 'text-sm'
      } ${!shouldShowText ? 'opacity-0' : ''}`}
      // ... rest of component
    >
      {marker.label}
    </div>
  )
})}
```

### 7. Update `generateTimelineMarkers()` for Consistency

**Change Lines 247-276:** Generate all month markers in both modes, only differ in visibility

```typescript
// Generate month markers for ALL months from 2010 to now
const currentYear = now.getFullYear()
const currentMonth = now.getMonth()

for (let year = currentYear; year >= 2010; year--) {
  const endMonth = year === currentYear ? currentMonth : 11
  
  for (let month = endMonth; month >= 0; month--) {
    const date = new Date(year, month, 1)
    const dateKey = `${year}-${month}`
    const hasEntry = entryDates.has(dateKey)
    
    markers.push({
      id: `month-${year}-${month}`,
      date,
      label: formatDateLabel(date, 'month'),
      type: 'month',
      hasEntry // Add flag for visibility logic
    })
  }
}
```

## Summary of Key Changes

1. **Unify positioning logic**: Single month-based calculation for both debug and normal modes
2. **Remove year-based calculations**: Replace all `pixelsPerYear = 300` with `monthHeight = 35`
3. **Remove maximum height caps**: Delete all `Math.min(..., 3000)` and `Math.min(..., 10000)` constraints
4. **Add year marker midpoint positioning**: New helper function and conditional rendering
5. **Implement text visibility**: Debug mode shows all marker text, normal mode hides non-entry markers
6. **Consistent marker generation**: Always generate all markers, only differ in visibility

## Files Modified

- `components/tabs/ResumeTab.tsx`: All corrections above

## Expected Results

- Timeline height scales with months (35px per month)
- Debug and normal modes use identical positioning logic
- Year markers appear between January and December
- No maximum height constraint (timelines can be 6000+ pixels)
- Debug mode shows all marker text, normal mode hides markers without entries
- Consistent behavior regardless of mode

### To-dos

- [ ] Replace getDatePosition() with unified month-based calculation
- [ ] Add getYearMarkerPosition() helper function for midpoint calculation
- [ ] Update calculateTimelineHeight() debug mode to use month-based logic
- [ ] Update calculateTimelineHeight() normal mode to use month-based logic
- [ ] Remove all maximum height constraints (3000px, 10000px caps)
- [ ] Update marker rendering to use year marker midpoint positioning
- [ ] Add conditional visibility for markers in normal vs debug mode
- [ ] Update generateTimelineMarkers() to generate all markers consistently
- [ ] Update debug window text to remove max height reference
- [ ] Update TimelineMarker type to include hasEntry flag