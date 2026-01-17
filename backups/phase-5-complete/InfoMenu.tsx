'use client'

// InfoMenu component - displays metadata for selected content (Step 4.5)

// ContentMetadata type definition (matches tech-ref lines 1298-1310)
interface ContentMetadata {
  // Line 1: Publication Name / Publication Date
  publication_name: string
  publication_date: string // "January 2024" format
  
  // Line 2: <byline style>: Author Name
  byline_style_text: string // From byline_options table (green label)
  author_name: string // Gray value
  
  // Line 3: <link style>: Link to Original Source
  link_style_text: string // From link_options table (green label)
  source_link: string // URL (gray value)
}

// InfoMenuProps interface (matches tech-ref lines 1373-1376)
interface InfoMenuProps {
  metadata: ContentMetadata | null
  isVisible: boolean
}

export default function InfoMenu({ metadata, isVisible }: InfoMenuProps) {
  // Early return: only shown in reader states when metadata exists
  // Per logic doc line 318: Visibility only shown in "reader" states
  // Per tech-ref line 3044: Early return if not visible or no metadata
  if (!isVisible || !metadata) return null

  // === RENDER ===
  // Fixed positioning: top 75%, left 2.5% (remains fixed during Content Reader scroll)
  // Adjusted from 50% to 75% to prevent overlap with Main Menu (25% lower on page)
  // Per logic doc line 320: Absolute positioned at top 50%, left 2.5% (adjusted for Main Menu clearance)
  // Per tech-ref lines 3052-3054: Fixed positioning with transform for vertical centering
  return (
    <div
      className="fixed z-10"
      style={{
        top: '75%',
        left: '2.5%',
        transform: 'translateY(-50%)' // Center vertically relative to this position
      }}
    >
      {/* Line 1: Publication Name / Publication Date */}
      {/* Step 4.6 Stage 2: Handle null/empty values - hide line if both fields are null/empty */}
      {(metadata.publication_name || metadata.publication_date) && (
        <div className="text-sm mb-2">
          {metadata.publication_name && (
            <>
              <span className="text-[#00ff88]">{metadata.publication_name}</span>
              {metadata.publication_date && (
                <span className="text-[#9ca3af]"> / </span>
              )}
            </>
          )}
          {metadata.publication_date && (
            <span className="text-[#9ca3af]">{metadata.publication_date}</span>
          )}
        </div>
      )}
      
      {/* Line 2: <byline style>: Author Name */}
      {/* Step 4.6 Stage 2: Handle null/empty values - hide line if both fields are null/empty */}
      {(metadata.byline_style_text || metadata.author_name) && (
        <div className="text-sm mb-2">
          {metadata.byline_style_text && (
            <span className="text-[#00ff88]">{metadata.byline_style_text}</span>
          )}
          {metadata.byline_style_text && metadata.author_name && (
            <span className="text-[#9ca3af]">: </span>
          )}
          {metadata.author_name && (
            <span className="text-[#9ca3af]">{metadata.author_name}</span>
          )}
        </div>
      )}
      
      {/* Line 3: <link style>: Link to Original Source */}
      {/* Step 4.6 Stage 2: Handle null/empty values - hide line if both fields are null/empty, only render link if source_link is valid */}
      {(metadata.link_style_text || metadata.source_link) && (
        <div className="text-sm">
          {metadata.link_style_text && (
            <span className="text-[#00ff88]">{metadata.link_style_text}</span>
          )}
          {metadata.link_style_text && metadata.source_link && (
            <span className="text-[#9ca3af]">: </span>
          )}
          {metadata.source_link ? (
            <a 
              href={metadata.source_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#9ca3af] hover:text-[#e5e7eb] underline"
            >
              {metadata.source_link}
            </a>
          ) : (
            metadata.link_style_text && (
              <span className="text-[#9ca3af]">—</span>
            )
          )}
        </div>
      )}
    </div>
  )
}

