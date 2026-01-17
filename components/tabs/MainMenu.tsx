'use client'

import { useMemo, useState, useEffect } from 'react'

// ===== TYPE DEFINITIONS =====

type PageState = 'expanded-empty' | 'expanded-reader' | 'collapsed-reader'

interface Category {
  id: string
  name: string
  order_index: number
}

interface Subcategory {
  id: string
  category_id: string
  name: string
  order_index: number
}

interface ContentItem {
  id: string
  type: string
  category_id: string
  subcategory_id: string | null
  title: string
  subtitle: string | null
  sidebar_title: string | null
  sidebar_subtitle: string | null
  featured: boolean
  byline_style: string | null
  link_style: string | null
  // Additional fields for full content rendering (added in later phases)
  content_body?: any
  image_url?: string
  video_url?: string
  audio_url?: string
  author_name?: string
  publication_name?: string
  publication_date?: string
  source_link?: string
  original_source_url?: string
  order_index?: number
  created_at?: string
  // Transformation fields (added in Step 2.3 Stage 2)
  publication_year?: number | null
  byline_style_text?: string
  link_style_text?: string
  category_name?: string
  subcategory_name?: string
  collection_slugs?: string[]
  collection_names?: string[]
}

// ===== PROPS INTERFACE =====

interface MainMenuProps {
  categories: Category[]
  subcategories: Subcategory[]
  content: ContentItem[]
  pageState: PageState // For future collapsed state (Step 3.6)
  selectedCategory: Category | null // For filtering (Step 3.2)
  selectedSubcategory: Subcategory | null // For filtering (Step 3.2)
  selectedContent: ContentItem | null // For color coding (Step 3.3)
  onCategorySelect: (category: Category) => void // Selection callback (Step 3.3)
  onSubcategorySelect: (subcategory: Subcategory) => void // Selection callback (Step 3.3)
  onContentSelect: (content: ContentItem) => void // Selection callback (Step 3.3)
  onMenuClick: () => void // Collapsed state expansion (Step 3.3)
}

// ===== COMPONENT =====

export default function MainMenu({ categories, subcategories, content, pageState, selectedCategory, selectedSubcategory, selectedContent, onCategorySelect, onSubcategorySelect, onContentSelect, onMenuClick }: MainMenuProps) {
  // Sort categories by order_index ascending (memoized to prevent infinite loops in useEffect)
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.order_index - b.order_index)
  }, [categories])
  
  // Filter subcategories by selected category (never show unfiltered per logic doc line 171)
  const displayedSubcategories = useMemo(() => {
    if (!selectedCategory) return []
    const filtered = subcategories.filter(s => s.category_id === selectedCategory.id)
    return filtered.sort((a, b) => a.order_index - b.order_index)
  }, [subcategories, selectedCategory])
  
  // Filter content by selected subcategory (never show unfiltered per logic doc line 172)
  const displayedContent = useMemo(() => {
    if (!selectedSubcategory) return []
    const filtered = content.filter(c => c.subcategory_id === selectedSubcategory.id)
    return filtered.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  }, [content, selectedSubcategory])

  // Step 7.1 Stage 1: Visual reordering state management
  // Order arrays track visual display order (independent of database order_index)
  const [categoriesOrder, setCategoriesOrder] = useState<string[]>([])
  const [subcategoriesOrder, setSubcategoriesOrder] = useState<string[]>([])
  const [contentOrder, setContentOrder] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState<boolean>(false)

  // Initialize and sync order arrays with sorted data
  // Only update if order actually changed (prevent infinite loops)
  useEffect(() => {
    // Initialize categoriesOrder from sortedCategories
    const newCategoriesOrder = sortedCategories.map(c => c.id)
    // Only update if order actually changed (compare arrays)
    setCategoriesOrder(prev => {
      if (prev.length !== newCategoriesOrder.length || 
          prev.some((id, index) => id !== newCategoriesOrder[index])) {
        return newCategoriesOrder
      }
      return prev
    })
  }, [sortedCategories])

  useEffect(() => {
    // Initialize subcategoriesOrder from displayedSubcategories
    const newSubcategoriesOrder = displayedSubcategories.map(s => s.id)
    // Only update if order actually changed (prevent infinite loops)
    setSubcategoriesOrder(prev => {
      if (prev.length !== newSubcategoriesOrder.length || 
          prev.some((id, index) => id !== newSubcategoriesOrder[index])) {
        return newSubcategoriesOrder
      }
      return prev
    })
  }, [displayedSubcategories])

  useEffect(() => {
    // Initialize contentOrder from displayedContent
    const newContentOrder = displayedContent.map(c => c.id)
    // Only update if order actually changed (prevent infinite loops)
    setContentOrder(prev => {
      if (prev.length !== newContentOrder.length || 
          prev.some((id, index) => id !== newContentOrder[index])) {
        return newContentOrder
      }
      return prev
    })
  }, [displayedContent])

  // Step 7.1 Stage 2: reorderColumn function - moves selected entry to top of column
  // Algorithm: Find selected entry, split array at its index, reorder as [selected, ...after, ...before]
  const reorderColumn = (
    columnType: 'category' | 'subcategory' | 'content',
    selectedId: string
  ) => {
    // Get current order array based on column type
    let currentOrder: string[] = []
    let setOrder: (updater: (prev: string[]) => string[]) => void = () => {}
    
    switch (columnType) {
      case 'category':
        currentOrder = categoriesOrder
        setOrder = setCategoriesOrder
        break
      case 'subcategory':
        currentOrder = subcategoriesOrder
        setOrder = setSubcategoriesOrder
        break
      case 'content':
        currentOrder = contentOrder
        setOrder = setContentOrder
        break
    }

    // Edge case: Empty array
    if (currentOrder.length === 0) {
      return
    }

    // Edge case: Selected not found in array
    const selectedIndex = currentOrder.indexOf(selectedId)
    if (selectedIndex === -1) {
      return
    }

    // Edge case: Selected already at top (position 0)
    if (selectedIndex === 0) {
      return
    }

    // Reorder: [selected, ...entries after selected, ...entries before selected]
    const entriesBefore = currentOrder.slice(0, selectedIndex)
    const entriesAfter = currentOrder.slice(selectedIndex + 1)
    const newOrder = [selectedId, ...entriesAfter, ...entriesBefore]

    // Update order array
    setOrder(newOrder)
  }

  // Helper function for selection color coding (Step 3.3 Stage 3)
  // Returns 'green' for selected items (direct or hierarchy), 'gray' otherwise
  // Collapsed state exception: only content green in collapsed-reader state
  const getSelectionColor = (
    itemId: string,
    itemType: 'category' | 'subcategory' | 'content'
  ): 'green' | 'gray' => {
    // Collapsed state exception (logic doc lines 94-106, tech-ref lines 3848-3852)
    // In collapsed-reader state, only content can be green
    if (pageState === 'collapsed-reader') {
      if (itemType === 'content' && selectedContent?.id === itemId) return 'green'
      return 'gray' // Categories and subcategories always gray in collapsed state
    }

    // Direct selection check (tech-ref lines 3819-3821)
    if (itemType === 'category' && selectedCategory?.id === itemId) return 'green'
    if (itemType === 'subcategory' && selectedSubcategory?.id === itemId) return 'green'
    if (itemType === 'content' && selectedContent?.id === itemId) return 'green'

    // Hierarchy selection for categories (tech-ref lines 3824-3830)
    // Category green if its subcategory is selected
    if (itemType === 'category') {
      if (selectedSubcategory) {
        const subcat = subcategories.find(s => s.id === selectedSubcategory.id)
        if (subcat?.category_id === itemId) return 'green'
      }
      // Also check if selectedContent's subcategory belongs to this category
      if (selectedContent) {
        const subcat = subcategories.find(s => s.id === selectedContent.subcategory_id)
        if (subcat?.category_id === itemId) return 'green'
      }
    }

    // Hierarchy selection for subcategories (tech-ref lines 3832-3837)
    // Subcategory green if its content is selected
    if (itemType === 'subcategory') {
      if (selectedContent && selectedContent.subcategory_id === itemId) return 'green'
    }

    // Default: gray if no match
    return 'gray'
  }

  // Helper function for item click handling with re-selection behavior (Step 3.3 Stage 4)
  // Calls appropriate selection callback based on itemType
  // Step 7.1 Stage 3: Triggers visual reordering when items are selected
  const handleItemClick = (
    item: Category | Subcategory | ContentItem,
    itemType: 'category' | 'subcategory' | 'content'
  ) => {
    // Step 7.1 Stage 3: Trigger visual reordering before calling selection callback
    // Animation handling: Check isAnimating flag to prevent race conditions
    if (!isAnimating) {
      setIsAnimating(true)
      reorderColumn(itemType, item.id)
      // Reset animation flag after a short delay (animation handling)
      // Note: Actual animations will be added in Step 7.2, for now just prevent rapid clicks
      setTimeout(() => setIsAnimating(false), 100)
    }
    
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

  // Derive if expanded (Step 3.6 Stage 1)
  const isExpanded = pageState !== 'collapsed-reader'

  // Collapsed state rendering (Step 3.6 Stage 2)
  if (!isExpanded && pageState === 'collapsed-reader') {
    // Collapsed state: show only selected items in breadcrumb format (horizontal with separators)
    // Category gray, subcategory gray, content green (no subtitle) per logic doc line 40
    // Horizontal layout per mockup.html lines 455-458
    return (
      <div onClick={onMenuClick} className="cursor-pointer flex flex-row items-center gap-4 pt-[15px]">
        {selectedCategory && (
          <>
            <div className="text-gray-500">{selectedCategory.name}</div>
            {(selectedSubcategory || selectedContent) && <span className="text-gray-500"> | </span>}
          </>
        )}
        {selectedSubcategory && (
          <>
            <div className="text-gray-500">{selectedSubcategory.name}</div>
            {selectedContent && <span className="text-gray-500"> | </span>}
          </>
        )}
        {selectedContent && (
          <div className="text-[#00ff88]">{selectedContent.sidebar_title || selectedContent.title}</div>
        )}
      </div>
    )
  }

  // Expanded state: show all columns (Step 3.1-3.5)
  return (
    <div className="flex gap-[3rem] items-start pt-[15px]">
      {/* Column 1: Categories */}
      {/* Width constraint: max 25 characters per Logic Doc line 200
          Using '25ch' unit (character-relative, ~400px for 16px font, adjusts with font size)
          Overflow hidden cuts off text beyond 25 characters per Logic Doc line 203 */}
      <div className="flex flex-col gap-3" style={{ maxWidth: '25ch', overflow: 'hidden' }}>
        {categories.length === 0 ? (
          <div className="text-gray-400">No categories</div>
        ) : (
          // Step 7.1 Stage 3: Use categoriesOrder instead of sortedCategories for visual reordering
          categoriesOrder.map(categoryId => {
            const cat = sortedCategories.find(c => c.id === categoryId)
            if (!cat) return null
            const color = getSelectionColor(cat.id, 'category')
            return (
              <div 
                key={cat.id}
                onClick={() => handleItemClick(cat, 'category')}
                className={`${color === 'green' ? 'text-[#00ff88]' : 'text-[#6b7280]'} hover:text-[#e5e7eb] cursor-pointer`}
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {cat.name}
              </div>
            )
          })
        )}
      </div>
      
      {/* Column 2: Subcategories (filtered by selected category) */}
      {/* Width constraint: max 25 characters per Logic Doc line 201
          Using '25ch' unit (character-relative, ~400px for 16px font, adjusts with font size)
          Overflow hidden cuts off text beyond 25 characters per Logic Doc line 203 */}
      <div className="flex flex-col gap-3" style={{ maxWidth: '25ch', overflow: 'hidden' }}>
        {displayedSubcategories.length === 0 ? (
          <div className="text-gray-400">No subcategories</div>
        ) : (
          // Step 7.1 Stage 3: Use subcategoriesOrder instead of displayedSubcategories for visual reordering
          subcategoriesOrder.map(subcategoryId => {
            const sub = displayedSubcategories.find(s => s.id === subcategoryId)
            if (!sub) return null
            const color = getSelectionColor(sub.id, 'subcategory')
            return (
              <div 
                key={sub.id}
                onClick={() => handleItemClick(sub, 'subcategory')}
                className={`${color === 'green' ? 'text-[#00ff88]' : 'text-[#6b7280]'} hover:text-[#e5e7eb] cursor-pointer`}
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {sub.name}
              </div>
            )
          })
        )}
      </div>
      
      {/* Column 3: Content Items (filtered by selected subcategory) */}
      <div className="flex flex-col gap-3">
        {displayedContent.length === 0 ? (
          <div className="text-gray-400">No content</div>
        ) : (
          // Step 7.1 Stage 3: Use contentOrder instead of displayedContent for visual reordering
          contentOrder.map(contentId => {
            const item = displayedContent.find(c => c.id === contentId)
            if (!item) return null
            const color = getSelectionColor(item.id, 'content')
            return (
              <div 
                key={item.id}
                onClick={() => handleItemClick(item, 'content')}
                className={`${color === 'green' ? 'text-[#00ff88]' : 'text-[#6b7280]'} hover:text-[#e5e7eb] cursor-pointer`}
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
            )
          })
        )}
      </div>
    </div>
  )
}

