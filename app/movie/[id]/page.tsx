import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getMovieDetailsById,
  populateMovieDetailsPage,
} from '@/services/movies'
import { getMovieTrailer } from '@/lib/legacy/tmdb'

import { siteConfig } from '@/config/site'
import { PageDetailsProps } from '@/types/page-details'
import { getImageURL, getPosterImageURL } from '@/lib/utils'
import {
  breadcrumbJsonLd,
  JsonLd,
  movieJsonLd,
} from '@/lib/structured-data'
import { MoviesDetailsContent } from '@/components/media/details-content'
import { MovieDetailsHero } from '@/components/media/details-hero'

export const revalidate = 86400;

export async function generateStaticParams() {
  return [{ id: '550' }];
}

export async function generateMetadata(
  props: PageDetailsProps
): Promise<Metadata> {
  const { id } = await props.params

  let movieDetails
  try {
    movieDetails = await getMovieDetailsById(id)
  } catch {
    notFound()
  }
  if (!movieDetails?.id) notFound()

  // Fetch AI insights for better metadata
  const aiInsights = await getMovieAIInsights(movieDetails.title, movieDetails.overview)

  const year = movieDetails.release_date?.slice(0, 4)
  const title = year
    ? `${movieDetails.title} (${year})`
    : movieDetails.title
  const description = aiInsights?.insight || 
    movieDetails.overview?.slice(0, 200) ||
    `Details, cast, and streaming info for ${movieDetails.title} on CineWatch.`
  const canonicalPath = `/movie/${id}`
  const backdrop = movieDetails.backdrop_path
    ? getImageURL(movieDetails.backdrop_path)
    : undefined
  const poster = movieDetails.poster_path
    ? getPosterImageURL(movieDetails.poster_path)
    : undefined

  const images = [
    backdrop && {
      url: backdrop,
      width: 1280,
      height: 720,
      alt: movieDetails.title,
    },
    poster && {
      url: poster,
      width: 500,
      height: 750,
      alt: movieDetails.title,
    },
  ].filter(Boolean) as Array<{ url: string; width: number; height: number; alt: string }>

  return {
    title,
    description,
    keywords: [
      movieDetails.title,
      ...(movieDetails.genres?.map((g) => g.name) ?? []),
      'watch online',
      'movie details',
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'video.movie',
      title,
      description,
      url: `${siteConfig.websiteURL}${canonicalPath}`,
      images,
    },
  }
}

import { MovieClientDetails } from './movie-client-details'
import { getMovieAIInsights } from '@/services/ai'

const MoviePage = async (props: PageDetailsProps) => {
  const { id } = await props.params
  let result
  try {
    result = await populateMovieDetailsPage(id)
  } catch {
    // fallback to client
  }

  const movieDetails = result?.movieDetails
  const movieCredits = result?.movieCredits
  const similarMovies = result?.similarMovies || []
  const recommendedMovies = result?.recommendedMovies || []

  let trailerId = null
  if (movieDetails?.id) {
    try {
      const trailer = await getMovieTrailer(Number(id))
      if (trailer) trailerId = trailer.key
    } catch (e) {}
  }

  const aiInsights = movieDetails
    ? await getMovieAIInsights(movieDetails.title, movieDetails.overview).catch(() => null)
    : null

  return (
    <MovieClientDetails
      initialMovieDetails={movieDetails}
      initialCredits={movieCredits}
      initialSimilar={similarMovies}
      initialRecommended={recommendedMovies}
      initialTrailerId={trailerId}
      initialAiInsights={aiInsights}
    />
  )
}

export default MoviePage
