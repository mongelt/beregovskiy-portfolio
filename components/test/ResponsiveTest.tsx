'use client'

import { useMobileInitial, useMobileState, isMobileBreakpoint } from '@/lib/responsive'

/**
 * Test component for responsive utilities.
 * 
 * This component displays the current state of mobile detection utilities
 * to verify they work correctly. Can be temporarily added to any page for testing.
 * 
 * Testing checklist:
 * 1. Verify breakpoint detection works correctly (width and orientation checks)
 * 2. Verify initial load detection doesn't change on resize
 * 3. Verify useMobileState updates when window is resized
 */
export default function ResponsiveTest() {
  const isMobileInitial = useMobileInitial()
  const { isMobile: isMobileState } = useMobileState()
  
  // Get current dimensions for display
  const currentWidth = typeof window !== 'undefined' ? window.innerWidth : 0
  const currentHeight = typeof window !== 'undefined' ? window.innerHeight : 0
  const currentBreakpoint = isMobileBreakpoint(currentWidth, currentHeight)

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px',
      lineHeight: '1.6'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
        Responsive Utilities Test
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Current Dimensions:</strong><br />
        Width: {currentWidth}px<br />
        Height: {currentHeight}px
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>isMobileBreakpoint():</strong><br />
        {currentBreakpoint ? '✅ Mobile' : '❌ Desktop'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>useMobileInitial():</strong><br />
        {isMobileInitial ? '✅ Mobile (initial)' : '❌ Desktop (initial)'}
        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
          Should NOT change on resize
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>useMobileState():</strong><br />
        {isMobileState ? '✅ Mobile (current)' : '❌ Desktop (current)'}
        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
          Should update on resize
        </div>
      </div>
      
      <div style={{ fontSize: '10px', color: '#aaa', marginTop: '10px', borderTop: '1px solid #555', paddingTop: '5px' }}>
        <strong>Test Instructions:</strong><br />
        1. Resize window below 768px width in portrait<br />
        2. Verify useMobileState updates<br />
        3. Verify useMobileInitial stays the same<br />
        4. Rotate to landscape - should show Desktop
      </div>
    </div>
  )
}
