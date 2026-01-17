# Beregovskiy Portfolio - Modern Next.js Edition

Professional portfolio website built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Storage:** Cloudinary
- **Rich Text:** Editor.js
- **Authentication:** Supabase Auth

## 📁 Project Structure

```
beregovskiy-portfolio/
├── app/                    # Next.js app directory
│   ├── (public)/          # Public pages
│   ├── admin/             # Admin panel (protected)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # Shadcn/ui components
├── lib/                   # Utilities and helpers
│   └── supabase/         # Supabase client setup
├── DATABASE_SETUP.md      # Database schema instructions
├── CUSTOM_PDFS_SETUP.md   # Custom PDFs feature setup
├── create-custom-pdfs-table.sql  # SQL script for custom PDFs
└── .env.local            # Environment variables
```

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:
- Supabase URL and Key (already configured)
- Cloudinary credentials

### 3. Set Up Database
Follow instructions in `DATABASE_SETUP.md`

### 4. Set Up Custom PDFs Feature (Optional)
Follow instructions in `CUSTOM_PDFS_SETUP.md` to enable PDF uploads

### 5. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## 📊 Features

### Content Management
- ✅ Articles with rich text (Editor.js)
- ✅ Image galleries
- ✅ Video embeds
- ✅ Audio players
- ✅ Categories & subcategories
- ✅ Collections (curated content)

### Resume & Profile
- ✅ Expandable business card header
- ✅ Interactive timeline (2025→2010)
- ✅ Multiple resume entry types
- ✅ PDF downloads

### Admin Panel
- ✅ Full CRUD operations
- ✅ Content editor with Editor.js
- ✅ Media uploads
- ✅ Profile management
- ✅ Collections manager

## 🎨 Design System

Using Shadcn/ui components with dark mode support.
Color scheme and typography can be customized in:
- `app/globals.css` - CSS variables
- `tailwind.config.ts` - Tailwind theme

## 🔐 Authentication

Admin panel protected with Supabase Auth (not implemented).
Public content is accessible without authentication.

## 🚢 Deployment

Ready to deploy to:
- Vercel (recommended)
- Netlify
- Any Node.js hosting

## 📝 Development Workflow

1. Create features in phases (see roadmap)
2. Test locally with `npm run dev`
3. Build for production: `npm run build`
4. Deploy to production

## 🐛 Troubleshooting

**Build Errors:**
- Check Node.js version (18+)
- Clear `.next` folder: `rm -rf .next`
- Reinstall: `rm -rf node_modules package-lock.json && npm install`

**Database Issues:**
- Verify environment variables
- Check Supabase SQL editor for errors
- Ensure RLS policies are set correctly

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [Editor.js](https://editorjs.io)

---

Built with ❤️ using modern web technologies
