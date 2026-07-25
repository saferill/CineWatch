'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface FloatingPlayerContextType {
  isOpen: boolean
  url: string | null
  title: string | null
  openPlayer: (url: string, title: string) => void
  closePlayer: () => void
}

const FloatingPlayerContext = createContext<FloatingPlayerContextType | undefined>(undefined)

export function FloatingPlayerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [title, setTitle] = useState<string | null>(null)

  const openPlayer = (videoUrl: string, videoTitle: string) => {
    setUrl(videoUrl)
    setTitle(videoTitle)
    setIsOpen(true)
  }

  const closePlayer = () => {
    setIsOpen(false)
    setUrl(null)
    setTitle(null)
  }

  return (
    <FloatingPlayerContext.Provider value={{ isOpen, url, title, openPlayer, closePlayer }}>
      {children}
    </FloatingPlayerContext.Provider>
  )
}

export function useFloatingPlayer() {
  const context = useContext(FloatingPlayerContext)
  if (context === undefined) {
    throw new Error('useFloatingPlayer must be used within a FloatingPlayerProvider')
  }
  return context
}
