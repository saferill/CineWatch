"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconSearch, IconX, IconMovie, IconDeviceTv, IconFlame } from "@tabler/icons-react";
import { searchAllMedia } from "@/app/actions/movieActions";
import { posterUrl } from "@/app/lib/tmdb-utils";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ movies: any[], tv: any[], anime: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchAllMedia(query);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-zinc-900/90 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <IconSearch className="w-5 h-5 text-zinc-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search movies, anime, donghua..."
                className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-zinc-600"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-500">
                ESC
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-700">
              {isLoading && (
                <div className="p-8 text-center text-zinc-500 flex flex-col items-center gap-3">
                  <div className="size-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Searching...</span>
                </div>
              )}

              {!isLoading && results && (
                <div className="space-y-4 p-2">
                  {results.movies.length > 0 && (
                    <Section title="Movies" items={results.movies} type="movie" onSelect={handleSelect} />
                  )}
                  {results.tv.length > 0 && (
                    <Section title="TV Shows" items={results.tv} type="tv" onSelect={handleSelect} />
                  )}
                  {results.anime.length > 0 && (
                    <Section title="Anime" items={results.anime} type="anime" onSelect={handleSelect} />
                  )}
                </div>
              )}

              {!isLoading && query && results?.movies.length === 0 && results?.tv.length === 0 && results?.anime.length === 0 && (
                <div className="p-12 text-center text-zinc-500">
                  <p>No results found for "{query}"</p>
                </div>
              )}

              {!query && (
                <div className="p-8 text-center text-zinc-500">
                  <IconFlame className="w-8 h-8 mx-auto mb-2 text-orange-500 opacity-50" />
                  <p className="text-sm">Quickly find your favorite content</p>
                  <p className="text-[10px] mt-1 text-zinc-600">Press Ctrl+K from anywhere</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, items, type, onSelect }: { title: string, items: any[], type: string, onSelect: (href: string) => void }) {
  return (
    <div>
      <h3 className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => {
          const href = type === 'movie' ? `/movie/${item.id}` : type === 'tv' ? `/series/${item.id}` : `/anime/${item.id}`;
          const itemTitle = item.title?.romaji || item.title || item.name;
          const image = item.coverImage?.medium || posterUrl(item.poster_path, 'w92');

          return (
            <button
              key={item.id}
              onClick={() => onSelect(href)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
            >
              <div className="relative size-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                <img src={image} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate group-hover:text-accent transition-colors">{itemTitle}</p>
                <p className="text-[10px] text-zinc-500 capitalize">{type}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
