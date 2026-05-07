'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getImageURL } from '@/lib/utils'

interface AmbientBackgroundProps {
  imagePath?: string | null
}

export function AmbientBackground({ imagePath }: AmbientBackgroundProps) {
  if (!imagePath) return null

  const imageUrl = getImageURL(imagePath, 'w1280')

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={imagePath}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Blurred Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-[100px] saturate-150"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          
          {/* Dark Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
