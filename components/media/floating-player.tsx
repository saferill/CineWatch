'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, Move } from 'lucide-react'
import { useFloatingPlayer } from '@/context/floating-player-context'

export function FloatingPlayer() {
  const { isOpen, url, title, closePlayer } = useFloatingPlayer()

  if (!isOpen || !url) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 100 }}
        drag
        dragConstraints={{ left: -1000, right: 0, top: -1000, bottom: 0 }}
        className="fixed bottom-24 right-6 z-[100] w-[320px] md:w-[400px] aspect-video bg-zinc-950 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden group cursor-grab active:cursor-grabbing"
      >
        {/* Header / Controls */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-4 z-10">
           <div className="flex items-center gap-2">
              <Move className="size-3 text-zinc-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest line-clamp-1 max-w-[150px]">
                 {title}
              </span>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={closePlayer}
                className="p-1 rounded-full hover:bg-red-500/20 text-zinc-400 hover:text-red-500 transition-colors"
              >
                <X className="size-4" />
              </button>
           </div>
        </div>

        {/* Video Iframe */}
        <iframe
          src={url}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
        />

        {/* Resize Hint */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-50 pointer-events-none">
           <Maximize2 className="size-3 text-white" />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
