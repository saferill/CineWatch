import { notFound } from "next/navigation";
import Player from "@/components/legacy/Player";
import { getMovie } from "@/lib/legacy/tmdb";
import { posterUrl } from "@/lib/legacy/tmdb-utils";

export async function generateStaticParams() {
  return [{ id: '550' }];
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);
  if (isNaN(movieId)) notFound();

  let movie;
  try {
    movie = await getMovie(movieId);
  } catch {
    // keep defaults
  }

  const title = movie?.title ?? "Movie";
  const poster = movie?.poster_path ? posterUrl(movie.poster_path, "w342") : "";

  return <Player movieId={movieId.toString()} movieTitle={title} type="movie" poster={poster} />;
}
