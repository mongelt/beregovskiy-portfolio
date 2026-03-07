'use client'

import { useState, useEffect } from 'react'
import { useMobileInitial } from '@/lib/responsive'

const BANNER_STORAGE_KEY = 'mobileBannerDismissed'

export default function MobileBanner() {
  const isMobileInitial = useMobileInitial()
  const [showBanner, setShowBanner] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Step 6 Stage 1: Banner detection logic
  // Only shows if initial page load is mobile size
  // Not if resized from desktop to mobile
  // Stays dismissed if dismissed then resized to desktop then back to mobile
  useEffect(() => {
    // Only check on client side
    if (typeof window === 'undefined') return

    // Check if banner was already dismissed in this session
    const dismissed = sessionStorage.getItem(BANNER_STORAGE_KEY) === 'true'
    
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Only show if page was initially loaded in mobile viewport
    if (isMobileInitial) {
      setShowBanner(true)
    }
  }, [isMobileInitial])

  // Step 6 Stage 2: Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!showBanner || isDismissed) return

    const timer = setTimeout(() => {
      setShowBanner(false)
      setIsDismissed(true)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(BANNER_STORAGE_KEY, 'true')
      }
    }, 10000) // 10 seconds

    return () => clearTimeout(timer)
  }, [showBanner, isDismissed])

  // Step 6 Stage 3: Handle dismissal and save to sessionStorage
  const handleDismiss = () => {
    setShowBanner(false)
    setIsDismissed(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(BANNER_STORAGE_KEY, 'true')
    }
  }

  if (!showBanner || isDismissed) {
    return null
  }

  // Step 6 Stage 2: Banner overlays entire bottom nav menu area
  // Same height (h-16 = 64px), same width (full width), floating element
  return (
    <div
      onClick={handleDismiss}
      className="fixed bottom-0 left-0 right-0 h-16 bg-yellow-600/95 text-black z-[60] flex items-center justify-center cursor-pointer"
      style={{
        backdropFilter: 'blur(8px)'
      }}
    >
      <div className="text-sm font-semibold text-center px-4">
        This website works best on a computer
      </div>
    </div>
  )
}
