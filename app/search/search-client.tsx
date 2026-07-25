'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchMovies, searchTVShows } from '@/lib/legacy/tmdb';
import MovieCard from '@/components/legacy/MovieCard';
import { Search, Film, Tv, Info, Loader2 } from 'lucide-react';

export default function SearchClientContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    Promise.all([
      searchMovies(query),
      searchTVShows(query)
    ])
      .then(([movies, series]) => {
        const combined = [
          ...movies.map((m: any) => ({ ...m, media_type: 'movie' })),
          ...series.map((s: any) => ({ ...s, media_type: 'tv' }))
        ].sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0));
        setResults(combined);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="text-4xl font-black text-white mb-6">Mulai Cari Sesuatu...</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-accent/50 transition-colors group text-left">
            <Film className="size-8 text-accent mb-4" />
            <h3 className="font-bold text-lg mb-2">Cari Film</h3>
            <p className="text-zinc-500 text-sm">Temukan film blockbuster terbaru dan klasik favoritmu.</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-accent/50 transition-colors group text-left">
            <Tv className="size-8 text-accent mb-4" />
            <h3 className="font-bold text-lg mb-2">Cari Serial</h3>
            <p className="text-zinc-500 text-sm">Temukan TV Series dan acara favorit dari seluruh dunia.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Loader2 className="animate-spin size-10 text-accent mb-4" />
        <p className="text-zinc-400 text-sm">Mencari "{query}"...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30">
            <Search className="size-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Hasil Pencarian</h1>
            <p className="text-zinc-500 text-sm">Menampilkan {results.length} hasil untuk "{query}"</p>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6">
            <Info className="size-10 text-zinc-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Tidak ada hasil ditemukan</h2>
          <p className="text-zinc-500 max-w-md">
            Kami tidak dapat menemukan apa pun untuk "{query}". Coba periksa ejaan atau gunakan kata kunci lain di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map((item) => (
            <MovieCard 
              key={`${item.media_type}-${item.id}`} 
              movie={item as any} 
              isTV={item.media_type === 'tv'} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
