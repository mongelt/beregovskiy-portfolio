'use client'

import { useEffect, useMemo, useRef, useState } from 'react'


interface ContentMetadata {
  publication_name: string
  publication_date: string // "January 2024" format
  
  byline_style_text: string // From byline_options table (green label)
  author_name: string // Gray value
  
  link_style_text: string // From link_options table (green label)
  source_link: string // URL (gray value)
}

const DEFAULT_FAVICON_DATA_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">' +
  '<rect width="16" height="16" fill="%239ca3af"/>' +
  '<path d="M3 3h10v10H3z" fill="%231a1d23"/>' +
  '<path d="M6 6h4v4H6z" fill="%239ca3af"/></svg>'

interface InfoMenuProps {
  metadata: ContentMetadata | null
  isVisible: boolean
  profileHeight?: number // Profile height for vertical centering calculation (Step 6.4 Stage 2)
  stickyTitle?: string | null
  stickySubtitle?: string | null
  showStickyTitle?: boolean
  showStickySubtitle?: boolean
}

export default function InfoMenu({
  metadata,
  isVisible,
  profileHeight = 0,
  stickyTitle = null,
  stickySubtitle = null,
  showStickyTitle = false,
  showStickySubtitle = false
}: InfoMenuProps) {
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null)
  const [faviconStage, setFaviconStage] = useState<0 | 1 | 2>(0)

  if (!isVisible || !metadata) return null

  const sourceLink = metadata.source_link || ''

  const mainDomain = useMemo(() => {
    if (!sourceLink) return ''
    try {
      const url = new URL(sourceLink)
      const hostname = url.hostname || sourceLink
      if (hostname === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
        return hostname
      }
      const parts = hostname.split('.').filter(Boolean)
      if (parts.length <= 2) return hostname
      return parts.slice(-2).join('.')
    } catch {
      return sourceLink
    }
  }, [sourceLink])

  const directFaviconUrl = useMemo(() => {
    if (!mainDomain) return ''
    return `https://${mainDomain}/favicon.ico`
  }, [mainDomain])

  const serviceFaviconUrl = useMemo(() => {
    if (!mainDomain) return ''
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(mainDomain)}&sz=64`
  }, [mainDomain])

  useEffect(() => {
    if (!sourceLink || !mainDomain) {
      setFaviconSrc(null)
      setFaviconStage(0)
      return
    }
    setFaviconStage(0)
    setFaviconSrc(directFaviconUrl)
  }, [sourceLink, mainDomain, directFaviconUrl])

  const handleFaviconError = () => {
    if (!mainDomain) return
    if (faviconStage === 0) {
      setFaviconStage(1)
      setFaviconSrc(serviceFaviconUrl)
      return
    }
    if (faviconStage === 1) {
      setFaviconStage(2)
      setFaviconSrc(DEFAULT_FAVICON_DATA_URI)
    }
  }

  const centerPoint = profileHeight > 0
    ? `calc((${profileHeight}px + 25px + 100vh) / 2)`
    : 'calc((200px + 25px + 100vh) / 2)' // Fallback to approximate Profile height if not set

  return (
    <div
      className="fixed z-10"
      style={{
        top: centerPoint, // Vertically centered between Menu Bar and Bottom Tab Bar
        left: '25px', // 25px from left edge (per layout-reset.md line 354)
        transform: 'translateY(-50%)' // Always centered between Menu Bar and Bottom Tab Bar
      }}
    >
      {(showStickyTitle || showStickySubtitle) && (
        <div ref={stickyRef} className="mb-3">
          {showStickyTitle && stickyTitle && (
            <div className="text-base font-bold text-white leading-tight">
              {stickyTitle}
            </div>
          )}
          {showStickySubtitle && stickySubtitle && (
            <div className="text-[15px] text-gray-400 leading-tight">
              {stickySubtitle}
            </div>
          )}
        </div>
      )}
      
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
      
      {metadata.byline_style_text && (
        <div className="text-sm mb-2">
          <span className="text-[#00ff88]">{metadata.byline_style_text}</span>
          {metadata.author_name && (
            <span className="text-[#9ca3af]">: </span>
          )}
          {metadata.author_name && (
            <span className="text-[#9ca3af]">{metadata.author_name}</span>
          )}
        </div>
      )}
      
      {metadata.link_style_text && (
        <div className="text-sm">
          <span className="text-[#00ff88]">{metadata.link_style_text}</span>
          {metadata.source_link && (
            <span className="text-[#9ca3af]">: </span>
          )}
          {metadata.source_link ? (
            <a 
              href={metadata.source_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#9ca3af] hover:text-[#e5e7eb] underline inline-flex items-center gap-2"
              title={metadata.source_link}
            >
              {faviconSrc && (
                <img
                  src={faviconSrc}
                  alt=""
                  className="h-4 w-4 rounded-sm"
                  onError={handleFaviconError}
                />
              )}
              <span>{mainDomain || metadata.source_link}</span>
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

