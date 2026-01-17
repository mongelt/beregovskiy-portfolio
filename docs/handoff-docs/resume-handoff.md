## Resume Tab Handoff

Purpose: reference for code review, mobile prep, and visual redesign. Keep logic intact; only visuals may change per roadmap constraints.

Key files
- `components/tabs/ResumeTab.tsx` – all resume logic (data load, transforms, timeline, rendering).
- `app/page.tsx` – passes `onOpenCollection`, `onOpenContent` into ResumeTab; will also pass `profileHeight` in Phase 4.
- Admin: `app/admin/resume/page.tsx` (assets: custom_caption, icon_key) and `app/admin/resume-types/page.tsx` (asset icon pool).

Component structure (ResumeTab.tsx)
- `ResumeTab` (root): loads data, transforms, splits into side/center entries, calculates marker heights/positions, builds side lines, renders Timeline + EntryCards.
- `Timeline`: renders month markers, side lines; takes markerHeights/markerPositions/timelineHeight, start-side markers, label offsets/buffers, sideLineData.
- `MonthMarker`: draws marker and label; label may be bottom-anchored for start markers with offsets/buffers.
- `SideLine`: draws colored line with fade between start/end Y.
- `EntryCard`: renders date/title/subtitle/description/assets/controls; measures height (collapsed/expanded), handles clicks.
- `DebugWindow` (optional): shows debug info when enabled.

Data shapes (loaded)
- `resume_entries` (featured only in current query): fields include id, entry_type_id, title, subtitle, date_start, date_end, description (EditorJS), short_description, collection_id, is_featured, order_index.
- Joins:
  - `resume_entry_types` (name: Left Side | Right Side | Center; icon unused in layout except type mapping).
  - `collections` (name, slug) for Samples.
  - `resume_assets`: id, asset_type ('content' | 'link'), content_id, link_url, link_title, order_index, custom_caption, icon_key, content(id,title,type). Icons mapped client-side via `resume_asset_icons`.
- `resume_asset_icons` loaded separately, mapped by icon_key to get name, icon_url, order_index.

Transforms and positioning
- Position mapping: entry_type_name → left/right/center (default right).
- Date normalization: start/end → first day of month in EST. Center entries missing end → use start as end.
- Month counting: inclusive between start/end months; used for per-month height.
- Standard card: chosen entry for `standardHeight` reference.
- Marker heights: per-month max of (entry height ÷ month span) vs standardHeight; includes adjustments for cascade/detachments.
- Marker positions: cumulative sum of marker heights; `TIMELINE_TOP_OFFSET = 35` added for layout.
- Cascade/overlap (side): entries ordered by Y; cascade pushes lower entries down to avoid overlap; side lines follow adjusted positions.
- Center positioning: `centerEntryAdjustedPositions` centers entry within marker span when available; fallback to end marker top.

Markers and labels
- Start-month labels for side cards anchored near marker bottom: `labelTop = markerTop + markerHeight - startMarkerLabelOffset`; `startMarkerLabelOffset = SIDE_CARD_TOP_BUFFER = 15`.
- Extra bottom spacer for start markers: `START_MARKER_BOTTOM_SPACER = 20` applied to marker height and label margin-bottom.
- Marker heights can expand from tall cards; bottom spacer further increases separation below start markers.

Side lines
- Y-span bounded inside markers with clamped buffers:
  - endBuffer = min(20, endMarkerHeight/1)
  - startBuffer = min(10, startMarkerHeight/10)
  - Present (no end_date) starts at marker top (no buffer)
- startY near end marker top (or exact for Present); endY near start marker bottom.
- Fade: 15px at both ends via linear gradient.
- Color: deterministic by display order (top-to-bottom) using `SIDE_LINE_COLORS`; x-offset: left -10px, right +10px.

Entry cards layout and sizing
- Side cards: width 560px, absolute positioned at calc(50% ± 70px); center cards centered.
- Asset boxes: fixed 100×140 (vertical); icons max 30×30 (`object-fit: contain`); caption text-sm, 2-line area bottom-aligned.
- Height measurement:
  - Collapsed: measure once on mount via `getBoundingClientRect().height`.
  - Expanded: measure after expand; side cards wait for EditorJS ready; uses `requestAnimationFrame`.
  - Heights stored in `cardHeights` (collapsed/expanded) and drive marker height recalcs.
- Keep asset boxes fixed-height to avoid measurement drift; if changing heights later, remeasure or keep fixed sizing.

Interactions
- Samples: if collection slug/name exists, call `onOpenCollection(slug,name)` to open Active Collection tab (no duplicates).
- Content asset: if content_id exists, call `onOpenContent(id,title)` to open Active Content tab (no duplicates).
- Link asset: normalize URL (prepend https:// if missing) then `window.open(normalized, '_blank','noopener,noreferrer')`.
- Expand toggle: remeasures on expand; no logic changes.

Styling knobs (can be restyled; keep logic)
- Offsets/buffers: TIMELINE_TOP_OFFSET=35; SIDE_CARD_TOP_BUFFER=15; START_MARKER_BOTTOM_SPACER=20; side line buffers (endBuffer/startBuffer formulas above); fade length 15px.
- Sizes: side card width 560px; positioning calc(50% ± 70px); asset box 100×140; icon clamp 30×30; caption text-sm.
- Line colors: `SIDE_LINE_COLORS` palette; markers use green/blue classes; fades use current color → transparent.
- Typography: marker labels, captions, body text can be restyled; maintain positioning logic.

Debug hooks
- `debugSettings` (localStorage): showDebugWindow, showAllMarkers. DebugWindow shows marker counts, heights, positions, entries, etc.

Mobile considerations (Phase 8)
- Roadmap: hide timeline (no markers/lines) on mobile; cards stack full-width; Samples hidden; content assets may switch tabs automatically (to be added then).
- Audit hardcoded widths/positions: 560px side cards, calc(50% ± 70px), fixed asset boxes, timeline centering; adjust or conditionalize for mobile.

Constraints for redesign (Phases 9–10)
- Keep logic and layout relationships: marker/line/card alignment, cascade, month spans, offsets.
- Safe to change: colors, borders, shadows, typography, fades, minor spacing; animations (without altering logic/timing of measurements).
- If changing asset box/icon sizes: keep fixed heights or re-trigger measurements to avoid marker mis-sizing.

Testing checklist (before/after visual changes)
- Card heights remeasure correctly after expand/collapse with asset boxes in place.
- Side lines stay within start/end markers after style changes.
- Start labels remain bottom-anchored with buffers applied.
- Links open as absolute URLs after normalization.
- Samples/content assets open correct tabs; no duplicates; external links open new tab.
- Debug modes still functional (markers/all-markers).
Data loading
- Query: featured resume entries with joins: `resume_entry_types` (position), `collections` (slug, name), `resume_assets` (content/link data, custom_caption, icon_key, order_index), `content(id,title,type)`.
- Icons: loaded separately from `resume_asset_icons` and mapped by `icon_key` client-side to avoid FK/RLS issues.

Transforms and positioning
- Position mapping: entry_type_name → left/right/center (fallback right).
- Date normalization: start/end to first of month (EST). Center entries missing end → treat start=end.
- Month counting: inclusive; marker heights per-month based on entry height ÷ months.
- Marker heights: `calculateMarkerHeightsWithAdjustments` picks max per-month requirement; `standardHeight` from a “standard card.”
- Marker positions: cumulative sum of marker heights; `TIMELINE_TOP_OFFSET = 35` shared.
- Cascading/overlap (side): entries sorted by Y; cascade pushes cards down to avoid overlaps; side lines share positions.
- Center positioning: center entries placed within marker span (`centerEntryAdjustedPositions`).

Side markers/labels
- Start-month labels anchored near marker bottom: `labelTop = markerTop + markerHeight - startMarkerLabelOffset`; `startMarkerLabelOffset = SIDE_CARD_TOP_BUFFER = 15`.
- Extra marker bottom space for start markers: `START_MARKER_BOTTOM_SPACER = 20`.
- Label margin-bottom uses `START_MARKER_BOTTOM_SPACER`.

Side lines
- Uses marker positions/heights; start/end buffers clamp to marker height: `endBuffer = Math.min(20, endMarkerHeight/1)`; `startBuffer = Math.min(10, startMarkerHeight/10)` (present entries drop buffer at top).
- Side lines span startY near end marker top (or exact for Present) to endY near start marker bottom; no overshoot past markers.
- Fade: 15px at both ends (linear gradient). Color deterministic by display order (top-to-bottom) from `SIDE_LINE_COLORS`.
- Horizontal offset: ±10px from center (left/right).

Entry cards
- Width: side cards `w-[560px]`; positioned absolute left/right; center cards centered.
- Height measurement: collapsed measured once on mount; expanded measured after expand (side waits for EditorJS ready). Uses `getBoundingClientRect().height`, stored in `cardHeights` (collapsed/expanded).
- Timeline adjusts marker heights using measured heights; fixed-size asset boxes help keep measurement stable.

Assets and Samples (Step 10)
- Asset boxes: fixed 100×140 (vertical); icons max 30×30 (user change), `object-fit: contain`; caption `text-sm`, 2-line area bottom-aligned.
- Clicks:
  - Samples: opens collection via `onOpenCollection(slug,name)` (only if slug/name exist).
  - Content asset: `onOpenContent(content_id, title)`; no duplicates.
  - Link asset: normalize URL (prepend https:// if missing) then `window.open(..., '_blank','noopener,noreferrer')`.
- Caption fallback: `custom_caption || content title || link title || "Asset"`.

Constants / visual knobs (ResumeTab.tsx)
- `TIMELINE_TOP_OFFSET = 35`
- `SIDE_CARD_TOP_BUFFER = 15` (start marker label offset)
- `START_MARKER_BOTTOM_SPACER = 20`
- Asset box: 100×140; icon clamp 30×30; caption `text-sm`
- Side line buffers: `endBuffer = min(20, endMarkerHeight/1)`; `startBuffer = min(10, startMarkerHeight/10)`; fade 15px; x-offset ±10px
- Start labels at marker bottom: use `startMarkerLabelOffset`, `startMarkerLabelBufferBottom`

Mobile considerations (Phase 8)
- Roadmap: hide timeline (no markers/lines) on mobile; cards full-width stack; Samples hidden; content assets switch to Portfolio tab and auto-select content (logic to be added then).
- Identify hardcoded widths/positions for mobile audit: side card width 560px, calc(50% ± 70px), timeline offsets, asset box fixed size; timeline container absolute center.

Redesign notes (Phase 9–10)
- Preserve logic/order/layout relationships; only visual tweaks allowed.
- Elements to restyle: colors (backgrounds, text, borders), line/fade colors, card borders/shadows, marker colors/opacity, label typography, asset box colors/borders/shadows.
- Keep fixed heights for asset boxes to avoid remeasuring; if changed, ensure remeasure or fixed sizing to keep timeline stable.
- Animations: expand/collapse already has smooth top transition; can style but not alter logic.

Interactions summary
- Samples → collection tab; no-op if slug/name missing.
- Content asset → Active Content tab (no duplicates).
- Link asset → external tab (normalized URL).
- Expand button toggles card height measurement (collapsed/expanded).

Testing checklist (for Phases 7–10)
- Verify card height remeasures after expand/collapse with asset boxes present.
- Verify side line spans stay within markers after visual tweaks.
- Verify start labels remain bottom-anchored with buffers.
- Verify link normalization opens absolute URLs.
- Verify Samples/asset clicks open correct tabs; no duplicates.
