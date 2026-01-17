# Sidebar Navigation Requirements

## Overview
This document contains all requirements for the barrel-style sidebar navigation system based on user specifications from the development chat.

## Visual Layout

### Column Structure
- **3 columns total**: Categories, Subcategories, Content Items
- **Selected item always in center**: middle row contains the selected item
- **Left-aligned text** within each column
- **Fixed positioning**: Sidebar takes 33% of screen width, positioned at left edge, starts 2% right from the left edge of the screen

### Column Widths (Relative to Sidebar)
- **Column 1 (Categories)**: 0%-25% of sidebar (25% width) - fits 15 characters
- **Column 2 (Subcategories)**: 30%-55% of sidebar (25% width) - fits 15 characters  
- **Column 3 (Content Items)**: 60%-100% of sidebar (40% width) - fits 20 characters

## Navigation Logic

### Item Display Rules
1. **Selected items must be in the center** 
2. **Never duplicate items** - each item appears only once
3. **Leave gaps for missing items** - if fewer than 5 items, show empty slots
4. **Circular wrapping for 5+ items** - items that don't fit below wrap to the top, but don't duplicate items
5. **Load on first item** - by default, Item 1 in priority is always selected when the page loads 
6. **Same logic**: Every column works the same way with the same behavior (design is a little different for Column 3)
7. **Symmetry** - the sidebar is always symmetrical to the top and to the bottom of the center, if there are odd number of items in a column, the equal number of items need to appear on each side of the selected item in the center; if there are even number of items, an extra item appears at the bottom of the list, making the bottom one item longer than the top (with the only exception the two items in one column; for detailed logic, see next)

## Behavior by Item Count

### 1 Item: Item 1 is the only item that can be selected
- Row 1: **Item 1** (selected)

### 2 Items: When Item 1 is selected (default)
- Row 1: **Item 1** (selected)
- Row 2: Item 2

### 2 Items: When Item 2 is selected, Item 1 goes on top if there are only two items
- Row 1: Item 1
- Row 2: **Item 2** (selected)

### 3 Items: When Item 1 is selected (default)
- Row 1: Item 3
- Row 2: **Item 1** (selected)
- Row 3: Item 2

### 3 Items: When Item 2 is selected 
- Row 1: Item 1
- Row 2: **Item 2** (selected)
- Row 3: Item 3

### 3 Items: When Item 3 is selected 
- Row 1: Item 2
- Row 2: **Item 3** (selected)
- Row 3: Item 1

### 4 Items: When Item 1 is selected (default)
- Row 1: Item 4
- Row 2: **Item 1** (selected)
- Row 3: Item 2
- Row 4: Item 3

### 4 Items: When Item 2 is selected 
- Row 1: Item 1
- Row 2: **Item 2** (selected)
- Row 3: Item 3
- Row 4: Item 4

### 4 Items: When Item 3 is selected 
- Row 1: Item 2
- Row 2: **Item 3** (selected)
- Row 3: Item 4
- Row 4: Item 1

### 4 Items: When Item 4 is selected 
- Row 1: Item 3
- Row 2: **Item 4** (selected)
- Row 3: Item 1
- Row 4: Item 2

### 5 Items: When Item 1 is selected (default)
- Row 0: Item 4
- Row 1: Item 5
- Row 2: **Item 1** (selected)
- Row 3: Item 2
- Row 4: Item 3

### 5 Items: When Item 2 is selected 
- Row 0: Item 5
- Row 1: Item 1
- Row 2: **Item 2** (selected)
- Row 3: Item 3
- Row 4: Item 4

### 5 Items: When Item 3 is selected 
- Row 0: Item 1
- Row 1: Item 2
- Row 2: **Item 3** (selected)
- Row 3: Item 4
- Row 4: Item 5

### 5 Items: When Item 4 is selected 
- Row 0: Item 2
- Row 1: Item 3
- Row 2: **Item 4** (selected)
- Row 3: Item 5
- Row 4: Item 1

### 5 Items: When Item 5 is selected 
- Row 0: Item 3
- Row 1: Item 4
- Row 2: **Item 5** (selected)
- Row 3: Item 1
- Row 4: Item 2

### 6 Items: When Item 1 is selected (default)
- Row 1: Item 5
- Row 2: Item 6
- Row 3: **Item 1** (selected)
- Row 4: Item 2
- Row 5: Item 3
- Row 6: Item 4

### 6 Items: When Item 2 is selected 
- Row 1: Item 6
- Row 2: Item 1
- Row 3: **Item 2** (selected)
- Row 4: Item 3
- Row 5: Item 4
- Row 6: Item 5

### 6 Items: When Item 3 is selected 
- Row 1: Item 1
- Row 2: Item 2
- Row 3: **Item 3** (selected)
- Row 4: Item 4
- Row 5: Item 5
- Row 6: Item 6

### 6 Items: When Item 4 is selected 
- Row 1: Item 2
- Row 2: Item 3
- Row 3: **Item 4** (selected)
- Row 4: Item 5
- Row 5: Item 6
- Row 6: Item 1

### 6 Items: When Item 5 is selected 
- Row 1: Item 3
- Row 2: Item 4
- Row 3: **Item 5** (selected)
- Row 4: Item 6
- Row 5: Item 1
- Row 6: Item 2

### 6 Items: When Item 6 is selected 
- Row 1: Item 4
- Row 2: Item 5
- Row 3: **Item 6** (selected)
- Row 4: Item 1
- Row 5: Item 2
- Row 6: Item 3

### 7 Items: When Item 1 is selected (default)
- Row 1: Item 5
- Row 2: Item 6
- Row 3: Item 7  
- Row 4: **Item 1** (selected)
- Row 5: Item 2
- Row 6: Item 3
- Row 7: Item 4

### 7 Items: When Item 1 is selected (default)
- Row 1: Item 5
- Row 2: Item 6
- Row 3: Item 7  
- Row 4: **Item 1** (selected)
- Row 5: Item 2
- Row 6: Item 3
- Row 7: Item 4

### 7 Items: When Item 2 is selected 
- Row 1: Item 6
- Row 2: Item 7
- Row 3: Item 1  
- Row 4: **Item 2** (selected)
- Row 5: Item 3
- Row 6: Item 4
- Row 7: Item 5

### 7 Items: When Item 3 is selected 
- Row 1: Item 7
- Row 2: Item 1
- Row 3: Item 2  
- Row 4: **Item 3** (selected)
- Row 5: Item 4
- Row 6: Item 5
- Row 7: Item 6

### 7 Items: When Item 4 is selected 
- Row 1: Item 1
- Row 2: Item 2
- Row 3: Item 3  
- Row 4: **Item 4** (selected)
- Row 5: Item 5
- Row 6: Item 6
- Row 7: Item 7

### 7 Items: When Item 5 is selected 
- Row 1: Item 2
- Row 2: Item 3
- Row 3: Item 4  
- Row 4: **Item 5** (selected)
- Row 5: Item 6
- Row 6: Item 7
- Row 7: Item 8

### 7 Items: When Item 6 is selected 
- Row 1: Item 3
- Row 2: Item 4
- Row 3: Item 5  
- Row 4: **Item 6** (selected)
- Row 5: Item 7
- Row 6: Item 1
- Row 7: Item 2

### 7 Items: When Item 7 is selected 
- Row 1: Item 4
- Row 2: Item 5
- Row 3: Item 6  
- Row 4: **Item 7** (selected)
- Row 5: Item 1
- Row 6: Item 2
- Row 7: Item 3

The logic goes on after 7 items.

## Visual Effects

### Barrel Curve Design
- **Center item**: 100% opacity, green color, bold font
- **Adjacent items**: 70% opacity, gray color
- **Far items**: 40% opacity, darker gray color (if 4 or 5 items in a column); 25% opacity, darker gray color (if 6 or 7 items in a column)
- **Smooth animations**: 0.4s duration with easing
- **Hover effects**: Scale and color transitions

### Sidebar Subtitle (Column 3 only)
- **Location**: Below main content title
- **Color**: Gray
- **Size**: 75% of main title (0.75em)
- **Behavior**: Only show if `sidebar_subtitle` field exists
- **Year**: load publication year in the same line as subtitle in this format: "Subtitle / Year"

## Technical Requirements

### State Management
- **No automatic resets**: Don't reset selected indices when loading new data
- **Bounds checking**: Ensure selected indices stay within valid ranges
- **Previous index tracking**: For smooth animation direction

### Animation System
- **Smooth barrel rotation**: Items slide in correct direction when changing selection
- **Direction calculation**: Moving down = items slide up, moving up = items slide down
- **No janky animations**: 60fps target, use transform and opacity only

### Data Loading
- **Hierarchical loading**: Categories → Subcategories → Content
- **Collection filtering**: Support collection-specific content filtering
- **Order preservation**: Use `order_index` for consistent ordering

## Error Prevention

### Never Do
- **Duplicate items** in any column
- **Reset selected indices** when data loads (unless no items available)
- **Show items outside their actual array bounds**
- **Use circular wrapping**

### Always Do
- **Keep selected item in center** (Row 2)
- **Show empty gaps** for missing items
- **Maintain smooth animations**
- **Preserve user selections** when possible

## Success Criteria
- ✅ Selected items always in center (Row 2)
- ✅ No item duplication ever
- ✅ Proper column widths (15-15-20 character capacity)
- ✅ Smooth barrel rotation animations
- ✅ Sidebar subtitle functionality
- ✅ Circular wrapping for 5+ items only
- ✅ Empty gaps for <5 items
- ✅ No Node.js/React warnings
- ✅ Responsive to 1-7+ items
