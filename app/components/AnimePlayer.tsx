"use client";

import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconPlayerSkipBack, IconPlayerSkipForward } from "@tabler/icons-react";

interface AnimePlayerProps {
  animeId: number;
  animeTitle: string;
  episodes: number;
  episode: number;
  anilistId?: number;
  poster?: string;
  tmdbId?: number;
  tmdbType?: "movie" | "tv";
}

const EMBED_PROVIDERS = [
  {
    name: "VidNest (Sub)",
    requiresTmdb: false,
    getUrl: (title: string, ep: number, anilistId: number) => {
      return `https://vidnest.fun/anime/${anilistId}/${ep}/sub`;
    }
  },
  {
    name: "VidNest (Dub)",
    requiresTmdb: false,
    getUrl: (title: string, ep: number, anilistId: number) => {
      return `https://vidnest.fun/anime/${anilistId}/${ep}/dub`;
    }
  },
  {
    name: "VidNest (Hindi)",
    requiresTmdb: false,
    getUrl: (title: string, ep: number, anilistId: number) => {
      return `https://vidnest.fun/anime/${anilistId}/${ep}/hindi`;
    }
  },
  {
    name: "AutoEmbed (Multi-Sub)",
    requiresTmdb: true,
    getUrl: (title: string, ep: number, anilistId: number, tmdbId?: number, tmdbType?: "movie" | "tv") => {
      if (tmdbType === "movie") return `https://autoembed.co/movie/tmdb/${tmdbId}`;
      return `https://autoembed.co/tv/tmdb/${tmdbId}-1-${ep}`;
    }
  },
  {
    name: "VidLink (Multi-Sub)",
    requiresTmdb: true,
    getUrl: (title: string, ep: number, anilistId: number, tmdbId?: number, tmdbType?: "movie" | "tv") => {
      if (tmdbType === "movie") return `https://vidlink.pro/movie/${tmdbId}?primaryColor=06b6d4&secondaryColor=18181b&iconColor=ffffff`;
      return `https://vidlink.pro/tv/${tmdbId}/1/${ep}?primaryColor=06b6d4&secondaryColor=18181b&iconColor=ffffff`;
    }
  },
  {
    name: "VidSrc.rip (Multi-Sub)",
    requiresTmdb: true,
    getUrl: (title: string, ep: number, anilistId: number, tmdbId?: number, tmdbType?: "movie" | "tv") => {
      if (tmdbType === "movie") return `https://vidsrc.rip/embed/movie/${tmdbId}`;
      return `https://vidsrc.rip/embed/tv/${tmdbId}/1/${ep}`;
    }
  },
  {
    name: "Embed.su (Multi-Sub)",
    requiresTmdb: true,
    getUrl: (title: string, ep: number, anilistId: number, tmdbId?: number, tmdbType?: "movie" | "tv") => {
      if (tmdbType === "movie") return `https://embed.su/embed/movie/${tmdbId}`;
      return `https://embed.su/embed/tv/${tmdbId}/1/${ep}`;
    }
  },
];

export default function AnimePlayer({ animeId, animeTitle, episodes, episode, anilistId, poster, tmdbId, tmdbType }: AnimePlayerProps) {
  const availableProviders = EMBED_PROVIDERS.filter((p) => !p.requiresTmdb || (p.requiresTmdb && tmdbId));
  const [providerIndex, setProviderIndex] = useState(0);

  const currentProvider = availableProviders[providerIndex];
  const embedUrl = currentProvider?.getUrl(animeTitle, episode, anilistId ?? 0, tmdbId, tmdbType) || "";

  const handleProviderChange = () => {
    setProviderIndex((prev) => (prev + 1) % availableProviders.length);
  };

  useEffect(() => {
    const STORAGE_KEY = "CineWatch_watch_progress";
    const progress = {
      id: animeId,
      type: "anime" as const,
      title: animeTitle,
      poster: poster || "",
      episode: episode,
      episodeTitle: `Episode ${episode}`,
      progress: 0,
      updatedAt: Date.now(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const filtered = stored.filter(
        (p: typeof progress) => !(p.id === animeId && p.type === "anime")
      );
      const updated = [progress, ...filtered].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, [animeId, animeTitle, episode, poster]);

  return (
    <div className="legacy-theme fixed inset-0 bg-black flex flex-col z-50">
      <div className="flex items-center justify-between h-14 px-6 bg-black/80 backdrop-blur-xl border-b border-glass-border shrink-0">
        <Link
          href={`/anime/${animeId}`}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" stroke={2} />
          Back
        </Link>
        <span className="text-xs text-zinc-500 hidden sm:inline truncate max-w-[240px]">
          {animeTitle} — Ep {episode}
        </span>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <a
              href={`/anime/${animeId}/watch?ep=${Math.max(1, episode - 1)}`}
              className={`p-1.5 rounded-lg glass text-zinc-400 hover:text-white transition-colors ${episode <= 1 ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
            >
              <IconPlayerSkipBack className="w-4 h-4" stroke={2} />
            </a>
            <span className="text-xs text-zinc-500 w-14 text-center font-medium">Ep {episode}</span>
            <a
              href={`/anime/${animeId}/watch?ep=${Math.min(episodes, episode + 1)}`}
              className={`p-1.5 rounded-lg glass text-zinc-400 hover:text-white transition-colors ${episode >= episodes ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
            >
              <IconPlayerSkipForward className="w-4 h-4" stroke={2} />
            </a>
          </div>
          <button
            onClick={handleProviderChange}
            className="px-3 py-1.5 text-xs font-medium rounded-lg glass text-zinc-400 hover:text-white transition-colors"
          >
            {currentProvider.name}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-black relative">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    </div>
  );
}
