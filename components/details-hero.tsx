import React, { forwardRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { MovieDetails } from '@/types/movie-details'
import { SeriesDetails } from '@/types/series-details'
import { HeroImage } from '@/components/header/hero-image'

export const DetailsHero = ({
  movie,
  series,
  trailerId,
}: {
  movie?: MovieDetails
  series?: SeriesDetails
  trailerId?: string | null
}) => {
  const media = (movie || series) as MovieDetails & SeriesDetails
  const title = media?.title || media?.name

  return (
    <section className="relative isolate h-[500px] overflow-hidden lg:h-[80dvh]">
      <HeroImage movie={media} />
      
      {trailerId && (
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none opacity-80">
          <iframe
            className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] min-w-[100vw] min-h-[100vh] -translate-x-1/2 -translate-y-1/2 lg:w-[150vw] lg:h-[150vh]"
            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&playsinline=1&loop=1&playlist=${trailerId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${title} Trailer`}
          />
        </div>
      )}

      <div className="pointer-events-none absolute -inset-4 z-20 rounded-md bg-slate-900/50 shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:drop-shadow-lg" />
      <div className="absolute inset-0 z-30 pointer-events-none bg-linear-to-t from-background via-background/40 to-transparent" />
    </section>
  )
}
