import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { populateHomePageData } from '@/services/movies'

import { siteConfig } from '@/config/site'
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  JsonLd,
} from '@/lib/structured-data'

import { HeroSlider } from '@/components/header/hero-slider'
import { FullScreenLoader } from '@/components/loaders/intro-pages-loader'
import { MoviesIntroSection } from '@/components/main-page/intro-section'
import ContinueWatching from '@/app/components/ContinueWatching'

export const dynamic = 'force-dynamic'

const HOME_DESCRIPTION =
  'Discover trending movies and TV shows, track what you watch, and never miss a release. CineWatch brings the latest, top-rated, and popular titles into one seamless experience.'

export const metadata: Metadata = {
  title: `CineWatch — Discover & Track Movies and TV Shows`,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `CineWatch — Discover & Track Movies and TV Shows`,
    description: HOME_DESCRIPTION,
    url: siteConfig.websiteURL,
    type: 'website',
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
    title: `CineWatch — Discover & Track Movies and TV Shows`,
    description: HOME_DESCRIPTION,
    images: ['/logo.png'],
  },
}

async function IndexPage() {
  const {
    trendingMediaForHero,
    latestTrendingMovies,
    allTimeTopRatedMovies,
    popularMovies,
    latestTrendingSeries,
    popularSeries,
    allTimeTopRatedSeries,
    trendingAnime,
    latestDonghua,
    epicMasterpieces,
    actionHits,
  } = await populateHomePageData()

  // Shuffle arrays on server to prevent hydration mismatch
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const shuffledTopRatedMovies = shuffleArray(allTimeTopRatedMovies)
  const shuffledTopRatedSeries = shuffleArray(allTimeTopRatedSeries)
  const shuffledEpicMasterpieces = shuffleArray(epicMasterpieces)
  const shuffledActionHits = shuffleArray(actionHits)

  // Combine multiple sources to get 50 unique items for the Hero Slider
  const combinedHeroMovies = [
    ...latestTrendingMovies,
    ...popularMovies,
    ...latestTrendingSeries,
    ...allTimeTopRatedMovies,
    ...popularSeries
  ];
  
  // Remove duplicates
  const uniqueHeroMovies = Array.from(new Map(combinedHeroMovies.map(item => [item.id, item])).values()).slice(0, 50);

  return (
    <section className="h-full">
      <JsonLd
        data={collectionPageJsonLd({
          name: `CineWatch — Home`,
          description: HOME_DESCRIPTION,
          url: siteConfig.websiteURL,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([{ name: 'Home', url: '/' }])}
      />
      <Suspense fallback={<FullScreenLoader />}>
        <HeroSlider movies={uniqueHeroMovies as any} />
      </Suspense>
      <div className="container max-w-(--breakpoint-2xl) pt-4 md:pt-8 pb-4">
        <ContinueWatching />
        
        <MoviesIntroSection
          latestTrendingMovies={latestTrendingMovies}
          allTimeTopRatedMovies={shuffledTopRatedMovies}
          popularMovies={popularMovies}
          latestTrendingSeries={latestTrendingSeries}
          popularSeries={popularSeries}
          allTimeTopRatedSeries={shuffledTopRatedSeries}
          trendingAnime={trendingAnime}
          latestDonghua={latestDonghua}
          epicMasterpieces={shuffledEpicMasterpieces}
          actionHits={shuffledActionHits}
        />
      </div>
    </section>
  )
}

export default IndexPage
