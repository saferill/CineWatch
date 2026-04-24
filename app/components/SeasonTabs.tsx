"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Episode } from "@/app/lib/types";
import { stillUrl } from "@/app/lib/tmdb";
import {
  IconPlayerPlay,
  IconStar,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

interface SeasonTabsProps {
  seasons: { season_number: number; name: string; episode_count: number }[];
  activeSeason: number;
  episodes: Episode[];
  tvId: number;
}

const EPISODES_PER_PAGE = 6;

export default function SeasonTabs({
  seasons,
  activeSeason,
  episodes,
  tvId,
}: SeasonTabsProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE);
  const paginatedEpisodes = episodes.slice(
    (page - 1) * EPISODES_PER_PAGE,
    page * EPISODES_PER_PAGE
  );

  return (
    <section className="mt-14">
      <h2 className="text-xl font-bold mb-6">Episodes</h2>

      {/* Season Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-8">
        {seasons.map((season) => (
          <Link
            key={season.season_number}
            href={`/series/${tvId}?season=${season.season_number}`}
            scroll={false}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              season.season_number === activeSeason
                ? "bg-accent text-accent-foreground"
                : "glass hover:bg-white/10"
            }`}
          >
            {season.name}
            <span className="ml-2 text-xs opacity-60">
              ({season.episode_count})
            </span>
          </Link>
        ))}
      </div>

      {/* Episode Grid */}
      <div className="grid gap-4">
        {paginatedEpisodes.map((episode) => (
          <div
            key={episode.id}
            className="flex gap-4 glass-subtle rounded-xl overflow-hidden hover:bg-white/[0.04] transition-colors"
          >
            {/* Episode Still */}
            <Link
              href={`/series/${tvId}/watch?season=${episode.season_number}&ep=${episode.episode_number}`}
              className="relative shrink-0 w-40 md:w-56 aspect-video"
            >
              <Image
                src={stillUrl(episode.still_path)}
                alt={episode.name}
                fill
                sizes="(max-width: 768px) 160px, 224px"
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                <IconPlayerPlay
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  stroke={1.5}
                />
              </div>
            </Link>

            {/* Episode Info */}
            <div className="flex-1 min-w-0 py-3 pr-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    S{episode.season_number}E{episode.episode_number}
                    {episode.air_date && ` · ${episode.air_date}`}
                    {episode.runtime && ` · ${episode.runtime}m`}
                  </p>
                  <h3 className="font-semibold text-sm md:text-base truncate">
                    {episode.name}
                  </h3>
                </div>
                {episode.vote_average > 0 && (
                  <span className="shrink-0 flex items-center gap-1 text-xs text-amber-400">
                    <IconStar className="w-3.5 h-3.5" fill="currentColor" stroke={1.5} />
                    {episode.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 hidden md:block">
                {episode.overview || "No description available."}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
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
