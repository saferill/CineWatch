import Image from "next/image";
import Link from "next/link";
import type { Movie, TVShow, AnilistAnime } from "@/lib/legacy/types";
import { posterUrl } from "@/lib/legacy/tmdb-utils";
import { IconStar, IconPlayerPlay } from "@tabler/icons-react";

type MediaItem = Movie | TVShow | AnilistAnime;

function isAnilistItem(item: MediaItem): item is AnilistAnime {
  return "coverImage" in item;
}

export default function MovieCard({
  movie,
  isTV = false,
  isAnime = false,
  className = "",
}: {
  movie: MediaItem;
  isTV?: boolean;
  isAnime?: boolean;
  className?: string;
}) {
  const isAL = isAnilistItem(movie);
  const title = (isAL
    ? movie.title.english || movie.title.romaji
    : (("name" in movie ? movie.name : movie.title) || 
      ("original_title" in (movie as any) ? (movie as any).original_title : "") ||
      ("original_name" in (movie as any) ? (movie as any).original_name : "Unknown Title"))) as string;
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
      className={`group block transition-all duration-300 ${className}`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.05] transition-all duration-500 group-hover:border-accent/30 group-hover:scale-[1.05] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 200px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <IconPlayerPlay
              className="w-5 h-5 text-black ml-0.5"
              fill="currentColor"
              stroke={0}
            />
          </div>
        </div>

        {/* Rating badge */}
        {rating !== "N/A" && (
          <div className="absolute top-2.5 left-2.5 bg-accent text-black font-black rounded-lg px-2 py-0.5 text-[9px] flex items-center gap-1 shadow-lg">
            <IconStar
              className="w-2.5 h-2.5 fill-black"
              stroke={0}
            />
            {rating}
          </div>
        )}

        {/* Year badge */}
        {year !== "—" && (
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md rounded-lg px-2 py-0.5 text-[9px] font-bold text-white border border-white/10">
            {year}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 px-1">
        <h3 className="font-bold text-[11px] sm:text-[13px] uppercase tracking-tight line-clamp-1 text-zinc-400 group-hover:text-white transition-colors leading-tight">
          {title}
        </h3>
      </div>
    </Link>
  );
}
