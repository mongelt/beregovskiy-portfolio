# Order Control Implementation Guide

## Overview

Add manual ordering control to categories, subcategories, content items, and resume entries using `order_index` field.

---

## Database Setup

### Step 1: Add order_index to content table

Run the SQL in `add-order-index-to-content.sql`:

```sql
ALTER TABLE content ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_content_order ON content(order_index);
```

### Existing Tables with order_index

These tables already have `order_index`:
- ✅ `categories`
- ✅ `subcategories`  
- ✅ `resume_entry_types`
- ✅ `resume_entries`
- ✅ `custom_pdfs`
- ✅ `content_collections`

### New Table Needs order_index

- ⚠️ `content` - needs to be added

---

## Admin Panel Updates

### Option 1: Simple Number Input (Quick Implementation)

Add an "Order" number field to each admin form:

**Benefits:**
- Simple to implement
- Easy for users to understand
- No additional libraries needed

**Implementation:**

```tsx
// Add to form state
const [orderIndex, setOrderIndex] = useState(0)

// Add to form
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Display Order
  </label>
  <Input
    type="number"
    value={orderIndex}
    onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
    min="0"
    placeholder="0"
  />
  <p className="text-xs text-gray-500 mt-1">
    Lower numbers appear first. Use this to control display order.
  </p>
</div>

// Add to insert/update
order_index: orderIndex
```

### Option 2: Drag & Drop (Advanced Implementation)

Use `@dnd-kit/core` for drag-and-drop reordering:

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Benefits:**
- Intuitive visual reordering
- Professional UX
- Live preview of order changes

**Implementation:**

1. Create `components/DraggableList.tsx`
2. Wrap list items in `<SortableItem>`
3. Update `order_index` on drag end
4. Batch update database

---

## Files to Modify

### 1. Content Management

**Files:**
- `app/admin/content/new/page.tsx`
- `app/admin/content/edit/[id]/page.tsx`
- `app/admin/content/page.tsx` (list view)

**Changes:**
- Add order_index input field
- Display current order in list view
- Allow bulk reordering

### 2. Category Management

**File:** `app/admin/categories/page.tsx`

**Current:** Already has order_index support
**Enhancement:** Add drag-and-drop reordering

### 3. Resume Management

**File:** `app/admin/resume/page.tsx`

**Current:** Has order_index in resume_entry_types
**Enhancement:** Add order_index to resume_entries for custom sorting (currently sorted by date)

---

## Current Implementation

### Barrel Sidebar

**File:** `components/BarrelSidebar.tsx`

Already uses `order_index` for sorting:

```typescript
// Categories
.order('order_index')

// Subcategories  
.order('order_index')

// Content
.order('order_index')  // NEWLY ADDED
```

### Resume Timeline

**File:** `components/tabs/ResumeTab.tsx`

Currently sorts by date, but could respect order_index:

```typescript
// Current
.order('date_start', { ascending: false })

// With order_index priority
.order('order_index')
.order('date_start', { ascending: false })  // Secondary sort
```

---

## Recommended Approach

### Phase 1: Add Number Inputs (Immediate)

1. **Content Admin Forms:**
   - Add "Display Order" number input
   - Save to `order_index` column
   - Default to 0 for new items

2. **Content List View:**
   - Show current order_index
   - Allow inline editing
   - Add "Reorder" button for batch updates

### Phase 2: Add Drag & Drop (Later)

1. Install `@dnd-kit/core`
2. Create reorderable lists for:
   - Categories
   - Subcategories
   - Content items
   - Resume entries
   - Custom PDFs

3. Update `order_index` on drag end

---

## Priority Numbers System

### How It Works

- **Lower number = appears first**
- **Example:**
  - Item with order_index 0 appears before order_index 1
  - Item with order_index 5 appears before order_index 10

### Best Practices

- Use increments of 10 (0, 10, 20, 30...)
- Leaves room to insert items between (15 goes between 10 and 20)
- Easier to reorganize without renumbering everything

### UI Enhancement

Add up/down arrows for quick +/- 10 adjustments:

```tsx
<div className="flex items-center gap-2">
  <Input type="number" value={orderIndex} onChange={...} />
  <button onClick={() => setOrderIndex(orderIndex - 10)}>↑</button>
  <button onClick={() => setOrderIndex(orderIndex + 10)}>↓</button>
</div>
```

---

## Testing

After implementing:

1. **Create items with different order_index values**
2. **Check barrel sidebar** - items should appear in order_index order
3. **Change order_index** - sidebar should update
4. **Test wrap-around** - items should wrap correctly at edges

---

## Quick Implementation Guide

### For Content Items

1. Run `add-order-index-to-content.sql` in Supabase
2. Add order_index field to `app/admin/content/new/page.tsx`
3. Add order_index field to `app/admin/content/edit/[id]/page.tsx`
4. Test by creating content with different order values

### For Resume Entries

Already has order_index - just needs UI in admin panel if not present.

---

## Current Status

✅ **BarrelSidebar**: Updated to sort by order_index
✅ **Database**: order_index exists on most tables
⚠️ **Content table**: Needs order_index column (run SQL script)
⚠️ **Admin forms**: Need order_index input fields
⚠️ **Drag & drop**: Not implemented (use number inputs for now)

---

## Next Steps

1. Run `add-order-index-to-content.sql`
2. Add order_index inputs to content admin forms
3. Test ordering in barrel sidebar
4. (Optional) Implement drag-and-drop later


