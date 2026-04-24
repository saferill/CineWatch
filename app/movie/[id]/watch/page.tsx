import { notFound } from "next/navigation";
import Player from "@/app/components/Player";
import { getMovie, posterUrl } from "@/app/lib/tmdb";

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

  return <Player movieId={movieId} movieTitle={title} type="movie" poster={poster} />;
}
