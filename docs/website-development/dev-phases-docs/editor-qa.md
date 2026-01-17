## Editor.js QA notes (Phase 1) – findings and staged fixes

### Overview
- Scope: Public renderer (`EditorRenderer.tsx`), admin editor (`components/editor/EditorJS.tsx`), media helpers (Audio/Video editors and players).
- Goal: Fix read-only safety, inline toolbar mismatch, link preview noise, missing env vars handling, and UX gaps when optional plugins fail to load. No code changes applied yet.

### Stage 1 — Low-risk, do together
What to change
- Button plugin in renderer: Set `AnyButton.isReadOnlySupported = true` after loading, before registering. Prevents read-only errors.
- Strikethrough inline toolbar guard: Only include `strikethrough` in inlineToolbar arrays when the plugin actually loaded (for `header` and `paragraph` in renderer).
- Link tool in renderer: Remove `linkTool` from the public renderer (read-only view doesn’t need link previews and the endpoint may not be public).
- Cloudinary env checks: In admin editor, AudioEditor, VideoEditor — before upload, verify `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`; if missing, show a clear UI error and abort upload. Also surface fetch/upload failures with a friendly message.

Why together
- All are small, independent, and low-risk; batching keeps context in one review/test cycle.

How to test (after implementing)
- Render an article with buttons and strikethrough text: confirm it displays without console errors in public view.
- Try a link block in public view: ensure no background requests to `/api/link-preview` (since link tool removed).
- Temporarily unset Cloudinary env vars (in a safe test env) and attempt image/audio/video upload: confirm a clear error message and no crash; then set vars and verify uploads succeed.

### Stage 2 — UX notice for optional plugins (optional but helpful)
What to change
- When `gallery` or `columns` dynamic import fails in admin or renderer, show a small in-app notice (banner or inline alert) saying the plugin failed to load and to refresh/contact support. Keep existing console warnings.

Why separate
- Pure UX; safe but adds UI text. Do after Stage 1 so core fixes are verified.

How to test
- Simulate a failed dynamic import (e.g., temporarily mock the import to throw) and confirm the notice appears without breaking the editor; normal load path remains unchanged.

Status: Implemented
- Admin editor (`components/editor/EditorJS.tsx`): Adds a yellow warning banner if columns or gallery fails to load.
- Public renderer (`components/EditorRenderer.tsx`): Adds a yellow warning banner if columns or gallery fails to load.
- Behavior: Only appears when a plugin import fails; otherwise no UI change. Existing console warnings remain.

### Stage 3 — Optional polish for renderer flicker
What to change
- Debounce or memoize renderer re-initialization so rapid content switches don’t repeatedly destroy/recreate the Editor.js instance (reduces “Loading content…” flicker).

Why separate
- Touches lifecycle/behavior; do only if flicker is a real issue.

How to test
- Rapidly switch between content items; confirm reduced flicker and no regression in rendering.

Status: Implemented (debounced)
- `components/EditorRenderer.tsx`: Adds a 150ms debounce before initializing the renderer after data changes, to reduce flicker and repeated init logs during fast tab/content switches.

Notes
- Accordion/toggle and drag&drop are intentionally out of scope (not required anymore, per user). 
- No code or config changes have been applied yet; this file only records findings and the staged plan.

### Stage 4 — Image block parity (implemented)
Changes
- Renderer adds minimal styles so Image tool captions, borders, backgrounds, and stretch behave closer to admin.
- Standalone image content no longer forces full width; centers with natural sizing.

Test notes
- Stretched images should fill width; non-stretched should respect defaults; captions readable; border/background visible if enabled.

### Stage 5 — Embed responsiveness and captions (implemented)
Changes
- Added responsive wrapper CSS for embeds (16:9 default) to avoid overflow and fixed-height issues; caption styling aligned.

Test notes
- Embed blocks should resize fluidly; captions readable. Check YouTube/Vimeo and a non-16:9 embed on different viewport widths.


## New findings: Image and Embed plugins (captions, sizing consistency)

### Stage 4 — Image block parity (safe bundle)
What to fix
- Respect stretch setting: Public render currently forces images to `w-full`, so even non-stretched images appear full width. Make rendering respect the saved stretch flag from the Image tool.
- Caption/border/background styling parity: Admin enables caption/background/border/stretch; public render uses defaults, so captions can look unstyled/cramped. Add minimal styles to match admin expectations.

Why it’s safe to bundle
- Both are renderer-only visual fixes; low risk and small scope.

How to test
- In admin: create two images, one stretched, one not, with captions. In public view, confirm stretch matches, captions appear with sensible spacing, and borders/background (if enabled) look reasonable.

### Stage 5 — Embed responsiveness and captions (safe bundle)
What to fix
- Responsive sizing: Current embeds use service defaults/fallback with fixed heights (e.g., 320px) and no aspect-ratio wrapper. Wrap embeds in a responsive container with a sane aspect ratio and ensure width/height adjust fluidly.
- Caption styling: Ensure embed captions have consistent spacing/typography in public view (match or approximate admin look).
- Fallback iframe: Avoid hardcoded heights; use responsive wrapper here too.

Why it’s safe to bundle
- Purely renderer-side presentation; doesn’t change admin editing or data.

How to test
- Create embeds for YouTube/Vimeo + a social/embed that produces non-16:9 aspect. In public view, confirm no overflow, correct aspect, and captions display cleanly. Resize browser to verify responsiveness.

### Stage 6 — (Optional) Cross-check admin-display alignment
What to fix (only if gaps remain)
- If, after Stages 4–5, admin preview still looks meaningfully different from public render for images or embeds, add a small alignment pass (spacing/typography tweaks) so editors see what end-users see.

Why separate
- Only needed if residual differences matter; keeps core fixes focused in 4–5.

How to test
- Repeat the same image/embed examples side-by-side (admin vs. public) and confirm visuals match closely.
