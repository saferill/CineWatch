'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth-modal'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, LogOut, Settings, Heart, History } from 'lucide-react'
import Link from 'next/link'

export function UserNav() {
  const { user, signOut } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  if (!user) {
    return (
      <>
        <Button 
          onClick={() => setIsAuthModalOpen(true)}
          variant="ghost"
          className="rounded-full px-4 font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all text-xs sm:text-sm uppercase tracking-widest"
        >
          Login
        </Button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/10 hover:border-accent/50 transition-colors p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || ''} />
            <AvatarFallback className="bg-zinc-900 text-accent font-black uppercase">
              {user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-zinc-950 border-white/10 text-white rounded-2xl p-2 shadow-2xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black leading-none uppercase tracking-tighter">
              {user.user_metadata.full_name || 'My Account'}
            </p>
            <p className="text-xs leading-none text-zinc-500 truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <div className="p-1">
          <Link href="/watchlist">
            <DropdownMenuItem className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer py-2.5 gap-3 font-bold text-xs uppercase tracking-widest">
              <Heart className="size-4 text-accent" /> My List
            </DropdownMenuItem>
          </Link>
          <Link href="/history">
            <DropdownMenuItem className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer py-2.5 gap-3 font-bold text-xs uppercase tracking-widest">
              <History className="size-4 text-zinc-400" /> History
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer py-2.5 gap-3 font-bold text-xs uppercase tracking-widest">
            <Settings className="size-4 text-zinc-400" /> Settings
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="bg-white/5" />
        <div className="p-1">
          <DropdownMenuItem 
            className="rounded-xl focus:bg-red-500/20 focus:text-red-500 cursor-pointer py-2.5 gap-3 font-bold text-xs uppercase tracking-widest text-red-400"
            onClick={() => signOut()}
          >
            <LogOut className="size-4" /> Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
