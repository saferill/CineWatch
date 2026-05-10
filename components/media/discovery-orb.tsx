'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconSparkles, IconRadar, IconPlayerPlay, IconInfoCircle } from '@tabler/icons-react'
import Link from 'next/link'

export function DiscoveryOrb() {
  const [isOpen, setIsOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [recommendation, setRecommendation] = useState<any>(null)

  const scanForMovies = async () => {
    setScanning(true)
    setRecommendation(null)
    
    // Simulate AI scanning
    setTimeout(async () => {
      try {
        const res = await fetch('/api/tmdb/trending')
        const trending = await res.json()
        const random = trending[Math.floor(Math.random() * trending.length)]
        setRecommendation(random)
      } catch (e) {
        console.error(e)
      } finally {
        setScanning(false)
      }
    }, 2000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 w-80 glass border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-3xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                  <IconRadar size={24} className={scanning ? 'animate-spin' : ''} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tighter text-white">Smart Discovery</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">AI Movie Radar</p>
                </div>
              </div>

              {!recommendation && !scanning && (
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                    Biarkan AI CineWatch memindai database untuk menemukan tontonan yang sempurna untukmu saat ini.
                  </p>
                  <button 
                    onClick={scanForMovies}
                    className="w-full py-3 rounded-2xl bg-accent text-accent-foreground text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    SCAN DATABASE
                  </button>
                </div>
              )}

              {scanning && (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                      <IconRadar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 animate-pulse">Analyzing Mood & Trends...</p>
                </div>
              )}

              {recommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/5">
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${recommendation.backdrop_path}`} 
                      className="w-full h-full object-cover"
                      alt={recommendation.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3">
                      <p className="text-xs font-bold text-white truncate max-w-[200px]">{recommendation.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/movie/${recommendation.id}/watch`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                    >
                      <IconPlayerPlay size={14} fill="currentColor" />
                      Watch Now
                    </Link>
                    <Link 
                      href={`/movie/${recommendation.id}`}
                      className="size-10 flex items-center justify-center rounded-xl glass border border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                      <IconInfoCircle size={20} />
                    </Link>
                  </div>
                  
                  <button 
                    onClick={scanForMovies}
                    className="w-full text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                  >
                    Rescan for something else
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`size-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)] backdrop-blur-xl border transition-all ${
          isOpen 
            ? 'bg-accent text-accent-foreground border-accent/50 rotate-90' 
            : 'bg-zinc-950 border-white/10 text-accent hover:border-accent/30'
        }`}
      >
        {isOpen ? <IconRadar size={28} /> : <IconRadar size={28} />}
      </motion.button>
    </div>
  )
}
