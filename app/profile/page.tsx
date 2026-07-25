'use client'

import React, { useState, useEffect } from 'react'
import { User, Clock, Film, Tv, Play, BarChart3, Trash2, ShieldCheck, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ProfilePage() {
  const [stats, setStats] = useState({
    totalWatched: 0,
    movieCount: 0,
    seriesCount: 0,
    animeCount: 0,
    history: [] as any[]
  })

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('CineWatch_watch_progress') || '[]')
    
    const movieCount = history.filter((i: any) => i.type === 'movie').length
    const seriesCount = history.filter((i: any) => i.type === 'tv').length
    const animeCount = history.filter((i: any) => i.type === 'anime').length

    setStats({
      totalWatched: history.length,
      movieCount,
      seriesCount,
      animeCount,
      history
    })
  }, [])

  const clearHistory = () => {
    if (confirm('Hapus semua riwayat menonton?')) {
       localStorage.removeItem('CineWatch_watch_progress')
       setStats({ totalWatched: 0, movieCount: 0, seriesCount: 0, animeCount: 0, history: [] })
    }
  }

  return (
    <main className="min-h-screen bg-black pt-24 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header Profile */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16 p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900 to-transparent border border-white/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -z-10" />
           <div className="size-32 rounded-full bg-accent flex items-center justify-center text-black">
              <User className="size-16" />
           </div>
           <div className="text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-3">
                 <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Guest Watcher</h1>
                 <Badge className="bg-accent/20 text-accent border-accent/20">PRO USER</Badge>
              </div>
              <p className="text-zinc-500 font-bold tracking-wide italic">"Penonton setia CineWatch sejak hari ini"</p>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
           {[
             { label: 'Total Nonton', val: stats.totalWatched, icon: Play, color: 'text-white' },
             { label: 'Movies', val: stats.movieCount, icon: Film, color: 'text-cyan-500' },
             { label: 'Series', val: stats.seriesCount, icon: Tv, color: 'text-purple-500' },
             { label: 'Anime', val: stats.animeCount, icon: BarChart3, color: 'text-accent' }
           ].map((s, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 flex flex-col items-center gap-2 text-center"
             >
                <s.icon className={cn("size-6 mb-1", s.color)} />
                <span className="text-3xl font-black text-white">{s.val}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{s.label}</span>
             </motion.div>
           ))}
        </div>

        {/* Achievements / Perks */}
        <div className="mb-16">
           <div className="flex items-center gap-4 mb-8">
              <Trophy className="size-5 text-accent" />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Pencapaian Anda</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center gap-4 grayscale opacity-40">
                 <div className="size-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                    <Clock className="size-5" />
                 </div>
                 <div className="text-xs font-bold text-zinc-400 uppercase">Movie Marathoner</div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center gap-4">
                 <div className="size-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <ShieldCheck className="size-5" />
                 </div>
                 <div className="text-xs font-bold text-white uppercase tracking-tight">Verified Viewer</div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center gap-4 grayscale opacity-40">
                 <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <Play className="size-5" />
                 </div>
                 <div className="text-xs font-bold text-zinc-400 uppercase">Binge Watcher</div>
              </div>
           </div>
        </div>

        {/* Recent Activity List */}
        <div className="space-y-6">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <Clock className="size-5 text-zinc-500" />
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">Riwayat Menonton</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearHistory}
                className="text-zinc-500 hover:text-red-500 text-xs font-bold gap-2"
              >
                 <Trash2 className="size-4" /> Hapus Semua
              </Button>
           </div>

           {stats.history.length === 0 ? (
             <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Belum ada aktivitas</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-4">
                {stats.history.map((item: any, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-6 p-4 rounded-2xl bg-zinc-900/30 border border-white/5 group hover:bg-white/5 transition-colors"
                  >
                     <img src={item.poster} className="size-16 object-cover rounded-lg shadow-xl" />
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-accent uppercase tracking-tighter">{item.type}</p>
                        <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                        <p className="text-[10px] text-zinc-500">{item.episodeTitle || 'Full Movie'}</p>
                     </div>
                     <Link href={item.type === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`}>
                        <Button size="icon" variant="ghost" className="rounded-full text-zinc-500 group-hover:text-white">
                           <Play className="size-4 fill-current" />
                        </Button>
                     </Link>
                  </motion.div>
                ))}
             </div>
           )}
        </div>
      </div>
    </main>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
