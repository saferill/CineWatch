'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Trash2, ExternalLink, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function NotificationHub() {
  const [subs, setSubs] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const loadSubs = () => {
    const items = JSON.parse(localStorage.getItem('cinewatch_subs') || '[]')
    setSubs(items)
  }

  useEffect(() => {
    loadSubs()
    window.addEventListener('cinewatch_subs_updated', loadSubs)
    return () => window.removeEventListener('cinewatch_subs_updated', loadSubs)
  }, [])

  const removeSub = (id: string | number, type: string) => {
    const newSubs = subs.filter(s => !(s.id === id && s.type === type))
    localStorage.setItem('cinewatch_subs', JSON.stringify(newSubs))
    setSubs(newSubs)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
            variant="ghost" 
            size="icon" 
            className="relative rounded-full hover:bg-white/10 transition-colors"
        >
          <Bell className={cn("size-5", subs.length > 0 && "animate-tada text-accent")} />
          {subs.length > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-black text-black">
              {subs.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 bg-zinc-950/95 border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <h3 className="font-black text-sm uppercase tracking-widest text-white">Notifikasi</h3>
           <Badge variant="outline" className="text-[10px] border-white/10">{subs.length} Aktif</Badge>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
           {subs.length === 0 ? (
             <div className="p-12 text-center space-y-4">
                <div className="size-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
                   <Info className="size-6 text-zinc-700" />
                </div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Belum ada pengingat</p>
             </div>
           ) : (
             <div className="divide-y divide-white/5">
                {subs.map((item, index) => (
                  <div key={index} className="p-4 hover:bg-white/5 transition-colors group">
                     <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                           <p className="text-xs font-black text-accent uppercase tracking-tighter">{item.type}</p>
                           <p className="text-sm font-bold text-white line-clamp-1">{item.title}</p>
                           <p className="text-[10px] text-zinc-500 italic">Ditambahkan {new Date(item.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button 
                              variant="ghost" 
                              size="icon" 
                              className="size-8 rounded-full text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => removeSub(item.id, item.type)}
                           >
                              <Trash2 className="size-4" />
                           </Button>
                           <Link href={item.type === 'movie' ? `/movie/${item.id}` : (item.type === 'tv' ? `/series/${item.id}` : `/donghua/detail/${item.id}`)}>
                              <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="size-8 rounded-full text-zinc-500 hover:text-accent hover:bg-accent/10"
                                 onClick={() => setIsOpen(false)}
                              >
                                 <ExternalLink className="size-4" />
                              </Button>
                           </Link>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
        
        {subs.length > 0 && (
           <div className="p-4 bg-white/5 border-t border-white/5">
              <Link href="/schedule" onClick={() => setIsOpen(false)}>
                 <Button className="w-full bg-accent text-black font-black uppercase text-xs tracking-widest rounded-xl">
                    Cek Jadwal Rilis
                 </Button>
              </Link>
           </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
