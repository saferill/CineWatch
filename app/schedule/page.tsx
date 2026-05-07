'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ChevronRight, Play, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const SCHEDULE_DATA: Record<string, any[]> = {
  'Senin': [
    { title: 'The Demon Hunter', time: '10:00', type: 'Donghua', status: 'New Episode', image: 'https://images.tmdb.org/t/p/w500/u3vK3rG7G0A9zS8Gq4l6W5mF7L6.jpg' },
    { title: 'Peerless Martial Spirit', time: '18:00', type: 'Donghua', status: 'Ongoing', image: 'https://images.tmdb.org/t/p/w500/kZ9E9ZzZzZzZzZzZzZzZzZzZzZz.jpg' }
  ],
  'Selasa': [
    { title: 'Against the Sky Supreme', time: '11:00', type: 'Donghua', status: 'New Episode', image: 'https://images.tmdb.org/t/p/w500/mN9m9m9m9m9m9m9m9m9m9m9m9m9.jpg' }
  ],
  'Rabu': [
    { title: 'Swallowed Star', time: '09:00', type: 'Donghua', status: 'New Episode', image: 'https://images.tmdb.org/t/p/w500/vN9v9v9v9v9v9v9v9v9v9v9v9v9.jpg' },
    { title: 'A Will Eternal', time: '10:00', type: 'Donghua', status: 'Hot', image: 'https://images.tmdb.org/t/p/w500/bN9b9b9b9b9b9b9b9b9b9b9b9b9.jpg' }
  ],
  'Kamis': [
    { title: 'Throne of Seal', time: '10:00', type: 'Donghua', status: 'New Episode', image: 'https://images.tmdb.org/t/p/w500/u3vK3rG7G0A9zS8Gq4l6W5mF7L6.jpg' }
  ],
  'Jumat': [
    { title: 'Perfect World', time: '10:00', type: 'Donghua', status: 'New Episode', image: 'https://images.tmdb.org/t/p/w500/xN9x9x9x9x9x9x9x9x9x9x9x9x9.jpg' }
  ],
  'Sabtu': [
    { title: 'Soul Land II', time: '09:00', type: 'Donghua', status: 'Popular', image: 'https://images.tmdb.org/t/p/w500/yN9y9y9y9y9y9y9y9y9y9y9y9y9.jpg' },
    { title: 'Shrouding the Heavens', time: '10:00', type: 'Donghua', status: 'New Episode', image: 'https://images.tmdb.org/t/p/w500/zN9z9z9z9z9z9z9z9z9z9z9z9z9.jpg' }
  ],
  'Minggu': [
    { title: 'Battle Through the Heavens', time: '10:00', type: 'Donghua', status: 'Must Watch', image: 'https://images.tmdb.org/t/p/w500/aN9a9a9a9a9a9a9a9a9a9a9a9a9.jpg' },
    { title: 'Martial Universe', time: '11:00', type: 'Donghua', status: 'Ongoing', image: 'https://images.tmdb.org/t/p/w500/cN9cN9cN9cN9cN9cN9cN9cN9cN9.jpg' }
  ]
}

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState('Sabtu') // Default to current day ideally

  return (
    <main className="min-h-screen bg-black pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-accent font-bold tracking-widest uppercase text-xs">
              <Calendar className="size-4" />
              <span>Update Harian</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              JADWAL <span className="text-accent">RILIS</span>
            </h1>
            <p className="text-zinc-500 max-w-md">
              Jangan lewatkan episode terbaru dari Donghua dan Anime favoritmu. Jadwal diperbarui secara real-time.
            </p>
          </div>
          
          <div className="flex bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-1 rounded-2xl overflow-x-auto no-scrollbar">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={cn(
                  "px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  activeDay === day 
                    ? "bg-accent text-black shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]" 
                    : "text-zinc-500 hover:text-white"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-4"
            >
              {(SCHEDULE_DATA[activeDay] || []).map((item, index) => (
                <div 
                  key={index}
                  className="group relative flex items-center gap-6 p-4 rounded-[2rem] bg-zinc-900/30 border border-white/5 hover:border-accent/30 transition-all duration-500 overflow-hidden"
                >
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Image */}
                  <div className="relative size-24 md:size-32 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase border-accent/30 text-accent font-bold">
                        {item.type}
                      </Badge>
                      <span className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold">
                        <Clock className="size-3" />
                        {item.time} WIB
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-zinc-500 font-medium">{item.status}</span>
                       <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                          Lihat <ChevronRight className="size-4" />
                       </button>
                    </div>
                  </div>

                  {/* Subscribe Icon */}
                  <button className="p-3 rounded-full bg-white/5 hover:bg-accent hover:text-black transition-all">
                    <Bell className="size-5" />
                  </button>
                </div>
              ))}
              
              {(!SCHEDULE_DATA[activeDay] || SCHEDULE_DATA[activeDay].length === 0) && (
                 <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest">Belum ada jadwal untuk hari ini</p>
                 </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Sidebar Promo */}
          <div className="hidden lg:block space-y-6">
             <div className="relative rounded-[3rem] p-10 bg-accent text-black overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 size-64 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 space-y-6">
                   <h2 className="text-4xl font-black leading-none">JANGAN<br/>KELEWATAN!</h2>
                   <p className="font-bold opacity-80">Aktifkan notifikasi untuk mendapatkan pemberitahuan instan saat episode baru rilis.</p>
                   <button className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">
                      <Bell className="size-5" /> Aktifkan Sekarang
                   </button>
                </div>
             </div>
             
             <div className="rounded-[3rem] p-8 border border-white/5 bg-zinc-900/20 space-y-6">
                <h3 className="text-xl font-bold">Terpopuler Minggu Ini</h3>
                <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 group cursor-pointer">
                         <div className="size-12 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-xl text-zinc-600 group-hover:text-accent transition-colors">0{i}</div>
                         <div>
                            <p className="font-bold line-clamp-1">Donghua Judul {i}</p>
                            <p className="text-xs text-zinc-500">Trending #1</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  )
}
