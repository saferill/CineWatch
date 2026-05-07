import React from 'react'
import Link from 'next/link'

import { siteConfig } from '@/config/site'
import { Icons } from '@/components/icons'

export function Footer() {
  return (
    <footer className="container space-y-12 pb-24 pt-16 text-sm text-slate-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/10 pt-16">
        <div className="col-span-2 md:col-span-1 flex justify-center md:justify-start items-start">
          <Link href="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <Icons.reelLogo className="size-10" />
            <span className="sr-only">{siteConfig.name}</span>
          </Link>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-300 mb-6 text-base tracking-wide">Movies</h3>
          <ul className="space-y-4">
            <li><Link href="/movies" className="hover:text-white transition-colors">Discover</Link></li>
            <li><Link href="/?type=movies" className="hover:text-white transition-colors">Trending</Link></li>
            <li><Link href="/?type=movies" className="hover:text-white transition-colors">Popular</Link></li>
            <li><Link href="/movies" className="hover:text-white transition-colors">Now Playing</Link></li>
            <li><Link href="/movies" className="hover:text-white transition-colors">Upcoming</Link></li>
            <li><Link href="/?type=movies" className="hover:text-white transition-colors">Top Rated</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-300 mb-6 text-base tracking-wide">Shows</h3>
          <ul className="space-y-4">
            <li><Link href="/series" className="hover:text-white transition-colors">Discover</Link></li>
            <li><Link href="/?type=series" className="hover:text-white transition-colors">Trending</Link></li>
            <li><Link href="/anime" className="hover:text-white transition-colors">Anime</Link></li>
            <li><Link href="/?type=series" className="hover:text-white transition-colors">Popular</Link></li>
            <li><Link href="/series" className="hover:text-white transition-colors">Airing Today</Link></li>
            <li><Link href="/series" className="hover:text-white transition-colors">On The Air</Link></li>
            <li><Link href="/?type=series" className="hover:text-white transition-colors">Top Rated</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-300 mb-6 text-base tracking-wide">More</h3>
          <ul className="space-y-4">
            <li><Link href="/explore" className="hover:text-white transition-colors">Live TV / Explore</Link></li>
            <li><Link href="/watchlist" className="hover:text-white transition-colors">Watchlist</Link></li>
            <li><Link href={siteConfig.links.github} className="hover:text-white transition-colors">GitHub</Link></li>
            <li><Link href={siteConfig.links.twitter} className="hover:text-white transition-colors">Twitter / X</Link></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-8 border-t border-white/10 text-xs">
        <p className="text-center leading-loose">
          Coded in{' '}
          <Link
            href="https://code.visualstudio.com/"
            className="font-medium text-slate-300/75"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visual Studio Code
          </Link>{' '}
          by{' '}
          <Link
            href={siteConfig.links.github}
            className="font-bold text-white hover:underline transition-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            saferill
          </Link>
          . Built with{' '}
          <Link
            href="https://nextjs.org/"
            className="font-medium text-slate-300/75"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </Link>{' '}
          and{' '}
          <Link
            href="https://tailwindcss.com/"
            className="font-medium text-slate-300/75"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tailwind CSS
          </Link>
          , deployed with{' '}
          <Link
            href="https://vercel.com/"
            className="font-medium text-slate-300/75"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cloudflare
          </Link>
          , Using{' '}
          <Link
            href="https://vidsrc.to/"
            className="font-medium text-slate-300/75"
            target="_blank"
            rel="noopener noreferrer"
          >
            VidSrc
          </Link>
          .
        </p>
      </div>
    </footer>
  )
}
