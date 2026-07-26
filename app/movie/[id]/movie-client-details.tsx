'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { populateMovieDetailsPage } from '@/services/movies';
import { getMovieTrailer, getMovie, getMovieCredits } from '@/lib/legacy/tmdb';
import { posterUrl } from '@/lib/legacy/tmdb-utils';
import { getMovieAIInsights } from '@/services/ai';
import { MoviesDetailsContent } from '@/components/media/details-content';
import { MovieDetailsHero } from '@/components/media/details-hero';
import Player from '@/components/legacy/Player';
import Navbar from '@/components/legacy/Navbar';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';

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
  const subRoute = Array.isArray(params?.id) && params.id.length > 1 ? params.id[1] : null;
  
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

    if (initialMovieDetails && String(initialMovieDetails.id) === String(rawId)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      populateMovieDetailsPage(rawId).catch(() => null),
      getMovieTrailer(Number(rawId)).catch(() => null),
    ])
      .then(async ([res, trailer]) => {
        if (!res?.movieDetails) {
          // Retry direct TMDB fetch
          const movie = await getMovie(Number(rawId)).catch(() => null);
          const credits = await getMovieCredits(Number(rawId)).catch(() => ({ cast: [], crew: [] }));
          if (movie) {
            setData({
              movieDetails: movie,
              movieCredits: credits,
              similarMovies: [],
              recommendedMovies: [],
              trailerId: trailer?.key || null,
              aiInsights: null,
            });
          }
          return;
        }

        const insights = await getMovieAIInsights(
          res.movieDetails.title,
          res.movieDetails.overview
        ).catch(() => null);

        setData({
          movieDetails: res.movieDetails,
          movieCredits: res.movieCredits,
          similarMovies: res.similarMovies || [],
          recommendedMovies: res.recommendedMovies || [],
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
        <IconLoader2 className="animate-spin size-10 text-accent" />
      </div>
    );
  }

  // Watch Sub-route
  if (subRoute === 'watch') {
    const title = data.movieDetails.title || 'Movie';
    const poster = data.movieDetails.poster_path ? posterUrl(data.movieDetails.poster_path, 'w342') : '';
    return (
      <Player
        movieId={String(rawId)}
        movieTitle={title}
        type="movie"
        poster={poster}
      />
    );
  }

  // Cast Sub-route
  if (subRoute === 'cast') {
    const credits = data.movieCredits || { cast: [] };
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 sm:px-8 py-12">
          <Link
            href={`/movie/${rawId}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
          >
            <IconArrowLeft className="w-4 h-4" stroke={2} />
            Back to {data.movieDetails.title}
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">{data.movieDetails.title}</h1>
          <p className="text-muted-foreground mb-10">Full Cast & Crew</p>

          {credits.cast && credits.cast.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-6">Cast ({credits.cast.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {credits.cast.map((member: any) => (
                  <Link
                    key={member.id}
                    href={`/person/${member.id}`}
                    className="glass-subtle rounded-xl overflow-hidden group"
                  >
                    <div className="relative w-full aspect-[3/4]">
                      <Image
                        src={
                          member.profile_path
                            ? posterUrl(member.profile_path, 'w342')
                            : 'https://placehold.co/342x513/0a0a0a/71717a?text=?'
                        }
                        alt={member.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {member.character}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </>
    );
  }

  // Default Movie Details
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
