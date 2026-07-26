'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { populateSeriesDetailsPageData } from '@/services/series';
import { getTVTrailer } from '@/lib/legacy/tmdb';
import { getMovieAIInsights } from '@/services/ai';
import { SeriesDetailsContent } from '@/components/series/details-content';
import { SeriesDetailsHero } from '@/components/series/details-hero';
import { Loader2 } from 'lucide-react';

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
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
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
      populateSeriesDetailsPageData(rawId),
      getTVTrailer(Number(rawId)).catch(() => null),
    ])
      .then(async ([res, trailer]) => {
        const insights = await getMovieAIInsights(
          res.seriesDetails.name,
          res.seriesDetails.overview
        ).catch(() => null);

        setData({
          seriesDetails: res.seriesDetails,
          seriesCredits: res.seriesCredits,
          similarSeries: res.similarSeries,
          recommendedSeries: res.recommendedSeries,
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
        <Loader2 className="animate-spin size-10 text-accent" />
      </div>
    );
  }

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
