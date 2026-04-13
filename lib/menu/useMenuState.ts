'use client'

/**
 * Stage 7a — Menu State Hook
 * Manages the four active IDs, derives nav state (1–6), and persists to localStorage.
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MenuState {
  activeCategoryId: string | null
  activeSubcategoryId: string | null
  activeCollectionId: string | null
  activeContentId: string | null
}

/** 1=Default, 2=Category, 3=Subcategory, 4=ActiveContent, 5=Collection, 6=DualAnchor */
export type NavState = 1 | 2 | 3 | 4 | 5 | 6

export interface UseMenuStateOptions {
  /** IDs of all currently loaded categories (used to validate stored state) */
  allCategoryIds: string[]
  /** IDs of all currently loaded subcategories */
  allSubcategoryIds: string[]
  /** IDs of all currently loaded collections */
  allCollectionIds: string[]
  /** IDs of all currently loaded content items */
  allContentIds: string[]
  /** Full subcategory list — needed for cousin-click parent resolution */
  allSubcategories: ReadonlyArray<{ id: string; category_id: string }>
}

export interface MenuStateActions {
  state: MenuState
  navState: NavState
  /** Set active category, clear subcategory and content */
  selectCategory: (id: string) => void
  /** Set active subcategory; auto-switches category on cousin click */
  selectSubcategory: (id: string) => void
  /** Set active collection, clear content */
  selectCollection: (id: string) => void
  /** Clear active collection */
  dismissCollection: () => void
  /** Set active content, clear collection */
  selectContent: (id: string) => void
  /** Clear active content */
  clearContent: () => void
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
//
// Only content and collection IDs are persisted. Category and subcategory
// selections are intentionally ephemeral — they are never saved or restored.
// On hard refresh, category and subcategory always reset. Content and
// collection are restored if the stored IDs still exist in the loaded data.

const STORAGE_KEY = 'dm_menu_state'

interface StoredState {
  collectionId: string | null
  contentId: string | null
}

function readStorage(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredState
  } catch {
    return null
  }
}

function writeStorage(state: MenuState): void {
  try {
    const stored: StoredState = {
      collectionId: state.activeCollectionId,
      contentId: state.activeContentId,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // ignore write failures (e.g. private browsing quota)
  }
}

// ---------------------------------------------------------------------------
// Nav state derivation
// ---------------------------------------------------------------------------

export function deriveNavState(state: MenuState): NavState {
  if (state.activeContentId) return 4
  if (state.activeCollectionId && state.activeSubcategoryId) return 6
  if (state.activeCollectionId) return 5
  if (state.activeSubcategoryId) return 3
  if (state.activeCategoryId) return 2
  return 1
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useMenuState(options: UseMenuStateOptions): MenuStateActions {
  // Use ref so action callbacks always see the latest options without needing
  // to be recreated on every render.
  const optionsRef = useRef(options)
  optionsRef.current = options

  const [state, setState] = useState<MenuState>({
    activeCategoryId: null,
    activeSubcategoryId: null,
    activeCollectionId: null,
    activeContentId: null,
  })

  // Restore content and collection from localStorage once data has loaded.
  // Category and subcategory are never restored — they always reset on refresh.
  const hasRestoredRef = useRef(false)

  useEffect(() => {
    if (hasRestoredRef.current) return

    const { allCollectionIds, allContentIds } = optionsRef.current

    const hasData = allCollectionIds.length > 0 || allContentIds.length > 0
    if (!hasData) return

    hasRestoredRef.current = true

    const stored = readStorage()
    if (!stored) return

    setState(prev => ({
      ...prev,
      activeCollectionId:
        stored.collectionId && allCollectionIds.includes(stored.collectionId)
          ? stored.collectionId
          : null,
      activeContentId:
        stored.contentId && allContentIds.includes(stored.contentId)
          ? stored.contentId
          : null,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.allCollectionIds.length, options.allContentIds.length])

  // Persist to localStorage on every state change (content and collection only)
  useEffect(() => {
    writeStorage(state)
  }, [state])

  // ---------------------------------------------------------------------------
  // Actions
  // Spec State 2-6 transition rules:
  //   - Selecting category or subcategory does NOT clear the active collection (State 6).
  //   - Selecting content clears the active collection (State 4 cannot coexist with 5).
  //   - Selecting a collection clears active content (State 5 cannot coexist with 4).
  // ---------------------------------------------------------------------------

  const selectCategory = useCallback((id: string) => {
    setState(prev => ({
      activeCategoryId: id,
      activeSubcategoryId: null,           // clear subcategory
      activeCollectionId: prev.activeCollectionId, // keep collection
      activeContentId: null,               // close reader
    }))
  }, [])

  const selectSubcategory = useCallback((id: string) => {
    setState(prev => {
      // Cousin click: auto-switch to the subcategory's parent category
      const sub = optionsRef.current.allSubcategories.find(s => s.id === id)
      const parentCategoryId = sub?.category_id ?? prev.activeCategoryId
      return {
        activeCategoryId: parentCategoryId,
        activeSubcategoryId: id,
        activeCollectionId: prev.activeCollectionId, // keep collection (State 6)
        activeContentId: null,             // close reader
      }
    })
  }, [])

  const selectCollection = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      activeCollectionId: id,
      activeContentId: null,               // cannot coexist with content (spec §State 5)
    }))
  }, [])

  const dismissCollection = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeCollectionId: null,
    }))
  }, [])

  const selectContent = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      activeCollectionId: null,            // cannot coexist with collection (spec §State 4)
      activeContentId: id,
    }))
  }, [])

  const clearContent = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeContentId: null,
    }))
  }, [])

  return {
    state,
    navState: deriveNavState(state),
    selectCategory,
    selectSubcategory,
    selectCollection,
    dismissCollection,
    selectContent,
    clearContent,
  }
}
