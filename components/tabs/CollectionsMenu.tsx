'use client'

import { useMemo } from 'react'


type PageState = 'expanded-empty' | 'expanded-reader' | 'collapsed-reader'

interface Collection {
  id: string
  slug: string
  name: string
  description?: any
  order_index: number
  featured: boolean
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
}

interface CollectionsMenuProps {
  collections: Collection[] // All collections for filtering logic
  featuredCollections: Collection[] // For expanded state display
  selectedContent: ContentItem | null // For collapsed state filtering
  pageState: PageState // To determine layout
  onCollectionClick: (collection: Collection) => void // Callback for collection clicks
}

export default function CollectionsMenu({
  collections,
  featuredCollections,
  selectedContent,
  pageState,
  onCollectionClick
}: CollectionsMenuProps) {
  
  const isVertical = pageState !== 'collapsed-reader'
  
  const displayedCollections = useMemo(() => {
    if (isVertical) {
      return featuredCollections.sort((a, b) => a.order_index - b.order_index)
    } else {
      if (!selectedContent) return []
      return collections
        .filter(c => selectedContent.collection_slugs?.includes(c.slug))
        .sort((a, b) => a.order_index - b.order_index)
    }
  }, [isVertical, featuredCollections, collections, selectedContent])
  
  
  if (isVertical) {
    return (
      <div className="collections-menu flex flex-col gap-2 pt-[15px] relative overflow-hidden">
        {displayedCollections.map(coll => (
          <div
            key={coll.id}
            onClick={() => onCollectionClick(coll)}
            className="collections-menu-item cursor-pointer text-text-on-dark-inactive hover:text-text-on-dark overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {coll.name}
          </div>
        ))}
      </div>
    )
  } else {
    if (displayedCollections.length === 0) {
      return <div className="h-4" /> // Empty space
    }
    
    const reversedCollections = [...displayedCollections].reverse()
    
    return (
      <div className="collections-menu flex flex-row-reverse gap-2 py-[10px] relative overflow-hidden">
        {reversedCollections.map(coll => (
          <div
            key={coll.id}
            onClick={() => onCollectionClick(coll)}
            className="collections-menu-item cursor-pointer text-text-on-dark-inactive hover:text-text-on-dark overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {coll.name}
          </div>
        ))}
      </div>
    )
  }
}

