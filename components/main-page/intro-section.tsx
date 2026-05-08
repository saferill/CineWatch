'use client'
import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import { MediaType } from '@/types/media'
import { Movie } from '@/types/movie-result'
import { List } from '@/components/list'
import { SliderHorizontalListLoader } from '@/components/loaders/slider-horizontal-list-loader'

// Utility to shuffle an array (Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
  return array // No-op on client to maintain hydration stability
}

interface MoviesIntroSectionProps {
  latestTrendingMovies: Movie[]
  allTimeTopRatedMovies: Movie[]
  popularMovies: Movie[]
  latestTrendingSeries: MediaType[]
  popularSeries: MediaType[]
  allTimeTopRatedSeries: MediaType[]
  trendingAnime: any[]
  latestDonghua: any[]
  epicMasterpieces: Movie[]
  actionHits: Movie[]
}

export const MoviesIntroSection = ({
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
}: MoviesIntroSectionProps) => {
  // Shuffling is now handled on the server to prevent hydration mismatch
  const shuffledTopRatedMovies = allTimeTopRatedMovies
  const shuffledTopRatedSeries = allTimeTopRatedSeries
  const shuffledEpicMasterpieces = epicMasterpieces
  const shuffledActionHits = actionHits

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="max-w-(--breakpoint-2xl) space-y-4 md:space-y-8"
    >
      <Suspense fallback={<SliderHorizontalListLoader />}
>
        <List
          title="Trending Movies"
          items={latestTrendingMovies}
          itemType="movie"
        />
      </Suspense>
      <Suspense fallback={<SliderHorizontalListLoader />}
>
        <List title="Popular Movies" items={popularMovies} itemType="movie" />
      </Suspense>
      <Suspense fallback={<SliderHorizontalListLoader />}
>
        <List
          title="Top Rated Movies"
          items={shuffledTopRatedMovies}
          itemType="movie"
        />
      </Suspense>
      <Suspense fallback={<SliderHorizontalListLoader />}
>
        <List
          title="Trending Series"
          items={latestTrendingSeries}
          itemType="tv"
        />
      </Suspense>
      <Suspense fallback={<SliderHorizontalListLoader />}
>
        <List title="Popular Series" items={popularSeries} itemType="tv" />
      </Suspense>
      <Suspense fallback={<SliderHorizontalListLoader />}
>
        <List
          title="Top Rated Series"
          items={shuffledTopRatedSeries}
          itemType="tv"
        />
      </Suspense>
      <Suspense fallback={<SliderHorizontalListLoader />}>
        <List
          title="Trending Anime"
          items={trendingAnime as any}
          itemType="anime"
        />
      </Suspense>
      <Suspense fallback={<SliderHorizontalListLoader />}>
        <List
          title="Latest Donghua"
          items={latestDonghua as any}
          itemType="donghua"
        />
      </Suspense>

      <Suspense fallback={<SliderHorizontalListLoader />}>
        <List
          title="Epic Masterpieces (Must Watch)"
          items={shuffledEpicMasterpieces}
          itemType="movie"
        />
      </Suspense>

      <Suspense fallback={<SliderHorizontalListLoader />}>
        <List
          title="Martial Arts Universe"
          items={shuffledActionHits}
          itemType="movie"
        />
      </Suspense>
    </motion.section>
  )
}


