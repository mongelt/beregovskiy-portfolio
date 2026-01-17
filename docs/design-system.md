# Design System Documentation

## Overview

This design system is based on the Figma mockup and provides a comprehensive foundation for building beautiful, consistent, and accessible UI components with smooth animations.

**Design Source:** Figma - Convert Page Design Draft

---

## 🎨 Color Palette

### Brand Colors

Primary blue palette for main brand elements, CTAs, and interactive components.

```tsx
// Usage examples
className="bg-brand-500"      // Main brand blue
className="bg-brand-600"      // Hover state
className="text-brand-400"    // Text accent
className="border-brand-700"  // Border/divider
```

**Available shades:** 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

### Accent Colors

Additional colors for visual variety and semantic meaning.

```tsx
className="bg-purple-500"  // Collections, creative elements
className="bg-green-500"   // Success states, positive actions
className="bg-orange-500"  // Warnings, highlights
className="bg-pink-500"    // Special features, favorites
```

**Available shades for each:** 500, 600, 700

### Shadcn/UI Colors

Semantic colors from shadcn/ui (uses CSS variables).

- `primary` - Main actions
- `secondary` - Secondary actions
- `destructive` - Delete/remove actions
- `muted` - Disabled/subtle elements
- `accent` - Highlights
- `card` - Card backgrounds
- `popover` - Dropdown/modal backgrounds

---

## 📝 Typography

### Font Families

Two carefully selected fonts from Figma design:

```tsx
// Space Grotesk - All text (weights: 300, 400, 500, 600, 700)
className="font-sans"

// JetBrains Mono - Code and technical content (weights: 300, 400, 500)
className="font-mono"
```

**Google Fonts Import:**
- Space Grotesk: Primary font for all UI elements
- JetBrains Mono: Monospace font for code snippets

### Type Scale

Consistent sizing for hierarchical typography:

```tsx
className="text-xs"    // Caption text (0.75rem)
className="text-sm"    // Small text (0.875rem)
className="text-base"  // Body text (1rem) - DEFAULT
className="text-lg"    // Large body (1.125rem)
className="text-xl"    // Emphasized text (1.25rem)
className="text-2xl"   // Small headings (1.5rem)
className="text-3xl"   // Medium headings (1.875rem)
className="text-4xl"   // Large headings (2.25rem)
className="text-5xl"   // Extra large headings (3rem)
className="text-6xl"   // Hero text (3.75rem)
```

### Font Weights

```tsx
className="font-normal"    // 400
className="font-medium"    // 500
className="font-semibold"  // 600
className="font-bold"      // 700
```

### Usage Examples

```tsx
// Hero section (Space Grotesk)
<h1 className="text-6xl font-sans font-bold text-white">
  Your Portfolio
</h1>

// Section heading (Space Grotesk)
<h2 className="text-3xl font-sans font-semibold text-white">
  Recent Projects
</h2>

// Body text (Space Grotesk)
<p className="text-base font-sans text-gray-400">
  Description text goes here...
</p>

// Emerald accent text (from Figma)
<p className="text-emerald-400">
  Highlighted text
</p>

// Code snippets (JetBrains Mono)
<code className="text-sm font-mono text-emerald-400">
  const example = true
</code>
```

---

## 📏 Spacing

### Custom Spacing Values

Extended spacing scale for larger layouts:

```tsx
className="p-18"   // 4.5rem (72px)
className="w-88"   // 22rem (352px)
className="h-112"  // 28rem (448px)
className="m-128"  // 32rem (512px)
```

### Standard Spacing

Tailwind's default spacing scale (0-96) is available:

```tsx
className="p-4"   // 1rem (16px)
className="m-8"   // 2rem (32px)
className="gap-6" // 1.5rem (24px)
```

---

## 🔲 Border Radius

### Available Sizes

```tsx
className="rounded-sm"   // calc(var(--radius) - 4px)
className="rounded-md"   // calc(var(--radius) - 2px)
className="rounded-lg"   // var(--radius)
className="rounded-xl"   // 0.75rem (12px)
className="rounded-2xl"  // 1rem (16px)
className="rounded-3xl"  // 1.5rem (24px)
className="rounded-4xl"  // 2rem (32px) - CUSTOM
className="rounded-full" // 9999px (perfect circle)
```

---

## 🎬 Animations

### Using Framer Motion

Import animation variants from `lib/animations.ts`:

```tsx
import { fadeInUp, staggerContainer, hoverScale } from '@/lib/animations'
import { motion } from 'framer-motion'

// Basic fade in animation
<motion.div
  variants={fadeInUp}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>

// Stagger children animation
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.content}
    </motion.div>
  ))}
</motion.div>

// Hover effects
<motion.button
  whileHover={hoverScale}
  whileTap={tapScale}
>
  Click Me
</motion.button>
```

### Available Animation Variants

**Entry Animations:**
- `fadeIn` - Simple opacity fade
- `fadeInUp` - Fade in from below
- `fadeInDown` - Fade in from above
- `scaleIn` - Scale from 80% to 100%
- `slideInLeft` - Slide in from left
- `slideInRight` - Slide in from right

**Container Animations:**
- `staggerContainer` - Container for staggered children
- `staggerItem` - Child items (use with staggerContainer)

**Interactive Animations:**
- `hoverScale` - Scale up on hover
- `hoverLift` - Lift up on hover
- `tapScale` - Scale down on tap

**Transition Animations:**
- `tabTransition` - Tab switching animation
- `expandCollapse` - Accordion animation
- `modal` - Modal/dialog animation
- `backdrop` - Backdrop overlay animation
- `pageTransition` - Page transition

**Loading Animations:**
- `spinner` - Rotation animation
- `pulse` - Pulsing opacity

### Tailwind CSS Animations

Simple animations without Framer Motion:

```tsx
className="animate-fade-in"    // Fade in
className="animate-slide-up"   // Slide up
className="animate-slide-down" // Slide down
className="animate-scale-in"   // Scale in
```

### Reduced Motion

All animations automatically respect `prefers-reduced-motion`:

```tsx
import { getMotionVariants } from '@/lib/animations'

// Automatically uses simple fade for users with reduced motion
<motion.div variants={getMotionVariants(fadeInUp)}>
```

---

## 🧩 Component Patterns

### Cards

```tsx
<div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
  <h3 className="text-xl font-semibold text-white mb-2">Card Title</h3>
  <p className="text-gray-400">Card content...</p>
</div>
```

### Buttons

```tsx
// Primary button
<button className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors font-medium">
  Primary Action
</button>

// Secondary button
<button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium">
  Secondary Action
</button>

// Destructive button
<button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">
  Delete
</button>
```

### Badges/Tags

```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-900/50 text-brand-300">
  Tag Name
</span>

<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300">
  Category
</span>
```

### Loading States

```tsx
import { Skeleton } from '@/components/ui/skeleton'

// Content loading
<div className="space-y-3">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-3/4" />
  <Skeleton className="h-12 w-1/2" />
</div>

// Card loading
<div className="space-y-4">
  <Skeleton className="h-48 w-full rounded-xl" />
  <Skeleton className="h-6 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

---

## ♿ Accessibility

### Color Contrast

All text colors meet WCAG AA standards for contrast against their backgrounds.

### Motion Preferences

Animations respect user's motion preferences via `prefers-reduced-motion` media query.

### Focus States

All interactive elements have visible focus states:

```tsx
className="focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-950"
```

### Keyboard Navigation

All interactive elements are keyboard accessible using standard HTML elements and proper ARIA labels.

---

## 📱 Responsive Design

### Breakpoints

Tailwind's default breakpoints:

```tsx
sm:   // min-width: 640px
md:   // min-width: 768px
lg:   // min-width: 1024px
xl:   // min-width: 1280px
2xl:  // min-width: 1536px
```

### Usage

```tsx
<div className="text-base md:text-lg lg:text-xl">
  Responsive text
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Responsive grid
</div>
```

---

## 🧪 Testing

### Design System Test Page

Visit `/design-test` to see all design system elements in action:

- Typography scale
- Color palette
- Animations
- Loading states
- Spacing
- Border radius

---

## 📚 Resources

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Framer Motion Docs**: https://www.framer.com/motion/
- **Shadcn/UI Docs**: https://ui.shadcn.com/
- **Next.js Fonts**: https://nextjs.org/docs/app/building-your-application/optimizing/fonts

---

## 🔄 Updates

**Version 1.0** - Initial design system setup
- Enhanced color palette
- Google Fonts integration
- Typography system
- Animation library
- Loading states
- Component patterns

