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
    images: ['/logo.png'],
  },
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
    ],
    apple: [
      {
        url: '/logo.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

import { Onboarding } from '@/components/onboarding'

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
          'min-h-screen scroll-smooth bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Onboarding />
        <div className="flex flex-col">
          <SiteHeader />
          <div className="h-full flex-1 overflow-x-hidden">
            <NuqsAdapter>
              <QueryProvider>
                <CSPostHogProvider>{children}</CSPostHogProvider>
              </QueryProvider>
            </NuqsAdapter>
            <ToastProvider />
            <Footer />
            {GOOGLE_GTM_ID && <GoogleTagManager gtmId={GOOGLE_GTM_ID} />}
          </div>
        </div>
      </body>
    </html>
  )
}
