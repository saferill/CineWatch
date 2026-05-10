'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function AtmosphereBG() {
  const [activeColor, setActiveColor] = useState('rgba(59, 130, 246, 0.05)')

  useEffect(() => {
    const handleHover = (e: any) => {
      // In a real app, we would extract the dominant color from the poster
      // For now, we cycle through some premium colors for the "WOW" effect
      const colors = [
        'rgba(59, 130, 246, 0.1)',   // Blue
        'rgba(147, 51, 234, 0.1)',  // Purple
        'rgba(236, 72, 153, 0.1)',  // Pink
        'rgba(6, 182, 212, 0.1)',   // Cyan
        'rgba(16, 185, 129, 0.1)'   // Green
      ]
      setActiveColor(colors[Math.floor(Math.random() * colors.length)])
    }

    window.addEventListener('cardHover', handleHover)
    return () => window.removeEventListener('cardHover', handleHover)
  }, [])

  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none transition-colors duration-1000" style={{ background: 'black' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeColor}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] blur-[150px] rounded-full animate-pulse" style={{ background: activeColor }} />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] blur-[150px] rounded-full animate-pulse [animation-delay:2s]" style={{ background: activeColor }} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
    </div>
  )
}
