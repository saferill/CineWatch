import React, { Suspense } from 'react';
import { searchMovies, searchTVShows } from '@/lib/legacy/tmdb';
import MovieCard from '@/components/legacy/MovieCard';
import { Search, Film, Tv, Info } from 'lucide-react';

import { analyzeSearchQuery, trackSearch } from '@/services/ai';

async function SearchResults({ query }: { query: string }) {
  if (!query) return null;

  // Track search in background
  trackSearch(query);

  const [movies, series, aiAnalysis] = await Promise.all([
    searchMovies(query),
    searchTVShows(query),
    analyzeSearchQuery(query)
  ]);

  const allResults = [
    ...movies.map(m => ({ ...m, media_type: 'movie' })),
    ...series.map(s => ({ ...s, media_type: 'tv' }))
  ].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

  return (
    <div className="space-y-12">
      {/* AI Smart Analysis Header */}
      {aiAnalysis && (
        <div className="p-6 rounded-3xl bg-accent/5 border border-accent/10 backdrop-blur-xl relative overflow-hidden group animate-fade-up">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Search className="size-20 text-accent rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest">
                AI SMART ANALYSIS
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 leading-tight">
              {aiAnalysis.message || `Mencari konten yang berkaitan dengan "${query}"...`}
            </h2>
            <div className="flex flex-wrap gap-2">
              {aiAnalysis.suggestedTitles?.map((title: string) => (
                <a 
                  key={title}
                  href={`/search?q=${encodeURIComponent(title)}`}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {title}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30">
            <Search className="size-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Hasil Pencarian</h1>
            <p className="text-zinc-500 text-sm">Menampilkan {allResults.length} hasil untuk "{query}"</p>
          </div>
        </div>
      </div>

      {allResults.length === 0 ? (
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
          {allResults.map((item) => (
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

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || '';

  return (
    <main className="min-h-screen bg-black pt-28 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {!query ? (
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
        ) : (
          <Suspense fallback={
            <div className="flex items-center justify-center py-32">
              <div className="animate-spin size-10 border-4 border-accent border-t-transparent rounded-full" />
            </div>
          }>
            <SearchResults query={query} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
