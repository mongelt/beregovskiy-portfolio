'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import type { RefObject } from 'react'
import { createClient } from '@/lib/supabase/client'
import EditorRenderer from '@/components/EditorRenderer'

// Shared layout offsets
const TIMELINE_TOP_OFFSET = 35

// Debug settings type
type DebugSettings = {
  showDebugWindow: boolean
  showAllMarkers: boolean
}

// Resume entry type (raw from database)
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
  // Debug settings state
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    showDebugWindow: false,
    showAllMarkers: false
  })
  
  // Resume entries state
  const [entries, setEntries] = useState<ResumeEntryRaw[]>([])
  const [transformedEntries, setTransformedEntries] = useState<ResumeEntry[]>([])
  const [sideEntries, setSideEntries] = useState<ResumeEntry[]>([])
  const [centerEntries, setCenterEntries] = useState<ResumeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Card heights tracking (for Phase 4 timeline dynamics - both collapsed and expanded)
  const [cardHeights, setCardHeights] = useState<Map<string, { collapsed: number, expanded?: number }>>(new Map())
  
  // Expansion state tracking
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const nowMarkerRef = useRef<HTMLDivElement | null>(null)
  
// Shared layout offsets
const TIMELINE_TOP_OFFSET = 35

  // Step 4.1 marker data state
  const [operationalMonths, setOperationalMonths] = useState<Date[]>([])
  const [activatedMarkers, setActivatedMarkers] = useState<Set<string>>(new Set())
  const [greenMarkers, setGreenMarkers] = useState<Set<string>>(new Set())
  const [blueMarkers, setBlueMarkers] = useState<Set<string>>(new Set())
  const [greenActivatedMarkers, setGreenActivatedMarkers] = useState<Set<string>>(new Set())
  const [blueActivatedMarkers, setBlueActivatedMarkers] = useState<Set<string>>(new Set())
  const [markerHeights, setMarkerHeights] = useState<Map<string, number>>(new Map())
  const [monthToEntriesMap, setMonthToEntriesMap] = useState<Map<string, string[]>>(new Map())
  
  // Step 4.2 standard card state
  const [standardCard, setStandardCard] = useState<ResumeEntry | null>(null)
  const [standardHeight, setStandardHeight] = useState<number | null>(null)
  
  // Step 4.3 marker positions state
  const [markerPositions, setMarkerPositions] = useState<Map<string, number>>(new Map())
  
  // Step 4.6 Stage 10: Timeline height state (sum of all marker heights)
  const [timelineHeight, setTimelineHeight] = useState<number>(300) // Initialize with empty state height
  const SIDE_CARD_TOP_BUFFER = 15
  const START_MARKER_BOTTOM_SPACER = 20
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
  // Callback: Handle card height measurement (memoized to prevent infinite loops)
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
  
  // Handler: Toggle entry expansion
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
  
  // Load resume entries from Supabase
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createClient()
        
        // Query entries and asset icons separately (no FK join needed)
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
        
        // Build icon lookup map (icon_key -> icon row)
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
        
        // Store raw data
        setEntries(data || [])
        
        // Console logging for Stage 1 verification
        console.log('📊 Step 3.1 Stage 1 - Data Loading')
        console.log('✅ Supabase query executed successfully')
        console.log('📦 Raw data loaded:', data)
        console.log('📈 Featured entries count:', data?.length || 0)
        console.log('🔍 First entry (sample):', data?.[0])
        
        // Stage 2: Transform data with computed fields
        console.log('\n📊 Step 3.1 Stage 2 - Data Transformation')
        
        const transformed: ResumeEntry[] = (data || []).map(entry => {
          // 🔍 Fix 1 Debug: Show raw database value for Testing entry
          if (entry.title === 'Testing') {
            console.log(`🔍 Fix 1 Substage 1.5: RAW DATABASE VALUE for Testing entry`)
            console.log(`   Raw date_start from database: "${entry.date_start}"`)
            console.log(`   Raw date_end from database: "${entry.date_end}"`)
          }
          
          // Normalize dates to first of month EST
          const startNormalized = normalizeDate(entry.date_start)
          let endNormalized = normalizeDate(entry.date_end)
          const hasEndDateOriginal = !!entry.date_end
          
          // Map position from entry type name
          let position: 'left' | 'right' | 'center'
          if (entry.resume_entry_types?.name === 'Left Side') {
            position = 'left'
          } else if (entry.resume_entry_types?.name === 'Right Side') {
            position = 'right'
          } else if (entry.resume_entry_types?.name === 'Center') {
            position = 'center'
          } else {
            // Fallback to right if type is missing
            position = 'right'
          }
          
          // Center entries missing end_date must treat start as end (logic doc line 232)
          if (position === 'center' && !endNormalized) {
            endNormalized = startNormalized
          }
          
          // Count months inclusively
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
        
        // Split into side and center entries
        const side = transformed.filter(e => e.position === 'left' || e.position === 'right')
        const center = transformed.filter(e => e.position === 'center')
        
        setSideEntries(side)
        setCenterEntries(center)
        
        // Console logging for Stage 2 verification
        console.log('✅ Data transformation complete')
        console.log('📅 Normalized dates (first of month):', transformed.map(e => ({
          title: e.title,
          start: e.date_start_normalized,
          end: e.date_end_normalized
        })))
        console.log('📊 Month counts (inclusive):', transformed.map(e => ({
          title: e.title,
          months: e.monthCount
        })))
        console.log('📍 Positions (left/right/center):', transformed.map(e => ({
          title: e.title,
          position: e.position
        })))
        console.log('🔀 Split arrays:')
        console.log('  - Side entries:', side.length)
        console.log('  - Center entries:', center.length)
        console.log('  - Total:', transformed.length)
        console.log('🔍 Sample transformed entry:', transformed[0])
        
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
  
  // Load debug settings from localStorage
  useEffect(() => {
    const loadDebugSettings = () => {
      if (typeof window !== 'undefined') {
        const debugWindow = localStorage.getItem('resume-debug-window') === 'true'
        const allMarkers = localStorage.getItem('resume-all-markers') === 'true'
        
        // Only update state if values actually changed
        setDebugSettings(prev => {
          if (prev.showDebugWindow === debugWindow && prev.showAllMarkers === allMarkers) {
            return prev // No change, don't trigger re-render
          }
          
          // Values changed, log and update
          console.log('🔧 Debug settings changed:', {
            showDebugWindow: debugWindow,
            showAllMarkers: allMarkers
          })
          
          return {
            showDebugWindow: debugWindow,
            showAllMarkers: allMarkers
          }
        })
      }
    }
    
    loadDebugSettings()
    
    // Poll for changes every 2 seconds (to detect admin panel updates)
    const interval = setInterval(loadDebugSettings, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Step 4.1 Stage 1: Calculate operational months
  useEffect(() => {
    if (transformedEntries.length === 0) return
    
    console.log('\n📊 Step 4.1 Stage 1 - Date Calculations & Operational Months Generation')
    
    // Calculate Start marker (earliest start date from all entries)
    const startMarker = calculateStartMarker(transformedEntries)
    console.log('🎯 Start marker:', startMarker ? formatMonthKey(startMarker) : 'null')
    console.log('   Start date:', startMarker ? startMarker.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }) : 'No entries')
    
    // Verify Now marker (already exists from Step 2.1)
    const nowMarker = getCurrentMonthEST()
    console.log('🎯 Now marker:', formatMonthKey(nowMarker))
    console.log('   Now date:', nowMarker.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }))
    
    // Generate operational months array (Start to Now, inclusive)
    const operationalMonths = generateOperationalMonths(startMarker, nowMarker)
    console.log('📅 Operational months count:', operationalMonths.length)
    console.log('   First operational month:', operationalMonths.length > 0 ? formatMonthKey(operationalMonths[0]) : 'none')
    console.log('   Last operational month:', operationalMonths.length > 0 ? formatMonthKey(operationalMonths[operationalMonths.length - 1]) : 'none')
    console.log('   Sample month keys (first 5):', operationalMonths.slice(0, 5).map(formatMonthKey))
    
    // Verify all months are first of month in EST
    const allFirstOfMonth = operationalMonths.every(date => date.getDate() === 1)
    console.log('✅ All months normalized to first of month:', allFirstOfMonth)
    
    console.log('✅ Stage 1 Complete - Operational months generated')
    
    // Stage 2: MonthMarker Component & Activation Set
    console.log('\n📊 Step 4.1 Stage 2 - MonthMarker Component & Activation Set')
    
    // Scan all entries and collect activated markers (separated by color)
    const activatedMarkersSet = new Set<string>()
    const greenActivatedMarkersSet = new Set<string>() // Actual start/end dates for side entries
    const blueActivatedMarkersSet = new Set<string>()  // Actual start/end dates for center entries
    
    console.log('🔍 Scanning entries:', transformedEntries.length, 'total entries')
    
    for (const entry of transformedEntries) {
      const isSide = entry.position === 'left' || entry.position === 'right'
      const isCenter = entry.position === 'center'
      
      // Add end date marker (if exists; for center entries, only if original end date exists)
      const allowEndMarker =
        entry.position !== 'center' ? !!entry.date_end_normalized : entry.has_end_date_original && !!entry.date_end_normalized

      if (allowEndMarker && entry.date_end_normalized) {
        const endKey = formatMonthKey(entry.date_end_normalized)
        activatedMarkersSet.add(endKey)
        
        // Track color-specific activation
        if (isSide) greenActivatedMarkersSet.add(endKey)
        if (isCenter) blueActivatedMarkersSet.add(endKey)
      }
      
      // Add start date marker (if exists)
      // Skip if start date is null per logic doc lines 54, 232
      if (entry.date_start_normalized) {
        const startKey = formatMonthKey(entry.date_start_normalized)
        activatedMarkersSet.add(startKey)
        
        // Track color-specific activation
        if (isSide) greenActivatedMarkersSet.add(startKey)
        if (isCenter) blueActivatedMarkersSet.add(startKey)
      }
    }
    
    console.log('✅ Activated markers collected:', activatedMarkersSet.size)
    console.log('   Green activated (side start/end dates):', greenActivatedMarkersSet.size)
    console.log('   Blue activated (center start/end dates):', blueActivatedMarkersSet.size)
    console.log('   Sample activated month keys (first 5):', Array.from(activatedMarkersSet).slice(0, 5))
    console.log('   Note: Entries with null start_date do not activate start markers')
    
    // Placeholder for color separation (will be implemented in Stage 3)
    console.log('📝 Placeholder: Green/blue marker separation pending Stage 3')
    
    console.log('✅ Stage 2 Complete - Activation set created, MonthMarker component ready')
    
    // Stage 3: Month-to-Entries Mapping & Color Separation
    console.log('\n📊 Step 4.1 Stage 3 - Month-to-Entries Mapping & Color Separation')
    
    // Create monthToEntriesMap and color-separated marker Sets
    const monthToEntriesMap = new Map<string, string[]>()
    const greenMarkersSet = new Set<string>() // Side entry markers
    const blueMarkersSet = new Set<string>()  // Center entry markers
    
    console.log('🗺️  Building month-to-entries map...')
    
    for (const entry of transformedEntries) {
      // Handle missing end dates based on position type
      let startDate = entry.date_start_normalized
      let endDate = entry.date_end_normalized
      
      if (!endDate) {
        if (entry.position === 'left' || entry.position === 'right') {
          // Side entries: missing end = Present
          endDate = nowMarker
        } else if (entry.position === 'center') {
          // Center entries: missing end = treat start as end (line 232)
          endDate = startDate
        }
      }
      
      // Get all months in entry's span
      if (startDate && endDate) {
        const monthsInRange = getMonthsInRange(startDate, endDate)
        
        // Add entry to each month it spans
        for (const month of monthsInRange) {
          const monthKey = formatMonthKey(month)
          
          if (!monthToEntriesMap.has(monthKey)) {
            monthToEntriesMap.set(monthKey, [])
          }
          monthToEntriesMap.get(monthKey)!.push(entry.id)
        }
        
        // Track marker colors by position
        const rangeKeys = monthsInRange.map(formatMonthKey)
        
        if (entry.position === 'left' || entry.position === 'right') {
          // Side entries activate green markers
          rangeKeys.forEach(key => greenMarkersSet.add(key))
        } else if (entry.position === 'center') {
          // Center entries activate blue markers
          rangeKeys.forEach(key => blueMarkersSet.add(key))
        }
      }
    }
    
    console.log('✅ Month-to-entries map built:', monthToEntriesMap.size, 'months mapped')
    console.log('   Green markers (side entries):', greenMarkersSet.size)
    console.log('   Blue markers (center entries):', blueMarkersSet.size)
    
    // Sample mapping for verification
    const sampleMonthKeys = Array.from(monthToEntriesMap.keys()).slice(0, 3)
    console.log('   Sample mappings:')
    sampleMonthKeys.forEach(key => {
      const entryIds = monthToEntriesMap.get(key) || []
      console.log(`     ${key} → [${entryIds.length} entries]`)
    })
    
    // Verify color separation
    const totalUnique = new Set([...greenMarkersSet, ...blueMarkersSet]).size
    console.log('✅ Color separation verified: ', totalUnique, 'unique activated months')
    console.log('   Note: Some months may have both green and blue markers (overlapping)')
    
    console.log('✅ Stage 3 Complete - Mapping and color separation done')
    
    // Stage 4: Debug Window Integration & Height Initialization
    console.log('\n📊 Step 4.1 Stage 4 - Debug Window Integration & Height Initialization')
    
    // Initialize markerHeights Map with 50px placeholder
    const markerHeightsMap = new Map<string, number>()
    operationalMonths.forEach(month => {
      const key = formatMonthKey(month)
      markerHeightsMap.set(key, 50) // 50px placeholder (Step 4.2 will calculate actual standard height)
    })
    
    console.log('✅ Marker heights initialized:', markerHeightsMap.size, 'months')
    console.log('   Placeholder height: 50px (will be updated in Step 4.2)')
    
    // Update state with all marker data for DebugWindow
    setOperationalMonths(operationalMonths)
    setActivatedMarkers(activatedMarkersSet)
    setGreenMarkers(greenMarkersSet)
    setBlueMarkers(blueMarkersSet)
    setGreenActivatedMarkers(greenActivatedMarkersSet)
    setBlueActivatedMarkers(blueActivatedMarkersSet)
    setMarkerHeights(markerHeightsMap)
    setMonthToEntriesMap(monthToEntriesMap)
    
    console.log('✅ Debug window data updated:')
    console.log('   - Operational months:', operationalMonths.length)
    console.log('   - Activated markers:', activatedMarkersSet.size)
    console.log('   - Green markers (all spans):', greenMarkersSet.size)
    console.log('   - Blue markers (all spans):', blueMarkersSet.size)
    console.log('   - Green activated (start/end only):', greenActivatedMarkersSet.size)
    console.log('   - Blue activated (start/end only):', blueActivatedMarkersSet.size)
    console.log('   - Marker heights:', markerHeightsMap.size)
    console.log('   - Month-to-entries mappings:', monthToEntriesMap.size)
    
    console.log('✅ Stage 4 Complete - All marker data ready for debug window')
    console.log('✅ Step 4.1 Complete - Month markers infrastructure established')
    
  }, [transformedEntries])
  
  // Step 4.2 Stage 1: Calculate standard card with tie-breaking
  useEffect(() => {
    if (sideEntries.length === 0) return
    
    console.log('\n📊 Step 4.2 Stage 1 - Standard Card Selection Algorithm')
    
    // Log initial data
    console.log('🔍 Side entries count:', sideEntries.length, '(center entries excluded)')
    console.log('   Entry durations:', sideEntries.map(e => ({
      title: e.title,
      monthCount: e.monthCount
    })))
    
    // Find longest duration
    const maxMonthCount = Math.max(...sideEntries.map(e => e.monthCount))
    console.log('📏 Longest duration found:', maxMonthCount, 'months')
    
    // Find tie candidates
    const tieCandidates = sideEntries.filter(e => e.monthCount === maxMonthCount)
    console.log('🎯 Tie candidates:', tieCandidates.length, 'entries with', maxMonthCount, 'months')
    
    if (tieCandidates.length > 1) {
      console.log('   Tie candidates details:', tieCandidates.map(e => ({
        title: e.title,
        end_date: e.date_end_normalized ? formatMonthKey(e.date_end_normalized) : 'null (Present)',
        start_date: e.date_start_normalized ? formatMonthKey(e.date_start_normalized) : 'null',
        order_index: e.order_index
      })))
      console.log('⚖️  Applying tie-breaking rules...')
    }
    
    // Calculate standard card with tie-breaking
    const selected = calculateStandardCard(sideEntries)
    
    if (selected) {
      console.log('✅ Standard card selected:', {
        id: selected.id,
        title: selected.title,
        monthCount: selected.monthCount,
        start_date: selected.date_start_normalized ? formatMonthKey(selected.date_start_normalized) : 'null',
        end_date: selected.date_end_normalized ? formatMonthKey(selected.date_end_normalized) : 'null (Present)',
        order_index: selected.order_index
      })
      
      // Determine which tie-breaking tier was used (if any)
      if (tieCandidates.length > 1) {
        // Check which tier resolved the tie
        const tier1Count = tieCandidates.filter(e => {
          if (!selected.date_end_normalized) return false
          return e.date_end_normalized && e.date_end_normalized.getTime() === selected.date_end_normalized.getTime()
        }).length
        
        if (tier1Count === 1) {
          console.log('   Tie resolved by: Tier 1 (lowest end_date)')
        } else if (tier1Count > 1) {
          const tier2Count = tieCandidates.filter(e => {
            if (!selected.date_start_normalized) return false
            return e.date_start_normalized && e.date_start_normalized.getTime() === selected.date_start_normalized.getTime()
          }).length
          
          if (tier2Count === 1) {
            console.log('   Tie resolved by: Tier 2 (latest start_date)')
          } else {
            console.log('   Tie resolved by: Tier 3 (lowest order_index)')
          }
        }
      } else {
        console.log('   No tie-breaking needed (only one entry with max duration)')
      }
      
      setStandardCard(selected)
    } else {
      console.log('❌ No standard card (no side entries)')
      setStandardCard(null)
    }
    
    console.log('✅ Stage 1 Complete - Standard card selection algorithm implemented')
    
  }, [sideEntries])
  
  // Fix 9 Stage 4: Helper function to detect detachments from cascade positions
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
  
  // Fix 9 Stage 4: Helper function to adjust marker heights for detached entries
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
      
      // Calculate actual span needed (includes detachment)
      const actualSpanNeeded = entryHeight + detachmentAmount
      const perMonthRequired = actualSpanNeeded / entry.monthCount
      
      console.log(`      "${entry.title}": detached +${detachmentAmount.toFixed(2)}px`)
      console.log(`         Span: ${entryHeight.toFixed(2)}px + ${detachmentAmount.toFixed(2)}px = ${actualSpanNeeded.toFixed(2)}px`)
      console.log(`         Per-month: ${actualSpanNeeded.toFixed(2)}px ÷ ${entry.monthCount} = ${perMonthRequired.toFixed(2)}px`)
      
      // Get month span and apply adjustment
      const startDate = entry.date_start_normalized || entry.date_end_normalized || getCurrentMonthEST()
      const endDate = entry.date_end_normalized || entry.date_start_normalized || getCurrentMonthEST()
      const monthSpan = getMonthsInRange(startDate, endDate)
      
      monthSpan.forEach(month => {
        const monthKey = formatMonthKey(month)
        const current = adjusted.get(monthKey) ?? standardHeight
        // Use Math.max to ensure we don't reduce height (only expand more if needed)
        adjusted.set(monthKey, Math.max(current, perMonthRequired))
      })
    })
    
    return adjusted
  }, [])
  
  // Fix 9 Stage 4: Helper function to check convergence between iterations
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
  
  // Step 4.2 Stage 2: Calculate standard marker height
  useEffect(() => {
    if (!standardCard) return
    
    console.log('\n📊 Step 4.2 Stage 2 - Standard Height Calculation & Console Verification')
    
    // Get collapsed card height from cardHeights Map
    const cardHeight = cardHeights.get(standardCard.id)
    const collapsedHeight = cardHeight?.collapsed
    
    console.log('📏 Calculation inputs:')
    console.log('   Standard card ID:', standardCard.id)
    console.log('   Standard card title:', standardCard.title)
    console.log('   Month count:', standardCard.monthCount)
    console.log('   Collapsed height from Map:', collapsedHeight, 'px')
    
    // Validate height measurement exists
    if (!collapsedHeight || collapsedHeight === 0) {
      console.log('⚠️  Warning: Collapsed height not measured yet for standard card')
      console.log('   Waiting for height measurement...')
      return
    }
    
    // Calculate standard marker height: height / months, rounded
    const rawCalculation = collapsedHeight / standardCard.monthCount
    const calculatedStandardHeight = Math.round(rawCalculation)
    
    console.log('🧮 Calculation breakdown:')
    console.log('   Formula: height ÷ months = standard marker height')
    console.log('   Calculation:', collapsedHeight, 'px ÷', standardCard.monthCount, 'months =', rawCalculation.toFixed(2))
    console.log('   Rounding:', rawCalculation.toFixed(2), '→', calculatedStandardHeight, 'px')
    console.log('   Math.round applied (JavaScript rounds .5 to nearest even)')
    
    console.log('✅ Standard marker height calculated:', calculatedStandardHeight, 'px')
    
    // Update state
    setStandardHeight(calculatedStandardHeight)
    
    console.log('✅ Stage 2 Complete - Standard height calculation verified')
    
  }, [standardCard, cardHeights])
  
  // Step 4.6 Stage 7: Marker height expansion useEffect with Fix 9 Stage 4 iterative convergence
  // REPLACES Step 4.2 Stage 3 useEffect (which set all markers to uniform standard height)
  useEffect(() => {
    // Early return checks (safety before executing expensive calculations)
    if (!standardHeight) return
    if (cardHeights.size === 0) return
    if (operationalMonths.length === 0) return
    
    // Step 5.1 Fix 6: Batch condition - wait for all card measurements before calculating
    if (cardHeights.size < transformedEntries.length) return
    
    // Fix 9 Stage 4: Iterative convergence loop for detached entry marker adjustment
    let iteration = 0
    const MAX_ITERATIONS = 3
    let converged = false
    let finalCalculatedHeights = new Map<string, number>()
    
    while (!converged && iteration < MAX_ITERATIONS) {
      iteration++
      
      // Pass 1: Calculate required heights per entry per month
      // Step 4.7 Stage 3: Pass expandedEntries to enable expanded height selection
      const requiredHeightsMap = calculateRequiredHeights(transformedEntries, cardHeights, expandedEntries)
      
      // Pass 2: Apply maximum heights for overlapping entries
      const calculatedHeights = applyMaximumHeights(requiredHeightsMap, operationalMonths, standardHeight)
      
      // Calculate temporary positions and cascade for this iteration
      const tempPositions = calculateMarkerPositions(operationalMonths, calculatedHeights, standardHeight)
      
      // Calculate temporary cascade positions to detect detachments
      const tempCascade = new Map<string, number>()
      const leftEntries = sideEntries.filter(e => e.position === 'left')
      const rightEntries = sideEntries.filter(e => e.position === 'right')
      
      // Process left and right sides independently (same algorithm as Stage 2)
      for (const entries of [leftEntries, rightEntries]) {
        const sorted = [...entries].sort((a, b) => {
          const aEnd = a.date_end_normalized?.getTime() || Date.now()
          const bEnd = b.date_end_normalized?.getTime() || Date.now()
          return bEnd - aEnd
        })
        
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
      
      // Detect detachments
      const detachments = detectDetachments(tempCascade, tempPositions, sideEntries)
      
      if (detachments.length === 0) {
        // No detachments, standard algorithm is correct
        converged = true
        finalCalculatedHeights = calculatedHeights
        break
      }
      
      // Adjust marker heights for detached entries
      const adjustedHeights = adjustForDetachments(calculatedHeights, detachments, cardHeights, expandedEntries, standardHeight)
      
      // Check convergence (compare with previous iteration if not first)
      if (iteration > 1) {
        const maxDiff = checkConvergence(finalCalculatedHeights, adjustedHeights)
        if (maxDiff < 0.1) {
          converged = true
          finalCalculatedHeights = adjustedHeights
          break
        }
      }
      
      finalCalculatedHeights = adjustedHeights
      
      if (iteration === MAX_ITERATIONS) {
        console.warn(`⚠️  Fix 9: Max iterations (${MAX_ITERATIONS}) reached`)
      }
    }
    
    // Log only if detachments were processed
    if (iteration > 1) {
      console.log(`✅ Fix 9: Marker adjustment converged (${iteration} iterations)`)
    }
    
    // Update marker heights state with final calculated/adjusted heights
    setMarkerHeights(finalCalculatedHeights)
    
    // Calculate total timeline height (sum of all marker heights)
    const totalHeight = Array.from(finalCalculatedHeights.values()).reduce((sum, h) => sum + h, 0)
    setTimelineHeight(totalHeight)
    
  }, [transformedEntries, cardHeights, standardHeight, operationalMonths, expandedEntries, sideEntries])
  
  // Step 4.3 Stage 1: Calculate Y positions for all operational markers
  useEffect(() => {
    if (operationalMonths.length === 0) return
    
    // Calculate positions using marker heights
    const positions = calculateMarkerPositions(operationalMonths, adjustedMarkerHeights, standardHeight)
    
    // Update state
    setMarkerPositions(positions)
    
  }, [operationalMonths, adjustedMarkerHeights, standardHeight])
  
  // Step 5.1 Fix 5: Calculate centered positions for center entries within their marker spans
  const centerEntryAdjustedPositions = useMemo(() => {
    const positions = new Map<string, number>()
    
    // Fix 5 Stage 1: Debug logging to identify missing entries
    console.log(`📐 Fix 5 Stage 1: Checking ${centerEntries.length} center entries`)
    centerEntries.forEach(entry => {
      console.log(`   "${entry.title}": start=${!!entry.date_start_normalized}, end=${!!entry.date_end_normalized}`)
    })
    
    centerEntries.forEach(entry => {
      // Fix 5 Stage 3: Check data structures first, then handle missing dates per logic doc line 232
      if (markerPositions.size > 0 && markerHeights.size > 0) {
        
        // Determine positioning dates with fallbacks per logic doc line 232
        // Missing end_date: treat start_date as end_date
        // Missing start_date: show only end_date marker
        const endDate = entry.date_end_normalized || entry.date_start_normalized
        const startDate = entry.date_start_normalized || entry.date_end_normalized
        
        if (!endDate || !startDate) {
          console.warn(`⚠️  Center entry "${entry.title}" has no dates at all, skipping`)
          return // Skip entries with ZERO dates (shouldn't happen)
        }
        
        // Log missing date cases
        const missingStatus = !entry.date_start_normalized ? 'MISSING START' : 
                             !entry.date_end_normalized ? 'MISSING END' : 'both dates'
        if (missingStatus !== 'both dates') {
          console.log(`📐 Fix 5 Stage 3: "${entry.title}" - ${missingStatus}, using fallback dates`)
        }
        
        const startKey = formatMonthKey(startDate)
        const endKey = formatMonthKey(endDate)
        
        // Fix 5 Stage 1: Debug marker keys (using fallback-resolved dates from Stage 3)
        console.log(`📐 Fix 5 Stage 1 Deep: "${entry.title}" marker analysis:`)
        console.log(`   Start date: ${formatSingleDate(startDate)}, Key: ${startKey}`)
        console.log(`   End date: ${formatSingleDate(endDate)}, Key: ${endKey}`)
        
        // Get marker positions from markerPositions Map
        const startY = markerPositions.get(startKey) ?? 0 // Start marker TOP position
        const endY = markerPositions.get(endKey) ?? 0     // End marker TOP position
        
        console.log(`   startY (start marker TOP): ${startY.toFixed(2)}px`)
        console.log(`   endY (end marker TOP): ${endY.toFixed(2)}px`)
        
        // Get start marker height from markerHeights Map (need full marker height for span)
        const startHeight = markerHeights.get(startKey) ?? standardHeight ?? 5
        const endHeight = markerHeights.get(endKey) ?? standardHeight ?? 5
        
        console.log(`   startHeight: ${startHeight.toFixed(2)}px`)
        console.log(`   endHeight: ${endHeight.toFixed(2)}px`)
        console.log(`   Start marker BOTTOM: ${(startY + startHeight).toFixed(2)}px`)
        
        // Calculate total span: from end marker TOP to start marker BOTTOM
        // This includes all 3 components: end marker + operational markers + start marker
        const totalSpan = (startY + startHeight) - endY
        
        console.log(`   totalSpan formula: (${startY.toFixed(2)} + ${startHeight.toFixed(2)}) - ${endY.toFixed(2)} = ${totalSpan.toFixed(2)}px`)
        
        // Fix 5 Stage 1: Verify span by summing all marker heights in range
        // FIX: Swap parameter order - getMonthsInRange expects (start, end) chronologically
        // Stage 3: Use fallback-resolved dates (startDate, endDate) for missing date handling
        const monthsInSpan = getMonthsInRange(startDate, endDate)
        const spanViaSumHeights = monthsInSpan.reduce((sum, month) => {
          const monthKey = formatMonthKey(month)
          const height = markerHeights.get(monthKey) ?? standardHeight ?? 5
          return sum + height
        }, 0)
        console.log(`   Verification: Sum of ${monthsInSpan.length} marker heights = ${spanViaSumHeights.toFixed(2)}px`)
        console.log(`   Span calculation method: ${totalSpan === spanViaSumHeights ? '✅ MATCH' : `❌ MISMATCH (diff: ${(totalSpan - spanViaSumHeights).toFixed(2)}px)`}`)
        
        // Get card height (use collapsed as baseline, expanded handled by expansion logic)
        const cardHeight = cardHeights.get(entry.id)?.collapsed ?? 0
        
        // Center card within the total span
        // If span > card: centers with equal spacing above/below
        // If span = card: offset is 0 (perfect fit)
        // If span < card: negative offset (shouldn't happen with correct algorithm)
        const centerOffset = (totalSpan - cardHeight) / 2
        
        // Fix 5 Stage 2: Add 35px Timeline container offset (line 2222)
        // markerPositions are relative to Timeline (0px = Timeline top)
        // Entry cards are relative to wrapper (0px = wrapper top)
        // Timeline container has 35px offset from wrapper top
        const centeredY = endY + centerOffset + 35
        
        positions.set(entry.id, centeredY)
        
        // Fix 5 Stage 2: Updated logging with offset
        console.log(`   ✅ Calculated centered position for "${entry.title}"`)
        console.log(`      Base: ${(endY + centerOffset).toFixed(2)}px + 35px Timeline offset = ${centeredY.toFixed(2)}px`)
        
        // Console log for verification (can be removed after testing)
        console.log(`📐 Step 5.1 Fix 5 Stage 2: Center entry "${entry.title}" centered:`)
        console.log(`   Span: ${totalSpan.toFixed(2)}px, Card: ${cardHeight.toFixed(2)}px, Offset: ${centerOffset.toFixed(2)}px`)
        console.log(`   Position: ${(endY + centerOffset).toFixed(2)}px + 35px = ${centeredY.toFixed(2)}px (with Timeline offset)`)
        console.log(`   Gap check: Card bottom ${(centeredY + cardHeight).toFixed(2)}px vs Start marker ${(startY + startHeight + 35).toFixed(2)}px = ${((startY + startHeight + 35) - (centeredY + cardHeight)).toFixed(2)}px gap`)
      }
    })
    
    // Fix 5 Stage 1: Report Map size vs expected
    console.log(`📐 Fix 5 Stage 1: centerEntryAdjustedPositions Map size = ${positions.size} (expected ${centerEntries.length})`)
    if (positions.size < centerEntries.length) {
      console.warn(`⚠️  Missing ${centerEntries.length - positions.size} entries - likely due to missing dates`)
    }
    
    // Fix 5 Stage 5: Collision detection for overlapping center entries
    if (positions.size > 0 && cardHeights.size > 0) {
      console.log(`\n🔍 Fix 5 Stage 5: Checking for overlapping center entries...`)
      
      // Sort center entries by Y position (top to bottom)
      const sortedCenterEntries = [...centerEntries]
        .filter(entry => positions.has(entry.id)) // Only entries with positions
        .sort((a, b) => {
          const posA = positions.get(a.id) ?? 0
          const posB = positions.get(b.id) ?? 0
          return posA - posB // ascending Y (top of page = smaller Y)
        })
      
      console.log(`   Sorted order (${sortedCenterEntries.length} entries):`)
      sortedCenterEntries.forEach((entry, idx) => {
        const y = positions.get(entry.id) ?? 0
        console.log(`      ${idx + 1}. "${entry.title}" at Y=${y.toFixed(2)}px`)
      })
      
      // Check each adjacent pair for overlap
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
          // OVERLAP: entry1 bottom extends past entry2 top
          overlapsDetected++
          console.warn(`   ⚠️  OVERLAP: "${entry1.title}" bottom (${entry1Bottom.toFixed(2)}px) > "${entry2.title}" top (${entry2Y.toFixed(2)}px)`)
          console.warn(`       Overlap amount: ${Math.abs(gapBetween).toFixed(2)}px`)
        } else if (gapBetween < 16) {
          // TIGHT: less than 16px spacing (might look cramped)
          tightSpacings++
          console.log(`   📏 Tight spacing: "${entry1.title}" → "${entry2.title}" gap = ${gapBetween.toFixed(2)}px (< 16px)`)
        } else {
          // NORMAL: sufficient spacing
          console.log(`   ✅ Good spacing: "${entry1.title}" → "${entry2.title}" gap = ${gapBetween.toFixed(2)}px`)
        }
      }
      
      // Summary report
      console.log(`\n📊 Fix 5 Stage 5 Summary:`)
      if (overlapsDetected > 0) {
        console.warn(`   ⚠️  Total overlapping pairs: ${overlapsDetected} (requires Stage 6 resolution)`)
      } else {
        console.log(`   ✅ No overlaps detected`)
      }
      
      if (tightSpacings > 0) {
        console.log(`   📏 Tight spacings (< 16px): ${tightSpacings}`)
      }
      
      console.log(`   Total center entries checked: ${sortedCenterEntries.length}`)
    }
    
    return positions
  }, [centerEntries, markerPositions, markerHeights, cardHeights, standardHeight])
  
  // Fix 9 Stage 1: Collision detection for overlapping side entries on the SAME side
  const sideEntryCollisions = useMemo(() => {
    const collisions: Array<{
      entry1: ResumeEntry
      entry2: ResumeEntry
      overlapAmount: number
      side: 'left' | 'right'
    }> = []
    
    // Separate left and right entries
    const leftEntries = sideEntries.filter(e => e.position === 'left')
    const rightEntries = sideEntries.filter(e => e.position === 'right')
    
    // Check each side independently
    for (const entries of [leftEntries, rightEntries]) {
      if (entries.length === 0) continue
      
      // Sort by end_date descending (matches display order from Step 3.1)
      const sorted = [...entries].sort((a, b) => {
        const aEnd = a.date_end_normalized?.getTime() || Date.now()
        const bEnd = b.date_end_normalized?.getTime() || Date.now()
        return bEnd - aEnd // Descending: newest end date first
      })
      
      // Check each adjacent pair for overlap
      for (let i = 0; i < sorted.length - 1; i++) {
        const entry1 = sorted[i] // Higher/newer entry (displayed above)
        const entry2 = sorted[i + 1] // Lower/older entry (displayed below)
        
        // Get entry1 position and height
        const entry1EndKey = formatMonthKey(entry1.date_end_normalized || getCurrentMonthEST())
      const entry1Y = (markerPositions.get(entry1EndKey) ?? 0) + TIMELINE_TOP_OFFSET + SIDE_CARD_TOP_BUFFER
        const entry1Height = cardHeights.get(entry1.id)?.collapsed ?? 0
        const entry1Bottom = entry1Y + entry1Height
        
        // Get entry2 position
        const entry2EndKey = formatMonthKey(entry2.date_end_normalized || getCurrentMonthEST())
      const entry2Y = (markerPositions.get(entry2EndKey) ?? 0) + TIMELINE_TOP_OFFSET + SIDE_CARD_TOP_BUFFER
        
        // Calculate gap (negative = overlap)
        const gap = entry2Y - entry1Bottom
        
        if (gap < 0) {
          // OVERLAP detected - will be resolved by cascade positioning
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
    
    // Log summary if overlaps detected (useful for debugging)
    if (collisions.length > 0) {
      console.log(`\n⚠️  Fix 9: ${collisions.length} overlaps detected, cascade positioning will resolve`)
    }
    
    return collisions
  }, [sideEntries, markerPositions, cardHeights])
  
  // Fix 9 Stage 2: Calculate required spacing to eliminate overlaps
  const collisionSpacingRequirements = useMemo(() => {
    const requirements = new Map<string, number>() // monthKey → additional height needed
    
    if (sideEntryCollisions.length === 0) {
      console.log(`\n✅ Fix 9 Stage 2: No collisions, no spacing requirements needed`)
      return requirements
    }
    
    console.log(`\n🔧 Fix 9 Stage 2: Calculating spacing requirements for ${sideEntryCollisions.length} collisions...`)
    
    let skippedCollisions = 0
    
    sideEntryCollisions.forEach((collision, idx) => {
      const { entry1, entry2, overlapAmount, side } = collision
      
      console.log(`\n   Collision ${idx + 1}: "${entry1.title}" → "${entry2.title}" (${side} side)`)
      console.log(`      Overlap: ${overlapAmount.toFixed(2)}px`)
      
      // Fix 9 Stage 2: Handle missing dates per logic doc line 232 (similar to Fix 5 Stage 3)
      // Entry 1 must fit from its end_date (card top) to Entry 2's start_date (where Entry 2 must not be overlapped)
      // Per logic doc line 75: card bottom cannot be lower than next entry's start_date marker bottom
      
      // Apply fallback logic for missing dates
      const entry1EndDate = entry1.date_end_normalized || entry1.date_start_normalized || getCurrentMonthEST()
      const entry2StartDate = entry2.date_start_normalized || entry2.date_end_normalized || getCurrentMonthEST()
      
      // Log missing date warnings
      if (!entry1.date_end_normalized && entry1.date_start_normalized) {
        console.warn(`      ⚠️  Entry1 "${entry1.title}" missing end_date, using start_date as fallback`)
      }
      if (!entry2.date_start_normalized && entry2.date_end_normalized) {
        console.warn(`      ⚠️  Entry2 "${entry2.title}" missing start_date, using end_date as fallback`)
      }
      if (!entry1.date_end_normalized && !entry1.date_start_normalized) {
        console.error(`      ❌ Entry1 "${entry1.title}" missing BOTH dates, using current month - INVALID`)
      }
      if (!entry2.date_start_normalized && !entry2.date_end_normalized) {
        console.error(`      ❌ Entry2 "${entry2.title}" missing BOTH dates, using current month - INVALID`)
      }
      
      const entry1EndKey = formatMonthKey(entry1EndDate)
      const entry2StartKey = formatMonthKey(entry2StartDate)
      
      const entry1Y = (markerPositions.get(entry1EndKey) ?? 0) + TIMELINE_TOP_OFFSET
      const entry2StartY = (markerPositions.get(entry2StartKey) ?? 0) + TIMELINE_TOP_OFFSET
      
      const currentSpan = entry2StartY - entry1Y
      const entry1Height = cardHeights.get(entry1.id)?.collapsed ?? 0
      const requiredSpan = entry1Height
      
      console.log(`      Entry1 height: ${entry1Height.toFixed(2)}px`)
      console.log(`      Current span (${entry1EndKey} → ${entry2StartKey}): ${currentSpan.toFixed(2)}px`)
      console.log(`      Required span: ${requiredSpan.toFixed(2)}px`)
      
      // Fix 9 Stage 2: Validate date order - entry2 start must be chronologically AFTER entry1 end
      // If dates overlap (entry2 starts before entry1 ends), this is a data issue - skip this collision
      if (entry2StartDate <= entry1EndDate) {
        console.warn(`      ⚠️  SKIPPING: Invalid date range - entry2 start (${formatSingleDate(entry2StartDate)}) <= entry1 end (${formatSingleDate(entry1EndDate)})`)
        console.warn(`         This collision cannot be resolved by marker expansion - entries overlap chronologically`)
        skippedCollisions++
        return
      }
      
      const additionalNeeded = Math.max(0, requiredSpan - currentSpan)
      
      if (additionalNeeded > 0) {
        console.log(`      ⚠️  Additional expansion needed: ${additionalNeeded.toFixed(2)}px`)
        
        // Distribute additional height across months between entry1 end and entry2 start
        const monthsInSpan = getMonthsInRange(entry1EndDate, entry2StartDate)
        
        if (monthsInSpan.length === 0) {
          console.warn(`      ⚠️  No months in span - date calculation error`)
          return
        }
        
        const additionalPerMonth = additionalNeeded / monthsInSpan.length
        
        console.log(`      Distributing across ${monthsInSpan.length} months: ${additionalPerMonth.toFixed(2)}px per month`)
        console.log(`      Months: ${monthsInSpan.map(m => formatMonthKey(m)).join(', ')}`)
        
        monthsInSpan.forEach(month => {
          const key = formatMonthKey(month)
          const existing = requirements.get(key) || 0
          const newRequirement = Math.max(existing, additionalPerMonth)
          
          if (newRequirement > existing) {
            requirements.set(key, newRequirement)
            console.log(`         ${key}: ${existing.toFixed(2)}px → ${newRequirement.toFixed(2)}px`)
          }
        })
      } else {
        console.log(`      ✅ No additional expansion needed (span sufficient)`)
      }
    })
    
    // Summary report
    console.log(`\n📊 Fix 9 Stage 2 Summary:`)
    console.log(`   Total collisions: ${sideEntryCollisions.length}`)
    console.log(`   Processed: ${sideEntryCollisions.length - skippedCollisions}`)
    console.log(`   Skipped: ${skippedCollisions} (invalid date ranges - entries overlap chronologically)`)
    console.log(`   Months requiring expansion: ${requirements.size}`)
    if (requirements.size > 0) {
      console.log(`   Affected months:`)
      Array.from(requirements.entries())
        .sort((a, b) => b[0].localeCompare(a[0])) // Sort descending (newest first)
        .forEach(([monthKey, height]) => {
          console.log(`      ${monthKey}: +${height.toFixed(2)}px`)
        })
    }
    
    return requirements
  }, [sideEntryCollisions, markerPositions, cardHeights])
  
  // Fix 9: CASCADE POSITIONING for same-side overlapping entries per logic doc lines 49, 51, 296
  const sideEntryAdjustedPositions = useMemo(() => {
    const positions = new Map<string, number>() // entryId → adjusted Y position
    const getEndMarkerBottom = (entry: ResumeEntry) => {
      const endDate = entry.date_end_normalized || getCurrentMonthEST()
      const endKey = formatMonthKey(endDate)
      const top = markerPositions.get(endKey) ?? 0
      const height = markerHeights.get(endKey) ?? standardHeight ?? 5
      return top + TIMELINE_TOP_OFFSET + SIDE_CARD_TOP_BUFFER // top + offset + buffer
    }
    
    // Process left and right sides independently
    const leftEntries = sideEntries.filter(e => e.position === 'left')
    const rightEntries = sideEntries.filter(e => e.position === 'right')
    
    let totalDetachments = 0
    
    // Process each side independently
    for (const entries of [leftEntries, rightEntries]) {
      if (entries.length === 0) continue
      
      // Sort by end_date descending (matches Step 3.1 display order)
      const sorted = [...entries].sort((a, b) => {
        const aEnd = a.date_end_normalized?.getTime() || Date.now()
        const bEnd = b.date_end_normalized?.getTime() || Date.now()
        return bEnd - aEnd // Descending: newest end date first
      })
      
      let previousBottom = 0 // Track previous card bottom for cascade
      
      sorted.forEach((entry, index) => {
        // Anchor at end marker top + buffer (relative)
        const markerY = getEndMarkerBottom(entry)
        
        // Get card height (use expanded if expanded, else collapsed)
        const height = expandedEntries.has(entry.id)
          ? (cardHeights.get(entry.id)?.expanded ?? cardHeights.get(entry.id)?.collapsed ?? 0)
          : (cardHeights.get(entry.id)?.collapsed ?? 0)
        
        // First entry on this side: position at marker
        // Subsequent entries: position at MAX(marker, previous bottom) to avoid overlap
        const adjustedY = index === 0 ? markerY : Math.max(markerY, previousBottom)
        
        positions.set(entry.id, adjustedY)
        
        // Update previous bottom for next entry
        previousBottom = adjustedY + height
        
        // Log detachments only (useful for debugging)
        if (index > 0 && adjustedY > markerY + 0.1) {
          console.log(`🔗 Fix 9: "${entry.title}" detached +${(adjustedY - markerY).toFixed(0)}px to avoid overlap`)
          totalDetachments++
        }
      })
    }
    
    if (totalDetachments === 0 && sideEntries.length > 0) {
      console.log(`✅ Fix 9: No detachments needed (${sideEntries.length} side entries, no overlaps)`)
    }
    
    return positions
  }, [sideEntries, markerPositions, cardHeights, expandedEntries])
  
  // Step 4.8 Stage 3: Calculate side line data for all side entries
  // Step 4.8 Stage 6: This useMemo recalculates automatically when markers change (dynamic tracking)
  // Fix 9 Stage 5: Now uses sideEntryAdjustedPositions to follow detached card positions
  const sideLineData = useMemo(() => {
    // Early return if required data not ready
    if (sideEntries.length === 0 || markerPositions.size === 0 || adjustedMarkerHeights.size === 0) {
      return []
    }
    
    // Determine final display order (top-to-bottom) using actual Y positions
    const entriesWithY = sideEntries.map(entry => {
      const endDate = entry.date_end_normalized || getCurrentMonthEST()
      const fallbackY = markerPositions.get(formatMonthKey(endDate)) ?? 0
      const adjustedY = sideEntryAdjustedPositions.get(entry.id)
      return { entry, y: adjustedY !== undefined ? adjustedY : fallbackY }
    }).sort((a, b) => a.y - b.y)

    // Assign deterministic colors: first 18 in display order get unique colors, then round-robin
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
      // Fix 9 Stage 5: Check if entry has cascade-adjusted position (detached)
      const adjustedY = sideEntryAdjustedPositions.get(entry.id)
      
      // Calculate line span bounded by month markers (no overshoot)
      let startY = 0
      let endY = 0
      let endKeyForDebug = ''
      
      // End (top) marker: end_date or Now if missing
      const endDate = entry.date_end_normalized || getCurrentMonthEST()
      const endKey = formatMonthKey(endDate)
      endKeyForDebug = endKey
      const endMarkerY = markerPositions.get(endKey) ?? 0
      const endMarkerHeight = adjustedMarkerHeights.get(endKey) ?? standardHeight ?? 5
      
      // Start (bottom) marker: start_date if present; otherwise fall back to endDate span
      const startDate = entry.date_start_normalized || endDate
      const startKey = formatMonthKey(startDate)
      const startMarkerY = markerPositions.get(startKey) ?? 0
      const startMarkerHeight = adjustedMarkerHeights.get(startKey) ?? standardHeight ?? 5
      
      // Line spans near marker edges with small buffer, clamped for very tall markers
      const endBuffer = Math.min(20, endMarkerHeight / 1) // stay inside end marker
      const startBuffer = Math.min(10, startMarkerHeight / 10) // stay inside start marker
      const startOffsetForPresent = (!entry.has_end_date_original && (entry.position === 'left' || entry.position === 'right')) ? 0 : endBuffer
      startY = endMarkerY + startOffsetForPresent // near top of end marker; Present entries start exactly at marker top
      endY = startMarkerY + startMarkerHeight - startBuffer // near bottom of start marker (match label move)
      
      // 🔍 Fix 1 Debug: Summary of calculated side line
      console.log(`🔍 Fix 1 Debug: "${entry.title}" SIDE LINE SUMMARY`)
      console.log(`   startY: ${startY.toFixed(2)}px, endY: ${endY.toFixed(2)}px, span: ${(endY - startY).toFixed(2)}px`)
      console.log(`   Marker span (end→start): ${endKey} -> ${startKey}`)
      
      // Skip if invalid span (defensive)
      if (endY <= startY) {
        console.warn(`⚠️  Side line for "${entry.title}": invalid span (startY=${startY}, endY=${endY}), skipping`)
        return
      }
      
      // Assign color from display-order-based map
      const color = colorMap.get(entry.id) ?? SIDE_LINE_COLORS[index % SIDE_LINE_COLORS.length]
      
      // Determine side from entry position
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
      {/* Loading state */}
      {loading && (
        <div className="text-white text-center py-8">
          <div className="text-lg">Loading resume entries...</div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
          <div className="text-red-400 font-semibold mb-2">Error loading entries:</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      )}
      
      {/* Main content - only show when not loading */}
      {!loading && (
        <>
          {/* Debug Window - conditional on showDebugWindow setting */}
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
          
          {/* Step 4.9 Stage 1 Option C: Wrapper container for Timeline and Entry Cards */}
          {/* Wrapper has explicit height for browser scroll calculation */}
          {/* Timeline and entry cards are children, sharing coordinate system */}
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
            
            {/* Side Entry Cards - now inside wrapper for coordinate alignment */}
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
            
            {/* Center Entry Cards - now inside wrapper for coordinate alignment */}
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

// DebugWindow component - displays debugging information
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
  // Local state for expanding markers section
  const [markersExpanded, setMarkersExpanded] = useState(false)
  
  // Helper: Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Present'
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }
  
  // Helper: Format month for full display (e.g., "June 2024")
  const formatMonthDisplay = (monthKey: string): string => {
    const [year, month] = monthKey.split('-')
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December']
    const monthIndex = parseInt(month, 10) - 1
    return `${monthNames[monthIndex]} ${year}`
  }
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
      {/* Header */}
      <h2 className="text-white text-xl font-bold mb-4">Resume Timeline Debug</h2>
      
      {/* Entry Counts Section */}
      <div className="mb-4">
        <div className="text-gray-300 mb-2">
          <span className="text-white font-semibold">Featured Entries:</span> {entries.length}
        </div>
        <div className="text-gray-300 mb-2">
          <span className="text-white font-semibold">Expanded:</span> {expandedEntries.size}
        </div>
      </div>
      
      {/* Standard Card Section */}
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
      
      {/* Timeline Metrics Section */}
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
      
      {/* Entry Details Section */}
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
      
      {/* Show Markers Expandable Section */}
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
                
                {/* Marker Debug Setting Status */}
                <div className="mb-3 pb-3 border-b border-gray-700">
                  <p className="text-xs">
                    <span className="text-gray-400">Marker Debug Mode:</span>{' '}
                    <span className={debugSettings.showAllMarkers ? 'text-emerald-400' : 'text-gray-500'}>
                      {debugSettings.showAllMarkers ? 'ON' : 'OFF'}
                    </span>
                  </p>
                </div>
                
                {/* Marker List */}
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
                            {/* Check if both green and blue are ACTIVATED (actual start/end dates) */}
                            {isGreenActivated && isBlueActivated ? (
                              <span className="flex items-center gap-1">
                                <span className="text-emerald-400">(green)</span>
                                <span className="text-blue-400">(blue)</span>
                              </span>
                            ) : isGreen && isBlue ? (
                              // Both present but at least one is just spanning through
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

// Utility: Format date range for entry cards
function formatDateRange(start: Date | null, end: Date | null): string {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  
  const formatMonth = (date: Date | null): string => {
    if (!date) return 'Present'
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }
  
  // Handle missing start_date: show only end date (logic doc line 54)
  if (!start) {
    return formatMonth(end)
  }
  
  const startStr = formatMonth(start)
  const endStr = formatMonth(end)
  
  return `${startStr} → ${endStr}`
}

// Utility: Format single date for center cards
function formatSingleDate(date: Date | null): string {
  if (!date) return 'Present'
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

// Helper: Check if Expand button should show
function shouldShowExpandButton(entry: ResumeEntry): boolean {
  return entry.description !== null && entry.description !== undefined
}

// Helper: Check if Samples button should show
function shouldShowSamplesButton(entry: ResumeEntry): boolean {
  return entry.collection_id !== null
}

// Helper: Check if Expand button should show for center cards
function shouldShowExpandButtonCenter(entry: ResumeEntry): boolean {
  // Center cards use short_description (plain text), NOT description (EditorJS)
  return entry.short_description !== null && 
         entry.short_description !== undefined && 
         entry.short_description !== ''
}

// Helper: Estimate expanded height for center cards
function estimateCenterCardExpandedHeight(shortDescription: string): number {
  // Per Logic doc line 221: ≤60 chars = 1 line (24px), >60 chars = 2 lines (48px)
  return shortDescription.length <= 60 ? 24 : 48
}

// Step 4.8 Stage 1: Side line color palette (Logic doc line 245)
// 18 unique colors for deterministic assignment to side entries
const SIDE_LINE_COLORS: readonly string[] = [
  '#7FE835', '#35E4E8', '#A9EDF7', '#46F9C1', '#DC5520', '#25277A',
  '#23A0C0', '#71A6EE', '#986BA1', '#C896E4', '#3D9DBB', '#9C6321',
  '#FC3549', '#352B97', '#6EFB81', '#7F86E0', '#D1201B', '#24D025'
] as const // 18 colors total

// Step 4.8 Stage 1: Deterministic color assignment for side lines
// Logic doc line 246: First 18 visible side entries get unique colors, entries 19+ reuse colors
// Uses modulo approach for deterministic round-robin assignment
function assignSideLineColor(index: number): string {
  // Modulo wraps index: 0-17 get unique colors, 18+ reuse starting from color[0]
  const colorIndex = index % 18
  return SIDE_LINE_COLORS[colorIndex]
}

// Step 4.8 Stage 2: SideLine component
// Renders vertical line alongside timeline for side entry duration
// Logic doc line 67: Side lines run alongside green central line for entry duration
interface SideLineProps {
  entryId: string
  startY: number  // End date marker position (top of line, newer date)
  endY: number    // Start date marker position + height (bottom of line, older date)
  color: string   // Assigned color from SIDE_LINE_COLORS
  side: 'left' | 'right'  // Entry side determines horizontal offset
}

function SideLine({ entryId, startY, endY, color, side }: SideLineProps) {
  // Calculate line height (span from end marker to start marker)
  const lineHeight = endY - startY
  
  // Defensive: skip rendering if invalid span
  if (lineHeight <= 0) {
    console.warn(`⚠️  SideLine for entry ${entryId}: invalid height ${lineHeight}px, skipping`)
    return null
  }
  
  // Fade configuration: small fade at both ends (visual only)
  const fadePx = Math.min(40, lineHeight / 2)
  const colorTransparent = `${color}00` // 8-digit hex with alpha 0
  
  // Calculate horizontal offset from timeline center
  // Left entries: -10px (line to left of center)
  // Right entries: +10px (line to right of center)
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

// Step 4.6 Stage 1-3: Calculate required per-month heights for all entries (Pass 1)
// Returns nested Map: monthKey → (entryId → requiredHeight)
// This enables identifying overlapping entries and calculating maximum height per month
function calculateRequiredHeights(
  transformedEntries: ResumeEntry[],
  cardHeights: Map<string, {collapsed: number, expanded?: number}>,
  expandedEntries: Set<string> // Step 4.7 Stage 1: expandedEntries Set determines which heights to use (expanded vs collapsed)
): Map<string, Map<string, number>> {
  // Stage 3: Initialize requiredHeightsMap for population
  const requiredHeightsMap = new Map<string, Map<string, number>>()
  
  console.log('\n📊 Step 4.6 Stage 3 - Populating requiredHeightsMap')
  
  // Loop through all entries (side and center per line 291)
  for (const entry of transformedEntries) {
    // Step 4.7 Stage 2: Use expanded height if entry expanded, else collapsed
    const isExpanded = expandedEntries.has(entry.id)
    const entryHeight = isExpanded 
      ? (cardHeights.get(entry.id)?.expanded || cardHeights.get(entry.id)?.collapsed)
      : cardHeights.get(entry.id)?.collapsed
    
    // Skip if height not measured yet (defensive)
    if (!entryHeight) {
      console.warn(`⚠️  Entry "${entry.title}": height not measured yet, skipping`)
      continue
    }
    
    // Calculate required per-month height: entry height ÷ month count
    const requiredPerMonth = entryHeight / entry.monthCount
    
    // Get month span for this entry (handle missing dates per position type)
    let startDate = entry.date_start_normalized
    let endDate = entry.date_end_normalized
    
    // Handle missing end_date per position type (from Step 4.1 Stage 3 logic)
    if (!endDate) {
      if (entry.position === 'left' || entry.position === 'right') {
        // Side entries: missing end = Present (Now marker)
        endDate = getCurrentMonthEST()
      } else {
        // Center entries: missing end = treat start as end (line 232)
        endDate = startDate
      }
    }
    
    // Handle missing start_date (treat as equal to end per line 54)
    if (!startDate) {
      startDate = endDate
    }
    
    // Get all months this entry spans
    const monthSpan = getMonthsInRange(startDate, endDate)
    
    // Populate Map: for each month in span, add entry.id → requiredHeight
    for (const month of monthSpan) {
      const monthKey = formatMonthKey(month)
      
      // If this monthKey not in Map yet, create empty Map for it
      if (!requiredHeightsMap.has(monthKey)) {
        requiredHeightsMap.set(monthKey, new Map<string, number>())
      }
      
      // Add this entry's requirement to the month's Map
      requiredHeightsMap.get(monthKey)!.set(entry.id, requiredPerMonth)
    }
    
    // Console log for this entry (Step 4.7 Stage 2: show which height type used)
    const heightType = isExpanded ? 'expanded' : 'collapsed'
    console.log(`   "${entry.title}":`)
    console.log(`      ${heightType}: ${entryHeight.toFixed(2)}px ÷ ${entry.monthCount} months = ${requiredPerMonth.toFixed(2)}px/month`)
    console.log(`      Spans ${monthSpan.length} months (${formatMonthKey(monthSpan[0])} to ${formatMonthKey(monthSpan[monthSpan.length - 1])})`)
  }
  
  // Console log sample mappings
  console.log('\n📋 Sample month mappings (first 3 months with entries):')
  let count = 0
  for (const [monthKey, entryMap] of requiredHeightsMap) {
    if (count >= 3) break
    const entries = Array.from(entryMap.entries())
    console.log(`   ${monthKey}: ${entries.length} entries`)
    entries.forEach(([entryId, height]) => {
      const entry = transformedEntries.find(e => e.id === entryId)
      console.log(`      - "${entry?.title}": ${height.toFixed(2)}px`)
    })
    count++
  }
  
  console.log(`✅ Stage 3 complete - requiredHeightsMap populated with ${requiredHeightsMap.size} months`)
  
  // Stage 3: Return populated Map
  return requiredHeightsMap
}

// Step 4.6 Stage 4-5: Apply maximum heights for overlapping entries (Pass 2)
// Returns Map: monthKey → finalHeight (maximum among all overlapping entries)
// Implements line 290: "height per affected month marker is the maximum required height among all overlapping entries"
function applyMaximumHeights(
  requiredHeightsMap: Map<string, Map<string, number>>,
  operationalMonths: Date[],
  standardHeight: number
): Map<string, number> {
  // Stage 5-6: Initialize all months with standard height, then apply maximum for entries
  const updatedMarkerHeights = new Map<string, number>()
  
  console.log('\n📐 Step 4.6 Stage 6 - Applying maximum heights for overlapping entries')
  
  // Initialize all operational months with standard height (baseline per line 289)
  let gapMonthsCount = 0
  let entriesExpandingCount = 0
  let entriesUsingStandardCount = 0
  
  for (const month of operationalMonths) {
    const monthKey = formatMonthKey(month)
    
    // Check if this month has entries spanning it
    const entryRequirementsMap = requiredHeightsMap.get(monthKey)
    
    if (!entryRequirementsMap) {
      // Gap month: no entries spanning (line 289)
      updatedMarkerHeights.set(monthKey, standardHeight)
      gapMonthsCount++
    } else {
      // Month has entries: calculate maximum required height
      const allRequiredHeights = Array.from(entryRequirementsMap.values())
      const maximumRequired = Math.max(...allRequiredHeights)
      
      // Compare to standard: use larger value (never go below standard)
      const finalHeight = Math.max(standardHeight, maximumRequired)
      
      // 🔍 Fix 1 Debug: Track decimal preservation in Math.max (sample first 3 entry months)
      if (entriesExpandingCount < 3) {
        console.log(`🔍 Fix 1 Debug: Month ${monthKey} - Math.max decimal check`)
        console.log(`   Requirements: [${allRequiredHeights.map(h => h.toFixed(6)).join(', ')}]`)
        console.log(`   Maximum: ${maximumRequired.toFixed(6)} (decimal: ${maximumRequired % 1 !== 0})`)
        console.log(`   Final (max vs standard ${standardHeight}): ${finalHeight.toFixed(6)} (decimal: ${finalHeight % 1 !== 0})`)
      }
      
      // Update Map with final height
      updatedMarkerHeights.set(monthKey, finalHeight)
      
      // Track expansion vs standard
      if (maximumRequired > standardHeight) {
        entriesExpandingCount++
      } else {
        entriesUsingStandardCount++
      }
    }
  }
  
  // Console log statistics
  console.log(`   Total operational months: ${operationalMonths.length}`)
  console.log(`   Gap months (standard ${standardHeight}px): ${gapMonthsCount}`)
  console.log(`   Months requiring expansion (> ${standardHeight}px): ${entriesExpandingCount}`)
  console.log(`   Months using standard (≤ ${standardHeight}px): ${entriesUsingStandardCount}`)
  
  // Console log sample maximum calculations (first 5 months with entries)
  console.log('\n📋 Sample maximum calculations (first 5 months with entries):')
  let sampleCount = 0
  for (const [monthKey, entryRequirementsMap] of requiredHeightsMap) {
    if (sampleCount >= 5) break
    
    const allRequiredHeights = Array.from(entryRequirementsMap.values())
    const maximumRequired = Math.max(...allRequiredHeights)
    const finalHeight = updatedMarkerHeights.get(monthKey)!
    
    console.log(`   ${monthKey}: ${entryRequirementsMap.size} entries`)
    console.log(`      Requirements: [${allRequiredHeights.map(h => h.toFixed(2)).join(', ')}]px`)
    console.log(`      Maximum: ${maximumRequired.toFixed(2)}px`)
    console.log(`      Final (max of standard & maximum): ${finalHeight.toFixed(2)}px`)
    
    sampleCount++
  }
  
  console.log('✅ Stage 6 complete - maximum heights applied per line 290')
  
  // Stage 6: Return Map with final heights (gaps at standard, entries at maximum)
  return updatedMarkerHeights
}

// EntryCard component - displays resume entry cards
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
  // Height measurement ref (will be used in Phase 4)
  const measureRef = useRef<HTMLDivElement>(null)
  const [editorReady, setEditorReady] = useState(false)
  
  // Callback when EditorRenderer is ready (used for expanded height measurement)
  const handleEditorReady = useCallback(() => {
    setEditorReady(true)
    console.log(`✅ Editor ready for "${entry.title}", will measure expanded height`)
  }, [entry.title])
  
  // Measure collapsed height (once on mount)
  useEffect(() => {
    if (measureRef.current && !isExpanded) {
      const height = measureRef.current.getBoundingClientRect().height
      onHeightMeasured(entry.id, height, 'collapsed')
      console.log(`📏 Card height measured for "${entry.title}":`, height, 'px (collapsed)')
    }
    // Only measure once per entry.id, don't include onHeightMeasured in deps to prevent loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id])
  
  // Measure expanded height (when expanded)
  useEffect(() => {
    // For center cards: measure immediately (plain text, no Editor.js wait)
    // For side cards: wait for editorReady (Editor.js initialization)
    const canMeasureExpanded = isExpanded && (position === 'center' || editorReady)
    
    if (canMeasureExpanded && measureRef.current) {
      // Use requestAnimationFrame to ensure DOM is fully updated after expansion
      requestAnimationFrame(() => {
        if (measureRef.current) {
          const height = measureRef.current.getBoundingClientRect().height
          onHeightMeasured(entry.id, height, 'expanded')
          
          // For center cards, log estimation vs actual
          if (position === 'center' && entry.short_description) {
            const estimated = estimateCenterCardExpandedHeight(entry.short_description)
            console.log(`📏 Card height measured for "${entry.title}":`, height, `px (expanded) | Estimated: ${estimated}px | Text length: ${entry.short_description.length} chars`)
          } else {
            console.log(`📏 Card height measured for "${entry.title}":`, height, 'px (expanded)')
          }
        }
      })
    }
    
    // Reset editor ready when collapsed (side cards only)
    if (!isExpanded && position !== 'center') {
      setEditorReady(false)
    }
  }, [isExpanded, editorReady, entry.id, entry.title, entry.short_description, position, onHeightMeasured])
  
  // Determine base classes based on position and featured status
  const borderClass = entry.is_featured ? 'border-emerald-400' : 'border-gray-800'
  const shadowClass = entry.is_featured ? 'shadow-lg shadow-emerald-900/20' : ''
  const baseClasses = `bg-gray-900 border-2 ${borderClass} ${shadowClass} rounded-lg p-6`
  
  // Vertical positioning: marker-based for all entries (Step 4.4 center, Step 4.5 side)
  let topPosition = 0 // Will be set from markerPositions Map
  
  if (position === 'center') {
    // Fix 5 Stage 1: Debug centerAdjustedY prop value
    console.log(`🔄 Fix 5 Stage 1: Center entry "${entry.title}" - centerAdjustedY=${centerAdjustedY !== undefined ? centerAdjustedY.toFixed(2) : 'UNDEFINED'}`)
    
    // Step 5.1 Fix 5: Use centered position within marker span if available
    if (centerAdjustedY !== undefined) {
      topPosition = centerAdjustedY
      
      // Log centered positioning (simplified from Stage 9 cascade logging)
      console.log(`🔄 Step 5.1 Fix 5: Center entry "${entry.title}" positioned (centered within span)`)
      console.log(`   Y position: ${centerAdjustedY.toFixed(2)}px`)
    } else {
      // Fallback: Position at end_date marker (safety if calculation unavailable)
      const positioningDate = entry.date_end_normalized || entry.date_start_normalized
      if (positioningDate) {
        const monthKey = formatMonthKey(positioningDate)
        const markerYPosition = markerPositions.get(monthKey) ?? 0
        topPosition = markerYPosition
        
        console.warn(`⚠️  Center entry "${entry.title}" using fallback positioning (centered calc unavailable)`)
      }
    }
  } else {
    // Fix 9 Stage 3: Use cascade-adjusted position if available (detached entries)
    if (sideAdjustedY !== undefined) {
      topPosition = sideAdjustedY
    } else {
      // Fallback: Position at end_date marker (safety if calculation unavailable)
      const positioningDate = entry.date_end_normalized || getCurrentMonthEST()
      const monthKey = formatMonthKey(positioningDate)
      const markerYPosition = markerPositions.get(monthKey) ?? 0
      topPosition = markerYPosition
      
      console.warn(`⚠️  Side entry "${entry.title}" using fallback positioning (cascade calc unavailable)`)
    }
  }
  
  // Format date range
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
        {/* Date range */}
        <div className="text-gray-400 text-sm mb-3">
          {dateRange}
        </div>
        
        {/* Title (company name) */}
        <h3 className="text-xl font-bold text-white mb-1">
          {entry.title}
        </h3>
        
        {/* Subtitle (job title) - conditional */}
        {entry.subtitle && (
          <div className="text-gray-400 text-base mb-2">
            {entry.subtitle}
          </div>
        )}
        
        {/* Short description - conditional */}
        {entry.short_description && (
          <div className="text-gray-300 text-base mb-4">
            {entry.short_description}
          </div>
        )}
        
        {/* Expanded EditorJS content - conditional, with smooth transition */}
        {isExpanded && entry.description && (
          <div className="transition-all duration-300 ease-in-out overflow-hidden mb-4">
            <EditorRenderer data={entry.description} imageSizes={entry.description_image_sizes} onReady={handleEditorReady} />
          </div>
        )}
        
        {/* Assets row - conditional, right-aligned for left cards */}
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
        
        {/* Button row - Samples (left) and Expand (center) */}
        <div className="flex items-center justify-between">
          {/* Samples button - left side for left cards */}
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
          
          {/* Expand button - center */}
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
        {/* Date range */}
        <div className="text-gray-400 text-sm mb-3">
          {dateRange}
        </div>
        
        {/* Title (company name) */}
        <h3 className="text-xl font-bold text-white mb-1">
          {entry.title}
        </h3>
        
        {/* Subtitle (job title) - conditional */}
        {entry.subtitle && (
          <div className="text-gray-400 text-base mb-2">
            {entry.subtitle}
          </div>
        )}
        
        {/* Short description - conditional */}
        {entry.short_description && (
          <div className="text-gray-300 text-base mb-4">
            {entry.short_description}
          </div>
        )}
        
        {/* Expanded EditorJS content - conditional, with smooth transition */}
        {isExpanded && entry.description && (
          <div className="transition-all duration-300 ease-in-out overflow-hidden mb-4">
            <EditorRenderer data={entry.description} imageSizes={entry.description_image_sizes} onReady={handleEditorReady} />
          </div>
        )}
        
        {/* Assets row - conditional, left-aligned for right cards */}
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
        
        {/* Button row - Expand (center) and Samples (right) */}
        <div className="flex items-center justify-between">
          {/* Expand button - center */}
          {shouldShowExpandButton(entry) && (
            <div 
              onClick={onToggleExpand}
              className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm cursor-pointer"
            >
              {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
            </div>
          )}
          
          {/* Samples button - right side for right cards */}
          {shouldShowSamplesButton(entry) ? (
            <div className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm cursor-pointer">
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
        {/* Date end (top) - always rendered 
            Per logic doc line 232: if date_end missing, treat start_date as end_date */}
        <div className="text-sm text-gray-400 mb-2">
          {formatSingleDate(entry.date_end_normalized || entry.date_start_normalized)}
        </div>
        
        {/* Title (middle) */}
        <h3 className="text-xl font-bold text-white mb-2">
          {entry.title}
        </h3>
        
        {/* Short description - plain text, conditional on expansion */}
        {isExpanded && entry.short_description && (
          <div className="transition-all duration-300 ease-in-out overflow-hidden text-sm text-gray-300 mb-3">
            {entry.short_description}
          </div>
        )}
        
        {/* Date start (bottom) - conditional 
            Per logic doc line 232: only show if date_end exists (otherwise start was used as end above) */}
        {entry.date_start_normalized && entry.date_end_normalized && (
          <div className="text-sm text-gray-400 mb-3">
            {formatSingleDate(entry.date_start_normalized)}
          </div>
        )}
        
        {/* Expand button - conditional, center-aligned */}
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
  
  // Fallback for unexpected position values
  return null
}

// Utility: Calculate current month in EST
function getCurrentMonthEST(): Date {
  const now = new Date()
  
  // Convert to EST (UTC-5)
  const estOffset = -5 * 60 // EST is UTC-5 in minutes
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
  const estTime = new Date(utcTime + (estOffset * 60000))
  
  // Return first day of current month in EST
  return new Date(estTime.getFullYear(), estTime.getMonth(), 1)
}

// Utility: Normalize date to first of month in EST
function normalizeDate(dateString: string | null): Date | null {
  if (!dateString) return null
  
  // Parse YYYY-MM-DD format
  const [year, month, day] = dateString.split('-').map(Number)
  
  // Create date as first day of month
  // JavaScript months are 0-indexed (0 = January)
  const date = new Date(year, month - 1, 1)
  
  return date
}

// Utility: Count months inclusively (both start and end count)
function countMonths(start: Date | null, end: Date | null): number {
  // Handle missing dates per logic doc rules
  if (!start && !end) return 0
  if (!start) start = end! // Missing start = treat as equal to end
  if (!end) end = getCurrentMonthEST() // Missing end = treat as Present
  
  // Count months inclusively
  const yearDiff = end.getFullYear() - start.getFullYear()
  const monthDiff = end.getMonth() - start.getMonth()
  const totalMonths = yearDiff * 12 + monthDiff + 1 // +1 for inclusive counting
  
  // Minimum 1 month (even if start == end)
  return Math.max(1, totalMonths)
}

// Utility: Format Date to MonthKey string ("YYYY-MM")
function formatMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

// Utility: Generate array of all months between start and end (inclusive)
function getMonthsInRange(start: Date | null, end: Date | null): Date[] {
  if (!start || !end) return []
  
  const months: Date[] = []
  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  const endDate = new Date(end.getFullYear(), end.getMonth(), 1)
  
  // Generate months from start to end (inclusive)
  while (current <= endDate) {
    months.push(new Date(current))
    current.setMonth(current.getMonth() + 1)
  }
  
  return months
}

// Utility: Calculate Start marker (earliest start date from all entries)
function calculateStartMarker(entries: ResumeEntry[]): Date | null {
  if (entries.length === 0) return null
  
  let earliestDate: Date | null = null
  
  for (const entry of entries) {
    // Logic doc line 54: if start is missing, treat start as end (and end already handles Present for side entries)
    const startCandidate = entry.date_start_normalized || entry.date_end_normalized || getCurrentMonthEST()
    if (!earliestDate || startCandidate < earliestDate) {
      earliestDate = startCandidate
    }
  }
  
  return earliestDate
}

// Utility: Generate operational months array (Start to Now)
function generateOperationalMonths(startMarker: Date | null, nowMarker: Date): Date[] {
  if (!startMarker) return [nowMarker]
  
  return getMonthsInRange(startMarker, nowMarker)
}

// Utility: Calculate Y positions for all operational markers (Step 4.3)
function calculateMarkerPositions(
  operationalMonths: Date[],
  markerHeights: Map<string, number>,
  standardHeight: number | null
): Map<string, number> {
  const positions = new Map<string, number>()
  
  // Edge case: no operational months
  if (operationalMonths.length === 0) return positions
  
  // Start from Y=0 at top (Now marker, most recent month)
  let yOffset = 0
  
  // 🔍 Fix 1 Debug: Track cumulative sum decimal preservation (sample first 5 markers)
  let sampleCount = 0
  
  // Iterate through months from newest to oldest (reverse chronological)
  // operationalMonths array is sorted from oldest to newest (Start → Now)
  // so we iterate in REVERSE to place Now (last element) at top Y=0
  for (let i = operationalMonths.length - 1; i >= 0; i--) {
    const month = operationalMonths[i]
    const monthKey = formatMonthKey(month)
    
    // Set position for this marker (current yOffset)
    positions.set(monthKey, yOffset)
    
    // Get height for this marker from Map
    // Fallback: standardHeight → 50px if height not found
    const height = markerHeights.get(monthKey) ?? standardHeight ?? 50
    
    // 🔍 Fix 1 Debug: Track cumulative sum (sample first 5 markers)
    if (sampleCount < 5) {
      console.log(`🔍 Fix 1 Debug: Cumulative at ${monthKey}`)
      console.log(`   Position (before): ${yOffset.toFixed(6)}px (type: ${typeof yOffset})`)
      console.log(`   Height from Map: ${height.toFixed(6)}px (decimal: ${height % 1 !== 0})`)
      console.log(`   Position (after): ${(yOffset + height).toFixed(6)}px`)
      sampleCount++
    }
    
    // Add height to offset for next marker (markers grow downward)
    yOffset += height
  }
  
  return positions
}

// Utility: Calculate standard card with 3-tier tie-breaking (Step 4.2)
function calculateStandardCard(sideEntries: ResumeEntry[]): ResumeEntry | null {
  // Edge case: no side entries
  if (sideEntries.length === 0) return null
  
  // Find longest duration (maximum monthCount)
  const maxMonthCount = Math.max(...sideEntries.map(e => e.monthCount))
  
  // Get all entries with max duration (tie candidates)
  let candidates = sideEntries.filter(e => e.monthCount === maxMonthCount)
  
  // If only one candidate, return it immediately (no tie-breaking needed)
  if (candidates.length === 1) return candidates[0]
  
  // Tier 1: Lowest end_date (earliest chronologically)
  // Note: null end_date = Present = highest value, should NOT win as "lowest"
  let minEndDate: Date | null = null
  for (const entry of candidates) {
    const endDate = entry.date_end_normalized
    // Skip null dates (Present is not "lowest")
    if (endDate) {
      if (!minEndDate || endDate < minEndDate) {
        minEndDate = endDate
      }
    }
  }
  
  // Filter to entries with lowest end date
  if (minEndDate) {
    const tier1Candidates = candidates.filter(e => 
      e.date_end_normalized && e.date_end_normalized.getTime() === minEndDate.getTime()
    )
    if (tier1Candidates.length === 1) return tier1Candidates[0]
    candidates = tier1Candidates
  }
  
  // Tier 2: Latest start_date (most recent chronologically)
  let maxStartDate: Date | null = null
  for (const entry of candidates) {
    const startDate = entry.date_start_normalized
    if (startDate) {
      if (!maxStartDate || startDate > maxStartDate) {
        maxStartDate = startDate
      }
    }
  }
  
  // Filter to entries with latest start date
  if (maxStartDate) {
    const tier2Candidates = candidates.filter(e => 
      e.date_start_normalized && e.date_start_normalized.getTime() === maxStartDate.getTime()
    )
    if (tier2Candidates.length === 1) return tier2Candidates[0]
    candidates = tier2Candidates
  }
  
  // Tier 3: Lowest order_index (first in admin display order)
  const minOrderIndex = Math.min(...candidates.map(e => e.order_index))
  const finalCandidate = candidates.find(e => e.order_index === minOrderIndex)
  
  return finalCandidate || candidates[0] // Fallback to first if somehow still tied
}

// Transformed entry type with computed fields
type ResumeEntry = ResumeEntryRaw & {
  date_start_normalized: Date | null
  date_end_normalized: Date | null
  has_end_date_original: boolean
  monthCount: number
  position: 'left' | 'right' | 'center'
}

// MonthMarker component - created in Step 4.1 Stage 2
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
  // Hide operational markers in normal mode (only show in debug mode)
  if (markerType === 'operational' && !debugMode) {
    return null
  }
  
  // Determine text color based on marker type
  const textColorClass = markerType === 'green' ? 'text-emerald-400' : 
                         markerType === 'blue' ? 'text-[#88b6e3]' : 
                         'text-gray-400' // operational (for debug mode)
  
  // Reduced opacity for operational markers in debug mode
  const opacityClass = markerType === 'operational' ? 'opacity-40' : 'opacity-100'
  
  // Parse monthKey to extract month and year for label
  // monthKey format: "YYYY-MM" (e.g., "2025-11")
  const [year, monthNum] = monthKey.split('-')
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']
  const monthName = monthNames[parseInt(monthNum) - 1]
  const label = `${monthName} ${year}`
  // For start-month markers, place label near the bottom of the marker (offset upward by startMarkerLabelOffset)
  const labelTop = startSideMarkers?.has(monthKey)
    ? yPosition + height - startMarkerLabelOffset
    : yPosition
  const extraBottom = startSideMarkers?.has(monthKey) ? startMarkerLabelBufferBottom : 0
  
  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 z-10"
      style={{ top: `${labelTop}px` }}
    >
      {/* Month label - centered on timeline with gradient shadow */}
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

// Timeline component - basic structure for Phase 2
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
  
  // Step 4.3 Stage 3: Determine which markers to render
  const markersToRender = debugSettings.showAllMarkers
    ? operationalMonths // Debug mode: show all operational markers
    : operationalMonths.filter(month => { // Normal mode: only activated markers
        const monthKey = formatMonthKey(month)
        return activatedMarkers.has(monthKey)
      })
  
  // Log marker rendering for verification
  useEffect(() => {
    console.log('\n🎨 Step 4.3 Stage 3 - Timeline Marker Rendering')
    console.log('   Debug mode:', debugSettings.showAllMarkers)
    console.log('   Markers to render:', markersToRender.length)
    console.log('   Activated markers count:', activatedMarkers.size)
    console.log('   Operational markers count:', operationalMonths.length)
    
    // Sample marker details (first 5)
    const sampleMarkers = markersToRender.slice(0, 5).map(month => {
      const monthKey = formatMonthKey(month)
      const isGreenActivated = greenActivatedMarkers.has(monthKey)
      const isBlueActivated = blueActivatedMarkers.has(monthKey)
      const markerType = isBlueActivated ? 'blue' : isGreenActivated ? 'green' : 'operational'
      const yPos = markerPositions.get(monthKey) ?? 0
      return { monthKey, markerType, yPos }
    })
    console.log('   Sample markers (first 5):', sampleMarkers)
    console.log('✅ Stage 3 - Markers rendering on timeline')
  }, [debugSettings.showAllMarkers, markersToRender.length, activatedMarkers.size])
  
  // Step 4.8 Stage 4: Log side line rendering
  console.log('\n🎨 Step 4.8 Stage 4 - Side line rendering')
  console.log('   Side lines to render:', sideLineData.length)
  if (sideLineData.length > 0) {
    console.log('   Sample (first 3):')
    sideLineData.slice(0, 3).forEach((line, i) => {
      console.log(`      ${i}. entryId=${line.entryId}, color=${line.color}, side=${line.side}, startY=${line.startY.toFixed(2)}px, endY=${line.endY.toFixed(2)}px`)
    })
  }
  
  // Step 4.9 Stage 1: Apply visual timeline expansion
  // Green line height now dynamic (reflects calculated marker heights sum)
  // Birth caption positioned dynamically at timeline end
  // Note: Explicit height moved to wrapper in ResumeTab (Option C fix)
  return (
    <div className="relative w-full">
      {/* Now marker - reference point at top (position 0) */}
      <div ref={nowMarkerRef} className="absolute left-1/2 -translate-x-1/2 top-0">
        <span className="text-emerald-400 font-semibold text-lg">Now</span>
      </div>
      
      {/* Step 4.8 Stage 4: Render side lines */}
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
      
      {/* Step 4.3 Stage 3: Render month markers */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '35px' }}>
        {markersToRender.map((month) => {
          const monthKey = formatMonthKey(month)
          const yPosition = markerPositions.get(monthKey) ?? 0
          const height = markerHeights.get(monthKey) ?? 0
          
          // Determine marker type (color)
          // Priority: blue overrides green if both (center entries take precedence)
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
          
          // Skip rendering blue markers - center entry cards already display dates
          // Center cards have dates within them that serve as blue markers (logic doc lines 228-229)
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
      
      {/* Central green timeline line - starts 35px below Now marker */}
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
      
      {/* Birth caption - positioned dynamically at timeline end */}
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
