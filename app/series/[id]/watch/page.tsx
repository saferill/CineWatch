import { notFound } from "next/navigation";
import Player from "@/app/components/Player";
import { getTVShow, posterUrl } from "@/app/lib/tmdb";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; ep?: string }>;
}) {
  const { id } = await params;
  const { season, ep } = await searchParams;
  const tvId = Number(id);
  if (isNaN(tvId)) notFound();

  const seasonNum = season ? Number(season) : 1;
  const episodeNum = ep ? Number(ep) : 1;

  let tv;
  let title = "TV Show";
  let seasons: { season_number: number; name: string; episode_count: number }[] = [];
  try {
    tv = await getTVShow(tvId);
    title = tv.name;
    seasons = tv.seasons
      .filter((s) => s.season_number > 0)
      .map((s) => ({
        season_number: s.season_number,
        name: s.name,
        episode_count: s.episode_count,
      }));
  } catch {
    // keep defaults
  }

  const poster = tv?.poster_path ? posterUrl(tv.poster_path, "w342") : "";

  return (
    <Player
      movieId={tvId}
      movieTitle={title}
      type="tv"
      season={seasonNum}
      episode={episodeNum}
      seasons={seasons}
      poster={poster}
    />
  );
}
