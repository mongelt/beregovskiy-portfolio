'use client'

import { useMemo, useState, useEffect } from 'react'
import { useMobileState } from '@/lib/responsive'
import { ChevronLeft } from 'lucide-react'
import { BOTTOM_NAV_HEIGHT_PX } from '@/lib/constants'


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
  subcategory_id: string
  title: string
  subtitle: string | null
  sidebar_title: string | null
  sidebar_subtitle: string | null
  featured: boolean
  byline_style: string | null
  link_style: string | null
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
  publication_year?: number | null
  byline_style_text?: string | null
  link_style_text?: string | null
  category_name?: string
  subcategory_name?: string
  collection_slugs?: string[]
  collection_names?: string[]
  desc?: string | null
}


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
  onMenuBack?: () => void // Back navigation callback (Step 4.3)
  profileHeight?: number // Profile height for mobile positioning
  justWentBackFromContent?: boolean // Flag to track if we just went back from content
  justWentBackFromContentRef?: React.MutableRefObject<boolean> // Ref for immediate synchronous access
}


export default function MainMenu({ categories, subcategories, content, pageState, selectedCategory, selectedSubcategory, selectedContent, onCategorySelect, onSubcategorySelect, onContentSelect, onMenuClick, onMenuBack, profileHeight = 0, justWentBackFromContent = false, justWentBackFromContentRef }: MainMenuProps) {
  const { isMobile } = useMobileState()
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.order_index - b.order_index)
  }, [categories])
  
  const displayedSubcategories = useMemo(() => {
    if (!selectedCategory) return []
    const filtered = subcategories.filter(s => s.category_id === selectedCategory.id)
    return filtered.sort((a, b) => a.order_index - b.order_index)
  }, [subcategories, selectedCategory])
  
  const displayedContent = useMemo(() => {
    if (!selectedSubcategory) return []
    const filtered = content.filter(c => c.subcategory_id === selectedSubcategory.id)
    return filtered.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  }, [content, selectedSubcategory])

  const [categoriesOrder, setCategoriesOrder] = useState<string[]>([])
  const [subcategoriesOrder, setSubcategoriesOrder] = useState<string[]>([])
  const [contentOrder, setContentOrder] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState<boolean>(false)

  useEffect(() => {
    const newCategoriesOrder = sortedCategories.map(c => c.id)
    setCategoriesOrder(prev => {
      if (prev.length !== newCategoriesOrder.length || 
          prev.some((id, index) => id !== newCategoriesOrder[index])) {
        return newCategoriesOrder
      }
      return prev
    })
  }, [sortedCategories])

  useEffect(() => {
    const newSubcategoriesOrder = displayedSubcategories.map(s => s.id)
    setSubcategoriesOrder(prev => {
      if (prev.length !== newSubcategoriesOrder.length || 
          prev.some((id, index) => id !== newSubcategoriesOrder[index])) {
        return newSubcategoriesOrder
      }
      return prev
    })
  }, [displayedSubcategories])

  useEffect(() => {
    const newContentOrder = displayedContent.map(c => c.id)
    setContentOrder(prev => {
      if (prev.length !== newContentOrder.length || 
          prev.some((id, index) => id !== newContentOrder[index])) {
        return newContentOrder
      }
      return prev
    })
  }, [displayedContent])

  const reorderColumn = (
    columnType: 'category' | 'subcategory' | 'content',
    selectedId: string
  ) => {
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

    if (currentOrder.length === 0) {
      return
    }

    const selectedIndex = currentOrder.indexOf(selectedId)
    if (selectedIndex === -1) {
      return
    }

    if (selectedIndex === 0) {
      return
    }

    const entriesBefore = currentOrder.slice(0, selectedIndex)
    const entriesAfter = currentOrder.slice(selectedIndex + 1)
    const newOrder = [selectedId, ...entriesAfter, ...entriesBefore]

    setOrder(() => newOrder)
  }

  const getSelectionColor = (
    itemId: string,
    itemType: 'category' | 'subcategory' | 'content'
  ): 'green' | 'gray' => {
    if (pageState === 'collapsed-reader') {
      if (itemType === 'content' && selectedContent?.id === itemId) return 'green'
      return 'gray' // Categories and subcategories always gray in collapsed state
    }

    if (itemType === 'category' && selectedCategory?.id === itemId) return 'green'
    if (itemType === 'subcategory' && selectedSubcategory?.id === itemId) return 'green'
    if (itemType === 'content' && selectedContent?.id === itemId) return 'green'

    if (itemType === 'category') {
      if (selectedSubcategory) {
        const subcat = subcategories.find(s => s.id === selectedSubcategory.id)
        if (subcat?.category_id === itemId) return 'green'
      }
      if (selectedContent) {
        const subcat = subcategories.find(s => s.id === selectedContent.subcategory_id)
        if (subcat?.category_id === itemId) return 'green'
      }
    }

    if (itemType === 'subcategory') {
      if (selectedContent && selectedContent.subcategory_id === itemId) return 'green'
    }

    return 'gray'
  }

  const handleItemClick = (
    item: Category | Subcategory | ContentItem,
    itemType: 'category' | 'subcategory' | 'content'
  ) => {
    // Reorder column only in desktop (not mobile) - this moves selected item to top
    if (!isMobile && !isAnimating) {
      setIsAnimating(true)
      reorderColumn(itemType, item.id)
      setTimeout(() => setIsAnimating(false), 100)
    }
    
    // Always call the selection handlers (don't block on animation in mobile)
    if (itemType === 'category') {
      onCategorySelect(item as Category)
    } else if (itemType === 'subcategory') {
      onSubcategorySelect(item as Subcategory)
    } else if (itemType === 'content') {
      onContentSelect(item as ContentItem)
    }
  }

  const isExpanded = pageState !== 'collapsed-reader'

  // Mobile collapsed mode: show only active content item sidebar title
  if (!isExpanded && pageState === 'collapsed-reader' && isMobile) {
    // CRITICAL: Menu cannot be collapsed without content selected
    if (!selectedContent) {
      return null
    }
    
    return (
      <div
        onClick={onMenuClick}
        className="cursor-pointer border-b border-border-gray-800 flex items-center justify-center w-full"
        style={{ minHeight: '50px' }}
      >
        <div className="text-accent-dark text-base font-medium text-center w-full">
          {selectedContent.sidebar_title || selectedContent.title}
        </div>
      </div>
    )
  }

  // Desktop collapsed mode: show breadcrumb
  if (!isExpanded && pageState === 'collapsed-reader' && !isMobile) {
    return (
      <div onClick={onMenuClick} className="main-menu-breadcrumb cursor-pointer flex flex-row items-center gap-2 py-[10px]">
        {selectedCategory && (
          <>
            <div className="text-text-on-dark-inactive">{selectedCategory.name}</div>
            {(selectedSubcategory || selectedContent) && <span className="main-menu-breadcrumb-separator text-text-on-dark-inactive"> | </span>}
          </>
        )}
        {selectedSubcategory && (
          <>
            <div className="text-text-on-dark-inactive">{selectedSubcategory.name}</div>
            {selectedContent && <span className="main-menu-breadcrumb-separator text-text-on-dark-inactive"> | </span>}
          </>
        )}
        {selectedContent && (
          <div className="main-menu-breadcrumb-active text-accent-dark">{selectedContent.sidebar_title || selectedContent.title}</div>
        )}
      </div>
    )
  }

  // Mobile expanded mode: single-column vertical list
  if (isExpanded && isMobile) {
    
    // Determine which level to show
    // Priority: content items (if selected) → subcategories (if navigating) → categories (default)
    // Show content items when: a content item was previously selected
    // Show subcategories when: category selected but no content item (during navigation)
    // Show categories when: nothing selected (default)
    // Show content items when: subcategory selected (navigating) OR content item selected (highlighting)
    // BUT NOT when we just went back from content - in that case show subcategories
    const hasContent = selectedContent !== null
    const hasSubcategory = selectedSubcategory !== null
    const hasCategory = selectedCategory !== null
    
    // Check both state and ref - ref for immediate access, state for re-renders
    const justWentBack = justWentBackFromContentRef?.current ?? justWentBackFromContent
    
    // Detect "going back from content" state:
    // When going back from content, we have: category set, subcategory set, content null, flag set
    // This is different from "clicking subcategory" which also has category and subcategory set
    // The key difference: when going back, the flag is set
    const isGoingBackFromContent = justWentBack && hasCategory && hasSubcategory && !hasContent
    
    // When going back from content: show subcategories (level 2)
    // When navigating forward: show content items if subcategory is selected
    const showContent = (hasSubcategory || hasContent) && !isGoingBackFromContent
    // Show subcategories when:
    // 1. Category is selected but no subcategory yet (just clicked category) - forward navigation
    // 2. We just went back from content (flag is set, both category and subcategory set, but no content)
    const showSubcategories = hasCategory && (!hasSubcategory || isGoingBackFromContent)
    // Show categories when: nothing else is showing
    const showCategories = !showContent && !showSubcategories
    
    // Show Back button on level 2 (subcategories) or level 3 (content items)
    const showBackButton = showSubcategories || showContent

    return (
      <div 
        className="fixed left-0 right-0 bg-bg-menu-bar overflow-y-auto px-[15px] py-4"
        style={{
          top: profileHeight ? `${profileHeight}px` : '0',
          bottom: `${BOTTOM_NAV_HEIGHT_PX}px`,
          zIndex: 20
        }}
      >
        {/* Back Button - shown on level 2 and 3 */}
        {showBackButton && onMenuBack && (
          <div 
            onClick={onMenuBack}
            className="flex items-center gap-2 text-accent-dark text-base font-semibold py-1 mb-4 border-b border-border-gray-800 cursor-pointer transition-colors hover:text-accent-emerald-300"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </div>
        )}

        {/* Categories Level - shown by default, or when no content item is selected */}
        {showCategories && (
          <div className="flex flex-col gap-3 w-full">
            {categories.length === 0 ? (
              <div className="text-text-on-dark-inactive">No categories</div>
            ) : (
              categoriesOrder.map(categoryId => {
                const cat = sortedCategories.find(c => c.id === categoryId)
                if (!cat) return null
                const color = getSelectionColor(cat.id, 'category')
                const isSelected = color === 'green'
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleItemClick(cat, 'category')}
                    className={`main-menu-item ${isSelected ? 'selected text-accent-dark' : 'text-text-on-dark-inactive'} hover:text-text-on-dark cursor-pointer py-2 border-b border-border-gray-800 text-base`}
                  >
                    {cat.name}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Subcategories Level - shown when category is selected but no content item */}
        {showSubcategories && (
          <div className="flex flex-col gap-3 w-full">
            {displayedSubcategories.length === 0 ? (
              <div className="text-text-on-dark-inactive">No subcategories</div>
            ) : (
              subcategoriesOrder.map(subcategoryId => {
                const sub = displayedSubcategories.find(s => s.id === subcategoryId)
                if (!sub) return null
                const color = getSelectionColor(sub.id, 'subcategory')
                const isSelected = color === 'green'
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleItemClick(sub, 'subcategory')}
                    className={`main-menu-item ${isSelected ? 'selected text-accent-dark' : 'text-text-on-dark-inactive'} hover:text-text-on-dark cursor-pointer py-2 border-b border-border-gray-800 text-base`}
                  >
                    {sub.name}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Content Items Level - only shown when a content item was previously selected */}
        {showContent && (
          <div className="flex flex-col gap-3 w-full">
            {displayedContent.length === 0 ? (
              <div className="text-text-on-dark-inactive">No content</div>
            ) : (
              contentOrder.map(contentId => {
                const item = displayedContent.find(c => c.id === contentId)
                if (!item) return null
                const color = getSelectionColor(item.id, 'content')
                const isSelected = color === 'green'
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item, 'content')}
                    data-content-item="true"
                    className={`main-menu-item ${isSelected ? 'selected text-accent-dark' : 'text-text-on-dark-inactive'} hover:text-text-on-dark cursor-pointer py-2 border-b border-border-gray-800 text-base`}
                  >
                    <div>{item.sidebar_title || item.title}</div>
                    {(item.sidebar_subtitle || item.publication_year) && (
                      <div className="main-menu-content-subtitle text-text-on-dark-inactive text-sm mt-1">
                        {item.sidebar_subtitle && item.publication_year
                          ? `${item.sidebar_subtitle} / ${item.publication_year}`
                          : item.publication_year || ''
                        }
                      </div>
                    )}
                    {item.desc && (
                      <div className="text-text-on-dark-inactive text-base mt-1">{item.desc}</div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    )
  }

  // Desktop expanded mode: multi-column layout
  return (
    <div className="main-menu flex gap-[3rem] items-start pt-[15px] relative">
      <div className="main-menu-column flex flex-col gap-3" style={{ maxWidth: '25ch', overflow: 'hidden' }}>
        {categories.length === 0 ? (
          <div className="text-text-on-dark-inactive">No categories</div>
        ) : (
          categoriesOrder.map(categoryId => {
            const cat = sortedCategories.find(c => c.id === categoryId)
            if (!cat) return null
            const color = getSelectionColor(cat.id, 'category')
            const isSelected = color === 'green'
            return (
              <div 
                key={cat.id}
                onClick={() => handleItemClick(cat, 'category')}
                className={`main-menu-item ${isSelected ? 'selected text-accent-dark' : 'text-text-on-dark'} hover:text-text-white hover:bg-[rgba(191,106,77,0.08)] cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap`}
              >
                {cat.name}
              </div>
            )
          })
        )}
      </div>
      
      <div className="main-menu-column flex flex-col gap-3" style={{ maxWidth: '25ch', overflow: 'hidden' }}>
        {displayedSubcategories.length === 0 ? (
          <div className="text-text-on-dark-inactive">No subcategories</div>
        ) : (
          subcategoriesOrder.map(subcategoryId => {
            const sub = displayedSubcategories.find(s => s.id === subcategoryId)
            if (!sub) return null
            const color = getSelectionColor(sub.id, 'subcategory')
            const isSelected = color === 'green'
            return (
              <div 
                key={sub.id}
                onClick={() => handleItemClick(sub, 'subcategory')}
                className={`main-menu-item ${isSelected ? 'selected text-accent-dark' : 'text-text-on-dark'} hover:text-text-white hover:bg-[rgba(191,106,77,0.08)] cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap`}
              >
                {sub.name}
              </div>
            )
          })
        )}
      </div>
      
      <div className="main-menu-column-wide flex flex-col gap-3">
        {displayedContent.length === 0 ? (
          <div className="text-text-on-dark-inactive">No content</div>
        ) : (
          contentOrder.map(contentId => {
            const item = displayedContent.find(c => c.id === contentId)
            if (!item) return null
            const color = getSelectionColor(item.id, 'content')
            const isSelected = color === 'green'
            return (
              <div 
                key={item.id}
                onClick={() => handleItemClick(item, 'content')}
                data-content-item="true"
                className={`main-menu-item ${isSelected ? 'selected text-accent-dark' : 'text-text-on-dark'} hover:text-text-white hover:bg-[rgba(191,106,77,0.08)] cursor-pointer`}
              >
                <div className="inline-block whitespace-nowrap">{item.sidebar_title || item.title}</div>
                {(item.sidebar_subtitle || item.publication_year) && (
                  <div className="main-menu-content-subtitle text-text-on-dark-inactive text-sm">
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

