'use client';

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Player from "@/components/legacy/Player";
import { getTVShow } from "@/lib/legacy/tmdb";
import { posterUrl } from "@/lib/legacy/tmdb-utils";

export default function WatchClientContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const tvId = Number(idStr || '0');

  const seasonStr = searchParams.get('season');
  const epStr = searchParams.get('ep');

  const seasonNum = seasonStr ? Number(seasonStr) : 1;
  const episodeNum = epStr ? Number(epStr) : 1;

  const [tvData, setTvData] = useState<{
    title: string;
    seasons: { season_number: number; name: string; episode_count: number }[];
    poster: string;
  }>({
    title: "TV Show",
    seasons: [],
    poster: "",
  });

  useEffect(() => {
    if (!tvId) return;
    getTVShow(tvId)
      .then((tv) => {
        const seasons = (tv.seasons || [])
          .filter((s: any) => s.season_number > 0)
          .map((s: any) => ({
            season_number: s.season_number,
            name: s.name,
            episode_count: s.episode_count,
          }));
        const poster = tv?.poster_path ? posterUrl(tv.poster_path, "w342") : "";
        setTvData({
          title: tv.name || "TV Show",
          seasons,
          poster,
        });
      })
      .catch(() => {});
  }, [tvId]);

  if (!tvId) return null;

  return (
    <Player
      movieId={tvId.toString()}
      movieTitle={tvData.title}
      type="tv"
      season={seasonNum}
      episode={episodeNum}
      seasons={tvData.seasons}
      poster={tvData.poster}
    />
  );
}
