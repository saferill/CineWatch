'use client'

import React, { useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'

import { getImageURL } from '@/lib/utils'
import { BlurredImage } from '@/components/blurred-image'

export const HeroVideoPlayer = ({ trailerId, movie }: { trailerId: string, movie: any }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  
  // Parallax Effect Hook
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 200])

  return (
    <>
      <motion.div style={{ y }} className="absolute inset-0 z-0 w-full h-full bg-black overflow-hidden pointer-events-none scale-[1.1] origin-top">
        {/* Placeholder Backdrop while loading */}
        <BlurredImage
          src={getImageURL(movie?.backdrop_path)}
          alt={movie?.title || 'Backdrop'}
          fill
          className={`object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
          priority
        />
        <iframe
          onLoad={() => setIsVideoLoaded(true)}
          className={`absolute top-1/2 left-1/2 w-[180%] h-[100%] md:w-[100vw] md:h-[56.25vw] md:min-h-[100vh] md:min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 brightness-[1.1] contrast-[1.05] transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
          src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerId}&modestbranding=1&enablejsapi=1&iv_load_policy=3&disablekb=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </motion.div>
    </>
  )
}
