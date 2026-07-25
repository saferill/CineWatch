'use client'

import React from 'react'
import Link from 'next/link'
import { IconPlayerPlay, IconShare, IconHome } from '@tabler/icons-react'
import { toast } from 'sonner'

interface BlogCTAProps {
  title: string
  slug: string
}

export function BlogCTA({ title, slug }: BlogCTAProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Baca artikel menarik ini: ${title}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link berhasil disalin ke clipboard!')
      }
    } catch (error) {
      console.log('Error sharing:', error)
    }
  }

  return (
    <div className="mt-20 p-8 md:p-12 rounded-[40px] bg-white/[0.03] border border-white/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6">
          <IconPlayerPlay size={32} />
        </div>
        
        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4">
          Eksplorasi Lebih Jauh
        </h3>
        
        <p className="text-zinc-500 text-sm md:text-base max-w-xl mb-10 leading-relaxed font-medium">
          Sukai apa yang kamu baca? Nikmati karya sinematik yang dibahas dalam artikel ini dengan kualitas terbaik hanya di platform CineWatch.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          {/* Watch Now - Searches for the title */}
          <Link 
            href={`/search?q=${encodeURIComponent(title)}`}
            className="flex items-center justify-center gap-2 py-4 px-6 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-accent hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <IconPlayerPlay size={16} />
            Tonton Sekarang
          </Link>
          
          {/* Back to Home */}
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 py-4 px-6 bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <IconHome size={16} />
            Kembali ke Home
          </Link>
          
          {/* Share */}
          <button 
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-4 px-6 bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <IconShare size={16} />
            Bagikan
          </button>
        </div>
      </div>
    </div>
  )
}
