'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { ItemType } from '@/types/movie-result'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface AnimatedWatchButtonProps {
  movieId: number
  mediaType?: ItemType
}

// Global variable to track if animation has played
let hasAnimated = false

export const AnimatedWatchButton = ({
  movieId,
  mediaType,
}: AnimatedWatchButtonProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(!hasAnimated)

  useEffect(() => {
    if (!hasAnimated) {
      hasAnimated = true
      setShouldAnimate(true)
    }
  }, [])

  const href =
    mediaType === 'tv' ? `/series/${movieId}` : `/movie/${movieId}`

  return (
    <motion.div
      className={cn('flex justify-center w-full lg:w-fit lg:justify-start')}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 500 }}
      initial={shouldAnimate ? { opacity: 0, y: 80 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        href={href}
        className={cn(
          buttonVariants({
            variant: 'watchNow',
            className: 'w-full rounded-md font-semibold lg:font-bold px-4 lg:px-6 py-2 lg:py-3 h-10 lg:h-12 flex items-center justify-center whitespace-nowrap',
          })
        )}
      >
        <Play className="mr-2 size-4 lg:size-5 fill-current" />
        Play
      </Link>
    </motion.div>
  )
}
