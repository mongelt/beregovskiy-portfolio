'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import AudioPlayer from '@/components/AudioPlayer'
import VideoPlayer from '@/components/VideoPlayer'

// ContentReader component - displays selected content with dynamic positioning

// Dynamic import of EditorRenderer with SSR prevention (Step 4.3 Stage 1)
// Per tech-ref lines 3048-3049: Dynamic import with ssr: false required
const EditorRenderer = dynamic(() => import('@/components/EditorRenderer'), { ssr: false })

// ContentItem type definition (matches PortfolioTab ContentItem interface)
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
  byline_style_text?: string | null
  link_style_text?: string | null
  category_name?: string
  subcategory_name?: string
  collection_slugs?: string[]
  collection_names?: string[]
}

interface ContentReaderProps {
  content: ContentItem | null
  isVisible: boolean
  positioning: 'expanded' | 'collapsed'
  onTitleVisibilityChange?: (state: { titleInView: boolean; subtitleInView: boolean }) => void
}

export default function ContentReader({ content, isVisible, positioning, onTitleVisibilityChange }: ContentReaderProps) {
  // Early return: only shown in reader states (collapsed-reader, expanded-reader)
  // Per logic doc line 278: Visibility only shown in "reader" states
  if (!isVisible || !content) return null
  
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const subtitleRef = useRef<HTMLHeadingElement | null>(null)
  const notifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Observe title/subtitle visibility to inform InfoMenu when they scroll out of view
  useEffect(() => {
    if (!onTitleVisibilityChange) return
    // If not visible or no content, treat as in view to avoid sticky state
    if (!isVisible || !content) {
      onTitleVisibilityChange({ titleInView: true, subtitleInView: true })
      return
    }
    if (typeof IntersectionObserver === 'undefined') {
      onTitleVisibilityChange({ titleInView: true, subtitleInView: true })
      return
    }

    let currentTitleInView = true
    let currentSubtitleInView = true

    const notify = () => {
      onTitleVisibilityChange({
        titleInView: currentTitleInView,
        subtitleInView: currentSubtitleInView
      })
    }

    const DEBOUNCE_MS = 200
    const scheduleNotify = () => {
      if (notifyTimerRef.current) {
        clearTimeout(notifyTimerRef.current)
      }
      notifyTimerRef.current = setTimeout(() => {
        notify()
        notifyTimerRef.current = null
      }, DEBOUNCE_MS)
    }

    const getMenuBarBottom = () => {
      if (typeof document === 'undefined') return 0
      const menuBar = document.querySelector('[data-portfolio-menu-bar]')
      if (!menuBar) return 0
      const rect = menuBar.getBoundingClientRect()
      return rect.bottom || 0
    }

    const HIDE_TRIGGER_OFFSET_PX = 6

    const computeInView = (rect: DOMRect | null) => {
      if (!rect) return true
      const menuBarBottom = getMenuBarBottom()
      if (menuBarBottom > 0) {
        return rect.bottom > (menuBarBottom + HIDE_TRIGGER_OFFSET_PX)
      }
      return rect.bottom > 0 && rect.top < window.innerHeight
    }

    const updateFromRects = () => {
      currentTitleInView = computeInView(titleRef.current?.getBoundingClientRect() || null)
      currentSubtitleInView = computeInView(subtitleRef.current?.getBoundingClientRect() || null)
      scheduleNotify()
    }

    const observer = new IntersectionObserver(() => {
      updateFromRects()
    }, {
      root: null,
      threshold: [0, 0.05, 0.1, 1],
      rootMargin: '0px'
    })

    if (titleRef.current) {
      observer.observe(titleRef.current)
    } else {
      currentTitleInView = true
      scheduleNotify()
    }
    if (subtitleRef.current) {
      observer.observe(subtitleRef.current)
    } else {
      currentSubtitleInView = true
      scheduleNotify()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', updateFromRects, { passive: true })
      window.addEventListener('resize', updateFromRects)
    }

    // Initial notify
    updateFromRects()

    return () => {
      observer.disconnect()
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', updateFromRects)
        window.removeEventListener('resize', updateFromRects)
      }
      if (notifyTimerRef.current) {
        clearTimeout(notifyTimerRef.current)
        notifyTimerRef.current = null
      }
    }
  }, [content, isVisible, onTitleVisibilityChange])

  // Stage 5: Positioning prop simplified - Content Reader only visible in collapsed-reader state
  // Positioning prop kept for future flexibility, but always 'collapsed' now
  // Collapsed state positioning: 105px below Menu Bar (35px original + 70px additional), 50px gap from right edge (per layout-reset.md lines 323, 337)
  // Content Reader is foundation of page - other elements positioned on top of it
  // Simple margins, no vh-based calculations - browser scrollbar handles scrolling
  const marginTop = '105px' // Collapsed: 105px spacing (35px + 70px fix)
  
  // Collapsed state horizontal positioning
  const marginRight = '50px' // Gap from right edge (layout-reset.md line 323)
  // Left margin: Info Menu left (25px) + Info Menu width (estimated 250px) + gap (20px) = 295px
  // Fills space between Info Menu right edge and right edge of page (per layout-reset.md line 322)
  const marginLeft = '295px' // Collapsed: starts after Info Menu
  
  // Note: Expanded state positioning removed - Content Reader only visible in collapsed state (Stage 1)
  // Positioning prop kept for future flexibility if expanded state positioning is needed again

  return (
    <div
      className="flex-1"
      style={{
        position: 'relative',
        marginTop,
        marginLeft,
        marginRight
      }}
    >
      {/* Content display - title and subtitle (Step 4.2), content body (Steps 4.3-4.4) */}
      <div 
        className="text-[#e5e7eb]"
        style={{
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Title display - Step 4.2 Stage 1 */}
        <h1 ref={titleRef} className="text-3xl font-bold text-[#e5e7eb] mb-2">{content.title}</h1>
        {/* Subtitle display - Step 4.2 Stage 2 */}
        {content.subtitle && (
          <h2 ref={subtitleRef} className="text-xl text-[#d1d5db] mb-6">{content.subtitle}</h2>
        )}
        {/* Article content - Step 4.3 Stage 2 */}
        {content.type === 'article' && content.content_body && (
          <EditorRenderer data={content.content_body} />
        )}
        {/* Image content - Step 4.4 Stage 1 */}
        {content.type === 'image' && content.image_url && (
          <div className="my-8 flex justify-center">
            <img 
              src={content.image_url} 
              alt={content.title}
              className="max-w-full h-auto rounded-lg"
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}
        {/* Step 15.3: Video content - replaced HTML5 video with Video.js VideoPlayer */}
        {content.type === 'video' && content.video_url && (
          <VideoPlayer videoUrl={content.video_url} title={content.title} />
        )}
        {/* Step 13.Bug.1.1: Audio content - replaced HTML5 audio with wavesurfer.js AudioPlayer */}
        {content.type === 'audio' && content.audio_url && (
          <AudioPlayer audioUrl={content.audio_url} />
        )}
      </div>
    </div>
  )
}

