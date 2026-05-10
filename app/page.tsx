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
import Link from 'next/link'
import { IconNews, IconChevronRight, IconArrowRight } from '@tabler/icons-react'
import { DiscoveryDashboard } from '@/components/main-page/discovery-dashboard'

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

        <DiscoveryDashboard 
          movies={latestTrendingMovies} 
          popularMovies={popularMovies} 
        />
        
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

        {/* AI News Section */}
        <section className="py-12 border-t border-white/5 mt-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <IconNews className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">CineWatch Insider</h2>
              </div>
            </div>
            <Link href="/blog" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group">
              Lihat Semua Berita
              <IconArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <LatestBlogSection />
        </section>
      </div>
    </section>
  )
}

import { BlogCard } from '@/components/main-page/blog-card';

// Sub-component to fetch blog data separately to not block home page if table is missing
async function LatestBlogSection() {
  const { supabase } = await import('@/lib/supabase');
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (!posts || posts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {posts.map((post: any, index: number) => (
        <BlogCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}

export default IndexPage
