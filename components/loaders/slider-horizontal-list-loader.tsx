import React from 'react'

import { SkeletonContainer } from '../ui/skeleton'

export const SliderHorizontalListLoader = () => {
  return (
    <div className="container py-8 space-y-4">
      {/* Row Title Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-1.5 rounded-full bg-zinc-800 animate-pulse" />
        <div className="h-8 w-48 rounded-lg bg-zinc-800 animate-pulse" />
      </div>
      
      {/* Cards Row Skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 space-y-3">
            <div className="aspect-[2/3] w-[140px] lg:w-[180px] rounded-xl bg-zinc-800/50 animate-pulse border border-white/5" />
            <div className="h-4 w-3/4 rounded bg-zinc-800/50 animate-pulse mx-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
