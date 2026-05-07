'use client'

import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Zap, ShieldCheck, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export function SpeedOptimizer() {
  const [speed, setSpeed] = useState<number | null>(null)
  const [status, setStatus] = useState<'slow' | 'medium' | 'fast' | 'ultra'>('medium')
  const [show, setShow] = useState(false)

  const checkSpeed = async () => {
    try {
      const startTime = Date.now()
      // Download a small 512KB image or blob to test speed
      const response = await fetch('https://images.tmdb.org/t/p/original/wwemzKWzjKYJFfCeiB57q3r4Bcm.svg', { cache: 'no-store' })
      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000 // in seconds
      
      // Rough estimation of Mbps
      const mbps = (0.5 * 8) / duration 
      setSpeed(Math.round(mbps))

      if (mbps < 2) setStatus('slow')
      else if (mbps < 10) setStatus('medium')
      else if (mbps < 30) setStatus('fast')
      else setStatus('ultra')

      setShow(true)
      setTimeout(() => setShow(false), 5000)
    } catch (error) {
      console.error('Speed test failed', error)
    }
  }

  useEffect(() => {
    checkSpeed()
  }, [])

  const getRecommendation = () => {
    if (status === 'slow') return '360p / 480p (Hemat Kuota)'
    if (status === 'medium') return '720p (HD Ready)'
    if (status === 'fast') return '1080p (Full HD)'
    return '4K Ultra HD (Smooth)'
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="fixed bottom-24 left-6 z-[100] bg-zinc-950/90 backdrop-blur-2xl border border-white/10 p-4 rounded-[2rem] shadow-2xl flex items-center gap-4"
        >
          <div className={cn(
            "size-12 rounded-full flex items-center justify-center shadow-lg",
            status === 'slow' ? "bg-red-500/20 text-red-500" :
            status === 'medium' ? "bg-yellow-500/20 text-yellow-500" :
            status === 'fast' ? "bg-green-500/20 text-green-500" :
            "bg-accent/20 text-accent"
          )}>
            <Zap className="size-6 fill-current" />
          </div>
          
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <span className="text-xs font-black text-white uppercase tracking-widest">Network Optimized</span>
               <Badge className="bg-white/10 text-[10px] py-0">{speed} Mbps</Badge>
            </div>
            <p className="text-[10px] font-bold text-zinc-500">
              Saran: <span className="text-white">{getRecommendation()}</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
