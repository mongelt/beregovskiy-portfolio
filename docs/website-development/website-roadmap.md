# Website Roadmap Master Document - NO CHANGES CAN BE MADE TO THIS DOCUMENT, NEVER EDIT IT

**Purpose**: This document describes the next phases and steps in the development process of this website; it serves as the active document to mark progress and log updates
**High-level master document**: This document is the high-level review of the roadmap and serves as the master document that overrides other documents
**Limitations**: This document doesn't include detailed plans, detailed development logs, or technical reference materials

## Definitions
IMPORTANT: Definitions describe the state of the website after this roadmap is completed; the current condition may be different, but this roadmap document and all other documents use these definitions
**Front page**: The loading state of the website, includes permanent Profile, Bottom Nav, Portfolio and Resume tabs
**Profile**: The top tab with personal information and the executive summary, expandable to reveal the full description, education information, featured skills, languages
**Bottom Nav Tab**: The navigation on the bottom of the page, includes the permanent Downloads menu, permanent Share button, temporary Active Content and Active Collection tabs
**Portfolio tab**: The loading state of the front page, includes the content menu bar, featured collection menu, content reader, info menu
**Resume tab**: The second main tab of the front page, includes resume entry cards and a dynamic timeline
**Downloads menu**: A menu in the Bottom nav that expands to show available downloads
**Share button**: Button in bottom-right corner that copies link to current content (Portfolio/Active Content tabs), current collection (Active Collection tab), or root link (all other instances)
**Active collection tab**: A tab in Bottom nav that opens when a collection is chosen, and can be closed
**Active content tab**: A tab in Bottom nav that opens when a specific content item is clicked from the Resume tab, and can be closed
**URLs**: Every content item and collection has a unique URL; URLs are not displayed but can be shared; functionality partially exists for content items, may exist for collections
**URL update**: URLs don't update in browser address bar when switching tabs, they appear only when sharing or opening the shared link

**Testing**: Testing happens at the end of every step inside each phase; detailed testing procedures will be specified in phase planning documents

**Browser compatibility**: Support all common browsers - Chrome, Safari, Edge, Firefox, Opera (desktop and mobile versions)

## Documentation Structure

**Master Documents**:
- `docs\website-roadmap.md` (this document) - High-level overview
- `docs\website-development\development-logs` - Directory for development logs during the production

**Live Production Archive**: `docs\live-production-archive` directory
- contains development and documentation files for: 
-- Resume tab: `docs\live-production-archive\resume-tab-dev-docs` directory containing `docs\live-production-archive\resume-tab-dev-docs\resume-timeline-logic.md` storing the original logic and `docs\live-production-archive\resume-tab-dev-docs\resume-timeline-planning.md` storing detailed development process documentation and development log
-- Portfolio tab: `docs\live-production-archive\portfolio-tab-dev-docs` directory containing `docs\live-production-archive\portfolio-tab-dev-docs\portfolio-logic.md` storing the original logic, `docs\live-production-archive\portfolio-tab-dev-docs\portfolio-planning.md` storing development process documentation and development logs, and `docs\live-production-archive\portfolio-tab-dev-docs\portfolio-layout-reset.md` storing information about the layout of the tab

**Handoff files**: stored in `docs\handoff-docs` directory, contains information useful for future development in this roadmap
- `docs\handoff-docs\portfolio-handoff.md` for Portfolio tab

## Phase-by-phase Roadmap

### Phase 1: Adding Editor.js functionality/plugins (85% complete)
**Required plugins**: accordion/toggle blocks, link preview (fix existing link plugin), image/video/audio (spectrum/waveform preferred, simpler solution acceptable), gallery (not carousel), button, layout blocks (multi-column layouts, spacing blocks, features not achievable with custom HTML), columns, text formatting (bold/italic/underline/strikethrough - use easiest/safest option), drag&drop, undo. **Skipped**: paragraph/header alignment (not available in npm).

**Integration scope**: All plugins must work in both `EditorJS.tsx` (admin editor) and `EditorRenderer.tsx` (public display), and in all Editor.js instances: Profile tab (short bio, full bio, executive summary), content reader (Portfolio/Active Content/Active Collection tabs), collection descriptions, resume entry descriptions.

**Process**: (1) Check all current plugins: test each in admin panel and verify code integration in both components, (2) Fix broken plugins one-by-one (link plugin known issue), (3) Install new plugins one-by-one: test each immediately after installation in one field first, then add to all instances, then test all plugins together. Research alternatives for missing plugins before proceeding.

**Testing**: Create test content for all Editor.js instances and verify rendering on public pages. Test each new/fixed plugin individually first, then test all plugins together across all instances.

**Documentation**: Use `docs/website-development/dev-phases-docs/editorjs-update.md` as running document for real-time updates. Use `docs/website-development/logs/development-logs/editorjs-update-dev-log.md` for development log entries. At phase end, update `docs/editorjs-plugins-installed.md` with final list of checked plugins (versions, status: working/requires fixing/fixed), installed plugins, rejected plugins with rejection reasons.

**Phase 1 Success criteria**: All desired plugins that are available to be safely installed have been installed and work in all Editor.js instances on the website without errors; Editor.js functionality is fully implemented and no future changes are required.

**State after Phase 1**: Editor.js functionality is frozen, no future edits to Editor.js are allowed.

### Phase 2: Active Content tab functionality and bottom nav revamp (100% complete)
**Active Collections revamp**: Remove all caps for collections display in bottom tab nav, remove the words COLLECTION from bottom nav display of opened collections; move collections to the left side of the Portfolio button in bottom nav (collections now open to the left of Portfolio button instead of to the right of Downloads tab)
- Multiple Active Collection tabs can be open simultaneously; no limits preferred, but limits may be implemented later based on optimization
- Active Collection tabs should persist on page refresh if possible (prefer not to use URL parameters); loading indicators acceptable when switching to Active Collection tab
- Closing Active Collection tab: if active, switch to Portfolio; if inactive, just remove from list

**Remove the Downloads tab button**: Remove current Downloads button in the bottom tab nav, keep `components\tabs\DownloadsTab.tsx` intact; center Portfolio and Resume buttons (buttons stay centered in bottom nav and never move, regardless of how many tabs are open on either side)

**Active Content tab**: Create the Active Content temporary tab
- Active Content tab works similar to Active Collection tab, and displays the selected content item in a separate tab that can be closed
- Content displayed in the Active Content tab can only be selected from the Resume tab in linked assets in entry cards
- Active Content tab opens to the right of the Resume tab, and displays the title of selected content in the same case as written in admin
- Multiple Active Content tabs can be open simultaneously; no limits preferred, but limits may be implemented later based on optimization
- Duplicate prevention: if content item is already open in a tab, don't create duplicate tab, just switch to existing tab (same logic as collections)
- Active Content tabs should persist on page refresh if possible (prefer not to use URL parameters); loading indicators acceptable when switching to Active Content tab
- Closing Active Content tab: if active, switch to Resume; if inactive, just remove from list
- Active Content tab, just like Active Collection, reuses Portfolio tab layout with menu bar and content reader; in Active Content, the main menu displays Category-Subcategory-selected Content Item; Collections menu display collections linked to the active content item; Content Reader displays active content item
- Content items identified by database id (uuid)

**Bottom nav layout order**: (All Active Collections) - (PORTFOLIO) - (RESUME) - (All Active Contents). PORTFOLIO and RESUME buttons remain centered and never move from center position.

**State management**: Extend current state structure (add new state variables for Active Content tabs, keep existing structure). Can refactor to unified tab system later if needed.

**Tab persistence**: Use localStorage to save tab state on page refresh (save when tabs change, restore on page load). Tab preferences stored locally, no URL parameters.

**Downloads menu**: Replace Downloads tab with menu button (left side, up arrow icon "Download ↑")
- Menu has collapsed and expanded states
- Collapsed state: "Download ↑" 
- Expanded state: "Download Resume" (always, full width); "Download <current item>" (Portfolio/Active Content tabs, left half); "Download <collection name>" (Active Collection tab, left half); "...and include resume" button (right half of item/collection line)
- Collapsed state turns into expanded state by clicking on the Download button
- Menu collapses by clicking on the Download button again or by switching from one tab to another
- Location: left side of the bottom tab nav, 25px right of the left edge of the bottom nav
- Downloads menu detects: current content item in Active Content/Portfolio tabs (allows downloading selected content item), current collection in Active Collection tab (allows downloading entire collection), resume always available for downloading
- Downloads menu requires passing additional props through components to access current tab, content item, and collection context
- Complete at the start of the phase: Explore existing PDF rendering functionality, then implement all required PDF download functionality; Admin changes will be detailed in phase planning

**Documentation**: Use `docs/website-development/dev-phases-docs/front-page-update.md` as running document for real-time updates. Use `docs/website-development/logs/development-logs/front-page-upd-dev-log.md` for development log entries.

**Phase 2 Success criteria**: Active Content tab is created but can't be tested yet until Phase 3 changes are implemented; Downloads button is revamped: the old Downloads button is removed, the new button is created, the Downloads menu opens and closes as intended, download buttons in the menu download associated PDFs; Text in Active Collections tab is changed to match the case set in admin, Active Collections tab moved to the new correct place in the bottom tab nav

**State after Phase 2**: Bottom Tab Nav functionality fully works and tested in this phase and Phase 3 when available, Bottom Tab Nav functionality is frozen (re-confirms after testing in Phase 3).

### Phase 3: Finishing Resume tab (100% complete)
**Collections and assets**: Make linked assets/collections in entry cards clickable to open Active Content/Collection tabs
- Samples button: clicking opens Active Collection tab for collection linked to entry (collection_id)
- Collection assets: clicking opens Active Collection tab
- Content assets: clicking opens Active Content tab
- Link assets: clicking opens new browser tab with link_url (external link, not on website)
- Both asset types are clickable
- **Data loading**: Verify current query loads full content item data (not just content_id) for Active Content tabs; verify collections relation includes slug and name for Active Collection tabs
- **State management**: Pass handlers from app/page.tsx to ResumeTab as props to open Active Content/Collection tabs (Option 1: simplest approach, extend current structure, can refactor later if needed)

**Side lines and entry card positioning**: Fix incorrect placement of entry cards and side lines
- Identify specific positioning bugs during phase (entry cards and side lines)
- Fix identified bugs, ensure dynamic timeline responds correctly to new placements
- **Profile height integration**: Pass profileHeight from app/page.tsx to ResumeTab as prop, use it for top padding/margin in ResumeTab (prepares for Phase 4 Profile height changes)

**Fixing bugs**: Bug list and fixes documented in `docs\website-development\dev-phases-docs\resume-bug-fix.md` will be defined by user and code review done by AI

**Preparing for design**: Prepare a handoff document for visual redesign phases (Phases 8 and 10)
- Document current Resume tab structure for designers
- List what can be changed visually vs. what must stay
- Include design constraints and guidelines
- This handoff document will inform Phase 8 and will be updated and finalized during Phase 9, including the changes made in Phases 4 to 8

**Testing**: Test that clicking assets opens Active Content tabs correctly and verify tab displays content correctly

**Documentation**: Bug list and fixes documented in `docs\website-development\dev-phases-docs\resume-bug-fix.md` as running document for real-time updates. Use `docs\website-development\logs\development-logs\resume-bug-fix-dev-log.md` for development log entries. Active Content tab part of this phase documented in `docs\website-development\dev-phases-docs\front-page-update.md` as running document and `docs\website-development\logs\development-logs\front-page-upd-dev-log.md` for development log entries. 

**Phase 3 Success criteria**: Collections and assets are linked to Active Collection and Active Content tabs, external links assets open in new browser tab; entry cards and their side lines are positioned correctly, the dynamic timeline responds correctly in new placements; all bugs in the Resume tab are identified and fixed; Active Content tab tested and working correctly.

**State after Phase 3**: Active Content tab is tested and confirmed as working correctly, Bottom Tab Nav is frozen with no changes allowed; Resume tab is frozen with no changes allowed except readjustment in Phase 4. Visual design and small layout changes are allowed in Phases 8 and 10. Code optimization is allowed in Phases 7 and 11.

### Phase 4: Profile tab Rehaul (100% complete)
**Profile collapsed state**: Reduce collapsed height, adjust all page elements to new height
- Explore current height and determine new height during phase
- Height should be flexible and it should be set up manually by the user in pixels in admin panel 
- At phase start: test that elements respond to profileHeight changes, check ResizeObserver is working correctly, verify all elements using profileHeight update properly
- Portfolio should already auto-adjust (verify correct placement), Active Content and Active Collection inherit profileHeight usage
- Resume tab needs adjustment to follow Profile tab height (flexible based on manual input in admin)

**Profile expanded state**: Rearrange expanded state elements
- Two-column layout stays, left column takes 2/3 width (right column 1/3)
- Right column order: Education (top), then Skills, then Languages
- **Skills collections**: Each skill automatically creates a collection; skills listed in expanded Profile tab open corresponding Active Collection on click
- Add skills-to-collections functionality to admin panel and potentially backend

**Expand button**: Update expand button appearance in expanded state 
- Text changes: "COLLAPSE" instead of "EXPAND" when expanded
- Positioning: moves from current position to bottom of expanded state

**Documentation**: Use `docs/website-development/dev-phases-docs/front-page-update.md` as running document for real-time updates. Use `docs/website-development/logs/development-logs/front-page-upd-dev-log.md` for development log entries.

**Phase 4 Success criteria**: Admin panel has a field to change the height of the Profile tab and the height of the Profile tab responds to changing this field; Profile tab layout is successfully changed in collapsed and expanded states; all other elements from Portfolio and Resume tab adjusted for new layout; Expand button in Profile changes in expanded state and back to default in collapsed state

**State after Phase 4**: Profile tab is fully frozen; Resume tab is fully frozen. Visual design and small layout changes are allowed in Phases 8 and 10. Code optimization is allowed in Phases 7 and 11.
 
### Phase 5: Changes to info menu and last changes to the website (100% complete)
**Adding page titles**: When title/subtitle scroll out of view in content reader (Portfolio/Active Content/Active Collection tabs), show them in info menu
- Scroll detection: Use IntersectionObserver (standard approach - observe title/subtitle elements, show in InfoMenu when out of view, hide when back in view)
- Title/subtitle appear at top of InfoMenu, above publication line, don't replace existing InfoMenu content
- InfoMenu positioning: when title/subtitle added, keep same vertical centering calculation but shift down by title/subtitle height
- InfoMenu line order: Line 1 (Title), Line 2 (Subtitle if present), Line 3 (Publication/Date if present), Line 4 (Byline if present), Line 5 (Original URL if present)
- Title styling: pure white, bold, +2px font size compared to Publication field
- Subtitle styling: gray, +1px font size compared to Publication field
- Title and subtitle on different lines
- Content switching: new content always appears at start with title/subtitle visible in content reader, not visible in InfoMenu
- Empty subtitle: if content has no subtitle, show only title when it scrolls out
- Test with different content lengths to verify InfoMenu updates correctly during scroll

**Shorten links**: Display links as favicon + main domain only
- Favicon: Fetch from domain directly, use favicon service as fallback if fetching fails, default link icon if all methods fail (fallback plan defined during phase)
- Domain format: Show main domain only (e.g., "domain.com" from "https://subdomain.domain.com/"), no protocol, no subdomain
- Links are clickable, show full URL on hover

**Change field requirements**: Tweak the requirements for field entries, remove requirement for selecting Byline style and Link Style fields in admin
- Byline and Link Style fields become optional (not required) in admin
- Update backend/database validation to allow null/empty values (database schema changes defined during phase)
- If Byline or Link style not selected, hide both style label and value in InfoMenu

**Share button**: Add the Share button to the bottom nav menu, see line 15 of this document for description. Share button acts similar to Download menu, and it shows three options: Share Portfolio (copies website URL), Share <content item> (displays the sidebar title of the content item that is opened either in Active Content or selected in the Portfolio tab), Share <collection> (displays the name of a collection that is opened as Active Collection); if no content item is selected or active, hide the Share option for content; if there no active collection opened, hide the Share option for collection.
**Unique links for content, collections, and resume tab**: Each content, collection, and resume tab need to gain a unique URL that would bring users to these particular pages; when opening a URL for a collection, it opens as Active Collection; when opening a URL with a content item, it opens as Active Content; opening a URL for resume opens the resume tab.

**Documentation**: Use `docs/website-development/dev-phases-docs/front-page-update.md` as running document for real-time updates. Use `docs/website-development/logs/development-logs/front-page-upd-dev-log.md` for development log entries.

**Phase 5 Success Criteria**: Info menu displays title/subtitle of selected content when title/subtitle are not shown on the page; links are shown as favicon + main domain; requirements for completing info menu fields in admin is tweaked. 

**State after Phase 5**: Info menu is frozen; Portfolio tab frozen. Visual design and small layout changes are allowed in Phases 8 and 10. Code optimization is allowed in Phases 7 and 11.

### Phase 6: Admin authentication and RLS (CURRENT PHASE)
**Authentication method**: Supabase authentication or Google SSO (2 Google accounts whitelisted)
**Users**: Single admin user (or 2 Google accounts if using SSO)
**Session**: Keep user logged in across browser sessions (persistent authentication)
**RLS**: Set up proper RLS policies for SQL

**Implementation**:
- Setup Supabase Auth in Supabase dashboard
- Implement frontend authentication
- Create login page at `/admin/login`
- Protect all `/admin/*` routes (redirect unauthenticated users to frontpage)
- Database protection: Add Row Level Security (RLS) to all SQL databases (currently no RLS, all databases unprotected)
- No logout functionality needed

**Testing**: Test login flow, protected route access (verify redirects to frontpage), session persistence across browser sessions, RLS settings for SQL databases (verify data access control)

**Documentation**: Use `docs\website-development\dev-phases-docs\admin-update.md` as running document for real-time updates. Use `docs\website-development\logs\development-logs\admin-update-dev-log.md` for development log entries.

**Phase 6 Success Criteria**: Admin panel secured through authentication (Supabase Auth or Google SSO), all admin routes protected with redirect, session persistence working, all databases protected with RLS.

**State after Phase 6**: Admin authentication is frozen, all admin routes protected, all databases protected with RLS.

**After completing Phase 6**: Push to GitHub

### Phase 7: Code review
**Complete audit**: Full code review and edge case testing
- Review all files in the project, go file by file systematically
- Look for bugs or broken features, code that's hard to read or maintain
- Everything works well now, no known problems; find problem areas during audit
- Main goal: prepare for mobile version and adaptability implementation (Phase 8)
- Edge case testing designed during phase
- Code organization decisions made during Phase 7 after audit

**Optimization**: Identify and fix unoptimal code, potential errors, optimization opportunities
- Unoptimal code: code that runs slowly, code that's repetitive, code that uses too much memory, code that can be rewritten more optimally
- Errors to look for: code that might crash, code that doesn't handle errors well, code that might show wrong information
- Performance focus: pages loading slowly, things that feel laggy when clicking, general performance improvements
- Fix all issues found during phase
- Test each fix individually

**Prepare for mobile**: Refactor code and create documentation for Phase 8 mobile implementation
- Code structure preparation:
  1. Component modularity review: identify components mixing mobile-hidden with mobile-visible elements, review if components structured for easy conditional rendering, document components needing refactoring for mobile, suggest extracting reusable logic from components with mobile variants
  2. Layout hardcoding audit: identify hardcoded widths/positions/margins incompatible with mobile (e.g., w-[560px], calc(50% + 70px)), review fixed positioning becoming scrollable in mobile (InfoMenu fixed → scrolling), document CSS classes assuming desktop layout, identify components needing layout flexibility
  3. State management for mobile features: review current state structure for extending with mobile states (banner dismissed, menu mode), identify where mobile state tracking added, document state flow for mobile behavior changes (Resume asset clicks switching tabs)
  4. Asset click behavior preparation: review current asset click handlers in Resume entry cards, identify changes needed for tab switching + content auto-selection, document how content selection works in Portfolio for reuse in mobile auto-selection, verify content data available for instant switching (loading optimization)
  5. Desktop vs mobile logic separation: identify logic tightly coupled with desktop visuals needing separation, document components mixing logic and presentation, plan refactoring to separate logic (reusable) from presentation (desktop-specific), create patterns for conditional rendering without duplicating logic
- Mobile preparation documentation: create technical implementation guide (how to make each component mobile-friendly) AND high-level strategy document (which components need changes and why)
- Helper utilities: create utilities for Phase 8 use (breakpoint detection, mobile detection, responsive layout helpers)
- Mobile compatibility analysis: analyze code for mobile issues (no resize testing), document known issues (main menu doesn't fit and scrambled on small screens - requires collections hiding and single-column restructure; Resume tab too wide - requires timeline hiding and entry cards only display)
- Refactoring approach: refactor components during Phase 7 to make mobile easier, document all refactoring decisions

**Update README.md and push to GitHub**
- README.md is outdated (over a month old)
- Scan current README.md for useful bits, rewrite from scratch to reflect current status while saving useful information
- README scope: file structure, descriptions and essentials of each component, documentation, admin panel, backend, databases and fields
- Prepare for review and push, provide instructions on managing GitHub repo (how to commit and push changes, branch management)

**Documentation**: Use `docs\website-development\dev-phases-docs\code-review.md` as running document for real-time updates. Use `docs\website-development\logs\development-logs\code-review-dev-log.md` for development log entries. Create `docs\website-development\dev-phases-docs\mobile-preparation.md` for mobile implementation guide and strategy.

**Phase 7 Success criteria**: Complete audit completed, code optimized, all issues fixed, components refactored for mobile readiness, helper utilities created, mobile preparation documentation completed (technical guide + strategy document).

**State after Phase 7**: No new visual changes; visually and logically, the frontend works exactly as after Phase 5. Code refactored for mobile readiness, helper utilities created, mobile preparation documentation complete. 

### Phase 8: Mobile version and adaptability
**Target**: Small screens (primarily vertical portrait mobile screens, but adaptable to any small screen size)
**Core principle**: Minimal programmic logic changes, primarily visual condensation and element hiding, existing logic preserved with different visuals only

**Adaptability**: Create mobile layouts for all pages, full desktop version unchanged

**Profile in mobile**: 
- Profile tab always uses full screen width (collapsed and expanded)
- Collapsed state: name upper-left corner, job titles upper-right corner, short bio below name/titles
- Expanded state: dual-column at top (Name left 30%, Titles right 70%), single-column below stacked vertically (order: Full bio → Education → Skills → Languages), 15px padding on sides for all elements
- Expand button behaves exactly as in full desktop (Phase 4 behavior: "COLLAPSE" text, moves to bottom of expanded state)

**Bottom Tab Nav in mobile**: 
- Portfolio and Resume tabs remain (same functionality)
- Downloads menu: icon-only button (left side, same expandable functionality, appearance change only)
- Share button: smaller button with icon, 10px text below icon (icon selected during phase)
- NO temporary tabs can open (no Active Collection or Active Content tabs in mobile)

**Collections in mobile**: 
- Fully hidden: Active Collection tabs, collections menu, Samples button all removed
- Users cannot access collections at all on mobile

**Active Content in mobile**: 
- Users cannot access Active Content tabs at all on mobile (no way to open content from Resume tab)

**Portfolio tab in mobile**: 
- Main menu two modes: collapsed (shows active content sidebar title only) and expanded (shows one column at time)
- Collapsed mode: displays "Active Content Item Sidebar Title" on Line 1 only, content reader visible below, positioned at top of screen below Profile
- Collapsed menu tap: hides content reader, expands menu showing active content category (Line 1), subcategory (Line 2), content item (Line 3)
- Expanded mode: menu takes full screen width, fills all space between Profile and Bottom Nav, content reader hidden, items display as vertical list taking full width
- Expanded mode selections: active item highlighting follows desktop logic until Phase 10
- Expanded mode column selections: tapping active category opens all categories list, tapping active subcategory opens all subcategories list, tapping active content item opens all content items list
- Selection flow: choose category → opens subcategories selection → choose subcategory → opens content items selection → choose content item → collapses menu and displays content reader with selected content
- Back navigation: only way to collapse menu is select content item (no other back navigation)
- Featured collections menu: hidden in mobile (same as regular collections menu)
- Menu state on tab switch: when menu expanded and user switches to Resume, menu resets to loading screen (expanded) when returning to Portfolio
- Content item auto-selection from Resume: clicking content asset in mobile Resume switches to Portfolio tab instantly, opens in collapsed mode showing selected content immediately, menu stays collapsed
- Return to Resume: when switching back to Resume from Portfolio, Resume tab loads at top (scroll position not preserved)
- CRITICAL: Same main menu logic as desktop, NO new logic invented, only visual difference (one column displays instead of three columns, same programming logic preserved)
- Content reader: fills all space between menu and Bottom Nav, full width with 15px margins on sides
- Content reader title/subtitle: same font sizes as desktop (Phase 10 will adjust if needed)
- Info menu: positioned at top of content reader (below collapsed main menu), full width with margins, NO LONGER FIXED, scrolls with content and always visible at top (only positioning change from desktop)
- Loading screen: initial Portfolio tab state with main menu expanded and content reader hidden

**Resume tab in mobile**: 
- Timeline hidden (no green line, no markers, no side lines)
- Entry cards: full width with 15px margins on sides, stack vertically with 20px gap between cards
- Card order: follows implementation from resume-timeline-logic.md and resume-timeline-planning.md (already coded order preserved)
- Side/center cards: still styled differently (preserve visual distinctions from desktop)
- Entry card internal layout: same as desktop (title, subtitle, description, buttons), left and right side cards display identically with text aligned left (no text alignment distinction in mobile)
- Entry card buttons: same layout as desktop (Expand center, assets in row)
- Entry card expansion: still expand/collapse in mobile with same expand button as desktop
- Samples button: hidden and non-functional (collections hidden in mobile)
- Assets behavior depends on asset type: custom link opens in new browser tab (same as desktop), content item switches to Portfolio tab and auto-selects clicked content (new mobile behavior)

**Admin side**: No changes to admin panel

**Mobile first-load banner**: 
- Shows on every fresh page load in mobile (NOT when resized from desktop to mobile)
- Banner detection: only shows if initial page load is mobile size, not if resized from desktop to mobile, stays dismissed if dismissed then resized to desktop then back to mobile
- Session definition: new session starts when user loads website in new browser tab/window, session ends when user closes all website instances (all tabs), banner appears again if user closes all instances then reopens on small screen (ideally user sees once per session)
- Banner text: "This website works best on a computer"
- Banner overlays on top of entire bottom nav menu area (same height, same width, floating element)
- Duration: 10 seconds, then disappears automatically
- Click/tap anywhere on banner to dismiss immediately
- After 10 seconds or dismiss, banner disappears and bottom nav menu displays normally
- Banner styling: design decisions in Phase 10

**Breakpoint and transition**: 
- Breakpoint: below 768px width AND portrait orientation (both conditions)
- Breakpoint detection: technical decision during phase (CSS media queries, JavaScript, or both)
- Component structure: technical decision during phase (conditional rendering, separate components, or mix)
- Transition behavior: automatically switch layouts when crossing breakpoint, preserve current tab/content when switching, reset open menus/expanded states

**Testing approach**: 
- Browser window resizing for different screen sizes
- Explore mobile testing apps during phase
- Testing specifics defined during phase implementation

**Documentation**: Use `docs\website-development\dev-phases-docs\mobile-version.md` as running document for real-time updates. Use `docs\website-development\logs\development-logs\mobile-version-dev-log.md` for development log entries.

**Phase 8 Success Criteria**: Adaptable design is implemented and tested on the small vertical screen (mobile testing is limited due to current localhost nature of development)

**State after Phase 8**: No visual or code changes to the full desktop version of the website; adaptable version is frozen. Visual design and small layout changes are allowed in Phase 10. Code optimization is allowed in Phase 11.

### Phase 9: Handoff for redesign
**Purpose**: Create documentation to guide Phase 10 visual redesign (colors, fonts, visual effects, animations, minor positioning tweaks) without touching core logic or major layout
**Scope**: Visual, stylistic, aesthetic changes only — colors, fonts, font sizes, visual effects, shadows, borders, animations, transitions, slight positioning/spacing/sizing adjustments
**Covers**: Both desktop and mobile versions (Phase 10 redesigns both)

**Redesign constraints**: Define what CANNOT change
- Component structure and logic: no changes to component architecture or programming logic
- Element positioning and layout: elements stay in same general areas (e.g., left side elements stay left), only minor tweaks allowed (few pixels adjustment)
- Functionality and behavior: all interactions and features work exactly the same
- Major layout changes forbidden: example of unacceptable change (moving collections menu to left and main menu to right), example of acceptable change (moving main menu few pixels right closer to collections menu)

**Redesign opportunities**: Define what CAN change
- Colors: all colors can change (background, text, borders, accents)
- Fonts: font families, sizes, weights can change
- Visual effects: shadows, borders, gradients, opacity can change
- Animations and transitions: can add/modify animations
- Spacing and sizing: minor adjustments (few pixels) acceptable
- Component-by-component guide: specific visual changes for each tab and element

**Handoff document content**: 
- Current design inventory: colors, fonts, spacing currently used
- Design constraints: what cannot change (outlined above)
- Design opportunities: what can change (outlined above)
- Component-by-component redesign guide: how to change visual design for each frontend tab, how to tweak elements, how to change colors
- Reference existing documentation: `docs/handoff-docs/portfolio-handoff.md` for Portfolio patterns
- Note on design-system.md: use cautiously (created before current implementation), Phase 10 will fully rehaul design-system.md

**Target audience**: AI implementing Phase 10 changes (document written for AI to understand and execute)

**Documentation**: Use `docs\website-development\dev-phases-docs\redesign.md` as running document for real-time updates. Use `docs\website-development\logs\development-logs\redesign-dev-log.md` for development log entries. Create `docs\handoff-docs\redesign-handoff.md` for comprehensive redesign guide.

**Phase 9 Success Criteria**: Redesign scope outlined and finalized, handoff document fully written and comprehensive, AI verified document supports complete visual redesign without core logic changes.

**State after Phase 9**: Freezing front page functionality, no changes to core code and no major layout changes after Phase 9

### Phase 10: Complete visual frontpage redesign
**Process**: Create detailed planning document at phase start, implement redesign systematically
**Decision making**: User makes final decisions based on research and AI recommendations, AI suggests options but user decides

**Design workflow**:
1. Decide basics first: color scheme, fonts, general font sizes, design system framework
2. Desktop redesign: create full desktop design mockup, implement component-by-component (order: Profile → Bottom Nav including Downloads → Portfolio tab → Active Content/Collection (same design as Portfolio) → Resume tab)
3. Mobile redesign: repeat mockup and implementation process for mobile (potentially different design from desktop)

**Design system**: Completely rewrite `docs/design-system.md`
- Color palette with all shades and usage guidelines
- Typography scale with all sizes and weights
- Spacing system
- Animation library
- Component patterns

**Final layout tweaks**: Minor positioning adjustments from Phase 9 constraints (few pixels movement acceptable)

**Animations**: Add to all interactive elements
- Animation types: page/tab transitions, element hover effects, content loading animations, tab switching animations, menu collapse/expand, Profile tab collapse/expand, Resume entry card collapse/expand, additional animations defined in Phases 9-10

**Documentation**: Use `docs\website-development\dev-phases-docs\redesign.md` as running document for real-time updates. Use `docs\website-development\logs\development-logs\redesign-dev-log.md` for development log entries.

**Phase 10 Success Criteria**: Website (full desktop and mobile versions) fully redesigned with final colors/fonts/animations, design system documentation complete, all visual changes implemented.

**State after Phase 10**: Freezing front page, no changes to the front page after Phase 10

### Phase 11: Code audit and optimization, SEO
**Performance**: Pre-load all tabs data for instant loading
- Resume tab pre-loads immediately after Portfolio tab loads (loads before user switches to Resume)
- Resume tab loads instantly with no loading indicator
- Pre-load all tabs data (Portfolio, Resume, Downloads)
- Optimization techniques detailed in phase planning

**SEO**: Sitemap, robots.txt, no-index rules
- Sitemap includes: all featured content items, collections, categories/subcategories, resume, profile bios
- No-index checkbox in admin: add checkbox to create/edit content page in admin, if checked content flagged as no-index and blocked from search engine crawlers, unflagged content indexed normally
- robots.txt standard setup: allow crawling home page, block admin panel, block parsing content flagged as no-index

**Infrastructure**: Supabase wake-up tool
- Purpose: Supabase pauses inactive projects after 7 days, website has low traffic with gaps, need to prevent database pause
- Implementation: create tool that automatically makes fake database call every 5 days to keep project active (prevents 7-day pause)
- Automatic API calls prevent database/authentication pauses

**Error handling**: Handle failures gracefully
- Network errors: retry automatically, use cached data if available, show error message to user if retry unsuccessful
- Empty collections: hide from menu, show "No Items" message if directly accessed
- Content load failures: show error message in content area

**Documentation**: Use `docs\website-development\dev-phases-docs\final-audit.md` as running document for real-time updates. Use `docs\website-development\logs\development-logs\final-audit-dev-log.md` for development log entries.

**Phase 11 Success Criteria**: All tabs pre-load and load instantly, sitemap generated with all required content, robots.txt configured correctly, no-index functionality implemented in admin and enforced by crawlers, Supabase wake-up tool created and scheduled, error handling implemented for all failure scenarios. 

### Phase 12: Google Analytics pre-setup
**Analytics platform**: Google Analytics 4 (GA4)
**Privacy**: No personal data tracking beyond GA4 defaults (country, city, device, traffic sources)

**Tracking scope**:
- Website visits (total count)
- Tab views: Portfolio tab views, Resume tab views
- Profile tab expansions: track expansions with context (which tab user was on when expanded - Portfolio or Resume)
- Downloads menu: expanded state, what users downloaded
- Share button clicks
- Active Content and Active Collection tab opens

**Key events** (track with specifics - content titles or IDs):
- Content item views (track which content specifically, title or ID)
- Download menu button clicks
- Downloads (what was downloaded)
- Resume entry card expansions (which entry specifically, title or ID)
- Active Collection views (which collection specifically, title or ID)
- Active Content views (which content specifically, title or ID)
- List finalized during phase implementation

**Cookies warning banner**: 
- Preferred: avoid cookies banner by limiting tracking scope to stay GDPR-compliant
- If banner required: positioning and implementation decided during phase

**Testing**: Test analytics tracking working correctly, events firing when expected, data appearing in Google Analytics dashboard

**Documentation**: Use `docs\website-development\dev-phases-docs\admin-update.md` as running document for real-time updates. Use `docs\website-development\logs\development-logs\admin-update-dev-log.md` for development log entries.

**Phase 12 Success criteria**: Google Analytics tracking implemented and tested, all key events firing correctly, data visible in GA4 dashboard, GDPR compliance achieved (cookies banner if required). 

## Unfinished from phases
PDF Generator doesn't work very well + allow adding custom PDF to download, and generate a PDF only if a custom PDF is missing

## Ideas to implement after the end of this roadmap:
Short limited captions for month markers
Admin remake (after launch)
Display collection name and description in profile tab when collection is active
Show relevant collections: active collections for selected content are highlighted green, but in admin, I can select similar collections, which display in gray near linked collections
Enable PDF downloads for selected samples for categories and subcategories; advanced option: build a "downloads cart" for content items, where user can pick items to download in one pdf
Explore Cloudinary image integration/transformations
https://github.com/editor-js/embed Can I make an embed of Substack? 
Hide Profile when main menu is collapsed (or integrate a new button?)
Investigate wavesurfer.js and video.js plugins (examples of wavesurfer.js)
PDF rendering options (roadmap line 90)
- Option A (current): client-side html2pdf.js rendering existing content via `pdf-generator.ts`; fastest to keep, no server changes; risk: heavier on client CPU for large docs.
- Option B: dedicated print-friendly route + client html2pdf for better styling isolation; still client-heavy but cleaner layout control.
- Option C: server/edge rendering (headless Chromium/puppeteer or wkhtmltopdf) for consistent output and offloading work; adds deployment/runtime complexity (needs server/edge function and auth-safe access to content).
- Option D: prebuilt templates rendered server-side and stored in Supabase storage on demand; best for repeated downloads, requires job/queue + invalidation when content updates.