/**
 * Layout Constants - Single Source of Truth
 * 
 * This file contains all shared layout constants used across the application.
 * These constants ensure consistency and make it easy to update layout values
 * in one place.
 * 
 * CRITICAL: Some constants are fixed layout constraints that cannot be changed
 * without breaking functionality. These are marked with ⚠️ CRITICAL.
 * 
 * Reference: docs/handoff-docs/redesign-handoff.md
 */

// ============================================================================
// ⚠️ CRITICAL CONSTANTS - DO NOT CHANGE (Will Break Functionality)
// ============================================================================

/**
 * Resume Tab - Side Card Width
 * ⚠️ CRITICAL: Used in timeline marker height calculations, cascade positioning, overlap detection
 * Changing this breaks all timeline math
 */
export const RESUME_SIDE_CARD_WIDTH_PX = 560

/**
 * Resume Tab - Center Card Width
 * ⚠️ CRITICAL: Used in center entry positioning calculations
 * Changing this breaks center entry placement
 */
export const RESUME_CENTER_CARD_WIDTH_PX = 384

/**
 * Resume Tab - Timeline Top Offset
 * ⚠️ CRITICAL: Used in all marker position calculations (cumulative sum)
 * Changing this breaks all marker positions
 */
export const RESUME_TIMELINE_TOP_OFFSET_PX = 35

/**
 * Resume Tab - Side Card Positioning Offset
 * ⚠️ CRITICAL: Fixed offset from center for timeline alignment
 * Left cards: right: calc(50% + 70px), Right cards: left: calc(50% + 70px)
 * Changing this breaks timeline alignment
 */
export const RESUME_SIDE_CARD_OFFSET_PX = 70

/**
 * Resume Tab - Start Marker Label Offset
 * ⚠️ CRITICAL: Anchors labels at marker bottom with buffer
 * Changing this breaks label positioning
 */
export const RESUME_START_MARKER_LABEL_OFFSET_PX = 15

/**
 * Resume Tab - Start Marker Bottom Spacer
 * ⚠️ CRITICAL: Adds extra space below start markers
 * Changing this breaks marker spacing
 */
export const RESUME_START_MARKER_BOTTOM_SPACER_PX = 20

/**
 * Bottom Nav - Active Tab Side Offset
 * ⚠️ CRITICAL: Keeps Portfolio/Resume centered regardless of side tabs
 * Active Collection tabs: calc(50% + 180px) (right offset)
 * Active Content tabs: calc(50% + 180px) (left offset)
 * Changing this breaks tab centering logic
 */
export const BOTTOM_NAV_SIDE_TAB_OFFSET_PX = 180

// ============================================================================
// Layout Constants (Can Be Adjusted, But Coordinate Changes)
// ============================================================================

/**
 * Bottom Navigation Height
 * Used for calculating component heights that need to avoid bottom nav overlap
 * 
 * Note: This should match --tab-bar-height in globals.css (64px)
 * For CSS calc, use: calc(100vh - var(--tab-bar-height, 64px))
 * For TypeScript calculations, use this constant
 */
export const BOTTOM_NAV_HEIGHT_PX = 64

/**
 * Profile Collapsed Height
 * Default height when profile is collapsed (can be overridden by database value)
 */
export const PROFILE_COLLAPSED_HEIGHT_PX = 200

/**
 * Info Menu Width
 * Redesign change: Changed from centered floating element to sidebar (280px)
 * Content Reader margin-left must account for this: 280px + 30px gap = 310px
 * 
 * Note: Content Reader currently uses 295px (280px + 15px gap), but redesign specifies 30px gap
 * This will be updated in Step 8 (Info Menu layout change)
 */
export const INFO_MENU_WIDTH_PX = 280

/**
 * Info Menu Left Position
 * Distance from left edge of viewport
 */
export const INFO_MENU_LEFT_PX = 25

/**
 * Content Reader Margin Left
 * Distance from left edge to account for Info Menu sidebar
 * Calculation: INFO_MENU_WIDTH_PX + gap (30px in redesign, currently 15px)
 * 
 * Current: 295px (280px + 15px)
 * Redesign: 310px (280px + 30px) - will be updated in Step 8
 */
export const CONTENT_READER_MARGIN_LEFT_PX = 295

/**
 * Content Reader Margin Right
 * Gap from right edge of viewport
 */
export const CONTENT_READER_MARGIN_RIGHT_PX = 50

/**
 * Content Reader Margin Top
 * Vertical spacing from menu bar (collapsed state)
 */
export const CONTENT_READER_MARGIN_TOP_PX = 105

/**
 * Menu Bar Top Padding
 * Vertical padding at top of menu bar
 */
export const MENU_BAR_TOP_PADDING_PX = 15

/**
 * Menu Bar Horizontal Padding
 * Left/right padding of menu bar
 */
export const MENU_BAR_HORIZONTAL_PADDING_PX = 60

/**
 * Menu Bar Height
 * Minimum height of menu bar (may grow based on content)
 */
export const MENU_BAR_HEIGHT_PX = 64

// ============================================================================
// Resume Tab - Additional Constants (Non-Critical)
// ============================================================================

/**
 * Resume Tab - Side Line X-Offset
 * Side lines must align with card positions
 * Left lines: left: calc(50% - 10px), Right lines: left: calc(50% + 10px)
 */
export const RESUME_SIDE_LINE_X_OFFSET_PX = 10

/**
 * Resume Tab - Side Line Fade Length
 * Visual fade effect at both ends of side lines
 * Can be adjusted for visual consistency
 */
export const RESUME_SIDE_LINE_FADE_LENGTH_PX = 15

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate full viewport height minus bottom nav
 * Use this for components that need to extend to bottom nav
 * 
 * @returns CSS calc string: "calc(100vh - 64px)"
 */
export function getFullHeightMinusBottomNav(): string {
  return `calc(100vh - ${BOTTOM_NAV_HEIGHT_PX}px)`
}

/**
 * Calculate full viewport height minus profile and bottom nav
 * Use this for menu bar that needs to extend from profile to bottom nav
 * 
 * @param profileHeight - Current profile height in pixels
 * @returns CSS calc string: "calc(100vh - {profileHeight}px - 64px)"
 */
export function getFullHeightMinusProfileAndBottomNav(profileHeight: number): string {
  return `calc(100vh - ${profileHeight}px - ${BOTTOM_NAV_HEIGHT_PX}px)`
}

/**
 * Get Resume side card positioning (left side)
 * @returns CSS calc string: "calc(50% - 70px)"
 */
export function getResumeLeftCardPosition(): string {
  return `calc(50% - ${RESUME_SIDE_CARD_OFFSET_PX}px)`
}

/**
 * Get Resume side card positioning (right side)
 * @returns CSS calc string: "calc(50% + 70px)"
 */
export function getResumeRightCardPosition(): string {
  return `calc(50% + ${RESUME_SIDE_CARD_OFFSET_PX}px)`
}

/**
 * Get Bottom Nav side tab position (left of center)
 * @returns CSS calc string: "calc(50% - 180px)"
 */
export function getBottomNavLeftTabPosition(): string {
  return `calc(50% - ${BOTTOM_NAV_SIDE_TAB_OFFSET_PX}px)`
}

/**
 * Get Bottom Nav side tab position (right of center)
 * @returns CSS calc string: "calc(50% + 180px)"
 */
export function getBottomNavRightTabPosition(): string {
  return `calc(50% + ${BOTTOM_NAV_SIDE_TAB_OFFSET_PX}px)`
}
