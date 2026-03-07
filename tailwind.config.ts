import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shadcn/ui colors (keep existing)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Redesign Design Tokens - Background Colors
        // Use as: bg-bg-main, bg-bg-menu-bar, etc.
        'bg-main': 'var(--bg-main)',
        'bg-menu-bar': 'var(--bg-menu-bar)',
        'bg-card': 'var(--bg-card)',
        'bg-card-alt': 'var(--bg-card-alt)',
        'bg-profile': 'var(--bg-profile)',
        'bg-info-menu': 'var(--bg-info-menu)',
        'bg-gray-800': 'var(--bg-gray-800)',
        'bg-gray-700': 'var(--bg-gray-700)',
        'bg-unlinked-skills-pill': 'var(--bg-unlinked-skills-pill)',
        // Redesign Design Tokens - Text Colors
        // Use as: text-text-headings, text-text-body, etc.
        'text-headings': 'var(--text-headings)',
        'text-body': 'var(--text-body)',
        'text-secondary': 'var(--text-secondary)',
        'text-metadata': 'var(--text-metadata)',
        'text-on-dark': 'var(--text-on-dark)',
        'text-on-dark-secondary': 'var(--text-on-dark-secondary)',
        'text-on-dark-inactive': 'var(--text-on-dark-inactive)',
        'text-on-dark-hover': 'var(--text-on-dark-hover)',
        'text-white': 'var(--text-white)',
        'text-primary': 'var(--text-primary)',
        'text-gray-400': 'var(--text-gray-400)',
        'text-gray-500': 'var(--text-gray-500)',
        // Redesign Design Tokens - Accent Colors (Burgundy Family)
        // Use as: bg-accent-light, text-accent-light, border-accent-light, etc.
        'accent-light': 'var(--accent-light)', // Primary burgundy accent
        'accent-dark': 'var(--accent-dark)', // Darker burgundy for selected states
        'accent-emerald-300': 'var(--accent-emerald-300)', // Hover states
        // Consolidated aliases (all point to accent-light)
        'accent-emerald-400': 'var(--accent-emerald-400)', // Alias to accent-light
        'accent-emerald-700': 'var(--accent-emerald-700)', // Alias to accent-light
        'accent-purple-600': 'var(--accent-purple-600)', // Alias to accent-light
        'accent-blue': 'var(--accent-blue)', // Alias to accent-light
        // Redesign Design Tokens - Border Colors
        // Use as: border-border-gray-800, border-border-card, etc.
        'border-gray-800': 'var(--border-gray-800)',
        'border-gray-700': 'var(--border-gray-700)',
        'border-card': 'var(--border-card)',
        // Legacy/Backwards Compatibility
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        emerald: {
          300: 'oklch(0.845 0.143 164.978)',
          400: 'oklch(0.765 0.177 163.223)',
        },
        'figma-red': {
          400: 'oklch(0.704 0.191 22.216)',
        },
        purple: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        green: {
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        orange: {
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        pink: {
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
        },
      },
      fontFamily: {
        // Redesign Fonts
        display: ['var(--font-display)', 'serif'], // Crimson Pro
        body: ['var(--font-body)', 'sans-serif'], // Public Sans
        ui: ['var(--font-ui)', 'sans-serif'], // Space Grotesk
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'], // JetBrains Mono
        // Legacy/Backwards Compatibility
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;

