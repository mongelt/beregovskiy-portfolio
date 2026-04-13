'use client'

/**
 * Stage 6 + Stage 8 visual verification page — /cards-test
 *
 * Shows all 7 card types with representative props, mirroring
 * card_design_mockup.html rows 1–4. Also has an interactive
 * CategoryPlane section for Stage 8 verification.
 * Hover each card to verify transitions.
 */

import React, { useState } from 'react'
import { interpolateMenuScore, borderColorFromScore } from '@/lib/menu/scoreSpectrum'
import { ThumbnailStack } from '@/components/dynamic-menu/cards/ThumbnailStack'
import { NavCard } from '@/components/dynamic-menu/cards/NavCard'
import { ThumbCard } from '@/components/dynamic-menu/cards/ThumbCard'
import { PeriSolo } from '@/components/dynamic-menu/cards/PeriSolo'
import { PeriPair } from '@/components/dynamic-menu/cards/PeriPair'
import { SubheaderCard } from '@/components/dynamic-menu/cards/SubheaderCard'
import { CollectionCard } from '@/components/dynamic-menu/cards/CollectionCard'
import { CategoryPlane, ScoredCategory } from '@/components/dynamic-menu/CategoryPlane'
import { ScoredSubcategory } from '@/lib/menu/subcategoryLayout'
import { ContentPlane } from '@/components/dynamic-menu/ContentPlane'
import { ContentColumn, ScoredContentItem } from '@/lib/menu/columnLayout'
import { CollectionPlane } from '@/components/dynamic-menu/CollectionPlane'
import { ScoredCollection } from '@/lib/menu/collectionLayout'

// ---------------------------------------------------------------------------
// Score spectrum data (from score_spectrum_prototype.html)
// ---------------------------------------------------------------------------

const SPECTRUM_CARDS = [
  { score: 1.00, title: 'AI Agents in Integration',     meta: 'Axway Blog · 2024',       desc: 'Agentic workflows in B2B data pipelines.' },
  { score: 0.89, title: 'AI in B2B Sales',              meta: 'Medium · 2024',            desc: 'Pipeline automation and AI-driven lead scoring.' },
  { score: 0.78, title: 'GEO for Journalists',          meta: 'Self-published · 2024',    desc: 'Generative engine optimization guide.' },
  { score: 0.67, title: 'Digital Propaganda Patterns',  meta: 'Academic · 2024',          desc: 'AI-driven disinformation study.' },
  { score: 0.56, title: 'LinkedIn Thought Leadership',  meta: 'LinkedIn · 2024',          desc: 'Building executive presence online.' },
  { score: 0.45, title: 'Balkan Media Landscape',       meta: 'Feature · 2022',           desc: 'Press freedom challenges across the region.' },
  { score: 0.34, title: 'CNN Panel: Balkans',           meta: 'CNN · 2023',               desc: 'Regional politics discussion panel.' },
  { score: 0.23, title: 'Belgrade Architecture',        meta: 'Photo essay · 2022',       desc: 'Brutalist and modern architecture.' },
  { score: 0.12, title: 'Documentary: Belgrade',        meta: 'YouTube · 2023',           desc: 'City culture mini-documentary.' },
  { score: 0.01, title: 'Reuters Feature',              meta: 'Reuters · 2023',           desc: 'Syndicated political analysis piece.' },
]

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const pageStyle: React.CSSProperties = {
  background: '#0B0A0A',
  minHeight: '100vh',
  padding: '40px 30px',
  fontFamily: 'var(--font-ui, Space Grotesk, sans-serif)',
  color: '#c0c0c0',
}

const sectionTitle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#A85A5A',
  marginBottom: 14,
  paddingBottom: 6,
  borderBottom: '1px solid #2a2222',
}

const row: React.CSSProperties = {
  display: 'flex',
  gap: 24,
  marginBottom: 40,
  flexWrap: 'wrap',
  alignItems: 'flex-start',
}

const col: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
}

const label: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#888',
}

const divider: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #2a2222',
  margin: '10px 0 24px',
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Stage 8 — CategoryPlane test data
// ---------------------------------------------------------------------------

const TEST_CATEGORIES: ScoredCategory[] = [
  { id: 'cat-1', name: 'Analysis',  shortDesc: 'Policy · AI · Geopolitics', desc: 'In-depth analysis across policy, AI governance, and international affairs.',     score: 1.00, classification: 'active' },
  { id: 'cat-2', name: 'Research',  shortDesc: 'Academic · Reports',         desc: 'Academic papers, white papers, and policy reports spanning technology and law.', score: 0.80, classification: 'focus'  },
  { id: 'cat-3', name: 'Creative',  shortDesc: 'Writing · Narrative',         desc: 'Long-form narrative writing, essays, and creative non-fiction.',                 score: 0.35, classification: 'related' },
]

const TEST_SUBCATEGORIES: ScoredSubcategory[] = [
  { id: 'sub-1', category_id: 'cat-1', name: 'EU Integration',    shortDesc: 'Accession · Balkans',    desc: 'European Union accession politics in Southeast Europe.',       collectionIds: ['col-1'], score: 1.00, classification: 'active',  pairingRole: 'none' },
  { id: 'sub-2', category_id: 'cat-1', name: 'AI Policy',         shortDesc: 'Governance · Regulation', desc: 'Policy and regulatory frameworks for artificial intelligence.', collectionIds: ['col-1', 'col-2'], score: 0.85, classification: 'focus',   pairingRole: 'none' },
  { id: 'sub-3', category_id: 'cat-1', name: 'Media Studies',     shortDesc: 'Press · Disinformation',  desc: 'Press freedom, media ecosystems, and disinformation research.', collectionIds: ['col-2'], score: 0.70, classification: 'focus',   pairingRole: 'none' },
  { id: 'sub-4', category_id: 'cat-2', name: 'ML Research',       shortDesc: 'Machine learning',        desc: 'Applied machine learning research and technical publications.',   collectionIds: ['col-1'], score: 0.45, classification: 'related', pairingRole: 'none' },
  { id: 'sub-5', category_id: 'cat-2', name: 'Policy Reports',    shortDesc: 'Institutional',           desc: 'Institutional policy reports and white papers.',                 collectionIds: ['col-2'], score: 0.40, classification: 'related', pairingRole: 'none' },
]

// 7-item list for testing peri-pair threshold (>5 subcategories)
const TEST_SUBCATEGORIES_LARGE: ScoredSubcategory[] = [
  ...TEST_SUBCATEGORIES,
  { id: 'sub-6', category_id: 'cat-3', name: 'Feature Writing',   shortTitle: 'Features',  shortDesc: 'Long-form',   desc: 'Long-form feature writing and narrative journalism.', collectionIds: ['col-1'], score: 0.30, classification: 'related', pairingRole: 'left',  pairWithId: 'sub-7' },
  { id: 'sub-7', category_id: 'cat-3', name: 'Photo Essays',       shortTitle: 'Photo',     shortDesc: 'Visual work', desc: 'Documentary photography and visual storytelling.',    collectionIds: ['col-1'], score: 0.25, classification: 'related', pairingRole: 'right' },
]

// ---------------------------------------------------------------------------
// CategoryPlane interactive wrapper
// ---------------------------------------------------------------------------

function CategoryPlaneDemo() {
  const [activeCategoryId, setActiveCategoryId]       = useState<string | null>('cat-1')
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>('sub-1')
  const [isCollapsed, setIsCollapsed]                 = useState(false)
  const [useLargeList, setUseLargeList]               = useState(false)

  const subcategories = useLargeList ? TEST_SUBCATEGORIES_LARGE : TEST_SUBCATEGORIES

  const btnBase: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 3,
    border: '1px solid #3a3030', cursor: 'pointer', letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }
  const btnActive: React.CSSProperties   = { ...btnBase, background: '#6B2A2A', color: '#e0ccc8', border: '1px solid #8a3a3a' }
  const btnInactive: React.CSSProperties = { ...btnBase, background: '#1a1818', color: '#888' }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button style={isCollapsed ? btnInactive : btnActive} onClick={() => setIsCollapsed(false)}>
          Expanded
        </button>
        <button style={isCollapsed ? btnActive : btnInactive} onClick={() => setIsCollapsed(true)}>
          Collapsed (hover plane to test overlay)
        </button>
        <div style={{ width: 1, background: '#2a2222', margin: '0 4px' }} />
        <button style={useLargeList ? btnActive : btnInactive} onClick={() => setUseLargeList(v => !v)}>
          7 subcategories (peri-pair threshold)
        </button>
        <div style={{ width: 1, background: '#2a2222', margin: '0 4px' }} />
        <button style={activeCategoryId ? btnInactive : btnActive} onClick={() => { setActiveCategoryId(null); setActiveSubcategoryId(null) }}>
          No category (subcol hidden)
        </button>
      </div>

      {/* Status readout */}
      <div style={{ fontSize: 10, color: '#555', marginBottom: 16, fontFamily: 'monospace' }}>
        category: {activeCategoryId ?? 'null'} &nbsp;|&nbsp;
        subcategory: {activeSubcategoryId ?? 'null'} &nbsp;|&nbsp;
        collapsed: {String(isCollapsed)}
      </div>

      {/* The plane — wrap in a relative container so absolute overlay is bounded */}
      <div style={{ position: 'relative', display: 'inline-flex', minHeight: 300 }}>
        <CategoryPlane
          categories={TEST_CATEGORIES}
          subcategories={activeCategoryId ? subcategories.filter(s => s.category_id === activeCategoryId || s.classification === 'related') : []}
          activeCategoryId={activeCategoryId}
          activeSubcategoryId={activeSubcategoryId}
          isCollapsed={isCollapsed}
          onCategoryClick={(id) => {
            setActiveCategoryId(id)
            setActiveSubcategoryId(null)
          }}
          onSubcategoryClick={(id) => setActiveSubcategoryId(id)}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stage 9 — ContentPlane test data + demo
// ---------------------------------------------------------------------------

function makeItem(
  id: string,
  name: string,
  shortTitle: string,
  score: number,
  classification: ScoredContentItem['classification'],
  pairingRole: ScoredContentItem['pairingRole'],
  collectionIds: string[],
  pairWithId?: string,
): ScoredContentItem {
  return {
    id,
    name,
    shortTitle,
    shortDesc: `Short desc for ${shortTitle}`,
    desc: `Extended description for ${name}. Provides additional context on hover.`,
    publication: 'Report',
    year: 2024,
    order_index: 0,
    collectionIds,
    thumbnail: undefined,
    score,
    classification,
    pairingRole,
    pairWithId,
    overflowsViewport: false,
  }
}

const COL_1: ContentColumn = {
  collectionId: 'col-eu',
  collectionName: 'EU Integration',
  isActiveCollection: false,
  isContinuation: false,
  subheaderSpansTwo: false,
  items: [
    makeItem('c1',  'Serbia EU Accession Analysis',       'Serbia EU',         1.00, 'active',  'none', ['col-eu']),
    makeItem('c2',  'Balkan Reform Tracker 2024',         'Reform Tracker',    0.85, 'focus',   'none', ['col-eu']),
    makeItem('c3',  'Croatia Post-Accession Review',      'Croatia Review',    0.72, 'focus',   'none', ['col-eu']),
    makeItem('c4',  'Enlargement Policy Brief',           'Policy Brief',      0.45, 'related', 'left', ['col-eu'], 'c5'),
    makeItem('c5',  'European Integration Studies Q3',    'EU Studies Q3',     0.38, 'related', 'right',['col-eu']),
    makeItem('c6',  'Balkan Press Freedom Index',         'Press Freedom',     0.30, 'related', 'solo', ['col-eu']),
  ],
}

const COL_2: ContentColumn = {
  isContinuation: false,
  subheaderSpansTwo: false,
  collectionId: 'col-ai',
  collectionName: 'AI & Technology',
  isActiveCollection: false,
  items: [
    makeItem('d1', 'AI Agents in Integration Pipelines', 'AI Agents',         0.88, 'focus',   'none', ['col-ai']),
    makeItem('d2', 'GEO Training Materials',             'GEO Guide',         0.74, 'focus',   'none', ['col-ai']),
    makeItem('d3', 'ML in Policy Analysis',              'ML Policy',         0.60, 'focus',   'none', ['col-ai']),
    makeItem('d4', 'LCB Dispatch #14',                   'Dispatch #14',      0.35, 'related', 'none', ['col-ai']),
  ],
}

const COL_3: ContentColumn = {
  collectionId: null,
  collectionName: null,
  isActiveCollection: false,
  isContinuation: false,
  subheaderSpansTwo: false,
  items: [
    makeItem('e1', 'Belgrade Architecture Photo Essay',  'Beograd Arch',      0.55, 'focus',   'none', []),
    makeItem('e2', 'Documentary: Belgrade',              'Documentary',       0.42, 'related', 'none', []),
  ],
}

const COL_2_ACTIVE: ContentColumn = { ...COL_2, isActiveCollection: true }

function ContentPlaneDemo() {
  const [activeContentId, setActiveContentId] = useState<string | null>(null)
  const [colCount, setColCount]               = useState<1 | 2 | 3>(2)
  const [col2Active, setCol2Active]           = useState(false)

  const columns: ContentColumn[] = [
    COL_1,
    ...(colCount >= 2 ? [col2Active ? COL_2_ACTIVE : COL_2] : []),
    ...(colCount >= 3 ? [COL_3] : []),
  ]

  const btnBase: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 3,
    border: '1px solid #3a3030', cursor: 'pointer', letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }
  const btnOn: React.CSSProperties  = { ...btnBase, background: '#6B2A2A', color: '#e0ccc8', border: '1px solid #8a3a3a' }
  const btnOff: React.CSSProperties = { ...btnBase, background: '#1a1818', color: '#888' }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {([1, 2, 3] as const).map(n => (
          <button key={n} style={colCount === n ? btnOn : btnOff} onClick={() => setColCount(n)}>
            {n} column{n > 1 ? 's' : ''}
          </button>
        ))}
        <div style={{ width: 1, background: '#2a2222', margin: '0 4px' }} />
        <button style={col2Active ? btnOn : btnOff} onClick={() => setCol2Active(v => !v)}>
          Col 2 active (no subheader)
        </button>
        <div style={{ width: 1, background: '#2a2222', margin: '0 4px' }} />
        <button style={btnOff} onClick={() => setActiveContentId(null)}>
          Clear active item
        </button>
      </div>

      {/* Status */}
      <div style={{ fontSize: 10, color: '#555', marginBottom: 16, fontFamily: 'monospace' }}>
        active item: {activeContentId ?? 'null'}
      </div>

      {/* Content plane — fixed height to make scroll testable */}
      <div style={{ height: 380, overflow: 'hidden', display: 'flex' }}>
        <ContentPlane
          columns={columns}
          activeContentId={activeContentId}
          onContentClick={setActiveContentId}
          onSubheaderClick={(colId) => alert(`onSubheaderClick → ${colId}`)}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stage 10 — CollectionPlane test data + demo
// ---------------------------------------------------------------------------

function makeCollection(
  id: string,
  name: string,
  shortTitle: string,
  score: number,
  isActive: boolean,
  featured: boolean,
): ScoredCollection {
  return {
    id,
    name,
    shortTitle,
    shortDesc: `${shortTitle} · collection`,
    desc: `Extended description for the ${name} collection. Hover to reveal.`,
    featured,
    order_index: 0,
    thumbnails: [],
    score,
    isActive,
  }
}

const LEFT_ZONE: ScoredCollection[] = [
  makeCollection('col-a', 'Eastern Europe Analysis', 'E. Europe',   1.0,  true,  true),
  makeCollection('col-b', 'AI & Technology',          'AI / Tech',  0.88, false, true),
  makeCollection('col-c', 'Policy Reports',           'Policy',     0.72, false, true),
  makeCollection('col-d', 'Media Studies',            'Media',      0.55, false, true),
]

const RIGHT_ZONE: ScoredCollection[] = [
  makeCollection('col-e', 'International Development', "Int'l Dev", 0.40, false, false),
  makeCollection('col-f', 'Creative Writing',          'Creative',  0.22, false, false),
]

function CollectionPlaneDemo() {
  const [activeId, setActiveId] = useState<string | null>('col-a')

  // Rebuild zones reflecting current active state
  const leftZone  = LEFT_ZONE.map(c  => ({ ...c,  isActive: c.id  === activeId }))
  const rightZone = RIGHT_ZONE.map(c => ({ ...c, isActive: c.id === activeId }))

  const btnBase: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 3,
    border: '1px solid #3a3030', cursor: 'pointer', letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }
  const btnOn: React.CSSProperties  = { ...btnBase, background: '#6B2A2A', color: '#e0ccc8', border: '1px solid #8a3a3a' }
  const btnOff: React.CSSProperties = { ...btnBase, background: '#1a1818', color: '#888' }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button style={activeId ? btnOff : btnOn} onClick={() => setActiveId(null)}>
          No active
        </button>
        {[...LEFT_ZONE, ...RIGHT_ZONE].map(c => (
          <button
            key={c.id}
            style={activeId === c.id ? btnOn : btnOff}
            onClick={() => setActiveId(c.id)}
          >
            {c.shortTitle}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 10, color: '#555', marginBottom: 16, fontFamily: 'monospace' }}>
        active: {activeId ?? 'null'} &nbsp;|&nbsp;
        left zone: {leftZone.length} &nbsp;|&nbsp;
        right zone: {rightZone.length}
      </div>

      <CollectionPlane
        leftZone={leftZone}
        rightZone={rightZone}
        activeCollectionId={activeId}
        onCollectionClick={(id) => setActiveId(id)}
        onCollectionDismiss={() => setActiveId(null)}
      />

      <div style={{ fontSize: 10, color: '#555', marginTop: 12, lineHeight: 1.6 }}>
        Left zone (featured): E. Europe (active), AI / Tech, Policy, Media &nbsp;·&nbsp;
        Right zone (non-featured): Int&apos;l Dev, Creative &nbsp;·&nbsp;
        Hover any card to expand. × button appears only on active card.
      </div>
    </div>
  )
}

export default function CardsTestPage() {
  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: 18, fontWeight: 600, color: '#e0e0e0', marginBottom: 6 }}>
        Card Components — Current Layouts
      </h1>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 6, lineHeight: 1.6 }}>
        Visual reference for all dynamic-menu card types. Hover each card to test transitions.
      </p>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 30, lineHeight: 1.7, maxWidth: 640 }}>
        <strong style={{ color: '#888' }}>Hover color rule (all non-active scored cards):</strong> on hover, background → <code style={{ color: '#b0a0a0' }}>#c7c7c2</code>, title → <code style={{ color: '#b0a0a0' }}>#1a1a1a</code>, border → <code style={{ color: '#b0a0a0' }}>#1c1818</code>. Applies to ThumbCard, NavCard (all variants), and PeriCards (nav layout). PeriCards in content layout use <code style={{ color: '#b0a0a0' }}>#b4b0ac</code>.
      </p>

      {/* ── Row 1: ThumbCard ──────────────────────────────────────────── */}
      <div style={sectionTitle}>Row 1 — ThumbCard (focus + active + related)</div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
        300px wide. Active: fixed accent colors, desc always visible, thumbnail always lifted. Non-active: score-driven colors at rest → focus colors (#c7c7c2 bg, #1a1a1a text) on hover + desc expands + thumbnail lifts.
      </p>
      <div style={row}>
        <div style={col}>
          <div style={label}>Active — fixed accent colors, desc always visible</div>
          <ThumbCard
            name="Comprehensive accession policy analysis"
            shortDesc="Accession policy analysis"
            desc="Comprehensive accession policy analysis and strategic overview for southeastern European EU integration tactics."
            publication="Report"
            year={2023}
            score={1.0}
            isActive={true}
            onClick={() => {}}
          />
        </div>

        <div style={col}>
          <div style={label}>Focus (score 1.0) — hover: #c7c7c2 bg + desc</div>
          <ThumbCard
            name="AI Agents in Integration"
            shortDesc="Agentic workflows in pipelines"
            desc="Agentic workflows and architecture in modern data pipelines — implementation patterns and case studies."
            publication="White paper"
            year={2024}
            score={1.0}
            isActive={false}
            onClick={() => {}}
          />
        </div>

        <div style={col}>
          <div style={label}>Focus (score 0.72) — hover: #c7c7c2 bg + desc</div>
          <ThumbCard
            name="Machine Learning in Policy Analysis"
            shortDesc="ML pipelines for policy"
            desc="How machine learning transforms evidence-based policy development and international affairs research."
            publication="Article"
            year={2024}
            score={0.72}
            isActive={false}
            onClick={() => {}}
          />
        </div>

        <div style={col}>
          <div style={label}>Related (score 0.35) — hover: #c7c7c2 bg + desc</div>
          <ThumbCard
            name="LCB Dispatch #14"
            shortDesc="Eastern Europe"
            desc="Weekly geopolitical briefing from Eastern Europe covering politics, economics, and regional developments."
            publication="Newsletter"
            year={2023}
            score={0.35}
            isActive={false}
            onClick={() => {}}
          />
        </div>
      </div>

      <hr style={divider} />

      {/* ── Row 2: PeriSolo + PeriPair ───────────────────────────────── */}
      <div style={sectionTitle}>Row 2a — PeriSolo + PeriPair · layout=&quot;content&quot; (default, used in ContentPlane)</div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
        150px at rest → 300px (solo) / 290px (pair) on hover. Single thumbnail lifts from left with 3D perspective. Text right-aligned. Non-hovered pair card collapses to 10px sliver. Background: #b4b0ac on hover.
      </p>
      <div style={row}>
        <div style={col}>
          <div style={label}>PeriSolo — 150px rest → 300px hover, thumbnail left</div>
          <PeriSolo
            name="GEO Training Materials for Journalists"
            shortTitle="GEO for Journalists"
            shortDesc="Generative engines"
            desc="Optimization strategies for journalists navigating AI-driven search engines and content discovery platforms."
            publication="Guide"
            year={2024}
            onClick={() => {}}
          />
        </div>

        <div style={col}>
          <div style={label}>PeriPair — hover one card, partner collapses to sliver</div>
          <PeriPair
            left={{
              name: 'Ethical governance frameworks for enterprises',
              shortTitle: 'Op-Ed: Tech Ethics',
              shortDesc: 'Responsible AI use',
              desc: 'Ethical AI governance frameworks for enterprise AI deployment and ethical decision-making.',
              publication: 'Op-ed',
              year: 2024,
            }}
            right={{
              name: 'LCB Dispatch #14',
              shortTitle: 'LCB Dispatch #14',
              shortDesc: 'Eastern Europe',
              desc: 'Weekly geopolitical briefing from Eastern Europe covering politics, economics, and regional developments.',
              publication: 'Newsletter',
              year: 2023,
            }}
            onLeftClick={() => {}}
            onRightClick={() => {}}
          />
        </div>
      </div>

      <hr style={divider} />

      {/* ── Row 2b: PeriSolo + PeriPair nav layout ───────────────────── */}
      <div style={sectionTitle}>Row 2b — PeriSolo + PeriPair · layout=&quot;nav&quot; (used in CategoryPlane for subcategories)</div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
        Same width animation as content layout. Text left-aligned. ThumbnailStack (multi-asset) slides in from right on hover. Description expands inline below name (maxHeight, same pattern as NavCard). Background: #c7c7c2 on hover. Passes full thumbnails array from subcategory data.
      </p>
      <div style={row}>
        <div style={col}>
          <div style={label}>PeriSolo nav — 150px rest → 300px hover, ThumbnailStack right</div>
          <PeriSolo
            layout="nav"
            name="Feature Writing and Narrative Journalism"
            shortTitle="Feature Writing"
            shortDesc="Long-form narrative"
            desc="Long-form feature writing, narrative journalism, and investigative reporting techniques."
            thumbnails={[]}
            onClick={() => {}}
          />
        </div>

        <div style={col}>
          <div style={label}>PeriPair nav — hover one, partner collapses; ThumbnailStack right</div>
          <PeriPair
            layout="nav"
            left={{
              name: 'Feature Writing and Narrative Journalism',
              shortTitle: 'Feature Writing',
              shortDesc: 'Long-form',
              desc: 'Long-form feature writing and narrative journalism techniques.',
              thumbnails: [],
            }}
            right={{
              name: 'Photo Essays and Visual Storytelling',
              shortTitle: 'Photo Essays',
              shortDesc: 'Visual work',
              desc: 'Documentary photography and visual storytelling for editorial platforms.',
              thumbnails: [],
            }}
            onLeftClick={() => {}}
            onRightClick={() => {}}
          />
        </div>
      </div>

      <hr style={divider} />

      {/* ── Row 3a: SubheaderCard ────────────────────────────────────── */}
      <div style={sectionTitle}>Row 3a — SubheaderCard (content plane column header)</div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
        300px (columns=1) or 608px (columns=2, spanning split pair). 42px at rest → 72px on hover. Dark bg #0d0a0a → #c7c7c2 on hover. shortDesc slides out, desc slides in. ThumbnailStack fades in on hover. isCollectionActive: name #A85A5A, border #6B2A2A at rest.
      </p>
      <div style={row}>
        <div style={col}>
          <div style={label}>Standard 300px — hover: #c7c7c2 bg + desc + thumbnails</div>
          <SubheaderCard
            name="Politics & Society"
            shortDesc="Geopolitics, policy analysis, international relations"
            desc="Geopolitics, policy analysis, and international relations — exploring EU dynamics, Balkan politics, and global power shifts through in-depth ground-level reporting and analysis."
            itemCount={12}
            thumbnails={[]}
            isCollectionActive={false}
            onClick={() => {}}
          />
        </div>

        <div style={col}>
          <div style={label}>Collection active (name #A85A5A)</div>
          <SubheaderCard
            name="Technology & AI"
            shortDesc="Machine learning, AI policy, future of work"
            desc="Exploring the intersection of artificial intelligence, policy, and society — from governance frameworks to frontier research."
            itemCount={8}
            thumbnails={[]}
            isCollectionActive={true}
            onClick={() => {}}
          />
        </div>
      </div>

      <hr style={divider} />

      {/* ── Row 3b: CollectionCard ───────────────────────────────────── */}
      <div style={sectionTitle}>Row 3b — CollectionCard (bottom row)</div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
        140px at rest (160px when active) → 290px on hover. shortTitle at rest → name uppercase on hover. Description expands inline below name (maxHeight animation, same pattern as NavCard). ThumbnailStack slides in from right. Card grows upward (CollectionPlane uses height:36 + overflow:visible + alignItems:flex-end). Active: red left border + dismiss (×) button. Focus/related hover: #c7c7c2 bg.
      </p>
      <div style={{ ...row, alignItems: 'flex-end' }}>
        <div style={col}>
          <div style={label}>Active — red left border, dismiss button, desc inline</div>
          <CollectionCard
            name="Eastern Europe Analysis"
            shortTitle="E. Europe"
            shortDesc="Regional reports and dispatches"
            desc="In-depth analysis of Eastern European politics, economics, and society."
            score={1.0}
            isActive={true}
            thumbnails={[]}
            onClick={() => {}}
            onDismiss={() => alert('dismissed')}
          />
        </div>

        <div style={col}>
          <div style={label}>Focus (score ≥ 0.50) — #c7c7c2 bg at rest and on hover</div>
          <CollectionCard
            name="AI & Technology"
            shortTitle="AI / Tech"
            shortDesc="Machine learning and policy"
            desc="Coverage of AI policy, machine learning research, and technology governance."
            score={1.0}
            isActive={false}
            thumbnails={[]}
            onClick={() => {}}
          />
        </div>

        <div style={col}>
          <div style={label}>Related (score &lt; 0.50) — dark at rest → #b4b0ac on hover</div>
          <CollectionCard
            name="International Development"
            shortTitle="Int'l Dev"
            shortDesc="Development economics"
            desc="International development economics, aid effectiveness, and capacity building."
            score={0.30}
            isActive={false}
            thumbnails={[]}
            onClick={() => {}}
          />
        </div>
      </div>

      <hr style={divider} />

      {/* ── Row 4: NavCard ───────────────────────────────────────────── */}
      <div style={sectionTitle}>Row 4 — NavCard (category + subcategory navigation)</div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
        Expanded variant: always 300px, shortDesc visible at rest, desc + ThumbnailStack on hover. Collapsed variant: 90px at rest → 300px on individual hover (Framer Motion). Overlay mode: plane expands plane-wide, individual hover still swaps desc and reveals thumbnails. Hover color rule applies in ALL modes: score-driven → #c7c7c2 bg + #1a1a1a text + #1c1818 border on hover.
      </p>
      <div style={row}>
        <div style={col}>
          <div style={label}>Expanded — active (fixed accent, no hover change)</div>
          <NavCard
            variant="expanded"
            name="Analysis"
            shortDesc="Policy · AI · Geopolitics"
            desc="In-depth analysis across policy, AI governance, and international affairs. Ground-level reporting from Eastern Europe."
            score={1.0}
            isActive={true}
            thumbnails={[]}
            onClick={() => {}}
          />
        </div>

        <div style={col}>
          <div style={label}>Expanded — focus (score 1.0) — hover: #c7c7c2 + desc</div>
          <NavCard
            variant="expanded"
            name="Research"
            shortDesc="Academic · Reports"
            desc="Academic papers, white papers, and policy reports spanning technology, international law, and political economy."
            score={1.0}
            isActive={false}
            thumbnails={[]}
            onClick={() => {}}
          />
        </div>

        <div style={col}>
          <div style={label}>Expanded — related (score 0.35) — hover: #c7c7c2 + desc</div>
          <NavCard
            variant="expanded"
            name="Creative"
            shortDesc="Writing · Narrative"
            desc="Long-form narrative writing, essays, and creative non-fiction exploring contemporary issues."
            score={0.35}
            isActive={false}
            thumbnails={[]}
            onClick={() => {}}
          />
        </div>

        <div style={col}>
          <div style={label}>Collapsed — 90px → 300px on hover, focus colors apply</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 90 }}>
            <NavCard
              variant="collapsed"
              name="Analysis"
              desc="Policy, AI governance, and international affairs — ground-level reporting from Eastern Europe."
              score={1.0}
              isActive={true}
              thumbnails={[]}
              onClick={() => {}}
            />
            <NavCard
              variant="collapsed"
              name="Research"
              desc="Academic papers, white papers, and policy reports spanning technology and political economy."
              score={0.8}
              isActive={false}
              thumbnails={[]}
              onClick={() => {}}
            />
            <NavCard
              variant="collapsed"
              name="Creative"
              desc="Long-form narrative writing, essays, and creative non-fiction."
              score={0.3}
              isActive={false}
              thumbnails={[]}
              onClick={() => {}}
            />
          </div>
        </div>
      </div>

      <hr style={divider} />

      {/* ── Score Spectrum ───────────────────────────────────────────── */}
      <div style={sectionTitle}>Score Spectrum (0.01 → 1.00)</div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 20, lineHeight: 1.7, maxWidth: 560 }}>
        Ten cards scored 0.01 → 1.00. Score drives background and text color continuously.
        Two gradients meet at the 0.50 seam: gradient A (dark, #b0b0b0 text) and gradient B (light, #1a1a1a text).
      </p>

      {/* Active reference */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ ...label, marginBottom: 8 }}>Active state (fixed reference — accent colors, outside spectrum)</div>
        <div style={{
          width: 300, borderRadius: 3, padding: '8px 12px',
          background: '#d2c8c8', border: '0.5px solid #6B2A2A', borderLeft: '2px solid #fc5454',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#6b2a2a', lineHeight: 1.4 }}>Serbia&apos;s EU Path</div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#8a5050', marginTop: 1 }}>Reuters · 2023</div>
          <div style={{ fontSize: 11, lineHeight: 1.45, color: '#8a5050', marginTop: 3 }}>Accession policy analysis and the road to membership.</div>
        </div>
      </div>

      {/* Spectrum rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 40 }}>
        {SPECTRUM_CARDS.map((card, i) => {
          const colors = interpolateMenuScore(card.score)
          const borderColor = borderColorFromScore(card.score)
          const prevCard = SPECTRUM_CARDS[i - 1]
          const showSeam = prevCard && prevCard.score >= 0.50 && card.score < 0.50
          return (
            <div key={card.score}>
              {showSeam && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 4px 50px' }}>
                  <div style={{ width: 300, height: 1, background: '#fc545430' }} />
                  <div style={{ fontSize: 9, color: '#fc545460', whiteSpace: 'nowrap' }}>← text switches to #b0b0b0 below seam 0.50</div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 10, color: '#555', width: 36, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' } as React.CSSProperties}>
                  {card.score.toFixed(2)}
                </div>
                <div style={{
                  borderRadius: 3, padding: '8px 12px', width: 300, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', gap: 2,
                  background: colors.background, border: `0.5px solid ${borderColor}`,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: colors.color, lineHeight: 1.4 }}>{card.title}</div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.03em', color: colors.color, marginTop: 1, opacity: 0.7 }}>{card.meta}</div>
                  <div style={{ fontSize: 11, lineHeight: 1.45, color: colors.color, marginTop: 3, opacity: 0.75 }}>{card.desc}</div>
                </div>
                <div style={{ width: 60, height: 4, background: '#1a1616', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ height: '100%', background: '#6B2A2A', borderRadius: 2, width: `${card.score * 100}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <hr style={divider} />

      {/* ── ThumbnailStack ───────────────────────────────────────────── */}
      <div style={sectionTitle}>ThumbnailStack — standalone (isVisible=true)</div>
      <div style={row}>
        <div style={col}>
          <div style={label}>Empty (no thumbnails)</div>
          <div style={{ height: 80, position: 'relative', background: '#1a1818', borderRadius: 4, padding: 4 }}>
            <ThumbnailStack thumbnails={[]} isVisible={true} parentHovered={false} />
          </div>
        </div>
        <div style={col}>
          <div style={label}>isVisible=false (opacity 0)</div>
          <div style={{ height: 80, position: 'relative', background: '#1a1818', borderRadius: 4, padding: 4 }}>
            <ThumbnailStack thumbnails={[]} isVisible={false} parentHovered={false} />
          </div>
        </div>
      </div>

      <hr style={divider} />

      {/* ── CategoryPlane ────────────────────────────────────────────── */}
      <div style={{ ...sectionTitle, color: '#5a8aA8' }}>CategoryPlane — interactive demo</div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 20, lineHeight: 1.7, maxWidth: 600 }}>
        Toggle <strong style={{ color: '#888' }}>Expanded / Collapsed</strong> to test layout animation.
        In Collapsed mode, hover the plane to trigger <strong style={{ color: '#888' }}>hover-overlay</strong> (dark bg + shadow, all cards 300px).
        In all modes, hovering an individual card switches it to focus colors (#c7c7c2).
        Enable <strong style={{ color: '#888' }}>7 subcategories</strong> to see PeriPair layout=&quot;nav&quot; — ThumbnailStack right, text left — for related subcategories.
        Related subcategory peri cards only appear when items actually overflow the viewport.
      </p>
      <CategoryPlaneDemo />

      <hr style={divider} />

      {/* ── ContentPlane ─────────────────────────────────────────────── */}
      <div style={{ ...sectionTitle, color: '#5a8aA8' }}>ContentPlane — interactive demo</div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 20, lineHeight: 1.7, maxWidth: 600 }}>
        Tests 1–3 columns with SubheaderCard, ThumbCard, PeriSolo, PeriPair (layout=&quot;content&quot;).
        Pairing only fires when items overflow the unscrolled viewport — 5 items in a no-subheader column all render as full ThumbCards.
        Toggle <strong style={{ color: '#888' }}>active collection</strong> to remove the subheader.
        Click an item to set it active (red accent). Hover ThumbCards to test focus-color transition.
      </p>
      <ContentPlaneDemo />

      <hr style={divider} />

      {/* ── CollectionPlane ──────────────────────────────────────────── */}
      <div style={{ ...sectionTitle, color: '#5a8aA8' }}>CollectionPlane — interactive demo</div>
      <p style={{ fontSize: 11, color: '#555', marginBottom: 20, lineHeight: 1.7, maxWidth: 600 }}>
        Single horizontal row pinned to bottom. Container is height:36 + overflow:visible so expanding cards grow upward without shifting layout above.
        Click a card to set it active (red left border + × dismiss button). Click × to dismiss.
        Hover to expand to 290px — description expands inline below name, ThumbnailStack slides in from right.
        Left zone = featured, right zone = non-featured (no visible divider).
      </p>
      <CollectionPlaneDemo />
    </div>
  )
}
