'use client'

import React, { useState, useEffect } from 'react'
import { Bell, BellOff, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NotificationToggleProps {
  id: string | number
  title: string
  type: 'movie' | 'tv' | 'donghua'
}

export function NotificationToggle({ id, title, type }: NotificationToggleProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const subs = JSON.parse(localStorage.getItem('cinewatch_subs') || '[]')
    setIsSubscribed(subs.some((s: any) => s.id === id && s.type === type))
  }, [id, type])

  const toggleSubscription = () => {
    const subs = JSON.parse(localStorage.getItem('cinewatch_subs') || '[]')
    let newSubs
    
    if (isSubscribed) {
      newSubs = subs.filter((s: any) => !(s.id === id && s.type === type))
    } else {
      newSubs = [...subs, { id, title, type, date: new Date().toISOString() }]
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
    
    localStorage.setItem('cinewatch_subs', JSON.stringify(newSubs))
    setIsSubscribed(!isSubscribed)
    
    // Dispatch event for header to update
    window.dispatchEvent(new Event('cinewatch_subs_updated'))
  }

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        size="lg"
        onClick={toggleSubscription}
        className={cn(
          "relative group overflow-hidden rounded-2xl gap-2 transition-all duration-500",
          isSubscribed 
            ? "border-accent bg-accent/10 text-accent hover:bg-accent/20" 
            : "border-white/10 bg-white/5 hover:border-accent/50"
        )}
      >
        <AnimatePresence mode="wait">
          {isSubscribed ? (
            <motion.div
              key="off"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              className="flex items-center gap-2"
            >
              <BellOff className="size-5" />
              <span>Hapus Pengingat</span>
            </motion.div>
          ) : (
            <motion.div
              key="on"
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -45 }}
              className="flex items-center gap-2"
            >
              <Bell className="size-5 group-hover:animate-bounce" />
              <span>Ingatkan Saya</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-full mt-4 left-0 right-0 z-50 flex justify-center"
          >
            <div className="bg-accent text-black px-4 py-2 rounded-xl text-xs font-black shadow-2xl flex items-center gap-2 whitespace-nowrap">
               <Check className="size-3 stroke-[4px]" /> NOTIFIKASI AKTIF
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
