import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/app/lib/types";
import { backdropUrl, posterUrl } from "@/app/lib/tmdb";
import { IconPlayerPlay, IconStar, IconInfoCircle } from "@tabler/icons-react";
import WatchlistButton from "./WatchlistButton";

export default function Hero({ movie }: { movie: Movie }) {
  return (
    <section className="relative w-full aspect-video max-h-[600px] overflow-hidden rounded-2xl border border-glass-border">
      <Image
        src={backdropUrl(movie.backdrop_path)}
        alt={movie.title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 lg:p-16">
        <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">
          Featured
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl leading-tight">
          {movie.title}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl line-clamp-3 leading-relaxed">
          {movie.overview}
        </p>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <IconStar className="w-4 h-4 text-amber-400" fill="currentColor" stroke={1.5} />
            <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 10</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm text-zinc-400">
            {movie.release_date?.slice(0, 4)}
          </span>
        </div>
        <div className="mt-6 flex gap-4">
          <Link
            href={`/movie/${movie.id}/watch`}
            className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:bg-accent-hover transition-colors"
          >
            <IconPlayerPlay className="w-5 h-5" fill="currentColor" stroke={1.5} />
            Watch Now
          </Link>
          <Link
            href={`/movie/${movie.id}`}
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl glass text-sm font-medium hover:bg-white/[0.08] transition-colors"
          >
            <IconInfoCircle className="w-5 h-5" stroke={1.5} />
            Details
          </Link>
          <WatchlistButton id={movie.id} type="movie" title={movie.title} poster={posterUrl(movie.poster_path, "w500")} />
        </div>
      </div>
    </section>
  );
}
