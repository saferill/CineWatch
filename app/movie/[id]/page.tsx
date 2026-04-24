import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import TrailerButton from "@/app/components/TrailerButton";
import WatchlistButton from "@/app/components/WatchlistButton";
import MovieGrid from "@/app/components/MovieGrid";
import { getMovie, getMovieCredits, getMovieLogo, getMovieTrailer, getMovieRecommendations, posterUrl, backdropUrl } from "@/app/lib/tmdb";
import { IconPlayerPlay, IconStar, IconClock, IconCalendar, IconUsers, IconShare } from "@tabler/icons-react";
import ShareButton from "@/app/components/ShareButton";

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

  let movie, credits, logo, trailer, recommendations;
  try {
    [movie, credits, logo, trailer, recommendations] = await Promise.all([
      getMovie(movieId),
      getMovieCredits(movieId),
      getMovieLogo(movieId).catch(() => null),
      getMovieTrailer(movieId),
      getMovieRecommendations(movieId),
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
            className={`object-cover ${trailer ? "hidden sm:block opacity-0 transition-opacity duration-1000 delay-[2000ms]" : ""}`}
          />
          {trailer && (
            <div className="absolute inset-[-10%] sm:inset-0 w-full h-[120%] sm:h-full hidden sm:block">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailer.key}&modestbranding=1`}
                className="w-full h-full object-cover scale-150 pointer-events-none"
                allow="autoplay; encrypted-media"
              />
            </div>
          )}
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
                className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:bg-accent-hover transition-colors"
              >
                <IconPlayerPlay className="w-5 h-5" fill="currentColor" stroke={1.5} />
                Watch Now
              </Link>
              {trailer && <TrailerButton videoKey={trailer.key} />}
              <WatchlistButton id={movie.id} type="movie" title={movie.title} poster={posterUrl(movie.poster_path, "w500")} />
              <ShareButton title={movie.title} />
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

        {recommendations && recommendations.length > 0 && (
          <div className="mt-14">
            <MovieGrid movies={recommendations} title="Similar Movies" />
          </div>
        )}
      </main>
    </>
  );
}
