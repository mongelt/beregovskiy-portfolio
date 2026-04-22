'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import BlockNoteRenderer from '@/components/BlockNoteRendererDynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useMobileState } from '@/lib/responsive'
import { BOTTOM_NAV_HEIGHT_PX } from '@/lib/constants'
import { ProfilePlanes, type ProfileNavCard, type ProfileResumeCard } from '@/components/ProfilePlanes'

type ProfileData = {
  full_name: string | null
  location: string | null
  job_title_1: string | null
  job_title_2: string | null
  job_title_3: string | null
  job_title_4: string | null
  profile_image: string | null
  short_bio: any
  full_bio: any
  full_bio_image_sizes?: Record<string, { width?: number; height?: number }>
  email: string | null
  phone: string | null
  linkedin: string | null
  show_email: boolean
  show_phone: boolean
  show_social_media: boolean
  skills: string[] | null
  languages: string[] | null
  education: string | null
  jhu_entry_id: string | null
  collapsed_profile_height: number | null
  portfolio_plane_cards: Array<{ type: string; id: string }> | null
  resume_plane_cards: string[] | null
}

type ProfileSkill = {
  id: string
  skillName: string
  collectionSlug: string | null
  collectionName: string | null
}

interface ProfileProps {
  onHeightChange?: (height: number) => void
  onOpenCollection?: (slug: string, name: string) => void
  condensedMode?: boolean
  onSwitchToPortfolio?: () => void
  onSwitchToResume?: (entryId?: string) => void
}

export interface ProfileRef {
  collapse: () => void
}

// Helper function to check if data is in EditorJS format (has .blocks property)
function isEditorJSFormat(data: any): boolean {
  return data && typeof data === 'object' && 'blocks' in data && Array.isArray(data.blocks)
}

// Helper function to check if data is in BlockNote format (array of PartialBlock)
function isBlockNoteFormat(data: any): boolean {
  return Array.isArray(data) && data.length > 0 && data.every((block: any) => block && typeof block === 'object' && 'id' in block && 'type' in block)
}

// Simple renderer for short bio that pre-renders content immediately to avoid loading delay
function ShortBioRenderer({ data }: { data: any }) {
  // Memoize the check to prevent switching between renderers
  const shouldUseSimpleRender = useMemo(() => {
    // Handle missing or invalid data
    if (!data) return false
    
    // Check if EditorJS format
    if (isEditorJSFormat(data)) {
      if (!data.blocks || !Array.isArray(data.blocks) || data.blocks.length === 0) {
        return false
      }
      // Check if all blocks are simple paragraphs
      return data.blocks.every((block: any) => {
        return block && block.type === 'paragraph' && block.data && typeof block.data.text === 'string'
      })
    }
    
    // Check if BlockNote format
    if (isBlockNoteFormat(data)) {
      // Check if all blocks are simple paragraphs
      return data.every((block: any) => {
        return block && block.type === 'paragraph' && block.content && Array.isArray(block.content)
      })
    }
    
    return false
  }, [data])
  
  // Memoize the rendered paragraphs to prevent re-rendering
  const simpleContent = useMemo(() => {
    if (!shouldUseSimpleRender || !data) return null
    
    let paragraphs: any[] = []
    
    // Handle EditorJS format
    if (isEditorJSFormat(data) && data.blocks) {
      paragraphs = data.blocks
        .map((block: any, index: number) => {
          const text = block.data?.text || ''
          const htmlText = text.replace(/&nbsp;/g, ' ').trim()
          if (!htmlText) return null
          return <p key={index} dangerouslySetInnerHTML={{ __html: htmlText }} />
        })
        .filter(Boolean)
    }
    
    // Handle BlockNote format
    if (isBlockNoteFormat(data)) {
      paragraphs = data
        .map((block: any, index: number) => {
          if (block.type === 'paragraph' && block.content && Array.isArray(block.content)) {
            const textContent = block.content
              .map((item: any) => {
                if (item.type === 'text') return item.text || ''
                return ''
              })
              .join('')
            const htmlText = textContent.replace(/&nbsp;/g, ' ').trim()
            if (!htmlText) return null
            return <p key={index} dangerouslySetInnerHTML={{ __html: htmlText }} />
          }
          return null
        })
        .filter(Boolean)
    }
    
    return paragraphs.length > 0 ? paragraphs : null
  }, [shouldUseSimpleRender, data])
  
  // For simple paragraph-only content, render directly without BlockNote renderer
  // This eliminates any loading delay or layout shift
  if (simpleContent) {
    return <div>{simpleContent}</div>
  }
  
  // For complex content, use BlockNoteRenderer if BlockNote format
  if (isBlockNoteFormat(data)) {
    return <BlockNoteRenderer data={data} />
  }
  
  // For any other format (should not occur now), render nothing
  return null
}

const Profile = forwardRef<ProfileRef, ProfileProps>(({
  onHeightChange,
  onOpenCollection,
  condensedMode = false,
  onSwitchToPortfolio,
  onSwitchToResume,
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(true) // CRITICAL: Redesign - expanded by default
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [skills, setSkills] = useState<ProfileSkill[]>([])
  const [headerHovered, setHeaderHovered] = useState(false)
  const [portfolioCardData, setPortfolioCardData] = useState<ProfileNavCard[]>([])
  const [resumeCardData, setResumeCardData] = useState<ProfileResumeCard[]>([])
  const supabase = createClient()
  const headerRef = useRef<HTMLElement | null>(null)
  const resizeDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { isMobile } = useMobileState()

  // Expose collapse method via ref
  useImperativeHandle(ref, () => ({
    collapse: () => {
      setIsExpanded(false)
    }
  }))

  useEffect(() => {
    loadProfile().then(fetchPlaneCardData)
  }, [])

  useEffect(() => {
    if (!onHeightChange) return
    if (!profile) return // Don't measure if profile hasn't loaded yet

    const element = headerRef.current
    if (!element) {
      return
    }

    const updateHeight = () => {
      const rect = element.getBoundingClientRect()
      const height = rect.height
      onHeightChange(height)
    }

    const timeoutId = setTimeout(() => {
      updateHeight()
    }, 0)

    // Determine if we're transitioning to condensed mode
    const isCondensed = condensedMode && !isExpanded
    // Use shorter debounce (0ms) when transitioning to condensed for immediate menu bar positioning
    // Use normal debounce (100ms) for other transitions to prevent rapid re-renders
    const debounceDelay = isCondensed ? 0 : 100

    const resizeObserver = new ResizeObserver(() => {
      // Debounce ResizeObserver callbacks to prevent rapid re-renders
      // Clear any existing timer
      if (resizeDebounceTimerRef.current) {
        clearTimeout(resizeDebounceTimerRef.current)
      }
      // Set timer with delay based on condensed state
      resizeDebounceTimerRef.current = setTimeout(() => {
        updateHeight()
        resizeDebounceTimerRef.current = null
      }, debounceDelay)
    })

    resizeObserver.observe(element)

    // When condensedMode changes, trigger immediate height update after a brief delay
    // This ensures menu bar position updates quickly when transitioning to condensed
    // The delay accounts for the CSS transition starting (requestAnimationFrame ensures DOM has updated)
    if (condensedMode !== undefined) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateHeight()
        })
      })
    }

    return () => {
      clearTimeout(timeoutId)
      if (resizeDebounceTimerRef.current) {
        clearTimeout(resizeDebounceTimerRef.current)
        resizeDebounceTimerRef.current = null
      }
      resizeObserver.disconnect()
    }
  }, [onHeightChange, profile, isExpanded, condensedMode]) // Added condensedMode to dependencies for immediate reaction


  async function loadProfile(): Promise<ProfileData | null> {
    const { data } = await supabase
      .from('profile')
      .select('*')
      .limit(1)
      .single()

    if (data) {
      setProfile(data)
      const { data: skillRows } = await supabase
        .from('profile_skills')
        .select('id, skill_name, collection_id, collections:collection_id (slug, name)')
        .eq('profile_id', data.id)
        .order('order_index', { ascending: true })

      if (skillRows) {
        const mapped: ProfileSkill[] = skillRows.map((row: any) => ({
          id: row.id,
          skillName: row.skill_name ?? '',
          collectionSlug: row.collections?.slug ?? null,
          collectionName: row.collections?.name ?? null
        }))
        setSkills(mapped)
      } else {
        setSkills([])
      }
      return data
    }
    return null
  }

  async function fetchPlaneCardData(profileData: ProfileData | null) {
    if (!profileData) return

    // Fetch portfolio nav cards
    const pCards: ProfileNavCard[] = []
    if (profileData.portfolio_plane_cards?.length) {
      for (const card of profileData.portfolio_plane_cards) {
        if (card.type === 'category') {
          const { data } = await supabase.from('categories').select('id, name, short_desc, desc').eq('id', card.id).single()
          if (data) {
            const { data: imgs } = await supabase.from('content').select('menu_thumbnail_url, image_url').eq('category_id', card.id).order('order_index', { ascending: true }).limit(5)
            pCards.push({ id: data.id, name: data.name, shortDesc: (data as any).short_desc ?? null, desc: (data as any).desc ?? null, thumbnails: imgs?.map((c: any) => c.menu_thumbnail_url ?? c.image_url).filter(Boolean) ?? [] })
          }
        } else if (card.type === 'subcategory') {
          const { data } = await supabase.from('subcategories').select('id, name, short_desc, desc').eq('id', card.id).single()
          if (data) {
            const { data: imgs } = await supabase.from('content').select('menu_thumbnail_url, image_url').eq('subcategory_id', card.id).order('order_index', { ascending: true }).limit(5)
            pCards.push({ id: data.id, name: data.name, shortDesc: (data as any).short_desc ?? null, desc: (data as any).desc ?? null, thumbnails: imgs?.map((c: any) => c.menu_thumbnail_url ?? c.image_url).filter(Boolean) ?? [] })
          }
        } else if (card.type === 'collection') {
          const { data } = await supabase.from('collections').select('id, name, short_desc, desc').eq('id', card.id).single()
          if (data) {
            const { data: junctionData } = await supabase.from('content_collections').select('content_id').eq('collection_id', card.id).limit(5)
            let thumbnails: string[] = []
            if (junctionData?.length) {
              const ids = junctionData.map((j: any) => j.content_id)
              const { data: imgs } = await supabase.from('content').select('menu_thumbnail_url, image_url').in('id', ids).limit(5)
              thumbnails = imgs?.map((c: any) => c.menu_thumbnail_url ?? c.image_url).filter(Boolean) ?? []
            }
            pCards.push({ id: data.id, name: data.name, shortDesc: (data as any).short_desc ?? null, desc: (data as any).desc ?? null, thumbnails })
          }
        }
      }
    }
    setPortfolioCardData(pCards)

    // Fetch resume cards
    const rCards: ProfileResumeCard[] = []
    if (profileData.resume_plane_cards?.length) {
      const { data } = await supabase
        .from('resume_entries')
        .select('id, title, subtitle, short_description, plane_description, date_start, date_end')
        .in('id', profileData.resume_plane_cards)
      if (data) {
        for (const id of profileData.resume_plane_cards) {
          const entry = data.find((d: any) => d.id === id)
          if (entry) rCards.push({ id: entry.id, title: entry.title, subtitle: entry.subtitle ?? null, dateStart: entry.date_start ?? null, dateEnd: entry.date_end ?? null, shortDescription: entry.short_description ?? null, planeDescription: (entry as any).plane_description ?? null })
        }
      }
    }
    setResumeCardData(rCards)
  }

  if (!profile) return null
  const isCondensed = condensedMode && !isExpanded

  const isClickable = !isExpanded || isCondensed
  const showGradientStrip = isClickable && !isMobile
  const hoverGradientHeight = 40
  const hoverExpansion = hoverGradientHeight / 2

  return (<>
    <header
      ref={headerRef}
      className={`border-b-2 border-accent-light transition-all duration-300 sticky top-0 z-40 font-body text-text-on-dark-secondary bg-bg-profile backdrop-saturate-[180%] backdrop-blur-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] relative ${!isExpanded && !isCondensed && !isMobile ? 'collapsed' : ''} ${isClickable ? 'select-none' : ''} ${showGradientStrip ? 'cursor-pointer' : ''}`}
      onClick={isClickable ? () => setIsExpanded(true) : undefined}
      onMouseEnter={() => { if (showGradientStrip) setHeaderHovered(true) }}
      onMouseLeave={() => setHeaderHovered(false)}
      style={{
        backgroundColor: '#121212',
        ...(!isExpanded && !isCondensed && profile?.collapsed_profile_height && !isMobile
          ? { height: `${profile.collapsed_profile_height}px`, overflow: 'visible' }
          : {})
      }}
    >
      {/* Mobile collapsed layout */}
      {isMobile && !isExpanded && !isCondensed ? (
        <div className="px-[15px] py-4">
          <div className="flex justify-between items-start w-full mb-2">
            {/* Name upper-left */}
            <h1 className="font-display text-[1.35rem] font-bold uppercase text-text-on-dark tracking-[-0.012em] leading-none mb-1 w-[40%]">
              {profile.full_name?.toUpperCase() || 'YOUR NAME'}
            </h1>

            {/* Job titles upper-right */}
            <div className="flex flex-col gap-0.5 text-xs text-text-on-dark-secondary text-right w-[60%]">
              {profile.job_title_1 && <p>{profile.job_title_1}</p>}
              {profile.job_title_2 && <p>{profile.job_title_2}</p>}
              {profile.job_title_3 && <p>{profile.job_title_3}</p>}
              {profile.job_title_4 && <p>{profile.job_title_4}</p>}
            </div>
          </div>
          
          {/* Ruler */}
          <hr className="border-0 border-t border-accent-dark my-2" />

          {/* Short bio below name/titles */}
          <div className="font-body text-sm text-text-on-dark-secondary leading-relaxed mt-2">
            {profile.short_bio ? (
              isBlockNoteFormat(profile.short_bio) || isEditorJSFormat(profile.short_bio) ? (
                <ShortBioRenderer data={profile.short_bio} />
              ) : (
                <p>{profile.short_bio}</p>
              )
            ) : (
              <p>No bio available</p>
            )}
          </div>
          
        </div>
      ) : isCondensed ? (
        isMobile ? (
          <div className="px-[15px] py-3">
            <h1 className="font-display text-[2rem] font-bold uppercase text-text-on-dark tracking-[-0.012em] leading-none whitespace-nowrap overflow-hidden text-ellipsis select-none cursor-pointer" onClick={() => setIsExpanded(true)}>
              {profile.full_name?.toUpperCase() || 'YOUR NAME'}
            </h1>
          </div>
        ) : (
          <div className="px-8 py-4">
            <h1 className="font-display text-[2rem] font-bold uppercase text-text-on-dark tracking-[-0.012em] mb-1 select-none">
              {profile.full_name?.toUpperCase() || 'YOUR NAME'}
            </h1>
          </div>
        )
      ) : !isMobile ? (
        <>
          {/* Profile Expanded - matches mockup structure */}
          <div className="py-6 px-8" style={!isExpanded && profile?.collapsed_profile_height ? { height: `${profile.collapsed_profile_height}px`, overflow: 'hidden' } : undefined}>
            <div className="flex items-start">
              <div className="w-[50%]">
                <h1 className="font-display text-[2rem] font-bold uppercase text-text-on-dark tracking-[-0.012em] mb-1 select-none">
                  {profile.full_name?.toUpperCase() || 'YOUR NAME'}
                </h1>

                {profile.location && (
                  <div className="flex items-center gap-1 font-body text-sm text-text-on-dark-secondary mb-3">
                    <img src="/dc-outline.png" alt="location" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                    <p>{profile.location}</p>
                  </div>
                )}

                <div className="space-y-0.5 font-body text-sm text-text-on-dark-secondary">
                  {profile.job_title_1 && <p>{profile.job_title_1}</p>}
                  {profile.job_title_2 && <p>{profile.job_title_2}</p>}
                  {profile.job_title_3 && <p>{profile.job_title_3}</p>}
                  {profile.job_title_4 && <p>{profile.job_title_4}</p>}
                </div>
              </div>

              <div className="w-[40%]">
                <div className="font-body text-sm text-text-on-dark-secondary leading-relaxed" style={{ lineHeight: '1.625' }}>
                  {profile.short_bio ? (
                    isBlockNoteFormat(profile.short_bio) || isEditorJSFormat(profile.short_bio) ? (
                      <ShortBioRenderer data={profile.short_bio} />
                    ) : (
                      <p>{profile.short_bio}</p>
                    )
                  ) : (
                    <p>No bio available</p>
                  )}
                </div>
              </div>
              
              <div className="w-[10%]"></div>
            </div>
          </div>

        </>
      ) : null}


      {/* Hover expansion overlay — bg fill + gradient, positioned below tab border, no layout impact */}
      {showGradientStrip && (<>
        <div
          className="absolute left-0 right-0 pointer-events-none transition-opacity duration-300"
          style={{
            bottom: -hoverExpansion,
            height: hoverExpansion,
            backgroundColor: '#121212',
            opacity: headerHovered ? 1 : 0,
            zIndex: 38,
          }}
        />
        <div
          className="absolute left-0 right-0 pointer-events-none transition-opacity duration-300"
          style={{
            bottom: -hoverExpansion,
            height: hoverGradientHeight,
            background: 'linear-gradient(to bottom, transparent, #6B2A2A)',
            opacity: headerHovered ? 1 : 0,
            zIndex: 39,
          }}
        />
      </>)}
    </header>

    {/* Mobile expanded overlay — sibling to header, outside backdrop-filter containing block */}
    {isMobile && (
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-bg-profile"
            style={{
              position: 'fixed',
              top: 0,
              bottom: `${BOTTOM_NAV_HEIGHT_PX}px`,
              left: 0,
              right: 0,
              overflow: 'auto',
              zIndex: 45,
              backgroundColor: '#121212'
            }}
          >
            {/* Dual-column header: Name 30%, Titles 70% + Collapse button */}
            <div className="px-[15px] pt-4 pb-2 border-b border-border-gray-800">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start flex-1">
                  <div className="w-[30%]">
                    <h1 className="font-display text-[1.35rem] font-bold uppercase text-text-on-dark tracking-[-0.012em] leading-tight mb-1">
                      {profile.full_name?.toUpperCase() || 'YOUR NAME'}
                    </h1>
                  </div>
                  <div className="w-[70%] pl-4">
                    <div className="flex flex-col gap-0.5 font-body text-xs text-text-on-dark-secondary text-right">
                      {profile.job_title_1 && <p>{profile.job_title_1}</p>}
                      {profile.job_title_2 && <p>{profile.job_title_2}</p>}
                      {profile.job_title_3 && <p>{profile.job_title_3}</p>}
                      {profile.job_title_4 && <p>{profile.job_title_4}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Single-column content: Full bio → Education → Skills → Languages */}
            <div className="px-[15px] py-4 space-y-6">
              {/* Short bio with simple cutoff */}
              <div>
                <h3 className="font-ui text-sm font-semibold text-text-on-dark-inactive uppercase tracking-[0.06em] mb-2">About</h3>
                <div
                  className="font-body text-sm text-text-on-dark-secondary leading-relaxed"
                  style={{
                    maxHeight: '400px',
                    overflow: 'hidden'
                  }}
                >
                  {profile.short_bio ? (
                    isBlockNoteFormat(profile.short_bio) || isEditorJSFormat(profile.short_bio) ? (
                      <ShortBioRenderer data={profile.short_bio} />
                    ) : (
                      <p>{profile.short_bio}</p>
                    )
                  ) : (
                    <p>No bio available</p>
                  )}
                </div>
              </div>

              {/* Education */}
              {profile.education && (
                <div>
                  <h3 className="font-ui text-sm font-semibold text-text-on-dark-inactive uppercase tracking-[0.06em] mb-2">Education</h3>
                  <p className="font-body text-sm text-text-on-dark-secondary">{profile.education}</p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <h3 className="font-ui text-sm font-semibold text-text-on-dark-inactive uppercase tracking-[0.06em] mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const isLinked = !!skill.collectionSlug && !!skill.collectionName && !!onOpenCollection
                      return (
                        <button
                          key={skill.id}
                          onClick={() => {
                            if (isLinked && skill.collectionSlug && skill.collectionName && onOpenCollection) {
                              onOpenCollection(skill.collectionSlug, skill.collectionName)
                            }
                          }}
                          className={`
                            py-1 px-3 rounded-full text-sm transition-colors text-white
                            ${isLinked
                              ? 'bg-accent-emerald-700 hover:bg-accent-emerald-300'
                              : 'bg-bg-unlinked-skills-pill cursor-default'}
                          `}
                          disabled={!isLinked}
                        >
                          {skill.skillName}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <div>
                  <h3 className="font-ui text-sm font-semibold text-text-on-dark-inactive uppercase tracking-[0.06em] mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((language, i) => (
                      <span
                        key={i}
                        className="py-1 px-3 rounded-full text-sm bg-bg-unlinked-skills-pill text-white"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact row */}
            {(profile.show_phone && profile.phone) ||
             (profile.show_email && profile.email) ||
             (profile.show_social_media && profile.linkedin) ? (
              <div className="border-t border-border-gray-800 bg-bg-profile px-[15px] py-4 flex flex-wrap gap-4 items-center justify-start">
                {profile.show_phone && profile.phone && (
                  <div className="flex items-center gap-2 font-body text-sm text-text-on-dark-secondary">
                    <span>📞</span>
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.show_email && profile.email && (
                  <div className="flex items-center gap-2 font-body text-sm text-text-on-dark-secondary">
                    <span>✉️</span>
                    <a href={`mailto:${profile.email}`} className="text-text-on-dark-secondary hover:text-accent-light transition-colors">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.show_social_media && profile.linkedin && (
                  <div className="flex items-center gap-2 font-body text-sm text-text-on-dark-secondary">
                    <span>💼</span>
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-on-dark-secondary hover:text-accent-light transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    )}

    {/* Desktop expanded overlay — fixed, covers full viewport including bottom nav */}
    {!isMobile && (
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 55,
              backgroundColor: '#121212',
              display: 'flex',
              flexDirection: 'column',
              borderBottom: '2px solid #6B2A2A',
            }}
          >
            {/* Profile upper zone: header + full bio */}
            <div style={{ height: 'calc(45vh - 20px)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

              {/* Profile header: name / location / job titles (left) + short bio (right) */}
              <div className="py-6 px-8 flex items-start flex-shrink-0">
                <div className="w-[50%]">
                  <h1 className="font-display text-[2rem] font-bold uppercase text-text-on-dark tracking-[-0.012em] mb-1 select-none">
                    {profile.full_name?.toUpperCase() || 'YOUR NAME'}
                  </h1>
                  {profile.location && (
                    <div className="flex items-center gap-1 font-body text-sm text-text-on-dark-secondary mb-3">
                      <img src="/dc-outline.png" alt="location" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                      <p>{profile.location}</p>
                    </div>
                  )}
                  <div className="space-y-0.5 font-body text-sm text-text-on-dark-secondary">
                    {profile.job_title_1 && <p>{profile.job_title_1}</p>}
                    {profile.job_title_2 && <p>{profile.job_title_2}</p>}
                    {profile.job_title_3 && <p>{profile.job_title_3}</p>}
                    {profile.job_title_4 && <p>{profile.job_title_4}</p>}
                  </div>
                </div>
                <div className="w-[40%] font-body text-sm text-text-on-dark-secondary" style={{ lineHeight: '1.625' }}>
                  {profile.short_bio ? (
                    isBlockNoteFormat(profile.short_bio) || isEditorJSFormat(profile.short_bio) ? (
                      <ShortBioRenderer data={profile.short_bio} />
                    ) : (
                      <p>{profile.short_bio}</p>
                    )
                  ) : (
                    <p>No bio available</p>
                  )}
                </div>
              </div>

              {/* Full bio BlockNote — full width, fills remaining upper zone height */}
              <div
                className="flex-1 min-h-0 overflow-y-hidden px-8 py-4"
                style={{ borderTop: '2px solid #2e2a28' }}
              >
                <div
                  className="blocknote-profile-bio font-body text-text-on-dark-secondary"
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.625',
                    '--text-body': 'var(--text-on-dark-secondary)',
                    '--text-headings': 'var(--text-on-dark)',
                    '--text-secondary': 'var(--text-on-dark-secondary)',
                    '--text-metadata': 'var(--text-on-dark-inactive)',
                  } as React.CSSProperties}
                >
                  {profile.full_bio ? (
                    isBlockNoteFormat(profile.full_bio) ? (
                      <BlockNoteRenderer data={profile.full_bio} imageSizes={profile.full_bio_image_sizes} />
                    ) : (
                      <p>{profile.full_bio}</p>
                    )
                  ) : profile.short_bio ? (
                    isBlockNoteFormat(profile.short_bio) ? (
                      <BlockNoteRenderer data={profile.short_bio} />
                    ) : (
                      <p>{profile.short_bio}</p>
                    )
                  ) : (
                    <p>No bio available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Planes */}
            <ProfilePlanes
              portfolioCards={portfolioCardData}
              resumeCards={resumeCardData}
              education={profile.education}
              jhuEntryId={profile.jhu_entry_id ?? null}
              onSwitchToPortfolio={() => { setIsExpanded(false); onSwitchToPortfolio?.() }}
              onSwitchToResume={(entryId?: string) => { setIsExpanded(false); onSwitchToResume?.(entryId) }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    )}
  </>
  )
})

Profile.displayName = 'Profile'

export default Profile


