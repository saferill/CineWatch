'use client'

import React, { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'

import { MovieDetails } from '@/types/movie-details'
import { SeriesDetails } from '@/types/series-details'
import { HeroImage } from '@/components/header/hero-image'

export const DetailsHero = ({
  movie,
  series,
  trailerId,
  aiInsights,
}: {
  movie?: MovieDetails
  series?: SeriesDetails
  trailerId?: string | null
  aiInsights?: { insight: string; mood: string } | null
}) => {
  const media = (movie || series) as MovieDetails & SeriesDetails
  const title = media?.title || media?.name

  return (
    <section className="relative isolate h-[500px] overflow-hidden lg:h-[80dvh]">
      <HeroImage movie={media} />
      
      {trailerId && (
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          <iframe
            className="absolute top-1/2 left-1/2 w-[180%] h-[100%] md:w-[150vw] md:h-[150vh] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 brightness-[1.1] contrast-[1.05]"
            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&playsinline=1&loop=1&playlist=${trailerId}&enablejsapi=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${title} Trailer`}
          />
        </div>
      )}

      {/* AI Smart Insight Overlay */}
      {aiInsights && (
        <div className="absolute top-28 left-6 md:left-12 z-40 max-w-sm animate-fade-up">
           <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                 <div className="px-2 py-0.5 rounded bg-accent/20 border border-accent/30 backdrop-blur-md text-[10px] font-black text-accent uppercase tracking-widest">
                    AI MOOD: {aiInsights.mood}
                 </div>
              </div>
              <div className="glass rounded-2xl p-4 border border-white/10 shadow-2xl backdrop-blur-xl">
                 <p className="text-sm md:text-base font-medium text-white leading-relaxed italic">
                    "{aiInsights.insight}"
                 </p>
              </div>
           </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-20 bg-slate-950/20 md:bg-slate-900/50 shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] transition motion-reduce:transition-none lg:drop-shadow-lg" />
      <div className="absolute inset-0 z-30 pointer-events-none bg-linear-to-t from-background via-background/60 to-transparent" />
    </section>
  )
}

