'use client'

/**
 * Stage 13 — Collapsed Menu Bar
 *
 * Thin fixed bar shown when pageState='collapsed-reader' and useNewMenu=true.
 * Replaces the full DynamicMenu with a breadcrumb strip:
 *
 *   [Category] › [Subcategory] › [Content Title]       [Collection Pill]
 *
 * 13a — Pre-selection on click:
 *   Category  → selectCategory → expand (menu opens at State 2)
 *   Subcategory → selectSubcategory → expand (State 3)
 *   Content   → clearContent (keep subcategory anchor) → expand (State 3)
 *   Collection pill → selectCollection → expand (State 5/6)
 *   Empty space → expand with current DynamicMenu state
 *
 * 13b — Hover cards:
 *   Each breadcrumb chunk shows the corresponding card design below the bar.
 *   AnimatePresence for entry/exit. Cards are position:absolute within the
 *   fixed bar, expanding downward and overlaying page content.
 */

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavCard } from './cards/NavCard'
import { ThumbCard } from './cards/ThumbCard'
import { CollectionCard } from './cards/CollectionCard'
import { useReducedMotion, dmTransition } from '@/lib/animations'
import type { ScoredCategory } from './CategoryPlane'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BarSubcategoryData {
  id: string
  name: string
  shortDesc?: string
  desc?: string
  score: number
}

export interface BarContentData {
  id: string
  name: string
  thumbnail?: string
  publication?: string
  year?: number
  score: number
}

export interface BarCollectionData {
  id: string
  name: string
  shortTitle?: string
  shortDesc?: string
  desc?: string
  score: number
  thumbnails?: string[]
}

export interface CollapsedMenuBarProps {
  profileHeight: number
  activeCategoryData: ScoredCategory | null
  activeSubcategoryData: BarSubcategoryData | null
  activeContentData: BarContentData | null
  activeCollectionData: BarCollectionData | null
  onCategoryClick: () => void
  onSubcategoryClick: () => void
  onContentClick: () => void
  onCollectionClick: () => void
  /** Called when user clicks empty space in the bar */
  onExpand: () => void
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Sep() {
  return (
    <span
      style={{
        opacity: 0.35,
        margin: '0 4px',
        fontSize: 14,
        userSelect: 'none',
        lineHeight: 1,
      }}
    >
      ›
    </span>
  )
}

type HoverId = 'category' | 'subcategory' | 'content' | 'collection' | null

function BreadcrumbChunk({
  chunkId,
  activeId,
  label,
  onHover,
  onClick,
  trans,
  children,
}: {
  chunkId: HoverId
  activeId: HoverId
  label: string
  onHover: (id: HoverId) => void
  onClick: () => void
  trans: ReturnType<typeof dmTransition>
  children: React.ReactNode
}) {
  const isHovered = activeId === chunkId

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => onHover(chunkId)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClick() }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 6px',
          borderRadius: 4,
          fontSize: 13,
          color: isHovered ? '#ffffff' : 'rgba(255,255,255,0.8)',
          fontWeight: isHovered ? 600 : 400,
          maxWidth: 240,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.4,
        }}
      >
        {label}
      </button>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            key={`hover-${chunkId}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={trans}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 50,
              marginTop: 6,
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CollapsedMenuBar
// ---------------------------------------------------------------------------

export function CollapsedMenuBar({
  profileHeight,
  activeCategoryData,
  activeSubcategoryData,
  activeContentData,
  activeCollectionData,
  onCategoryClick,
  onSubcategoryClick,
  onContentClick,
  onCollectionClick,
  onExpand,
}: CollapsedMenuBarProps) {
  const [hoverId, setHoverId] = useState<HoverId>(null)
  const reduced = useReducedMotion()
  const trans = dmTransition(reduced)

  return (
    <div
      className="fixed z-30 bg-bg-menu-bar border-t-2 border-accent-light"
      style={{
        top: profileHeight ? `${profileHeight}px` : '200px',
        left: 0,
        width: '100%',
        minHeight: 64,
        // overflow:visible so hover cards can extend below the bar
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 60px',
        cursor: 'pointer',
      }}
      onClick={onExpand}
    >
      {/* Left: breadcrumb — stop propagation so empty-space handler doesn't fire */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {activeCategoryData && (
          <BreadcrumbChunk
            chunkId="category"
            activeId={hoverId}
            label={activeCategoryData.name}
            onHover={setHoverId}
            onClick={onCategoryClick}
            trans={trans}
          >
            <NavCard
              variant="expanded"
              name={activeCategoryData.name}
              shortDesc={activeCategoryData.shortDesc}
              desc={activeCategoryData.desc}
              score={activeCategoryData.score}
              isActive
              thumbnails={activeCategoryData.thumbnails ?? []}
              onClick={onCategoryClick}
            />
          </BreadcrumbChunk>
        )}

        {activeSubcategoryData && (
          <>
            <Sep />
            <BreadcrumbChunk
              chunkId="subcategory"
              activeId={hoverId}
              label={activeSubcategoryData.name}
              onHover={setHoverId}
              onClick={onSubcategoryClick}
              trans={trans}
            >
              <NavCard
                variant="expanded"
                name={activeSubcategoryData.name}
                shortDesc={activeSubcategoryData.shortDesc}
                desc={activeSubcategoryData.desc}
                score={activeSubcategoryData.score}
                isActive
                thumbnails={[]}
                onClick={onSubcategoryClick}
              />
            </BreadcrumbChunk>
          </>
        )}

        {activeContentData && (
          <>
            <Sep />
            <BreadcrumbChunk
              chunkId="content"
              activeId={hoverId}
              label={activeContentData.name}
              onHover={setHoverId}
              onClick={onContentClick}
              trans={trans}
            >
              <ThumbCard
                name={activeContentData.name}
                score={activeContentData.score}
                isActive
                thumbnail={activeContentData.thumbnail}
                publication={activeContentData.publication}
                year={activeContentData.year}
                onClick={onContentClick}
              />
            </BreadcrumbChunk>
          </>
        )}
      </div>

      {/* Right: collection pill */}
      {activeCollectionData && (
        <div
          style={{ position: 'relative', flexShrink: 0 }}
          onMouseEnter={() => setHoverId('collection')}
          onMouseLeave={() => setHoverId(null)}
          onClick={(e) => { e.stopPropagation(); onCollectionClick() }}
        >
          <div
            style={{
              padding: '4px 12px',
              borderRadius: 12,
              background: hoverId === 'collection' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.10)',
              fontSize: 12,
              cursor: 'pointer',
              color: hoverId === 'collection' ? '#ffffff' : 'rgba(255,255,255,0.75)',
              transition: reduced ? 'none' : 'background 0.18s, color 0.18s',
              whiteSpace: 'nowrap',
            }}
          >
            {activeCollectionData.shortTitle ?? activeCollectionData.name}
          </div>

          <AnimatePresence>
            {hoverId === 'collection' && (
              <motion.div
                key="hover-collection"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={trans}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  zIndex: 50,
                  marginTop: 6,
                }}
              >
                <CollectionCard
                  name={activeCollectionData.name}
                  shortTitle={activeCollectionData.shortTitle ?? activeCollectionData.name}
                  shortDesc={activeCollectionData.shortDesc}
                  desc={activeCollectionData.desc}
                  score={activeCollectionData.score}
                  isActive={false}
                  thumbnails={activeCollectionData.thumbnails ?? []}
                  onClick={onCollectionClick}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
