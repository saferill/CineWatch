'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, Info, Plus } from 'lucide-react'

import { MediaType } from '@/types/media'
import { ItemType } from '@/types/movie-result'
import {
  getPosterImageURL,
  getImageURL,
  itemDetailRedirect,
  numberRounder,
} from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { BlurredImage } from '@/components/blurred-image'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { getTrailerAction } from '@/actions/media'

interface CardProps {
  item: MediaType
  itemType?: ItemType
  isTruncateOverview?: boolean
  rank?: number
}

export const Card = ({
  item,
  itemType = 'movie',
  isTruncateOverview = true,
  rank,
}: CardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [trailerId, setTrailerId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && !trailerId) {
      getTrailerAction(item.id, itemType as 'movie' | 'tv').then((key) => {
        if (key) setTrailerId(key)
      })
    }
  }, [isOpen, item.id, itemType, trailerId])

  const year = item?.release_date?.slice(0, 4) || item?.first_air_date?.slice(0, 4) || 'N/A'
  // Netflix-style match percentage (fake formula for visual effect based on rating)
  const matchScore = item.vote_average ? Math.round(item.vote_average * 10) : 0

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {item?.poster_path && (
          <motion.div
            className="relative cursor-pointer group w-full h-full"
            initial="rest"
            whileHover="hover"
            animate="rest"
          >
            <div className="space-y-2">
              <motion.div 
                className="relative overflow-visible rounded-md transition-all duration-300 z-10 hover:z-50 flex items-end"
                whileHover={{ scale: 1.10, y: -5 }}
              >
                {rank && (
                  <div 
                    className="text-[100px] lg:text-[140px] font-black leading-none tracking-tighter text-black flex-shrink-0 -mr-6 lg:-mr-10 z-0 drop-shadow-lg"
                    style={{ WebkitTextStroke: '3px #555', WebkitTextFillColor: 'black' }}
                  >
                    {rank}
                  </div>
                )}
                <div className="relative">
                  <BlurredImage
                    src={`${getPosterImageURL(item.poster_path)}`}
                    alt={item.title || item.name || 'Movie'}
                    width={250}
                    height={375}
                    className={rank ? "w-[120px] lg:w-[150px] h-auto object-cover rounded-md shadow-lg transition-shadow group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] z-10 relative" : "w-[160px] lg:w-[200px] h-auto object-cover rounded-md shadow-lg transition-shadow group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] z-10 relative"}
                  />
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 rounded-md">
                     <div className="flex size-12 lg:size-14 items-center justify-center rounded-full border-2 border-white bg-black/40 hover:bg-white hover:text-black text-white transition-all transform scale-90 group-hover:scale-100 shadow-xl">
                       <Play className="ml-1 size-5 lg:size-6 fill-current" />
                     </div>
                     <p className="mt-4 text-[10px] lg:text-xs font-semibold tracking-wide text-white drop-shadow-md">QUICK VIEW</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Title under card */}
              <h3 className="text-sm font-medium text-slate-300 line-clamp-1 group-hover:text-white transition-colors px-1">
                {item.title || item.name}
              </h3>
            </div>
          </motion.div>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-[#141414] border-zinc-800 text-white rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Modal Header: Video Background */}
        <div className="relative w-full h-[350px] bg-black overflow-hidden">
          {trailerId ? (
            <iframe
              className="absolute top-1/2 left-1/2 w-[150%] h-[150%] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80"
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerId}&modestbranding=1`}
              allow="autoplay; encrypted-media"
            />
          ) : (
            <img 
              src={item.backdrop_path ? getImageURL(item.backdrop_path) : getPosterImageURL(item.poster_path)}
              className="w-full h-full object-cover opacity-60"
              alt="Backdrop"
            />
          )}
          
          {/* Gradients */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#141414] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/50 to-transparent" />
          
          <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between z-10">
            <h2 className="text-3xl font-extrabold max-w-[80%] drop-shadow-2xl tracking-tight">
              {item.title || item.name}
            </h2>
          </div>
        </div>

        {/* Modal Body: Info & Actions */}
        <div className="p-8 pt-2 space-y-6">
          <div className="flex items-center gap-4 text-sm font-bold tracking-wide">
            {matchScore > 0 && <span className="text-green-500">{matchScore}% Match</span>}
            <span className="text-slate-300">{year}</span>
            <Badge variant="outline" className="text-[10px] uppercase text-slate-300 border-zinc-600 px-2 py-0.5 rounded-sm bg-zinc-800/50">HD</Badge>
          </div>
          
          <p className="text-sm text-zinc-300 leading-relaxed max-w-[90%]">
            {item.overview || "No synopsis available for this title."}
          </p>
          
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50 mt-4">
            <Link 
              href={`${itemDetailRedirect(itemType)}/${item.id}`} 
              className="flex items-center justify-center gap-2 rounded-md bg-white px-8 py-2.5 font-bold text-black transition-colors hover:bg-zinc-200"
              onClick={() => setIsOpen(false)}
            >
              <Play className="size-5 fill-black" />
              Play
            </Link>
            
            <button className="flex size-10 items-center justify-center rounded-full border-2 border-zinc-500 bg-zinc-900 hover:border-white transition-colors group">
              <Plus className="size-5 group-hover:scale-110 transition-transform" />
            </button>
            
            <Link 
              href={`${itemDetailRedirect(itemType)}/${item.id}`} 
              className="flex size-10 items-center justify-center rounded-full border-2 border-zinc-500 bg-zinc-900 hover:border-white transition-colors ml-auto group"
              onClick={() => setIsOpen(false)}
            >
              <Info className="size-5 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
