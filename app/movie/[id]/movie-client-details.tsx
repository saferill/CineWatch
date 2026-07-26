'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { populateMovieDetailsPage } from '@/services/movies';
import { getMovieTrailer } from '@/lib/legacy/tmdb';
import { getMovieAIInsights } from '@/services/ai';
import { MoviesDetailsContent } from '@/components/media/details-content';
import { MovieDetailsHero } from '@/components/media/details-hero';
import { Loader2 } from 'lucide-react';

interface MovieClientDetailsProps {
  initialMovieDetails?: any;
  initialCredits?: any;
  initialSimilar?: any;
  initialRecommended?: any;
  initialTrailerId?: string | null;
  initialAiInsights?: any;
}

export function MovieClientDetails({
  initialMovieDetails,
  initialCredits,
  initialSimilar,
  initialRecommended,
  initialTrailerId,
  initialAiInsights,
}: MovieClientDetailsProps) {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const [data, setData] = useState<any>({
    movieDetails: initialMovieDetails || null,
    movieCredits: initialCredits || null,
    similarMovies: initialSimilar || [],
    recommendedMovies: initialRecommended || [],
    trailerId: initialTrailerId || null,
    aiInsights: initialAiInsights || null,
  });
  const [loading, setLoading] = useState(!initialMovieDetails);

  useEffect(() => {
    if (!rawId) return;

    // If initial props match current URL id, keep them
    if (initialMovieDetails && String(initialMovieDetails.id) === String(rawId)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      populateMovieDetailsPage(rawId),
      getMovieTrailer(Number(rawId)).catch(() => null),
    ])
      .then(async ([res, trailer]) => {
        const insights = await getMovieAIInsights(
          res.movieDetails.title,
          res.movieDetails.overview
        ).catch(() => null);

        setData({
          movieDetails: res.movieDetails,
          movieCredits: res.movieCredits,
          similarMovies: res.similarMovies,
          recommendedMovies: res.recommendedMovies,
          trailerId: trailer?.key || null,
          aiInsights: insights,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rawId, initialMovieDetails]);

  if (loading || !data.movieDetails) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-black">
        <Loader2 className="animate-spin size-10 text-accent" />
      </div>
    );
  }

  return (
    <div className="relative">
      <MovieDetailsHero
        movie={data.movieDetails}
        trailerId={data.trailerId}
        aiInsights={data.aiInsights}
      />
      <MoviesDetailsContent
        movie={data.movieDetails}
        movieCredits={data.movieCredits}
        similarMovies={data.similarMovies}
        recommendedMovies={data.recommendedMovies}
        trailerId={data.trailerId}
      />
    </div>
  );
}
