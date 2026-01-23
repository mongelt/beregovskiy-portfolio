'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import EditorRenderer from '@/components/EditorRenderer'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react'

const BOTTOM_NAV_HEIGHT_PX = 265 // matches BottomTabBar h-16

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
  // Optional callback to report the rendered header height (used by PortfolioTab
  // to align the Main menu directly under the Profile bottom edge)
  onHeightChange?: (height: number) => void
  onOpenCollection?: (slug: string, name: string) => void
  condensedMode?: boolean
}

export default function Profile({
  onHeightChange,
  onOpenCollection,
  condensedMode = false
}: ProfileProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [skills, setSkills] = useState<ProfileSkill[]>([])
  const supabase = createClient()
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  // Report the sticky header height to any parent that cares about it (optional)
  // This effect runs when profile data loads, when expanded state changes, or when onHeightChange callback changes
  useEffect(() => {
    if (!onHeightChange) return
    if (!profile) return // Don't measure if profile hasn't loaded yet

    const element = headerRef.current
    if (!element) {
      console.log('[Profile] headerRef.current is null, cannot measure height')
      return
    }

    const updateHeight = () => {
      const rect = element.getBoundingClientRect()
      const height = rect.height
      console.log('[Profile] Height measured:', height, 'px')
      onHeightChange(height)
    }

    // Use setTimeout to ensure measurement happens after DOM is fully rendered
    // This is especially important when profile data first loads
    const timeoutId = setTimeout(() => {
      updateHeight()
    }, 0)

    const resizeObserver = new ResizeObserver(() => {
      updateHeight()
    })

    resizeObserver.observe(element)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
    }
  }, [onHeightChange, profile, isExpanded]) // Added profile and isExpanded to dependencies


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

  return (
    <header
      ref={headerRef}
      className="border-b border-gray-800 transition-all duration-300 sticky top-0 z-40 bg-[#0f1419] relative"
      style={
        !isExpanded && !isCondensed && profile?.collapsed_profile_height
          ? { height: `${profile.collapsed_profile_height}px`, overflow: 'hidden' }
          : undefined
      }
    >
      {isCondensed ? (
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-white text-2xl font-bold">
              {profile.full_name?.toUpperCase() || 'YOUR NAME'}
            </h1>
            <motion.button
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span className="text-sm tracking-wider font-medium">EXPAND</span>
              <ChevronDown size={16} />
            </motion.button>
          </div>
        </div>
      ) : (
        <div
          className="px-8 py-6 relative"
          style={
            !isExpanded && profile?.collapsed_profile_height
              ? { height: `${profile.collapsed_profile_height}px`, overflow: 'hidden' }
              : undefined
          }
        >
          <div className="flex items-start relative">
            {/* Left side - Name and roles (50%) */}
            <div className="w-[50%]">
              <h1 className="text-white text-2xl font-bold mb-1">
                {profile.full_name?.toUpperCase() || 'YOUR NAME'}
              </h1>
              
              {/* Location with icon */}
              {profile.location && (
                <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
                  <MapPin size={14} />
                  <p>{profile.location}</p>
                </div>
              )}

              {/* Job titles */}
              <div className="space-y-0.5 text-sm text-gray-300">
                {profile.job_title_1 && <p>{profile.job_title_1}</p>}
                {profile.job_title_2 && <p>{profile.job_title_2}</p>}
                {profile.job_title_3 && <p>{profile.job_title_3}</p>}
                {profile.job_title_4 && <p>{profile.job_title_4}</p>}
              </div>
            </div>

            {/* Right side - Short Bio (from 50% to 75%, extended 15% = 40%) */}
            <div className="w-[40%]">
                      <div className="text-gray-300 text-sm leading-relaxed">
                {profile.short_bio ? (
                  profile.short_bio.blocks ? (
                    <EditorRenderer data={profile.short_bio} />
                  ) : (
                    <p>{profile.short_bio}</p>
                  )
                ) : (
                  <p>No bio available</p>
                )}
              </div>
            </div>
            
            {/* Spacer for remaining space (10%) */}
            <div className="w-[10%]"></div>
          </div>

          {/* Expand/Collapse button - Collapsed position (absolute) */}
          {!isExpanded && (
            <div
              className="flex justify-center"
              style={{ position: 'absolute', left: 0, right: 0, bottom: 15 }}
            >
              <motion.button
                onClick={() => setIsExpanded(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span className="text-sm tracking-wider font-medium">EXPAND</span>
                <ChevronDown size={16} />
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden flex flex-col"
            style={{ maxHeight: `calc(100vh - ${BOTTOM_NAV_HEIGHT_PX}px)` }}
          >
            <div className="flex-1 overflow-auto">
              <div className="px-8 pb-3 border-t border-gray-800 mt-4 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Bio (2/3 width) */}
                  <div className="lg:col-span-2">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">About</h3>
                      <div className="text-gray-300 text-sm leading-relaxed">
                        {profile.full_bio ? (
                          profile.full_bio.blocks ? (
                            <EditorRenderer data={profile.full_bio} imageSizes={profile.full_bio_image_sizes} />
                          ) : (
                            <p>{profile.full_bio}</p>
                          )
                        ) : profile.short_bio ? (
                          profile.short_bio.blocks ? (
                            <EditorRenderer data={profile.short_bio} />
                          ) : (
                            <p>{profile.short_bio}</p>
                          )
                        ) : (
                          <p>No bio available</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Education → Skills → Languages (1/3 width) */}
                  <div className="space-y-6 lg:col-span-1">
                    {profile.education && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Education</h3>
                        <p className="text-gray-300">{profile.education}</p>
                      </div>
                    )}

                  {skills.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Skills</h3>
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
                                px-3 py-1 rounded-full text-sm transition-colors
                                ${isLinked
                                  ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                                  : 'bg-gray-800 text-gray-300 cursor-default'}
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
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Languages</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.languages.map((language, i) => (
                            <span 
                              key={i}
                              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
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

            {/* Contact row pinned at bottom of expanded area */}
            {(profile.show_phone && profile.phone) ||
             (profile.show_email && profile.email) ||
             (profile.show_social_media && profile.linkedin) ? (
              <div className="border-t border-gray-800 bg-[#0f1419] px-8 py-4 flex flex-wrap gap-4 items-center justify-start">
                {profile.show_phone && profile.phone && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>📞</span>
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.show_email && profile.email && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>✉️</span>
                    <a href={`mailto:${profile.email}`} className="hover:text-emerald-400 transition-colors">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.show_social_media && profile.linkedin && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>💼</span>
                    <a 
                      href={profile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            ) : null}

            {/* Expand/Collapse button - Expanded position (at bottom of expanded content) */}
            <div className="px-8 pb-4 flex justify-center">
              <motion.button
                onClick={() => setIsExpanded(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span className="text-sm tracking-wider font-medium">COLLAPSE</span>
                <ChevronUp size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}


