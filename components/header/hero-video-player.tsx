'use client'

import React, { useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'

export const HeroVideoPlayer = ({ trailerId }: { trailerId: string }) => {
  const [isMuted, setIsMuted] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // Parallax Effect Hook
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 200])

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Mengirim perintah ke YouTube Iframe API via postMessage
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: isMuted ? 'unMute' : 'mute',
          args: [],
        }),
        '*'
      )
    }
  }

  return (
    <>
      <motion.div style={{ y }} className="absolute inset-0 z-0 w-full h-full bg-black overflow-hidden pointer-events-none scale-[1.1] origin-top">
        <iframe
          ref={iframeRef}
          className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-90"
          src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerId}&modestbranding=1&enablejsapi=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </motion.div>
      
      {/* Netflix-style Mute Toggle Button */}
      <div className="absolute top-[35vh] md:top-auto md:bottom-28 lg:bottom-32 right-4 md:right-8 lg:right-16 z-[60]">
        <button
          onClick={toggleMute}
          className="flex size-8 md:size-10 lg:size-12 items-center justify-center rounded-full border border-white/50 bg-black/30 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="size-4 md:size-5 lg:size-6" /> : <Volume2 className="size-4 md:size-5 lg:size-6" />}
        </button>
      </div>
    </>
  )
}
