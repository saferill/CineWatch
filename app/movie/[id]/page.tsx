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

import { getMovieAIInsights } from '@/services/ai'

const MoviePage = async (props: PageDetailsProps) => {
  const { id } = await props.params
  let result
  try {
    result = await populateMovieDetailsPage(id)
  } catch {
    notFound()
  }
  const { movieCredits, movieDetails, similarMovies, recommendedMovies } =
    result!
  if (!movieDetails?.id) notFound()

  let trailerId = null
  try {
    const trailer = await getMovieTrailer(Number(id))
    if (trailer) trailerId = trailer.key
  } catch (e) {
    // ignore
  }

  // AI SMART INSIGHTS
  const aiInsights = await getMovieAIInsights(movieDetails.title, movieDetails.overview)

  const jsonLd = movieJsonLd({
    id: movieDetails.id,
    title: movieDetails.title,
    description: movieDetails.overview,
    releaseDate: movieDetails.release_date,
    runtime: movieDetails.runtime,
    genres: movieDetails.genres?.map((g) => g.name),
    imageUrl: movieDetails.backdrop_path
      ? getImageURL(movieDetails.backdrop_path)
      : movieDetails.poster_path
        ? getPosterImageURL(movieDetails.poster_path)
        : null,
    voteAverage: movieDetails.vote_average,
    voteCount: movieDetails.vote_count,
    tagline: movieDetails.tagline,
  })

  return (
    <div className="relative">
      <JsonLd data={jsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'Movies', url: '/movies' },
          { name: movieDetails.title, url: `/movie/${movieDetails.id}` },
        ])}
      />
      <MovieDetailsHero movie={movieDetails} trailerId={trailerId} aiInsights={aiInsights} />
      <MoviesDetailsContent
        movie={movieDetails}
        movieCredits={movieCredits}
        similarMovies={similarMovies}
        recommendedMovies={recommendedMovies}
        trailerId={trailerId}
      />
    </div>
  )
}

export default MoviePage
