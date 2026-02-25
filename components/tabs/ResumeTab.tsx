'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import type { RefObject } from 'react'
import { createClient } from '@/lib/supabase/client'
import EditorRenderer from '@/components/EditorRenderer'

const TIMELINE_TOP_OFFSET = 35

type DebugSettings = {
  showDebugWindow: boolean
  showAllMarkers: boolean
}

type ResumeEntryRaw = {
  id: string
  entry_type_id: string | null
  title: string
  subtitle: string | null
  date_start: string | null
  date_end: string | null
  short_description: string | null
  description: any
  description_image_sizes?: Record<string, { width?: number; height?: number }>
  collection_id: string | null
  is_featured: boolean
  order_index: number
  resume_entry_types: {
    name: 'Left Side' | 'Right Side' | 'Center'
    icon: string | null
  } | null
  collections: {
    name: string
    slug: string
  } | null
  resume_assets: Array<{
    id: string
    asset_type: 'content' | 'link'
    content_id: string | null
    link_url: string | null
    link_title: string | null
    order_index: number
    custom_caption: string | null
    icon_key: string | null
    resume_asset_icons: {
      id: string
      name: string
      icon_url: string
      order_index: number
    } | null
    content: {
      id: string
      title: string
      type: string
    } | null
  }>
}

export default function ResumeTab({
  onOpenCollection,
  onOpenContent,
  profileHeight = 0,
  onNowMarkerInViewChange,
  onSideEntryExpandedChange
}: {
  onOpenCollection?: (slug: string, name: string) => void
  onOpenContent?: (id: string, title: string) => void
  profileHeight?: number
  onNowMarkerInViewChange?: (inView: boolean) => void
  onSideEntryExpandedChange?: (hasExpanded: boolean) => void
} = {}) {
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    showDebugWindow: false,
    showAllMarkers: false
  })
  
  const [entries, setEntries] = useState<ResumeEntryRaw[]>([])
  const [transformedEntries, setTransformedEntries] = useState<ResumeEntry[]>([])
  const [sideEntries, setSideEntries] = useState<ResumeEntry[]>([])
  const [centerEntries, setCenterEntries] = useState<ResumeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [cardHeights, setCardHeights] = useState<Map<string, { collapsed: number, expanded?: number }>>(new Map())
  
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const nowMarkerRef = useRef<HTMLDivElement | null>(null)
  
const TIMELINE_TOP_OFFSET = 35

  const [operationalMonths, setOperationalMonths] = useState<Date[]>([])
  const [activatedMarkers, setActivatedMarkers] = useState<Set<string>>(new Set())
  const [greenMarkers, setGreenMarkers] = useState<Set<string>>(new Set())
  const [blueMarkers, setBlueMarkers] = useState<Set<string>>(new Set())
  const [greenActivatedMarkers, setGreenActivatedMarkers] = useState<Set<string>>(new Set())
  const [blueActivatedMarkers, setBlueActivatedMarkers] = useState<Set<string>>(new Set())
  const [markerHeights, setMarkerHeights] = useState<Map<string, number>>(new Map())
  const [monthToEntriesMap, setMonthToEntriesMap] = useState<Map<string, string[]>>(new Map())
  
  const [standardCard, setStandardCard] = useState<ResumeEntry | null>(null)
  const [standardHeight, setStandardHeight] = useState<number | null>(null)
  
  const [markerPositions, setMarkerPositions] = useState<Map<string, number>>(new Map())
  
  const [timelineHeight, setTimelineHeight] = useState<number>(300) // Initialize with empty state height
  const SIDE_CARD_TOP_BUFFER = 15
  const START_MARKER_BOTTOM_SPACER = 20
  const leftEntries = useMemo(() => sideEntries.filter(e => e.position === 'left'), [sideEntries])
  const rightEntries = useMemo(() => sideEntries.filter(e => e.position === 'right'), [sideEntries])
  const sortedLeftEntries = useMemo(() => {
    return [...leftEntries].sort((a, b) => {
      const aEnd = a.date_end_normalized?.getTime() || Date.now()
      const bEnd = b.date_end_normalized?.getTime() || Date.now()
      return bEnd - aEnd
    })
  }, [leftEntries])
  const sortedRightEntries = useMemo(() => {
    return [...rightEntries].sort((a, b) => {
      const aEnd = a.date_end_normalized?.getTime() || Date.now()
      const bEnd = b.date_end_normalized?.getTime() || Date.now()
      return bEnd - aEnd
    })
  }, [rightEntries])
  const startSideMarkerLabels = useMemo(() => {
    const set = new Set<string>()
    sideEntries.forEach(entry => {
      if (entry.date_start_normalized) {
        set.add(formatMonthKey(entry.date_start_normalized))
      }
    })
    return set
  }, [sideEntries])
  const adjustedMarkerHeights = useMemo(() => {
    const cloned = new Map(markerHeights)
    startSideMarkerLabels.forEach(key => {
      const current = cloned.get(key) ?? standardHeight ?? 5
      cloned.set(key, current + START_MARKER_BOTTOM_SPACER)
    })
    return cloned
  }, [markerHeights, startSideMarkerLabels, standardHeight])
  const onCardHeightMeasured = useCallback((entryId: string, height: number, state: 'collapsed' | 'expanded') => {
    setCardHeights(prev => {
      const next = new Map(prev)
      const existing = next.get(entryId) || { collapsed: 0 }
      
      if (state === 'collapsed') {
        next.set(entryId, { ...existing, collapsed: height })
      } else {
        next.set(entryId, { ...existing, expanded: height })
      }
      
      return next
    })
  }, [])
  
  const toggleExpand = useCallback((entryId: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev)
      if (next.has(entryId)) {
        next.delete(entryId) // Collapse
      } else {
        next.add(entryId) // Expand
      }
      return next
    })
  }, [])

  const hasExpandedSideEntry = useMemo(() => {
    if (!sideEntries.length) return false
    return sideEntries.some(entry => expandedEntries.has(entry.id))
  }, [sideEntries, expandedEntries])

  useEffect(() => {
    if (!onSideEntryExpandedChange) return
    onSideEntryExpandedChange(hasExpandedSideEntry)
  }, [hasExpandedSideEntry, onSideEntryExpandedChange])

  useEffect(() => {
    if (!onNowMarkerInViewChange) return
    let observer: IntersectionObserver | null = null
    let retryTimer: number | null = null

    const attachObserver = () => {
      const element = nowMarkerRef.current
      if (!element) {
        retryTimer = window.setTimeout(attachObserver, 100)
        return
      }
      observer = new IntersectionObserver(
        ([entry]) => {
          onNowMarkerInViewChange(entry.isIntersecting)
        },
        { root: null, threshold: 0 }
      )
      observer.observe(element)
    }

    attachObserver()
    return () => {
      if (retryTimer) window.clearTimeout(retryTimer)
      if (observer) observer.disconnect()
    }
  }, [onNowMarkerInViewChange])
  
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createClient()
        
        const [
          { data: entriesData, error: entriesError },
          { data: iconsData, error: iconsError }
        ] = await Promise.all([
          supabase
            .from('resume_entries')
            .select(`
              *,
              resume_entry_types!inner(name, icon),
              collections(name, slug),
              resume_assets(
                id,
                asset_type,
                content_id,
                link_url,
                link_title,
                order_index,
                custom_caption,
                icon_key,
                content(id, title, type)
              )
            `)
            .eq('is_featured', true)
            .order('date_end', { ascending: false, nullsFirst: true })
            .order('date_start', { ascending: false })
            .order('order_index', { ascending: true }),
          supabase
            .from('resume_asset_icons')
            .select('id, name, icon_url, order_index')
            .order('order_index')
        ])
        
        const queryError = entriesError || iconsError
        if (queryError) {
          throw queryError
        }
        
        const iconMap = new Map<string, { id: string, name: string, icon_url: string, order_index: number }>()
        ;(iconsData || []).forEach(icon => {
          if (icon.id) iconMap.set(icon.id, icon)
        })
        
        const data = (entriesData || []).map(entry => ({
          ...entry,
          resume_assets: (entry.resume_assets || []).map((asset: any) => ({
            ...asset,
            resume_asset_icons: asset.icon_key ? iconMap.get(asset.icon_key) || null : null
          }))
        }))
        
        setEntries(data || [])
        
        
        
        const transformed: ResumeEntry[] = (data || []).map(entry => {
          const startNormalized = normalizeDate(entry.date_start)
          let endNormalized = normalizeDate(entry.date_end)
          const hasEndDateOriginal = !!entry.date_end
          
          let position: 'left' | 'right' | 'center'
          if (entry.resume_entry_types?.name === 'Left Side') {
            position = 'left'
          } else if (entry.resume_entry_types?.name === 'Right Side') {
            position = 'right'
          } else if (entry.resume_entry_types?.name === 'Center') {
            position = 'center'
          } else {
            position = 'right'
          }
          
          if (position === 'center' && !endNormalized) {
            endNormalized = startNormalized
          }
          
          const months = countMonths(startNormalized, endNormalized)
          
          return {
            ...entry,
            date_start_normalized: startNormalized,
            date_end_normalized: endNormalized,
            has_end_date_original: hasEndDateOriginal,
            monthCount: months,
            position
          }
        })
        
        setTransformedEntries(transformed)
        
        const side = transformed.filter(e => e.position === 'left' || e.position === 'right')
        const center = transformed.filter(e => e.position === 'center')
        
        setSideEntries(side)
        setCenterEntries(center)
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load entries'
        setError(errorMessage)
        console.error('❌ Error loading entries:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadEntries()
  }, [])
  
  useEffect(() => {
    const loadDebugSettings = () => {
      if (typeof window !== 'undefined') {
        const debugWindow = localStorage.getItem('resume-debug-window') === 'true'
        const allMarkers = localStorage.getItem('resume-all-markers') === 'true'
        
        setDebugSettings(prev => {
          if (prev.showDebugWindow === debugWindow && prev.showAllMarkers === allMarkers) {
            return prev
          }

          return {
            showDebugWindow: debugWindow,
            showAllMarkers: allMarkers
          }
        })
      }
    }
    
    loadDebugSettings()
    
    const interval = setInterval(loadDebugSettings, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    if (transformedEntries.length === 0) return
    
    
    const startMarker = calculateStartMarker(transformedEntries)
    const nowMarker = getCurrentMonthEST()
    const operationalMonths = generateOperationalMonths(startMarker, nowMarker)

    const allFirstOfMonth = operationalMonths.every(date => date.getDate() === 1)

    const activatedMarkersSet = new Set<string>()
    const greenActivatedMarkersSet = new Set<string>()
    const blueActivatedMarkersSet = new Set<string>()
    
    
    for (const entry of transformedEntries) {
      const isSide = entry.position === 'left' || entry.position === 'right'
      const isCenter = entry.position === 'center'
      
      const allowEndMarker =
        entry.position !== 'center' ? !!entry.date_end_normalized : entry.has_end_date_original && !!entry.date_end_normalized

      if (allowEndMarker && entry.date_end_normalized) {
        const endKey = formatMonthKey(entry.date_end_normalized)
        activatedMarkersSet.add(endKey)
        
        if (isSide) greenActivatedMarkersSet.add(endKey)
        if (isCenter) blueActivatedMarkersSet.add(endKey)
      }
      
      if (entry.date_start_normalized) {
        const startKey = formatMonthKey(entry.date_start_normalized)
        activatedMarkersSet.add(startKey)
        
        if (isSide) greenActivatedMarkersSet.add(startKey)
        if (isCenter) blueActivatedMarkersSet.add(startKey)
      }
    }
    
    
    
    
    
    const monthToEntriesMap = new Map<string, string[]>()
    const greenMarkersSet = new Set<string>() // Side entry markers
    const blueMarkersSet = new Set<string>()  // Center entry markers
    
    
    for (const entry of transformedEntries) {
      let startDate = entry.date_start_normalized
      let endDate = entry.date_end_normalized
      
      if (!endDate) {
        if (entry.position === 'left' || entry.position === 'right') {
          endDate = nowMarker
        } else if (entry.position === 'center') {
          endDate = startDate
        }
      }
      
      if (startDate && endDate) {
        const monthsInRange = getMonthsInRange(startDate, endDate)
        
        for (const month of monthsInRange) {
          const monthKey = formatMonthKey(month)
          
          if (!monthToEntriesMap.has(monthKey)) {
            monthToEntriesMap.set(monthKey, [])
          }
          monthToEntriesMap.get(monthKey)!.push(entry.id)
        }
        
        const rangeKeys = monthsInRange.map(formatMonthKey)
        
        if (entry.position === 'left' || entry.position === 'right') {
          rangeKeys.forEach(key => greenMarkersSet.add(key))
        } else if (entry.position === 'center') {
          rangeKeys.forEach(key => blueMarkersSet.add(key))
        }
      }
    }
    
    
    const sampleMonthKeys = Array.from(monthToEntriesMap.keys()).slice(0, 3)
    sampleMonthKeys.forEach(key => {
      const entryIds = monthToEntriesMap.get(key) || []
    })
    
    const totalUnique = new Set([...greenMarkersSet, ...blueMarkersSet]).size
    
    
    
    const markerHeightsMap = new Map<string, number>()
    operationalMonths.forEach(month => {
      const key = formatMonthKey(month)
      markerHeightsMap.set(key, 50) // 50px placeholder (Step 4.2 will calculate actual standard height)
    })
    
    
    setOperationalMonths(operationalMonths)
    setActivatedMarkers(activatedMarkersSet)
    setGreenMarkers(greenMarkersSet)
    setBlueMarkers(blueMarkersSet)
    setGreenActivatedMarkers(greenActivatedMarkersSet)
    setBlueActivatedMarkers(blueActivatedMarkersSet)
    setMarkerHeights(markerHeightsMap)
    setMonthToEntriesMap(monthToEntriesMap)
    
    
    
  }, [transformedEntries])
  
  useEffect(() => {
    if (sideEntries.length === 0) return
    
    const maxMonthCount = Math.max(...sideEntries.map(e => e.monthCount))
    
    const tieCandidates = sideEntries.filter(e => e.monthCount === maxMonthCount)
    
    const selected = calculateStandardCard(sideEntries)
    
    if (selected) {
      if (tieCandidates.length > 1) {
        const tier1Count = tieCandidates.filter(e => {
          if (!selected.date_end_normalized) return false
          return e.date_end_normalized && e.date_end_normalized.getTime() === selected.date_end_normalized.getTime()
        }).length
        
        if (tier1Count === 1) {
        } else if (tier1Count > 1) {
          const tier2Count = tieCandidates.filter(e => {
            if (!selected.date_start_normalized) return false
            return e.date_start_normalized && e.date_start_normalized.getTime() === selected.date_start_normalized.getTime()
          }).length
          
          if (tier2Count === 1) {
          } else {
          }
        }
      } else {
      }
      
      setStandardCard(selected)
    } else {
      setStandardCard(null)
    }
    
    
  }, [sideEntries])
  
  const detectDetachments = useCallback((
    cascadePositions: Map<string, number>,
    markerPositions: Map<string, number>,
    sideEntries: ResumeEntry[]
  ): Array<{entry: ResumeEntry, detachmentAmount: number, markerY: number}> => {
    const detachments: Array<{entry: ResumeEntry, detachmentAmount: number, markerY: number}> = []
    
    sideEntries.forEach(entry => {
      const adjustedY = cascadePositions.get(entry.id)
      if (adjustedY === undefined) return
      
      const endDate = entry.date_end_normalized || getCurrentMonthEST()
      const endKey = formatMonthKey(endDate)
      const markerY = markerPositions.get(endKey) ?? 0
      
      const detachmentAmount = adjustedY - markerY
      
      if (detachmentAmount > 0.1) { // Threshold to avoid floating point noise
        detachments.push({ entry, detachmentAmount, markerY })
      }
    })
    
    return detachments
  }, [])
  
  const adjustForDetachments = useCallback((
    baseHeights: Map<string, number>,
    detachments: Array<{entry: ResumeEntry, detachmentAmount: number, markerY: number}>,
    cardHeights: Map<string, {collapsed: number, expanded?: number}>,
    expandedEntries: Set<string>,
    standardHeight: number
  ): Map<string, number> => {
    const adjusted = new Map(baseHeights)
    
    detachments.forEach(({entry, detachmentAmount}) => {
      const isExpanded = expandedEntries.has(entry.id)
      const entryHeight = isExpanded 
        ? cardHeights.get(entry.id)?.expanded ?? cardHeights.get(entry.id)?.collapsed ?? 0
        : cardHeights.get(entry.id)?.collapsed ?? 0
      
      const actualSpanNeeded = entryHeight + detachmentAmount
      const perMonthRequired = actualSpanNeeded / entry.monthCount
      
      
      const startDate = entry.date_start_normalized || entry.date_end_normalized || getCurrentMonthEST()
      const endDate = entry.date_end_normalized || entry.date_start_normalized || getCurrentMonthEST()
      const monthSpan = getMonthsInRange(startDate, endDate)
      
      monthSpan.forEach(month => {
        const monthKey = formatMonthKey(month)
        const current = adjusted.get(monthKey) ?? standardHeight
        adjusted.set(monthKey, Math.max(current, perMonthRequired))
      })
    })
    
    return adjusted
  }, [])
  
  const checkConvergence = useCallback((
    previous: Map<string, number>,
    current: Map<string, number>
  ): number => {
    let maxDiff = 0
    
    for (const [key, currentHeight] of current) {
      const previousHeight = previous.get(key) ?? 0
      const diff = Math.abs(currentHeight - previousHeight)
      if (diff > maxDiff) {
        maxDiff = diff
      }
    }
    
    return maxDiff
  }, [])
  
  useEffect(() => {
    if (!standardCard) return
    
    
    const cardHeight = cardHeights.get(standardCard.id)
    const collapsedHeight = cardHeight?.collapsed
    
    
    if (!collapsedHeight || collapsedHeight === 0) {
      return
    }
    
    const rawCalculation = collapsedHeight / standardCard.monthCount
    const calculatedStandardHeight = Math.round(rawCalculation)
    
    
    
    setStandardHeight(calculatedStandardHeight)
    
    
  }, [standardCard, cardHeights])
  
  useEffect(() => {
    if (!standardHeight) return
    if (cardHeights.size === 0) return
    if (operationalMonths.length === 0) return
    
    if (cardHeights.size < transformedEntries.length) return
    
    let iteration = 0
    const MAX_ITERATIONS = 3
    let converged = false
    let finalCalculatedHeights = new Map<string, number>()
    
    while (!converged && iteration < MAX_ITERATIONS) {
      iteration++
      
      const requiredHeightsMap = calculateRequiredHeights(transformedEntries, cardHeights, expandedEntries)
      
      const calculatedHeights = applyMaximumHeights(requiredHeightsMap, operationalMonths, standardHeight)
      
      const tempPositions = calculateMarkerPositions(operationalMonths, calculatedHeights, standardHeight)
      
      const tempCascade = new Map<string, number>()
      
      for (const sorted of [sortedLeftEntries, sortedRightEntries]) {
        
        let previousBottom = 0
        
        sorted.forEach(entry => {
          const endDate = entry.date_end_normalized || getCurrentMonthEST()
          const endKey = formatMonthKey(endDate)
          const markerY = tempPositions.get(endKey) ?? 0
          
          const isExpanded = expandedEntries.has(entry.id)
          const entryHeight = isExpanded 
            ? cardHeights.get(entry.id)?.expanded ?? cardHeights.get(entry.id)?.collapsed ?? 0
            : cardHeights.get(entry.id)?.collapsed ?? 0
          
          const adjustedY = Math.max(markerY, previousBottom)
          tempCascade.set(entry.id, adjustedY)
          previousBottom = adjustedY + entryHeight
        })
      }
      
      const detachments = detectDetachments(tempCascade, tempPositions, sideEntries)
      
      if (detachments.length === 0) {
        converged = true
        finalCalculatedHeights = calculatedHeights
        break
      }
      
      const adjustedHeights = adjustForDetachments(calculatedHeights, detachments, cardHeights, expandedEntries, standardHeight)
      
      if (iteration > 1) {
        const maxDiff = checkConvergence(finalCalculatedHeights, adjustedHeights)
        if (maxDiff < 0.1) {
          converged = true
          finalCalculatedHeights = adjustedHeights
          break
        }
      }
      
      finalCalculatedHeights = adjustedHeights
      
    }
    
    if (iteration > 1) {
    }
    
    setMarkerHeights(finalCalculatedHeights)
    
    const totalHeight = Array.from(finalCalculatedHeights.values()).reduce((sum, h) => sum + h, 0)
    setTimelineHeight(totalHeight)
    
  }, [
    transformedEntries,
    cardHeights,
    standardHeight,
    operationalMonths,
    expandedEntries,
    sideEntries,
    sortedLeftEntries,
    sortedRightEntries
  ])
  
  useEffect(() => {
    if (operationalMonths.length === 0) return
    
    const positions = calculateMarkerPositions(operationalMonths, adjustedMarkerHeights, standardHeight)
    
    setMarkerPositions(positions)
    
  }, [operationalMonths, adjustedMarkerHeights, standardHeight])
  
  const centerEntryAdjustedPositions = useMemo(() => {
    const positions = new Map<string, number>()
    
    centerEntries.forEach(entry => {
    })
    
    centerEntries.forEach(entry => {
      if (markerPositions.size > 0 && markerHeights.size > 0) {
        
        const endDate = entry.date_end_normalized || entry.date_start_normalized
        const startDate = entry.date_start_normalized || entry.date_end_normalized
        
        if (!endDate || !startDate) {
          return // Skip entries with ZERO dates (shouldn't happen)
        }
        
        const missingStatus = !entry.date_start_normalized ? 'MISSING START' : 
                             !entry.date_end_normalized ? 'MISSING END' : 'both dates'
        if (missingStatus !== 'both dates') {
        }
        
        const startKey = formatMonthKey(startDate)
        const endKey = formatMonthKey(endDate)
        
        
        const startY = markerPositions.get(startKey) ?? 0 // Start marker TOP position
        const endY = markerPositions.get(endKey) ?? 0     // End marker TOP position
        
        
        const startHeight = markerHeights.get(startKey) ?? standardHeight ?? 5
        const endHeight = markerHeights.get(endKey) ?? standardHeight ?? 5
        
        
        const totalSpan = (startY + startHeight) - endY
        
        
        const monthsInSpan = getMonthsInRange(startDate, endDate)
        const spanViaSumHeights = monthsInSpan.reduce((sum, month) => {
          const monthKey = formatMonthKey(month)
          const height = markerHeights.get(monthKey) ?? standardHeight ?? 5
          return sum + height
        }, 0)
        
        const cardHeight = cardHeights.get(entry.id)?.collapsed ?? 0
        
        const centerOffset = (totalSpan - cardHeight) / 2
        
        const centeredY = endY + centerOffset + 35
        
        positions.set(entry.id, centeredY)
        
        
      }
    })
    
    if (positions.size < centerEntries.length) {
    }
    
    if (positions.size > 0 && cardHeights.size > 0) {
      
      const sortedCenterEntries = [...centerEntries]
        .filter(entry => positions.has(entry.id)) // Only entries with positions
        .sort((a, b) => {
          const posA = positions.get(a.id) ?? 0
          const posB = positions.get(b.id) ?? 0
          return posA - posB // ascending Y (top of page = smaller Y)
        })
      
      sortedCenterEntries.forEach((entry, idx) => {
        const y = positions.get(entry.id) ?? 0
      })
      
      let overlapsDetected = 0
      let tightSpacings = 0
      
      for (let i = 0; i < sortedCenterEntries.length - 1; i++) {
        const entry1 = sortedCenterEntries[i]
        const entry2 = sortedCenterEntries[i + 1]
        
        const entry1Y = positions.get(entry1.id) ?? 0
        const entry2Y = positions.get(entry2.id) ?? 0
        
        const entry1Height = cardHeights.get(entry1.id)?.collapsed ?? 0
        const entry1Bottom = entry1Y + entry1Height
        
        const gapBetween = entry2Y - entry1Bottom
        
        if (gapBetween < 0) {
          overlapsDetected++
        } else if (gapBetween < 16) {
          tightSpacings++
        } else {
        }
      }
      
      if (overlapsDetected > 0) {
      } else {
      }
      
      if (tightSpacings > 0) {
      }
      
    }
    
    return positions
  }, [centerEntries, markerPositions, markerHeights, cardHeights, standardHeight])
  
  const sideEntryCollisions = useMemo(() => {
    const collisions: Array<{
      entry1: ResumeEntry
      entry2: ResumeEntry
      overlapAmount: number
      side: 'left' | 'right'
    }> = []
    
    const leftEntries = sideEntries.filter(e => e.position === 'left')
    const rightEntries = sideEntries.filter(e => e.position === 'right')
    
    for (const entries of [leftEntries, rightEntries]) {
      if (entries.length === 0) continue
      
      const sorted = [...entries].sort((a, b) => {
        const aEnd = a.date_end_normalized?.getTime() || Date.now()
        const bEnd = b.date_end_normalized?.getTime() || Date.now()
        return bEnd - aEnd // Descending: newest end date first
      })
      
      for (let i = 0; i < sorted.length - 1; i++) {
        const entry1 = sorted[i] // Higher/newer entry (displayed above)
        const entry2 = sorted[i + 1] // Lower/older entry (displayed below)
        
        const entry1EndKey = formatMonthKey(entry1.date_end_normalized || getCurrentMonthEST())
      const entry1Y = (markerPositions.get(entry1EndKey) ?? 0) + TIMELINE_TOP_OFFSET + SIDE_CARD_TOP_BUFFER
        const entry1Height = cardHeights.get(entry1.id)?.collapsed ?? 0
        const entry1Bottom = entry1Y + entry1Height
        
        const entry2EndKey = formatMonthKey(entry2.date_end_normalized || getCurrentMonthEST())
      const entry2Y = (markerPositions.get(entry2EndKey) ?? 0) + TIMELINE_TOP_OFFSET + SIDE_CARD_TOP_BUFFER
        
        const gap = entry2Y - entry1Bottom
        
        if (gap < 0) {
          const overlapAmount = Math.abs(gap)
          collisions.push({
            entry1,
            entry2,
            overlapAmount,
            side: entry1.position as 'left' | 'right'
          })
        }
      }
    }
    
    if (collisions.length > 0) {
    }
    
    return collisions
  }, [sideEntries, markerPositions, cardHeights])
  
  const collisionSpacingRequirements = useMemo(() => {
    const requirements = new Map<string, number>() // monthKey → additional height needed
    
    if (sideEntryCollisions.length === 0) {
      return requirements
    }
    
    
    let skippedCollisions = 0
    
    sideEntryCollisions.forEach((collision, idx) => {
      const { entry1, entry2, overlapAmount, side } = collision
      
      
      
      const entry1EndDate = entry1.date_end_normalized || entry1.date_start_normalized || getCurrentMonthEST()
      const entry2StartDate = entry2.date_start_normalized || entry2.date_end_normalized || getCurrentMonthEST()
      
      if (!entry1.date_end_normalized && entry1.date_start_normalized) {
      }
      if (!entry2.date_start_normalized && entry2.date_end_normalized) {
      }
      if (!entry1.date_end_normalized && !entry1.date_start_normalized) {
      }
      if (!entry2.date_start_normalized && !entry2.date_end_normalized) {
      }
      
      const entry1EndKey = formatMonthKey(entry1EndDate)
      const entry2StartKey = formatMonthKey(entry2StartDate)
      
      const entry1Y = (markerPositions.get(entry1EndKey) ?? 0) + TIMELINE_TOP_OFFSET
      const entry2StartY = (markerPositions.get(entry2StartKey) ?? 0) + TIMELINE_TOP_OFFSET
      
      const currentSpan = entry2StartY - entry1Y
      const entry1Height = cardHeights.get(entry1.id)?.collapsed ?? 0
      const requiredSpan = entry1Height
      
      
      if (entry2StartDate <= entry1EndDate) {
        skippedCollisions++
        return
      }
      
      const additionalNeeded = Math.max(0, requiredSpan - currentSpan)
      
      if (additionalNeeded > 0) {
        
        const monthsInSpan = getMonthsInRange(entry1EndDate, entry2StartDate)
        
        if (monthsInSpan.length === 0) {
          return
        }
        
        const additionalPerMonth = additionalNeeded / monthsInSpan.length
        
        
        monthsInSpan.forEach(month => {
          const key = formatMonthKey(month)
          const existing = requirements.get(key) || 0
          const newRequirement = Math.max(existing, additionalPerMonth)
          
          if (newRequirement > existing) {
            requirements.set(key, newRequirement)
          }
        })
      } else {
      }
    })
    
    if (requirements.size > 0) {
      Array.from(requirements.entries())
        .sort((a, b) => b[0].localeCompare(a[0])) // Sort descending (newest first)
        .forEach(([monthKey, height]) => {
        })
    }
    
    return requirements
  }, [sideEntryCollisions, markerPositions, cardHeights])
  
  const sideEntryAdjustedPositions = useMemo(() => {
    const positions = new Map<string, number>() // entryId → adjusted Y position
    const getEndMarkerBottom = (entry: ResumeEntry) => {
      const endDate = entry.date_end_normalized || getCurrentMonthEST()
      const endKey = formatMonthKey(endDate)
      const top = markerPositions.get(endKey) ?? 0
      const height = markerHeights.get(endKey) ?? standardHeight ?? 5
      return top + TIMELINE_TOP_OFFSET + SIDE_CARD_TOP_BUFFER // top + offset + buffer
    }
    
    const leftEntries = sideEntries.filter(e => e.position === 'left')
    const rightEntries = sideEntries.filter(e => e.position === 'right')
    
    let totalDetachments = 0
    
    for (const entries of [leftEntries, rightEntries]) {
      if (entries.length === 0) continue
      
      const sorted = [...entries].sort((a, b) => {
        const aEnd = a.date_end_normalized?.getTime() || Date.now()
        const bEnd = b.date_end_normalized?.getTime() || Date.now()
        return bEnd - aEnd // Descending: newest end date first
      })
      
      let previousBottom = 0 // Track previous card bottom for cascade
      
      sorted.forEach((entry, index) => {
        const markerY = getEndMarkerBottom(entry)
        
        const height = expandedEntries.has(entry.id)
          ? (cardHeights.get(entry.id)?.expanded ?? cardHeights.get(entry.id)?.collapsed ?? 0)
          : (cardHeights.get(entry.id)?.collapsed ?? 0)
        
        const adjustedY = index === 0 ? markerY : Math.max(markerY, previousBottom)
        
        positions.set(entry.id, adjustedY)
        
        previousBottom = adjustedY + height
        
        if (index > 0 && adjustedY > markerY + 0.1) {
          totalDetachments++
        }
      })
    }
    
    if (totalDetachments === 0 && sideEntries.length > 0) {
    }
    
    return positions
  }, [sideEntries, markerPositions, cardHeights, expandedEntries])
  
  const sideLineData = useMemo(() => {
    if (sideEntries.length === 0 || markerPositions.size === 0 || adjustedMarkerHeights.size === 0) {
      return []
    }
    
    const entriesWithY = sideEntries.map(entry => {
      const endDate = entry.date_end_normalized || getCurrentMonthEST()
      const fallbackY = markerPositions.get(formatMonthKey(endDate)) ?? 0
      const adjustedY = sideEntryAdjustedPositions.get(entry.id)
      return { entry, y: adjustedY !== undefined ? adjustedY : fallbackY }
    }).sort((a, b) => a.y - b.y)

    const colorMap = new Map<string, string>()
    entriesWithY.forEach((item, idx) => {
      const colorIdx = idx % SIDE_LINE_COLORS.length
      colorMap.set(item.entry.id, SIDE_LINE_COLORS[colorIdx])
    })

    const lines: Array<{
      entryId: string
      startY: number
      endY: number
      color: string
      side: 'left' | 'right'
    }> = []
    
    sideEntries.forEach((entry, index) => {
      const adjustedY = sideEntryAdjustedPositions.get(entry.id)
      
      let startY = 0
      let endY = 0
      let endKeyForDebug = ''
      
      const endDate = entry.date_end_normalized || getCurrentMonthEST()
      const endKey = formatMonthKey(endDate)
      endKeyForDebug = endKey
      const endMarkerY = markerPositions.get(endKey) ?? 0
      const endMarkerHeight = adjustedMarkerHeights.get(endKey) ?? standardHeight ?? 5
      
      const startDate = entry.date_start_normalized || endDate
      const startKey = formatMonthKey(startDate)
      const startMarkerY = markerPositions.get(startKey) ?? 0
      const startMarkerHeight = adjustedMarkerHeights.get(startKey) ?? standardHeight ?? 5
      
      const endBuffer = Math.min(20, endMarkerHeight / 1) // stay inside end marker
      const startBuffer = Math.min(10, startMarkerHeight / 10) // stay inside start marker
      const startOffsetForPresent = (!entry.has_end_date_original && (entry.position === 'left' || entry.position === 'right')) ? 0 : endBuffer
      startY = endMarkerY + startOffsetForPresent // near top of end marker; Present entries start exactly at marker top
      endY = startMarkerY + startMarkerHeight - startBuffer // near bottom of start marker (match label move)
      
      
      if (endY <= startY) {
        return
      }
      
      const color = colorMap.get(entry.id) ?? SIDE_LINE_COLORS[index % SIDE_LINE_COLORS.length]
      
      const side = entry.position as 'left' | 'right'
      
      lines.push({
        entryId: entry.id,
        startY,
        endY,
        color,
        side
      })
    })
    
    return lines
  }, [sideEntries, markerPositions, adjustedMarkerHeights, cardHeights, standardHeight, sideEntryAdjustedPositions])
  
  const resumeTopOffset = 1 // target gap below Profile

  return (
    <div
      className="max-w-6xl mx-auto p-8"
      style={{ paddingTop: `${resumeTopOffset}px` }}
    >
      {loading && (
        <div className="text-white text-center py-8">
          <div className="text-lg">Loading resume entries...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
          <div className="text-red-400 font-semibold mb-2">Error loading entries:</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      )}
      
      {!loading && (
        <>
          {debugSettings.showDebugWindow && (
            <DebugWindow 
              debugSettings={debugSettings} 
              entries={entries}
              transformedEntries={transformedEntries}
              sideEntries={sideEntries}
              centerEntries={centerEntries}
              cardHeights={cardHeights}
              expandedEntries={expandedEntries}
              operationalMonths={operationalMonths}
              activatedMarkers={activatedMarkers}
              greenMarkers={greenMarkers}
              blueMarkers={blueMarkers}
              greenActivatedMarkers={greenActivatedMarkers}
              blueActivatedMarkers={blueActivatedMarkers}
              markerHeights={markerHeights}
              monthToEntriesMap={monthToEntriesMap}
              standardCard={standardCard}
              standardHeight={standardHeight}
              timelineHeight={timelineHeight}
            />
          )}
          
          <div 
            className="relative" 
            style={{ 
              height: `${35 + timelineHeight + 400}px`, // Step 5.1 Fix 8: 300px continuation + 100px buffer
              transition: 'height 300ms ease-out' // Step 5.1 Fix 10: Smooth height changes during expansion
            }}
          >
            <Timeline 
              nowMarkerRef={nowMarkerRef}
              debugSettings={debugSettings}
              operationalMonths={operationalMonths}
              activatedMarkers={activatedMarkers}
              greenActivatedMarkers={greenActivatedMarkers}
              blueActivatedMarkers={blueActivatedMarkers}
            markerHeights={adjustedMarkerHeights}
              markerPositions={markerPositions}
              timelineHeight={timelineHeight}
              sideLineData={sideLineData}
            startSideMarkers={startSideMarkerLabels}
            startMarkerLabelOffset={SIDE_CARD_TOP_BUFFER}
            startMarkerLabelBufferBottom={START_MARKER_BOTTOM_SPACER}
            />
            
            {sideEntries.map((entry, index) => (
              <EntryCard 
                key={entry.id}
                entry={entry}
                position={entry.position as 'left' | 'right'}
                index={index}
                isExpanded={expandedEntries.has(entry.id)}
                onToggleExpand={() => toggleExpand(entry.id)}
                onHeightMeasured={onCardHeightMeasured}
                markerPositions={markerPositions}
                sideAdjustedY={sideEntryAdjustedPositions.get(entry.id)} // Fix 9 Stage 3: Pass cascade-adjusted position
                onOpenCollection={onOpenCollection}
                onOpenContent={onOpenContent}
              />
            ))}
            
            {centerEntries.map((entry, index) => (
              <EntryCard 
                key={entry.id}
                entry={entry}
                position='center'
                index={index}
                isExpanded={expandedEntries.has(entry.id)}
                onToggleExpand={() => toggleExpand(entry.id)}
                onHeightMeasured={onCardHeightMeasured}
                markerPositions={markerPositions}
                centerAdjustedY={centerEntryAdjustedPositions.get(entry.id)} // Step 5.1 Fix 5: Pass centered position
                onOpenCollection={onOpenCollection}
                onOpenContent={onOpenContent}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DebugWindow({ 
  debugSettings, 
  entries,
  transformedEntries,
  sideEntries,
  centerEntries,
  cardHeights,
  expandedEntries,
  operationalMonths,
  activatedMarkers,
  greenMarkers,
  blueMarkers,
  greenActivatedMarkers,
  blueActivatedMarkers,
  markerHeights,
  monthToEntriesMap,
  standardCard,
  standardHeight,
  timelineHeight
}: { 
  debugSettings: DebugSettings
  entries: ResumeEntryRaw[]
  transformedEntries: ResumeEntry[]
  sideEntries: ResumeEntry[]
  centerEntries: ResumeEntry[]
  cardHeights: Map<string, { collapsed: number, expanded?: number }>
  expandedEntries: Set<string>
  operationalMonths: Date[]
  activatedMarkers: Set<string>
  greenMarkers: Set<string>
  blueMarkers: Set<string>
  greenActivatedMarkers: Set<string>
  blueActivatedMarkers: Set<string>
  markerHeights: Map<string, number>
  monthToEntriesMap: Map<string, string[]>
  standardCard: ResumeEntry | null
  standardHeight: number | null
  timelineHeight: number
}) {
  const [markersExpanded, setMarkersExpanded] = useState(false)
  
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Present'
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }
  
  const formatMonthDisplay = (monthKey: string): string => {
    const [year, month] = monthKey.split('-')
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December']
    const monthIndex = parseInt(month, 10) - 1
    return `${monthNames[monthIndex]} ${year}`
  }
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-white text-xl font-bold mb-4">Resume Timeline Debug</h2>
      
      <div className="mb-4">
        <div className="text-gray-300 mb-2">
          <span className="text-white font-semibold">Featured Entries:</span> {entries.length}
        </div>
        <div className="text-gray-300 mb-2">
          <span className="text-white font-semibold">Expanded:</span> {expandedEntries.size}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-white font-semibold mb-2">Standard Card:</div>
        {!standardCard || !standardHeight ? (
          <div className="text-gray-400 text-sm">No entries yet</div>
        ) : (
          <div className="text-sm space-y-1">
            <div className="text-gray-300">
              <span className="text-white font-semibold">Title:</span> {standardCard.title}
            </div>
            <div className="text-gray-300">
              <span className="text-white font-semibold">Start Month:</span>{' '}
              {standardCard.date_start_normalized 
                ? formatMonthDisplay(formatMonthKey(standardCard.date_start_normalized))
                : 'null'}
            </div>
            <div className="text-gray-300">
              <span className="text-white font-semibold">End Month:</span>{' '}
              {standardCard.date_end_normalized 
                ? formatMonthDisplay(formatMonthKey(standardCard.date_end_normalized))
                : 'Present'}
            </div>
            <div className="text-gray-300">
              <span className="text-white font-semibold">Month Count:</span> {standardCard.monthCount} months
            </div>
            <div className="text-gray-300">
              <span className="text-white font-semibold">Card Height:</span>{' '}
              {cardHeights.get(standardCard.id)?.collapsed || 0}px
            </div>
            <div className="text-gray-300">
              <span className="text-white font-semibold">Standard Marker Height:</span> {standardHeight}px
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="text-gray-300 mb-2">
          <span className="text-white font-semibold">Timeline Height:</span> {timelineHeight.toFixed(2)}px
        </div>
        <div className="text-gray-300 mb-2">
          <span className="text-white font-semibold">Operational Markers:</span> {operationalMonths.length}
        </div>
        <div className="text-gray-300 mb-2">
          <span className="text-white font-semibold">Activated Markers:</span> {activatedMarkers.size}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-white font-semibold mb-2">Entries:</div>
        {transformedEntries.length === 0 ? (
          <div className="text-gray-400 text-sm">No entries loaded</div>
        ) : (
          <div className="space-y-2">
            {transformedEntries.map(entry => {
              const height = cardHeights.get(entry.id)
              return (
                <div key={entry.id} className="text-gray-300 text-sm font-mono">
                  <div className="text-white font-semibold">{entry.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    <span className={
                      entry.position === 'left' ? 'text-yellow-400' :
                      entry.position === 'right' ? 'text-green-400' :
                      'text-red-400'
                    }>
                      [{entry.position.toUpperCase()}]
                    </span>
                    {' | '}
                    {formatDate(entry.date_end_normalized)} → {formatDate(entry.date_start_normalized)}
                    {' | '}
                    {entry.monthCount} month{entry.monthCount !== 1 ? 's' : ''}
                  </div>
                  {height && (
                    <div className="text-xs text-gray-500 mt-1">
                      <div>Height: {height.collapsed}px (collapsed)</div>
                      {height.expanded && (
                        <div>Height: {height.expanded}px (expanded)</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-800 pt-4">
        <button 
          onClick={() => setMarkersExpanded(!markersExpanded)}
          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-2"
        >
          Show Markers {markersExpanded ? '▲' : '▼'}
        </button>
        
        {markersExpanded && (
          <div className="mt-3 text-gray-400 text-sm">
            {operationalMonths.length === 0 ? (
              <p className="mb-2">No markers yet (no entries loaded)</p>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-3">
                  Marker debug mode: Toggle in admin panel to visualize operational markers on timeline (Step 4.3+)
                </p>
                
                <div className="mb-3 pb-3 border-b border-gray-700">
                  <p className="text-xs">
                    <span className="text-gray-400">Marker Debug Mode:</span>{' '}
                    <span className={debugSettings.showAllMarkers ? 'text-emerald-400' : 'text-gray-500'}>
                      {debugSettings.showAllMarkers ? 'ON' : 'OFF'}
                    </span>
                  </p>
                </div>
                
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {operationalMonths.map((month, index) => {
                    const monthKey = formatMonthKey(month)
                    const isActivated = activatedMarkers.has(monthKey)
                    const isGreen = greenMarkers.has(monthKey)
                    const isBlue = blueMarkers.has(monthKey)
                    const isGreenActivated = greenActivatedMarkers.has(monthKey)
                    const isBlueActivated = blueActivatedMarkers.has(monthKey)
                    const height = markerHeights.get(monthKey) || 0
                    
                    return (
                      <div key={monthKey} className="text-xs flex items-center gap-2">
                        <span className="w-3">{isActivated ? '✓' : '○'}</span>
                        <span className="w-32">{formatMonthDisplay(monthKey)}</span>
                        <span className="w-16 text-gray-500">{height}px</span>
                        {isActivated && (
                          <>
                            {isGreenActivated && isBlueActivated ? (
                              <span className="flex items-center gap-1">
                                <span className="text-emerald-400">(green)</span>
                                <span className="text-blue-400">(blue)</span>
                              </span>
                            ) : isGreen && isBlue ? (
                              <span className="text-purple-400">(green+blue)</span>
                            ) : isGreen ? (
                              <span className="text-emerald-400">(green)</span>
                            ) : isBlue ? (
                              <span className="text-blue-400">(blue)</span>
                            ) : null}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function formatDateRange(start: Date | null, end: Date | null): string {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  
  const formatMonth = (date: Date | null): string => {
    if (!date) return 'Present'
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }
  
  if (!start) {
    return formatMonth(end)
  }
  
  const startStr = formatMonth(start)
  const endStr = formatMonth(end)
  
  return `${startStr} → ${endStr}`
}

function formatSingleDate(date: Date | null): string {
  if (!date) return 'Present'
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

function shouldShowExpandButton(entry: ResumeEntry): boolean {
  return entry.description !== null && entry.description !== undefined
}

function shouldShowSamplesButton(entry: ResumeEntry): boolean {
  return entry.collection_id !== null
}

function shouldShowExpandButtonCenter(entry: ResumeEntry): boolean {
  return entry.short_description !== null && 
         entry.short_description !== undefined && 
         entry.short_description !== ''
}

function estimateCenterCardExpandedHeight(shortDescription: string): number {
  return shortDescription.length <= 60 ? 24 : 48
}

const SIDE_LINE_COLORS: readonly string[] = [
  '#7FE835', '#35E4E8', '#A9EDF7', '#46F9C1', '#DC5520', '#25277A',
  '#23A0C0', '#71A6EE', '#986BA1', '#C896E4', '#3D9DBB', '#9C6321',
  '#FC3549', '#352B97', '#6EFB81', '#7F86E0', '#D1201B', '#24D025'
] as const // 18 colors total

function assignSideLineColor(index: number): string {
  const colorIndex = index % 18
  return SIDE_LINE_COLORS[colorIndex]
}

interface SideLineProps {
  entryId: string
  startY: number  // End date marker position (top of line, newer date)
  endY: number    // Start date marker position + height (bottom of line, older date)
  color: string   // Assigned color from SIDE_LINE_COLORS
  side: 'left' | 'right'  // Entry side determines horizontal offset
}

function SideLine({ entryId, startY, endY, color, side }: SideLineProps) {
  const lineHeight = endY - startY
  
  if (lineHeight <= 0) {
    return null
  }
  
  const fadePx = Math.min(40, lineHeight / 2)
  const colorTransparent = `${color}00` // 8-digit hex with alpha 0
  
  const xOffset = side === 'left' ? '-10px' : '10px'
  
  return (
    <div
      className="absolute"
      style={{
        top: `${startY}px`,
        left: `calc(50% + ${xOffset})`,
        height: `${lineHeight}px`,
        width: '2px',
        backgroundImage: `linear-gradient(to bottom, ${colorTransparent} 0px, ${color} ${fadePx}px, ${color} ${lineHeight - fadePx}px, ${colorTransparent} 100%)`,
        zIndex: 5  // Above timeline (z-0), below markers (z-10) and entries (z-20+)
      }}
    />
  )
}

function calculateRequiredHeights(
  transformedEntries: ResumeEntry[],
  cardHeights: Map<string, {collapsed: number, expanded?: number}>,
  expandedEntries: Set<string> // Step 4.7 Stage 1: expandedEntries Set determines which heights to use (expanded vs collapsed)
): Map<string, Map<string, number>> {
  const requiredHeightsMap = new Map<string, Map<string, number>>()
  
  
  for (const entry of transformedEntries) {
    const isExpanded = expandedEntries.has(entry.id)
    const entryHeight = isExpanded 
      ? (cardHeights.get(entry.id)?.expanded || cardHeights.get(entry.id)?.collapsed)
      : cardHeights.get(entry.id)?.collapsed
    
    if (!entryHeight) {
      continue
    }
    
    const requiredPerMonth = entryHeight / entry.monthCount
    
    let startDate = entry.date_start_normalized
    let endDate = entry.date_end_normalized
    
    if (!endDate) {
      if (entry.position === 'left' || entry.position === 'right') {
        endDate = getCurrentMonthEST()
      } else {
        endDate = startDate
      }
    }
    
    if (!startDate) {
      startDate = endDate
    }
    
    const monthSpan = getMonthsInRange(startDate, endDate)
    
    for (const month of monthSpan) {
      const monthKey = formatMonthKey(month)
      
      if (!requiredHeightsMap.has(monthKey)) {
        requiredHeightsMap.set(monthKey, new Map<string, number>())
      }
      
      requiredHeightsMap.get(monthKey)!.set(entry.id, requiredPerMonth)
    }
    
    const heightType = isExpanded ? 'expanded' : 'collapsed'
  }
  
  let count = 0
  for (const [monthKey, entryMap] of requiredHeightsMap) {
    if (count >= 3) break
    const entries = Array.from(entryMap.entries())
    entries.forEach(([entryId, height]) => {
      const entry = transformedEntries.find(e => e.id === entryId)
    })
    count++
  }
  
  
  return requiredHeightsMap
}

function applyMaximumHeights(
  requiredHeightsMap: Map<string, Map<string, number>>,
  operationalMonths: Date[],
  standardHeight: number
): Map<string, number> {
  const updatedMarkerHeights = new Map<string, number>()
  
  
  let gapMonthsCount = 0
  let entriesExpandingCount = 0
  let entriesUsingStandardCount = 0
  
  for (const month of operationalMonths) {
    const monthKey = formatMonthKey(month)
    
    const entryRequirementsMap = requiredHeightsMap.get(monthKey)
    
    if (!entryRequirementsMap) {
      updatedMarkerHeights.set(monthKey, standardHeight)
      gapMonthsCount++
    } else {
      const allRequiredHeights = Array.from(entryRequirementsMap.values())
      const maximumRequired = Math.max(...allRequiredHeights)
      
      const finalHeight = Math.max(standardHeight, maximumRequired)
      
      if (entriesExpandingCount < 3) {
      }
      
      updatedMarkerHeights.set(monthKey, finalHeight)
      
      if (maximumRequired > standardHeight) {
        entriesExpandingCount++
      } else {
        entriesUsingStandardCount++
      }
    }
  }
  
  
  let sampleCount = 0
  for (const [monthKey, entryRequirementsMap] of requiredHeightsMap) {
    if (sampleCount >= 5) break
    
    const allRequiredHeights = Array.from(entryRequirementsMap.values())
    const maximumRequired = Math.max(...allRequiredHeights)
    const finalHeight = updatedMarkerHeights.get(monthKey)!
    
    
    sampleCount++
  }
  
  
  return updatedMarkerHeights
}

function EntryCard({ 
  entry, 
  position,
  index,
  isExpanded,
  onToggleExpand,
  onHeightMeasured,
  markerPositions,
  centerAdjustedY,  // Step 5.1 Fix 5: Centered Y position for center entries
  sideAdjustedY,    // Fix 9 Stage 3: Cascade-adjusted Y position for side entries
  onOpenCollection,
  onOpenContent
}: { 
  entry: ResumeEntry
  position: 'left' | 'right' | 'center'
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
  onHeightMeasured: (entryId: string, height: number, state: 'collapsed' | 'expanded') => void
  markerPositions: Map<string, number>
  centerAdjustedY?: number  // Step 5.1 Fix 5: Centered Y position for center entries
  sideAdjustedY?: number    // Fix 9 Stage 3: Cascade-adjusted Y position for side entries
  onOpenCollection?: (slug: string, name: string) => void
  onOpenContent?: (id: string, title: string) => void
}) {
  const normalizeLink = useCallback((url?: string | null) => {
    if (!url) return null
    const trimmed = url.trim()
    if (!trimmed) return null
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return `https://${trimmed}`
  }, [])
  const measureRef = useRef<HTMLDivElement>(null)
  const [editorReady, setEditorReady] = useState(false)
  
  const handleEditorReady = useCallback(() => {
    setEditorReady(true)
  }, [entry.title])
  
  useEffect(() => {
    if (measureRef.current && !isExpanded) {
      const height = measureRef.current.getBoundingClientRect().height
      onHeightMeasured(entry.id, height, 'collapsed')
    }
  }, [entry.id])
  
  useEffect(() => {
    const canMeasureExpanded = isExpanded && (position === 'center' || editorReady)
    
    if (canMeasureExpanded && measureRef.current) {
      requestAnimationFrame(() => {
        if (measureRef.current) {
          const height = measureRef.current.getBoundingClientRect().height
          onHeightMeasured(entry.id, height, 'expanded')
          
          if (position === 'center' && entry.short_description) {
            const estimated = estimateCenterCardExpandedHeight(entry.short_description)
          } else {
          }
        }
      })
    }
    
    if (!isExpanded && position !== 'center') {
      setEditorReady(false)
    }
  }, [isExpanded, editorReady, entry.id, entry.title, entry.short_description, position, onHeightMeasured])
  
  const borderClass = entry.is_featured ? 'border-emerald-400' : 'border-gray-800'
  const shadowClass = entry.is_featured ? 'shadow-lg shadow-emerald-900/20' : ''
  const baseClasses = `bg-gray-900 border-2 ${borderClass} ${shadowClass} rounded-lg p-6`
  
  let topPosition = 0 // Will be set from markerPositions Map
  
  if (position === 'center') {
    
    if (centerAdjustedY !== undefined) {
      topPosition = centerAdjustedY
      
    } else {
      const positioningDate = entry.date_end_normalized || entry.date_start_normalized
      if (positioningDate) {
        const monthKey = formatMonthKey(positioningDate)
        const markerYPosition = markerPositions.get(monthKey) ?? 0
        topPosition = markerYPosition
      }
    }
  } else {
    if (sideAdjustedY !== undefined) {
      topPosition = sideAdjustedY
    } else {
      const positioningDate = entry.date_end_normalized || getCurrentMonthEST()
      const monthKey = formatMonthKey(positioningDate)
      const markerYPosition = markerPositions.get(monthKey) ?? 0
      topPosition = markerYPosition
    }
  }
  
  const dateRange = formatDateRange(entry.date_start_normalized, entry.date_end_normalized)
  
  if (position === 'left') {
    return (
      <div 
        ref={measureRef}
        className={`${baseClasses} w-[560px] text-right absolute`}
        style={{
          right: 'calc(50% + 70px)',
          top: `${topPosition}px`,
          transition: 'top 300ms ease-out' // Step 5.1 Fix 10: Smooth position changes during expansion
        }}
      >
        <div className="text-gray-400 text-sm mb-3">
          {dateRange}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1">
          {entry.title}
        </h3>
        
        {entry.subtitle && (
          <div className="text-gray-400 text-base mb-2">
            {entry.subtitle}
          </div>
        )}
        
        {entry.short_description && (
          <div className="text-gray-300 text-base mb-4">
            {entry.short_description}
          </div>
        )}
        
        {isExpanded && entry.description && (
          <div className="transition-all duration-300 ease-in-out overflow-hidden mb-4">
            <EditorRenderer data={entry.description} imageSizes={entry.description_image_sizes} onReady={handleEditorReady} />
          </div>
        )}
        
        {entry.resume_assets && entry.resume_assets.length > 0 && (
          <div className="flex justify-end gap-3 mb-3">
            {entry.resume_assets.map(asset => {
              const caption = asset.custom_caption || asset.content?.title || asset.link_title || 'Asset'
              const iconUrl = asset.resume_asset_icons?.icon_url
              const handleAssetClick = () => {
                if (asset.asset_type === 'content' && asset.content_id) {
                  onOpenContent?.(asset.content_id, asset.content?.title || 'Content')
                } else if (asset.asset_type === 'link' && asset.link_url) {
                  const href = normalizeLink(asset.link_url)
                  if (href) {
                    window.open(href, '_blank', 'noopener,noreferrer')
                  }
                }
              }
              return (
                <div
                  key={asset.id}
                  className="cursor-pointer rounded-md border border-gray-800 bg-gray-850/80 hover:border-emerald-500 transition-colors"
                  style={{ width: '100px', height: '140px' }}
                  onClick={handleAssetClick}
                >
                  <div className="flex flex-col justify-between h-full p-2">
                    <div className="flex items-start">
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={asset.resume_asset_icons?.name || 'icon'}
                          style={{
                            maxWidth: '30px',
                            maxHeight: '30px',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <div
                          className="bg-gray-700 rounded-sm"
                          style={{ width: '20px', height: '20px' }}
                        />
                      )}
                    </div>
                    <div className="text-gray-200 text-sm leading-4 overflow-hidden">
                      {caption}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          {shouldShowSamplesButton(entry) ? (
            <div
              className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm cursor-pointer"
              onClick={() => {
                const slug = entry.collections?.slug
                const name = entry.collections?.name
                if (slug && name) {
                  onOpenCollection?.(slug, name)
                }
              }}
            >
              Samples →
            </div>
          ) : (
            <div></div> // Spacer if no Samples button
          )}
          
          {shouldShowExpandButton(entry) && (
            <div 
              onClick={onToggleExpand}
              className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm cursor-pointer"
            >
              {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  if (position === 'right') {
    return (
      <div 
        ref={measureRef}
        className={`${baseClasses} w-[560px] text-left absolute`}
        style={{
          left: 'calc(50% + 70px)',
          top: `${topPosition}px`,
          transition: 'top 300ms ease-out' // Step 5.1 Fix 10: Smooth position changes during expansion
        }}
      >
        <div className="text-gray-400 text-sm mb-3">
          {dateRange}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1">
          {entry.title}
        </h3>
        
        {entry.subtitle && (
          <div className="text-gray-400 text-base mb-2">
            {entry.subtitle}
          </div>
        )}
        
        {entry.short_description && (
          <div className="text-gray-300 text-base mb-4">
            {entry.short_description}
          </div>
        )}
        
        {isExpanded && entry.description && (
          <div className="transition-all duration-300 ease-in-out overflow-hidden mb-4">
            <EditorRenderer data={entry.description} imageSizes={entry.description_image_sizes} onReady={handleEditorReady} />
          </div>
        )}
        
        {entry.resume_assets && entry.resume_assets.length > 0 && (
          <div className="flex justify-start gap-3 mb-3">
            {entry.resume_assets.map(asset => {
              const caption = asset.custom_caption || asset.content?.title || asset.link_title || 'Asset'
              const iconUrl = asset.resume_asset_icons?.icon_url
              const handleAssetClick = () => {
                if (asset.asset_type === 'content' && asset.content_id) {
                  onOpenContent?.(asset.content_id, asset.content?.title || 'Content')
                } else if (asset.asset_type === 'link' && asset.link_url) {
                  const href = normalizeLink(asset.link_url)
                  if (href) {
                    window.open(href, '_blank', 'noopener,noreferrer')
                  }
                }
              }
              return (
                <div
                  key={asset.id}
                  className="cursor-pointer rounded-md border border-gray-800 bg-gray-850/80 hover:border-emerald-500 transition-colors"
                  style={{ width: '100px', height: '140px' }}
                  onClick={handleAssetClick}
                >
                  <div className="flex flex-col justify-between h-full p-2">
                    <div className="flex items-start">
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={asset.resume_asset_icons?.name || 'icon'}
                          style={{
                            maxWidth: '30px',
                            maxHeight: '30px',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <div
                          className="bg-gray-700 rounded-sm"
                          style={{ width: '20px', height: '20px' }}
                        />
                      )}
                    </div>
                    <div className="text-gray-200 text-sm leading-4 overflow-hidden">
                      {caption}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          {shouldShowExpandButton(entry) && (
            <div 
              onClick={onToggleExpand}
              className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm cursor-pointer"
            >
              {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
            </div>
          )}
          
          {shouldShowSamplesButton(entry) ? (
            <div
              className="ml-auto text-emerald-400 hover:text-emerald-300 font-semibold text-sm cursor-pointer"
              onClick={() => {
                const slug = entry.collections?.slug
                const name = entry.collections?.name
                if (slug && name) {
                  onOpenCollection?.(slug, name)
                }
              }}
            >
              Samples →
            </div>
          ) : (
            <div></div> // Spacer if no Samples button
          )}
        </div>
      </div>
    )
  }
  
  if (position === 'center') {
    return (
      <div 
        ref={measureRef}
        className="py-3 px-2 w-[384px] text-center absolute"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          top: `${topPosition}px`,
          transition: 'top 300ms ease-out', // Step 5.1 Fix 10: Smooth position changes during expansion
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6)) drop-shadow(0 8px 24px rgba(0, 0, 0, 0.4))' // Fix 5 Stage 4: Shadow for floating text effect
        }}
      >
        <div className="text-sm text-gray-400 mb-2">
          {formatSingleDate(entry.date_end_normalized || entry.date_start_normalized)}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          {entry.title}
        </h3>
        
        {isExpanded && entry.short_description && (
          <div className="transition-all duration-300 ease-in-out overflow-hidden text-sm text-gray-300 mb-3">
            {entry.short_description}
          </div>
        )}
        
        {entry.date_start_normalized && entry.date_end_normalized && (
          <div className="text-sm text-gray-400 mb-3">
            {formatSingleDate(entry.date_start_normalized)}
          </div>
        )}
        
        {shouldShowExpandButtonCenter(entry) && (
          <div 
            onClick={onToggleExpand}
            className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm cursor-pointer"
          >
            {isExpanded ? '▲' : '▼'}
          </div>
        )}
      </div>
    )
  }
  
  return null
}

function getCurrentMonthEST(): Date {
  const now = new Date()
  
  const estOffset = -5 * 60 // EST is UTC-5 in minutes
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
  const estTime = new Date(utcTime + (estOffset * 60000))
  
  return new Date(estTime.getFullYear(), estTime.getMonth(), 1)
}

function normalizeDate(dateString: string | null): Date | null {
  if (!dateString) return null
  
  const [year, month, day] = dateString.split('-').map(Number)
  
  const date = new Date(year, month - 1, 1)
  
  return date
}

function countMonths(start: Date | null, end: Date | null): number {
  if (!start && !end) return 0
  if (!start) start = end! // Missing start = treat as equal to end
  if (!end) end = getCurrentMonthEST() // Missing end = treat as Present
  
  const yearDiff = end.getFullYear() - start.getFullYear()
  const monthDiff = end.getMonth() - start.getMonth()
  const totalMonths = yearDiff * 12 + monthDiff + 1 // +1 for inclusive counting
  
  return Math.max(1, totalMonths)
}

function formatMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

function getMonthsInRange(start: Date | null, end: Date | null): Date[] {
  if (!start || !end) return []
  
  const months: Date[] = []
  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  const endDate = new Date(end.getFullYear(), end.getMonth(), 1)
  
  while (current <= endDate) {
    months.push(new Date(current))
    current.setMonth(current.getMonth() + 1)
  }
  
  return months
}

function calculateStartMarker(entries: ResumeEntry[]): Date | null {
  if (entries.length === 0) return null
  
  let earliestDate: Date | null = null
  
  for (const entry of entries) {
    const startCandidate = entry.date_start_normalized || entry.date_end_normalized || getCurrentMonthEST()
    if (!earliestDate || startCandidate < earliestDate) {
      earliestDate = startCandidate
    }
  }
  
  return earliestDate
}

function generateOperationalMonths(startMarker: Date | null, nowMarker: Date): Date[] {
  if (!startMarker) return [nowMarker]
  
  return getMonthsInRange(startMarker, nowMarker)
}

function calculateMarkerPositions(
  operationalMonths: Date[],
  markerHeights: Map<string, number>,
  standardHeight: number | null
): Map<string, number> {
  const positions = new Map<string, number>()
  
  if (operationalMonths.length === 0) return positions
  
  let yOffset = 0
  
  let sampleCount = 0
  
  for (let i = operationalMonths.length - 1; i >= 0; i--) {
    const month = operationalMonths[i]
    const monthKey = formatMonthKey(month)
    
    positions.set(monthKey, yOffset)
    
    const height = markerHeights.get(monthKey) ?? standardHeight ?? 50
    
    if (sampleCount < 5) {
      sampleCount++
    }
    
    yOffset += height
  }
  
  return positions
}

function calculateStandardCard(sideEntries: ResumeEntry[]): ResumeEntry | null {
  if (sideEntries.length === 0) return null
  
  const maxMonthCount = Math.max(...sideEntries.map(e => e.monthCount))
  
  let candidates = sideEntries.filter(e => e.monthCount === maxMonthCount)
  
  if (candidates.length === 1) return candidates[0]
  
  let minEndDate: Date | null = null
  for (const entry of candidates) {
    const endDate = entry.date_end_normalized
    if (endDate) {
      if (!minEndDate || endDate < minEndDate) {
        minEndDate = endDate
      }
    }
  }
  
  if (minEndDate) {
    const tier1Candidates = candidates.filter(e => 
      e.date_end_normalized && e.date_end_normalized.getTime() === minEndDate.getTime()
    )
    if (tier1Candidates.length === 1) return tier1Candidates[0]
    candidates = tier1Candidates
  }
  
  let maxStartDate: Date | null = null
  for (const entry of candidates) {
    const startDate = entry.date_start_normalized
    if (startDate) {
      if (!maxStartDate || startDate > maxStartDate) {
        maxStartDate = startDate
      }
    }
  }
  
  if (maxStartDate) {
    const tier2Candidates = candidates.filter(e => 
      e.date_start_normalized && e.date_start_normalized.getTime() === maxStartDate.getTime()
    )
    if (tier2Candidates.length === 1) return tier2Candidates[0]
    candidates = tier2Candidates
  }
  
  const minOrderIndex = Math.min(...candidates.map(e => e.order_index))
  const finalCandidate = candidates.find(e => e.order_index === minOrderIndex)
  
  return finalCandidate || candidates[0] // Fallback to first if somehow still tied
}

type ResumeEntry = ResumeEntryRaw & {
  date_start_normalized: Date | null
  date_end_normalized: Date | null
  has_end_date_original: boolean
  monthCount: number
  position: 'left' | 'right' | 'center'
}

function MonthMarker({
  monthKey,
  isActivated,
  markerType,
  height,
  yPosition,
  debugMode,
  startSideMarkers,
  startMarkerLabelOffset = 0,
  startMarkerLabelBufferBottom = 0
}: {
  monthKey: string
  isActivated: boolean
  markerType: 'green' | 'blue' | 'operational'
  height: number
  yPosition: number
  debugMode: boolean
  startSideMarkers?: Set<string>
  startMarkerLabelOffset?: number
  startMarkerLabelBufferBottom?: number
}) {
  if (markerType === 'operational' && !debugMode) {
    return null
  }
  
  const textColorClass = markerType === 'green' ? 'text-emerald-400' : 
                         markerType === 'blue' ? 'text-[#88b6e3]' : 
                         'text-gray-400' // operational (for debug mode)
  
  const opacityClass = markerType === 'operational' ? 'opacity-40' : 'opacity-100'
  
  const [year, monthNum] = monthKey.split('-')
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']
  const monthName = monthNames[parseInt(monthNum) - 1]
  const label = `${monthName} ${year}`
  const labelTop = startSideMarkers?.has(monthKey)
    ? yPosition + height - startMarkerLabelOffset
    : yPosition
  const extraBottom = startSideMarkers?.has(monthKey) ? startMarkerLabelBufferBottom : 0
  
  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 z-10"
      style={{ top: `${labelTop}px` }}
    >
      <div 
        className={`${textColorClass} ${opacityClass} text-sm font-semibold whitespace-nowrap`}
        style={{
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.4)',
          marginBottom: `${extraBottom}px`
        }}
      >
        {label}
      </div>
    </div>
  )
}

function Timeline({ 
  nowMarkerRef,
  debugSettings,
  operationalMonths,
  activatedMarkers,
  greenActivatedMarkers,
  blueActivatedMarkers,
  markerHeights,
  markerPositions,
  timelineHeight,
  sideLineData,
  startSideMarkers,
  startMarkerLabelOffset,
  startMarkerLabelBufferBottom
}: { 
  nowMarkerRef: RefObject<HTMLDivElement | null>
  debugSettings: DebugSettings
  operationalMonths: Date[]
  activatedMarkers: Set<string>
  greenActivatedMarkers: Set<string>
  blueActivatedMarkers: Set<string>
  markerHeights: Map<string, number>
  markerPositions: Map<string, number>
  timelineHeight: number
  sideLineData: Array<{
    entryId: string
    startY: number
    endY: number
    color: string
    side: 'left' | 'right'
  }>
  startSideMarkers: Set<string>
  startMarkerLabelOffset: number
  startMarkerLabelBufferBottom: number
}) {
  const nowDate = getCurrentMonthEST()
  
  const markersToRender = debugSettings.showAllMarkers
    ? operationalMonths // Debug mode: show all operational markers
    : operationalMonths.filter(month => { // Normal mode: only activated markers
        const monthKey = formatMonthKey(month)
        return activatedMarkers.has(monthKey)
      })
  
  useEffect(() => {
    
    const sampleMarkers = markersToRender.slice(0, 5).map(month => {
      const monthKey = formatMonthKey(month)
      const isGreenActivated = greenActivatedMarkers.has(monthKey)
      const isBlueActivated = blueActivatedMarkers.has(monthKey)
      const markerType = isBlueActivated ? 'blue' : isGreenActivated ? 'green' : 'operational'
      const yPos = markerPositions.get(monthKey) ?? 0
      return { monthKey, markerType, yPos }
    })
  }, [debugSettings.showAllMarkers, markersToRender.length, activatedMarkers.size])
  
  if (sideLineData.length > 0) {
    sideLineData.slice(0, 3).forEach((line, i) => {
    })
  }
  
  return (
    <div className="relative w-full">
      <div ref={nowMarkerRef} className="absolute left-1/2 -translate-x-1/2 top-0">
        <span className="text-emerald-400 font-semibold text-lg">Now</span>
      </div>
      
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '35px' }}>
        {sideLineData.map((lineData) => (
          <SideLine 
            key={lineData.entryId}
            entryId={lineData.entryId}
            startY={lineData.startY}
            endY={lineData.endY}
            color={lineData.color}
            side={lineData.side}
          />
        ))}
      </div>
      
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '35px' }}>
        {markersToRender.map((month) => {
          const monthKey = formatMonthKey(month)
          const yPosition = markerPositions.get(monthKey) ?? 0
          const height = markerHeights.get(monthKey) ?? 0
          
          const isBlueActivated = blueActivatedMarkers.has(monthKey)
          const isGreenActivated = greenActivatedMarkers.has(monthKey)
          const isActivated = activatedMarkers.has(monthKey)
          
          let markerType: 'green' | 'blue' | 'operational'
          if (isBlueActivated) {
            markerType = 'blue'
          } else if (isGreenActivated) {
            markerType = 'green'
          } else {
            markerType = 'operational'
          }
          
          if (markerType === 'blue') {
            return null
          }
          
          return (
            <MonthMarker
              key={monthKey}
              monthKey={monthKey}
              isActivated={isActivated}
              markerType={markerType}
              height={height}
              yPosition={yPosition}
              debugMode={debugSettings.showAllMarkers}
              startSideMarkers={startSideMarkers}
              startMarkerLabelOffset={startMarkerLabelOffset}
              startMarkerLabelBufferBottom={startMarkerLabelBufferBottom}
            />
          )
        })}
      </div>
      
      <div 
        className="absolute left-1/2 -translate-x-1/2 w-1"
        style={{
          top: '35px', // Starts below Now marker
          height: `${timelineHeight + 300}px`, // Step 5.1 Fix 8: Includes 300px continuation after timeline end per line 66
          background: `linear-gradient(to bottom, #00D492 0%, #00D492 ${(timelineHeight/(timelineHeight+300)*100).toFixed(1)}%, transparent 100%)`, // Step 5.1 Fix 8: Fade only in 300px continuation
          transition: 'height 300ms ease-out, background 300ms ease-out' // Step 5.1 Fix 10: Smooth timeline expansion
        }}
      >
      </div>
      
      <div 
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ top: `${35 + timelineHeight + 300}px` }} // Step 5.1 Fix 8: At end of 300px continuation per line 66
      >
        <span className="text-gray-400 text-sm">
          Born in Moscow, Russia - July 1st, 1994
        </span>
      </div>
    </div>
  )
}
