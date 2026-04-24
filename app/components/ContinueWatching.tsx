"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconPlayerPlay } from "@tabler/icons-react";

interface WatchProgress {
  id: number;
  type: "movie" | "tv" | "anime";
  title: string;
  poster: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  progress: number;
  updatedAt: number;
}

export default function ContinueWatching() {
  const [progress, setProgress] = useState<WatchProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("CineWatch_watch_progress") || "[]");
      setProgress(stored);
    } catch {
      setProgress([]);
    }
    setLoading(false);
  }, []);

  if (loading || progress.length === 0) return null;

  // Get unique items by id + type (keep latest)
  const uniqueMap = new Map<string, WatchProgress>();
  progress.forEach((item) => {
    const key = `${item.type}-${item.id}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });
  const uniqueItems = Array.from(uniqueMap.values()).slice(0, 3);

  return (
    <section className="animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-accent rounded-full" />
        <h2 className="text-xl font-bold tracking-tight">Continue Watching</h2>
      </div>
      
      <div className="flex flex-wrap gap-4 sm:gap-6">
        {uniqueItems.map((item) => {
          const href =
            item.type === "movie"
              ? `/movie/${item.id}/watch`
              : item.type === "tv"
              ? `/series/${item.id}/watch?season=${item.season ?? 1}&ep=${item.episode ?? 1}`
              : `/anime/${item.id}/watch?ep=${item.episode ?? 1}`;

          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={href}
              className="group relative block w-[calc(50%-0.5rem)] sm:w-[180px] lg:w-[200px] shrink-0"
            >
              <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-white/[0.05] group-hover:border-white/20 transition-all duration-300 shadow-xl group-hover:shadow-accent/10 group-hover:scale-[1.02]">
                <Image
                  src={item.poster || "https://placehold.co/400x600/0a0a0a/71717a?text=No+Image"}
                  alt={item.title}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay with progress bar at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                  <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl">
                    <IconPlayerPlay className="w-6 h-6 text-black ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Progress bar simulation */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div className="h-full bg-accent w-[45%]" />
                </div>
              </div>

              <div className="mt-3 px-1">
                <h3 className="font-bold text-sm truncate text-white group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                {item.episodeTitle && (
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                    {item.episodeTitle}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
