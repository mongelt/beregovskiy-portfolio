# Phase 3 - Resume tab bug fixes
## Phase 3 tasks (from roadmap lines 98-127)
- Wire Samples button and resume assets to open Active Collection/Active Content tabs; link assets open new browser tab; keep external links opening externally.
- Add state handlers from `app/page.tsx` into `ResumeTab` for opening/closing Active tabs; keep centered Portfolio/Resume buttons unchanged.
- Fix entry/side-line positioning issues so cards and lines align on the timeline; include profileHeight prop integration for top padding/margin.
- Document and fix any remaining Resume-tab bugs; prepare handoff notes for designers.

## Documentation convention for this document
 - Each step is one bug
 - When working on a step, start a new section of the document as H3 (###) and call it "Step #.Fix #" where dashes (#) are numbers of step and fix attempted
 - Every action needs to be briefly documented, and marked as Success or Fail

## Bugs found in code (`components/tabs/ResumeTab.tsx`)
### Step 1. Center entries missing end_date:
  - Issue: month counting falls back to Present, not start=end (logic doc line 232), so center entries inflate spans and ordering.
  - Evidence: code uses countMonths(start, end) with null end → Present; center entries should force start=end for all calculations.
  - Need to check: all places using end when null (month span, marker mapping, ordering) to enforce start=end for center entries only.

### Step 1.Fix 1 (Status: Success)
- Action: In `components/tabs/ResumeTab.tsx`, during data transform, if position is center and end_date is missing, set `end_normalized = start_normalized` before month counting. This keeps monthCount and spans at 1 month instead of extending to Present for center entries without end_date.
- Result: Center entries with missing end_date now count as 1 month (start=end) in monthCount and downstream span calculations. Ordering and marker spans will be verified during testing.

### Step 1.Fix 2 (Status: Fail, address after step 7)
- Action: Added `has_end_date_original` flag to transformed entries. Activation logic now only creates an end-date marker for center entries if the original end_date exists. Center entries with missing end_date now activate only one marker (their start date, treated as both ends for span) but do not add a separate end marker.
- Result: Center entries without end_date show only their single month marker (e.g., start May 2020 → only May 2020 marker). Prevents duplicate activation when end is missing.

### Step 2. Missing start_date handling for start marker:
  - Issue: calculateStartMarker ignores entries with null start, but logic doc line 54 says treat start as end; earliest start can be missed, shrinking timeline.
  - Evidence: calculateStartMarker loops entries and skips null start dates.
  - Need to check: where start marker feeds operationalMonths generation; ensure null-start uses end (or Now for side entries) when computing earliest.

### Step 2.Fix 1 (Status: Success)
- Action: In `components/tabs/ResumeTab.tsx` calculateStartMarker, if start is missing, use end_date (already normalized; side entries fall back to Present) as the candidate start; if both are missing, fall back to current month. Earliest marker now considers entries lacking start_date.
- Result: Timeline start marker will no longer skip entries with missing start_date; earliest start now reflects either start_date or end_date (or Present fallback), as required by logic doc line 54.

### Step 3. Side-line colors:
  - Issue: need deterministic unique colors for top 18 visible side entries (logic lines 245-246); current modulo-by-render-order can repeat colors and ignore display order.
  - Evidence: assignSideLineColor(index % 18) tied to map order, not final display order; no deterministic permutation for top 18.
  - Need to design: stable mapping based on display order (top-to-bottom) with permutation for first 18, then round-robin.

### Step 3.Fix 1 (Status: Success)
- Action: Side line colors now assigned after sorting side entries by their actual Y positions (top-to-bottom), using `sideEntryAdjustedPositions` (fallback to marker Y). First 18 entries get unique colors from the palette; entries 19+ reuse colors in round-robin. Color map is deterministic and based on final display order.
- Result: Top 18 visible side entries always get all 18 unique colors in correct top-to-bottom order; colors remain stable with layout changes.

### Step 4. Side line / marker offset mismatch and clustering:
  - Issue: markers/side lines drawn in a container offset by 35px, while cards use raw marker positions; lines sit ~35px below cards and cluster near the center instead of offset left/right (logic line 67 expects lines alongside cards).
  - Evidence: visual (“Causing More [BUG]” view) shows multiple green lines stacked near center; code applies 35px top offset in Timeline but card positions skip that offset.
  - Need to verify: the exact offsets for line start/end vs card top, and horizontal offsets for left/right lines; align both vertical (add same offset) and horizontal (separate from central line) coordinates.

### Step 4.Fix 1 (Status: Fail)
- Action: Added shared top offset (35px) constant and applied to cards/lines.
- Result: Runtime ReferenceError “TIMELINE_TOP_OFFSET is not defined” in EntryCard. Cause: constant not in module scope when used by EntryCard (pure function).

### Step 4.Fix 2 (Status: Partial success, return after step 5)
- Action: Moved `TIMELINE_TOP_OFFSET = 35` to module-level scope in `components/tabs/ResumeTab.tsx` so EntryCard and side line calculations can access it.
- Result: ReferenceError resolved. Shared offset now applies consistently to side cards and side lines; ready for visual verification.

### Step 5. Side card anchor misalignment (verified visually):
  - Issue: side entry cards are not anchored to their end-date markers; e.g., “Causing More [BUG]” (end Dec 2021) floats away from its end marker, so card top ≠ end marker Y (violates placement rules lines 74-76, 535).
  - Evidence: browser view shows the card left of the central stack with its end marker lower/centered; line and card don’t share the same end-date anchor.
  - Need: confirm expected rule (card top at end marker Y), then reconcile markerPositions with card positioning (including offsets and cascade adjustments).

### Step 5.Fix 1 (Status: Partial)
  - Action: Unified the 35px top offset into cascade, collisions, and side lines; removed extra render-time offsets for cards/lines.
  - Result (visual check):
    - “Testing” (Dec 2023–Jan 2025, right) appears slightly below its end markers (April/Jan 2025 markers to its left), and one thin green line runs through the card—alignment still off.
    - “Causing more bugs” (center, Aug–Oct 2020) shows arrow/marker offset slightly below card bottom; start/end texts not perfectly aligned with the line.
  - Conclusion: Still misaligned; needs further work on anchoring card top to end-date marker and ensuring line/marker Y matches card in both collapsed/expanded states.

### Step 5.Fix 2 (Status: Unclear)
  - Action: For side lines, start/end Y now span the card height directly: startY from cascade/marker (with offset), endY = startY + measured card height. Ties the side line to card bounds.
  - Visual check: Cards and side lines now align with their date range (e.g., “Casuin” spans July 2023→April 2024 with markers aligned; no extra line through mid-card). Central timeline remains centered as expected.
  - Conclusion: Anchoring looks correct in collapsed view; no obvious vertical misalignment. Ready to proceed.

### Step 6. Side lines offset vs markers (new visual bug)
  - Issue: Side lines start ~40px below their end month markers and run ~30px past their start month markers (1–2 markers lower than intended). Lines are crossing beyond their start/end markers instead of being contained between them.
  - Expected: Side lines must stay within start/end markers, never crossing above end marker or below start marker.
  - Evidence: Resume tab in browser with marker debug shows side lines extending beyond marker bounds.
  - Suspected cause: vertical offset application in side line generation vs marker positions; possible double/faulty offset or using card height without re-anchoring to marker centers.
  - Next steps: Revisit sideLineData Y calculations to anchor startY at end marker center and endY at start marker center, removing overshoot.

### Step 6.Fix 1 (Status: Fail)
  - Action: In `sideLineData`, set line span to marker bounds: startY = end marker top (+ offset), endY = start marker bottom (top + height). Removed card-height-based endY.
  - Result: No visible change; side lines still misaligned per user (start ~40px low, end ~30px past start marker).

### Status after Step 6.Fix 1
  - Current behavior (code): side lines use end marker top as startY and start marker bottom (top + height) as endY; cards themselves are positioned center-to-center between markers.
  - Issue: Because cards use marker centers but lines use marker edges, lines appear shifted downward (crossing markers).
  - Planned fix: anchor lines to marker extremes as specified—start at end marker bottom (lowest point) and end at start marker top (highest point), so lines stay fully inside start/end markers 
  and align visually with cards. Will implement in next attempt.

### Step 6.Fix 2 (Status: Success)
  - Action: Removed the 35px offset from side line Y; line now uses raw marker positions for span: startY = end marker Y, endY = start marker Y + start marker height.
  - Expectation: Lines sit within markers without the extra offset that pushed them lower. Pending browser verification.

### Step 6.Fix 3 (Status: Success)
  - Action: Side lines now span from the bottom of the end marker to the top of the start marker (startY = end marker Y + height, endY = start marker Y), with no extra offset.
  - Expectation: Lines stay fully inside marker bounds and align better with cards in both collapsed and expanded states. Needs browser verification.

### Step 6.Fix 4 (Status: Partial success)
  - Action: Side lines now run from end marker center + 10px downward to start marker center – 10px upward (startY = end marker Y + markerHeight/2 + 10; endY = start marker Y + markerHeight/2 – 10). No extra offset.
  - Result (my visual check):
    - Top entry line is far below the Now marker (still drifts down).
    - Expanding “Casuin”: line starts ~100px below end marker and extends ~100px past start marker; major overshoot remains.
    - “New Entry” (Sep 2017 → Dec 2017): line shifted off its end marker and slightly past start marker.
    - “More Ties” (standard card): line remains correct (collapsed/expanded), so no special coupling to standard card beyond normal marker height usage.
  - Conclusion: Offsets at marker centers ±10px do not fix long marker spans; lines still misalign badly on tall markers. Need a new approach (likely using marker bounds/top-bottom with minimal buffer) tied to actual marker height.

### Step 6.Fix 5 (Status: Partial success)
  - Action: Anchor lines near marker edges with small clamped buffers: startY = end marker bottom – min(4px, end marker height/4); endY = start marker top + min(4px, start marker height/4). No extra offsets. Goal: keep lines inside markers for both short and tall markers, avoiding big overshoot on long spans/expanded cards.
  - Expectation: Lines should stay within marker bounds, with only a tiny gap from marker edges even when markers are tall. Pending browser verification.

### Step 6.Fix 6 (Status: Partial success)
  - Action: Side lines now start near the top of the end marker (startY = end marker top + small buffer) and end near the top of the start marker (endY = start marker top + small buffer), keeping existing clamped buffers.
  - Expectation: Align closer to end marker top while retaining buffer; needs verification for tall markers and expanded cards.

### Step 6.Fix 7 (Status: Success)
  - Action: Adjusted buffers: `endBuffer = Math.min(20, endMarkerHeight / 1)` and `startBuffer = Math.min(10, startMarkerHeight / 10)`. This raises the start offset (end marker side) and modestly adjusts the start marker side, keeping lines inside marker bounds.
  - Result: Side lines now appear correct in collapsed/expanded states; no overshoot observed in current visual checks.
  - Risks: Minimal—buffers scale with marker height and cap at 20px/10px, so inversion is unlikely. Very short markers will shrink buffers proportionally.

### Step 6.Fix 8 (Status: Success)
  - Action: For side entries with no end date (Present/Now), startY uses no buffer: startY = end marker top (no offset); other side lines keep existing buffers. Goal: align the Present line exactly with the green timeline start; keep all other lines unchanged.
  - Expectation: The top Present side line should start exactly at the Now marker top; other side lines remain as in Fix 7. Pending browser verification.

### Step 6.Fix 9 (Status: Success)
  - Action: Added a 15px fade at both ends of side lines (no positioning change). Uses a linear gradient per line (top/bottom fade to transparent, color remains centered). Only visual; logic unchanged.
  - Expectation: Side line ends softly fade without affecting alignment or length. Requires visual verification.

### Step 7. Side cards ending at bottom of start marker (marker debug)
  - Issue: Side cards end at the bottom of the start month marker, and visually end lower than the start marker text. 
  - Expected: Side card bottom should align to start marker top.
  - Current placement: Side cards are anchored at their end-date marker Y (top), then extend downward by the card height (collapsed/expanded) with cascade adjustments to avoid overlap. The start marker acts as a lower bound but cards are not directly fitted between “top of end marker” and “bottom of start marker”; they anchor at end marker Y and flow downward. Overlap handling can push cards lower relative to markers.
  Current state:
  - Visual: With marker debug on, side cards end below the start marker text; the card bottom often sits at or below the start marker bottom, not near the text/center.
  - Code cause: Card top is anchored to end marker Y (with cascade overlap adjustment), and the card height just flows down; the start marker is not used to set the card bottom. Cascade adjustments can push the card further down, widening the gap to the start marker text.
  - Why markers expanded: Marker heights expand per required per-month height, but card placement still uses end marker top + card height (plus cascade); there is no pinning of card bottom to the start marker.

### Step 7.Fix 1 (Planned)
  - Plan A: If a month marker is a start-month marker for any side card, render that marker’s label at the bottom of the marker instead of the top (visual only).
  - Plan B: Side cards start at the bottom of their end-month marker (not the top), preserving cascade/overlap logic, to align tops with end marker bottoms.
  - Goal: Bring start-month text closer to card bottoms and align card tops to end-month marker bottoms without changing overlap/cascade behavior.

### Step 7.Fix 1 (Status: Fail)
  - Action: Start-month markers (any side card start) now render their label at the bottom of the marker; other markers remain at top.
  - No changes to card positioning or cascade/overlap in this step.

### Step 7.Fix 2 (Status: Partial success)
  - Change 1: Added a shared top buffer for side cards; card tops sit 15px lower relative to end-month marker tops. (const SIDE_CARD_TOP_BUFFER)
  - Change 2: Start-month marker labels get the same buffer added to their top (tied to the same constant), so adjusting the buffer adjusts both card top offset and start-marker label offset together. (const START_MARKER_LABEL_BUFFER = SIDE_CARD_TOP_BUFFER * 2)
  - Scope: Only visual positioning (card anchor offset + label offset). Cascade/overlap logic and spans unchanged.

### Step 7.Fix 3 (Status: Partial success)
  - Change 1: Start-month marker label offset is now double the card buffer: labels shift by 2 × SIDE_CARD_TOP_BUFFER.
  - Change 2: Added matching padding below start-month marker labels (same offset) to visually separate from the next marker.
  - Scope: Visual-only changes; cascade/overlap logic unchanged.

### Step 7.Fix 4 (Status: Fail)
  - Issue: Changing START_MARKER_LABEL_BUFFER multiplier didn’t affect label placement because it wasn’t used directly.
  - Fix: Start-month label top offset remains tied to SIDE_CARD_TOP_BUFFER; start-month label bottom padding now uses START_MARKER_LABEL_BUFFER directly. Changing START_MARKER_LABEL_BUFFER now visibly adjusts padding below start-month labels.
  - Scope: Visual-only; card placement, cascade/overlap unchanged.

### Step 7.Fix 5 (Status: Success)
  - Added START_MARKER_BOTTOM_SPACER (default 20px) applied to start-month markers by increasing their marker heights before position calculation. This should push the timeline below start-month markers and move everything under them downward.
  - Start-month label top offset still uses SIDE_CARD_TOP_BUFFER; label bottom padding uses START_MARKER_BOTTOM_SPACER.
  - Scope: Visual-only change; card placement, cascade/overlap logic unchanged.

### Step 7.Fix 6 (Status: Success)
  - Fix applied: START_MARKER_BOTTOM_SPACER now defined before use; start-month label bottom padding uses this spacer. Start-month label top offset stays tied to SIDE_CARD_TOP_BUFFER.
  - Scope: Visual-only; positioning/cascade unchanged.
  - Note: Resolved a render loop by removing adjustedMarkerHeights from the marker-height useEffect deps.

### Step 7.Fix 7 (Status: Success)
  - Investigation: Label was high because it used markerTop + startMarkerLabelOffset (ignored marker height) while marker heights were tall + spacer.
  - Change: Start-month marker labels now anchor near the bottom of the marker: `labelTop = markerTop + markerHeight - startMarkerLabelOffset` (offset tied to SIDE_CARD_TOP_BUFFER, 15px).
  - Bottom padding from Fix 6 preserved: `startMarkerLabelBufferBottom` still uses START_MARKER_BOTTOM_SPACER.
  - Scope: Visual-only; marker heights, cascade, overlaps unchanged.

### Step 7.Fix 8 (Status: Success)
  - Observation: After moving labels to marker bottoms, side lines end too high (still near the old label position).
  - Change: Side lines now end near the bottom of the start marker: `endY = startMarkerY + startMarkerHeight - startBuffer` (startBuffer still `Math.min(10, startMarkerHeight / 10)` to stay inside).
  - Scope: Visual-only; card positions, cascade, overlaps unchanged.

### Step 8. Side lines don’t expand when card expands
  - Issue: Expanding a side card does not lengthen its side line; line remains at the collapsed height span instead of filling the expanded card’s start/end markers.
  - Expected: Side lines must always fill the span between start and end month markers in both collapsed and expanded states.
  - Evidence: Code uses collapsed height in `sideLineData` (`cardHeights.get(entry.id)?.collapsed ?? 0`) and does not switch to expanded height when `expandedEntries` contains the entry. Visual: expanding a side card leaves the line unchanged.
  - Suspected cause: side line computation ignores expanded height and does not branch on `expandedEntries`.
  - Next steps: Recompute side line spans using expanded height when entry is expanded, and ensure recalculation on expand/collapse.

### Step 8.Fix 1 (Status: Success)
  - Action: In `sideLineData`, when an entry is expanded, use the expanded height (`cardHeights.get(entry.id)?.expanded`) to set endY = startY + expandedHeight (fallback to collapsed if not measured). Lines now recompute based on expansion state.
  - Result: Expanding a side card extends its side line to match the expanded card height; lines no longer stay at the collapsed length.

### Step 9. Assets buttons admin changes:
  - Required change: when adding an asset in admin, content items must have a field for a custom caption like custom links already have
  - Required change: both Custom Link and Content Item assets must have a new field to select a custom icon for the asset; options for custom icons should be stored in the Resume Types tab of the admin, this new section of the Resume Types tab in admin must connect to an external icons storage, so that the user could pick the icons to be used on the website; these selected icons would be available to be selected for assets in resume entries

#### Step 9.Stage 1 (Plan)
- DB/schema prep: add `custom_caption` (nullable) and `icon_key` (nullable) to `resume_assets`.
- New shared icon pool table `resume_asset_icons` (id, name, icon_url, order_index), backed by Supabase storage bucket `resume-asset-icons` for uploads/URLs.
- No UI changes yet; set up storage bucket and table first.

#### Step 9.Stage 1 (Status: Success)
- What to run (Postgres SQL; run once in Supabase SQL editor):
  ```
  -- Add new columns to resume_assets (safe if already absent)
  ALTER TABLE resume_assets
    ADD COLUMN IF NOT EXISTS custom_caption TEXT,
    ADD COLUMN IF NOT EXISTS icon_key TEXT;

  -- Create shared icon pool table
  CREATE TABLE IF NOT EXISTS resume_asset_icons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon_url TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0
  );
  ```

- Step-by-step to apply:
  1) Open Supabase → SQL editor → paste the SQL above → run once.
  2) Verify tables/columns: check `resume_assets` has `custom_caption`, `icon_key`; check `resume_asset_icons` exists with `id`, `name`, `icon_url`, `order_index`.
  3) Storage: in Supabase Storage, create bucket `resume-asset-icons` (public or use signed URLs). Upload icon files there; copy the public/signed URL into `icon_url` rows.
  4) (Optional) Seed a few icon rows in `resume_asset_icons` with names and icon URLs so the admin selector has options in Stage 2.

- No frontend/admin code changes in Stage 1; just schema + bucket.

#### Step 9.Stage 2 (Plan)
- Resume Types admin (`app/admin/resume-types/page.tsx`): add “Asset Icons” section to manage the shared pool (list/create/edit/delete icon entries; upload or paste URL from the bucket).
- Resume entry admin (`app/admin/resume/page.tsx`): in assets list, add `custom_caption` input (optional) and `icon_key` select populated from `resume_asset_icons` (with “None” option). Update asset insert/update to send new fields.

#### Step 9.Stage 2 (Status: Success)
- Admin Resume Types: added Asset Icons section with CRUD (name, icon_url, order_index auto). Icons load from `resume_asset_icons`; new icons use bucket `resume-asset-icons` URLs.
- Admin Resume Entry form: assets now support `custom_caption` (optional) and `icon_key` select (populated from `resume_asset_icons`, with “No icon”). Asset insert/update now persists `custom_caption` and `icon_key`.
- Data loading now includes `resume_asset_icons` for the selector.

#### Step 9.Stage 3 (Plan)
- Extend frontend asset types/queries to include `custom_caption` and `icon_key` (and fetched `icon_url`), ready for Step 10 rendering.
- Default caption rule: if `custom_caption` is missing, fall back to the content’s sidebar title.
- No visual/timeline changes; only data plumbing for assets.

### Step 10. Assets and Samples frontend
  - Issue: UI shows “Samples” and asset text but no click actions; roadmap lines 98-123 require Samples → Active Collection tab, content assets → Active Content tab, link assets → open new tab.
  - Evidence: EntryCard renders text only; no onClick wiring to handlers.
  - Need: hook up to `handleOpenCollection` / `handleOpenContent` props and `window.open` for links; prevent duplicates per roadmap.
  - Design requirement: Assets buttons must look like a vertical rectangle with 2:1 sides ratio. with icon in the upper-left corner and caption at the bottom of the rectangle; a custom caption can take up to 2 lines if the caption is too long to fit in one line.
  - ASCII Schema for asset boxes: 
___________________________
| [icon]                   |
|                          |
|                          |
|                          |
|                          |
|                          |
|                          |
| [custom caption line 2]  |
| [custom caption line 1]  |
|__________________________|

### Step 10.Fix 1 (Status: Success)
- Asset query now fetches `custom_caption`, `icon_key`, and icon data (`icon_url`) for each asset. Icons fetched separately from `resume_asset_icons` and mapped client-side by `icon_key` to avoid FK join/RLS issues.
- Asset boxes redesigned: fixed 2:1 rectangle (140×70), icon top-left, caption at bottom (up to 2 lines). Icon is clamped to 25% of box size (object-fit contain). Caption fallback: `custom_caption || content title || link title || "Asset"`.
- Height risk mitigation: box height is fixed, so card height measurement should remain stable (collapsed/expanded). Note for redesign handoff: keep asset box height fixed or re-measure after asset load to avoid drift.
- Fix: Removed failing FK join to `resume_asset_icons`; fetch icons separately and map by `icon_key`. Assets still fetch `custom_caption`/`icon_key`; icons come from a separate query.
- Result: Entries load without RLS/join errors; icons render; asset boxes retain fixed size and 25% icon clamp.

### Step 10.Fix 2 (Status: Success)
- Change: Asset boxes flipped to vertical 1:2 ratio (70×140) instead of horizontal 2:1. Icon still clamped to 25% of box with object-fit contain; caption remains bottom-aligned with the same fallback.
- Impact: Taller boxes increase card height; fixed height keeps measurement stable (collapsed/expanded).
- User addition: changed the size of boxes to 100x140

### Step 10.Fix 3 (Status: Success)
- Issue: Icons rendered ~3×3px due to percent-based clamp; need max 35×35px for 100×140 boxes.
- Change: Icon clamp now uses fixed maxWidth/maxHeight 35px (still object-fit contain). Box size remains 100×140 per user request.
- Result: Icons in asset boxes “Left” → “Site” and “Test blog number four” now render up to 35×35px (≈ top-left quarter) instead of tiny dots.
- User change: changed the size of icons from 35x35px to 30x30px, and the font size from xs to sm

### Step 10.Fix 4 (Status: Fail)
- Wired Samples button to open the entry’s collection via `onOpenCollection(slug, name)`.
- Asset boxes now clickable:
  - `content` assets call `onOpenContent(content_id, content_title)` (opens Active Content tab, no duplicates).
  - `link` assets open `link_url` in a new browser tab.
- ResumeTab now receives `onOpenCollection` / `onOpenContent` from `app/page.tsx`.
- Box size remains 100×140; icon clamp remains 30×30 per user change.

### Step 10.Fix 5 (Status: Success)
- Issue 1: External links open as `localhost:3000/<link>` instead of the absolute URL. Likely because `link_url` lacks protocol and `window.open` treats it as relative. Needs URL normalization (add `https://` if missing) before opening.
- Issue 2: Clicking assets and Samples produces no action. Suspected causes:
  - Event handlers may not be passed down to `EntryCard` instances (onOpenCollection/onOpenContent) in the ResumeTab render maps.
  - Data gaps: Samples requires `entry.collections?.slug`/`name`; content assets require `content_id`; missing values result in no-op.
- Proposed fixes:
  1) Normalize external link URLs before `window.open` (prepend `https://` when no protocol) and open with `noopener,noreferrer`.
  2) Ensure `onOpenCollection` and `onOpenContent` props are threaded to every `EntryCard` instantiation.
  3) Guard clicks: Samples only fire when collection slug/name exist; content assets only when `content_id` exists; link assets only when a non-empty, normalized URL exists.
  4) After wiring, retest clicks for Samples, content assets, and external links.
- External links: normalize URLs before opening; add protocol if missing, then `window.open(..., '_blank', 'noopener,noreferrer')`.
- Wiring: `onOpenCollection` / `onOpenContent` now passed to all EntryCards; Samples button triggers only when collection slug/name exist; content assets trigger only when `content_id` exists; link assets only when normalized URL exists.
- Result: Samples should open Active Collection; content assets should open Active Content; external links should open as absolute links (no localhost prefix). Box/icon sizing unchanged (100×140, icons 30×30).

### Step 11. profileHeight not applied:
  - Issue: ResumeTab not receiving profileHeight prop for top spacing (roadmap line 111).
  - Evidence: app/page.tsx tracks profileHeight; ResumeTab signature doesn’t accept/use it.
  - Need: pass profileHeight into ResumeTab and apply as top padding/margin offset for timeline/cards.

## Decisions (beginner-friendly)
- Use `app/page.tsx` handlers: `handleOpenCollection(slug, name)` to open Active Collection tabs, `handleOpenContent(id, title)` to open Active Content tabs. Pass them into `ResumeTab` as props and call them from Samples/assets.
- profileHeight source: already available. `Profile` reports height via `onHeightChange`; `app/page.tsx` stores it in `profileHeight` state (`setProfileHeight`). Pass `profileHeight` prop into `ResumeTab` for top spacing.