"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconPlayerSkipBack, IconPlayerSkipForward, IconPlayerPlay } from "@tabler/icons-react";
import { useWatchTracker } from "@/hooks/use-watch-tracker";
import { ReportButton } from "@/components/media/report-button";

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
    name: "NontonGo (Sub Indo)",
    requiresTmdb: true,
    getUrl: (title: string, ep: number, anilistId: number, tmdbId?: number, tmdbType?: "movie" | "tv") => {
      if (tmdbType === "movie") return `https://www.nontongo.win/embed/movie/${tmdbId}`;
      return `https://www.nontongo.win/embed/tv/${tmdbId}/1/${ep}`;
    }
  },
  {
    name: "Vidsrc.to (Sub Indo)",
    requiresTmdb: true,
    getUrl: (title: string, ep: number, anilistId: number, tmdbId?: number, tmdbType?: "movie" | "tv") => {
      if (tmdbType === "movie") return `https://vidsrc.to/embed/movie/${tmdbId}`;
      return `https://vidsrc.to/embed/tv/${tmdbId}/1/${ep}`;
    }
  },
  {
    name: "SuperEmbed (Multi-Sub)",
    requiresTmdb: true,
    getUrl: (title: string, ep: number, anilistId: number, tmdbId?: number, tmdbType?: "movie" | "tv") => {
      if (tmdbType === "movie") return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
      return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=1&e=${ep}`;
    }
  },
];

export default function AnimePlayer({ animeId, animeTitle, episodes, episode, anilistId, poster, tmdbId, tmdbType }: AnimePlayerProps) {
  const availableProviders = EMBED_PROVIDERS.filter((p) => !p.requiresTmdb || (p.requiresTmdb && tmdbId));
  
  const { progress, saveProgress } = useWatchTracker({
    id: animeId,
    type: "anime",
    title: animeTitle,
    poster: poster || "",
    episode: episode,
    episodeTitle: `Episode ${episode}`,
  });

  const [providerIndex, setProviderIndex] = useState(0);
  const [isResumed, setIsResumed] = useState(false);

  // Initialize provider from history
  useEffect(() => {
    if (progress?.server) {
      const idx = availableProviders.findIndex(p => p.name === progress.server);
      if (idx !== -1) setProviderIndex(idx);
    }
  }, [progress?.server, availableProviders]);

  // Save current provider
  useEffect(() => {
    saveProgress({ server: availableProviders[providerIndex]?.name });
  }, [providerIndex, availableProviders, saveProgress]);

  const currentProvider = availableProviders[providerIndex];
  
  let embedUrl = currentProvider?.getUrl(animeTitle, episode, anilistId ?? 0, tmdbId, tmdbType) || "";

  // Add resume parameter for VidLink
  if (currentProvider?.name.includes("VidLink") && progress?.currentTime && !isResumed) {
    embedUrl += `&start=${Math.floor(progress.currentTime)}`;
  }

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
          <div className="flex items-center gap-1 overflow-x-auto max-w-[30vw] sm:max-w-[40vw] hide-scrollbar pb-0.5">
            {availableProviders.map((p, idx) => (
              <button
                key={p.name}
                onClick={() => setProviderIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  providerIndex === idx 
                    ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" 
                    : "glass text-zinc-400 hover:text-white"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          
          <ReportButton 
            mediaTitle={animeTitle}
            mediaId={animeId.toString()}
            mediaType="anime"
            episode={episode}
            serverName={currentProvider.name}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-black relative">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          key={embedUrl}
          title="CineWatch Anime Player"
        />

        {progress?.currentTime && progress.currentTime > 30 && !isResumed && (
          <div className="absolute bottom-10 left-6 z-[10000] animate-fade-in-up">
            <div className="glass rounded-2xl p-4 flex items-center gap-4 shadow-2xl border border-white/10 backdrop-blur-2xl">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <IconPlayerPlay className="w-5 h-5" fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Resume Watching</p>
                  <p className="text-xs font-bold text-white">Lanjut nonton dari {Math.floor(progress.currentTime / 60)}:{String(Math.floor(progress.currentTime % 60)).padStart(2, '0')}?</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button 
                    onClick={() => setIsResumed(true)}
                    className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest hover:bg-accent-hover transition-colors"
                  >
                    RESUME
                  </button>
                  <button 
                    onClick={() => setIsResumed(true)}
                    className="px-3 py-1.5 rounded-lg glass text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                  >
                    SKIP
                  </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
