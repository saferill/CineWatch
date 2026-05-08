'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Compass, Bookmark, Search, User } from 'lucide-react'

import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: 'Home',
      href: '/',
      icon: Home,
    },
    {
      title: 'Explore',
      href: '/explore',
      icon: Compass,
    },
    {
      title: 'Search',
      href: '/search',
      icon: Search,
    },
    {
      title: 'Watchlist',
      href: '/watchlist',
      icon: Bookmark,
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: User,
    },
  ]

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] flex items-center justify-around bg-zinc-950/80 backdrop-blur-2xl border-t border-white/[0.08] pb-safe pt-2 px-4 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full py-1.5 gap-1 transition-all duration-300 relative",
              isActive ? "text-white scale-110" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon className={cn("size-5", isActive && "fill-white/10")} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className={cn("text-[9px] font-bold tracking-tight uppercase", isActive ? "opacity-100" : "opacity-60")}>
              {item.title}
            </span>
            {isActive && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              />
            )}
          </Link>
        )
      })}
    </div>
  )
}
