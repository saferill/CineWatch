import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import TrailerButton from "@/app/components/TrailerButton";
import { getMovie, getMovieCredits, getMovieLogo, getMovieTrailer, posterUrl, backdropUrl } from "@/app/lib/tmdb";
import { IconPlayerPlay, IconStar, IconClock, IconCalendar, IconUsers } from "@tabler/icons-react";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);
  
  if (isNaN(movieId)) {
    notFound();
  }

  let movie, credits, logo, trailer;
  try {
    [movie, credits, logo, trailer] = await Promise.all([
      getMovie(movieId),
      getMovieCredits(movieId),
      getMovieLogo(movieId).catch(() => null),
      getMovieTrailer(movieId),
    ]);
  } catch {
    notFound();
  }

  if (!movie) {
    notFound();
  }

  const topCast = credits.cast.slice(0, 12);
  const runtimeH = Math.floor(movie.runtime / 60);
  const runtimeM = movie.runtime % 60;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 sm:px-8 py-12">
        {/* Backdrop */}
        <div className="relative w-full aspect-video max-h-[480px] overflow-hidden border border-glass-border mb-10">
          <Image
            src={backdropUrl(movie.backdrop_path)}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          {logo && (
            <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 lg:bottom-16 lg:left-16">
              <img
                src={logo}
                alt={movie.title}
                className="w-48 sm:w-64 lg:w-80 h-auto drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-52 md:w-64 aspect-[2/3] rounded-xl overflow-hidden border border-glass-border mx-auto md:mx-0">
              <Image
                src={posterUrl(movie.poster_path, "w500")}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 208px, 256px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-muted-foreground italic mt-2">{movie.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-5 text-sm">
              <span className="flex items-center gap-1.5">
                <IconStar className="w-4 h-4 text-amber-400" fill="currentColor" stroke={1.5} />
                <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                <span className="text-muted-foreground">({movie.vote_count.toLocaleString()} votes)</span>
              </span>
              <span className="text-muted-foreground/50">|</span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <IconCalendar className="w-4 h-4" stroke={1.5} />
                {movie.release_date}
              </span>
              {movie.runtime > 0 && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <IconClock className="w-4 h-4" stroke={1.5} />
                    {runtimeH}h {runtimeM}m
                  </span>
                </>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2.5 mt-5">
              {movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium glass"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">Overview</h2>
              <p className="text-zinc-400 leading-relaxed">{movie.overview}</p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <Link
                href={`/movie/${movie.id}/watch`}
                className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors"
              >
                <IconPlayerPlay className="w-5 h-5" fill="currentColor" stroke={1.5} />
                Watch Now
              </Link>
              {trailer && <TrailerButton videoKey={trailer.key} />}
            </div>
          </div>
        </div>

        {/* Cast */}
        {topCast.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Top Cast</h2>
              <Link
                href={`/movie/${movieId}/cast`}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <IconUsers className="w-4 h-4" stroke={1.5} />
                View All
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
              {topCast.map((member) => (
                <Link
                  key={member.id}
                  href={`/person/${member.id}`}
                  className="text-center group"
                >
                  <div className="relative w-full aspect-square rounded-full overflow-hidden border border-glass-border bg-muted mx-auto">
                    <Image
                      src={
                        member.profile_path
                          ? posterUrl(member.profile_path, "w185")
                          : "https://placehold.co/185x185/0a0a0a/71717a?text=?"
                      }
                      alt={member.name}
                      fill
                      sizes="185px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium truncate group-hover:text-accent transition-colors">{member.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {member.character}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
