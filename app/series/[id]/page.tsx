import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getSeriesDetailsById,
  populateSeriesDetailsPageData,
} from '@/services/series'
import { getTVTrailer, getTVSeasonTrailer } from '@/app/lib/tmdb'

import { siteConfig } from '@/config/site'
import { PageDetailsProps } from '@/types/page-details'
import { getImageURL, getPosterImageURL } from '@/lib/utils'
import {
  breadcrumbJsonLd,
  JsonLd,
  tvSeriesJsonLd,
} from '@/lib/structured-data'
import { SeriesDetailsContent } from '@/components/series/details-content'
import { SeriesDetailsHero } from '@/components/series/details-hero'

export async function generateMetadata(
  props: PageDetailsProps
): Promise<Metadata> {
  const { id } = await props.params

  let seriesDetails
  try {
    seriesDetails = await getSeriesDetailsById(id)
  } catch {
    notFound()
  }
  if (!seriesDetails?.id) notFound()

  const year = seriesDetails.first_air_date?.slice(0, 4)
  const title = year
    ? `${seriesDetails.name} (${year})`
    : seriesDetails.name
  const description =
    seriesDetails.overview?.slice(0, 200) ||
    `Details, cast, and streaming info for ${seriesDetails.name} on CineWatch.`
  const canonicalPath = `/series/${id}`
  const backdrop = seriesDetails.backdrop_path
    ? getImageURL(seriesDetails.backdrop_path)
    : undefined
  const poster = seriesDetails.poster_path
    ? getPosterImageURL(seriesDetails.poster_path)
    : undefined

  const images = [
    backdrop && {
      url: backdrop,
      width: 1280,
      height: 720,
      alt: seriesDetails.name,
    },
    poster && {
      url: poster,
      width: 500,
      height: 750,
      alt: seriesDetails.name,
    },
  ].filter(Boolean) as Array<{ url: string; width: number; height: number; alt: string }>

  return {
    title,
    description,
    keywords: [
      seriesDetails.name,
      ...(seriesDetails.genres?.map((g) => g.name) ?? []),
      'watch online',
      'series details',
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'video.tv_show',
      title,
      description,
      url: `${siteConfig.websiteURL}${canonicalPath}`,
      images,
    },
  }
}

const SeriesPage = async (props: PageDetailsProps) => {
  const { id } = await props.params
  const searchParams = await props.searchParams
  const seasonParam = searchParams?.season
  
  let result
  try {
    result = await populateSeriesDetailsPageData(id)
  } catch {
    notFound()
  }
  const { seriesCredits, seriesDetails, similarSeries, recommendedSeries } =
    result!
  if (!seriesDetails?.id) notFound()

  let trailerId = null
  try {
    let trailer
    if (seasonParam) {
      trailer = await getTVSeasonTrailer(Number(id), Number(seasonParam))
    }
    if (!trailer) {
      trailer = await getTVTrailer(Number(id))
    }
    if (trailer) trailerId = trailer.key
  } catch (e) {
    // ignore
  }

  const jsonLd = tvSeriesJsonLd({
    id: seriesDetails.id,
    title: seriesDetails.name,
    description: seriesDetails.overview,
    releaseDate: seriesDetails.first_air_date,
    genres: seriesDetails.genres?.map((g) => g.name),
    imageUrl: seriesDetails.backdrop_path
      ? getImageURL(seriesDetails.backdrop_path)
      : seriesDetails.poster_path
        ? getPosterImageURL(seriesDetails.poster_path)
        : null,
    voteAverage: seriesDetails.vote_average,
    voteCount: seriesDetails.vote_count,
    tagline: seriesDetails.tagline,
  })

  return (
    <div className="relative">
      <JsonLd data={jsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'Series', url: '/series' },
          { name: seriesDetails.name, url: `/series/${seriesDetails.id}` },
        ])}
      />
      <SeriesDetailsHero series={seriesDetails} trailerId={trailerId} />
      <SeriesDetailsContent
        series={seriesDetails}
        seriesCredits={seriesCredits}
        similarSeries={similarSeries}
        recommendedSeries={recommendedSeries}
        trailerId={trailerId}
      />
    </div>
  )
}

export default SeriesPage
