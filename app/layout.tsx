/**
 * Root Layout Component for AgroInsight
 *
 * This is the root layout that wraps all pages in the Next.js App Router.
 * It provides:
 * - Global styles via globals.css
 * - Font configuration (Inter font family)
 * - SEO metadata (title, description)
 * - Global providers (Authentication, Theme, Toast notifications)
 *
 * Provider hierarchy (outer to inner):
 * 1. AuthSessionProvider - NextAuth session management
 * 2. ThemeProvider - Light/dark theme support
 * 3. ToastProvider - Toast notifications for user feedback
 *
 * This layout is applied to ALL routes in the application.
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthSessionProvider from '@/components/providers/session-provider'
import ThemeProvider from '@/components/providers/theme-provider'
import { ToastProvider } from '@/components/toast-provider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Configure Inter font from Google Fonts
// Latin subset for optimal performance with Portuguese content
const inter = Inter({ subsets: ['latin'] })

/**
 * Metadata for SEO and browser display
 * Applied to all pages unless overridden by page-specific metadata
 */
export const metadata: Metadata = {
  title: 'AgroInsight - Plataforma de Gestão de Dados Zootécnicos',
  description:
    'Plataforma avançada de análise e gestão de dados agropecuários para pesquisadores e produtores rurais.',
}

/**
 * Root layout component
 * Wraps all pages with necessary providers and global structure
 *
 * @param children - Page content to be rendered inside the layout
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* suppressHydrationWarning prevents Next.js hydration warnings caused by ThemeProvider */}
      <body className={inter.className}>
        {/* Authentication session provider - enables useSession() hook throughout app */}
        <AuthSessionProvider>
          {/* Theme provider - enables light/dark mode switching */}
          <ThemeProvider>
            {/* Toast notifications - global notification system */}
            <ToastProvider />
            {/* Render page content */}
            {children}
          </ThemeProvider>
        </AuthSessionProvider>
        {/* Vercel Analytics - tracks page views and visitor data */}
        <Analytics />
        {/* Vercel Speed Insights - monitors page performance metrics */}
        <SpeedInsights />
      </body>
    </html>
  )
}
