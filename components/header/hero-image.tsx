'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

import { MovieDetails } from '@/types/movie-details'
import { Movie } from '@/types/movie-result'
import { SeriesDetails } from '@/types/series-details'
import { getImageURL, getPosterImageURL } from '@/lib/utils'
import { BlurredImage } from '@/components/blurred-image'

export type HeroImageMedia = (Movie | MovieDetails) & SeriesDetails
interface HeroImageProps {
  movie?: HeroImageMedia
}

export const HeroImage = ({ movie }: HeroImageProps) => {
  const media = movie
  const alt = media?.title || media?.name || 'ALT TEXT'

  // Parallax & Fade Effect Hooks
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 200])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])

  return (
    <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-full scale-[1.1] origin-top">
      {media?.backdrop_path && (
        <BlurredImage
          src={getImageURL(media?.backdrop_path)}
          alt={alt}
          className="hidden size-full object-cover lg:block"
          fill
          sizes="(min-width: 1024px) 1024px, 100vw , (max-width: 768px) 768px, 100vw, (max-width: 640px) 640px, 100vw"
          intro
          priority
        />
      )}
      {media?.poster_path && (
        <BlurredImage
          src={getPosterImageURL(media?.poster_path)}
          alt={alt}
          className="block size-full object-cover lg:hidden"
          fill
          sizes="(max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 100vw"
          intro
          priority
        />
      )}
    </motion.div>
  )
}
