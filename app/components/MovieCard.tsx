import Image from "next/image";
import Link from "next/link";
import type { Movie, TVShow, AnilistAnime } from "@/app/lib/types";
import { posterUrl } from "@/app/lib/tmdb";
import { IconStar, IconPlayerPlay } from "@tabler/icons-react";

type MediaItem = Movie | TVShow | AnilistAnime;

function isAnilistItem(item: MediaItem): item is AnilistAnime {
  return "coverImage" in item;
}

export default function MovieCard({
  movie,
  isTV = false,
  isAnime = false,
}: {
  movie: MediaItem;
  isTV?: boolean;
  isAnime?: boolean;
}) {
  const isAL = isAnilistItem(movie);
  const title = isAL
    ? movie.title.english || movie.title.romaji
    : "name" in movie
    ? movie.name
    : movie.title;
  const date = isAL
    ? movie.seasonYear?.toString()
    : "release_date" in movie
    ? movie.release_date
    : "first_air_date" in movie
    ? movie.first_air_date
    : undefined;
  const year = date?.slice(0, 4) ?? "—";
  const rating = isAL
    ? movie.averageScore
      ? (movie.averageScore / 10).toFixed(1)
      : "N/A"
    : movie.vote_average
    ? movie.vote_average.toFixed(1)
    : "N/A";
  const href = isAnime
    ? `/anime/${movie.id}`
    : isTV
    ? `/series/${(movie as TVShow).id}`
    : `/movie/${(movie as Movie).id}`;
  const imageSrc = isAL
    ? movie.coverImage.large ||
      "https://placehold.co/500x750/0a0a0a/71717a?text=No+Image"
    : posterUrl(movie.poster_path);

  return (
    <Link
      href={href}
      className="group block shrink-0 w-[130px] sm:w-[150px] md:w-[160px] lg:w-[175px] snap-start"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-2 border border-white/[0.05] transition-all duration-300 group-hover:border-white/[0.12] group-hover:scale-[1.02] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 130px, (max-width: 768px) 150px, (max-width: 1024px) 160px, 175px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.5)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <IconPlayerPlay
              className="w-4 h-4 text-white ml-0.5"
              fill="currentColor"
              stroke={0}
            />
          </div>
        </div>

        {/* Rating badge */}
        {rating !== "N/A" && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md rounded-lg px-1.5 py-0.5 text-[10px] font-semibold text-white flex items-center gap-0.5 border border-white/[0.08]">
            <IconStar
              className="w-2.5 h-2.5 text-amber-400"
              fill="currentColor"
              stroke={0}
            />
            {rating}
          </div>
        )}

        {/* Year badge */}
        {year !== "—" && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-lg px-1.5 py-0.5 text-[9px] font-medium text-zinc-400 border border-white/[0.05]">
            {year}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2.5 px-0.5">
        <h3 className="font-semibold text-xs sm:text-[13px] truncate text-zinc-200 group-hover:text-white transition-colors leading-tight">
          {title}
        </h3>
      </div>
    </Link>
  );
}
