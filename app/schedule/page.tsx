'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ChevronRight, Play, Bell, Info, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { fetchDonghuaHome } from '@/services/donghua'
import { NotificationToggle } from '@/components/media/notification-toggle'

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState('Sabtu')
  const [donghuaList, setDonghuaList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' })
    setActiveDay(today || 'Sabtu')

    async function loadData() {
      try {
        const data = await fetchDonghuaHome()
        setDonghuaList(data.recent || [])
      } catch (error) {
        console.error('Failed to load schedule data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <main className="min-h-screen bg-black pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col gap-10 mb-16 text-center md:text-left">
           <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                 Release <span className="text-accent">Schedule</span>
              </h1>
              <p className="text-zinc-500 font-bold max-w-xl mx-auto md:mx-0">
                 Pantau jadwal penayangan episode terbaru. Aktifkan notifikasi browser agar Anda tetap mendapatkan kabar meskipun tidak membuka website.
              </p>
           </div>

           {/* Day Nav */}
           <div className="flex bg-zinc-900/40 border border-white/5 p-1.5 rounded-[2rem] overflow-x-auto no-scrollbar shadow-2xl w-fit mx-auto md:mx-0">
             {DAYS.map((day) => (
               <button
                 key={day}
                 onClick={() => setActiveDay(day)}
                 className={cn(
                   "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                   activeDay === day 
                     ? "bg-accent text-black shadow-[0_10px_20px_rgba(var(--accent-rgb),0.3)]" 
                     : "text-zinc-500 hover:text-white"
                 )}
               >
                 {day}
               </button>
             ))}
           </div>
        </div>

        {/* Content Grid - Clean & Spaced */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeDay + loading}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="contents"
             >
               {loading ? (
                 Array.from({ length: 10 }).map((_, i) => (
                   <div key={i} className="aspect-[2/3] rounded-[2rem] bg-zinc-900/50 animate-pulse" />
                 ))
               ) : (
                 donghuaList.map((item, index) => (
                   <div 
                    key={index}
                    className="group relative flex flex-col gap-4"
                   >
                     {/* Poster Container */}
                     <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-900 shadow-2xl transition-all duration-500 group-hover:border-accent/40 group-hover:scale-[1.02]">
                        <Link href={item.href} className="absolute inset-0 z-0">
                           <img 
                              src={item.poster} 
                              alt={item.title} 
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                           />
                        </Link>
                        
                        {/* Status Overlay */}
                        <div className="absolute top-4 left-4 z-10">
                           <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black px-2 py-0.5 rounded-lg">
                              EP {item.episodes}
                           </Badge>
                        </div>

                        {/* Notification Button - Now Icon Only to save space */}
                        <div className="absolute top-4 right-4 z-20">
                           <NotificationToggle id={item.title} title={item.title} type="donghua" iconOnly />
                        </div>

                        {/* Play Overlay */}
                        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-[2px] pointer-events-none">
                           <div className="size-16 rounded-full bg-accent flex items-center justify-center text-black shadow-2xl">
                              <Play className="size-8 fill-current" />
                           </div>
                        </div>
                     </div>

                     {/* Info Section - Clean Typography */}
                     <div className="px-2 space-y-1">
                        <Link href={item.href} className="block">
                           <h3 className="text-sm font-black text-white group-hover:text-accent transition-colors line-clamp-1 uppercase tracking-tight">
                              {item.title}
                           </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                           <Clock className="size-3 text-accent" />
                           10:00 WIB
                        </div>
                     </div>
                   </div>
                 ))
               )}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && donghuaList.length === 0 && (
           <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
              <Info className="size-10 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Belum ada rilis hari {activeDay}</p>
           </div>
        )}

        {/* Notification Education Section */}
        <div className="mt-32 p-12 rounded-[4rem] bg-gradient-to-br from-zinc-900/50 to-transparent border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-4 text-center md:text-left max-w-xl">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Tetap Terhubung (Push Notification)</h2>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                 Agar notifikasi bisa muncul meskipun Anda tidak membuka website selama berhari-hari, Anda harus mengizinkan **Notifikasi Browser**. Kami akan mengirimkan sinyal ke perangkat Anda saat episode baru dideteksi oleh server.
              </p>
           </div>
           <button 
              onClick={() => {
                if ('Notification' in window) {
                   Notification.requestPermission().then(permission => {
                      if (permission === 'granted') {
                         new Notification('CineWatch Notifikasi Aktif!', {
                            body: 'Anda akan menerima kabar meskipun browser ditutup.',
                            icon: '/logo.png'
                         });
                      }
                   });
                }
              }}
              className="bg-accent text-black px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl"
           >
              Aktifkan Sekarang
           </button>
        </div>
      </div>
    </main>
  )
}
