"use client";


import { useWatchlist } from "@/app/hooks/useWatchlist";
import MovieCard from "@/app/components/MovieCard";
import { IconBookmarkOff } from "@tabler/icons-react";
import Link from "next/link";

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();

  return (
    <>
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest">Your Collection</p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">My List</h1>
        </div>

        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
              <IconBookmarkOff className="w-8 h-8 text-zinc-500" stroke={1.5} />
            </div>
            <h2 className="text-xl font-bold mb-2">Your list is empty</h2>
            <p className="text-zinc-400 mb-6 max-w-md">
              Looks like you haven't added anything to your list yet. Start exploring and save your favorites!
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent-hover transition-colors shadow-lg"
            >
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6 animate-fade-up">
            {watchlist.map((item) => (
              <MovieCard
                key={`${item.type}-${item.id}`}
                movie={{
                  id: item.id,
                  title: item.title,
                  poster_path: item.poster.replace("https://image.tmdb.org/t/p/w500", ""),
                  vote_average: 0,
                  overview: "",
                } as any}
                isTV={item.type === "tv"}
                isAnime={item.type === "anime"}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
