'use client'

import { useMemo, useState, useEffect } from 'react'


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
}


export default function MainMenu({ categories, subcategories, content, pageState, selectedCategory, selectedSubcategory, selectedContent, onCategorySelect, onSubcategorySelect, onContentSelect, onMenuClick }: MainMenuProps) {
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
    if (!isAnimating) {
      setIsAnimating(true)
      reorderColumn(itemType, item.id)
      setTimeout(() => setIsAnimating(false), 100)
    }
    
    if (itemType === 'category') {
      onCategorySelect(item as Category)
    } else if (itemType === 'subcategory') {
      onSubcategorySelect(item as Subcategory)
    } else if (itemType === 'content') {
      onContentSelect(item as ContentItem)
    }
  }

  const isExpanded = pageState !== 'collapsed-reader'

  if (!isExpanded && pageState === 'collapsed-reader') {
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

  return (
    <div className="flex gap-[3rem] items-start pt-[15px]">
      <div className="flex flex-col gap-3" style={{ maxWidth: '25ch', overflow: 'hidden' }}>
        {categories.length === 0 ? (
          <div className="text-gray-400">No categories</div>
        ) : (
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
      
      <div className="flex flex-col gap-3" style={{ maxWidth: '25ch', overflow: 'hidden' }}>
        {displayedSubcategories.length === 0 ? (
          <div className="text-gray-400">No subcategories</div>
        ) : (
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
      
      <div className="flex flex-col gap-3">
        {displayedContent.length === 0 ? (
          <div className="text-gray-400">No content</div>
        ) : (
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

