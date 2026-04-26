'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Bookmark, Search } from 'lucide-react'

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
  ]

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] flex items-center justify-around bg-black/90 backdrop-blur-xl border-t border-white/10 pb-safe pt-2 px-2 lg:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors",
              isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon className={cn("size-6", isActive && "fill-white/20")} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium tracking-wide">
              {item.title}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
