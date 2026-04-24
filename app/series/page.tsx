import Navbar from "@/app/components/Navbar";
import MovieGrid from "@/app/components/MovieGrid";
import LoadMore from "@/app/components/LoadMore";
import { getPopularTV, getTopRatedTV, getTrendingTV } from "@/app/lib/tmdb";
import { fetchPopularTV } from "@/app/actions/movieActions";
import { IconDeviceTv } from "@tabler/icons-react";

export const metadata = {
  title: "Series — CineWatch",
  description: "Browse trending, popular, and top rated TV series.",
};

export default async function SeriesPage() {
  const [trending, popular, topRated] = await Promise.all([
    getTrendingTV(),
    getPopularTV(),
    getTopRatedTV(),
  ]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <IconDeviceTv className="w-6 h-6 text-blue-400" stroke={2} />
          </div>
          <div>
            <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest">Browse</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">TV Series</h1>
          </div>
        </div>

        <div className="space-y-12">
          <MovieGrid movies={trending} title="Trending Now" isTV />
          <MovieGrid movies={popular} title="Most Popular" isTV />
          <MovieGrid movies={topRated} title="Top Rated All Time" isTV />
          
          <div className="pt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 bg-accent rounded-full" />
              <h2 className="text-2xl font-bold">Discover More</h2>
            </div>
            <LoadMore fetchAction={fetchPopularTV} initialPage={1} isTV />
          </div>
        </div>
      </main>
    </>
  );
}
