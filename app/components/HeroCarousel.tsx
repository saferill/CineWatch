"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/app/lib/types";
import { backdropUrl } from "@/app/lib/tmdb";
import {
  IconPlayerPlay,
  IconStar,
  IconInfoCircle,
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
} from "@tabler/icons-react";

export default function HeroCarousel({
  movies,
  logos,
}: {
  movies: Movie[];
  logos: (string | null)[];
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(idx);
        setTransitioning(false);
      }, 150);
    },
    [transitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % movies.length);
  }, [current, movies.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + movies.length) % movies.length);
  }, [current, movies.length, goTo]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const movie = movies[current];
  const logo = logos[current];

  return (
    <section
      className="relative w-full h-[260px] sm:h-[360px] md:h-[460px] lg:h-[540px] overflow-hidden rounded-2xl border border-white/[0.04] shadow-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images */}
      {movies.map((m, i) => (
        <Image
          key={m.id}
          src={backdropUrl(m.backdrop_path)}
          alt={m.title}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_50%,rgba(0,0,0,0.5)_100%)]" />

      {/* Content */}
      <div
        className={`absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-10 transition-all duration-300 ${
          transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
            Featured
          </span>
        </div>

        {/* Logo or Title */}
        {logo ? (
          <div className="mb-3">
            <img
              src={logo}
              alt={movie.title}
              className="h-10 sm:h-14 md:h-18 w-auto max-w-[180px] sm:max-w-[260px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            />
          </div>
        ) : (
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight max-w-xs sm:max-w-lg md:max-w-xl leading-tight mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {movie.title}
          </h1>
        )}

        {/* Overview */}
        <p className="text-[11px] sm:text-sm text-zinc-400 max-w-[240px] sm:max-w-sm md:max-w-lg line-clamp-2 mb-4 leading-relaxed">
          {movie.overview}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs mb-5">
          <div className="flex items-center gap-1.5">
            <IconStar
              className="w-3.5 h-3.5 text-amber-400"
              fill="currentColor"
              stroke={0}
            />
            <span className="font-bold text-white">
              {movie.vote_average?.toFixed(1) ?? "N/A"}
            </span>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1.5 text-zinc-400">
            <IconCalendar className="w-3.5 h-3.5" stroke={1.5} />
            {movie.release_date?.slice(0, 4) ?? "—"}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href={`/movie/${movie.id}/watch`}
            className="flex items-center gap-2 h-9 sm:h-10 px-4 sm:px-5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs sm:text-sm hover:bg-accent-hover transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-105"
          >
            <IconPlayerPlay
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              fill="currentColor"
              stroke={0}
            />
            Watch Now
          </Link>
          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-2 h-9 sm:h-10 px-4 sm:px-5 rounded-xl glass text-xs sm:text-sm font-medium hover:bg-white/[0.08] transition-all duration-200"
          >
            <IconInfoCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" stroke={1.5} />
            Details
          </Link>
        </div>
      </div>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full glass bg-black/30 text-white hover:bg-black/50 transition-all duration-200 z-10 hidden sm:flex items-center justify-center hover:scale-105"
      >
        <IconChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" stroke={2} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full glass bg-black/30 text-white hover:bg-black/50 transition-all duration-200 z-10 hidden sm:flex items-center justify-center hover:scale-105"
      >
        <IconChevronRight className="w-4 h-4 sm:w-5 sm:h-5" stroke={2} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-5 flex items-center gap-1.5 z-10">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-400 ${
              i === current
                ? "w-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                : "w-1.5 bg-white/25 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            key={current}
            className="h-full bg-accent origin-left"
            style={{
              animation: "progress-bar 6s linear forwards",
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progress-bar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}
