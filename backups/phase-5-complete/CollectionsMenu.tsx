'use client'

import { useMemo } from 'react'

// CollectionsMenu component - displays collections with dual layout (Step 5.1)

// Type definitions (matching PortfolioTab types)
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
  byline_style_text?: string
  link_style_text?: string
  category_name?: string
  subcategory_name?: string
  collection_slugs?: string[]
  collection_names?: string[]
}

// CollectionsMenuProps interface (matches tech-ref lines 1356-1363)
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
  // === COMPUTED STATE ===
  
  const isVertical = pageState !== 'collapsed-reader'
  
  // Visibility rules (Logic Doc lines 257-262):
  // - Expanded states (expanded-empty, expanded-reader): Show only featured collections (vertical list, ordered by order_index ascending)
  // - Collapsed state (collapsed-reader): Show collections linked to current content item (horizontal row, ordered by order_index: smallest right → larger left)
  // - Empty state: If content item has 0 collections linked, collapsed state shows empty space
  // - Featured requirement: Empty collections (0 content items) cannot be featured (admin validation in Step 1.3)
  const displayedCollections = useMemo(() => {
    if (isVertical) {
      // Expanded states: show only featured collections
      return featuredCollections.sort((a, b) => a.order_index - b.order_index)
    } else {
      // Collapsed state: show collections linked to current content
      if (!selectedContent) return []
      return collections
        .filter(c => selectedContent.collection_slugs?.includes(c.slug))
        .sort((a, b) => a.order_index - b.order_index)
    }
  }, [isVertical, featuredCollections, collections, selectedContent])
  
  // === RENDER ===
  
  if (isVertical) {
    // Vertical list (expanded states)
    return (
      <div className="flex flex-col space-y-2">
        {displayedCollections.map(coll => (
          <div
            key={coll.id}
            onClick={() => onCollectionClick(coll)}
            className="cursor-pointer text-[#6b7280] hover:text-[#e5e7eb]"
          >
            {coll.name}
          </div>
        ))}
      </div>
    )
  } else {
    // Horizontal row (collapsed state)
    if (displayedCollections.length === 0) {
      return <div className="h-4" /> // Empty space
    }
    
    // Order: smallest right → larger left (Logic Doc line 259)
    const reversedCollections = [...displayedCollections].reverse()
    
    return (
      <div className="flex flex-row-reverse space-x-reverse space-x-2">
        {reversedCollections.map(coll => (
          <div
            key={coll.id}
            onClick={() => onCollectionClick(coll)}
            className="cursor-pointer text-[#6b7280] hover:text-[#e5e7eb]"
          >
            {coll.name}
          </div>
        ))}
      </div>
    )
  }
}

