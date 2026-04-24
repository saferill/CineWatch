"use client";

import { useState } from "react";
import type { Movie, TVShow, AnilistAnime } from "@/app/lib/types";
import MovieGrid from "./MovieGrid";
import { IconMovie, IconDeviceTv, IconMoodHappy } from "@tabler/icons-react";

const TABS = [
  { id: "movies", label: "Movies", icon: IconMovie },
  { id: "series", label: "Series", icon: IconDeviceTv },
  { id: "anime", label: "Anime", icon: IconMoodHappy },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface HomeTabsSectionProps {
  moviesData: {
    trending: Movie[];
    popular: Movie[];
    topRated: Movie[];
  };
  seriesData: {
    trendingTV: TVShow[];
    popularTV: TVShow[];
    topRatedTV: TVShow[];
  };
  animeData: {
    trending: AnilistAnime[];
    popular: AnilistAnime[];
    topRated: AnilistAnime[];
  };
}

export default function HomeTabsSection({
  moviesData,
  seriesData,
  animeData,
}: HomeTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("movies");

  return (
    <section>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest mb-1">Browse</p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {activeTab === "movies" && "Movies"}
            {activeTab === "series" && "TV Series"}
            {activeTab === "anime" && "Anime"}
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === id
                  ? "bg-accent text-accent-foreground shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-4 h-4" stroke={activeTab === id ? 2.5 : 2} />
              <span className="hidden xs:block">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-10 animate-fade-up" key={activeTab}>
        {activeTab === "movies" && (
          <>
            <MovieGrid
              movies={moviesData.trending}
              title="Trending Now"
              viewAllHref="/movies"
            />
            <MovieGrid
              movies={moviesData.popular}
              title="Most Popular"
              viewAllHref="/movies"
            />
            <MovieGrid
              movies={moviesData.topRated}
              title="Top Rated"
              viewAllHref="/movies"
            />
          </>
        )}
        {activeTab === "series" && (
          <>
            <MovieGrid
              movies={seriesData.trendingTV}
              title="Trending Now"
              isTV
              viewAllHref="/series"
            />
            <MovieGrid
              movies={seriesData.popularTV}
              title="Most Popular"
              isTV
              viewAllHref="/series"
            />
            <MovieGrid
              movies={seriesData.topRatedTV}
              title="Top Rated"
              isTV
              viewAllHref="/series"
            />
          </>
        )}
        {activeTab === "anime" && (
          <>
            <MovieGrid
              movies={animeData.trending}
              title="Trending Now"
              isAnime
              viewAllHref="/anime"
            />
            <MovieGrid
              movies={animeData.popular}
              title="Most Popular"
              isAnime
              viewAllHref="/anime"
            />
            <MovieGrid
              movies={animeData.topRated}
              title="Top Rated"
              isAnime
              viewAllHref="/anime"
            />
          </>
        )}
      </div>
    </section>
  );
}
