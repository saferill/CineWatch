import Link from "next/image";
import LinkNext from "next/link";
import { IconMovie, IconBrandGithub, IconBrandTwitter, IconBrandInstagram, IconHeartFilled } from "@tabler/icons-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/[0.05] bg-black/40 backdrop-blur-md pb-10 pt-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand section */}
          <div className="md:col-span-1">
            <LinkNext href="/" className="flex items-center gap-2 mb-6">
              <Image src="/logo.png" alt="CineWatch" width={120} height={35} className="h-8 w-auto object-contain" />
            </LinkNext>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Your premium destination for streaming movies, series, and anime with a minimalist and elegant experience.
            </p>
          </div>

          {/* Navigation section */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-4">
              <li><LinkNext href="/movies" className="text-zinc-400 hover:text-white transition-colors text-sm">Movies</LinkNext></li>
              <li><LinkNext href="/series" className="text-zinc-400 hover:text-white transition-colors text-sm">TV Series</LinkNext></li>
              <li><LinkNext href="/anime" className="text-zinc-400 hover:text-white transition-colors text-sm">Anime</LinkNext></li>
              <li><LinkNext href="/watchlist" className="text-zinc-400 hover:text-white transition-colors text-sm">My List</LinkNext></li>
            </ul>
          </div>

          {/* Info section */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Support</h4>
            <ul className="space-y-4">
              <li><LinkNext href="/privacy" className="text-zinc-400 hover:text-white transition-colors text-sm">Privacy Policy</LinkNext></li>
              <li><LinkNext href="/terms" className="text-zinc-400 hover:text-white transition-colors text-sm">Terms of Service</LinkNext></li>
              <li><LinkNext href="/contact" className="text-zinc-400 hover:text-white transition-colors text-sm">Contact Us</LinkNext></li>
            </ul>
          </div>

          {/* Social section */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Connect</h4>
            <div className="flex gap-4">
              <LinkNext href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-110">
                <IconBrandGithub className="w-5 h-5" stroke={1.5} />
              </LinkNext>
              <LinkNext href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-110">
                <IconBrandTwitter className="w-5 h-5" stroke={1.5} />
              </LinkNext>
              <LinkNext href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-110">
                <IconBrandInstagram className="w-5 h-5" stroke={1.5} />
              </LinkNext>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs font-medium">
            © {currentYear} CineWatch. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold uppercase tracking-widest bg-white/[0.03] px-4 py-2 rounded-full border border-white/[0.05]">
            Made with <IconHeartFilled className="w-3.5 h-3.5 text-accent animate-pulse" /> by <span className="text-white">saferill</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
