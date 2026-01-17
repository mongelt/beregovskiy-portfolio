'use client'

import dynamic from 'next/dynamic'

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
  byline_style_text?: string
  link_style_text?: string
  category_name?: string
  subcategory_name?: string
  collection_slugs?: string[]
  collection_names?: string[]
}

interface ContentReaderProps {
  content: ContentItem | null
  isVisible: boolean
  positioning: 'expanded' | 'collapsed'
}

export default function ContentReader({ content, isVisible, positioning }: ContentReaderProps) {
  // Early return: only shown in reader states (collapsed-reader, expanded-reader)
  // Per logic doc line 278: Visibility only shown in "reader" states
  if (!isVisible || !content) return null
  const CONTENT_TOP_PADDING = '0px'
  const overlayHeight = `calc(${CONTENT_TOP_PADDING} + 2rem)`

  // Positioning calculations per logic doc lines 306-312
  // Base positioning: margin-left: -2%, margin-right: 2% (logic doc line 307)
  // Vertical positioning: margin-top positions below Profile header (logic doc line 308)
  // expanded-reader: margin-left shifts right +80px for expanded Main menu (logic doc line 309)
  // collapsed-reader: margin-right extends -15% toward page edge (logic doc line 310)
  // Note: No maxHeight or overflow-y-auto - ContentReader in normal flow, browser scrollbar handles scrolling
  // Note: Width constraints should come from parent container layout (per bug fix lessons learned)
  // These margin values are exact per logic doc - do not adjust without verifying visual appearance
  const marginLeft = positioning === 'expanded' 
    ? 'calc(-2% + 80px)'  // expanded-reader: shift right +80px for expanded Main menu (logic doc line 309)
    : '-2%'                 // collapsed-reader: base left margin -2% (logic doc line 307)

  const marginRight = positioning === 'collapsed'
    ? '2%'    // collapsed-reader: use same right margin as expanded state (matches expanded state)
    : '2%'    // expanded-reader: base right margin 2% (logic doc line 307)

  const marginTop = 'calc(45vh - 33vh - 3rem - 257px + 300px)'

  return (
    <div
      className="flex-1"
      style={{
        marginLeft,
        marginRight,
        marginTop,
        position: 'relative',
        // Prevent horizontal overflow: constrain width to viewport
        // Collapsed state: max-width ensures content doesn't extend beyond ~5% from right edge
        // Expanded state: max-width prevents overflow with 2% margin
        maxWidth: positioning === 'collapsed' 
          ? 'calc(100vw - 5%)'
          : 'calc(100vw - 2%)'
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-2rem',
          left: 0,
          right: 0,
          height: overlayHeight,
          backgroundColor: '#0f1419',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      {/* Content display - title and subtitle (Step 4.2), content body (Steps 4.3-4.4) */}
      {/* Padding-top prevents content from scrolling under sticky Main menu */}
      <div 
        className="text-[#e5e7eb]"
        style={{
          paddingTop: CONTENT_TOP_PADDING,
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Title display - Step 4.2 Stage 1 */}
        <h1 className="text-3xl font-bold text-[#e5e7eb] mb-2">{content.title}</h1>
        {/* Subtitle display - Step 4.2 Stage 2 */}
        {content.subtitle && (
          <h2 className="text-xl text-[#d1d5db] mb-6">{content.subtitle}</h2>
        )}
        {/* Article content - Step 4.3 Stage 2 */}
        {content.type === 'article' && content.content_body && (
          <EditorRenderer data={content.content_body} />
        )}
        {/* Image content - Step 4.4 Stage 1 */}
        {content.type === 'image' && content.image_url && (
          <div className="my-8">
            <img 
              src={content.image_url} 
              alt={content.title}
              className="w-full rounded-lg"
            />
          </div>
        )}
        {/* Video content - Step 4.4 Stage 2 */}
        {content.type === 'video' && content.video_url && (
          <div className="my-8">
            {content.video_url.includes('youtube.com') || content.video_url.includes('youtu.be') ? (
              <div className="aspect-video">
                <iframe
                  src={content.video_url}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            ) : (
              <video 
                src={content.video_url}
                controls
                className="w-full rounded-lg"
              />
            )}
          </div>
        )}
        {/* Audio content - Step 4.4 Stage 3 */}
        {content.type === 'audio' && content.audio_url && (
          <div className="my-8">
            <audio 
              src={content.audio_url}
              controls
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}

