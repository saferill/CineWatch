'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from '@/components/icons'

export const SplashScreen = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show the splash screen once per session to not annoy the user
    const hasSeenSplash = sessionStorage.getItem('cine_splash_seen')
    
    if (!hasSeenSplash) {
      setShow(true)
      sessionStorage.setItem('cine_splash_seen', 'true')
      
      // The Netflix "Ta-Dum" effect takes about 2 to 3 seconds
      setTimeout(() => {
        setShow(false)
      }, 2500)
    }
  }, [])

  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Subtle vignette background to make it look premium */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black" />

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 1.2, 1], 
              opacity: [0, 1, 1],
              filter: ['blur(10px)', 'blur(0px)', 'blur(0px)']
            }}
            transition={{ 
              duration: 2, 
              times: [0, 0.4, 1],
              ease: "easeOut"
            }}
            className="flex flex-col items-center relative z-10"
          >
            {/* We use their Reel Logo but colored Netflix Red to mimic the 'N' drop */}
            <Icons.reelLogo 
              className="size-32 md:size-48 lg:size-64 text-[#E50914] drop-shadow-[0_0_60px_rgba(229,9,20,0.8)]" 
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
