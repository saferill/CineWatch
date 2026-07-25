'use client';
import React from 'react'
import { siteConfig } from '@/config/site'

export function Footer() {
  return (
    <footer className="container space-y-12 pb-24 pt-16 text-sm text-slate-500">
      <div className="flex flex-col items-center justify-center pt-8 border-t border-white/10 text-xs text-zinc-600 font-medium">
        <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
