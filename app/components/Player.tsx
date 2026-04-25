"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconChevronDown,
  IconPlayerPlay,
} from "@tabler/icons-react";

type Source = "vidsrc" | "vidking";

interface SeasonInfo {
  season_number: number;
  name: string;
  episode_count: number;
}

interface PlayerProps {
  movieId: number;
  movieTitle: string;
  type: "movie" | "tv" | "anime";
  season?: number;
  episode?: number;
  seasons?: SeasonInfo[];
  poster?: string;
}

function saveWatch(item: {
  id: number;
  type: string;
  title: string;
  poster: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
}) {
  const STORAGE_KEY = "CineWatch_watch_progress";
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = stored.filter(
      (p: typeof item) => !(p.id === item.id && p.type === item.type && p.season === item.season && p.episode === item.episode)
    );
    const updated = [{ ...item, progress: 0, updatedAt: Date.now() }, ...filtered].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export default function Player({
  movieId,
  movieTitle,
  type,
  season,
  episode,
  seasons = [],
  poster = "",
}: PlayerProps) {
  const [source, setSource] = useState<Source>("vidsrc");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showNextModal, setShowNextModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSeason = season ?? 1;
  const currentEpisode = episode ?? 1;

  const activeSeason = seasons.find((s) => s.season_number === currentSeason);
  const totalEpisodes = activeSeason?.episode_count ?? 0;

  const watchBase = `/series/${movieId}/watch`;

  const episodeLinks = useMemo(() => {
    if (type !== "tv" || !seasons.length) return null;
    const prevEp =
      currentEpisode > 1
        ? `${watchBase}?season=${currentSeason}&ep=${currentEpisode - 1}`
        : currentSeason > (seasons[0]?.season_number ?? 1)
        ? (() => {
            const prevSeasonNum = [...seasons]
              .reverse()
              .find((s) => s.season_number < currentSeason)?.season_number;
            const prevSeason = seasons.find(
              (s) => s.season_number === prevSeasonNum
            );
            return prevSeasonNum
              ? `${watchBase}?season=${prevSeasonNum}&ep=${prevSeason?.episode_count ?? 1}`
              : null;
          })()
        : null;

    const nextEp =
      currentEpisode < totalEpisodes
        ? `${watchBase}?season=${currentSeason}&ep=${currentEpisode + 1}`
        : (() => {
            const nextSeasonNum = seasons.find(
              (s) => s.season_number > currentSeason
            )?.season_number;
            return nextSeasonNum
              ? `${watchBase}?season=${nextSeasonNum}&ep=1`
              : null;
          })();

    return { prev: prevEp, next: nextEp };
  }, [type, season, episode, seasons, currentSeason, currentEpisode, totalEpisodes, watchBase]);

  const episodeTitle = type === "tv" 
    ? `S${currentSeason}E${currentEpisode}` 
    : type === "anime" 
      ? `Episode ${currentEpisode}` 
      : undefined;

  // Save initial watch entry
  useEffect(() => {
    saveWatch({
      id: movieId,
      type,
      title: movieTitle,
      poster: poster,
      season: type === "tv" ? currentSeason : undefined,
      episode: episode ? currentEpisode : undefined,
      episodeTitle,
    });
  }, [type, movieId, movieTitle, poster, currentSeason, currentEpisode, episode, episodeTitle]);

  const cancelCountdown = useCallback(() => {
    setShowNextModal(false);
    setCountdown(30);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startCountdown = useCallback(() => {
    setShowNextModal(true);
    setCountdown(30);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (episodeLinks?.next) {
            window.location.href = episodeLinks.next;
          }
          return 30;
        }
        return c - 1;
      });
    }, 1000);
  }, [episodeLinks]);

  // Auto next for TV/anime after some time
  useEffect(() => {
    if (type === "movie" || !episodeLinks?.next) return;

    const autoTimer = setTimeout(() => {
      if (!showNextModal) {
        startCountdown();
      }
    }, 40 * 60 * 1000); // 40 minutes

    return () => clearTimeout(autoTimer);
  }, [type, episodeLinks, showNextModal, startCountdown]);

  function getEmbedUrl(src: Source): string {
    if (src === "vidking") {
      const color = "ffffff";
      if (type === "movie") {
        return `https://www.vidking.net/embed/movie/${movieId}?autoPlay=true&color=${color}`;
      }
      if (type === "tv" && season && episode) {
        return `https://www.vidking.net/embed/tv/${movieId}/${season}/${episode}?autoPlay=true&color=${color}&episodeSelector=true&nextEpisode=true`;
      }
      return `https://www.vidking.net/embed/tv/${movieId}/1/1?autoPlay=true&color=${color}&episodeSelector=true&nextEpisode=true`;
    }

    if (type === "anime") {
      return `https://vidsrc.me/embed/anime/${movieId}`;
    }
    if (type === "tv" && season && episode) {
      return `https://vidsrc.me/embed/tv/${movieId}/${season}/${episode}`;
    }
    return `https://vidsrc.me/embed/${type}/${movieId}`;
  }

  const embedUrl = getEmbedUrl(source);

  const sources: { id: Source; label: string }[] = [
    { id: "vidsrc", label: "VidSrc" },
    { id: "vidking", label: "VidKing" },
  ];

  return (
    <div className="legacy-theme fixed inset-0 bg-black flex flex-col z-[9999]">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 bg-black/80 backdrop-blur-xl border-b border-glass-border shrink-0">
        <Link
          href={
            type === "anime"
              ? `/anime/${movieId}`
              : type === "tv"
              ? `/series/${movieId}`
              : `/movie/${movieId}`
          }
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" stroke={2} />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <span className="text-xs text-zinc-500 truncate max-w-[180px] sm:max-w-[300px]">
          {movieTitle}
          {type === "tv" && season && episode && (
            <span className="text-zinc-600"> · S{season}E{episode}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {type === "tv" && episodeLinks && (
            <div className="flex items-center gap-1">
              <Link
                href={episodeLinks.prev ?? "#"}
                className={`p-1.5 rounded-lg glass text-zinc-400 hover:text-white transition-colors ${
                  !episodeLinks.prev ? "opacity-30 pointer-events-none" : ""
                }`}
              >
                <IconPlayerSkipBack className="w-4 h-4" stroke={2} />
              </Link>

              <div className="relative">
                <button
                  onClick={() => setPickerOpen(!pickerOpen)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg glass text-xs text-zinc-400 hover:text-white"
                >
                  S{currentSeason}E{currentEpisode}
                  <IconChevronDown className={`w-3 h-3 ${pickerOpen ? "rotate-180" : ""}`} stroke={2} />
                </button>

                {pickerOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 max-h-72 overflow-y-auto glass rounded-lg p-2 z-50">
                    {seasons.map((s) => (
                      <div key={s.season_number} className="mb-2">
                        <p className="text-xs font-semibold text-zinc-500 px-2 mb-1">{s.name}</p>
                        <div className="grid grid-cols-6 gap-1">
                          {Array.from({ length: s.episode_count }, (_, i) => i + 1).map((ep) => (
                            <Link
                              key={ep}
                              href={`${watchBase}?season=${s.season_number}&ep=${ep}`}
                              onClick={() => setPickerOpen(false)}
                              className={`text-center text-xs py-1 rounded ${
                                s.season_number === currentSeason && ep === currentEpisode
                                  ? "bg-accent text-accent-foreground font-semibold"
                                  : "text-zinc-400 hover:bg-white/10"
                              }`}
                            >
                              {ep}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href={episodeLinks.next ?? "#"}
                className={`p-1.5 rounded-lg glass text-zinc-400 hover:text-white transition-colors ${
                  !episodeLinks.next ? "opacity-30 pointer-events-none" : ""
                }`}
              >
                <IconPlayerSkipForward className="w-4 h-4" stroke={2} />
              </Link>
            </div>
          )}

          <div className="flex items-center gap-1">
            {sources.map((s) => (
              <button
                key={s.id}
                onClick={() => setSource(s.id)}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  source === s.id ? "bg-accent text-accent-foreground" : "glass text-zinc-400 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <iframe src={embedUrl} className="flex-1 w-full h-full" key={`${source}-${currentSeason}-${currentEpisode}`} allowFullScreen />

      {showNextModal && episodeLinks?.next && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center border border-glass-border">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Up Next</h3>
            <p className="text-zinc-400 mb-6">
              Starting in <span className="text-white font-bold text-2xl">{countdown}</span> seconds...
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={cancelCountdown} className="px-5 py-2.5 rounded-xl glass font-medium hover:bg-white/[0.08]">
                Cancel
              </button>
              <Link href={episodeLinks.next} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium hover:bg-accent-hover transition-colors">
                <IconPlayerPlay className="w-5 h-5" fill="currentColor" />
                Play Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
