import { getPopular, getPopularTV, getAnimeMovies, getAnimeTV, getMoviesByGenre, getTVByGenre, searchMovies, searchTVShows } from "@/lib/legacy/tmdb";
import { getPopularAnime, searchAnime } from "@/lib/legacy/anilist";

export async function fetchPopularMovies(page: number) {
  return getPopular(page);
}

export async function fetchPopularTV(page: number) {
  return getPopularTV(page);
}

export async function fetchAnimeMovies(page: number) {
  return getAnimeMovies(page);
}

export async function fetchAnimeTV(page: number) {
  return getAnimeTV(page);
}

export async function fetchPopularAnime(page: number) {
  const data = await getPopularAnime(page, 20);
  return data.media;
}

export async function fetchMoviesByGenre(genreId: number, page: number) {
  return getMoviesByGenre(genreId, page);
}

export async function fetchTVByGenre(genreId: number, page: number) {
  return getTVByGenre(genreId, page);
}

export async function searchAllMedia(query: string) {
  const [movies, tv, anime] = await Promise.all([
    searchMovies(query),
    searchTVShows(query),
    searchAnime(query, 1, 5)
  ]);

  return {
    movies: movies.slice(0, 5),
    tv: tv.slice(0, 5),
    anime: anime.media.slice(0, 5)
  };
}
