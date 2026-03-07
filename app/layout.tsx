import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Crimson_Pro, Public_Sans } from 'next/font/google'
import "./globals.css";

// Redesign Fonts
const crimsonPro = Crimson_Pro({ 
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
  display: 'swap',
})

const publicSans = Public_Sans({ 
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-ui',
  weight: ['500', '600', '700'], // Match mockup: only 500, 600, 700
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
  display: 'swap',
})

// Legacy font variable (for backwards compatibility)
const spaceGroteskLegacy = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const jetbrainsMonoLegacy = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Beregovskiy Portfolio",
  description: "Professional Portfolio Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body 
        className={`${crimsonPro.variable} ${publicSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${spaceGroteskLegacy.variable} ${jetbrainsMonoLegacy.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

