import React from 'react'

import { SkeletonContainer } from '../ui/skeleton'

export const SliderHorizontalListLoader = () => {
  return (
    <div className="container h-full pb-10 pt-12 lg:pb-20">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonContainer key={i}>
            <div className="space-y-3">
              <div className="aspect-[2/3] w-full max-w-[250px] rounded-lg bg-muted/80" />
            </div>
          </SkeletonContainer>
        ))}
      </div>
    </div>
  )
}
