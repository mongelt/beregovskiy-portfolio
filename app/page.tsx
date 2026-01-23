'use client'

import { useState, useEffect, useRef } from 'react'
import Profile from '@/components/Profile'
import ContentViewer from '@/components/ContentViewer'
import BottomTabBar from '@/components/BottomTabBar'
import ResumeTab from '@/components/tabs/ResumeTab'
import PortfolioContent from '@/components/tabs/PortfolioContent'
import DownloadsTab from '@/components/tabs/DownloadsTab'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { generateArticlePDF, generateCollectionPDF } from '@/lib/pdf-generator'

type Collection = {
  slug: string
  name: string
}

type ContentTab = {
  id: string
  title: string
}

const isCollectionTab = (tab: string, collections: Collection[]) =>
  collections.some(c => c.slug === tab)

const STORAGE_KEY = 'bottomNavState'

export default function Home() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<string>('portfolio')
  const [activeCollections, setActiveCollections] = useState<Collection[]>([])
  const [activeContents, setActiveContents] = useState<ContentTab[]>([])
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [profileHeight, setProfileHeight] = useState<number>(0)
  const [portfolioContentTitle, setPortfolioContentTitle] = useState<string | null>(null)
  const [portfolioContentId, setPortfolioContentId] = useState<string | null>(null)
  const [portfolioContentType, setPortfolioContentType] = useState<string | null>(null)
  const [portfolioContentDownloadEnabled, setPortfolioContentDownloadEnabled] = useState<boolean | null>(null)
  const [resumeNowMarkerVisible, setResumeNowMarkerVisible] = useState<boolean>(true)
  const [resumeHasExpandedSideEntry, setResumeHasExpandedSideEntry] = useState<boolean>(false)
  const [portfolioMenuExpanded, setPortfolioMenuExpanded] = useState<boolean>(true)
  const urlAppliedRef = useRef(false)
  const lastDownloadContextRef = useRef<{
    contentTitle: string | null
    contentId: string | null
    contentType: string | null
    downloadEnabled: boolean | null
  } | null>(null)

  const activeContent = activeContents.find(c => c.id === activeTab) || null
  const activeCollection = activeCollections.find(c => c.slug === activeTab) || null
  const isActiveContentTab = activeContents.some(c => c.id === activeTab)
  const currentContentTitle =
    activeContent?.title ||
    ((activeTab === 'portfolio' || isCollectionTab(activeTab, activeCollections)) && !portfolioMenuExpanded
      ? portfolioContentTitle
      : null)
  const currentContentId =
    activeContent?.id ||
    (activeTab === 'portfolio' || isCollectionTab(activeTab, activeCollections)
      ? portfolioContentId
      : null)
  const currentContentType =
    portfolioContentType
  const isPortfolioLikeTab = activeTab === 'portfolio' || isCollectionTab(activeTab, activeCollections) || isActiveContentTab
  const shouldCondenseProfile =
    (isPortfolioLikeTab && !portfolioMenuExpanded) ||
    (activeTab === 'resume' && (!resumeNowMarkerVisible || resumeHasExpandedSideEntry))

  // Prevent flash on initial load
  useEffect(() => {
    setMounted(true)
  }, [])

  // Restore tab state from localStorage
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      const savedCollections: Collection[] = Array.isArray(parsed?.activeCollections) ? parsed.activeCollections : []
      const savedContents: ContentTab[] = Array.isArray(parsed?.activeContents) ? parsed.activeContents : []
      const savedActiveTab: string | null = typeof parsed?.activeTab === 'string' ? parsed.activeTab : null
      if (savedCollections.length) setActiveCollections(savedCollections)
      if (savedContents.length) setActiveContents(savedContents)
      if (savedActiveTab) setActiveTab(savedActiveTab)
    } catch (err) {
      console.error('Failed to restore tab state from localStorage', err)
    }
  }, [mounted])

  // Apply URL parameters once on load (content/collection/resume)
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    if (urlAppliedRef.current) return
    urlAppliedRef.current = true
    try {
      const url = new URL(window.location.href)
      const tab = url.searchParams.get('tab')
      const contentId = url.searchParams.get('content')
      const collectionSlug = url.searchParams.get('collection')

      if (tab === 'resume') {
        setActiveTab('resume')
      }

      if (contentId) {
        setActiveContents(prev => {
          if (prev.find(c => c.id === contentId)) return prev
          return [...prev, { id: contentId, title: 'Loading…' }]
        })
        setActiveTab(contentId)
      }

      if (collectionSlug) {
        setActiveCollections(prev => {
          if (prev.find(c => c.slug === collectionSlug)) return prev
          return [...prev, { slug: collectionSlug, name: collectionSlug }]
        })
        setActiveTab(collectionSlug)
      }
    } catch (err) {
      console.error('Failed to apply URL params', err)
    }
  }, [mounted])

  // Persist tab state to localStorage
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    try {
      const payload = {
        activeCollections,
        activeContents,
        activeTab
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (err) {
      console.error('Failed to save tab state to localStorage', err)
    }
  }, [activeCollections, activeContents, activeTab, mounted])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Clear selected content when switching tabs
    setSelectedContentId(null)
  }

  const handleCollectionClose = (slug: string) => {
    setActiveCollections(prev => prev.filter(c => c.slug !== slug))
    // If we're currently viewing this collection, switch to portfolio
    if (activeTab === slug) {
      setActiveTab('portfolio')
    }
  }

  const handleContentClose = (id: string) => {
    setActiveContents(prev => prev.filter(c => c.id !== id))
    if (activeTab === id) {
      setActiveTab('resume')
    }
  }

  const handleOpenCollection = (slug: string, name: string) => {
    // Check if collection is already open
    if (!activeCollections.find(c => c.slug === slug)) {
      setActiveCollections(prev => [...prev, { slug, name }])
    }
    // Switch to this collection tab
    setActiveTab(slug)
  }

  // Placeholder for future Active Content opening (Phase 3 will call this)
  const handleOpenContent = (id: string, title: string) => {
    if (!activeContents.find(c => c.id === id)) {
      setActiveContents(prev => [...prev, { id, title }])
    }
    setActiveTab(id)
  }

  // Handle collection click from PortfolioContent
  // PortfolioContent passes full Collection object, we extract slug and name
  const handleCollectionClick = (collection: { id: string; slug: string; name: string }) => {
    handleOpenCollection(collection.slug, collection.name)
  }

  async function handleDownload(target: 'resume' | 'content' | 'collection') {
    const downloadBlob = (blob: Blob, name: string) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    if (target === 'content') {
      const contentId = currentContentId
      if (!contentId) {
        throw new Error('No content selected')
      }
      const { data, error } = await supabase
        .from('content')
        .select('id, title, type, download_enabled, download_source, external_download_url, custom_pdf_id, image_url, video_url, audio_url')
        .eq('id', contentId)
        .single()
      if (error || !data) {
        throw new Error('Failed to load content download settings')
      }
      if (!data.download_enabled) {
        alert('Downloads are disabled for this content.')
        return
      }

      const resolvedSource =
        data.download_source ||
        (data.custom_pdf_id ? 'custom' : data.external_download_url ? 'external' : 'generated')

      if (resolvedSource === 'external') {
        if (!data.external_download_url) {
          alert('External download link is missing.')
          return
        }
        window.open(data.external_download_url, '_blank')
        return
      }

      if (resolvedSource === 'custom') {
        const customPdfId = data.custom_pdf_id || null
        const linkedPdfId = customPdfId || (await getLinkedPdfId('content', contentId))
        if (!linkedPdfId) {
          alert('Custom PDF is not set.')
          return
        }
        const didDownload = await downloadCustomPdfById(linkedPdfId)
        if (!didDownload) {
          throw new Error('Custom PDF not found')
        }
        return
      }

      if (data.type === 'article') {
        const blob = await generateArticlePDF(contentId)
        const safeName = (data.title || 'content').replace(/[^a-z0-9]/gi, '_')
        const filename = `AndreyBeregovskiy_${safeName}.pdf`
        downloadBlob(blob, filename)
        return
      }

      const mediaUrl = data.image_url || data.video_url || data.audio_url
      if (mediaUrl) {
        const link = document.createElement('a')
        link.href = mediaUrl
        link.download = data.title || 'content'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      return
    }

    if (target === 'resume') {
      const safeName = 'AndreyBeregovskiy_Resume'
      const resumePdfId = await getLinkedPdfId('resume', null)
      if (resumePdfId) {
        const didDownload = await downloadCustomPdfById(resumePdfId)
        if (didDownload) return
      }
      const placeholder = new Blob(
        ['Resume PDF generation is not implemented yet.'],
        { type: 'application/pdf' }
      )
      downloadBlob(placeholder, `${safeName}.pdf`)
      return
    }

    if (target === 'collection') {
      if (!activeCollection?.slug) {
        throw new Error('No collection selected')
      }
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('id, name')
        .eq('slug', activeCollection.slug)
        .single()
      if (collectionError || !collectionData) {
        throw new Error('Collection not found')
      }
      const linkedPdfId = await getLinkedPdfId('collection', collectionData.id)
      if (linkedPdfId) {
        const didDownload = await downloadCustomPdfById(linkedPdfId)
        if (didDownload) return
      }
      const collectionName = collectionData.name || activeCollection.name || 'Collection'
      const safeName = collectionName.replace(/[^a-z0-9]/gi, '_') || 'Collection'
      const blob = await generateCollectionPDF(activeCollection.slug)
      downloadBlob(blob, `AndreyBeregovskiy_${safeName}.pdf`)
      return
    }
  }

  async function getLinkedPdfId(targetType: 'content' | 'collection' | 'resume', targetId: string | null) {
    const query = supabase
      .from('custom_pdf_links')
      .select('pdf_id')
      .eq('target_type', targetType)
      .limit(1)
    if (targetId) {
      query.eq('target_id', targetId)
    } else {
      query.is('target_id', null)
    }
    const { data, error } = await query
    if (error) {
      if (error.code === '42P01') {
        return null
      }
      console.error('Failed to load custom PDF link', error)
      return null
    }
    return data?.[0]?.pdf_id || null
  }

  async function downloadCustomPdfById(pdfId: string) {
    const { data: customPdf, error } = await supabase
      .from('custom_pdfs')
      .select('file_url, file_name')
      .eq('id', pdfId)
      .single()
    if (error || !customPdf) {
      return false
    }
    const link = document.createElement('a')
    link.href = customPdf.file_url
    link.download = customPdf.file_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return true
  }

  // Check if current tab is portfolio or collection tab
  const isPortfolioOrCollection = activeTab === 'portfolio' || (!['portfolio', 'resume', 'downloads'].includes(activeTab) && !activeContents.find(c => c.id === activeTab))

  const renderContent = () => {
    switch (activeTab) {
      case 'resume':
        return (
          <ResumeTab
            onOpenCollection={handleOpenCollection}
            onOpenContent={handleOpenContent}
            profileHeight={profileHeight}
            onNowMarkerInViewChange={setResumeNowMarkerVisible}
            onSideEntryExpandedChange={setResumeHasExpandedSideEntry}
          />
        )
      
      case 'downloads':
        return <DownloadsTab />
      
      case 'portfolio':
      default:
        // Portfolio or collection tab - use PortfolioContent component
        return (
          <PortfolioContent
            activeTab={activeTab}
            activeCollections={activeCollections}
            activeContents={activeContents}
            onCollectionClick={handleCollectionClick}
            profileHeight={profileHeight}
            onDownloadContextChange={({ contentTitle, contentId, contentType, downloadEnabled }) => {
              const prev = lastDownloadContextRef.current
              if (
                prev &&
                prev.contentTitle === contentTitle &&
                prev.contentId === contentId &&
                prev.contentType === contentType &&
                prev.downloadEnabled === downloadEnabled
              ) {
                return
              }
              lastDownloadContextRef.current = { contentTitle, contentId, contentType, downloadEnabled }

              setPortfolioContentTitle(contentTitle)
              setPortfolioContentId(contentId)
              setPortfolioContentType(contentType)
              setPortfolioContentDownloadEnabled(downloadEnabled)
              if (contentId) {
                setActiveContents(prev =>
                  prev.map(tab => tab.id === contentId && tab.title !== contentTitle && contentTitle
                    ? { ...tab, title: contentTitle }
                    : tab
                  )
                )
              }
            }}
            onMenuExpandedChange={setPortfolioMenuExpanded}
          />
        )
    }
  }

  // Don't render until mounted to prevent flash
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex flex-col">
      {/* Fixed Business Card Header */}
      <Profile
        onHeightChange={setProfileHeight}
        onOpenCollection={handleOpenCollection}
        condensedMode={shouldCondenseProfile}
      />

      {/* Main Content Area */}
      {/* PortfolioContent handles its own layout (no padding wrapper needed) */}
      {isPortfolioOrCollection ? (
        renderContent()
      ) : (
        <div className="flex-1 flex pb-24">
          <div className="w-full p-8">
            {renderContent()}
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        collections={activeCollections}
        contentTabs={activeContents}
        onTabChange={handleTabChange}
        onCollectionClose={handleCollectionClose}
        onContentClose={handleContentClose}
        currentContentTitle={currentContentTitle}
        currentContentType={portfolioContentType}
        currentContentId={currentContentId}
        currentContentDownloadEnabled={portfolioContentDownloadEnabled}
        currentCollectionName={activeCollection?.name || null}
        currentCollectionSlug={activeCollection?.slug || null}
        onDownload={handleDownload}
        isMenuExpanded={portfolioMenuExpanded}
      />
    </div>
  )
}

