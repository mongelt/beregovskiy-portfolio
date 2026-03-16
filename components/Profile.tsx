'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import BlockNoteRenderer from '@/components/BlockNoteRendererDynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { useMobileState } from '@/lib/responsive'
import { BOTTOM_NAV_HEIGHT_PX } from '@/lib/constants'

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
  collapsed_profile_height: number | null
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
  condensedMode = false
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(true) // CRITICAL: Redesign - expanded by default
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [skills, setSkills] = useState<ProfileSkill[]>([])
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
    loadProfile()
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


  async function loadProfile() {
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
    }
  }

  if (!profile) return null
  const isCondensed = condensedMode && !isExpanded

  return (<>
    <header
      ref={headerRef}
      className={`border-b-2 border-accent-light transition-all duration-300 sticky top-0 z-40 font-body text-text-on-dark-secondary bg-bg-profile backdrop-saturate-[180%] backdrop-blur-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] relative ${!isExpanded && !isCondensed && !isMobile ? 'collapsed' : ''} ${isExpanded && !isMobile ? 'flex flex-col' : ''}`}
      style={{
        backgroundColor: '#121212', // Explicit background color to ensure it's not overridden
        ...(!isExpanded && !isCondensed && profile?.collapsed_profile_height && !isMobile
          ? { height: `${profile.collapsed_profile_height}px`, overflow: 'hidden' }
          : isExpanded && !isMobile
          ? { maxHeight: `calc(100vh - ${BOTTOM_NAV_HEIGHT_PX}px)`, minHeight: `calc(100vh - ${BOTTOM_NAV_HEIGHT_PX}px)` }
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
          
          {/* Expand button */}
          <div className="flex justify-center mt-4">
            <motion.button
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 font-ui text-sm font-medium text-accent-dark hover:text-accent-light uppercase tracking-[0.05em] transition-colors"
            >
              <span>EXPAND</span>
              <ChevronDown size={16} />
            </motion.button>
          </div>
        </div>
      ) : isCondensed ? (
        isMobile ? (
          <div className="px-[15px] py-3">
            <h1 className="font-display text-[2rem] font-bold uppercase text-text-on-dark tracking-[-0.012em] leading-none whitespace-nowrap overflow-hidden text-ellipsis mb-2">
              {profile.full_name?.toUpperCase() || 'YOUR NAME'}
            </h1>
            <div className="flex justify-center">
              <motion.button
                onClick={() => setIsExpanded(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 font-ui text-sm font-medium text-accent-dark hover:text-accent-light uppercase tracking-[0.05em] transition-colors"
              >
                <span>EXPAND</span>
                <ChevronDown size={16} />
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-[2rem] font-bold uppercase text-text-on-dark tracking-[-0.012em] mb-1">
                {profile.full_name?.toUpperCase() || 'YOUR NAME'}
              </h1>
              <motion.button
                onClick={() => setIsExpanded(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 font-ui text-sm font-medium text-accent-dark hover:text-accent-light uppercase tracking-[0.05em] transition-colors"
              >
                <span>EXPAND</span>
                <ChevronDown size={16} />
              </motion.button>
            </div>
          </div>
        )
      ) : !isMobile ? (
        <>
          {/* Profile Expanded - matches mockup structure */}
          <div className="py-6 px-8" style={!isExpanded && profile?.collapsed_profile_height ? { height: `${profile.collapsed_profile_height}px`, overflow: 'hidden' } : undefined}>
            <div className="flex items-start">
              <div className="w-[50%]">
                <h1 className="font-display text-[2rem] font-bold uppercase text-text-on-dark tracking-[-0.012em] mb-1">
                  {profile.full_name?.toUpperCase() || 'YOUR NAME'}
                </h1>
                
                {profile.location && (
                  <div className="flex items-center gap-1 font-body text-sm text-text-on-dark-secondary mb-3">
                    <MapPin size={14} />
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

          {/* Collapsed expand button */}
          {!isExpanded && (
            <div className="absolute left-0 right-0 bottom-[15px] flex justify-center">
              <motion.button
                onClick={() => setIsExpanded(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 font-ui text-sm font-medium text-accent-dark hover:text-accent-light uppercase tracking-[0.05em] transition-colors"
              >
                <span>EXPAND</span>
                <ChevronDown size={16} />
              </motion.button>
            </div>
          )}
        </>
      ) : null}

      {/* Desktop-only AnimatePresence — height animation is safe inside header */}
      {!isMobile && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="bg-bg-profile overflow-hidden flex flex-col flex-1"
              style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Profile Expanded Content - matches mockup .profile-expanded-content */}
              <div className="flex-1 overflow-hidden">
                <div className="py-4 px-8 border-t border-border-gray-800 mt-4">
                  {/* Profile Expanded Grid - matches mockup .profile-expanded-grid (2fr 1fr) */}
                  <div className="grid grid-cols-[2fr_1fr] gap-6">
                    {/* Left column - About section */}
                    <div>
                      <div className="blocknote-profile-bio font-body text-sm text-text-on-dark-secondary leading-relaxed" style={{ lineHeight: '1.625', '--text-body': 'var(--text-on-dark-secondary)', '--text-headings': 'var(--text-on-dark)', '--text-secondary': 'var(--text-on-dark-secondary)', '--text-metadata': 'var(--text-on-dark-inactive)' } as React.CSSProperties}>
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

                    {/* Right column - Education, Skills, Languages */}
                    <div>
                      {profile.education && (
                        <div className="mb-6">
                          <h3 className="font-ui text-sm font-semibold text-text-on-dark-inactive uppercase tracking-[0.06em] mb-2">Education</h3>
                          <p className="font-body text-text-on-dark-secondary">{profile.education}</p>
                        </div>
                      )}

                      {skills.length > 0 && (
                        <div className="mb-6">
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

                      {profile.languages && profile.languages.length > 0 && (
                        <div>
                          <h3 className="font-ui text-sm font-semibold text-text-on-dark-inactive uppercase tracking-[0.06em] mb-2">Languages</h3>
                          <div className="flex flex-wrap gap-2">
                            {profile.languages.map((language, i) => (
                              <span
                                key={i}
                                className="py-1 px-3 text-white rounded-full text-sm bg-bg-unlinked-skills-pill"
                              >
                                {language}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Row - matches mockup .profile-contact-row */}
              {(profile.show_phone && profile.phone) ||
               (profile.show_email && profile.email) ||
               (profile.show_social_media && profile.linkedin) ? (
                <div className="border-t border-border-gray-800 bg-bg-profile px-8 py-4 flex flex-wrap gap-4 items-center">
                  {profile.show_phone && profile.phone && (
                    <div className="flex items-center gap-2 font-body text-sm text-text-on-dark-secondary">
                      <span>📞</span>
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.show_email && profile.email && (
                    <div className="flex items-center gap-2 font-body text-sm text-text-on-dark-secondary">
                      <span>✉️</span>
                      <a href={`mailto:${profile.email}`} className="text-text-on-dark-secondary hover:text-accent-light transition-colors" style={{ textDecoration: 'none' }}>
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
                        style={{ textDecoration: 'none' }}
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Expand Button Wrapper - matches mockup .profile-expand-button-wrapper */}
              <div className="px-8 py-4 flex justify-center">
                <motion.button
                  onClick={() => setIsExpanded(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 font-ui text-sm font-medium text-accent-dark hover:text-accent-light uppercase tracking-[0.05em] transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  <span>COLLAPSE</span>
                  <ChevronUp size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
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
  </>
  )
})

Profile.displayName = 'Profile'

export default Profile


