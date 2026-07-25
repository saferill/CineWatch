'use client'

import React from 'react'

interface CinematicImageProps {
  src?: string
  alt: string
  className?: string
  fallback?: string
}

const DEFAULT_FALLBACKS = [
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1280',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1280',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1280',
  'https://images.unsplash.com/photo-1598899303450-230ffdf9a6b4?q=80&w=1280'
]

export function CinematicImage({ src, alt, className, fallback }: CinematicImageProps) {
  const [error, setError] = React.useState(false)
  
  // Use provided fallback or pick a random default one
  const finalFallback = fallback || DEFAULT_FALLBACKS[Math.floor(Math.random() * DEFAULT_FALLBACKS.length)]
  const finalSrc = error || !src ? finalFallback : src

  return (
    <img 
      src={finalSrc} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  )
}
