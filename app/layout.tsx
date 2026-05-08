import '@/styles/globals.css'

import type { Metadata, Viewport } from 'next'
import { CSPostHogProvider } from '@/providers/posthog-provider'
import { QueryProvider } from '@/providers/query-provider'
import { ToastProvider } from '@/providers/toast-provider'
import { GoogleTagManager } from '@next/third-parties/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { siteConfig } from '@/config/site'
import { GOOGLE_GTM_ID } from '@/lib/constants'
import { fontSans } from '@/lib/fonts'
import {
  JsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/structured-data'
import { cn } from '@/lib/utils'
import { Footer } from '@/components/layouts/footer'
import { SiteHeader } from '@/components/layouts/site-header'
import { FloatingPlayerProvider } from '@/context/floating-player-context'
import { FloatingPlayer } from '@/components/media/floating-player'
import { SpeedOptimizer } from '@/components/media/speed-optimizer'
import { FeedbackForm } from '@/components/feedback-form'
import { SpatialAudioDashboard } from '@/components/spatial-audio-dashboard'
import CommandPalette from '@/app/components/CommandPalette'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.theme.colors.light },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.theme.colors.dark },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.websiteURL),
  title: {
    default: `CineWatch — Movie & TV Show Tracker`,
    template: `%s | CineWatch`,
  },
  description: "Discover and watch movies, TV series, and anime instantly. Powered by TMDB & Anilist.",
  applicationName: "CineWatch",
  manifest: "/manifest.json",
  creator: "CineWatch Team",
  publisher: "CineWatch",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'CineWatch',
    title: 'CineWatch — Watch Movies, Series & Anime',
    description: "Discover and watch movies, TV series, and anime instantly. Powered by TMDB & Anilist.",
    url: siteConfig.websiteURL,
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'CineWatch Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineWatch — Watch Movies, Series & Anime',
    description: "Discover and watch movies, TV series, and anime instantly. Powered by TMDB & Anilist.",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

import { SplashScreen } from '@/components/splash-screen'
import { MobileBottomNav } from '@/components/layouts/mobile-bottom-nav'
import { AntiInspect } from '@/components/anti-inspect'
import { SWRegister } from '@/components/sw-register'
import { OneSignalInit } from '@/components/onesignal-init'
import { ContentProtection } from '@/components/content-protection'
import { AuthProvider } from '@/context/auth-context'

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={organizationJsonLd} />
      </head>
      <body
        className={cn(
          'min-h-screen scroll-smooth bg-background font-sans antialiased relative',
          fontSans.variable
        )}
      >
        {/* Premium Background Effects */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-600/5 blur-[100px] rounded-full animate-pulse [animation-delay:4s]" />
          <div className="absolute inset-0 bg-[url('/grain.png')] opacity-[0.03] mix-blend-overlay" />
        </div>
        
        <SWRegister />
        <OneSignalInit />
        <ContentProtection />
        <AntiInspect />
        <SplashScreen />
        <AuthProvider>
          <FloatingPlayerProvider>
            <div className="flex flex-col pb-16 lg:pb-0"> {/* Added pb-16 for mobile bottom nav */}
              <SiteHeader />
              <div className="h-full flex-1 overflow-x-hidden">
                <NuqsAdapter>
                  <QueryProvider>
                    <CSPostHogProvider>{children}</CSPostHogProvider>
                  </QueryProvider>
                </NuqsAdapter>
                <ToastProvider />
                <Footer />
                <MobileBottomNav />
                {GOOGLE_GTM_ID && <GoogleTagManager gtmId={GOOGLE_GTM_ID} />}
              </div>
            </div>
            <FloatingPlayer />
            <CommandPalette />
            <SpeedOptimizer />
            <FeedbackForm />
            <SpatialAudioDashboard />
          </FloatingPlayerProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
