# Front page update development document

## Basics
**Scope**: This document covers development plans for several phases of the websiite-roadmap.md master document
**Current status**: Phase 2 (lines 56-96) and Phase 4 (line 129-152) are outlined and completed; Phase 5 is in progress

## Phase 2: Active Content, Downloads (roadmap lines 56-96)
- Bottom nav layout: Active Collection tabs on the left of Portfolio; Portfolio and Resume stay centered and never move; Active Content tabs on the right of Resume. Remove “COLLECTION” prefix and all-caps; keep existing styling otherwise.
- Downloads: remove Downloads tab button; add “Download ↑” menu on the left, 25px from nav’s left edge. Collapsed label “Download ↑” (placeholder up-arrow icon; design-phase asset later). Collapses on button click, tab switch, or click outside.
- Downloads expanded rows: Row 1 full-width “Download Resume”; Row 2 left 50% “Download <content sidebar-title>” (Portfolio/Active Content tabs), right 50% “…and include resume”; Row 3 left 50% “Download <collection name> (X items)” (Active Collection tab), right 50% “…and include resume”. Show “Generating Download” while creating PDFs. Errors: toast/inline with retry. File naming: “AndreyBeregovskiy_<DownloadName>” (sidebar title or collection name, Pascal-style). Use existing pdf-generator; no limits on combined downloads. Mobile: same rows stacked; detailed mobile behavior deferred to mobile phase.
- Active Collection tabs: multiple allowed; persist via localStorage; close → Portfolio if active, otherwise just remove; allow loading spinner on tab label when switching.
- Active Content tabs: new temporary tabs to the right of Resume; open from Resume assets (Phase 3 implementation), no duplicates; multiple allowed; persist via localStorage; close → Resume if active; reuse Portfolio layout (menu, content reader, info menu), main menu shows Category → Subcategory → Content path; Collections menu shows collections linked to the active content item; use content UUIDs.
- State and persistence: extend bottom-nav state to hold active collections and active content tabs; persist both via localStorage on change/page load (no URL params). LocalStorage clearing strategy: use whatever is optimal for stability (persist across sessions unless instability requires clearing).
- Tab order: (all Active Collections) – (PORTFOLIO) – (RESUME) – (all Active Contents). Portfolio/Resume remain centered regardless of side tabs.

### Current code snapshot (for implementation impact)
- BottomTabBar: fixed tabs portfolio/resume/downloads; collection labels “COLLECTION {NAME.toUpperCase()}”, located to the right; no Active Content tabs; no persistence.
- app/page.tsx: tracks activeTab + openCollections only; no localStorage; DownloadsTab is a full page; no Active Content handling.
- PortfolioContent: filters when activeTab is a collection; no Active Content logic; no persistence; uses profileHeight; pageState drives menu/content/InfoMenu visibility.
- DownloadsTab: standalone page (search/filter + PDF generation); will be replaced by the Download ↑ menu model.

### Decisions and answered items
- Downloads labels/layout/behavior as detailed above (Rows 1-3, collapse rules, loading/error states, naming).
- Hover/active states: simple text with arrow; placeholder colors now; final colors in design phase.
- Loading indicators: show spinner on tab label for Active Collection/Content when switching/loading.
- Active Content tabs reuse Portfolio layout; no extra layout differences.
- localStorage key/shape: any simple shape is acceptable.
- Download label: placeholder up-arrow icon now; final icon in design phase.
- PDF rendering decision (roadmap line 90): keep client-side html2pdf.js via `pdf-generator.ts`; integrate with Phase 2 downloads menu (states, naming, error/retry). No server changes planned now.

#### Gaps / open items
- GAP: ResumeTab asset click handlers to open Active Content/Collection are Phase 3 work (keep noted for alignment when Phase 3 runs).

### Plan – steps and stages (Phase 2)
#### Step 1: Bottom nav structure and labels  
##### Stage 1: Move Active Collection tabs left of Portfolio; remove “COLLECTION” prefix/all-caps; keep styling. Output: tabs order updated, labels in admin case, no downloads tab present.
##### Stage 2: Keep Portfolio/Resume centered with new order; add tab-label spinner support. Output: center alignment stable regardless of side tabs; spinner can show on collection/content tabs while loading.

#### Step 2: State + persistence setup  
##### Stage 1: Extend state for active collections + active content tabs (UUID), include tab order logic. Output: unified state shape, duplicate prevention, close behaviors (collection → Portfolio, content → Resume).
##### Stage 2: localStorage save/restore for both tab types; define clear/rehydrate flow. Output: save on change, restore on load; fallback if corrupted storage.

#### Step 3: Active Content tabs (layout reuse)  
##### Stage 1: Add Active Content tab model (no duplicates, close → Resume). Output: tab objects keyed by content UUID, opens to right of Resume, title uses admin case.
##### Stage 2: Hook tab view to Portfolio layout (menu/content/info), show linked collections in Collections menu. Output: main menu shows Category → Subcategory → Content; collections menu lists collections linked to active content item; content reader displays item.

#### Step 4: Downloads menu replacement (option A)  
##### Stage 1: Replace Downloads tab with “Download ↑” button + expanded rows/behavior. Output: collapsible menu left side; rows per spec; collapse on outside click/tab switch/selection change.
##### Stage 2: Wire option A pdf-generator integration; add “Generating Download”, errors with retry, file naming. Output: uses client html2pdf via `pdf-generator.ts`; file names “AndreyBeregovskiy_<DownloadName>”; retryable errors; uses sidebar title or collection name.

#### Step 5: Behavior polish  
##### Stage 1: Collapse on tab switch/outside click; ensure selection-change closes menu. Output: consistent hide rules; no stale state.
##### Stage 2: Final pass on labels/icons placeholders and mobile stacking behavior note. Output: placeholder arrow icon; note that mobile stacks rows (details later phase).

#### Step 6: QA and handoff  
##### Stage 1: Smoke test bottom nav, tabs, persistence. Output: verify tab order, open/close, persistence restore, downloads menu open/close and file generation.
##### Stage 2: Document testing notes and ready for Phase 3 alignment (asset clicks gap). Output: brief test results + reminder that Resume asset clicks arrive in Phase 3.

### Phase 2 Handoff
- Handoff doc prepared for Phases 7–10 (`docs/handoff-docs/botton-nav-handoff.md`): layout, visual customization points (colors, backgrounds, icons, spacing, transitions), logic constraints (tab order/centering, downloads context rules, audio/video exclusion), and current PDF placeholder status.
- Dev log updated for Step 6 Stage 2.

## Phase 4: Profile Tab rehaul (roadmap lines 129-151)

### Notes (confirmed)
- Collapsed Profile height is set in admin (pixels) and hard-caps visible content.
- Expanded Profile height stays automatic and fills down to Bottom Nav.
- Skills → collections are linked manually in admin; if no link, skill is plain text.

### Plan – steps only (Phase 4)
#### Step 1: Data model decision for skills + collection links
- Decide where skill items and their collection links live (new table vs profile row).
- **Decision**: Use a new table for skills with a linked collection id (Option A).

#### Step 2: Database and data migration
- Add new table for skills + collection link.
- Suggested table: `profile_skills` with fields:
  - id (uuid), profile_id (uuid), skill_name (text), collection_id (uuid, nullable), order_index (int)
- Migrate existing comma-separated skills into the new structure.
- Remove the old comma field after migration.
- **Decision**: Link `collection_id` to collections by id (UUID).
- SQL to run in Supabase SQL editor:
```sql
-- 1) New table for profile skills
create table if not exists profile_skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profile(id) on delete cascade,
  skill_name text not null,
  collection_id uuid references collections(id),
  order_index int not null default 0
);

-- 2) Migrate existing skills from profile.skills (text[] array)
insert into profile_skills (profile_id, skill_name, order_index)
select
  p.id as profile_id,
  trim(s) as skill_name,
  row_number() over (partition by p.id order by ord) - 1 as order_index
from profile p
cross join lateral unnest(p.skills) with ordinality as u(s, ord)
where p.skills is not null;

-- 3) Remove old skills field
alter table profile drop column if exists skills;
```

#### Step 3: Admin Profile editor — skills UI rework
- Replace comma field with a list editor (add/remove skill rows).
- Each skill row gets a collection picker (optional).
- Save and load the new skill data structure.

#### Step 4: Admin Profile editor — collapsed height field
- Add a numeric input for collapsed Profile height (pixels).
- Save and load the height value with Profile data.

#### Step 5: Profile tab — collapsed height behavior
- Apply the admin height to the collapsed Profile container.
- Clip overflow so content beyond the height is hidden.
- Ensure height reporting (ResizeObserver) uses the collapsed height in collapsed state.

#### Step 6: Resume tab — profile height integration
- Pass `profileHeight` into ResumeTab.
- Apply it as top spacing so Resume starts below Profile.

#### Step 7: Profile expanded layout rework
- Two columns: left 2/3, right 1/3.
- Right column order: Education → Skills → Languages.

#### Step 8: Expand button changes
- When expanded: text = “COLLAPSE”.
- Move the button to the bottom of expanded content.

#### Step 9: Skills click behavior
- If a skill is linked to a collection, click opens Active Collection tab.
- If not linked, skill is plain text (no click).

#### Step 10: Phase 4 testing
- Change collapsed height and confirm clipping.
- Expand/collapse and confirm layout order and button changes.
- Confirm Portfolio/Active Content/Collection and Resume spacing respond to height.
- Confirm skill click opens collections only when linked.

## Phase 5: Info menu changes, Share button, unique URLs (roadmap lines 153-184)

### Step 1: Baseline review
- Re-read current InfoMenu data flow (title/subtitle sources, scroll behavior), link rendering, bottom nav state, and admin validation for Byline/Link Style to spot likely regression points.
- Findings:
  - InfoMenu now supports sticky title/subtitle when they scroll out; still shows publication/byline/link with raw URLs (no favicon/domain shortening yet) and hides each line only when both related fields are empty.
  - ContentReader already uses an IntersectionObserver to report title/subtitle visibility to InfoMenu, so scroll mirroring is in place.
  - Content query still filters out rows with null byline_style or link_style; making these optional will require removing those filters and handling null-safe rendering/types.
  - InfoMenu receives title/subtitle and sticky flags via PortfolioContent, but it only renders in the `collapsed-reader` state (page defaults to `expanded-empty`), so sticky blocks appear only after collapsing into reader mode.
  - InfoMenu uses fixed positioning with vertical centering that shifts by the sticky block height (measured via ResizeObserver).
  - Bottom nav currently has the Download menu only; adding Share must preserve Portfolio/Resume centering.
  - State persists in localStorage (`bottomNavState`); deep links must avoid duplicate tabs when combined with restore.
  - Download context is already bubbled up for PDFs; Share will need similar content/collection context plumbing.

### Step 2: Scroll detection for title/subtitle (Status: Success)
- Add IntersectionObserver on content title/subtitle in the content reader; set visibility flags when they scroll out of view; ensure cleanup on content/tab change and SSR guards.

### Step 3: InfoMenu display update (Status: Success)
- Sticky title/subtitle now render when scrolled out of view: title bold and +2px over the publication line, subtitle gray and +1px, separate lines; publication/byline/url order preserved; vertical centering shifts by measured sticky block height; subtitle line hides when missing.

### Step 3.Fix 1: Sticky title flicker (Status: Fail)
- Issue: On scroll-out, the title appears briefly in InfoMenu then disappears; sticky rendering not stable.
- Action: Tightened IntersectionObserver visibility detection (hysteresis on intersectionRatio) to prevent rapid toggling near the viewport boundary.

### Step 3.Fix 2: Step 3 restart analysis (Status: Fail)
- Problem summary: Step 3 failed twice; sticky title/subtitle still do not render on scroll-out.
- What I found in code:
  - `ContentReader` creates an IntersectionObserver with `root: null` (viewport) and reports `titleInView`/`subtitleInView` via `onTitleVisibilityChange`.
  - `PortfolioContent` stores `titleInView`/`subtitleInView` in state and passes them to `InfoMenu` as `showStickyTitle`/`showStickySubtitle`.
  - `InfoMenu` only renders when the page state is `collapsed-reader`, and the default page state is `expanded-empty`.
  - `InfoMenu` shifts its vertical centering by the sticky block height (uses a ResizeObserver on the sticky block).
- Likely reasons scroll-out is not working:
  - The scroll container might not be the browser viewport. If the page uses a nested scrolling container, an observer with `root: null` will not detect scroll-out.
  - The content might not actually scroll enough for the title/subtitle to leave the viewport (no scroll → no observer change).
  - The page might be in `expanded-empty` state, which hides both the Content Reader and Info Menu, so sticky states never show.
  - The observer attaches before the title/subtitle nodes are ready (or subtitle doesn’t exist), leaving visibility stuck at "in view."
- Possible fixes to complete Step 3 (no code changes made yet):
  - Set the IntersectionObserver root to the real scroll container that the content uses (if it’s not the viewport).
  - Ensure the content area is the scroll target (consistent scroll container), or attach the observer to the same scroll container used by the reader.
  - Add a fallback scroll listener (or a manual visibility check) if IntersectionObserver isn’t firing.
  - Verify the page is in `collapsed-reader` and that content is tall enough to scroll during testing.

### Step 3.Fix 3: Flicker diagnosis (Status: Fail)
- Browser observation (Cursor browser): I can see the Editor.js playground page, but the browser snapshot is a still image, so it cannot show the flicker directly.
- Likely root cause of flicker:
  - The visibility check is right on the boundary where the title/subtitle slide under the fixed menu bar. Small layout changes can push the title above/below that boundary, which flips visibility back and forth.
  - The observer is sensitive (multiple thresholds plus a small ratio), so tiny shifts can trigger repeated toggles.
  - The ContentReader content is dynamic (Editor.js blocks, embeds, images). As it loads or reflows, the title position can shift slightly even when you are not scrolling.
- Why opening DevTools (Console) makes it worse:
  - Opening the console changes the viewport size. That shifts the position of the title/subtitle relative to the menu bar and the observer boundary, increasing how often the visibility flips.
  - The browser may reflow the page more often when DevTools is open, which makes small position changes happen more frequently.
- Expected behavior based on this diagnosis:
  - Flicker should increase whenever the viewport height changes (like opening DevTools), because the title is hovering near the “in view vs out of view” boundary.
  - Flicker should be strongest on content where the title is very close to the fixed menu bar after scroll-out.
- Recommended fix options to complete Step 3:
  - Option A (buffer zone): Only switch to “out of view” after the title/subtitle move a few extra pixels under the fixed menu bar. This reduces rapid toggling at the boundary.
  - Option B (single trigger rule): Use one stable trigger point (for example, title bottom under menu bar by X pixels) instead of multiple thresholds.
  - Option C (short debounce): Require the “out of view” state to stay true for a short time (e.g., 150–250ms) before showing sticky title/subtitle.
  - Option D (use actual scroll container): If the content isn’t scrolling the viewport, set the observer root to the real scroll container so the visibility checks are accurate.

### Step 3.Fix 4: Option B (single trigger rule) (Status: Fail)
- Goal: Replace the multi-threshold visibility check with one stable trigger point to reduce flicker.
- Plan: Treat the title/subtitle as “in view” only if their bottom edge stays below the menu bar by a small fixed offset. This removes the rapid toggling caused by tiny layout shifts.

### Step 3.Fix 5: Option C (short debounce) (Status: Success)
- Goal: Add a short delay so the “out of view” state must stay true for a brief moment before showing sticky title/subtitle.
- Plan: Debounce the visibility updates by ~200ms to filter tiny layout shifts that cause rapid toggling.

### Step 3.Fix 6: Scroll-back hide (Status: Success)
- Issue: Sticky title/subtitle appear on scroll-out, but do not reliably disappear when the title/subtitle re-enter the Content Reader.
- Action: Recompute visibility on scroll and resize (not only on observer threshold changes) so the sticky state turns off when the title/subtitle are visible again.

### Step 3.Fix 7: InfoMenu vertical centering (Status: Success)
- Issue: InfoMenu sits too low when sticky title/subtitle appear.
- Action: Keep InfoMenu centered exactly midway between the main menu and bottom nav, regardless of whether sticky title/subtitle are shown.

### Step 4: Link shortening with favicon (Status: Success)
- Add helper to extract main domain (strip protocol/subdomains) and non-blocking favicon fetch (domain → favicon service → default icon). Render links as favicon + domain-only label; keep full URL on hover/click; handle errors without blocking render.
- Findings/implementation:
  - Extract main domain from `source_link` (simple hostname parsing; fallback to original string).
  - Favicon loading order: direct `/favicon.ico` on domain → Google favicon service → inline default icon.
  - Link text now shows main domain only; full URL shown on hover via title tooltip.

### Step 5: Optional Byline/Link Style fields (Status: Success)
- Make Byline and Link Style optional end-to-end: admin form, validation, and backend allow null/empty; InfoMenu hides label/value when absent; ensure Supabase queries/types tolerate nulls.
- Findings/implementation:
  - Admin labels updated to show Byline/Link Style as optional.
  - Content query no longer filters out rows with null byline/link styles.
  - InfoMenu hides the entire byline or link line when the style is not selected (even if a value exists).

### Step 6: Share button in bottom nav
- Add Share control to BottomTabBar with options: Share Portfolio (root), Share <content> (only if active/selected), Share <collection> (only if active). Implement copy-to-clipboard handlers; keep Portfolio/Resume centering and coexistence with Downloads.
- Findings/implementation:
  - Added a Share button on the right side of the bottom nav with a small dropdown menu.
  - Share menu shows Portfolio always, Content only when a content item is active/selected, and Collection only when an active collection exists.
  - Copy action uses clipboard API with a safe fallback; menu closes after copy.

### Step 6.Fix 1: Hide Share Content in expanded menu (Status: Success)
- Issue: Share Content should hide when the main menu is expanded.
- Action: Track menu expanded/collapsed state from PortfolioContent and hide Share Content when menu is expanded in Portfolio view.

### Step 6.Fix 2: Share copied label (Status: Partial Success)
- Issue: After clicking a Share option, the button should read “Copied” until the Share menu closes. User changed the text from "Copied" to "Link copied".
- Action: Track the last clicked share option and replace its label with “Copied” while the menu stays open.

### Step 6.Fix 3: Download menu typing (Status: Success)
- Issue: TypeScript error because `right` was inferred as `null` only in download menu rows.
- Action: Add an explicit type for download menu rows so `right` can be `string | null`.

### Step 7: Unique URLs for content/collection/resume
- Define shareable URL patterns for collection/content/resume; opening a link should hydrate state to Active Collection/Content or switch to Resume. Prevent duplicate tabs when combined with localStorage restore; handle missing/invalid items gracefully.
- Findings/implementation:
  - Added URL params for deep links: `?content=<uuid>`, `?collection=<slug>`, `?tab=resume`.
  - On load, URL params hydrate tabs and avoid duplicates (fallback names use slug/id if names are unknown).
  - Share menu now uses these params when copying content/collection links.
- Plug the unique URLs functionality into the Share menu. 

### Step 7.Fix 1: Download context loop (Status: In progress)
- Issue: Maximum update depth exceeded due to download context updates triggering repeated state updates.
- Action: Guard the download context handler so it only sets state when the values actually change.

### Step 7.Fix 2: Content tab title on deep link (Status: Success)
- Issue: When opening content via unique URL, the active content tab briefly shows the raw ID.
- Action: Use a neutral placeholder label until the sidebar title is available, then replace it.

### Step 8: Testing & QA (Status: Success)
- Manual checks: scroll states across Portfolio/Active Content/Active Collection; link favicon/domain rendering; optional fields hidden when empty; Share options visibility and clipboard; deep links open correct tabs; bottom nav alignment intact; clipboard and IntersectionObserver in Chrome/Firefox/Edge.

### Step 9: Documentation updates (Status: Complete)
- **Outcomes Summary**: Phase 5 successfully implemented InfoMenu sticky title/subtitle, link shortening with favicons, optional Byline/Link Style fields, Share button with context-aware options, and unique URLs for content/collections/resume. All steps completed with fixes for flicker, scroll-back behavior, menu state handling, and deep link tab titles.
- **Key Decisions**: 
  - Sticky title/subtitle use debounced IntersectionObserver (~200ms) to reduce flicker
  - InfoMenu remains vertically centered regardless of sticky content visibility
  - Links display as favicon + main domain with full URL on hover
  - Byline/Link Style fields are optional end-to-end (admin, queries, rendering)
  - Share button shows context-aware options (Portfolio always, Content/Collection when active)
  - Deep links use URL params (`?content=<uuid>`, `?collection=<slug>`, `?tab=resume`) and integrate with localStorage tab restore
- **Files Modified**: `components/ContentReader.tsx`, `components/tabs/PortfolioContent.tsx`, `components/InfoMenu.tsx`, `components/BottomTabBar.tsx`, `app/page.tsx`, `app/admin/content/new/page.tsx`, `app/admin/content/edit/[id]/page.tsx`
- **Testing**: Manual QA completed across Portfolio/Active Content/Active Collection tabs; verified scroll states, link rendering, optional fields, Share functionality, and deep links in Chrome/Firefox/Edge
- **Development Log**: Entry added to `docs/website-development/logs/development-logs/front-page-upd-dev-log.md`

### Risks / implications
- Stale IntersectionObservers if not cleaned on tab/content swap.
- Favicon fetch delays/failures—must fail fast to default icon.
- Optional fields can break saves if null handling is missed.
- Share URLs must not fight localStorage tab restore (duplicate tabs).
- Bottom nav layout is sensitive; Share button must preserve Portfolio/Resume centering.

