'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import MainMenu from '@/components/tabs/MainMenu'
import ContentReader from '@/components/ContentReader'
import InfoMenu from '@/components/InfoMenu'
import CollectionsMenu from '@/components/tabs/CollectionsMenu'
import { Skeleton } from '@/components/ui/skeleton'


type PageState = 'expanded-empty' | 'expanded-reader' | 'collapsed-reader'

interface ContentTab {
  id: string
  title: string
}

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

interface ContentItemRaw {
  id: string
  title: string
  subtitle: string | null
  sidebar_title: string | null
  sidebar_subtitle: string | null
  type: string
  content_body?: any
  download_enabled: boolean
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
  categories?: { id: string; name: string }[] | null
  subcategories?: { id: string; name: string; category_id: string }[] | null
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
  download_enabled?: boolean
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
  publication_year?: number | null
  byline_style_text?: string | null
  link_style_text?: string | null
  category_name?: string
  subcategory_name?: string
  collection_slugs?: string[]
  collection_names?: string[]
}

interface CollectionTab {
  slug: string
  name: string
}


interface PortfolioContentProps {
  activeTab: string
  activeCollections: CollectionTab[]
  activeContents: ContentTab[]
  onCollectionClick: (collection: Collection) => void
  profileHeight: number
  onDownloadContextChange?: (context: { contentTitle: string | null; contentId: string | null; contentType: string | null; downloadEnabled: boolean | null }) => void
  onMenuExpandedChange?: (isExpanded: boolean) => void
}


export default function PortfolioContent({
  activeTab,
  activeCollections,
  activeContents,
  onCollectionClick,
  profileHeight,
  onDownloadContextChange,
  onMenuExpandedChange
}: PortfolioContentProps) {
  const [pageState, setPageState] = useState<PageState>('expanded-empty')

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [titleInView, setTitleInView] = useState<boolean>(true)
  const [subtitleInView, setSubtitleInView] = useState<boolean>(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [collections, setCollections] = useState<Collection[]>([])

  const featuredCollections = useMemo(() => collections.filter(c => c.featured), [collections])
  const contentCacheRef = useRef<Map<string, ContentItem>>(new Map())
  const contentFetchInFlightRef = useRef<Set<string>>(new Set())
  const filteredContentCacheRef = useRef<Map<string, ContentItem[]>>(new Map())
  const filteredSubcategoriesCacheRef = useRef<Map<string, Subcategory[]>>(new Map())
  const filteredCategoriesCacheRef = useRef<Map<string, Category[]>>(new Map())

  useEffect(() => {
    filteredContentCacheRef.current.clear()
    filteredSubcategoriesCacheRef.current.clear()
    filteredCategoriesCacheRef.current.clear()
  }, [content, subcategories, categories])

  const buildTabCacheKey = useCallback(() => {
    const collectionKey = activeCollections.map(c => c.slug).join(',')
    const contentKey = activeContents.map(c => c.id).join(',')
    return `${activeTab}::${collectionKey}::${contentKey}`
  }, [activeTab, activeCollections, activeContents])

  
  const filteredContent = useMemo(() => {
    const cacheKey = buildTabCacheKey()
    const cached = filteredContentCacheRef.current.get(cacheKey)
    if (cached) return cached
    let result: ContentItem[]
    if (isContentTab(activeTab, activeContents)) {
      result = content.filter(item => item.id === activeTab)
    } else if (isCollectionTab(activeTab, activeCollections)) {
      const collectionSlug = getCurrentCollectionSlug(activeTab, activeCollections)
      result = collectionSlug ? filterContentByCollection(content, collectionSlug) : content
    } else {
      result = content
    }
    filteredContentCacheRef.current.set(cacheKey, result)
    return result
  }, [content, activeTab, activeCollections, activeContents, buildTabCacheKey])
  
  const filteredSubcategories = useMemo(() => {
    const cacheKey = buildTabCacheKey()
    const cached = filteredSubcategoriesCacheRef.current.get(cacheKey)
    if (cached) return cached
    let result: Subcategory[]
    if (filteredContent.length === 0 && (isCollectionTab(activeTab, activeCollections) || isContentTab(activeTab, activeContents))) {
      result = []
    } else if (isCollectionTab(activeTab, activeCollections)) {
      result = filterSubcategoriesByCollection(subcategories, filteredContent)
    } else if (isContentTab(activeTab, activeContents)) {
      const ids = new Set(
        filteredContent
          .map(item => item.subcategory_id)
          .filter((id): id is string => !!id)
      )
      result = subcategories.filter(s => ids.has(s.id))
    } else {
      result = subcategories
    }
    filteredSubcategoriesCacheRef.current.set(cacheKey, result)
    return result
  }, [subcategories, filteredContent, activeTab, activeCollections, activeContents, buildTabCacheKey])
  
  const filteredCategories = useMemo(() => {
    const cacheKey = buildTabCacheKey()
    const cached = filteredCategoriesCacheRef.current.get(cacheKey)
    if (cached) return cached
    let result: Category[]
    if (filteredContent.length === 0 && (isCollectionTab(activeTab, activeCollections) || isContentTab(activeTab, activeContents))) {
      result = []
    } else if (isCollectionTab(activeTab, activeCollections)) {
      result = filterCategoriesByCollection(categories, subcategories, filteredContent)
    } else if (isContentTab(activeTab, activeContents)) {
      const subIds = new Set(
        filteredContent
          .map(item => item.subcategory_id)
          .filter((id): id is string => !!id)
      )
      const catIds = new Set(
        subcategories
          .filter(s => subIds.has(s.id))
          .map(s => s.category_id)
      )
      result = categories.filter(c => catIds.has(c.id))
    } else {
      result = categories
    }
    filteredCategoriesCacheRef.current.set(cacheKey, result)
    return result
  }, [categories, subcategories, filteredContent, activeTab, activeCollections, activeContents, buildTabCacheKey])

  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingContent, setLoadingContent] = useState(true)
  const [loadingCollections, setLoadingCollections] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    setTitleInView(true)
    setSubtitleInView(true)
  }, [selectedContent?.id])

  useEffect(() => {
    if (!onMenuExpandedChange) return
    onMenuExpandedChange(pageState !== 'collapsed-reader')
  }, [pageState, onMenuExpandedChange])

  
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

  async function loadContentPreview(): Promise<ContentItemRaw[]> {
    const { data, error } = await supabase
      .from('content')
      .select(`
        id,
        title,
        subtitle,
        sidebar_title,
        sidebar_subtitle,
        type,
        download_enabled,
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
      .order('order_index', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to load content: ${error.message}`)
    }
    
    return data || []
  }

  async function loadContentDetails(contentId: string): Promise<ContentItem | null> {
    if (!contentId) return null
    if (contentCacheRef.current.has(contentId)) {
      return contentCacheRef.current.get(contentId) || null
    }
    if (contentFetchInFlightRef.current.has(contentId)) {
      return null
    }
    contentFetchInFlightRef.current.add(contentId)
    try {
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
          download_enabled,
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
        .eq('id', contentId)
        .maybeSingle()

      if (error) {
        throw new Error(`Failed to load content details: ${error.message}`)
      }
      if (!data) return null
      const transformed = transformContentItem(data)
      contentCacheRef.current.set(contentId, transformed)
      return transformed
    } finally {
      contentFetchInFlightRef.current.delete(contentId)
    }
  }

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

  
  function extractPublicationYear(publication_date: string | null): number | null {
    if (!publication_date) return null
    
    const yearMatch = publication_date.match(/\d{4}/)
    return yearMatch ? parseInt(yearMatch[0], 10) : null
  }
  
  function transformContentItem(raw: ContentItemRaw): ContentItem {
    const category = raw.categories?.[0] || null
    const subcategory = raw.subcategories?.[0] || null
    const bylineOption = Array.isArray(raw.byline_options) 
      ? raw.byline_options[0] || null
      : raw.byline_options || null
    const linkOption = Array.isArray(raw.link_options)
      ? raw.link_options[0] || null
      : raw.link_options || null
    
    const collectionSlugs: string[] = []
    const collectionNames: string[] = []
    
    if (raw.content_collections && raw.content_collections.length > 0) {
      raw.content_collections.forEach(cc => {
        const collections = Array.isArray(cc.collections) ? cc.collections : [cc.collections]
        collections.forEach(coll => {
          if (coll?.slug) collectionSlugs.push(coll.slug)
          if (coll?.name) collectionNames.push(coll.name)
        })
      })
    }
    
    const categoryId = subcategory?.category_id || ''
    
    return {
      id: raw.id,
      title: raw.title,
      subtitle: raw.subtitle,
      sidebar_title: raw.sidebar_title || null,
      sidebar_subtitle: raw.sidebar_subtitle || null,
      type: raw.type,
      content_body: raw.content_body,
      download_enabled: raw.download_enabled,
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
      
      publication_year: extractPublicationYear(raw.publication_date),
      
      byline_style_text: bylineOption?.option_text || null,
      link_style_text: linkOption?.option_text || null,
      
      category_name: category?.name || '',
      subcategory_name: subcategory?.name || '',
      
      collection_slugs: collectionSlugs,
      collection_names: collectionNames
    }
  }
  
  async function loadAndTransformContentPreview(): Promise<ContentItem[]> {
    const rawContent = await loadContentPreview()
    return rawContent.map(transformContentItem)
  }

  async function autoSelectInitialContent(
    categories: Category[],
    subcategories: Subcategory[],
    content: ContentItem[]
  ): Promise<{
    selectedCategory: Category | null
    selectedSubcategory: Subcategory | null
    selectedContent: ContentItem | null
  }> {
    const firstCategory = categories.sort((a, b) => a.order_index - b.order_index)[0]
    if (!firstCategory) {
      return { selectedCategory: null, selectedSubcategory: null, selectedContent: null }
    }
    
    const firstSubcategory = subcategories
      .filter(s => s.category_id === firstCategory.id)
      .sort((a, b) => a.order_index - b.order_index)[0]
    if (!firstSubcategory) {
      return { selectedCategory: firstCategory, selectedSubcategory: null, selectedContent: null }
    }
    
    const firstContent = content
      .filter(c => c.subcategory_id === firstSubcategory.id)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))[0]
    if (!firstContent) {
      return { selectedCategory: firstCategory, selectedSubcategory: firstSubcategory, selectedContent: null }
    }
    
    return {
      selectedCategory: firstCategory,
      selectedSubcategory: firstSubcategory,
      selectedContent: firstContent
    }
  }

  
  function findCategorySubcategoryForContent(
    content: ContentItem,
    categories: Category[],
    subcategories: Subcategory[]
  ): { category: Category | null; subcategory: Subcategory | null } {
    const subcategory = subcategories.find(s => s.id === content.subcategory_id) || null
    
    const category = subcategory 
      ? categories.find(c => c.id === subcategory.category_id) || null
      : null
    
    return { category, subcategory }
  }
  
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
    if (filteredContent.length === 0) {
      return {
        selectedCategory: null,
        selectedSubcategory: null,
        selectedContent: null
      }
    }
    
    if (currentContent) {
      if (currentContent.collection_slugs && 
          Array.isArray(currentContent.collection_slugs) &&
          currentContent.collection_slugs.includes(collectionSlug)) {
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
    
    const firstContent = [...filteredContent]
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))[0]
    
    if (!firstContent) {
      return {
        selectedCategory: null,
        selectedSubcategory: null,
        selectedContent: null
      }
    }
    
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

  
  function isCollectionTab(activeTab: string, activeCollections: CollectionTab[]): boolean {
    const mainTabs = ['portfolio', 'resume', 'downloads']
    if (mainTabs.includes(activeTab)) return false
    
    return activeCollections.some(c => c.slug === activeTab)
  }

  function isContentTab(activeTab: string, activeContents: ContentTab[] = []): boolean {
    const mainTabs = ['portfolio', 'resume', 'downloads']
    if (mainTabs.includes(activeTab)) return false
    return activeContents.some(c => c.id === activeTab)
  }
  
  function getCurrentCollectionSlug(activeTab: string, activeCollections: CollectionTab[]): string | null {
    if (!isCollectionTab(activeTab, activeCollections)) return null
    return activeTab // activeTab is the collection slug when it's a collection tab
  }
  
  function filterContentByCollection(content: ContentItem[], collectionSlug: string): ContentItem[] {
    if (!collectionSlug) return []
    
    return content.filter(item => {
      if (!item.collection_slugs || !Array.isArray(item.collection_slugs)) return false
      return item.collection_slugs.includes(collectionSlug)
    })
  }
  
  function filterSubcategoriesByCollection(subcategories: Subcategory[], filteredContent: ContentItem[]): Subcategory[] {
    if (filteredContent.length === 0) return []
    
    const subcategoryIdsWithContent = new Set(
      filteredContent
        .map(item => item.subcategory_id)
        .filter((id): id is string => id !== null && id !== undefined)
    )
    
    return subcategories.filter(subcategory => 
      subcategoryIdsWithContent.has(subcategory.id)
    )
  }
  
  function filterCategoriesByCollection(
    categories: Category[],
    subcategories: Subcategory[],
    filteredContent: ContentItem[]
  ): Category[] {
    if (filteredContent.length === 0) return []
    
    const filteredSubcategories = filterSubcategoriesByCollection(subcategories, filteredContent)
    
    const categoryIdsWithContent = new Set(
      filteredSubcategories.map(subcategory => subcategory.category_id)
    )
    
    return categories.filter(category => 
      categoryIdsWithContent.has(category.id)
    )
  }

  useEffect(() => {
    async function loadAllData() {
      try {
        setLoadingCategories(true)
        setLoadingContent(true)
        setLoadingCollections(true)
        
        const [categoriesData, subcategoriesData] = await Promise.all([
          loadCategories(),
          loadSubcategories()
        ])
        
        const contentData = await loadAndTransformContentPreview()
        
        const collectionsData = await loadCollections()
        
        const { selectedCategory, selectedSubcategory, selectedContent } = 
          await autoSelectInitialContent(categoriesData, subcategoriesData, contentData)
        
        setCategories(categoriesData)
        setSubcategories(subcategoriesData)
        setContent(contentData)
        setCollections(collectionsData)
        setSelectedCategory(selectedCategory)
        setSelectedSubcategory(selectedSubcategory)
        setSelectedContent(selectedContent)
        
        setPageState('expanded-empty')
        
        setLoadingCategories(false)
        setLoadingContent(false)
        setLoadingCollections(false)
        
      } catch (err) {
        console.error('Failed to load data:', err)
        setLoadingCategories(false)
        setLoadingContent(false)
        setLoadingCollections(false)
      }
    }
    
    loadAllData()
  }, [])

  const applyContentDetails = useCallback((details: ContentItem) => {
    contentCacheRef.current.set(details.id, details)
    setContent(prev => prev.map(item => item.id === details.id ? { ...item, ...details } : item))
    setSelectedContent(prev => prev?.id === details.id ? { ...prev, ...details } : prev)
  }, [])

  const ensureContentDetails = useCallback(async (item: ContentItem | null) => {
    if (!item) return
    if (item.type !== 'article') return
    if (item.content_body) return
    if (contentCacheRef.current.has(item.id)) {
      const cached = contentCacheRef.current.get(item.id)
      if (cached) applyContentDetails(cached)
      return
    }
    try {
      const details = await loadContentDetails(item.id)
      if (details) {
        applyContentDetails(details)
      }
    } finally {
    }
  }, [applyContentDetails])

  useEffect(() => {
    if (!isContentTab(activeTab, activeContents)) return
    if (loadingContent || loadingCategories) return
    const contentMatch = content.find(c => c.id === activeTab) || null
    if (!contentMatch) return
    const { category, subcategory } = findCategorySubcategoryForContent(contentMatch, categories, subcategories)
    const shouldUpdateSelection =
      selectedContent?.id !== contentMatch.id ||
      selectedCategory?.id !== category?.id ||
      selectedSubcategory?.id !== subcategory?.id ||
      pageState !== 'collapsed-reader'
    if (shouldUpdateSelection) {
      setSelectedContent(contentMatch)
      setSelectedCategory(category)
      setSelectedSubcategory(subcategory)
      setPageState('collapsed-reader')
    }
    void ensureContentDetails(contentMatch)
  }, [
    activeTab,
    activeContents,
    content,
    categories,
    subcategories,
    selectedContent,
    selectedCategory,
    selectedSubcategory,
    pageState,
    loadingContent,
    loadingCategories,
    ensureContentDetails
  ])

  useEffect(() => {
    if (!onDownloadContextChange) return
    const contentTitle = selectedContent?.sidebar_title || selectedContent?.title || null
    onDownloadContextChange({
      contentTitle,
      contentId: selectedContent?.id || null,
      contentType: selectedContent?.type || null,
      downloadEnabled: typeof selectedContent?.download_enabled === 'boolean' ? selectedContent.download_enabled : null
    })
  }, [selectedContent, onDownloadContextChange])

  const prevActiveTabRef = useRef<string>(activeTab)
  
  useEffect(() => {
    const activeTabChanged = prevActiveTabRef.current !== activeTab
    prevActiveTabRef.current = activeTab
    
    if (!isCollectionTab(activeTab, activeCollections)) {
      return // Main tab active: no auto-selection needed
    }
    
    if (!activeTabChanged) {
      return // activeTab didn't change, user is manually selecting
    }
    
    if (loadingContent || loadingCategories || filteredContent.length === 0) {
      return
    }
    
    const collectionSlug = getCurrentCollectionSlug(activeTab, activeCollections)
    if (!collectionSlug) return
    
    const selection = autoSelectCollectionContent(
      filteredContent,
      selectedContent,
      collectionSlug,
      filteredCategories,
      filteredSubcategories
    )
    
      if (selection.selectedContent?.id !== selectedContent?.id ||
          selection.selectedCategory?.id !== selectedCategory?.id ||
          selection.selectedSubcategory?.id !== selectedSubcategory?.id) {
        setSelectedCategory(selection.selectedCategory)
        setSelectedSubcategory(selection.selectedSubcategory)
        setSelectedContent(selection.selectedContent)
        if (selection.selectedContent) {
          void ensureContentDetails(selection.selectedContent)
        }
      }
  }, [
    activeTab,
    activeCollections,
    filteredContent,
    filteredCategories,
    filteredSubcategories,
    selectedContent,
    loadingContent,
    loadingCategories,
    ensureContentDetails
  ])

  
  const handleCategorySelect = useCallback((category: Category) => {
    if (selectedCategory?.id === category.id) {
      if (pageState === 'collapsed-reader') {
        setPageState('expanded-empty')
      } else {
        if (selectedContent) {
          setPageState('collapsed-reader')
        }
      }
      return
    }
    
    setSelectedCategory(category)
    setSelectedSubcategory(null)
    setSelectedContent(null)
    setPageState('expanded-empty')
  }, [selectedCategory, selectedContent, pageState])

  const handleSubcategorySelect = useCallback((subcategory: Subcategory) => {
    if (selectedSubcategory?.id === subcategory.id) {
      if (pageState === 'collapsed-reader') {
        setPageState('expanded-empty')
      } else {
        if (selectedContent) {
          setPageState('collapsed-reader')
        }
      }
      return
    }
    
    setSelectedSubcategory(subcategory)
    setSelectedContent(null)
    setPageState('expanded-empty')
  }, [selectedSubcategory, selectedContent, pageState])

  const handleContentSelect = useCallback((content: ContentItem) => {
    if (selectedContent?.id === content.id) {
      if (pageState === 'collapsed-reader') {
        setPageState('expanded-empty')
      } else {
        setPageState('collapsed-reader')
        void ensureContentDetails(content)
      }
      return
    }
    
    setSelectedContent(content)
    void ensureContentDetails(content)
    setPageState('collapsed-reader')
  }, [selectedContent, pageState, ensureContentDetails])

  const handleMainMenuClick = useCallback(() => {
    if (pageState === 'collapsed-reader') {
      setPageState('expanded-empty')
    }
  }, [pageState])

  const handleCollectionClick = useCallback((collection: Collection) => {
    onCollectionClick(collection)
    setPageState('expanded-empty')
  }, [onCollectionClick])

  const isLoading = loadingCategories || loadingContent || loadingCollections

  if (isLoading) {
    return (
      <div>
        <div 
          className="fixed z-10 bg-[#1a1d23] flex justify-between items-start min-h-16 px-[60px]" 
          style={{ 
            top: profileHeight ? `${profileHeight}px` : '200px',
            left: '0',
            right: '0'
          }}
        >
          <div className="flex gap-12">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>

        <div className="relative mt-32">
          <div className="max-w-4xl mx-auto p-8 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-3 mt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div 
        className="fixed z-10 bg-[#1a1d23] flex justify-between items-start min-h-16 px-[60px]" 
        style={{ 
          top: profileHeight ? `${profileHeight}px` : '200px',
          left: '0',
          right: '0'
        }}
        data-portfolio-menu-bar
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

      <div className="relative">
        {pageState === 'collapsed-reader' && (
          <ContentReader
            content={selectedContent}
            isVisible={true}
            positioning="collapsed"
            onTitleVisibilityChange={({ titleInView, subtitleInView }) => {
              setTitleInView(titleInView)
              setSubtitleInView(subtitleInView)
            }}
          />
        )}
        
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
            stickyTitle={selectedContent?.title || null}
            stickySubtitle={selectedContent?.subtitle || null}
            showStickyTitle={!titleInView}
            showStickySubtitle={!!selectedContent?.subtitle && !subtitleInView}
          />
        )}
      </div>
    </div>
  )
}

