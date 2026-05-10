'use client'

import React from 'react'
import Link from 'next/link'
import { IconChevronRight } from '@tabler/icons-react'

interface BlogCardProps {
  post: any
  index?: number
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=500', // Cinema seat
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500', // Film reel
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=500', // Movie screen
  'https://images.unsplash.com/photo-1598899303450-230ffdf9a6b4?q=80&w=500', // Camera
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=500'  // Clapperboard
]

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  const defaultFallback = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]

  return (
    <Link 
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-accent/40 hover:bg-white/[0.06] transition-all duration-300"
    >
      <div className="aspect-[16/9] overflow-hidden relative bg-zinc-900">
        <img 
          src={post.image || defaultFallback} 
          alt={post.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGES[(index + 1) % FALLBACK_IMAGES.length]
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="text-[7px] font-black uppercase tracking-[0.2em] bg-white text-black px-2 py-1 rounded-sm shadow-2xl">
            {post.type || 'Editorial'}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          CINEWATCH EDITORIAL
        </div>
        <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-accent transition-colors leading-snug">
          {post.title}
        </h3>
        <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
          BACA BERITA
          <IconChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
