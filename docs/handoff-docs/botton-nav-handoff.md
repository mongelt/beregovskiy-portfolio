# Bottom Nav Handoff (Phases 7–10)

## Purpose
Reference for review/redesign phases (7–10) describing current bottom-nav layout, behaviors, and what can change visually without altering logic.

## Current Layout (desktop)
- Left: Downloads button (“Download ↑”), fixed 25px from left edge.
- Center cluster (left→right): Active Collections (temporary tabs) immediately left of Portfolio, then `PORTFOLIO`, then `RESUME`, then Active Content tabs immediately right of Resume.
- Right: (none beyond Active Content).
- Portfolio/Resume stay centered regardless of tabs on either side.

## Behaviors and Logic (keep intact)
- Tab order: (Active Collections) – (PORTFOLIO) – (RESUME) – (Active Contents).
- Active Collections: open to left of Portfolio; close → Portfolio if active; persist via localStorage.
- Active Content: open to right of Resume; close → Resume if active; persist via localStorage; no duplicates.
- Downloads menu: toggles on click; closes on tab change or outside click; rows shown contextually:
  - Always: Download Resume.
  - When content selected (Portfolio/Active Collection/Active Content) and type is not audio/video: Download <content> + “…and include resume”.
  - When Active Collection tab active: Download <collection> + “…and include resume”.
- Audio/video content types: content download row hidden/disabled.
- Content downloads use `generateArticlePDF(contentId)`; resume/collection PDFs currently placeholders.

## Visual Elements to Customize (Phases 7–10)
- Colors: button text, hover/active states, backgrounds, borders for main tabs, collection tabs, content tabs, and Downloads button/menu.
- Typography: font sizes/weights for tabs and menu rows.
- Spacing: padding/margins for tabs; gap between collection tabs and Portfolio (none); gap between Resume and Active Content (none); menu padding and row heights.
- Shapes: rounded corners on tabs and menu; underline/active highlights (currently emerald underline on main tabs, purple fill for active collection, emerald fill for active content).
- Icons: “Download ↑” icon can be replaced; close “✕” icons can be swapped; spinner styling for loading tabs.
- Backgrounds: nav bar background, menu background, hover/active backgrounds.
- Shadows/borders: nav top border, menu border/shadow.
- Transitions: tab hover/active transitions, menu open/close easing, spinner animation.

## What Not to Change (logic/structure)
- Tab order and centering rules.
- Left/right anchoring of Downloads (left) and Active Content (right of Resume).
- Context rules for showing Download rows (respect audio/video exclusion).
- Close behaviors (collections → Portfolio, content → Resume).
- Persistence via localStorage for Active Collection/Content tabs.

## Quick Reference: Key Labels
- Downloads button: “Download ↑”.
- Main tabs: “PORTFOLIO”, “RESUME”.
- Collections: admin case (no “COLLECTION” prefix, no forced all-caps).
- Active Content: admin case title.
- Menu rows: “Download Resume”; “Download <content>”; “Download <collection>”; “…and include resume”.

## Known Gaps (for later phases)
- PDF generator quality/performance; resume and collection PDFs are placeholders.
- Mobile layout handled in later phases; current doc is desktop.

---

## Phase 7: Code Review and Mobile Preparation

### Code Structure for Mobile Refactoring
- **Component modularity**: Bottom Nav components need review for mobile-hidden vs mobile-visible element separation
- **Layout hardcoding**: Fixed positions (Downloads 25px from left) need mobile flexibility
- **State management**: Current state structure needs extension for mobile states (banner dismissed, menu modes)
- **Desktop vs mobile logic separation**: Identify logic tightly coupled with desktop visuals needing separation
- **Performance optimization**: Review tab switching, menu open/close, localStorage operations for optimization opportunities

### Mobile Preparation Documentation Needs
- Technical implementation guide: How to make Bottom Nav mobile-friendly
- High-level strategy: Which Bottom Nav components need changes and why
- Helper utilities: Breakpoint detection (below 768px width AND portrait orientation), mobile detection (initial page load, not resize-based)
- Mobile compatibility analysis: Document known issues and refactoring approach

---

## Phase 8: Mobile Version Implementation

### Mobile Bottom Tab Nav Layout
- **Portfolio and Resume tabs**: Remain (same functionality as desktop)
- **Downloads menu**: Icon-only button (left side, same expandable functionality, appearance change only)
- **Share button**: Smaller button with icon, 10px text below icon (icon selected during phase)
- **NO temporary tabs**: Active Collection and Active Content tabs cannot open in mobile (fully disabled)
- **Breakpoint**: Below 768px width AND portrait orientation (both conditions required)

### Mobile First-Load Banner
- **Shows on**: Every fresh page load in mobile (NOT when resized from desktop to mobile)
- **Detection**: Only shows if initial page load is mobile size, not if resized from desktop to mobile
- **Session**: New session starts when user loads website in new browser tab/window, ends when user closes all website instances
- **Banner text**: "This website works best on a computer"
- **Positioning**: Overlays on top of entire bottom nav menu area (same height, same width, floating element)
- **Duration**: 10 seconds, then disappears automatically
- **Dismissal**: Click/tap anywhere on banner to dismiss immediately
- **After dismissal**: Banner disappears and bottom nav menu displays normally
- **Styling**: Design decisions in Phase 10

### Mobile Behavior Changes
- **Downloads menu**: Same expandable functionality, icon-only appearance
- **Share button**: Same functionality, smaller size with icon and text below
- **Tab switching**: Same Portfolio/Resume switching, no Active Collection/Content tabs
- **Transition behavior**: Automatically switch layouts when crossing breakpoint, preserve current tab when switching, reset open menus/expanded states

---

## Phase 9: Handoff for Redesign

### Current Design Inventory
- **Colors**: Button text, hover/active states, backgrounds, borders for main tabs, collection tabs, content tabs, Downloads button/menu
- **Typography**: Font sizes/weights for tabs and menu rows
- **Spacing**: Padding/margins for tabs, gap between collection tabs and Portfolio (none), gap between Resume and Active Content (none), menu padding and row heights
- **Shapes**: Rounded corners on tabs and menu, underline/active highlights (emerald underline on main tabs, purple fill for active collection, emerald fill for active content)
- **Icons**: "Download ↑" icon, close "✕" icons, spinner styling for loading tabs
- **Backgrounds**: Nav bar background, menu background, hover/active backgrounds
- **Shadows/borders**: Nav top border, menu border/shadow
- **Transitions**: Tab hover/active transitions, menu open/close easing, spinner animation

### Design Constraints (What Cannot Change)
- **Tab order**: (Active Collections) – (PORTFOLIO) – (RESUME) – (Active Contents)
- **Centering rules**: Portfolio/Resume stay centered regardless of tabs on either side
- **Left/right anchoring**: Downloads (left, 25px from left edge), Active Content (right of Resume)
- **Context rules**: Download rows shown contextually (respect audio/video exclusion)
- **Close behaviors**: Collections → Portfolio if active, Content → Resume if active
- **Persistence**: localStorage for Active Collection/Content tabs
- **Functionality**: All interactions work exactly the same

### Design Opportunities (What Can Change)
- **Colors**: All colors can change (button text, hover/active states, backgrounds, borders)
- **Typography**: Font sizes/weights for tabs and menu rows can change
- **Spacing**: Padding/margins for tabs, menu padding and row heights can change (minor adjustments - few pixels)
- **Shapes**: Rounded corners, underline/active highlights can change
- **Icons**: "Download ↑" icon can be replaced, close "✕" icons can be swapped, spinner styling can change
- **Backgrounds**: Nav bar background, menu background, hover/active backgrounds can change
- **Shadows/borders**: Nav top border, menu border/shadow can change
- **Transitions**: Tab hover/active transitions, menu open/close easing, spinner animation can change
- **Animations**: Can add/modify animations (currently minimal, Phase 10 will add comprehensive animations)

### Component-by-Component Redesign Guide
- **Downloads button/menu**: Colors, typography, icon, spacing, backgrounds, borders, transitions
- **Main tabs (PORTFOLIO/RESUME)**: Colors, typography, spacing, active highlights, hover states
- **Active Collection tabs**: Colors, typography, spacing, active state (purple fill), close button styling
- **Active Content tabs**: Colors, typography, spacing, active state (emerald fill), close button styling
- **Share button**: Colors, typography, icon, spacing, hover states (Phase 5 addition)

---

## Phase 10: Complete Visual Redesign

### Design Workflow
- **Order**: Profile → Bottom Nav including Downloads → Portfolio tab → Active Content/Collection (same design as Portfolio) → Resume tab
- **Bottom Nav redesign**: Downloads menu → Share button → Main tabs → Active Collection tabs → Active Content tabs

### Animation Implementation
- **Animation types needed**: Page/tab transitions, element hover effects, tab switching animations, menu collapse/expand, Downloads menu open/close, Share button interactions
- **Current animation library**: Framer Motion (used in BottomTabBar), can extend to all Bottom Nav elements
- **Animation patterns**: Scale, opacity, spring transitions, layout animations

### Design System Integration
- **Color palette**: Complete rewrite with all shades and usage guidelines for Bottom Nav elements
- **Typography scale**: All sizes and weights for tabs, menu rows, buttons
- **Spacing system**: Margins, padding, gaps for Bottom Nav
- **Animation library**: Comprehensive animation patterns for all interactive elements
- **Component patterns**: Downloads menu, Share button, tabs styling patterns

### Mobile Redesign Requirements
- **Same components as desktop** but potentially different visual design
- **Mobile-specific styling**: Icon-only Downloads button, smaller Share button with icon and text below, touch-friendly sizing
- **Banner styling**: Design decisions made during Phase 10

### Final Layout Tweaks
- **Minor positioning adjustments**: Few pixels movement acceptable (e.g., Downloads button 25px from left can become 20px or 30px)
- **Constraints**: Elements stay in same general areas (Downloads left, Portfolio/Resume center, Active Content right)

---

## Phase 11: Code Audit, Optimization, and SEO

### Pre-Loading Implementation
- **Current loading**: Bottom Nav loads with initial page load
- **Phase 11 requirement**: Pre-load all tabs data (Portfolio, Resume, Downloads) for instant loading
- **Bottom Nav impact**: Tab switching should be instant with pre-loaded data
- **Optimization**: Review tab switching performance, menu open/close performance, localStorage operations

### SEO Considerations
- **Sitemap**: Bottom Nav tabs themselves don't need sitemap entries (they're navigation), but content/collections accessed via tabs do
- **No-index**: Bottom Nav navigation elements don't need no-index (they're UI), but content accessed via tabs may need no-index flags

### Error Handling
- **Tab switching errors**: Handle failures gracefully, show error message if tab data fails to load
- **Menu open/close errors**: Handle localStorage failures gracefully, fallback to default state
- **Download errors**: Show error message if PDF generation fails

### Performance Optimization Areas
- **Tab switching**: Optimize state updates, reduce re-renders
- **Menu operations**: Optimize Downloads menu open/close, localStorage reads/writes
- **Tab persistence**: Optimize localStorage operations for Active Collection/Content tabs
- **Animation performance**: Ensure animations don't cause lag or jank
