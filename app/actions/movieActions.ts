"use server";

import { getPopular, getPopularTV, getAnimeMovies, getAnimeTV, getMoviesByGenre, getTVByGenre } from "@/app/lib/tmdb";
import { getPopularAnime } from "@/app/lib/anilist";

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
