"use client";

import { useState } from "react";
import Link from "next/link";
import { IconPlayerPlay, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface AnimeEpisodesProps {
  animeId: number;
  animeTitle: string;
  episodes: number;
  currentEpisode?: number;
}

const EPISODES_PER_PAGE = 6;

export default function AnimeEpisodes({
  animeId,
  animeTitle,
  episodes,
  currentEpisode = 1,
}: AnimeEpisodesProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(episodes / EPISODES_PER_PAGE);

  const startEp = (page - 1) * EPISODES_PER_PAGE + 1;
  const endEp = Math.min(page * EPISODES_PER_PAGE, episodes);
  const pageEpisodes = Array.from({ length: endEp - startEp + 1 }, (_, i) => startEp + i);

  if (episodes <= 1) return null;

  return (
    <section className="mt-14">
      <h2 className="text-xl font-bold mb-6">Episodes</h2>

      <div className="grid gap-4">
        {pageEpisodes.map((ep) => (
          <Link
            key={ep}
            href={`/anime/${animeId}/watch?ep=${ep}`}
            className={`flex gap-4 glass-subtle rounded-xl overflow-hidden hover:bg-white/[0.04] transition-colors ${
              ep === currentEpisode ? "ring-1 ring-accent" : ""
            }`}
          >
            <div className="shrink-0 w-40 md:w-56 aspect-video bg-zinc-900 flex items-center justify-center relative">
              <span className={`text-2xl font-bold ${ep === currentEpisode ? "text-accent" : "text-zinc-600"}`}>{ep}</span>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                <IconPlayerPlay className="w-8 h-8 text-white" fill="currentColor" stroke={1.5} />
              </div>
            </div>

            <div className="flex-1 min-w-0 py-3 pr-4">
              <p className="text-xs text-muted-foreground mb-1">
                Episode {ep}
                {ep === currentEpisode && <span className="ml-2 text-accent">• Watching</span>}
              </p>
              <h3 className="font-semibold text-sm md:text-base truncate">
                {animeTitle}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg glass hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <IconChevronLeft className="w-4 h-4" stroke={2} />
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg glass hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <IconChevronRight className="w-4 h-4" stroke={2} />
          </button>
        </div>
      )}
    </section>
  );
}
