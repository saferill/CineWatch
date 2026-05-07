"use client";

import { useRef } from "react";
import type { Movie, TVShow, AnilistAnime } from "@/app/lib/types";
import MovieCard from "./MovieCard";
import { IconChevronLeft, IconChevronRight, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

type MediaItem = Movie | TVShow | AnilistAnime;

export default function MovieGrid({
  movies,
  title,
  isTV = false,
  isAnime = false,
  viewAllHref,
}: {
  movies: MediaItem[];
  title?: string;
  isTV?: boolean;
  isAnime?: boolean;
  viewAllHref?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.75;

    if (direction === "left") {
      if (scrollLeft <= 10) {
        // Loop to end
        scrollRef.current.scrollTo({ left: scrollWidth, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    } else {
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        // Loop to start
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  if (movies.length === 0) {
    return (
      <section>
        {title && (
          <h2 className="text-xl font-bold mb-6 tracking-tight">{title}</h2>
        )}
        <p className="text-muted-foreground text-center py-16">No results found.</p>
      </section>
    );
  }

  return (
    <section className="group/section">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-accent rounded-full" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="hidden sm:flex items-center gap-1 text-xs text-zinc-500 hover:text-accent transition-colors mr-1"
              >
                View All <IconArrowRight className="w-3 h-3" stroke={2} />
              </Link>
            )}
            <button
              onClick={() => scroll("left")}
              className="w-7 h-7 rounded-lg glass flex items-center justify-center hover:bg-white/[0.08] transition-all text-zinc-500 hover:text-foreground"
            >
              <IconChevronLeft className="w-3.5 h-3.5" stroke={2} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-7 h-7 rounded-lg glass flex items-center justify-center hover:bg-white/[0.08] transition-all text-zinc-500 hover:text-foreground"
            >
              <IconChevronRight className="w-3.5 h-3.5" stroke={2} />
            </button>
          </div>
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
      >
        {movies.map((movie) => (
          <MovieCard
            key={isAnime ? (movie as AnilistAnime).id : movie.id}
            movie={movie}
            isTV={isTV}
            isAnime={isAnime}
          />
        ))}
      </div>
    </section>
  );
}
