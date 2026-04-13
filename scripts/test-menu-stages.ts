/**
 * Manual verification for Stages 4, 5, and 7.
 * Run: npx tsx scripts/test-menu-stages.ts
 */

import {
  scoreAllEntities,
  scoreStructural,
  getOverride,
  combineScores,
  blendAnchorScores,
  type ContentScoringEntity,
  type AnyEntity,
  type AnchorState,
  type ManualOverride,
} from '../lib/menu/scoring'
import { interpolateMenuScore, borderColorFromScore } from '../lib/menu/scoreSpectrum'
import { deriveNavState, type MenuState } from '../lib/menu/useMenuState'
import {
  computeContentColumns,
  type ContentItemForLayout,
  type CollectionInfo,
} from '../lib/menu/columnLayout'
import {
  computeSubcategoryColumn,
  type SubcategoryForLayout,
} from '../lib/menu/subcategoryLayout'
import {
  computeCollectionPlane,
  type CollectionForLayout,
} from '../lib/menu/collectionLayout'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let pass = 0
let fail = 0

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`)
    pass++
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`)
    fail++
  }
}

function approx(a: number, b: number, tol = 0.001): boolean {
  return Math.abs(a - b) < tol
}

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const contentA: ContentScoringEntity = {
  id: 'ca', type: 'content',
  subcategoryId: 's1', categoryId: 'cat1', collectionIds: ['col1'],
  tags: ['typescript', 'react'],
}
const contentB: ContentScoringEntity = {
  id: 'cb', type: 'content',
  subcategoryId: 's1', categoryId: 'cat1', collectionIds: ['col1'],
  tags: ['typescript'],
}
const contentC: ContentScoringEntity = {
  id: 'cc', type: 'content',
  subcategoryId: 's2', categoryId: 'cat1', collectionIds: ['col2'],
  tags: [],
}
const contentD: ContentScoringEntity = {
  id: 'cd', type: 'content',
  subcategoryId: 's3', categoryId: 'cat2', collectionIds: [],
  tags: [],
}

const entities: AnyEntity[] = [contentA, contentB, contentC, contentD]

// ---------------------------------------------------------------------------
// Stage 4 — Layer 1: Structural scoring (core of the spec criterion "same subcat+col → 1.0")
// ---------------------------------------------------------------------------

console.log('\n── Stage 4: Structural scoring (Layer 1) ──')

{
  // Same subcategory AND same collection → 1.0 (the spec completion criterion)
  const score = scoreStructural(contentA, contentB, entities)
  assert('same subcat + collection → 1.0', approx(score, 1.0), `got ${score}`)
}
{
  // Same subcategory only → 0.75
  const cX: ContentScoringEntity = {
    id: 'cx', type: 'content',
    subcategoryId: 's1', categoryId: 'cat1', collectionIds: ['col2'],
    tags: [],
  }
  const score = scoreStructural(contentA, cX, [...entities, cX])
  assert('same subcat only → 0.75', approx(score, 0.75), `got ${score}`)
}
{
  // Same collection only → 0.75
  const cY: ContentScoringEntity = {
    id: 'cy', type: 'content',
    subcategoryId: 's9', categoryId: 'cat1', collectionIds: ['col1'],
    tags: [],
  }
  const score = scoreStructural(contentA, cY, [...entities, cY])
  assert('same collection only → 0.75', approx(score, 0.75), `got ${score}`)
}
{
  // Same category, no shared collection → 0.40
  const score = scoreStructural(contentA, contentC, entities)
  assert('same category, no shared col → 0.40', approx(score, 0.40), `got ${score}`)
}
{
  // No structural overlap → 0.0 (completion criterion: "entity with no connection scores 0.0")
  const score = scoreStructural(contentA, contentD, entities)
  assert('no structural overlap → 0.0', approx(score, 0.0), `got ${score}`)
}

// ---------------------------------------------------------------------------
// Stage 4 — scoreAllEntities (combined scores)
// Note: combineScores = structural*0.70 + tagSim*0.30.
// An entity with structural=1.0 and tagSim=0 scores 0.70 (correct, not 1.0).
// Score 1.0 from scoreAllEntities requires both structural and tag perfection.
// "Scores 1.0" in the spec criterion refers to the structural layer above.
// ---------------------------------------------------------------------------

console.log('\n── Stage 4: scoreAllEntities (combined signal) ──')

{
  const anchors: AnchorState = { primary: { type: 'content', id: 'ca' }, secondary: null }
  const results = scoreAllEntities(entities, anchors, [])
  const rA = results.find(r => r.entityId === 'ca')!
  const rB = results.find(r => r.entityId === 'cb')!
  const rC = results.find(r => r.entityId === 'cc')!
  const rD = results.find(r => r.entityId === 'cd')!

  assert('anchor (ca) → active', rA.classification === 'active', rA.classification)

  // cb: structural=1.0, shares 'typescript' tag → combined ≥ 0.70 (focus zone)
  assert('strongest structural (cb) → score ≥ 0.70', rB.score >= 0.70, `score=${rB.score}`)
  assert('strongest structural (cb) → focus', rB.classification === 'focus', rB.classification)

  // cc: structural=0.40, no tags → combined = 0.40*0.70 = 0.28 (related zone)
  assert('same cat only (cc) → score ≈ 0.28', approx(rC.score, 0.28), `score=${rC.score}`)
  assert('same cat only (cc) → related', rC.classification === 'related', rC.classification)

  // cd: no structural overlap, no tags → 0.0 (completion criterion: "no connection → 0.0")
  assert('no connection (cd) → score 0.0', approx(rD.score, 0.0), `score=${rD.score}`)
  assert('no connection (cd) → hidden', rD.classification === 'hidden', rD.classification)
}

console.log('\n── Stage 4: No anchor → all focus at 1.0 ──')

{
  const anchors: AnchorState = { primary: null, secondary: null }
  const results = scoreAllEntities(entities, anchors, [])
  const allFocus = results.every(r => r.score === 1.0 && r.classification === 'focus')
  assert('no anchor → all score 1.0 focus', allFocus)
}

console.log('\n── Stage 4: Manual override — force_unrelated ──')

{
  // cb is structural 1.0 vs ca, but override forces 0.0 (spec completion criterion)
  const overrides: ManualOverride[] = [{
    entityAType: 'content', entityAId: 'ca',
    entityBType: 'content', entityBId: 'cb',
    overrideType: 'force_unrelated',
  }]
  const anchors: AnchorState = { primary: { type: 'content', id: 'ca' }, secondary: null }
  const results = scoreAllEntities(entities, anchors, overrides)
  const rB = results.find(r => r.entityId === 'cb')!
  assert('force_unrelated on structural-1.0 entity → score 0.0', approx(rB.score, 0.0), `score=${rB.score}`)
  assert('force_unrelated → hidden', rB.classification === 'hidden', rB.classification)
}

console.log('\n── Stage 4: Manual override — force_related (bidirectional) ──')

{
  // cd has no structural connection to ca (0.0), but override forces 0.75
  const overrides: ManualOverride[] = [{
    entityAType: 'content', entityAId: 'cd',
    entityBType: 'content', entityBId: 'ca',
    overrideType: 'force_related',
  }]
  const anchors: AnchorState = { primary: { type: 'content', id: 'ca' }, secondary: null }
  const results = scoreAllEntities(entities, anchors, overrides)
  const rD = results.find(r => r.entityId === 'cd')!
  assert('force_related on unrelated entity → score 0.75', approx(rD.score, 0.75), `score=${rD.score}`)
  assert('force_related → focus', rD.classification === 'focus', rD.classification)
}

console.log('\n── Stage 4: Dual-anchor blending ──')

{
  // blendAnchorScores directly
  const b1 = blendAnchorScores(1.0, 0.0)
  assert('blendAnchorScores(1.0, 0.0) = 0.70', approx(b1, 0.70), `got ${b1}`)

  const b2 = blendAnchorScores(0.4, 0.8)
  assert('blendAnchorScores(0.4, 0.8) ≈ 0.52', approx(b2, 0.52), `got ${b2}`)

  const b3 = blendAnchorScores(0.0, 0.0)
  assert('blendAnchorScores(0.0, 0.0) = 0.0', approx(b3, 0.0), `got ${b3}`)
}

{
  // scoreAllEntities with dual anchor: cb scores high vs primary ca, 0 vs secondary cd
  // primary score for cb: structural=1.0, has tags → combined ≥ 0.70
  // secondary score for cb: structural=0.0, no tags → combined=0.0
  // blended = primary*0.7 + 0.0*0.3 = primary*0.7 → in focus zone
  const anchors: AnchorState = {
    primary: { type: 'content', id: 'ca' },
    secondary: { type: 'content', id: 'cd' },
  }
  const results = scoreAllEntities(entities, anchors, [])
  const rB = results.find(r => r.entityId === 'cb')!
  assert('dual-anchor: cb blended score ≥ 0.49', rB.score >= 0.49, `score=${rB.score}`)
  assert('dual-anchor: both ca and cd classified active', (() => {
    const rA = results.find(r => r.entityId === 'ca')!
    const rD = results.find(r => r.entityId === 'cd')!
    return rA.classification === 'active' && rD.classification === 'active'
  })())
}

console.log('\n── Stage 4: combineScores weights ──')

{
  assert('combineScores(1.0, 0.0) = 0.70', approx(combineScores(1.0, 0.0), 0.70))
  assert('combineScores(0.0, 1.0) = 0.30', approx(combineScores(0.0, 1.0), 0.30))
  assert('combineScores(1.0, 1.0) = 1.0', approx(combineScores(1.0, 1.0), 1.0))
  assert('combineScores(0.75, 0.5) = 0.675', approx(combineScores(0.75, 0.5), 0.675))
}

// ---------------------------------------------------------------------------
// Stage 5 — Score Spectrum
// ---------------------------------------------------------------------------

console.log('\n── Stage 5: Boundary values ──')

{
  const r = interpolateMenuScore(0)
  assert('score 0 → background #0f0e0e', r.background === '#0f0e0e', r.background)
  assert('score 0 → color #b0b0b0', r.color === '#b0b0b0', r.color)
}
{
  const r = interpolateMenuScore(1)
  assert('score 1 → background #c7c7c2', r.background === '#c7c7c2', r.background)
  assert('score 1 → color #1a1a1a', r.color === '#1a1a1a', r.color)
}
{
  // At exactly 0.50: t=1.0 in gradient A → endpoint #2e2c2c, title #b0b0b0
  const r = interpolateMenuScore(0.50)
  assert('score 0.50 → background #2e2c2c (dark seam endpoint)', r.background === '#2e2c2c', r.background)
  assert('score 0.50 → color #b0b0b0', r.color === '#b0b0b0', r.color)
}
{
  // Just above 0.50 → gradient B starts, title flips to #1a1a1a
  const r = interpolateMenuScore(0.501)
  assert('score 0.501 → color flips to #1a1a1a', r.color === '#1a1a1a', r.color)
}

console.log('\n── Stage 5: Smooth interpolation (spot checks) ──')

// Gradient A midpoint — score 0.25, t=0.5 → lerp(#0f0e0e, #2e2c2c, 0.5)
// R: round(15 + 0.5*31) = round(30.5) = 31 = 0x1f
// G: round(14 + 0.5*30) = round(29)   = 29 = 0x1d
// B: same as G = 0x1d
{
  const r = interpolateMenuScore(0.25)
  assert('score 0.25 → background #1f1d1d (gradient A midpoint)', r.background === '#1f1d1d', r.background)
  assert('score 0.25 → color #b0b0b0', r.color === '#b0b0b0', r.color)
}

// Gradient B midpoint — score 0.75, t=0.5 → lerp(#9a9994, #c7c7c2, 0.5)
// R: round(154 + 0.5*45) = round(176.5) = 177 = 0xb1
// G: round(153 + 0.5*46) = round(176)   = 176 = 0xb0
// B: round(148 + 0.5*46) = round(171)   = 171 = 0xab
{
  const r = interpolateMenuScore(0.75)
  assert('score 0.75 → background #b1b0ab (gradient B midpoint)', r.background === '#b1b0ab', r.background)
  assert('score 0.75 → color #1a1a1a', r.color === '#1a1a1a', r.color)
}

// Monotonic increase in background brightness from score 0 → 1
{
  const scores = [0, 0.1, 0.2, 0.3, 0.4, 0.49, 0.51, 0.6, 0.7, 0.8, 0.9, 1.0]
  function hexBrightness(hex: string): number {
    const h = hex.replace('#', '')
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16)
    return 0.299*r + 0.587*g + 0.114*b
  }
  const brightnesses = scores.map(s => hexBrightness(interpolateMenuScore(s).background))
  let monotonic = true
  for (let i = 1; i < brightnesses.length; i++) {
    if (brightnesses[i] < brightnesses[i-1]) { monotonic = false; break }
  }
  assert('backgrounds monotonically brighter from score 0 → 1', monotonic,
    brightnesses.map((b,i) => `${scores[i]}→${b.toFixed(1)}`).join(', '))
}

console.log('\n── Stage 5: borderColorFromScore ──')

{
  // Score > 0.50 → title #1a1a1a → rgba(26, 26, 26, 0.35)
  const border = borderColorFromScore(0.8)
  assert('border score > 0.5 → rgba(26, 26, 26, 0.35)', border === 'rgba(26, 26, 26, 0.35)', border)
}
{
  // Score ≤ 0.50 → title #b0b0b0 → rgba(176, 176, 176, 0.35)
  const border = borderColorFromScore(0.2)
  assert('border score ≤ 0.5 → rgba(176, 176, 176, 0.35)', border === 'rgba(176, 176, 176, 0.35)', border)
}

// ---------------------------------------------------------------------------
// Stage 7a — deriveNavState
// ---------------------------------------------------------------------------

console.log('\n── Stage 7a: deriveNavState ──')

{
  const s: MenuState = { activeCategoryId: null, activeSubcategoryId: null, activeCollectionId: null, activeContentId: null }
  assert('all null → State 1', deriveNavState(s) === 1)
}
{
  const s: MenuState = { activeCategoryId: 'cat1', activeSubcategoryId: null, activeCollectionId: null, activeContentId: null }
  assert('category only → State 2', deriveNavState(s) === 2)
}
{
  const s: MenuState = { activeCategoryId: 'cat1', activeSubcategoryId: 'sub1', activeCollectionId: null, activeContentId: null }
  assert('subcategory set → State 3', deriveNavState(s) === 3)
}
{
  const s: MenuState = { activeCategoryId: 'cat1', activeSubcategoryId: 'sub1', activeCollectionId: null, activeContentId: 'cnt1' }
  assert('content set → State 4 (trumps subcategory)', deriveNavState(s) === 4)
}
{
  const s: MenuState = { activeCategoryId: 'cat1', activeSubcategoryId: null, activeCollectionId: 'col1', activeContentId: null }
  assert('collection only → State 5', deriveNavState(s) === 5)
}
{
  const s: MenuState = { activeCategoryId: 'cat1', activeSubcategoryId: 'sub1', activeCollectionId: 'col1', activeContentId: null }
  assert('collection + subcategory → State 6', deriveNavState(s) === 6)
}
{
  const s: MenuState = { activeCategoryId: 'cat1', activeSubcategoryId: 'sub1', activeCollectionId: 'col1', activeContentId: 'cnt1' }
  assert('all four set → State 4 (content always trumps)', deriveNavState(s) === 4)
}

// ---------------------------------------------------------------------------
// Stage 7b — computeContentColumns
// ---------------------------------------------------------------------------

console.log('\n── Stage 7b: computeContentColumns — basic column assignment ──')

// Shared helpers for content column tests
const mkItem = (id: string, order_index: number, collectionIds: string[]): ContentItemForLayout => ({
  id, name: `Item ${id}`, order_index, collectionIds,
})
const mkScore = (id: string, score: number): import('../lib/menu/scoring').ScoreResult => ({
  entityId: id,
  score,
  classification: score === 0 ? 'hidden' : score >= 0.5 ? 'focus' : 'related',
})
const colInfo: CollectionInfo[] = [
  { id: 'c1', name: 'Col 1' },
  { id: 'c2', name: 'Col 2' },
  { id: 'c3', name: 'Col 3' },
  { id: 'c4', name: 'Col 4' },
]

// Test: score 0 → excluded; active collection first; items sorted by score within column
{
  const items = [
    mkItem('i1', 1, ['c1']),   // score 0.9, focus
    mkItem('i2', 2, ['c1']),   // score 0.7, focus
    mkItem('i3', 1, ['c2']),   // score 0.6, focus
    mkItem('i4', 2, ['c2']),   // score 0.3, related
    mkItem('i5', 1, []),       // score 0.5, focus (uncollected)
    mkItem('iZ', 1, ['c1']),   // score 0.0 → excluded
  ]
  const scores = [
    mkScore('i1', 0.9), mkScore('i2', 0.7), mkScore('i3', 0.6),
    mkScore('i4', 0.3), mkScore('i5', 0.5), mkScore('iZ', 0.0),
  ]
  const cols = computeContentColumns(items, colInfo, scores, null)

  assert('score=0 item excluded — 3 columns total', cols.length === 3, `got ${cols.length}`)

  // Groups avg: c1=0.8, null=0.5, c2=0.45 → sorted c1, null, c2
  assert('col 0 is c1 (highest avg)', cols[0].collectionId === 'c1', cols[0].collectionId ?? 'null')
  assert('col 1 is uncollected (avg 0.5)', cols[1].collectionId === null, cols[1].collectionId ?? 'null')
  assert('col 2 is c2 (lowest avg)', cols[2].collectionId === 'c2', cols[2].collectionId ?? 'null')
  assert('c1 items sorted: i1 first', cols[0].items[0].id === 'i1', cols[0].items[0].id)
  assert('c1 items sorted: i2 second', cols[0].items[1].id === 'i2', cols[0].items[1].id)
  assert('c1 is not active collection', cols[0].isActiveCollection === false)
  assert('uncollected is not active collection', cols[1].isActiveCollection === false)
  assert('iZ not in any column', cols.every(col => col.items.every(it => it.id !== 'iZ')))
}

console.log('\n── Stage 7b: active collection gets first slot, no subheader ──')

{
  const items = [
    mkItem('i1', 1, ['c1']),  // score 0.9
    mkItem('i2', 1, ['c2']),  // score 0.6
    mkItem('i3', 1, []),      // score 0.5 uncollected
  ]
  const scores = [mkScore('i1', 0.9), mkScore('i2', 0.6), mkScore('i3', 0.5)]
  // c2 is active — should be first even though c1 has higher avg
  const cols = computeContentColumns(items, colInfo, scores, 'c2')

  assert('active collection c2 is first column', cols[0].collectionId === 'c2', cols[0].collectionId ?? 'null')
  assert('active column isActiveCollection=true', cols[0].isActiveCollection === true)
  assert('c1 is second (higher avg than uncollected)', cols[1].collectionId === 'c1', cols[1].collectionId ?? 'null')
}

console.log('\n── Stage 7b: empty result when all scores are 0 ──')

{
  const items = [mkItem('i1', 1, ['c1'])]
  const scores = [mkScore('i1', 0.0)]
  const cols = computeContentColumns(items, colInfo, scores, null)
  assert('all score=0 → empty columns array', cols.length === 0)
}

console.log('\n── Stage 7b: pairing — 5+ cards with 2+ related ──')

{
  // 5 items in c1, no active collection → column has subheader → totalCards = 6 ≥ 5
  // Items order after score sort: f1(0.9), f2(0.8), r1(0.4), r2(0.3), r3(0.2)
  const items = [
    mkItem('f1', 1, ['c1']),   // focus
    mkItem('f2', 2, ['c1']),   // focus
    mkItem('r1', 3, ['c1']),   // related
    mkItem('r2', 4, ['c1']),   // related
    mkItem('r3', 5, ['c1']),   // related
  ]
  const scores = [
    mkScore('f1', 0.9), mkScore('f2', 0.8),
    mkScore('r1', 0.4), mkScore('r2', 0.3), mkScore('r3', 0.2),
  ]
  const cols = computeContentColumns(items, colInfo, scores, null)
  const its = cols[0].items

  assert('pairing: focus items keep pairingRole=none', its[0].pairingRole === 'none' && its[1].pairingRole === 'none',
    `f1=${its[0].pairingRole} f2=${its[1].pairingRole}`)
  assert('pairing: r1 is left of pair', its[2].pairingRole === 'left', its[2].pairingRole)
  assert('pairing: r1 pairWithId === r2', its[2].pairWithId === 'r2', its[2].pairWithId)
  assert('pairing: r2 is right of pair', its[3].pairingRole === 'right', its[3].pairingRole)
  assert('pairing: r3 is solo (isolated)', its[4].pairingRole === 'solo', its[4].pairingRole)
}

console.log('\n── Stage 7b: no pairing for small columns (<5 cards) ──')

{
  // 3 items (2 related) in c1 + subheader = 4 cards < 5 → no pairing
  const items = [
    mkItem('f1', 1, ['c1']),  // focus
    mkItem('r1', 2, ['c1']),  // related
    mkItem('r2', 3, ['c1']),  // related
  ]
  const scores = [mkScore('f1', 0.8), mkScore('r1', 0.3), mkScore('r2', 0.2)]
  const cols = computeContentColumns(items, colInfo, scores, null)
  const its = cols[0].items

  assert('small col: all pairingRole=none despite 2 related', its.every(i => i.pairingRole === 'none'))
}

console.log('\n── Stage 7b: overflowsViewport marking ──')

{
  // c1 with subheader → maxVisible = 4 items; 6 items → items[4..5] overflow
  const items = Array.from({ length: 6 }, (_, idx) => mkItem(`ov${idx}`, idx + 1, ['c1']))
  const scores = items.map((it, idx) => mkScore(it.id, 0.9 - idx * 0.1))
  const cols = computeContentColumns(items, colInfo, scores, null)
  const its = cols[0].items

  assert('overflow: items 0–3 not overflowing', its.slice(0, 4).every(i => !i.overflowsViewport))
  assert('overflow: items 4–5 overflow', its.slice(4).every(i => i.overflowsViewport))
}

{
  // Active collection (no subheader) → maxVisible = 5 items; 6 items → items[5] overflows
  const items = Array.from({ length: 6 }, (_, idx) => mkItem(`ac${idx}`, idx + 1, ['c1']))
  const scores = items.map((it, idx) => mkScore(it.id, 0.9 - idx * 0.1))
  const cols = computeContentColumns(items, colInfo, scores, 'c1')
  const its = cols[0].items

  assert('active col overflow: items 0–4 not overflowing', its.slice(0, 5).every(i => !i.overflowsViewport))
  assert('active col overflow: item 5 overflows', its[5].overflowsViewport === true)
}

console.log('\n── Stage 7b: overflow group reassignment ──')

{
  // 4 groups, only 3 slots. Item in overflow group with an alt collection → reassigned.
  const items = [
    mkItem('a', 1, ['c1']),         // c1 avg=0.7 → slot 1
    mkItem('b', 1, ['c2']),         // c2 avg=0.6 → slot 2
    mkItem('c', 1, ['c3']),         // c3 avg=0.5 → slot 3
    mkItem('d', 1, ['c4', 'c1']),   // c4 overflow; alt=c1 → reassigned to c1
  ]
  const scores = [mkScore('a', 0.7), mkScore('b', 0.6), mkScore('c', 0.5), mkScore('d', 0.4)]
  const cols = computeContentColumns(items, colInfo, scores, null)

  // After reassignment: c1 has [a, d], c2 has [b], c3 has [c]. No uncollected group.
  const c1col = cols.find(col => col.collectionId === 'c1')
  assert('overflow reassignment: d appears in c1 column', c1col?.items.some(i => i.id === 'd') === true)
  assert('overflow reassignment: 3 columns (no 4th for c4)', cols.length === 3)
  assert('overflow reassignment: no column for c4', cols.every(col => col.collectionId !== 'c4'))
}

// ---------------------------------------------------------------------------
// Stage 7c — computeSubcategoryColumn
// ---------------------------------------------------------------------------

console.log('\n── Stage 7c: computeSubcategoryColumn ──')

const mkSub = (id: string, category_id: string, collectionIds: string[]): SubcategoryForLayout => ({
  id, category_id, name: `Sub ${id}`, collectionIds,
})
const mkSubScore = (id: string, score: number): import('../lib/menu/scoring').ScoreResult => ({
  entityId: id,
  score,
  classification: score === 0 ? 'hidden' : score >= 0.5 ? 'focus' : 'related',
})

{
  // s1, s2 = siblings (cat1). s3 = cousin (cat2, shares col1 with s1). s4 = excluded (cat2, no shared col, score>0).
  const subs: SubcategoryForLayout[] = [
    mkSub('s1', 'cat1', ['col1']),
    mkSub('s2', 'cat1', ['col2']),
    mkSub('s3', 'cat2', ['col1']),  // cousin: shares col1 with s1
    mkSub('s4', 'cat2', ['col9']),  // not a cousin: no shared collection with cat1 siblings
  ]
  const scores = [
    mkSubScore('s1', 1.0),
    mkSubScore('s2', 1.0),
    mkSubScore('s3', 0.75),
    mkSubScore('s4', 0.60),  // score > 0 but not a cousin → still excluded
  ]
  const result = computeSubcategoryColumn(subs, 'cat1', scores)

  assert('siblings always included (s1)', result.some(r => r.id === 's1'))
  assert('siblings always included (s2)', result.some(r => r.id === 's2'))
  assert('cousin included when score > 0 (s3)', result.some(r => r.id === 's3'))
  assert('non-cousin excluded despite score > 0 (s4)', !result.some(r => r.id === 's4'))
  assert('3 results total (s1, s2, s3)', result.length === 3, `got ${result.length}`)

  const ids = result.map(r => r.id)
  assert('siblings come before cousins', ids.indexOf('s1') < ids.indexOf('s3') && ids.indexOf('s2') < ids.indexOf('s3'))

  const s1r = result.find(r => r.id === 's1')!
  const s3r = result.find(r => r.id === 's3')!
  assert('sibling classification is focus', s1r.classification === 'focus', s1r.classification)
  assert('cousin classification is related', s3r.classification === 'related', s3r.classification)
}

console.log('\n── Stage 7c: cousin with score=0 excluded ──')

{
  const subs: SubcategoryForLayout[] = [
    mkSub('s1', 'cat1', ['col1']),
    mkSub('s3', 'cat2', ['col1']),  // cousin, but score=0
  ]
  const scores = [mkSubScore('s1', 1.0), mkSubScore('s3', 0.0)]
  const result = computeSubcategoryColumn(subs, 'cat1', scores)

  assert('cousin with score=0 excluded', !result.some(r => r.id === 's3'))
  assert('sibling still included', result.some(r => r.id === 's1'))
}

console.log('\n── Stage 7c: pairing for >5 subcategories ──')

{
  // 2 siblings + 4 cousins = 6 total > 5 → pairing applies to cousins
  const subs: SubcategoryForLayout[] = [
    mkSub('s1', 'cat1', ['col1']),
    mkSub('s2', 'cat1', ['col1']),
    mkSub('c1', 'cat2', ['col1']),
    mkSub('c2', 'cat2', ['col1']),
    mkSub('c3', 'cat2', ['col1']),
    mkSub('c4', 'cat2', ['col1']),
  ]
  const scores = [
    mkSubScore('s1', 1.0), mkSubScore('s2', 1.0),
    mkSubScore('c1', 0.75), mkSubScore('c2', 0.70), mkSubScore('c3', 0.65), mkSubScore('c4', 0.60),
  ]
  const result = computeSubcategoryColumn(subs, 'cat1', scores)

  assert('pairing: total 6 results', result.length === 6, `got ${result.length}`)
  const siblings = result.filter(r => r.classification === 'focus')
  const cousins = result.filter(r => r.classification === 'related')
  assert('pairing: siblings keep pairingRole=none', siblings.every(r => r.pairingRole === 'none'))

  // Cousins: c1+c2 → left/right, c3+c4 → left/right
  assert('pairing: c1 is left', cousins[0].pairingRole === 'left', cousins[0].pairingRole)
  assert('pairing: c2 is right', cousins[1].pairingRole === 'right', cousins[1].pairingRole)
  assert('pairing: c3 is left', cousins[2].pairingRole === 'left', cousins[2].pairingRole)
  assert('pairing: c4 is right', cousins[3].pairingRole === 'right', cousins[3].pairingRole)
}

// ---------------------------------------------------------------------------
// Stage 7d — computeCollectionPlane
// ---------------------------------------------------------------------------

console.log('\n── Stage 7d: computeCollectionPlane — State 1 (no anchor) ──')

const mkCol = (id: string, featured: boolean, order_index: number): CollectionForLayout => ({
  id, name: `Col ${id}`, featured, order_index,
})
const mkColScore = (id: string, score: number): import('../lib/menu/scoring').ScoreResult => ({
  entityId: id,
  score,
  classification: score === 0 ? 'hidden' : score >= 0.5 ? 'focus' : 'related',
})

{
  const collections: CollectionForLayout[] = [
    mkCol('A', true, 2),
    mkCol('B', false, 1),   // non-featured, should be excluded in State 1
    mkCol('C', true, 1),
  ]
  // State 1: hasAnchor=false — only featured, left zone only, sorted by order_index
  const { leftZone, rightZone } = computeCollectionPlane(collections, [], null, [], false)

  assert('State 1: right zone empty', rightZone.length === 0)
  assert('State 1: left zone has 2 featured only', leftZone.length === 2, `got ${leftZone.length}`)
  assert('State 1: non-featured excluded', leftZone.every(c => c.featured))
  assert('State 1: sorted by order_index (C before A)', leftZone[0].id === 'C' && leftZone[1].id === 'A')
}

console.log('\n── Stage 7d: subheader exclusion and active collection always kept ──')

{
  const collections: CollectionForLayout[] = [
    mkCol('A', true, 1),    // has a subheader → excluded from bottom row
    mkCol('B', false, 2),   // active → always stays
    mkCol('C', true, 3),    // normal
  ]
  const scores = [mkColScore('A', 0.8), mkColScore('B', 1.0), mkColScore('C', 0.6)]
  // A has a subheader in the content plane (contentColumnIds=['A'])
  const { leftZone, rightZone } = computeCollectionPlane(collections, ['A'], 'B', scores, true)

  const allIds = [...leftZone, ...rightZone].map(c => c.id)
  assert('A excluded (has subheader)', !allIds.includes('A'))
  assert('B included (active, always stays)', allIds.includes('B'))
  assert('C included (normal)', allIds.includes('C'))
  assert('B is active', [...leftZone, ...rightZone].find(c => c.id === 'B')?.isActive === true)
}

console.log('\n── Stage 7d: zone split — related featured=left, related non-featured=right, filler=left ──')

{
  const collections: CollectionForLayout[] = [
    mkCol('F1', true, 1),    // featured, related (score>0) → left
    mkCol('NF1', false, 2),  // non-featured, related → right
    mkCol('F2', true, 3),    // featured, not related (score=0) → filler → left
  ]
  const scores = [mkColScore('F1', 0.8), mkColScore('NF1', 0.6), mkColScore('F2', 0.0)]
  const { leftZone, rightZone } = computeCollectionPlane(collections, [], null, scores, true)

  assert('zone split: F1 in left zone', leftZone.some(c => c.id === 'F1'))
  assert('zone split: NF1 in right zone', rightZone.some(c => c.id === 'NF1'))
  assert('zone split: filler F2 in left zone', leftZone.some(c => c.id === 'F2'))
}

console.log('\n── Stage 7d: max 8 cap with correct priority ──')

{
  // 10 related featured collections → only 8 should appear
  const collections: CollectionForLayout[] = Array.from({ length: 10 }, (_, i) =>
    mkCol(`col${i}`, true, i + 1)
  )
  const scores = collections.map(c => mkColScore(c.id, 0.9 - collections.indexOf(c) * 0.05))
  const { leftZone, rightZone } = computeCollectionPlane(collections, [], null, scores, true)

  const total = leftZone.length + rightZone.length
  assert('max 8 cap enforced', total <= 8, `got ${total}`)
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${'─'.repeat(50)}`)
console.log(`Results: ${pass} passed, ${fail} failed`)
if (fail > 0) process.exit(1)
