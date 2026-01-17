'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

type Category = {
  id: string
  name: string
}

type Subcategory = {
  id: string
  category_id: string
  name: string
}

type ContentItem = {
  id: string
  title: string
  sidebar_title: string | null
  sidebar_subtitle?: string | null
  publication_year?: string | null
}

type BarrelSidebarProps = {
  collectionSlug?: string
  onContentSelect?: (contentId: string) => void
  onOpenCollection?: (slug: string, name: string) => void
}

export default function BarrelSidebar({ collectionSlug, onContentSelect, onOpenCollection }: BarrelSidebarProps = {}) {
  const supabase = createClient()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0)
  const [selectedSubcategoryIndex, setSelectedSubcategoryIndex] = useState<number>(0)
  const [selectedContentIndex, setSelectedContentIndex] = useState<number>(0)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (categories.length > 0 && selectedCategoryIndex < categories.length) {
      loadSubcategories(categories[selectedCategoryIndex].id)
    }
  }, [selectedCategoryIndex, categories])

  useEffect(() => {
    if (subcategories.length > 0 && selectedSubcategoryIndex < subcategories.length) {
      loadContent(subcategories[selectedSubcategoryIndex].id)
    }
  }, [selectedSubcategoryIndex, subcategories, collectionSlug])

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('order_index')
    setCategories(data || [])
  }

  async function loadSubcategories(categoryId: string) {
    const { data } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index')
    setSubcategories(data || [])
    setSelectedSubcategoryIndex(0) // Reset to first subcategory
  }

  async function loadContent(subcategoryId: string) {
    let query = supabase
      .from('content')
      .select('id, title, sidebar_title')
      .eq('subcategory_id', subcategoryId)
      .order('order_index')

    // Filter by collection if provided
    if (collectionSlug) {
      const { data: collectionData } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', collectionSlug)
        .single()

      if (collectionData) {
        const { data: contentIds } = await supabase
          .from('content_collections')
          .select('content_id')
          .eq('collection_id', collectionData.id)
        
        const ids = contentIds?.map(c => c.content_id) || []
        query = query.in('id', ids)
      }
    }

    const { data, error } = await query
    setContent(data || [])
    setSelectedContentIndex(0) // Reset to first content item
  }

  function handleCategoryClick(index: number) {
    setSelectedCategoryIndex(index)
  }

  function handleSubcategoryClick(index: number) {
    setSelectedSubcategoryIndex(index)
  }

  function handleContentClick(index: number) {
    setSelectedContentIndex(index)
    if (onContentSelect && content[index]) {
      onContentSelect(content[index].id)
    }
  }

  // Create dynamic rows based on item count, following symmetry rules
  const createRows = (items: any[], selectedIndex: number) => {
    const rows = []
    const totalItems = items.length
    
    if (totalItems === 0) {
      return []
    }
    
    // Calculate number of rows needed based on item count
    let numRows = 0
    if (totalItems === 1) {
      numRows = 1
    } else if (totalItems === 2) {
      numRows = 2
    } else if (totalItems <= 4) {
      numRows = totalItems
    } else {
      numRows = totalItems
    }
    
    // Create rows with selected item in center
    for (let i = 0; i < numRows; i++) {
      let actualIndex = selectedIndex + (i - Math.floor(numRows / 2))
      
      // Handle wrapping for items beyond array bounds
      if (actualIndex < 0) {
        actualIndex = totalItems + actualIndex
      } else if (actualIndex >= totalItems) {
        actualIndex = actualIndex - totalItems
      }
      
      // Ensure we don't go out of bounds
      if (actualIndex >= 0 && actualIndex < totalItems) {
        rows.push({
          item: items[actualIndex],
          actualIndex: actualIndex,
          displayIndex: i
        })
      } else {
        rows.push({
          item: null,
          actualIndex: -1,
          displayIndex: i
        })
      }
    }
    
    return rows
  }

  const categoryRows = createRows(categories, selectedCategoryIndex)
  const subcategoryRows = createRows(subcategories, selectedSubcategoryIndex)
  const contentRows = createRows(content, selectedContentIndex)


  const getOpacity = (displayIndex: number, totalRows: number, centerIndex: number) => {
    if (displayIndex === centerIndex) return 1.0  // Center - 100%
    
    const distance = Math.abs(displayIndex - centerIndex)
    if (distance === 1) return 0.7  // Adjacent - 70%
    
    // For 6+ items, use 25% opacity for far items
    if (totalRows >= 6) {
      return distance >= 2 ? 0.25 : 0.4
    }
    
    return 0.4  // Far - 40% for 4-5 items
  }

  const getTextColor = (displayIndex: number, centerIndex: number) => {
    if (displayIndex === centerIndex) return 'text-emerald-400'  // Center - Green
    if (Math.abs(displayIndex - centerIndex) === 1) return 'text-gray-400'  // Adjacent - Light gray
    return 'text-gray-500'  // Far - Darker gray
  }

  // Calculate center indices for each column
  const categoryCenterIndex = Math.floor(categoryRows.length / 2)
  const subcategoryCenterIndex = Math.floor(subcategoryRows.length / 2)
  const contentCenterIndex = Math.floor(contentRows.length / 2)

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
      {/* Category Column - 0%-25% of sidebar (25% width) - fits 15 chars */}
      <div className="absolute" style={{ left: '0%', width: '25%', height: '200px' }}>
        <div className="relative h-full flex items-center">
          <div className="absolute inset-0 flex flex-col justify-center w-full">
            {categoryRows.map((row, rowIndex) => (
              <motion.div
                key={row.item ? row.item.id : `empty-cat-${rowIndex}`}
                className="h-10 flex items-center w-full"
                initial={{ opacity: getOpacity(rowIndex, categoryRows.length, categoryCenterIndex) }}
                animate={{ 
                  opacity: getOpacity(rowIndex, categoryRows.length, categoryCenterIndex)
                }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                {row.item ? (
                  <button
                    onClick={() => handleCategoryClick(row.actualIndex)}
                    className={`
                      w-full text-left text-sm transition-all duration-300 px-2 py-1 rounded
                      ${getTextColor(rowIndex, categoryCenterIndex)}
                      ${rowIndex === categoryCenterIndex ? 'font-bold' : ''}
                      hover:bg-gray-800/50
                    `}
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    title={row.item.name}
                  >
                    {row.item.name}
                  </button>
                ) : (
                  <div className="h-10 w-full"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Subcategory Column - 30%-55% of sidebar (25% width) - fits 15 chars */}
      <div className="absolute" style={{ left: '30%', width: '25%', height: '200px' }}>
        <div className="relative h-full flex items-center">
          <div className="absolute inset-0 flex flex-col justify-center w-full">
            {subcategoryRows.map((row, rowIndex) => (
              <motion.div
                key={row.item ? row.item.id : `empty-sub-${rowIndex}`}
                className="h-10 flex items-center w-full"
                initial={{ opacity: getOpacity(rowIndex, subcategoryRows.length, subcategoryCenterIndex) }}
                animate={{ 
                  opacity: getOpacity(rowIndex, subcategoryRows.length, subcategoryCenterIndex)
                }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                {row.item ? (
                  <button
                    onClick={() => handleSubcategoryClick(row.actualIndex)}
                    className={`
                      w-full text-left text-sm transition-all duration-300 px-2 py-1 rounded
                      ${getTextColor(rowIndex, subcategoryCenterIndex)}
                      ${rowIndex === subcategoryCenterIndex ? 'font-bold' : ''}
                      hover:bg-gray-800/50
                    `}
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    title={row.item.name}
                  >
                    {row.item.name}
                  </button>
                ) : (
                  <div className="h-10 w-full"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Column - 60%-100% of sidebar (40% width) - fits 20 chars */}
      <div className="absolute" style={{ left: '60%', width: '40%', height: '200px' }}>
        <div className="relative h-full flex items-center">
          <div className="absolute inset-0 flex flex-col justify-center w-full">
            {contentRows.length > 0 ? contentRows.map((row, rowIndex) => (
              <motion.div
                key={row.item ? row.item.id : `empty-content-${rowIndex}`}
                className="h-10 flex items-center w-full"
                initial={{ opacity: getOpacity(rowIndex, contentRows.length, contentCenterIndex) }}
                animate={{ 
                  opacity: getOpacity(rowIndex, contentRows.length, contentCenterIndex)
                }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                {row.item ? (
                  <button
                    onClick={() => handleContentClick(row.actualIndex)}
                    className={`
                      w-full text-left text-sm transition-all duration-300 px-2 py-1 rounded
                      ${getTextColor(rowIndex, contentCenterIndex)}
                      ${rowIndex === contentCenterIndex ? 'font-bold' : ''}
                      hover:bg-gray-800/50
                    `}
                    title={row.item.sidebar_title || row.item.title}
                  >
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.item.sidebar_title || row.item.title}
                    </div>
                    {row.item.sidebar_subtitle && (
                      <div 
                        className="text-gray-500"
                        style={{ 
                          fontSize: '0.75em',
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          marginTop: '2px'
                        }}
                      >
                        {row.item.sidebar_subtitle}
                        {row.item.publication_year && ` / ${row.item.publication_year}`}
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="h-10 w-full"></div>
                )}
              </motion.div>
            )) : (
              // Show empty state if no content
              <div className="h-10 flex items-center w-full text-gray-500 text-sm">
                No content available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

