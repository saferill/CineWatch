import { notFound } from "next/navigation";
import AnimePlayer from "@/app/components/AnimePlayer";
import { getAnime } from "@/app/lib/anilist";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { id } = await params;
  const { ep } = await searchParams;
  const animeId = Number(id);
  if (isNaN(animeId)) notFound();

  let anime;
  try {
    anime = await getAnime(animeId);
  } catch {
    notFound();
  }

  if (!anime || !anime.episodes) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col z-50">
        <div className="flex items-center justify-between h-14 px-6 bg-black/80 backdrop-blur-xl border-b border-glass-border shrink-0">
          <a
            href={`/anime/${animeId}`}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <IconArrowLeft className="w-4 h-4" stroke={2} />
            Back
          </a>
          <span className="text-xs text-zinc-500">{anime?.title.english || anime?.title.romaji}</span>
          <div className="w-16" />
        </div>
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl glass-accent flex items-center justify-center">
              <IconAlertTriangle className="w-8 h-8 text-accent" stroke={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-white">No Episodes Found</h2>
            <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
              This anime is not available for streaming right now.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const episode = ep ? Number(ep) : 1;
  const poster = anime.coverImage.large || anime.coverImage.medium || "";

  return (
    <AnimePlayer
      animeId={animeId}
      animeTitle={anime.title.english || anime.title.romaji}
      episodes={anime.episodes}
      episode={episode}
      anilistId={anime.id}
      poster={poster}
    />
  );
}
