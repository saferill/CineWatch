import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAnime } from '@/app/lib/anilist'

import { MovieDetailsHero } from '@/components/media/details-hero'
import { MoviesDetailsContent } from '@/components/media/details-content'
import AnimeEpisodes from '@/app/components/AnimeEpisodes'

export default async function AnimeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { id } = await params;
  const { ep } = await searchParams;
  const animeId = Number(id);
  const currentEpisode = ep ? Number(ep) : 1;
  
  if (isNaN(animeId)) {
    notFound();
  }

  let anime;
  try {
    anime = await getAnime(animeId);
  } catch {
    notFound();
  }

  if (!anime) {
    notFound();
  }

  const title = anime.title.english || anime.title.romaji;
  
  const movieDetails: any = {
    id: anime.id,
    title: title,
    overview: anime.description?.replace(/<[^>]+>/g, ''),
    backdrop_path: anime.bannerImage,
    poster_path: anime.coverImage.large || anime.coverImage.medium,
    vote_average: anime.averageScore ? anime.averageScore / 10 : 0,
    vote_count: anime.popularity,
    release_date: anime.seasonYear ? `${anime.seasonYear}-01-01` : undefined,
    runtime: anime.duration,
    genres: anime.genres.map((g: string, i: number) => ({ id: i, name: g })),
    status: anime.status?.replace(/_/g, ' '),
    tagline: anime.title.native,
  };

  const movieCredits: any = {
    cast: anime.characters.edges.slice(0, 12).map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name.full,
      character: edge.role,
      profile_path: edge.node.image?.large || edge.node.image?.medium,
    })),
    crew: anime.studios.nodes.filter((s: any) => s.isAnimationStudio).map((s: any) => ({
      job: 'Director', // map to director so it shows in ExtraInfo
      name: s.name,
    })),
  };

  const recommendedMovies: any = anime.recommendations.edges.slice(0, 6).map((edge: any) => ({
    id: edge.node.mediaRecommendation.id,
    title: edge.node.mediaRecommendation.title.english || edge.node.mediaRecommendation.title.romaji,
    poster_path: edge.node.mediaRecommendation.coverImage.large,
    vote_average: edge.node.mediaRecommendation.averageScore ? edge.node.mediaRecommendation.averageScore / 10 : 0,
    media_type: 'anime',
  }));

  const similarMovies: any = anime.relations.edges.slice(0, 6).map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title.english || edge.node.title.romaji,
    poster_path: edge.node.coverImage.large,
    vote_average: 0,
    media_type: 'anime',
  }));

  return (
    <div className="relative">
      <MovieDetailsHero movie={movieDetails} trailerId={null} />
      <MoviesDetailsContent
        movie={movieDetails}
        movieCredits={movieCredits}
        similarMovies={similarMovies}
        recommendedMovies={recommendedMovies}
        trailerId={null}
        watchLink={`/anime/${anime.id}/watch`}
        itemType="anime"
      />
      
      {anime.episodes && anime.episodes > 1 && (
        <div className="container max-w-(--breakpoint-2xl) pb-10">
          <AnimeEpisodes
            animeId={animeId}
            animeTitle={title}
            episodes={anime.episodes}
            currentEpisode={currentEpisode}
          />
        </div>
      )}
    </div>
  )
}
