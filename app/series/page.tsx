import React from 'react'
import { Metadata } from 'next'
import { getPopularSeries } from '@/services/series'

import { siteConfig } from '@/config/site'
import { QUERY_KEYS } from '@/lib/queryKeys'
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  JsonLd,
} from '@/lib/structured-data'
import { MediaContent } from '@/components/media/media-content'

const SERIES_TITLE = `Series — Browse Popular, Trending & Top Rated`
const SERIES_DESCRIPTION =
  'Browse popular, trending, and top-rated TV shows. Track what you watch, discover new series, and never miss an episode on CineWatch.'
const SERIES_URL = `${siteConfig.websiteURL}/series`

export const metadata: Metadata = {
  title: 'Series',
  description: SERIES_DESCRIPTION,
  keywords: [
    'popular tv shows',
    'trending series',
    'top rated tv',
    'new tv shows',
    'series tracker',
  ],
  alternates: {
    canonical: '/series',
  },
}

async function Series() {
  const series = await getPopularSeries()
  return (
    <section className="container h-full py-20 lg:py-36">
      <JsonLd
        data={collectionPageJsonLd({
          name: SERIES_TITLE,
          description: SERIES_DESCRIPTION,
          url: SERIES_URL,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'Series', url: '/series' },
        ])}
      />
      <MediaContent
        media={series}
        getPopularMediaAction={getPopularSeries}
        queryKey={QUERY_KEYS.SERIES_KEY}
        enableFilters={true}
        filterLayout="sidebar"
        title="Series"
      />
    </section>
  )
}

export default Series
