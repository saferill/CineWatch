'use client'

import React from 'react'

import { SeriesDetails } from '@/types/series-details'
import { STREAMING_MOVIES_API_URL } from '@/lib/constants'
import { useMounted } from '@/hooks/use-mounted'
import { useSearchQueryParams } from '@/hooks/use-search-params'
import { DetailsHero } from '@/components/details-hero'

export const SeriesDetailsHero = ({ series, trailerId }: { series: SeriesDetails, trailerId?: string | null }) => {
  return (
    <DetailsHero
      series={series}
      trailerId={trailerId}
    />
  )
}
