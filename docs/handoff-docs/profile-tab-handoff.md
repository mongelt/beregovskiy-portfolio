# Profile Tab Handoff (Phases 7–10)

## Purpose
Quick reference for redesign, mobile, and code-review phases (7–10). Describes current Profile tab data, layout, behaviors, and constraints.

## Data & Sources
- Profile table fields used: `full_name`, `location`, `job_title_1..4`, `profile_image`, `short_bio` (EditorJS), `full_bio` (EditorJS), `email`, `phone`, `linkedin`, `show_email`, `show_phone`, `show_social_media`, `languages` (text[]), `education` (text), `collapsed_profile_height` (int, optional).
- Skills: table `profile_skills` (id, profile_id, skill_name, collection_id, order_index). Joined to `collections` for slug/name. Skills render as pills; if linked to a collection and handler present, click opens Active Collection tab.
- Loaded via Supabase client on the frontend.

## Layout (Desktop)
- Collapsed header (sticky top):
  - Left: name (uppercased), location, up to 4 job titles.
  - Right: short bio (EditorJS rendered).
  - Expand button centered, 15px above bottom.
  - Optional `collapsed_profile_height` caps height and clips overflow when collapsed.
- Expanded state:
  - Overall max-height: `calc(100vh - BOTTOM_NAV_HEIGHT_PX)`; `BOTTOM_NAV_HEIGHT_PX` constant in `Profile.tsx` (currently 64px; adjust if bottom nav height changes).
  - Two-column grid: left 2/3, right 1/3.
    - Left: About (full bio, fallback to short bio). About container currently unclamped (previous clamp attempts reverted); padding tightened (mt-4 pt-4, pb-3, gap-6).
    - Right: Education (if present), Skills (pills; linked pills are clickable if handler provided), Languages (pills).
  - Contact row (phone, email, LinkedIn) rendered in one row if values present; sits immediately after content (no spacer).
  - Collapse button at bottom of expanded content (“COLLAPSE”).

## Behaviors
- Expand/Collapse toggles: EXPAND in collapsed header; COLLAPSE at bottom when expanded.
- Contact items hide if data is missing; no heading.
- Skills: clickable only when collection link exists and `onOpenCollection` provided; otherwise plain pill.
- Height measurement: `Profile` reports its rendered height via `onHeightChange` to the parent for downstream layout.

## Styling Notes
- EditorJS public render uses `.codex-editor__redactor` with padding-bottom 5px (set in `app/globals.css`). EditorJS still has its own default min-height (300px) from upstream CSS; not overridden here.
- Text colors: name/title white; body text gray-300/400; buttons emerald-400/300 hover.

## Mobile (Phase 8 prep considerations)
- Collapsed height clamp should still apply; ensure sticky behaviors don’t conflict with mobile bottom nav (icon-only per roadmap).
- Contact row must remain visible; if scroll needed, keep content scrollable above contact row.
- Grid likely stacks (1 column); preserve order: About, Education, Skills, Languages, then contact row, then collapse button.
- Ensure EditorJS content doesn’t force oversized height on small screens (consider future clamp or better min-height handling if needed).

## Redesign (Phases 9–10) Guidance
- Keep structure and behaviors: two-column proportions (2/3, 1/3), contact row always visible, skills pills clickable when linked, expand/collapse text/positions.
-,Colors/fonts/spacings can change in redesign; logic must remain intact.
- If adjusting bottom nav height, update `BOTTOM_NAV_HEIGHT_PX` to keep expanded max-height correct.

## Open Notes / Risks
- EditorJS default min-height (300px) not overridden; if future gaps reappear, consider a targeted min-height reduction in display context only.
- `collapsed_profile_height` is optional; when set very small, content clips as intended.
- Contact row relies on data presence; ensure admin forms provide these fields.

## Handlers / Integration Points
- Props to `Profile`: `onHeightChange` (reports measured height), `onOpenCollection` (opens Active Collection when skills are linked).
- Parent `app/page.tsx` passes `onOpenCollection`; Active Collection tabs open on skill click when linked.
