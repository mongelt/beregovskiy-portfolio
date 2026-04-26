'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Profile, { ProfileRef } from '@/components/Profile'
import BottomTabBar from '@/components/BottomTabBar'
import ResumeTab from '@/components/tabs/ResumeTab'
import PortfolioContent from '@/components/tabs/PortfolioContent'
import MobileBanner from '@/components/MobileBanner'
import { createClient } from '@/lib/supabase/client'
import { generateArticlePDF, generateCollectionPDF } from '@/lib/pdf-generator'
import { PDFDocument } from 'pdf-lib'
import { useMobileState } from '@/lib/responsive'

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

export default function Home() {
  const supabase = createClient()
  const { isMobile } = useMobileState()
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
  const [portfolioContentDesc, setPortfolioContentDesc] = useState<string | null>(null)
  const [portfolioContentYear, setPortfolioContentYear] = useState<number | null>(null)
  const [portfolioContentThumbnail, setPortfolioContentThumbnail] = useState<string | null>(null)
  const [portfolioCollectionName, setPortfolioCollectionName] = useState<string | null>(null)
  const [portfolioCollectionSlug, setPortfolioCollectionSlug] = useState<string | null>(null)
  const [portfolioCollectionDesc, setPortfolioCollectionDesc] = useState<string | null>(null)
  const [portfolioCollectionThumbnails, setPortfolioCollectionThumbnails] = useState<string[]>([])
  const [resumeAvailable, setResumeAvailable] = useState<boolean>(false)
  const [resumeFocusEntryId, setResumeFocusEntryId] = useState<string | null>(null)
  const [resumeNowMarkerVisible, setResumeNowMarkerVisible] = useState<boolean>(true)
  const [resumeHasExpandedSideEntry, setResumeHasExpandedSideEntry] = useState<boolean>(false)
  const [portfolioMenuExpanded, setPortfolioMenuExpanded] = useState<boolean>(true)
  // State memory for Portfolio tab to persist across remounts
  const [savedPortfolioMenuState, setSavedPortfolioMenuState] = useState<{
    pageState: 'expanded-empty' | 'expanded-reader' | 'collapsed-reader' | null
    contentId: string | null
    categoryId: string | null
    subcategoryId: string | null
  }>({ pageState: null, contentId: null, categoryId: null, subcategoryId: null })
  // Externally-activated content/collection for the new menu (Stage 18).
  // When new menu is active on desktop, external triggers (BlockNote, Resume side cards,
  // shared URLs) activate items inside the menu instead of opening legacy tabs.
  const [externalMenuContentId, setExternalMenuContentId] = useState<string | null>(null)
  const [externalMenuCollectionSlug, setExternalMenuCollectionSlug] = useState<string | null>(null)
  // Portfolio nav scenario triggers (desktop only).
  const [portfolioToggleTrigger, setPortfolioToggleTrigger] = useState(0)
  const [portfolioExpandTrigger, setPortfolioExpandTrigger] = useState(0)
  const [externalMenuCardSelect, setExternalMenuCardSelect] = useState<{ id: string; type: 'category' | 'subcategory' | 'collection' } | null>(null)

  const profileRef = useRef<ProfileRef>(null)
  const urlAppliedRef = useRef(false)
  const lastDownloadContextRef = useRef<{
    contentTitle: string | null
    contentId: string | null
    contentType: string | null
    downloadEnabled: boolean | null
    contentDesc: string | null
    contentYear: number | null
    contentThumbnail: string | null
    collectionName: string | null
    collectionSlug: string | null
    collectionDesc: string | null
    collectionThumbnails: string[]
  } | null>(null)

  const handleDownloadContextChange = useCallback(({
    contentTitle,
    contentId,
    contentType,
    downloadEnabled,
    contentDesc,
    contentYear,
    contentThumbnail,
    collectionName,
    collectionSlug,
    collectionDesc,
    collectionThumbnails,
  }: {
    contentTitle: string | null
    contentId: string | null
    contentType: string | null
    downloadEnabled: boolean | null
    contentDesc: string | null
    contentYear: number | null
    contentThumbnail: string | null
    collectionName: string | null
    collectionSlug: string | null
    collectionDesc: string | null
    collectionThumbnails: string[]
  }) => {
    const prev = lastDownloadContextRef.current
    if (
      prev &&
      prev.contentTitle === contentTitle &&
      prev.contentId === contentId &&
      prev.contentType === contentType &&
      prev.downloadEnabled === downloadEnabled &&
      prev.contentDesc === contentDesc &&
      prev.contentYear === contentYear &&
      prev.contentThumbnail === contentThumbnail &&
      prev.collectionName === collectionName &&
      prev.collectionSlug === collectionSlug &&
      prev.collectionDesc === collectionDesc &&
      prev.collectionThumbnails.length === collectionThumbnails.length &&
      prev.collectionThumbnails.every((t, i) => t === collectionThumbnails[i])
    ) {
      return
    }
    lastDownloadContextRef.current = { contentTitle, contentId, contentType, downloadEnabled, contentDesc, contentYear, contentThumbnail, collectionName, collectionSlug, collectionDesc, collectionThumbnails }

    setPortfolioContentTitle(contentTitle)
    setPortfolioContentId(contentId)
    setPortfolioContentType(contentType)
    setPortfolioContentDownloadEnabled(downloadEnabled)
    setPortfolioContentDesc(contentDesc)
    setPortfolioContentYear(contentYear)
    setPortfolioContentThumbnail(contentThumbnail)
    setPortfolioCollectionName(collectionName)
    setPortfolioCollectionSlug(collectionSlug)
    setPortfolioCollectionDesc(collectionDesc)
    setPortfolioCollectionThumbnails(collectionThumbnails)

    if (contentId) {
      setActiveContents(prevTabs =>
        prevTabs.map(tab => tab.id === contentId && tab.title !== contentTitle && contentTitle
          ? { ...tab, title: contentTitle }
          : tab
        )
      )
    }
  }, [])

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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    getLinkedPdfId('resume', null).then(id => setResumeAvailable(!!id))
  }, [])

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
        if (!isMobile) {
          setExternalMenuContentId(contentId)
          setActiveTab('portfolio')
        } else {
          setActiveContents(prev => {
            if (prev.find(c => c.id === contentId)) return prev
            return [...prev, { id: contentId, title: 'Loading…' }]
          })
          setActiveTab(contentId)
        }
      }

      if (collectionSlug) {
        if (!isMobile) {
          setExternalMenuCollectionSlug(collectionSlug)
          setActiveTab('portfolio')
        } else {
          setActiveCollections(prev => {
            if (prev.find(c => c.slug === collectionSlug)) return prev
            return [...prev, { slug: collectionSlug, name: collectionSlug }]
          })
          setActiveTab(collectionSlug)
        }
      }
    } catch (err) {
      console.error('Failed to apply URL params', err)
    }
  }, [mounted])

  // Step 0: Toggle body.menu-expanded class when menu expands
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (portfolioMenuExpanded) {
      document.body.classList.add('menu-expanded')
    } else {
      document.body.classList.remove('menu-expanded')
    }
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('menu-expanded')
    }
  }, [portfolioMenuExpanded])

  const handleTabChange = (tab: string) => {
    // Collapse profile whenever Portfolio or Resume is clicked
    if ((tab === 'portfolio' || tab === 'resume') && profileRef.current) {
      profileRef.current.collapse()
    }
    setActiveTab(tab)
    setSelectedContentId(null)
    // Scenario 1: already on portfolio tab → trigger toggle instead of full re-navigation
    if (tab === 'portfolio' && activeTab === 'portfolio' && !isMobile) {
      setPortfolioToggleTrigger(n => n + 1)
    }
  }

  // Scenario 2: profile portfolio plane click — always expands, never collapses.
  const handleSwitchToPortfolio = () => {
    setActiveTab('portfolio')
    if (!isMobile) setPortfolioExpandTrigger(n => n + 1)
  }

  const handleCollectionClose = (slug: string) => {
    setActiveCollections(prev => prev.filter(c => c.slug !== slug))
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
    if (!isMobile) {
      setExternalMenuCollectionSlug(slug)
      setActiveTab('portfolio')
      return
    }
    // Mobile: open collection tab
    if (!activeCollections.find(c => c.slug === slug)) {
      setActiveCollections(prev => [...prev, { slug, name }])
    }
    setActiveTab(slug)
  }

  const handleOpenContent = (id: string, title: string) => {
    // Mobile from Resume tab: switch to Portfolio and auto-select content
    if (isMobile && activeTab === 'resume') {
      setSelectedContentId(id)
      setTimeout(() => {
        setActiveTab('portfolio')
      }, 0)
      return
    }

    // Desktop: activate content inside the menu (opens reader + collapsed bar)
    if (!isMobile) {
      setExternalMenuContentId(id)
      setActiveTab('portfolio')
      return
    }

    // Mobile: open content in its own tab
    if (!activeContents.find(c => c.id === id)) {
      setActiveContents(prev => [...prev, { id, title }])
    }
    setActiveTab(id)
  }

  const handleCollectionClick = (collection: { id: string; slug: string; name: string }) => {
    handleOpenCollection(collection.slug, collection.name)
  }

  // Listen for tab-open events dispatched by Button blocks in renderer mode.
  // Using refs so the listener is registered only once but always calls the
  // latest version of each handler.
  const openCollectionRef = useRef(handleOpenCollection)
  openCollectionRef.current = handleOpenCollection
  const openContentRef = useRef(handleOpenContent)
  openContentRef.current = handleOpenContent

  useEffect(() => {
    const onOpenCollection = (e: Event) => {
      const { slug, name } = (e as CustomEvent<{ slug: string; name: string }>).detail
      openCollectionRef.current(slug, name)
    }
    const onOpenContent = (e: Event) => {
      const { id, title } = (e as CustomEvent<{ id: string; title: string }>).detail
      openContentRef.current(id, title)
    }
    window.addEventListener('bn-button-open-collection', onOpenCollection)
    window.addEventListener('bn-button-open-content', onOpenContent)
    return () => {
      window.removeEventListener('bn-button-open-collection', onOpenCollection)
      window.removeEventListener('bn-button-open-content', onOpenContent)
    }
  }, [])

  async function fetchResumePdfBlob(): Promise<Blob | null> {
    const resumePdfId = await getLinkedPdfId('resume', null)
    if (!resumePdfId) return null
    const { data } = await supabase.from('custom_pdfs').select('file_url').eq('id', resumePdfId).single()
    if (!data?.file_url) return null
    try {
      const res = await fetch(data.file_url)
      if (!res.ok) return null
      return res.blob()
    } catch {
      return null
    }
  }

  async function mergePdfs(mainBlob: Blob, resumeBlob: Blob): Promise<Blob> {
    const [mainBytes, resumeBytes] = await Promise.all([
      mainBlob.arrayBuffer(),
      resumeBlob.arrayBuffer(),
    ])
    // Resume goes first, content follows
    const resumeDoc = await PDFDocument.load(resumeBytes)
    const mainDoc = await PDFDocument.load(mainBytes)
    const copiedPages = await resumeDoc.copyPages(mainDoc, mainDoc.getPageIndices())
    copiedPages.forEach(page => resumeDoc.addPage(page))
    const mergedBytes = await resumeDoc.save()
    return new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  }

  async function handleDownload(target: 'resume' | 'content' | 'collection', includeResume = false) {
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
        if (includeResume) {
          const { data: customPdf } = await supabase.from('custom_pdfs').select('file_url, file_name').eq('id', linkedPdfId).single()
          if (customPdf?.file_url) {
            const [mainRes, resumeBlob] = await Promise.all([fetch(customPdf.file_url), fetchResumePdfBlob()])
            if (mainRes.ok && resumeBlob) {
              const merged = await mergePdfs(await mainRes.blob(), resumeBlob)
              const safeName = (data.title || 'content').replace(/[^a-z0-9]/gi, '_')
              downloadBlob(merged, `AndreyBeregovskiy_${safeName}_with_resume.pdf`)
              return
            }
          }
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
        if (includeResume) {
          const resumeBlob = await fetchResumePdfBlob()
          if (resumeBlob) {
            const merged = await mergePdfs(blob, resumeBlob)
            downloadBlob(merged, `AndreyBeregovskiy_${safeName}_with_resume.pdf`)
            return
          }
        }
        downloadBlob(blob, `AndreyBeregovskiy_${safeName}.pdf`)
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
      const collSlug = activeCollection?.slug || portfolioCollectionSlug
      const collDisplayName = activeCollection?.name || portfolioCollectionName
      if (!collSlug) {
        throw new Error('No collection selected')
      }
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('id, name')
        .eq('slug', collSlug)
        .single()
      if (collectionError || !collectionData) {
        throw new Error('Collection not found')
      }
      const linkedPdfId = await getLinkedPdfId('collection', collectionData.id)
      if (linkedPdfId) {
        if (includeResume) {
          const { data: customPdf } = await supabase.from('custom_pdfs').select('file_url').eq('id', linkedPdfId).single()
          if (customPdf?.file_url) {
            const [mainRes, resumeBlob] = await Promise.all([fetch(customPdf.file_url), fetchResumePdfBlob()])
            if (mainRes.ok && resumeBlob) {
              const collectionName = collectionData.name || collDisplayName || 'Collection'
              const safeName = collectionName.replace(/[^a-z0-9]/gi, '_') || 'Collection'
              const merged = await mergePdfs(await mainRes.blob(), resumeBlob)
              downloadBlob(merged, `AndreyBeregovskiy_${safeName}_with_resume.pdf`)
              return
            }
          }
        }
        const didDownload = await downloadCustomPdfById(linkedPdfId)
        if (didDownload) return
      }
      const collectionName = collectionData.name || collDisplayName || 'Collection'
      const safeName = collectionName.replace(/[^a-z0-9]/gi, '_') || 'Collection'
      const blob = await generateCollectionPDF(collSlug)
      if (includeResume) {
        const resumeBlob = await fetchResumePdfBlob()
        if (resumeBlob) {
          const merged = await mergePdfs(blob, resumeBlob)
          downloadBlob(merged, `AndreyBeregovskiy_${safeName}_with_resume.pdf`)
          return
        }
      }
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

  const isPortfolioOrCollection = activeTab === 'portfolio' || (!['portfolio', 'resume'].includes(activeTab) && !activeContents.find(c => c.id === activeTab))

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
            focusEntryId={resumeFocusEntryId}
          />
        )
      
      case 'portfolio':
      default:
        return (
          <PortfolioContent
            activeTab={activeTab}
            activeCollections={activeCollections}
            activeContents={activeContents}
            onCollectionClick={handleCollectionClick}
            profileHeight={profileHeight}
            onDownloadContextChange={handleDownloadContextChange}
            onMenuExpandedChange={setPortfolioMenuExpanded}
            selectedContentIdFromResume={selectedContentId}
            onContentSelectedFromResume={() => setSelectedContentId(null)}
            externalActiveContentId={externalMenuContentId}
            externalActiveCollectionSlug={externalMenuCollectionSlug}
            savedMenuState={savedPortfolioMenuState.pageState}
            savedSelectedContentId={savedPortfolioMenuState.contentId}
            savedSelectedCategoryId={savedPortfolioMenuState.categoryId}
            savedSelectedSubcategoryId={savedPortfolioMenuState.subcategoryId}
            onSaveMenuState={(state) => {
              setSavedPortfolioMenuState(state)
            }}
            portfolioToggleTrigger={portfolioToggleTrigger}
            portfolioExpandTrigger={portfolioExpandTrigger}
            externalMenuCardSelect={externalMenuCardSelect}
            onExternalMenuCardSelectConsumed={() => setExternalMenuCardSelect(null)}
            onExternalContentConsumed={() => setExternalMenuContentId(null)}
            onExternalCollectionConsumed={() => setExternalMenuCollectionSlug(null)}
          />
        )
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-main)' }}>
      <Profile
        ref={profileRef}
        onHeightChange={setProfileHeight}
        onOpenCollection={handleOpenCollection}
        condensedMode={shouldCondenseProfile}
        onSwitchToPortfolio={handleSwitchToPortfolio}
        onSwitchToResume={(entryId?: string) => { setResumeFocusEntryId(entryId ?? null); handleTabChange('resume') }}
        onCardSelect={!isMobile ? (id, type) => { setActiveTab('portfolio'); setExternalMenuCardSelect({ id, type }) } : undefined}
      />

      {isPortfolioOrCollection ? (
        renderContent()
      ) : (
        <div className="flex-1 flex" style={{ paddingBottom: '96px' }}>
          <div className="w-full p-8">
            {renderContent()}
          </div>
        </div>
      )}

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
        currentContentDesc={portfolioContentDesc}
        currentContentYear={portfolioContentYear}
        currentContentThumbnail={portfolioContentThumbnail}
        currentCollectionName={activeCollection?.name || portfolioCollectionName || null}
        currentCollectionSlug={activeCollection?.slug || portfolioCollectionSlug || null}
        currentCollectionDesc={portfolioCollectionDesc}
        currentCollectionThumbnails={portfolioCollectionThumbnails}
        resumeAvailable={resumeAvailable}
        onDownload={handleDownload}
        isMenuExpanded={portfolioMenuExpanded}
      />

      {/* Step 6: Mobile first-load banner */}
      <MobileBanner />
    </div>
  )
}

