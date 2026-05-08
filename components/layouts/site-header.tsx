'use client'

import Link from 'next/link'

import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { useNavbarScrollOverlay } from '@/hooks/use-scroll-overlay'
import { buttonVariants } from '@/components/ui/button'
import { CommandMenu } from '@/components/command-menu'
import { Icons } from '@/components/icons'
import { MainNav } from '@/components/layouts/main-nav'
import { MobileNav } from '@/components/layouts/mobile-nav'
import { NotificationHub } from '@/components/layouts/notification-hub'
import { UserNav } from '@/components/layouts/user-nav'

export function SiteHeader() {
  const { isShowNavBackground } = useNavbarScrollOverlay()
  
  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 w-full transition-all duration-500',
        isShowNavBackground 
          ? 'bg-zinc-950/80 shadow-2xl backdrop-blur-2xl border-b border-white/[0.05]' 
          : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
      )}
    >
      <div className="container flex h-16 max-w-(--breakpoint-2xl) items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-1 sm:gap-4">
          <MobileNav items={siteConfig.mainNav} />
          <Link href="/" className="flex items-center space-x-2 lg:hidden group">
            <div className="size-8 rounded-lg bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
               <Icons.reelLogo className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">{siteConfig.name}</span>
          </Link>
          <MainNav items={siteConfig.mainNav} />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
          <div className="w-full max-w-[40px] sm:max-w-[150px] md:max-w-xs lg:max-w-md">
            <CommandMenu />
          </div>
          <NotificationHub />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
