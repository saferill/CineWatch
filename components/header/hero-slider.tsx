import React from 'react'

import { Movie } from '@/types/movie-result'
import { Carousel } from '@/components/carousel'
import { HeroImage, HeroImageMedia } from '@/components/header/hero-image'
import { HeroSectionInfo } from '@/components/header/hero-info'
import { getMovieTrailer, getTVTrailer, getMovieLogo, getTVLogo } from '@/app/lib/tmdb'
import { HeroVideoPlayer } from '@/components/header/hero-video-player'

export const HeroSlider = async ({ movies }: { movies: Movie[] }) => {
  const topMovies = movies.slice(0, 50); // Expanded to 50 movies per user request
  
  const moviesWithExtras = await Promise.all(topMovies.map(async (movie) => {
    try {
       const trailer = movie.media_type === 'tv' ? await getTVTrailer(movie.id) : await getMovieTrailer(movie.id);
       const logo = movie.media_type === 'tv' ? await getTVLogo(movie.id) : await getMovieLogo(movie.id);
       return { ...movie, trailerId: trailer?.key, logoUrl: logo };
    } catch {
       return { ...movie, trailerId: undefined, logoUrl: null };
    }
  }));

  return (
    <div className="relative overflow-hidden group">
      <Carousel storageKey="hero-carousel">
        {moviesWithExtras?.map((movie, index) => (
          <div
            key={movie.id}
            className="relative min-h-[75vh] lg:min-h-[90vh] w-full overflow-hidden"
          >
            {movie.trailerId ? (
               <HeroVideoPlayer trailerId={movie.trailerId} />
            ) : (
               <HeroImage movie={movie as HeroImageMedia} />
            )}
            
            {/* Netflix-style Left Gradient Vignette (Hidden on mobile) */}
            <div className="absolute inset-y-0 left-0 z-10 hidden md:block w-[50%] bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />
            {/* Top/Bottom Gradient Vignette */}
            <div className="absolute inset-x-0 bottom-0 z-10 h-[50vh] md:h-[30vh] bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 z-10 h-[15vh] bg-gradient-to-b from-background/60 to-transparent pointer-events-none" />

            <div className="absolute inset-0 z-20 flex">
              <HeroSectionInfo movie={movie as Movie & { logoUrl?: string | null }} isTopOne={index === 0} />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  )
}
