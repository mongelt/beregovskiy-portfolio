'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Profile from '@/components/Profile'
import BottomTabBar from '@/components/BottomTabBar'
import MainMenu from '@/components/tabs/MainMenu'
import ContentReader from '@/components/ContentReader'
import InfoMenu from '@/components/InfoMenu'
import CollectionsMenu from '@/components/tabs/CollectionsMenu'

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

interface Collection {
  id: string
  slug: string
  name: string
  description?: any
  order_index: number
  featured: boolean
}

// Raw content item from database with nested joins (before transformation)
interface ContentItemRaw {
  id: string
  title: string
  subtitle: string | null
  sidebar_title: string | null
  sidebar_subtitle: string | null
  type: string
  content_body: any
  image_sizes?: Record<string, { width?: number; height?: number }>
  image_url: string | null
  video_url: string | null
  audio_url: string | null
  publication_name: string | null
  publication_date: string | null
  author_name: string | null
  source_link: string | null
  featured: boolean
  order_index: number
  subcategory_id: string | null
  byline_style: string | null
  link_style: string | null
  // Nested join fields (Supabase returns as arrays even for one-to-one relationships)
  categories?: { id: string; name: string }[] | null
  subcategories?: { id: string; name: string; category_id: string }[] | null
  // Note: byline_options and link_options can be returned as single objects or arrays depending on Supabase version
  byline_options?: { id: string; option_text: string } | { id: string; option_text: string }[] | null
  link_options?: { id: string; option_text: string } | { id: string; option_text: string }[] | null
  content_collections?: { collection_id: string; collections: { slug: string; name: string }[] }[] | null
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
  image_sizes?: Record<string, { width?: number; height?: number }>
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

interface CollectionTab {
  slug: string
  name: string
}

// ===== COMPONENT =====

export default function PortfolioTab() {
  // ===== PAGE STATE MANAGEMENT =====
  // Initial state is 'expanded-empty' per Stage 2: Remove content selection on load
  // Page loads without content selected, menu bar starts in expanded state
  const [pageState, setPageState] = useState<PageState>('expanded-empty')

  // ===== SELECTION STATES =====
  // Track currently selected category, subcategory, and content item
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)

  // ===== COLLECTIONS MANAGEMENT =====
  // Renamed from 'openCollections' to 'activeCollections' per page.tsx pattern
  // Tracks collection tabs opened in BottomTabBar
  const [activeCollections, setActiveCollections] = useState<CollectionTab[]>([])
  // Tracks which tab is currently active ('portfolio' | 'resume' | 'downloads' | collection.slug)
  const [activeTab, setActiveTab] = useState<string>('portfolio')

  // ===== LAYOUT MEASUREMENT =====
  // Track the actual rendered height of the sticky Profile header so the Main menu
  // can stick exactly to its bottom edge on all window sizes (Option B plan).
  const [profileHeight, setProfileHeight] = useState<number>(0)

  // ===== DATA ARRAYS =====
  // Store data loaded from Supabase (will be populated in Step 2.2-2.4)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [collections, setCollections] = useState<Collection[]>([])

  // Computed state: Featured collections for Collections Menu display
  // Featured collections for Collections Menu (expanded states only).
  // Empty collections cannot be featured per logic doc line 261 (admin validation in Step 1.3).
  // Frontend displays all collections with featured=true.
  const featuredCollections = useMemo(() => collections.filter(c => c.featured), [collections])

  // ===== COLLECTION FILTERING (Step 5.4 Stage 2) =====
  // Filter content, categories, and subcategories when collection tab is active
  
  // Filter content by collection when collection tab is active
  const filteredContent = useMemo(() => {
    // Check if activeTab is a collection tab
    if (!isCollectionTab(activeTab, activeCollections)) {
      // Main tab active: return full content array (no filtering)
      return content
    }
    
    // Collection tab active: get collection slug and filter content
    const collectionSlug = getCurrentCollectionSlug(activeTab, activeCollections)
    if (!collectionSlug) return content // Fallback to full content if slug not found
    
    return filterContentByCollection(content, collectionSlug)
  }, [content, activeTab, activeCollections])
  
  // Filter subcategories based on filtered content (cascading filter)
  const filteredSubcategories = useMemo(() => {
    // If no filtered content, return empty array
    if (filteredContent.length === 0 && isCollectionTab(activeTab, activeCollections)) {
      return []
    }
    
    // If collection tab active, filter subcategories
    if (isCollectionTab(activeTab, activeCollections)) {
      return filterSubcategoriesByCollection(subcategories, filteredContent)
    }
    
    // Main tab active: return full subcategories array (no filtering)
    return subcategories
  }, [subcategories, filteredContent, activeTab, activeCollections])
  
  // Filter categories based on filtered subcategories (cascading filter)
  const filteredCategories = useMemo(() => {
    // If no filtered content, return empty array
    if (filteredContent.length === 0 && isCollectionTab(activeTab, activeCollections)) {
      return []
    }
    
    // If collection tab active, filter categories (cascading from subcategories)
    if (isCollectionTab(activeTab, activeCollections)) {
      return filterCategoriesByCollection(categories, subcategories, filteredContent)
    }
    
    // Main tab active: return full categories array (no filtering)
    return categories
  }, [categories, subcategories, filteredContent, activeTab, activeCollections])

  // ===== LOADING STATES =====
  // Track loading progress for data fetching operations
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingContent, setLoadingContent] = useState(true)
  const [loadingCollections, setLoadingCollections] = useState(true)

  // ===== SUPABASE CLIENT =====
  // Initialize Supabase client for database queries
  const supabase = createClient()

  // ===== DATA LOADING FUNCTIONS =====
  
  async function loadCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, order_index')
      .order('order_index', { ascending: true })
    
    if (error) throw new Error(`Failed to load categories: ${error.message}`)
    return data || []
  }
  
  async function loadSubcategories(): Promise<Subcategory[]> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('id, name, order_index, category_id')
      .order('order_index', { ascending: true })
    
    if (error) throw new Error(`Failed to load subcategories: ${error.message}`)
    return data || []
  }

  // Query 5: Load Content with Joins
  async function loadContent(): Promise<ContentItemRaw[]> {
    // DEBUG: Commented out for production (Step 4.6 Stage 3)
    // console.log('🔍 [DEBUG] Loading content with joins...')
    const { data, error } = await supabase
      .from('content')
      .select(`
        id,
        title,
        subtitle,
        sidebar_title,
        sidebar_subtitle,
        type,
        content_body,
        image_sizes,
        image_url,
        video_url,
        audio_url,
        publication_name,
        publication_date,
        author_name,
        source_link,
        featured,
        order_index,
        subcategory_id,
        byline_style,
        link_style,
        categories(id, name),
        subcategories(id, name, category_id),
        byline_options(id, option_text),
        link_options(id, option_text),
        content_collections(collection_id, collections(slug, name))
      `)
      .eq('featured', true)
      .not('byline_style', 'is', null)
      .not('link_style', 'is', null)
      .order('order_index', { ascending: true })
    
    if (error) {
      // DEBUG: Commented out for production (Step 4.6 Stage 3)
      // console.error('❌ [DEBUG] Query error:', error)
      throw new Error(`Failed to load content: ${error.message}`)
    }
    
    // DEBUG: Commented out for production (Step 4.6 Stage 3)
    // console.log('🔍 [DEBUG] Query response:', JSON.stringify({
    //   dataCount: data?.length || 0,
    //   firstItem: data?.[0] ? {
    //     id: data[0].id,
    //     title: data[0].title,
    //     byline_style: data[0].byline_style,
    //     link_style: data[0].link_style,
    //     byline_options: data[0].byline_options,
    //     link_options: data[0].link_options,
    //     publication_name: data[0].publication_name,
    //     publication_date: data[0].publication_date,
    //     author_name: data[0].author_name,
    //     source_link: data[0].source_link
    //   } : null
    // }, null, 2))
    
    return data || []
  }

  // Query 6: Load All Collections
  async function loadCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        id,
        name,
        description,
        slug,
        order_index,
        featured
      `)
      .order('order_index', { ascending: true })
    
    if (error) throw new Error(`Failed to load collections: ${error.message}`)
    return data || []
  }

  // ===== DATA TRANSFORMATION FUNCTIONS =====
  
  // Extract publication year from publication_date string
  function extractPublicationYear(publication_date: string | null): number | null {
    if (!publication_date) return null
    
    // publication_date format: "YYYY-MM-DD" or "Month YYYY"
    const yearMatch = publication_date.match(/\d{4}/)
    return yearMatch ? parseInt(yearMatch[0], 10) : null
  }
  
  // Transform ContentItemRaw to ContentItem with flattened joins
  function transformContentItem(raw: ContentItemRaw): ContentItem {
    // DEBUG: Commented out for production (Step 4.6 Stage 3)
    // console.log('🔍 [DEBUG] Transform ContentItem - Raw data:', JSON.stringify({
    //   id: raw.id,
    //   title: raw.title,
    //   byline_style: raw.byline_style,
    //   link_style: raw.link_style,
    //   byline_options: raw.byline_options,
    //   link_options: raw.link_options,
    //   publication_name: raw.publication_name,
    //   publication_date: raw.publication_date,
    //   author_name: raw.author_name,
    //   source_link: raw.source_link
    // }, null, 2))
    
    // Handle nested join arrays (Supabase returns arrays even for one-to-one relationships)
    const category = raw.categories?.[0] || null
    const subcategory = raw.subcategories?.[0] || null
    // Fix: byline_options and link_options are returned as single objects, not arrays
    // Handle both array and object cases for compatibility
    const bylineOption = Array.isArray(raw.byline_options) 
      ? raw.byline_options[0] || null
      : raw.byline_options || null
    const linkOption = Array.isArray(raw.link_options)
      ? raw.link_options[0] || null
      : raw.link_options || null
    
    // DEBUG: Commented out for production (Step 4.6 Stage 3)
    // console.log('🔍 [DEBUG] Extracted options:', JSON.stringify({
    //   bylineOption: bylineOption,
    //   linkOption: linkOption,
    //   byline_style_text: bylineOption?.option_text || '',
    //   link_style_text: linkOption?.option_text || ''
    // }, null, 2))
    
    // Handle content_collections array (collections may be array or single object)
    const collectionSlugs: string[] = []
    const collectionNames: string[] = []
    
    if (raw.content_collections && raw.content_collections.length > 0) {
      raw.content_collections.forEach(cc => {
        // Handle collections as array or single object
        const collections = Array.isArray(cc.collections) ? cc.collections : [cc.collections]
        collections.forEach(coll => {
          if (coll?.slug) collectionSlugs.push(coll.slug)
          if (coll?.name) collectionNames.push(coll.name)
        })
      })
    }
    
    // Derive category_id from subcategory if not directly available
    const categoryId = subcategory?.category_id || ''
    
    return {
      // Direct fields (pass through)
      id: raw.id,
      title: raw.title,
      subtitle: raw.subtitle,
      sidebar_title: raw.sidebar_title || null,
      sidebar_subtitle: raw.sidebar_subtitle || null,
      type: raw.type,
      content_body: raw.content_body,
      image_sizes: raw.image_sizes || undefined,
      image_url: raw.image_url || undefined,
      video_url: raw.video_url || undefined,
      audio_url: raw.audio_url || undefined,
      publication_name: raw.publication_name || undefined,
      publication_date: raw.publication_date || undefined,
      author_name: raw.author_name || undefined,
      source_link: raw.source_link || undefined,
      original_source_url: raw.source_link || undefined,
      featured: raw.featured,
      order_index: raw.order_index,
      created_at: undefined,
      category_id: categoryId,
      subcategory_id: raw.subcategory_id,
      byline_style: raw.byline_style,
      link_style: raw.link_style,
      
      // Computed: publication year
      publication_year: extractPublicationYear(raw.publication_date),
      
      // Flattened: dropdown option texts
      byline_style_text: bylineOption?.option_text || '',
      link_style_text: linkOption?.option_text || '',
      
      // Flattened: category/subcategory names
      category_name: category?.name || '',
      subcategory_name: subcategory?.name || '',
      
      // Transformed: collection arrays
      collection_slugs: collectionSlugs,
      collection_names: collectionNames
    }
  }
  
  // Load and transform content pipeline
  async function loadAndTransformContent(): Promise<ContentItem[]> {
    const rawContent = await loadContent()
    return rawContent.map(transformContentItem)
  }

  // Auto-select first items in hierarchy (category → subcategory → content)
  async function autoSelectInitialContent(
    categories: Category[],
    subcategories: Subcategory[],
    content: ContentItem[]
  ): Promise<{
    selectedCategory: Category | null
    selectedSubcategory: Subcategory | null
    selectedContent: ContentItem | null
  }> {
    // Step 1: Select first category by order_index
    const firstCategory = categories.sort((a, b) => a.order_index - b.order_index)[0]
    if (!firstCategory) {
      return { selectedCategory: null, selectedSubcategory: null, selectedContent: null }
    }
    
    // Step 2: Select first subcategory of that category
    const firstSubcategory = subcategories
      .filter(s => s.category_id === firstCategory.id)
      .sort((a, b) => a.order_index - b.order_index)[0]
    if (!firstSubcategory) {
      return { selectedCategory: firstCategory, selectedSubcategory: null, selectedContent: null }
    }
    
    // Step 3: Select first content of that subcategory
    const firstContent = content
      .filter(c => c.subcategory_id === firstSubcategory.id)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))[0]
    if (!firstContent) {
      return { selectedCategory: firstCategory, selectedSubcategory: firstSubcategory, selectedContent: null }
    }
    
    // All selections made
    return {
      selectedCategory: firstCategory,
      selectedSubcategory: firstSubcategory,
      selectedContent: firstContent
    }
  }

  // ===== COLLECTION TAB CONTENT SELECTION HELPER FUNCTIONS (Step 5.5 Stage 1) =====
  
  // Find category and subcategory for a content item
  function findCategorySubcategoryForContent(
    content: ContentItem,
    categories: Category[],
    subcategories: Subcategory[]
  ): { category: Category | null; subcategory: Subcategory | null } {
    // Find subcategory by content.subcategory_id
    const subcategory = subcategories.find(s => s.id === content.subcategory_id) || null
    
    // Find category by subcategory.category_id
    const category = subcategory 
      ? categories.find(c => c.id === subcategory.category_id) || null
      : null
    
    return { category, subcategory }
  }
  
  // Auto-select content when collection tab opens (Step 5.5 Stage 1)
  // Logic: If current content is in collection, keep it; else select first by order_index
  function autoSelectCollectionContent(
    filteredContent: ContentItem[],
    currentContent: ContentItem | null,
    collectionSlug: string,
    filteredCategories: Category[],
    filteredSubcategories: Subcategory[]
  ): {
    selectedCategory: Category | null
    selectedSubcategory: Subcategory | null
    selectedContent: ContentItem | null
  } {
    // Edge case: Empty collection
    if (filteredContent.length === 0) {
      return {
        selectedCategory: null,
        selectedSubcategory: null,
        selectedContent: null
      }
    }
    
    // Check if current content is in collection (logic doc lines 103-105)
    if (currentContent) {
      // Check if currentContent.collection_slugs includes collectionSlug
      if (currentContent.collection_slugs && 
          Array.isArray(currentContent.collection_slugs) &&
          currentContent.collection_slugs.includes(collectionSlug)) {
        // Current content is in collection: keep it selected
        const { category, subcategory } = findCategorySubcategoryForContent(
          currentContent,
          filteredCategories,
          filteredSubcategories
        )
        return {
          selectedCategory: category,
          selectedSubcategory: subcategory,
          selectedContent: currentContent
        }
      }
    }
    
    // Current content NOT in collection: select first content by order_index
    const firstContent = [...filteredContent]
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))[0]
    
    if (!firstContent) {
      return {
        selectedCategory: null,
        selectedSubcategory: null,
        selectedContent: null
      }
    }
    
    // Find category and subcategory for first content
    const { category, subcategory } = findCategorySubcategoryForContent(
      firstContent,
      filteredCategories,
      filteredSubcategories
    )
    
    return {
      selectedCategory: category,
      selectedSubcategory: subcategory,
      selectedContent: firstContent
    }
  }

  // ===== COLLECTION FILTERING HELPER FUNCTIONS (Step 5.4 Stage 1) =====
  
  // Check if activeTab is a collection tab (not a main tab)
  function isCollectionTab(activeTab: string, activeCollections: CollectionTab[]): boolean {
    // Main tabs: 'portfolio', 'resume', 'downloads'
    const mainTabs = ['portfolio', 'resume', 'downloads']
    if (mainTabs.includes(activeTab)) return false
    
    // Check if activeTab matches a collection slug
    return activeCollections.some(c => c.slug === activeTab)
  }
  
  // Get current collection slug from activeTab
  function getCurrentCollectionSlug(activeTab: string, activeCollections: CollectionTab[]): string | null {
    if (!isCollectionTab(activeTab, activeCollections)) return null
    return activeTab // activeTab is the collection slug when it's a collection tab
  }
  
  // Filter content items by collection slug
  function filterContentByCollection(content: ContentItem[], collectionSlug: string): ContentItem[] {
    if (!collectionSlug) return []
    
    return content.filter(item => {
      // Handle edge case: collection_slugs may be undefined/null
      if (!item.collection_slugs || !Array.isArray(item.collection_slugs)) return false
      // Check if collection_slugs array includes the target collection slug
      return item.collection_slugs.includes(collectionSlug)
    })
  }
  
  // Filter subcategories that contain at least one filtered content item
  function filterSubcategoriesByCollection(subcategories: Subcategory[], filteredContent: ContentItem[]): Subcategory[] {
    if (filteredContent.length === 0) return []
    
    // Get unique subcategory IDs from filtered content
    const subcategoryIdsWithContent = new Set(
      filteredContent
        .map(item => item.subcategory_id)
        .filter((id): id is string => id !== null && id !== undefined)
    )
    
    // Filter subcategories that have content in the collection
    return subcategories.filter(subcategory => 
      subcategoryIdsWithContent.has(subcategory.id)
    )
  }
  
  // Filter categories that contain at least one subcategory with filtered content (cascading filter)
  function filterCategoriesByCollection(
    categories: Category[],
    subcategories: Subcategory[],
    filteredContent: ContentItem[]
  ): Category[] {
    if (filteredContent.length === 0) return []
    
    // First, get filtered subcategories
    const filteredSubcategories = filterSubcategoriesByCollection(subcategories, filteredContent)
    
    // Get unique category IDs from filtered subcategories
    const categoryIdsWithContent = new Set(
      filteredSubcategories.map(subcategory => subcategory.category_id)
    )
    
    // Filter categories that have at least one subcategory with collection content
    return categories.filter(category => 
      categoryIdsWithContent.has(category.id)
    )
  }

  // ===== DATA LOADING EFFECTS =====
  // Load all data and auto-select first items on component mount (7-step sequence)
  useEffect(() => {
    async function loadAllData() {
      try {
        // Set all loading states to true
        setLoadingCategories(true)
        setLoadingContent(true)
        setLoadingCollections(true)
        
        // Step 1: Load categories and subcategories in parallel
        const [categoriesData, subcategoriesData] = await Promise.all([
          loadCategories(),
          loadSubcategories()
        ])
        
        // Step 2: Load dropdown options in parallel (skipped for now, handled in content query)
        // Placeholder for future: const [bylineOptionsData, linkOptionsData] = await Promise.all([
        //   loadBylineOptions(),
        //   loadLinkOptions()
        // ])
        
        // Step 3: Load and transform content
        const contentData = await loadAndTransformContent()
        
        // Step 4: Load collections (parallel with content, but content already loaded)
        const collectionsData = await loadCollections()
        
        // Step 5: Auto-select first items
        const { selectedCategory, selectedSubcategory, selectedContent } = 
          await autoSelectInitialContent(categoriesData, subcategoriesData, contentData)
        
        // Step 6: Update all state arrays
        setCategories(categoriesData)
        setSubcategories(subcategoriesData)
        setContent(contentData)
        setCollections(collectionsData)
        setSelectedCategory(selectedCategory)
        setSelectedSubcategory(selectedSubcategory)
        setSelectedContent(selectedContent)
        
        // Step 7: Set page state - Stage 2: Always start in expanded-empty state
        // Menu bar expanded = no content displayed; Menu bar collapsed = content displayed
        // Page loads with menu bar expanded, so state is always 'expanded-empty' on load
        setPageState('expanded-empty')
        
        // Set all loading states to false
        setLoadingCategories(false)
        setLoadingContent(false)
        setLoadingCollections(false)
        
        // Console logging after state updates
        console.log('All data loaded and selections made')
        console.log('Selected category:', selectedCategory?.name)
        console.log('Selected subcategory:', selectedSubcategory?.name)
        console.log('Selected content:', selectedContent?.title)
        console.log('Page state:', selectedContent ? 'expanded-reader' : 'expanded-empty')
        
        // DEBUG: Commented out for production (Step 4.6 Stage 3)
        // if (selectedContent) {
        //   console.log('🔍 [DEBUG] SelectedContent metadata fields:', JSON.stringify({
        //     publication_name: selectedContent.publication_name,
        //     publication_date: selectedContent.publication_date,
        //     byline_style_text: selectedContent.byline_style_text,
        //     author_name: selectedContent.author_name,
        //     link_style_text: selectedContent.link_style_text,
        //     source_link: selectedContent.source_link
        //   }, null, 2))
        // }
      } catch (err) {
        console.error('Failed to load data:', err)
        // Set all loading states to false on error
        setLoadingCategories(false)
        setLoadingContent(false)
        setLoadingCollections(false)
      }
    }
    
    loadAllData()
  }, [])

  // ===== COLLECTION TAB CONTENT SELECTION (Step 5.5 Stage 2) =====
  // Auto-select content when collection tab becomes active
  // Use ref to track previous activeTab to only run when tab actually changes
  const prevActiveTabRef = useRef<string>(activeTab)
  
  useEffect(() => {
    // Only run if collection tab is active AND activeTab actually changed
    const activeTabChanged = prevActiveTabRef.current !== activeTab
    prevActiveTabRef.current = activeTab
    
    // Only run if collection tab is active
    if (!isCollectionTab(activeTab, activeCollections)) {
      return // Main tab active: no auto-selection needed
    }
    
    // Only run auto-selection when activeTab changes to collection tab (not on every selection change)
    if (!activeTabChanged) {
      return // activeTab didn't change, user is manually selecting
    }
    
    // Skip if still loading or no filtered content
    if (loadingContent || loadingCategories || filteredContent.length === 0) {
      return
    }
    
    // Get collection slug
    const collectionSlug = getCurrentCollectionSlug(activeTab, activeCollections)
    if (!collectionSlug) return
    
    // Auto-select content for collection tab
    const selection = autoSelectCollectionContent(
      filteredContent,
      selectedContent,
      collectionSlug,
      filteredCategories,
      filteredSubcategories
    )
    
      // Update state only if selection changed (prevent infinite loops)
      if (selection.selectedContent?.id !== selectedContent?.id ||
          selection.selectedCategory?.id !== selectedCategory?.id ||
          selection.selectedSubcategory?.id !== selectedSubcategory?.id) {
        setSelectedCategory(selection.selectedCategory)
        setSelectedSubcategory(selection.selectedSubcategory)
        setSelectedContent(selection.selectedContent)
        
        // Stage 4: Don't change pageState here - it's already set in handleCollectionClick based on menu bar state
        // If menu bar is collapsed, state is already 'collapsed-reader' (content will show)
        // If menu bar is expanded, state is already 'expanded-empty' (content won't show)
        // This ensures collection respects current menu bar state
      }
  }, [activeTab, activeCollections, filteredContent, filteredCategories, filteredSubcategories, selectedContent, loadingContent, loadingCategories])

  // ===== DEBUG LOGGING =====
  // Log all state changes to console for development/debugging
  useEffect(() => {
    console.log('=== PortfolioTab State ===')
    console.log('Page State:', pageState)
    if (profileHeight === 0) {
      console.warn('[PortfolioTab] Profile Height is 0px - Profile component may not have measured height yet')
    } else {
      console.log('Profile Height:', profileHeight, 'px') // Debug: Check if profileHeight is being set
    }
    console.log('Menu Bar Top Value:', profileHeight > 0 ? `${profileHeight}px` : '200px (fallback - Profile height not yet measured)') // Debug: Show calculated top value
    console.log('Selected Category:', selectedCategory?.name || 'None')
    console.log('Selected Subcategory:', selectedSubcategory?.name || 'None')
    console.log('Selected Content:', selectedContent?.title || 'None')
    console.log('Active Tab:', activeTab)
    console.log('Active Collections:', activeCollections.length)
    console.log('Data Loaded:', {
      categories: categories.length,
      subcategories: subcategories.length,
      content: content.length,
      collections: collections.length
    })
    console.log('Loading States:', { loadingCategories, loadingContent, loadingCollections })
    
    // Stage 3: Verify final state and selections
    const allDataLoaded = !loadingCategories && !loadingContent && !loadingCollections
    if (allDataLoaded) {
      console.log('=== Final State Verification ===')
      
      // Verify selections
      const hasCategory = selectedCategory !== null
      const hasSubcategory = selectedSubcategory !== null
      const hasContent = selectedContent !== null
      
      console.log('Selection Status:', {
        category: hasCategory ? `✓ ${selectedCategory?.name}` : '✗ None',
        subcategory: hasSubcategory ? `✓ ${selectedSubcategory?.name}` : '✗ None',
        content: hasContent ? `✓ ${selectedContent?.title}` : '✗ None'
      })
      
      // Verify pageState matches selections
      const expectedPageState = hasContent ? 'expanded-reader' : 'expanded-empty'
      const pageStateCorrect = pageState === expectedPageState
      console.log('Page State Verification:', {
        current: pageState,
        expected: expectedPageState,
        correct: pageStateCorrect ? '✓' : '✗'
      })
      
      // Edge case detection
      if (!hasCategory && !hasSubcategory && !hasContent) {
        console.log('Edge Case: Empty database - all selections null, pageState should be expanded-empty')
      } else if (hasCategory && hasSubcategory && !hasContent) {
        console.log('Edge Case: No content - category and subcategory selected, content null, pageState should be expanded-empty')
      } else if (hasCategory && !hasSubcategory && !hasContent) {
        console.log('Edge Case: No subcategory - category selected, subcategory and content null, pageState should be expanded-empty')
      } else if (hasCategory && hasSubcategory && hasContent) {
        console.log('Normal State: All selections made - pageState should be expanded-reader')
      }
    }
  }, [
    pageState,
    selectedCategory,
    selectedSubcategory,
    selectedContent,
    activeTab,
    activeCollections,
    categories,
    subcategories,
    content,
    collections,
    loadingCategories,
    loadingContent,
    loadingCollections
  ])

  // ===== CALLBACK HANDLERS =====
  // Handle tab change from BottomTabBar (Step 5.7 Stage 1)
  // Switching tabs automatically triggers filtering via useMemo hooks (filteredContent, filteredCategories, filteredSubcategories)
  // These hooks react to activeTab changes and filter Main menu content accordingly (Step 5.4)
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    console.log('Tab changed to:', tab)
    // Filtering works automatically: useMemo hooks (lines 145-186) react to activeTab changes
    // - Main tabs ('portfolio', 'resume', 'downloads'): show all content (no filtering)
    // - Collection tabs (collection.slug): show only collection content (filtered)
  }

  // Handle collection close from BottomTabBar (placeholder for Phase 5)
  // Collection close handler (Step 5.6 Stage 1)
  // Remove collection from activeCollections array, switch activeTab to 'portfolio' if closing current tab
  const handleCollectionClose = (slug: string) => {
    // Remove collection from activeCollections array (tech-ref Rule 9, logic doc line 418)
    setActiveCollections(prev => prev.filter(c => c.slug !== slug))
    
    // If closing the currently active tab, switch to 'portfolio' (tech-ref Rule 9, logic doc line 418)
    if (activeTab === slug) {
      setActiveTab('portfolio')
    }
    // If closing non-active tab, leave activeTab unchanged (edge case per logic doc line 418)
  }

  // Selection handlers (Step 3.3 Stage 2 - following state transition rules 1-4)
  // Rule 1: Category click → expanded-empty (clear subcategory/content, set category)
  const handleCategorySelect = useCallback((category: Category) => {
    // Stage 6: Check if already selected - toggle menu state
    if (selectedCategory?.id === category.id) {
      // Already selected: toggle menu state
      if (pageState === 'collapsed-reader') {
        // Collapsed → expand menu
        setPageState('expanded-empty')
      } else {
        // Expanded → collapse menu (only if content is selected, otherwise stay expanded)
        if (selectedContent) {
          setPageState('collapsed-reader')
        }
        // If no content selected, stay in expanded-empty (can't show Content Reader without content)
      }
      return
    }
    
    // New selection: normal behavior
    setSelectedCategory(category)
    setSelectedSubcategory(null)
    setSelectedContent(null)
    setPageState('expanded-empty')
  }, [selectedCategory, selectedContent, pageState])

  // Rule 2: Subcategory click → expanded-empty (clear content, set subcategory)
  const handleSubcategorySelect = useCallback((subcategory: Subcategory) => {
    // Stage 6: Check if already selected - toggle menu state
    if (selectedSubcategory?.id === subcategory.id) {
      // Already selected: toggle menu state
      if (pageState === 'collapsed-reader') {
        // Collapsed → expand menu
        setPageState('expanded-empty')
      } else {
        // Expanded → collapse menu (only if content is selected, otherwise stay expanded)
        if (selectedContent) {
          setPageState('collapsed-reader')
        }
        // If no content selected, stay in expanded-empty (can't show Content Reader without content)
      }
      return
    }
    
    // New selection: normal behavior
    setSelectedSubcategory(subcategory)
    setSelectedContent(null)
    setPageState('expanded-empty')
  }, [selectedSubcategory, selectedContent, pageState])

  // Rule 3: Content click → collapsed-reader (set content, collapse menu)
  const handleContentSelect = useCallback((content: ContentItem) => {
    // Stage 6: Check if already selected - toggle menu state
    if (selectedContent?.id === content.id) {
      // Already selected: toggle menu state
      if (pageState === 'collapsed-reader') {
        // Collapsed → expand menu (hide Content Reader)
        setPageState('expanded-empty')
      } else {
        // Expanded → collapse menu (show Content Reader with same content)
        setPageState('collapsed-reader')
      }
      return
    }
    
    // New selection: normal behavior
    setSelectedContent(content)
    setPageState('collapsed-reader')
  }, [selectedContent, pageState])

  // Rule 4: Main menu click (collapsed state) → expanded-reader (expand without changing selection)
  const handleMainMenuClick = useCallback(() => {
    if (pageState === 'collapsed-reader') {
      // Stage 3: When menu bar expands, hide Content Reader by setting state to expanded-empty
      // Menu bar expanded = no content displayed; Menu bar collapsed = content displayed
      setPageState('expanded-empty')
      // Selection unchanged (category/subcategory/content remain same, but Content Reader hidden)
    }
  }, [pageState])

  // Collection click handler (Step 5.3 Stage 1)
  // Collection tab opening: Add to activeCollections, switch activeTab, always expand menu bar (Stage 4)
  const handleCollectionClick = useCallback((collection: Collection) => {
    // Check if collection is already open (duplicate prevention)
    if (activeCollections.find(c => c.slug === collection.slug)) {
      // Already open: just switch to it
      setActiveTab(collection.slug)
      // Stage 4: Always expand menu bar and hide content when collection is clicked
      setPageState('expanded-empty')
      return
    }
    
    // Not open: add to activeCollections array (append, don't replace) per logic doc line 414
    setActiveCollections(prev => [...prev, { slug: collection.slug, name: collection.name }])
    // Switch activeTab to collection.slug per logic doc line 416
    setActiveTab(collection.slug)
    // Stage 4: Always expand menu bar and hide content when collection is clicked
    // Collection click always expands menu bar and hides Content Reader, regardless of current state
    setPageState('expanded-empty')
  }, [activeCollections])

  // Prepare collections prop for BottomTabBar
  // activeCollections already in correct format: { slug: string, name: string }[]
  const bottomTabBarCollections = activeCollections

  return (
    <div>
      {/* Area 1 - Profile: Sticky header at top, reports its height via callback */}
      <Profile onHeightChange={setProfileHeight} />
      
      {/* Area 2 - Menu Bar Container: Holds Main Menu and Collections Menu on same horizontal plane */}
      {/* Fixed positioning: 25px gap from Profile bottom (per layout-reset.md line 287) */}
      {/* Background color prevents content from showing through when fixed */}
      {/* Fixed positioning removes Menu Bar from document flow, preventing it from scrolling with Content Reader */}
      {/* Menu Bar: Main Menu on left (~60px from left edge), Collections Menu on right (~60px from right edge) */}
      {/* Menu Bar: Main Menu on left (~60px from left edge), Collections Menu on right (~60px from right edge) */}
      {/* Both menus on same horizontal plane, natural gap between them (per layout-reset.md lines 290-303) */}
      {/* Menu Bar height: Dynamic in expanded state, minimum 64px in collapsed state (per layout-reset.md lines 293-302) */}
      {/* Natural gap between Main Menu and Collections Menu created by flex justify-between */}
      {/* Gap widens/shrinks with window dimensions (per layout-reset.md lines 305-308) */}
      <div 
        className="fixed z-10 bg-[#1a1d23] flex justify-between items-start min-h-16 px-[60px]" 
        style={{ 
          top: profileHeight ? `${profileHeight}px` : '200px',
          left: '0',
          right: '0'
        }}
      >
        <MainMenu
          categories={filteredCategories}
          subcategories={filteredSubcategories}
          content={filteredContent}
          pageState={pageState}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          selectedContent={selectedContent}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
          onContentSelect={handleContentSelect}
          onMenuClick={handleMainMenuClick}
        />
        <CollectionsMenu
          collections={collections}
          featuredCollections={featuredCollections}
          selectedContent={selectedContent}
          pageState={pageState}
          onCollectionClick={handleCollectionClick}
        />
      </div>

      {/* Area 3 - Content Area Container: Holds Content Reader and Info Menu */}
      {/* Normal document flow - positioning will be refined in Steps 6.2-6.4 */}
      <div className="relative">
        {/* ContentReader - visible only in collapsed-reader state (Stage 1: expanded-reader state no longer shows Content Reader) */}
        {pageState === 'collapsed-reader' && (
          <ContentReader
            content={selectedContent}
            isVisible={true}
            positioning="collapsed"
          />
        )}
        
        {/* InfoMenu - only visible in collapsed state (per layout-reset.md line 363) */}
        {pageState === 'collapsed-reader' && (
          <InfoMenu
            metadata={selectedContent ? {
              publication_name: selectedContent.publication_name || '',
              publication_date: selectedContent.publication_date || '',
              byline_style_text: selectedContent.byline_style_text || '',
              author_name: selectedContent.author_name || '',
              link_style_text: selectedContent.link_style_text || '',
              source_link: selectedContent.source_link || ''
            } : null}
            isVisible={true}
            profileHeight={profileHeight}
          />
        )}
      </div>

      {/* Area 4 - Bottom Tab Bar: Fixed positioning at bottom */}
      <BottomTabBar
        activeTab={activeTab}
        collections={bottomTabBarCollections}
        onTabChange={handleTabChange}
        onCollectionClose={handleCollectionClose}
      />
    </div>
  )
}

