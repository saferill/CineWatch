'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { IconSparkles, IconTrendingUp } from '@tabler/icons-react'
import { PulseNebula } from '@/components/media/pulse-nebula'

interface DiscoveryDashboardProps {
  movies: any[]
  popularMovies: any[]
}

export function DiscoveryDashboard({ movies, popularMovies }: DiscoveryDashboardProps) {
  const [timeLabel, setTimeLabel] = useState('TONIGHT')
  const [featuredMovie, setFeaturedMovie] = useState(movies[0])
  const [trends, setTrends] = useState(popularMovies.slice(5, 8))

  useEffect(() => {
    // 1. Get Dynamic Time Label
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setTimeLabel('THIS MORNING')
    else if (hour >= 12 && hour < 17) setTimeLabel('THIS AFTERNOON')
    else if (hour >= 17 && hour < 21) setTimeLabel('THIS EVENING')
    else setTimeLabel('FOR TONIGHT')

    // 2. Randomize Recommendation based on Date/Time to keep it fresh
    const seed = new Date().getDate() + new Date().getHours()
    const randomIndex = Math.floor((Math.random() * movies.length))
    setFeaturedMovie(movies[randomIndex] || movies[0])

    // 3. Randomize Trends
    const shuffledTrends = [...popularMovies].sort(() => 0.5 - Math.random()).slice(0, 3)
    setTrends(shuffledTrends)
  }, [movies, popularMovies])

  if (!featuredMovie) return null

  return (
    <section className="py-12 border-b border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden glass border border-white/10 p-8 flex flex-col justify-end min-h-[400px] group">
          <div className="absolute inset-0 z-0 bg-zinc-900">
            {featuredMovie.backdrop_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w1280${featuredMovie.backdrop_path}`} 
                className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
                alt={featuredMovie.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1280'
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black opacity-40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest">
                Top Choice {timeLabel}
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-4 max-w-xl">{featuredMovie.title}</h2>
            <p className="text-sm text-zinc-300 line-clamp-3 mb-8 max-w-2xl leading-relaxed">
              {featuredMovie.overview}
            </p>
            <div className="flex gap-4">
              <Link href={`/movie/${featuredMovie.id}/watch`} className="px-8 py-3 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                Watch Now
              </Link>
              <Link href={`/movie/${featuredMovie.id}`} className="px-8 py-3 rounded-2xl glass border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                Details
              </Link>
            </div>
          </div>
        </div>
        
        <div className="rounded-3xl overflow-hidden glass border border-white/10 p-8 flex flex-col relative">
          <PulseNebula />
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
              <IconTrendingUp size={24} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest">Watching Trends</h3>
          </div>
          <div className="space-y-6 flex-1">
            {trends.map((movie: any, i: number) => (
              <Link 
                key={movie.id} 
                href={`/movie/${movie.id}`}
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden border border-white/10 bg-zinc-800">
                  <img 
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                    alt={movie.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=200'
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">{i + 1}st Global Trend</p>
                  <h4 className="text-xs font-bold text-white group-hover:text-accent transition-colors">{movie.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">{(movie.vote_average * 10).toFixed(0)}% Match</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
