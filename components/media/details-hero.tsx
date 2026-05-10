'use client'

import React from 'react'

import { MovieDetails } from '@/types/movie-details'
import { STREAMING_MOVIES_API_URL } from '@/lib/constants'
import { DetailsHero } from '@/components/details-hero'

export const MovieDetailsHero = ({ 
  movie, 
  trailerId, 
  aiInsights 
}: { 
  movie: MovieDetails, 
  trailerId?: string | null,
  aiInsights?: { insight: string; mood: string } | null
}) => {
  return (
    <DetailsHero
      movie={movie}
      trailerId={trailerId}
      aiInsights={aiInsights}
    />
  )
}
