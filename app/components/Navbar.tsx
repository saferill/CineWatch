"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import SearchBar from "./SearchBar";
import {
  IconMovie,
  IconDeviceTv,
  IconMoodHappy,
  IconFlame,
  IconMenu2,
  IconX,
  IconBookmark,
  IconDice5,
} from "@tabler/icons-react";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: IconFlame, exact: true },
  { href: "/movies", label: "Movies", icon: IconMovie, exact: false },
  { href: "/series", label: "Series", icon: IconDeviceTv, exact: false },
  { href: "/anime", label: "Anime", icon: IconMoodHappy, exact: false },
  { href: "/watchlist", label: "My List", icon: IconBookmark, exact: false },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/80 backdrop-blur-2xl border-b border-white/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/" className="flex items-center shrink-0 group transition-transform hover:scale-105 active:scale-95">
              <Image 
                src="/logo.png" 
                alt="CineWatch" 
                width={140} 
                height={40} 
                className="h-9 w-auto object-contain brightness-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                priority
              />
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1 ml-2">
              {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      active
                        ? "text-white bg-white/[0.08]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        active ? "text-accent" : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                      stroke={active ? 2.5 : 2}
                    />
                    {label}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <SearchBar />

            {/* Surprise Me / Dice */}
            <button
              onClick={() => {
                const randomId = [157336, 155, 120, 27205, 550, 680, 238][Math.floor(Math.random() * 7)];
                window.location.href = `/movie/${randomId}`;
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs font-semibold text-zinc-400 hover:text-accent-foreground hover:bg-white/10 transition-colors ml-2"
              title="Surprise Me!"
            >
              <IconDice5 className="w-4 h-4" stroke={2} />
              Surprise Me
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden w-9 h-9 rounded-xl glass flex items-center justify-center text-zinc-400 hover:text-white transition-colors ml-1"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <IconX className="w-5 h-5" stroke={2} />
              ) : (
                <IconMenu2 className="w-5 h-5" stroke={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-[#0a0a14]/98 backdrop-blur-xl border-t border-white/[0.05] px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon
                    className={`w-4.5 h-4.5 ${active ? "text-accent" : "text-zinc-500"}`}
                    stroke={active ? 2.5 : 2}
                  />
                  {label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Spacer to prevent content going behind fixed navbar */}
      <div className="h-16" />
    </>
  );
}
