# VideoPlayer Component - Redesign Handoff Document

**Purpose**: This document provides comprehensive information about the VideoPlayer component for Phases 8-10 (Mobile Version, Redesign Handoff, and Complete Visual Redesign). It outlines what can be changed visually, what must remain functionally, and provides technical details for redesign implementation.

**Component Location**: `components/VideoPlayer.tsx`

**Last Updated**: Step 15.4 (Editor.js Update Phase)

---

## Component Overview

**Purpose**: Displays video content in read-only mode on public-facing pages. Supports three video types:
1. **Direct video files** (MP4, WebM, etc.) - Uses Video.js player
2. **YouTube videos** - Uses iframe embed
3. **Vimeo videos** - Uses iframe embed

**Used In**:
- `components/ContentViewer.tsx` (line 225)
- `components/ContentReader.tsx` (line 115)

**Props**:
- `videoUrl: string` (required) - URL of the video (Cloudinary, YouTube, Vimeo, or direct file)
- `title?: string` (optional) - Title for accessibility (used in iframe title attribute)

---

## Functional Requirements (CANNOT CHANGE)

### Core Functionality
1. **Video Type Detection**: Must detect YouTube/Vimeo vs direct video files
   - YouTube detection: `videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')`
   - Vimeo detection: `videoUrl.includes('vimeo.com')`
   - Location: Lines 78-80

2. **URL Conversion**: Must convert YouTube/Vimeo URLs to embed format
   - YouTube conversion: `convertYouTubeUrlToEmbed()` function (lines 10-50)
   - Vimeo conversion: `convertVimeoUrlToEmbed()` function (lines 52-66)
   - **Critical**: These functions must remain functional - they handle various URL formats

3. **SSR Safety**: Must handle Server-Side Rendering correctly
   - All Video.js initialization must be client-side only
   - `typeof window !== 'undefined'` checks required
   - Dynamic imports: `await import('video.js')`
   - Location: Lines 86-210

4. **DOM Timing**: Must wait for video element to be in DOM before initialization
   - Retry mechanism: waits up to 5 seconds for element to appear
   - DOM check: `videoRef.current && videoRef.current.parentNode !== null`
   - Location: Lines 96-118

5. **Player Lifecycle**: Must properly initialize and cleanup Video.js instances
   - Initialize in `useEffect` hook
   - Cleanup on unmount (dispose player instance)
   - Store player reference in `playerRef.current`
   - Location: Lines 86-210

6. **Error Handling**: Must handle errors gracefully
   - Network errors, invalid URLs, initialization failures
   - Display error messages to user
   - Location: Lines 187-193, 250-254

### Video.js Configuration (Functional)
- **Controls**: Must remain enabled (`controls: true`)
- **Responsive**: Must remain responsive (`responsive: true`)
- **Fluid**: Must remain fluid (`fluid: true`)
- **Preload**: Metadata preload (`preload: 'metadata'`)
- **Playback Rates**: Array `[0.5, 1, 1.25, 1.5, 2]` (can be modified but must remain array)
- **Control Bar Elements**: All elements must remain functional (play, volume, time, progress, fullscreen)
- Location: Lines 140-164

### Component Structure (Functional)
- **Refs**: Must maintain `videoRef`, `playerRef`, `containerRef`
- **State**: Must maintain `playerReady`, `error` states
- **Conditional Rendering**: YouTube/Vimeo vs direct video files must render differently
- Location: Lines 71-76, 212-264

---

## Visual Design (CAN CHANGE)

### Current Visual State (Step 15.4)

**Direct Video Files (Video.js)**:
- **Width**: 60% of content reader area (centered)
- **Container**: `flex justify-center pb-20` wrapper
- **Classes**: `my-8` (margin top/bottom), `w-[60%]` (width), `pb-20` (bottom padding)
- **Bottom Padding**: `pb-20` (80px) to prevent Bottom Nav from blocking controls
- **Video Element Classes**: `video-js vjs-big-play-centered vjs-default-skin`
- Location: Lines 232-265

**YouTube/Vimeo Embeds**:
- **Width**: 60% of container (centered)
- **Aspect Ratio**: `aspect-video` (16:9)
- **Classes**: `my-8 flex justify-center pb-20` (outer), `aspect-video w-[60%]` (inner), `w-full h-full rounded-lg` (iframe)
- **Bottom Padding**: `pb-20` (80px) to prevent Bottom Nav from blocking controls
- Location: Lines 216-229

**Error Display**:
- **Background**: `bg-red-900/20`
- **Border**: `border border-red-800`
- **Text Color**: `text-red-400`
- **Size**: `text-sm`
- **Padding**: `p-4`
- **Rounded**: `rounded-lg`
- Location: Lines 250-254

**Loading State**:
- **Text Color**: `text-gray-400`
- **Size**: `text-sm`
- **Alignment**: `text-center`
- Location: Lines 256-260

### What Can Be Changed Visually

1. **Player Width**: Currently 60% - can be adjusted (30%, 50%, 70%, 80%, etc.)
   - **Location**: Line 235 - `className="w-[60%]"`
   - **Note**: YouTube/Vimeo embeds are full width - can also be adjusted

2. **Spacing/Margins**: `my-8` can be changed
   - **Location**: Lines 218, 234
   - **Options**: `my-4`, `my-6`, `my-12`, `my-16`, etc.

3. **Video.js CSS Classes**: Can be customized via CSS
   - **Current Classes**: `video-js vjs-big-play-centered vjs-default-skin`
   - **Location**: Line 237
   - **Customization**: Override Video.js CSS variables in `app/globals.css`
   - **Video.js CSS Import**: Already imported at line 2 of `app/globals.css`

4. **Error Display Styling**: All colors, borders, padding can change
   - **Location**: Lines 250-254
   - **Can Change**: Background color, border color, text color, padding, border radius, font size

5. **Loading State Styling**: All colors, font size can change
   - **Location**: Lines 256-260
   - **Can Change**: Text color, font size, alignment

6. **YouTube/Vimeo Embed Styling**: Border radius, aspect ratio can change
   - **Location**: Lines 216-228
   - **Can Change**: `rounded-lg` (border radius), `aspect-video` (aspect ratio), container padding

7. **Video.js Player Appearance**: Can be customized via CSS variables
   - **Control Bar Colors**: Background, text, icons
   - **Progress Bar Colors**: Background, filled, buffer
   - **Play Button**: Size, color, position
   - **Volume Control**: Colors, slider appearance
   - **Fullscreen Button**: Colors, icons
   - **Method**: Override Video.js CSS variables in `app/globals.css`

### Video.js CSS Customization Guide

**Location for CSS Overrides**: `app/globals.css`

**Key Video.js CSS Variables** (can be overridden):
```css
/* Control Bar */
--vjs-primary-color: /* Main control bar color */
--vjs-secondary-color: /* Secondary control bar color */
--vjs-text-color: /* Text color in controls */

/* Progress Bar */
--vjs-progress-bar-color: /* Progress bar filled color */
--vjs-buffer-color: /* Buffer indicator color */
--vjs-load-progress-color: /* Loading progress color */

/* Play Button */
--vjs-big-play-button-color: /* Big play button color */
--vjs-big-play-button-size: /* Big play button size */

/* Volume */
--vjs-volume-control-color: /* Volume control color */

/* General */
--vjs-background-color: /* Player background */
--vjs-border-radius: /* Player border radius */
```

**Example Override** (add to `app/globals.css`):
```css
/* Video.js Customization */
.video-js {
  --vjs-primary-color: #your-color;
  --vjs-text-color: #your-text-color;
  border-radius: 8px; /* Can add custom border radius */
}
```

---

## Mobile Version Considerations (Phase 8)

### Current State
- **Width**: 60% (desktop) - may need adjustment for mobile
- **Responsive**: Video.js has `responsive: true` and `fluid: true` built-in
- **Aspect Ratio**: YouTube/Vimeo uses `aspect-video` (16:9) - responsive by default

### Mobile Adjustments Needed

1. **Width Adjustment**: 
   - **Desktop**: 60% width (centered)
   - **Mobile**: May need full width (`w-full`) or different percentage
   - **Implementation**: Use responsive Tailwind classes: `w-[60%] md:w-full` or conditional rendering

2. **Spacing Adjustment**:
   - **Desktop**: `my-8` (32px margin)
   - **Mobile**: May need smaller margins (`my-4` or `my-6`)
   - **Implementation**: Use responsive Tailwind classes: `my-4 md:my-8`

3. **Video.js Mobile Behavior**:
   - Video.js handles mobile automatically with `responsive: true` and `fluid: true`
   - Control bar adapts to touch interfaces
   - No additional mobile-specific code needed

4. **YouTube/Vimeo Mobile**:
   - Iframes are responsive by default
   - `aspect-video` maintains 16:9 ratio on all screen sizes
   - No mobile-specific changes needed

### Mobile Implementation Pattern

**Option 1: Responsive Tailwind Classes** (Recommended)
```tsx
<div className="my-4 md:my-8 flex justify-center">
  <div ref={containerRef} className="w-full md:w-[60%]">
    {/* Video element */}
  </div>
</div>
```

**Option 2: Conditional Rendering** (If more complex logic needed)
```tsx
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
<div className={isMobile ? "w-full" : "w-[60%]"}>
  {/* Video element */}
</div>
```

---

## Redesign Constraints (Phase 9-10)

### What CANNOT Change

1. **Component Logic**: All functional code must remain unchanged
   - URL detection logic
   - URL conversion functions
   - SSR safety checks
   - DOM timing checks
   - Player lifecycle management
   - Error handling

2. **Video.js Configuration**: Core configuration must remain
   - `controls: true` (controls must be enabled)
   - `responsive: true` (must remain responsive)
   - `fluid: true` (must remain fluid)
   - Control bar elements (play, volume, time, progress, fullscreen)

3. **Component Structure**: Refs, state, conditional rendering must remain
   - `videoRef`, `playerRef`, `containerRef` refs
   - `playerReady`, `error` state variables
   - YouTube/Vimeo vs direct video conditional rendering

4. **Props Interface**: Props must remain unchanged
   - `videoUrl: string` (required)
   - `title?: string` (optional)

### What CAN Change

1. **Visual Styling**: All CSS classes, colors, spacing
   - Width percentage (currently 60%)
   - Margins/padding
   - Border radius
   - Colors (background, text, borders)

2. **Video.js Appearance**: All Video.js CSS customization
   - Control bar colors
   - Progress bar colors
   - Play button appearance
   - Volume control appearance
   - Fullscreen button appearance
   - Border radius, shadows, gradients

3. **Error/Loading States**: All styling for error and loading messages
   - Colors, fonts, sizes, spacing

4. **Layout**: Container layout, centering, spacing
   - Flexbox properties
   - Width constraints
   - Margin/padding values

---

## Technical Implementation Notes

### File Structure
- **Component**: `components/VideoPlayer.tsx` (269 lines)
- **CSS Import**: `app/globals.css` line 2: `@import "video.js/dist/video-js.css";`
- **Usage**: Imported in `ContentViewer.tsx` and `ContentReader.tsx`

### Dependencies
- **Video.js**: `video.js` package (installed in Step 15.1)
- **TypeScript Types**: `@types/video.js` (installed in Step 15.1)
- **React Hooks**: `useEffect`, `useRef`, `useState`

### Key Functions
1. **`convertYouTubeUrlToEmbed(url: string): string`** (lines 10-50)
   - Converts YouTube URLs to embed format
   - Handles: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/v/`
   - Returns: `https://www.youtube.com/embed/VIDEO_ID`

2. **`convertVimeoUrlToEmbed(url: string): string`** (lines 52-66)
   - Converts Vimeo URLs to embed format
   - Handles: `vimeo.com/VIDEO_ID`
   - Returns: `https://player.vimeo.com/video/VIDEO_ID`

### Critical Code Sections

**DOM Timing Check** (lines 96-118):
- Waits for video element to be in DOM
- Retry mechanism (up to 5 seconds)
- Must remain functional for proper initialization

**Video.js Initialization** (lines 120-186):
- Async import of Video.js
- Player cleanup
- DOM verification before initialization
- Player configuration
- Event listeners (ready, error)

**Conditional Rendering** (lines 212-264):
- YouTube/Vimeo: iframe embed
- Direct files: Video.js player
- Error and loading states

---

## Testing Considerations

### Visual Testing
- Test player width at different screen sizes
- Test Video.js control bar appearance
- Test error state styling
- Test loading state styling
- Test YouTube/Vimeo embed appearance

### Functional Testing (Must Remain Working)
- Video playback (play, pause, seek)
- Volume control
- Fullscreen mode
- YouTube/Vimeo embed functionality
- Error handling (invalid URLs)
- Mobile responsiveness

---

## Phase 8-10 Checklist

### Phase 8 (Mobile Version)
- [ ] Adjust player width for mobile (full width or different percentage)
- [ ] Adjust spacing for mobile (smaller margins)
- [ ] Test Video.js mobile behavior (touch controls)
- [ ] Test YouTube/Vimeo mobile embeds
- [ ] Verify responsive behavior on small screens

### Phase 9 (Redesign Handoff)
- [ ] Document current visual state (colors, spacing, sizes)
- [ ] Identify all customizable CSS variables
- [ ] Create Video.js CSS customization guide
- [ ] Document redesign constraints (what can/cannot change)

### Phase 10 (Complete Visual Redesign)
- [ ] Update Video.js CSS variables to match new design system
- [ ] Update error/loading state styling
- [ ] Adjust player width/spacing to match new layout
- [ ] Customize Video.js control bar appearance
- [ ] Update YouTube/Vimeo embed styling
- [ ] Test all visual changes across desktop and mobile

---

## Related Documentation

- **Editor.js Update Phase**: `docs/website-development/dev-phases-docs/editorjs-update.md`
- **Development Log**: `docs/website-development/logs/development-logs/editorjs-update-dev-log.md`
- **Portfolio Handoff**: `docs/handoff-docs/portfolio-handoff.md` (for reference on handoff format)
- **Website Roadmap**: `docs/website-development/website-roadmap.md` (Phases 8-10 details)

---

**Note**: This document should be updated after Phase 10 redesign to reflect final visual state and any design system changes.

