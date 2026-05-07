'use client'

import React from 'react'

import { MovieDetails } from '@/types/movie-details'
import { STREAMING_MOVIES_API_URL } from '@/lib/constants'
import { DetailsHero } from '@/components/details-hero'

export const MovieDetailsHero = ({ movie, trailerId }: { movie: MovieDetails, trailerId?: string | null }) => {
  return (
    <DetailsHero
      movie={movie}
      trailerId={trailerId}
    />
  )
}
