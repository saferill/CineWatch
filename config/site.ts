export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'CineWatch',
  description: 'CineWatch is a movie, tv show and anime streaming platform.',

  // Author and creator information
  author: {
    name: 'CineWatch Team',
    email: 'contact@cinewatch.com',
    website: 'https://cinewatch.com/',
    twitter: '@CineWatch',
  },

  // Theme and visual configuration
  theme: {
    colors: {
      light: '#ffffff',
      dark: '#000000',
      primary: '#000000',
      tile: '#000000',
    },
  },

  // SEO and metadata configuration
  seo: {
    locale: 'en_US',
    alternateLocales: ['id_ID'],
    category: 'entertainment',
    generator: 'Next.js',
    applicationName: 'CineWatch',
    publisher: 'CineWatch',
    referrer: 'origin-when-cross-origin',
    colorScheme: 'dark light',
  },

  // Open Graph enhanced configuration
  openGraph: {
    locale: 'en_US',
    type: 'website',
    siteName: 'CineWatch',
    images: {
      default: {
        width: 1200,
        height: 630,
        alt: 'CineWatch - Watch Movies, Series & Anime',
        type: 'image/png',
      },
      fallback: {
        width: 800,
        height: 600,
        type: 'image/jpeg',
      },
    },
    ttl: 604800, // 7 days
  },

  // Twitter card configuration
  twitter: {
    card: 'summary_large_image',
    creator: '@CineWatch',
    site: '@CineWatch',
  },

  // Progressive Web App configuration
  pwa: {
    capable: true,
    statusBarStyle: 'black-translucent',
    startupImage: '/logo.png',
    manifestPath: '/manifest.json',
  },

  // Icons configuration
  icons: {
    favicon: '/logo.png',
    favicon16: '/logo.png',
    favicon32: '/logo.png',
    appleTouchIcon: '/logo.png',
    browserConfig: '/browserconfig.xml',
  },

  // Performance optimization
  performance: {
    preconnectDomains: [
      'https://image.tmdb.org',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ],
    dnsPrefetchDomains: [
      '//www.googletagmanager.com',
      '//www.google-analytics.com',
    ],
  },

  // Security configuration
  security: {
    contentSecurityPolicy: "default-src 'self'",
    formatDetection: 'telephone=no',
  },

  // Structured data for JSON-LD
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    searchAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: '/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },

  mainNav: [
    {
      title: 'Home',
      href: '/',
      scroll: true,
    },
    {
      title: 'Movies',
      href: '/movies',
      scroll: true,
    },
    {
      title: 'Series',
      href: '/series',
      scroll: true,
    },
    {
      title: 'Anime',
      href: '/anime',
      scroll: true,
    },
    {
      title: 'Explore',
      href: '/explore',
      scroll: true,
    },
    {
      title: 'Watchlist',
      href: '/watchlist',
      scroll: true,
    },
  ],
  personalLogo: '/logo.png',
  links: {
    twitter: 'https://twitter.com/CineWatch',
    github: 'https://github.com/CineWatch',
    website: 'https://cinewatch.com/',
    buyMeACoffee: 'https://buymeacoffee.com/cinewatch',
  },
  email: 'contact@cinewatch.com',
  websiteURL: 'http://localhost:3000',
  twitterTag: '@CineWatch',
  image: '/logo.png',
  keywords: [
    'CineWatch',
    'Movie Streaming',
    'Watch Series',
    'Watch Anime',
    'Free Movies',
  ],
}
