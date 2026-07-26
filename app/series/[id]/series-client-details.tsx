'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { populateSeriesDetailsPageData } from '@/services/series';
import { getTVTrailer, getTVShow, getTVShowCredits } from '@/lib/legacy/tmdb';
import { posterUrl } from '@/lib/legacy/tmdb-utils';
import { getMovieAIInsights } from '@/services/ai';
import { SeriesDetailsContent } from '@/components/series/details-content';
import { SeriesDetailsHero } from '@/components/series/details-hero';
import Player from '@/components/legacy/Player';
import Navbar from '@/components/legacy/Navbar';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';

interface SeriesClientDetailsProps {
  initialSeriesDetails?: any;
  initialCredits?: any;
  initialSimilar?: any;
  initialRecommended?: any;
  initialTrailerId?: string | null;
  initialAiInsights?: any;
}

export function SeriesClientDetails({
  initialSeriesDetails,
  initialCredits,
  initialSimilar,
  initialRecommended,
  initialTrailerId,
  initialAiInsights,
}: SeriesClientDetailsProps) {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const subRoute = Array.isArray(params?.id) && params.id.length > 1 ? params.id[1] : null;

  const seasonStr = searchParams.get('season');
  const epStr = searchParams.get('ep');

  const seasonNum = seasonStr ? Number(seasonStr) : 1;
  const episodeNum = epStr ? Number(epStr) : 1;
  
  const [data, setData] = useState<any>({
    seriesDetails: initialSeriesDetails || null,
    seriesCredits: initialCredits || null,
    similarSeries: initialSimilar || [],
    recommendedSeries: initialRecommended || [],
    trailerId: initialTrailerId || null,
    aiInsights: initialAiInsights || null,
  });
  const [loading, setLoading] = useState(!initialSeriesDetails);

  useEffect(() => {
    if (!rawId) return;

    if (initialSeriesDetails && String(initialSeriesDetails.id) === String(rawId)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      populateSeriesDetailsPageData(rawId).catch(() => null),
      getTVTrailer(Number(rawId)).catch(() => null),
    ])
      .then(async ([res, trailer]) => {
        if (!res?.seriesDetails) {
          const tv = await getTVShow(Number(rawId)).catch(() => null);
          const credits = await getTVShowCredits(Number(rawId)).catch(() => ({ cast: [], crew: [] }));
          if (tv) {
            setData({
              seriesDetails: tv,
              seriesCredits: credits,
              similarSeries: [],
              recommendedSeries: [],
              trailerId: trailer?.key || null,
              aiInsights: null,
            });
          }
          return;
        }

        const insights = await getMovieAIInsights(
          res.seriesDetails.name,
          res.seriesDetails.overview
        ).catch(() => null);

        setData({
          seriesDetails: res.seriesDetails,
          seriesCredits: res.seriesCredits,
          similarSeries: res.similarSeries || [],
          recommendedSeries: res.recommendedSeries || [],
          trailerId: trailer?.key || null,
          aiInsights: insights,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rawId, initialSeriesDetails]);

  if (loading || !data.seriesDetails) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-black">
        <IconLoader2 className="animate-spin size-10 text-accent" />
      </div>
    );
  }

  // Watch Sub-route
  if (subRoute === 'watch') {
    const title = data.seriesDetails.name || 'TV Show';
    const seasons = (data.seriesDetails.seasons || [])
      .filter((s: any) => s.season_number > 0)
      .map((s: any) => ({
        season_number: s.season_number,
        name: s.name,
        episode_count: s.episode_count,
      }));
    const poster = data.seriesDetails.poster_path ? posterUrl(data.seriesDetails.poster_path, 'w342') : '';
    return (
      <Player
        movieId={String(rawId)}
        movieTitle={title}
        type="tv"
        season={seasonNum}
        episode={episodeNum}
        seasons={seasons}
        poster={poster}
      />
    );
  }

  // Cast Sub-route
  if (subRoute === 'cast') {
    const credits = data.seriesCredits || { cast: [] };
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 sm:px-8 py-12">
          <Link
            href={`/series/${rawId}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
          >
            <IconArrowLeft className="w-4 h-4" stroke={2} />
            Back to {data.seriesDetails.name}
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">{data.seriesDetails.name}</h1>
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

  // Default Series Details
  return (
    <div className="relative">
      <SeriesDetailsHero
        series={data.seriesDetails}
        trailerId={data.trailerId}
        aiInsights={data.aiInsights}
      />
      <SeriesDetailsContent
        series={data.seriesDetails}
        seriesCredits={data.seriesCredits}
        similarSeries={data.similarSeries}
        recommendedSeries={data.recommendedSeries}
        trailerId={data.trailerId}
      />
    </div>
  );
}
