# Beregovskiy Portfolio Website

Beginner-friendly guide to understand the system, where key files live, and how the admin side works.

## What this project includes
- Public site with Profile, Portfolio, and Resume tabs.
- Admin panel to manage content, collections, resume entries, and profile data.
- Small backend services for link preview and PDFs.

## Tech stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Database and auth: Supabase (PostgreSQL + Auth)
- Media storage: Cloudinary
- Rich text: Editor.js

## Project structure (where to look)
- `app/` — All routes and pages.
  - `app/page.tsx` — Main public page.
  - `app/layout.tsx` — Root layout.
  - `app/globals.css` — Global styles.
  - `app/admin/*` — Admin pages.
  - `app/api/link-preview/route.ts` — Link preview API for Editor.js.
- `components/` — UI and page logic.
  - `components/BottomTabBar.tsx` — Main tab navigation.
  - `components/Profile.tsx` — Profile header.
  - `components/tabs/PortfolioContent.tsx` — Portfolio menus and reader.
  - `components/tabs/ResumeTab.tsx` — Resume timeline and cards.
  - `components/ContentReader.tsx` — Displays selected content.
  - `components/InfoMenu.tsx` — Content metadata panel.
  - `components/EditorRenderer.tsx` — Renders Editor.js blocks.
  - `components/editor/EditorJS.tsx` — Admin editor setup.
- `lib/` — Shared helpers.
  - `lib/supabase/*` — Supabase client/server setup.
  - `lib/pdf-generator.ts` — PDF generation.
- Setup and database docs:
  - `DATABASE_SETUP.md`
  - `CUSTOM_PDFS_SETUP.md`
  - `create-custom-pdfs-table.sql`

## Admin panel (what it manages)
- Content items (articles, media, and metadata).
- Categories and subcategories.
- Collections (curated groups of content).
- Resume entries and resume assets.
- Profile information and contact details.
- Custom PDFs for download.

Admin pages live under `app/admin/*` and use Supabase Auth for access control.

## Backend and API
- Supabase provides the database, auth, and storage.
- Next.js API route at `app/api/link-preview/route.ts` supports Editor.js link previews.

## Databases and storage
- Supabase tables store content, categories, collections, resume entries, and profile data.
- Cloudinary stores uploaded media (images, audio, video).
- RLS policies should be configured in Supabase (see `DATABASE_SETUP.md`).

## Editor.js usage
- Public renderer: `components/EditorRenderer.tsx`
- Admin editor: `components/editor/EditorJS.tsx`
- Link tool API: `app/api/link-preview/route.ts`

## Quick start (if you need to run the project)
1. Install dependencies: `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in Supabase + Cloudinary keys.
3. Follow `DATABASE_SETUP.md` and `CUSTOM_PDFS_SETUP.md` if needed.
4. Run dev server: `npm run dev`
5. Open http://localhost:3000

## Credits
1. Main menu: Framer Motion
2. Download button original by vinodjangid07 / UIVerse
3. Profile Tab Hover Effects: Magic Card https://magicui.design/docs/components/magic-card and Dot Pattern https://magicui.design/docs/components/dot-pattern 
4. Bottom nav hover effect original by WhiteNervosa / UIVerse https://uiverse.io/WhiteNervosa/popular-ladybug-27
5. Loader original by Nawsome / UIVerse https://uiverse.io/Nawsome/kind-mole-87
Website uses official logos of Johns Hopkins University, Axway, Inc., The LCB