import React, { Suspense } from 'react'
import { MediaType } from '@/types/media'
import { Movie } from '@/types/movie-result'
import { List } from '@/components/list'
import { SliderHorizontalListLoader } from '@/components/loaders/slider-horizontal-list-loader'

// Utility to shuffle an array (Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface MoviesIntroSectionProps {
  latestTrendingMovies: Movie[]
  allTimeTopRatedMovies: Movie[]
  popularMovies: Movie[]
  latestTrendingSeries: MediaType[]
  popularSeries: MediaType[]
  allTimeTopRatedSeries: MediaType[]
}

export const MoviesIntroSection = ({
  latestTrendingMovies,
  allTimeTopRatedMovies,
  popularMovies,
  latestTrendingSeries,
  popularSeries,
  allTimeTopRatedSeries,
}: MoviesIntroSectionProps) => {
  // Shuffle top rated lists to vary on each render
  const shuffledTopRatedMovies = shuffleArray(allTimeTopRatedMovies)
  const shuffledTopRatedSeries = shuffleArray(allTimeTopRatedSeries)

  return (
    <section className="container max-w-(--breakpoint-2xl)">
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
    </section>
  )
}


