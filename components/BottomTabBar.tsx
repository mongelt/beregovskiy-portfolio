'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { tapScale } from '@/lib/animations'
import { useMobileState } from '@/lib/responsive'
import { ArrowUp, ArrowUpRight } from 'lucide-react'

type Collection = {
  slug: string
  name: string
}

type ContentTab = {
  id: string
  title: string
}

type DownloadMenuRow = {
  key: string
  left: string
  right: string | null
  disabled: boolean
  onClick: () => void | Promise<void>
}

type BottomTabBarProps = {
  activeTab: string
  collections: Collection[]
  contentTabs: ContentTab[]
  onTabChange: (tab: string) => void
  onCollectionClose: (slug: string) => void
  onContentClose: (id: string) => void
  currentContentTitle?: string | null
  currentContentType?: string | null
  currentContentId?: string | null
  currentContentDownloadEnabled?: boolean | null
  currentCollectionName?: string | null
  currentCollectionSlug?: string | null
  loadingTabs?: string[]
  onDownload?: (target: 'resume' | 'content' | 'collection') => Promise<void>
  isMenuExpanded?: boolean
}

export default function BottomTabBar({ 
  activeTab, 
  collections, 
  contentTabs,
  onTabChange, 
  onCollectionClose,
  onContentClose,
  currentContentTitle = null,
  currentContentType = null,
  currentContentId = null,
  currentContentDownloadEnabled = null,
  currentCollectionName = null,
  currentCollectionSlug = null,
  loadingTabs = [],
  onDownload,
  isMenuExpanded = false
}: BottomTabBarProps) {
  const { isMobile } = useMobileState()
  const tabs = [
    { id: 'portfolio', label: 'PORTFOLIO' },
    { id: 'resume', label: 'RESUME' }
  ]
  const isTabLoading = (id: string) => loadingTabs.includes(id)

  const collectionsRef = useRef<HTMLDivElement | null>(null)
  const contentsRef = useRef<HTMLDivElement | null>(null)
  const mainTabsRef = useRef<HTMLDivElement | null>(null)
  const downloadBtnRef = useRef<HTMLButtonElement | null>(null)
  const downloadMenuRef = useRef<HTMLDivElement | null>(null)
  const shareBtnRef = useRef<HTMLButtonElement | null>(null)
  const shareMenuRef = useRef<HTMLDivElement | null>(null)
  const [downloadsOpen, setDownloadsOpen] = useState<boolean>(false)
  const [shareOpen, setShareOpen] = useState<boolean>(false)
  const [shareCopiedKey, setShareCopiedKey] = useState<string | null>(null)
  const [mainTabsWidth, setMainTabsWidth] = useState<number>(0)
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  useEffect(() => {
    setDownloadsOpen(false)
    setShareOpen(false)
    setShareCopiedKey(null)
    setDownloadStatus('idle')
  }, [activeTab])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const downloadBtn = downloadBtnRef.current
      const downloadMenu = downloadMenuRef.current
      const shareBtn = shareBtnRef.current
      const shareMenu = shareMenuRef.current
      const target = e.target as Node
      if (downloadBtn?.contains(target) || downloadMenu?.contains(target)) return
      if (shareBtn?.contains(target) || shareMenu?.contains(target)) return
      setDownloadsOpen(false)
      setShareOpen(false)
      setShareCopiedKey(null)
    }
    if (downloadsOpen || shareOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [downloadsOpen, shareOpen])

  useEffect(() => {
    const measure = () => setMainTabsWidth(mainTabsRef.current?.offsetWidth ?? 0)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [tabs.length])

  const downloadMenuRows: DownloadMenuRow[] = [
    {
      key: 'resume',
      left: downloadStatus === 'loading' ? 'Generating Download…' : 'Download Resume',
      right: null,
      disabled: downloadStatus === 'loading',
      onClick: () => handleDownload('resume')
    }
  ]
  const isContentContext =
    activeTab === 'portfolio' ||
    isContentTab(activeTab, contentTabs) ||
    isCollectionTab(activeTab, collections)
  const isCollectionContext = isCollectionTab(activeTab, collections)
  const normalizedType = currentContentType ? currentContentType.toLowerCase() : null
  const allowContentDownload =
    normalizedType !== 'audio' && normalizedType !== 'video'

  if (
    isContentContext &&
    currentContentTitle &&
    allowContentDownload &&
    currentContentDownloadEnabled !== false
  ) {
    downloadMenuRows.push({
      key: 'content',
      left: downloadStatus === 'loading' ? 'Generating Download…' : `Download ${currentContentTitle}`,
      right: '...and include resume',
      disabled: downloadStatus === 'loading',
      onClick: () => handleDownload('content')
    })
  }
  if (isCollectionContext && currentCollectionName) {
    downloadMenuRows.push({
      key: 'collection',
      left: downloadStatus === 'loading' ? 'Generating Download…' : `Download ${currentCollectionName}`,
      right: '...and include resume',
      disabled: downloadStatus === 'loading',
      onClick: () => handleDownload('collection')
    })
  }

  const shareMenuRows = [
    {
      key: 'portfolio',
      label: 'Share Portfolio',
      visible: true,
      value: getShareLink('portfolio')
    }
  ]
  if (isContentContext && currentContentTitle) {
    if (isMenuExpanded && activeTab === 'portfolio') {
    } else {
    shareMenuRows.push({
      key: 'content',
      label: `Share ${currentContentTitle}`,
      visible: true,
      value: getShareLink('content')
    })
    }
  }
  if (isCollectionContext && currentCollectionName && currentCollectionSlug) {
    shareMenuRows.push({
      key: 'collection',
      label: `Share ${currentCollectionName}`,
      visible: true,
      value: getShareLink('collection')
    })
  }

  function isContentTab(activeTab: string, contents: ContentTab[]): boolean {
    const mainTabs = ['portfolio', 'resume']
    if (mainTabs.includes(activeTab)) return false
    return contents.some(c => c.id === activeTab)
  }

  function isCollectionTab(activeTab: string, cols: Collection[]): boolean {
    const mainTabs = ['portfolio', 'resume']
    if (mainTabs.includes(activeTab)) return false
    return cols.some(c => c.slug === activeTab)
  }

  async function handleDownload(target: 'resume' | 'content' | 'collection') {
    if (downloadStatus === 'loading') return
    try {
      setDownloadStatus('loading')
      if (onDownload) {
        await onDownload(target)
      } else {
        await new Promise(res => setTimeout(res, 300))
      }
      setDownloadStatus('idle')
      setDownloadsOpen(false)
    } catch (err) {
      console.error('Download failed', err)
      setDownloadStatus('error')
    }
  }

  function getShareLink(target: 'portfolio' | 'content' | 'collection') {
    if (typeof window === 'undefined') return ''
    const origin = window.location.origin
    if (target === 'portfolio') return origin
    if (target === 'content') {
      const contentId = currentContentId || (isContentTab(activeTab, contentTabs) ? activeTab : null)
      return contentId ? `${origin}/?content=${encodeURIComponent(contentId)}` : origin
    }
    if (target === 'collection') {
      return currentCollectionSlug ? `${origin}/?collection=${encodeURIComponent(currentCollectionSlug)}` : origin
    }
    return origin
  }

  async function handleShareCopy(value: string) {
    if (!value) return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const el = document.createElement('textarea')
        el.value = value
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
    } catch (err) {
      console.error('Share copy failed', err)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-border-gray-800 z-50 bg-bg-menu-bar backdrop-saturate-[180%] backdrop-blur-[20px] shadow-[0_-2px_12px_rgba(0,0,0,0.1)]">
      <div className="relative flex items-center justify-center h-16 px-4">
        <div className="absolute left-[25px]">
          <div className="relative">
            <button
              ref={downloadBtnRef}
              onClick={() => setDownloadsOpen(prev => !prev)}
              className={
                isMobile
                  ? `flex flex-col items-center gap-1 font-body text-[0.88rem] font-semibold transition-all duration-200 border rounded-[5px] bg-transparent ${
                      downloadsOpen
                        ? 'border-[1.5px] border-text-on-dark text-text-on-dark-hover opacity-50 shadow-[0_0_0_1px_rgba(232,226,221,0.2)]'
                        : 'border border-[#b8b0aa] text-[#b8b0aa] hover:border-[1.5px] hover:border-text-on-dark hover:text-text-on-dark-hover hover:opacity-50 hover:shadow-[0_0_0_1px_rgba(232,226,221,0.2)]'
                    }`
                  : `inline-flex justify-center items-center font-body text-[0.88rem] font-semibold transition-all duration-200 border rounded-[5px] bg-transparent min-w-0 ${
                      downloadsOpen
                        ? 'border-[1.5px] border-text-on-dark text-text-on-dark-hover opacity-50 shadow-[0_0_0_1px_rgba(232,226,221,0.2)]'
                        : 'border border-[#b8b0aa] text-[#b8b0aa] hover:border-[1.5px] hover:border-text-on-dark hover:text-text-on-dark-hover hover:opacity-50 hover:shadow-[0_0_0_1px_rgba(232,226,221,0.2)]'
                    }`
              }
              style={isMobile ? { padding: '6px 12px' } : { padding: '6px 12px' }}
            >
              {isMobile ? (
                <>
                  <ArrowUp size={18} />
                  <span className="text-[10px] leading-none invisible">Share</span>
                </>
              ) : (
                'Download ↑'
              )}
            </button>
            {downloadsOpen && (
              <div
                ref={downloadMenuRef}
                className="absolute bottom-full mb-2 left-0 w-72 border border-border-gray-700 rounded-lg shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-3 space-y-2 bg-bg-menu-bar"
                style={{ zIndex: 60 }}
              >
                {downloadMenuRows.map(row => (
                  <div key={row.key} className="flex items-center gap-2">
                    <button
                      disabled={row.disabled}
                      onClick={row.onClick}
                      className={`flex-1 font-body text-sm font-semibold rounded-md transition-all duration-200 ${
                        row.disabled
                          ? 'text-text-on-dark-inactive bg-bg-gray-800 cursor-not-allowed'
                          : 'text-text-body bg-bg-card hover:bg-bg-card-alt'
                      }`}
                      style={{ padding: '8px 12px' }}
                    >
                      {row.left}
                    </button>
                    {row.right && (
                      <button
                        disabled={row.disabled}
                        onClick={row.onClick}
                        className={`flex-1 px-3 py-2 font-body text-sm font-semibold rounded-md transition-all duration-200 ${
                          row.disabled
                            ? 'text-text-on-dark-inactive bg-bg-gray-800 cursor-not-allowed'
                            : 'text-text-body bg-bg-card hover:bg-bg-card-alt'
                        }`}
                      >
                        {row.right}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="absolute right-[25px]">
          <div className="relative">
            <button
              ref={shareBtnRef}
              onClick={() => setShareOpen(prev => !prev)}
              className={
                isMobile
                  ? `flex flex-col items-center gap-1 font-body text-[0.88rem] font-semibold transition-all duration-200 border rounded-[5px] bg-transparent ${
                      shareOpen
                        ? 'border-[1.5px] border-text-on-dark text-text-on-dark-hover opacity-50 shadow-[0_0_0_1px_rgba(232,226,221,0.2)]'
                        : 'border border-[#b8b0aa] text-[#b8b0aa] hover:border-[1.5px] hover:border-text-on-dark hover:text-text-on-dark-hover hover:opacity-50 hover:shadow-[0_0_0_1px_rgba(232,226,221,0.2)]'
                    }`
                  : `inline-flex justify-center items-center font-body text-[0.88rem] font-semibold transition-all duration-200 border rounded-[5px] bg-transparent min-w-0 ${
                      shareOpen
                        ? 'border-[1.5px] border-text-on-dark text-text-on-dark-hover opacity-50 shadow-[0_0_0_1px_rgba(232,226,221,0.2)]'
                        : 'border border-[#b8b0aa] text-[#b8b0aa] hover:border-[1.5px] hover:border-text-on-dark hover:text-text-on-dark-hover hover:opacity-50 hover:shadow-[0_0_0_1px_rgba(232,226,221,0.2)]'
                    }`
              }
              style={{ paddingTop: '4px', paddingBottom: '4px', paddingLeft: '12px', paddingRight: '12px' }}
            >
              {isMobile ? (
                <>
                  <ArrowUpRight size={18} />
                  <span className="text-[10px] leading-none">Share</span>
                </>
              ) : (
                'Share ↗'
              )}
            </button>
            {shareOpen && (
              <div
                ref={shareMenuRef}
                className="absolute bottom-full mb-2 right-0 w-72 border border-border-gray-700 rounded-lg shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-3 space-y-2 bg-bg-menu-bar"
                style={{ zIndex: 60 }}
              >
                {shareMenuRows
                  .filter(row => row.visible)
                  .map(row => (
                    <button
                      key={row.key}
                      onClick={() => {
                        handleShareCopy(row.value)
                        setShareCopiedKey(row.key)
                      }}
                      className="w-full font-body text-sm font-semibold rounded-md transition-all duration-200 text-text-body bg-bg-card hover:bg-bg-card-alt text-left"
                      style={{ padding: '8px 12px' }}
                    >
                      {shareCopiedKey === row.key ? 'Link copied' : row.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2"
          ref={mainTabsRef}
        >
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              className="relative"
              whileTap={tapScale}
            >
              <button
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative font-ui text-sm font-semibold uppercase
                  transition-colors duration-300
                  ${activeTab === tab.id 
                    ? 'text-text-on-dark' 
                    : 'text-text-on-dark-inactive hover:text-text-on-dark-hover hover:opacity-80'
                  }
                `}
                style={{ padding: '8px 24px', letterSpacing: '0.05em' }}
              >
                {tab.label}
                
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 bg-accent-light"
                    style={{ height: '2px' }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 300, 
                      damping: 30 
                    }}
                  />
                )}
                {isTabLoading(tab.id) && (
                  <span className="ml-2 inline-block h-3 w-3 border-2 border-white/40 border-t-transparent rounded-full animate-spin align-middle" />
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div
          className={`flex items-center gap-2 absolute ${isMobile ? 'hidden' : ''}`}
          ref={collectionsRef}
          style={{ right: 'calc(50% + 180px)' }}
        >
          <AnimatePresence mode="popLayout">
            {collections.map((collection) => (
              <motion.div 
                key={collection.slug}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <motion.div
                  className="relative"
                  whileTap={tapScale}
                >
                  <button
                    onClick={() => onTabChange(collection.slug)}
                    className={`
                      relative font-ui text-sm font-semibold rounded-tl-lg rounded-bl-lg
                      transition-colors duration-300 z-10 bg-transparent
                      ${activeTab === collection.slug 
                        ? 'text-text-on-dark' 
                        : 'text-text-on-dark-inactive hover:text-text-on-dark-hover hover:opacity-80'
                      }
                    `}
                    style={{ padding: '8px 16px' }}
                  >
                    {activeTab === collection.slug && (
                      <motion.div
                        layoutId="activeCollectionUnderline"
                        className="absolute bottom-0 left-0 right-0 bg-accent-light"
                    style={{ height: '2px' }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 300, 
                          damping: 30 
                        }}
                      />
                    )}
                    {collection.name}
                    {isTabLoading(collection.slug) && (
                      <span className="ml-2 inline-block h-3 w-3 border-2 border-white/40 border-t-transparent rounded-full animate-spin align-middle" />
                    )}
                  </button>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onCollectionClose(collection.slug)}
                  className="text-[#f87171] hover:text-[#e8e2dd] hover:opacity-50 hover:bg-[rgba(220,38,38,0.2)] rounded-tr-lg rounded-br-lg transition-all duration-200"
                  style={{ padding: '8px 4px' }}
                >
                  ✕
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div
          className={`flex items-center gap-2 absolute ${isMobile ? 'hidden' : ''}`}
          ref={contentsRef}
          style={{ left: 'calc(50% + 180px)' }}
        >
          <AnimatePresence mode="popLayout">
            {contentTabs.map((content) => (
              <motion.div 
                key={content.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <motion.div
                  className="relative"
                  whileTap={tapScale}
                >
                  <button
                    onClick={() => onTabChange(content.id)}
                    className={`
                      relative font-ui text-sm font-semibold rounded-tl-lg rounded-bl-lg
                      transition-colors duration-300 z-10 bg-transparent
                      ${activeTab === content.id 
                        ? 'text-text-on-dark' 
                        : 'text-text-on-dark-inactive hover:text-text-on-dark-hover hover:opacity-80'
                      }
                    `}
                    style={{ padding: '8px 16px' }}
                  >
                    {activeTab === content.id && (
                      <motion.div
                        layoutId="activeContentUnderline"
                        className="absolute bottom-0 left-0 right-0 bg-accent-light"
                    style={{ height: '2px' }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 300, 
                          damping: 30 
                        }}
                      />
                    )}
                    {content.title}
                    {isTabLoading(content.id) && (
                      <span className="ml-2 inline-block h-3 w-3 border-2 border-white/40 border-t-transparent rounded-full animate-spin align-middle" />
                    )}
                  </button>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onContentClose(content.id)}
                  className="text-[#f87171] hover:text-[#e8e2dd] hover:opacity-50 hover:bg-[rgba(220,38,38,0.2)] rounded-tr-lg rounded-br-lg transition-all duration-200"
                  style={{ padding: '8px 4px' }}
                >
                  ✕
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
