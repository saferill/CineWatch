import React from 'react'

import { Movie } from '@/types/movie-result'
import { getPosterImageURL } from '@/lib/utils'
import { BlurredImage } from '@/components/blurred-image'
import { AnimatedWatchButton } from '@/components/header/animated-watch-button'
import { HeroRatesInfos } from '@/components/header/hero-rates-info'
import { Info } from 'lucide-react'

export const HeroSectionInfo = ({ movie, isTopOne }: { movie: Movie & { logoUrl?: string | null }, isTopOne?: boolean }) => {
  return (
    <div className="container relative z-50 flex h-full flex-col justify-end pb-8 pt-[35vh] md:justify-center md:pb-20 md:pt-32 lg:pb-0 lg:pt-40">
      <div className="max-w-2xl flex flex-col items-center md:items-start text-center md:text-left gap-2 md:gap-4 lg:gap-6 mx-auto md:mx-0">
        {isTopOne && (
          <div className="flex items-center gap-2 mb-[-10px] drop-shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            <div className="bg-[#E50914] text-white text-[10px] md:text-xs font-black px-1.5 py-0.5 rounded-sm tracking-widest">TOP</div>
            <div className="bg-transparent text-white text-[10px] md:text-xs font-black border border-white/40 px-1.5 py-0.5 rounded-sm">10</div>
            <span className="text-white text-sm md:text-xl font-bold tracking-wide drop-shadow-md">
              #1 in Movies Today
            </span>
          </div>
        )}
        
        {movie.logoUrl ? (
          <img 
            src={movie.logoUrl} 
            alt={movie.title || movie.name} 
            className="max-h-[50px] md:max-h-[120px] lg:max-h-[160px] w-auto object-contain object-bottom md:object-left md:origin-left drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" 
          />
        ) : (
          <h2 className="text-4xl font-extrabold tracking-tight drop-shadow-2xl lg:text-7xl text-white">
            {movie.title || movie.name}
          </h2>
        )}
        
        <HeroRatesInfos movie={movie} />
        
        <p className="prose-invert text-xs md:text-sm font-medium drop-shadow-xl lg:text-lg text-slate-200 line-clamp-2 md:line-clamp-3 max-w-xl">
          {movie.overview}
        </p>
        
        <div className="flex flex-row items-center gap-3 mt-4 w-full max-w-xs md:max-w-sm">
           <div className="flex-1">
             <AnimatedWatchButton
               movieId={movie?.id}
               mediaType={movie?.media_type}
             />
           </div>
           <div className="flex-1">
             <button className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-500/50 hover:bg-gray-500/70 backdrop-blur-sm px-4 lg:px-6 py-2 lg:py-3 font-semibold lg:font-bold text-white transition-colors h-10 lg:h-12 whitespace-nowrap">
               <Info className="size-5 lg:size-6" />
               More Info
             </button>
           </div>
        </div>
      </div>
    </div>
  )
}
