'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations'

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
}

type CategorySidebarProps = {
  collectionSlug?: string
  onContentSelect?: (contentId: string) => void
  onOpenCollection?: (slug: string, name: string) => void
}

export default function CategorySidebar({ collectionSlug, onContentSelect, onOpenCollection }: CategorySidebarProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedContent, setSelectedContent] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory)
    } else {
      setSubcategories([])
      setContent([])
    }
  }, [selectedCategory])

  useEffect(() => {
    if (selectedSubcategory) {
      loadContent(selectedSubcategory)
    } else {
      setContent([])
    }
  }, [selectedSubcategory])

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
    setSelectedSubcategory(null)
  }

  async function loadContent(subcategoryId: string) {
    if (collectionSlug) {
      // If we're on a collection page, only show content in this collection
      const { data: collectionData } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', collectionSlug)
        .single()
      
      if (!collectionData) {
        setContent([])
        return
      }

      const { data } = await supabase
        .from('content_collections')
        .select(`
          content(id, title, sidebar_title, subcategory_id)
        `)
        .eq('collection_id', collectionData.id)
      
      // Filter by subcategory
      const filteredContent = (data || [])
        .map((item: any) => item.content)
        .filter((c: any) => c && c.subcategory_id === subcategoryId)
      
      setContent(filteredContent)
    } else {
      // Normal behavior - show all content in subcategory
      const { data } = await supabase
        .from('content')
        .select('id, title, sidebar_title')
        .eq('subcategory_id', subcategoryId)
        .order('created_at', { ascending: false })
      
      setContent(data || [])
    }
  }

  function handleCategoryClick(categoryId: string) {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null)
      setSelectedSubcategory(null)
    } else {
      setSelectedCategory(categoryId)
    }
  }

  function handleSubcategoryClick(subcategoryId: string) {
    if (selectedSubcategory === subcategoryId) {
      setSelectedSubcategory(null)
    } else {
      setSelectedSubcategory(subcategoryId)
    }
  }

  function handleContentClick(contentId: string) {
    setSelectedContent(contentId)
    if (onContentSelect) {
      onContentSelect(contentId)
    }
  }

  return (
    <aside className="w-full bg-gray-900 border-r border-gray-800 h-full overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white">Browse Content</h2>
      </div>

      <div className="grid grid-cols-3 h-[calc(100%-4rem)]">
        {/* Column 1: Categories */}
        <div className="border-r border-gray-800 overflow-y-auto">
          <motion.div 
            className="p-2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                variants={staggerItem}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-emerald-400 text-gray-950 font-semibold'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
            {categories.length === 0 && (
              <p className="text-xs text-gray-600 p-3">No categories</p>
            )}
          </motion.div>
        </div>

        {/* Column 2: Subcategories */}
        <div className="border-r border-gray-800 overflow-y-auto">
          <motion.div 
            className="p-2"
            key={selectedCategory || 'no-category'}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {selectedCategory ? (
              subcategories.map((subcategory, index) => (
                <motion.button
                  key={subcategory.id}
                  variants={staggerItem}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubcategoryClick(subcategory.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedSubcategory === subcategory.id
                      ? 'bg-emerald-400 text-gray-950 font-semibold'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {subcategory.name}
                </motion.button>
              ))
            ) : (
              <p className="text-xs text-gray-600 p-3">Select a category</p>
            )}
          </motion.div>
        </div>

        {/* Column 3: Content Items */}
        <div className="overflow-y-auto">
          <motion.div 
            className="p-2"
            key={selectedSubcategory || 'no-subcategory'}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {selectedSubcategory ? (
              content.map((item, index) => (
                <motion.button
                  key={item.id}
                  variants={staggerItem}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContentClick(item.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedContent === item.id
                      ? 'bg-emerald-400 text-gray-950 font-semibold'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {item.sidebar_title || item.title}
                </motion.button>
              ))
            ) : (
              <p className="text-xs text-gray-600 p-3">Select a subcategory</p>
            )}
            {selectedSubcategory && content.length === 0 && (
              <p className="text-xs text-gray-600 p-3">No content in this subcategory</p>
            )}
          </motion.div>
        </div>
      </div>
    </aside>
  )
}

